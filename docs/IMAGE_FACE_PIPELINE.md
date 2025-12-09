# Image & Face Pipeline - Scamnemesis

## 1. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       IMAGE & FACE PIPELINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                         │
│  │  File Upload   │                                                         │
│  │  (API/Widget)  │                                                         │
│  └───────┬────────┘                                                         │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐    ┌────────────────┐                                   │
│  │  Validation    │───▶│  Virus Scan    │                                   │
│  │  - Size        │    │  (ClamAV)      │                                   │
│  │  - Type        │    └───────┬────────┘                                   │
│  │  - Dimensions  │            │                                            │
│  └────────────────┘            ▼                                            │
│                       ┌────────────────┐                                    │
│                       │  S3 Upload     │                                    │
│                       │  (Original)    │                                    │
│                       └───────┬────────┘                                    │
│                               │                                             │
│          ┌────────────────────┼────────────────────┐                       │
│          │                    │                    │                       │
│          ▼                    ▼                    ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │  Thumbnail   │    │  pHash       │    │  Face        │                 │
│  │  Generation  │    │  Computation │    │  Detection   │                 │
│  │  - 150x150   │    │  - aHash     │    │  (RetinaFace)│                 │
│  │  - 300x300   │    │  - dHash     │    └──────┬───────┘                 │
│  │  - 800x800   │    │  - pHash     │           │                         │
│  └──────┬───────┘    └──────┬───────┘           │                         │
│         │                   │                    │                         │
│         ▼                   ▼                    ▼                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │  S3 Upload   │    │  DB Store    │    │  Face Crop   │                 │
│  │  (Thumbs)    │    │  (Hashes)    │    │  + Align     │                 │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                 │
│                                                  │                         │
│                                                  ▼                         │
│                                          ┌──────────────┐                 │
│                                          │  Embedding   │ (Future/GPU)    │
│                                          │  Generation  │                 │
│                                          │  (ArcFace)   │                 │
│                                          └──────┬───────┘                 │
│                                                 │                          │
│                                                 ▼                          │
│                                          ┌──────────────┐                 │
│                                          │  Vector DB   │                 │
│                                          │  (pgvector)  │                 │
│                                          └──────────────┘                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. File Upload Configuration

### 2.1 Validation Rules

```typescript
// src/config/upload.config.ts

export const uploadConfig = {
  images: {
    maxSizeBytes: 20 * 1024 * 1024,  // 20MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'],
    maxDimensions: {
      width: 8000,
      height: 8000
    },
    minDimensions: {
      width: 100,
      height: 100
    }
  },
  documents: {
    maxSizeBytes: 20 * 1024 * 1024,  // 20MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif']
  },
  thumbnails: {
    sizes: [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'medium', width: 300, height: 300 },
      { name: 'large', width: 800, height: 800 }
    ],
    format: 'webp',
    quality: 80
  }
};
```

### 2.2 Upload API Endpoint

```typescript
// src/api/routes/upload.ts

import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: uploadConfig.images.maxSizeBytes,
    files: 10  // max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    if (uploadConfig.images.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  }
});

// Direct upload endpoint
router.post('/upload/images',
  authMiddleware,
  rateLimitMiddleware({ max: 20, window: '1m' }),
  upload.array('files', 10),
  async (req, res) => {
    const results = [];

    for (const file of req.files) {
      // 1. Virus scan
      const scanResult = await virusScanner.scan(file.buffer);
      if (scanResult.infected) {
        throw new BadRequestError('File failed virus scan');
      }

      // 2. Validate image dimensions
      const metadata = await sharp(file.buffer).metadata();
      validateDimensions(metadata);

      // 3. Generate unique key
      const fileKey = generateFileKey(file, req.user.id);

      // 4. Upload original to S3
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `originals/${fileKey}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          uploadedBy: req.user.id,
          originalName: file.originalname
        }
      }));

      // 5. Queue processing job
      await imageQueue.add('process', {
        fileKey,
        userId: req.user.id,
        reportId: req.body.reportId
      });

      results.push({
        id: fileKey,
        status: 'processing',
        originalUrl: getPrivateUrl(`originals/${fileKey}`)
      });
    }

    res.json({ files: results });
  }
);

// Presigned URL for large uploads
router.post('/upload/presigned', authMiddleware, async (req, res) => {
  const { filename, contentType, size } = req.body;

  if (size > uploadConfig.images.maxSizeBytes) {
    throw new BadRequestError('File too large');
  }

  const fileKey = generateFileKey({ originalname: filename }, req.user.id);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `originals/${fileKey}`,
    ContentType: contentType
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  res.json({
    uploadUrl: presignedUrl,
    fileKey,
    expiresIn: 3600
  });
});
```

## 3. Image Processing Worker

### 3.1 Worker Implementation

```typescript
// src/workers/imageWorker.ts

import sharp from 'sharp';
import { imagehash } from 'imagehash-js';

imageQueue.process('process', async (job) => {
  const { fileKey, userId, reportId } = job.data;

  // 1. Download original
  const original = await s3.send(new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `originals/${fileKey}`
  }));
  const buffer = await streamToBuffer(original.Body);

  // 2. Generate thumbnails
  const thumbnails = await generateThumbnails(buffer, fileKey);

  // 3. Compute perceptual hashes
  const hashes = await computeHashes(buffer);

  // 4. Extract EXIF/metadata (sanitized)
  const exifData = await extractSafeMetadata(buffer);

  // 5. Detect faces
  const faces = await detectFaces(buffer);

  // 6. Store results in DB
  await db.query(`
    INSERT INTO evidence_images (
      id, report_id, file_key, uploaded_by,
      original_url, thumbnails,
      phash, ahash, dhash,
      exif_data, has_faces, face_count,
      processing_status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'completed', NOW())
  `, [
    fileKey,
    reportId,
    fileKey,
    userId,
    `originals/${fileKey}`,
    JSON.stringify(thumbnails),
    hashes.phash,
    hashes.ahash,
    hashes.dhash,
    JSON.stringify(exifData),
    faces.length > 0,
    faces.length
  ]);

  // 7. Queue face embedding if faces detected (when GPU available)
  if (faces.length > 0 && process.env.ENABLE_FACE_EMBEDDINGS === 'true') {
    await faceQueue.add('embed', {
      fileKey,
      faces,
      reportId
    });
  }

  // 8. Check for duplicate images
  await checkImageDuplicates(fileKey, hashes);

  return { fileKey, thumbnails: thumbnails.length, faces: faces.length };
});
```

### 3.2 Thumbnail Generation

```typescript
// src/services/image/thumbnailGenerator.ts

async function generateThumbnails(
  buffer: Buffer,
  fileKey: string
): Promise<ThumbnailResult[]> {
  const results: ThumbnailResult[] = [];

  for (const size of uploadConfig.thumbnails.sizes) {
    const thumbnail = await sharp(buffer)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'centre'
      })
      .webp({ quality: uploadConfig.thumbnails.quality })
      .toBuffer();

    const thumbKey = `thumbnails/${size.name}/${fileKey}.webp`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: thumbKey,
      Body: thumbnail,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000'  // 1 year cache
    }));

    results.push({
      size: size.name,
      key: thumbKey,
      width: size.width,
      height: size.height
    });
  }

  return results;
}
```

### 3.3 Perceptual Hash Computation

```typescript
// src/services/image/hashComputer.ts

import { imagehash } from 'image-hash';
import sharp from 'sharp';

interface ImageHashes {
  phash: string;   // perceptual hash
  ahash: string;   // average hash
  dhash: string;   // difference hash
}

async function computeHashes(buffer: Buffer): Promise<ImageHashes> {
  // Normalize image for consistent hashing
  const normalized = await sharp(buffer)
    .resize(64, 64, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  return {
    phash: computePHash(normalized),
    ahash: computeAHash(normalized),
    dhash: computeDHash(normalized)
  };
}

function computePHash(pixels: Buffer): string {
  // 1. Resize to 32x32
  // 2. Apply DCT (Discrete Cosine Transform)
  // 3. Reduce to 8x8 low frequencies
  // 4. Compute mean and generate hash

  const size = 32;
  const smallSize = 8;

  // Apply DCT
  const dct = applyDCT(pixels, size);

  // Extract 8x8 low-frequency
  const lowFreq = extractLowFrequency(dct, smallSize);

  // Calculate mean (excluding DC component)
  const mean = lowFreq.slice(1).reduce((a, b) => a + b, 0) / (smallSize * smallSize - 1);

  // Generate hash
  let hash = '';
  for (let i = 0; i < lowFreq.length; i++) {
    hash += lowFreq[i] > mean ? '1' : '0';
  }

  return BigInt('0b' + hash).toString(16).padStart(16, '0');
}

function computeAHash(pixels: Buffer): string {
  // Average hash - simpler, faster
  const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;

  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += pixels[i] > mean ? '1' : '0';
  }

  return BigInt('0b' + hash).toString(16).padStart(16, '0');
}

function computeDHash(pixels: Buffer): string {
  // Difference hash - good for transformations
  const width = 9;  // 9x8 for 8x8 differences
  const height = 8;

  let hash = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = y * width + x;
      hash += pixels[idx] < pixels[idx + 1] ? '1' : '0';
    }
  }

  return BigInt('0b' + hash).toString(16).padStart(16, '0');
}

// Hamming distance for comparison
function hammingDistance(hash1: string, hash2: string): number {
  const bin1 = BigInt('0x' + hash1);
  const bin2 = BigInt('0x' + hash2);
  const xor = bin1 ^ bin2;

  let distance = 0;
  let val = xor;
  while (val > 0n) {
    distance += Number(val & 1n);
    val >>= 1n;
  }

  return distance;
}

// Threshold: Hamming distance <= 10 means same image
const DUPLICATE_THRESHOLD = 10;
```

## 4. Face Detection & Processing

### 4.1 Face Detection (MVP - without GPU)

```typescript
// src/services/face/faceDetector.ts

// Option 1: face-api.js (runs on CPU, good for MVP)
import * as faceapi from '@vladmandic/face-api';

class FaceDetector {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models/face-api');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models/face-api');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models/face-api');

    this.initialized = true;
  }

  async detectFaces(imageBuffer: Buffer): Promise<FaceDetection[]> {
    await this.initialize();

    // Convert buffer to canvas
    const img = await canvas.loadImage(imageBuffer);
    const canvasImg = canvas.createCanvas(img.width, img.height);
    const ctx = canvasImg.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Detect faces with landmarks
    const detections = await faceapi
      .detectAllFaces(canvasImg)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections.map((d, i) => ({
      id: `face_${i}`,
      box: {
        x: d.detection.box.x,
        y: d.detection.box.y,
        width: d.detection.box.width,
        height: d.detection.box.height
      },
      confidence: d.detection.score,
      landmarks: d.landmarks.positions.map(p => ({ x: p.x, y: p.y })),
      descriptor: Array.from(d.descriptor)  // 128-dim embedding
    }));
  }

  async extractFaceCrop(
    imageBuffer: Buffer,
    box: BoundingBox,
    padding: number = 0.2
  ): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Add padding
    const padX = box.width * padding;
    const padY = box.height * padding;

    const cropBox = {
      left: Math.max(0, Math.floor(box.x - padX)),
      top: Math.max(0, Math.floor(box.y - padY)),
      width: Math.min(metadata.width! - box.x, Math.ceil(box.width + padX * 2)),
      height: Math.min(metadata.height! - box.y, Math.ceil(box.height + padY * 2))
    };

    return image
      .extract(cropBox)
      .resize(224, 224, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
```

### 4.2 Face Embedding Generation (GPU Worker - Future)

```python
# src/workers/face_embedding_worker.py

import torch
from insightface.app import FaceAnalysis
import numpy as np
from PIL import Image
import io

class FaceEmbeddingWorker:
    def __init__(self):
        # Use ArcFace model via InsightFace
        self.app = FaceAnalysis(
            name='buffalo_l',
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def generate_embedding(self, image_bytes: bytes) -> dict:
        """Generate 512-dim ArcFace embedding."""
        img = Image.open(io.BytesIO(image_bytes))
        img_array = np.array(img)

        faces = self.app.get(img_array)

        if len(faces) == 0:
            return {'error': 'No face detected'}

        results = []
        for i, face in enumerate(faces):
            results.append({
                'face_id': i,
                'embedding': face.embedding.tolist(),  # 512-dim
                'bbox': face.bbox.tolist(),
                'det_score': float(face.det_score),
                'age': int(face.age) if hasattr(face, 'age') else None,
                'gender': 'M' if face.gender == 1 else 'F' if hasattr(face, 'gender') else None
            })

        return {'faces': results}

    def compare_embeddings(self, emb1: list, emb2: list) -> float:
        """Compute cosine similarity between two embeddings."""
        emb1 = np.array(emb1)
        emb2 = np.array(emb2)

        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        return float(similarity)
```

### 4.3 Face Search API

```typescript
// src/api/routes/faceSearch.ts

router.post('/search/face',
  authMiddleware(['standard', 'gold', 'admin']),
  rateLimitMiddleware({ max: 10, window: '1m' }),
  upload.single('image'),
  async (req, res) => {
    // 1. Detect face in uploaded image
    const faces = await faceDetector.detectFaces(req.file.buffer);

    if (faces.length === 0) {
      return res.status(400).json({ error: 'No face detected in image' });
    }

    if (faces.length > 1) {
      return res.status(400).json({
        error: 'Multiple faces detected, please upload image with single face'
      });
    }

    const queryEmbedding = faces[0].descriptor;

    // 2. Search in vector DB (pgvector)
    const matches = await db.query(`
      SELECT
        ei.id,
        ei.report_id,
        ei.file_key,
        fd.face_index,
        1 - (fd.embedding <=> $1::vector) as similarity
      FROM face_detections fd
      JOIN evidence_images ei ON fd.image_id = ei.id
      JOIN reports r ON ei.report_id = r.id
      WHERE r.status = 'approved'
        AND 1 - (fd.embedding <=> $1::vector) > $2
      ORDER BY fd.embedding <=> $1::vector
      LIMIT $3
    `, [
      `[${queryEmbedding.join(',')}]`,
      req.body.minSimilarity || 0.6,
      req.body.limit || 20
    ]);

    // 3. Apply masking based on user role
    const results = matches.map(m => ({
      reportId: m.report_id,
      similarity: m.similarity,
      thumbnail: getThumbnailUrl(m.file_key, req.user.role)
    }));

    res.json({ matches: results });
  }
);
```

## 5. Database Schema

```sql
-- Evidence images
CREATE TABLE evidence_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    file_key VARCHAR(255) NOT NULL UNIQUE,
    uploaded_by UUID REFERENCES users(id),

    -- Storage
    original_url TEXT NOT NULL,
    thumbnails JSONB DEFAULT '[]',  -- [{size, key, width, height}]

    -- Perceptual hashes
    phash VARCHAR(16),
    ahash VARCHAR(16),
    dhash VARCHAR(16),

    -- Metadata
    exif_data JSONB DEFAULT '{}',
    width INTEGER,
    height INTEGER,
    file_size_bytes INTEGER,
    mime_type VARCHAR(50),

    -- Face detection
    has_faces BOOLEAN DEFAULT false,
    face_count INTEGER DEFAULT 0,

    -- Processing
    processing_status VARCHAR(20) DEFAULT 'pending',
    processing_error TEXT,
    processed_at TIMESTAMPTZ,

    -- Privacy
    is_public BOOLEAN DEFAULT false,
    blur_faces BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_report ON evidence_images(report_id);
CREATE INDEX idx_images_phash ON evidence_images(phash);
CREATE INDEX idx_images_ahash ON evidence_images(ahash);
CREATE INDEX idx_images_dhash ON evidence_images(dhash);
CREATE INDEX idx_images_has_faces ON evidence_images(has_faces) WHERE has_faces = true;

-- Face detections
CREATE TABLE face_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID REFERENCES evidence_images(id) ON DELETE CASCADE,
    face_index INTEGER NOT NULL,

    -- Bounding box
    bbox_x INTEGER NOT NULL,
    bbox_y INTEGER NOT NULL,
    bbox_width INTEGER NOT NULL,
    bbox_height INTEGER NOT NULL,

    -- Detection
    confidence DECIMAL(4,3),
    landmarks JSONB,

    -- Embedding (512-dim for ArcFace, 128-dim for face-api.js)
    embedding vector(512),

    -- Cropped face image
    crop_file_key VARCHAR(255),

    -- Attributes (future)
    estimated_age INTEGER,
    estimated_gender VARCHAR(1),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faces_image ON face_detections(image_id);
CREATE INDEX idx_faces_embedding ON face_detections
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 24, ef_construction = 100);

-- Image duplicates
CREATE TABLE image_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image1_id UUID REFERENCES evidence_images(id),
    image2_id UUID REFERENCES evidence_images(id),
    hash_type VARCHAR(10) NOT NULL,  -- phash, ahash, dhash
    hamming_distance INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, confirmed, different
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_image_pair UNIQUE (image1_id, image2_id)
);

CREATE INDEX idx_duplicates_status ON image_duplicates(status);
```

## 6. Image Duplicate Detection

```typescript
// src/services/image/duplicateDetector.ts

class ImageDuplicateDetector {
  private readonly HASH_THRESHOLD = 10;  // Hamming distance

  async checkDuplicates(
    imageId: string,
    hashes: ImageHashes
  ): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];

    // Check each hash type
    for (const hashType of ['phash', 'ahash', 'dhash'] as const) {
      const hash = hashes[hashType];

      // Find similar images using bit operations
      // PostgreSQL doesn't have native Hamming, so we use this approach
      const similarImages = await this.db.query(`
        SELECT
          id,
          ${hashType} as hash,
          report_id
        FROM evidence_images
        WHERE id != $1
          AND ${hashType} IS NOT NULL
          AND processing_status = 'completed'
      `, [imageId]);

      for (const img of similarImages) {
        const distance = this.hammingDistance(hash, img.hash);

        if (distance <= this.HASH_THRESHOLD) {
          matches.push({
            imageId: img.id,
            reportId: img.report_id,
            hashType,
            distance,
            similarity: 1 - (distance / 64)  // 64-bit hash
          });
        }
      }
    }

    // Store matches
    if (matches.length > 0) {
      await this.storeMatches(imageId, matches);
    }

    return matches;
  }

  private hammingDistance(hash1: string, hash2: string): number {
    let distance = 0;
    const h1 = BigInt('0x' + hash1);
    const h2 = BigInt('0x' + hash2);
    let xor = h1 ^ h2;

    while (xor > 0n) {
      distance += Number(xor & 1n);
      xor >>= 1n;
    }

    return distance;
  }
}
```

## 7. Privacy & Security

### 7.1 EXIF Stripping

```typescript
// src/services/image/exifSanitizer.ts

async function extractSafeMetadata(buffer: Buffer): Promise<SafeMetadata> {
  const metadata = await sharp(buffer).metadata();

  // Only keep safe metadata
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    space: metadata.space,
    hasAlpha: metadata.hasAlpha,
    orientation: metadata.orientation
  };

  // Explicitly NOT returning:
  // - GPS coordinates
  // - Camera make/model
  // - Software used
  // - Creation date/time
  // - Device identifiers
}

async function stripExif(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()  // Apply rotation from EXIF then strip
    .withMetadata({})  // Remove all metadata
    .toBuffer();
}
```

### 7.2 Face Blurring for Public Display

```typescript
// src/services/image/faceBlurrer.ts

async function blurFaces(
  buffer: Buffer,
  faces: FaceDetection[]
): Promise<Buffer> {
  let image = sharp(buffer);

  for (const face of faces) {
    // Extract face region
    const faceRegion = await sharp(buffer)
      .extract({
        left: Math.floor(face.box.x),
        top: Math.floor(face.box.y),
        width: Math.ceil(face.box.width),
        height: Math.ceil(face.box.height)
      })
      .blur(30)  // Strong blur
      .toBuffer();

    // Composite blurred face back
    image = image.composite([{
      input: faceRegion,
      left: Math.floor(face.box.x),
      top: Math.floor(face.box.y)
    }]);
  }

  return image.toBuffer();
}
```

## 8. Configuration

### 8.1 Environment Variables

```bash
# S3/MinIO Storage
S3_ENDPOINT=http://minio:9000
S3_BUCKET=scamnemesis-images
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_REGION=us-east-1

# Image Processing
IMAGE_MAX_SIZE_MB=20
IMAGE_THUMBNAIL_QUALITY=80
IMAGE_PROCESSING_TIMEOUT=60000

# Face Detection
ENABLE_FACE_DETECTION=true
ENABLE_FACE_EMBEDDINGS=false  # Enable when GPU available
FACE_DETECTION_MODEL=face-api  # or 'insightface' for GPU
FACE_MIN_CONFIDENCE=0.7
FACE_EMBEDDING_DIM=512

# ClamAV
CLAMAV_HOST=clamav
CLAMAV_PORT=3310
```

### 8.2 Worker Configuration

```yaml
# docker-compose.workers.yaml
services:
  image-worker:
    build:
      context: .
      dockerfile: Dockerfile.image-worker
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - S3_ENDPOINT=http://minio:9000
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    depends_on:
      - redis
      - minio

  # GPU worker for face embeddings (future)
  face-embedding-worker:
    build:
      context: .
      dockerfile: Dockerfile.face-worker
    environment:
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    profiles:
      - gpu  # Only start when GPU available
```

## 9. API Contracts

### 9.1 Upload Response

```json
{
  "files": [
    {
      "id": "img_abc123",
      "status": "processing",
      "originalUrl": null,
      "thumbnails": null
    }
  ]
}
```

### 9.2 Processing Complete Webhook

```json
{
  "event": "image.processed",
  "data": {
    "id": "img_abc123",
    "reportId": "rpt_xyz789",
    "status": "completed",
    "thumbnails": [
      {"size": "thumb", "url": "https://..."},
      {"size": "medium", "url": "https://..."},
      {"size": "large", "url": "https://..."}
    ],
    "hasFaces": true,
    "faceCount": 1,
    "duplicates": []
  }
}
```

### 9.3 Face Search Response

```json
{
  "matches": [
    {
      "reportId": "rpt_abc123",
      "similarity": 0.89,
      "thumbnail": "https://cdn.../thumb/img_xyz.webp",
      "perpetratorName": "Vlxxxr Gxa"
    }
  ],
  "query": {
    "faceDetected": true,
    "faceCount": 1
  }
}
```

## 10. Resource Estimates

### MVP (CPU-only)
- Image Worker: 2 vCPU, 2GB RAM
- Storage: 100GB (S3/MinIO)
- Processing: ~5 images/second

### Scale (with GPU)
- Image Workers: 3x (2 vCPU, 2GB RAM each)
- Face Embedding Worker: 1x GPU (NVIDIA T4), 4GB RAM
- Storage: 1TB+ (S3)
- Processing: ~50 images/second
- Face search: <100ms latency
