# OCR & Document Extraction Pipeline - Scamnemesis

## 1. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OCR & DOCUMENT EXTRACTION PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                         │
│  │  Document      │                                                         │
│  │  Upload        │                                                         │
│  └───────┬────────┘                                                         │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────────────────────────────────────┐                         │
│  │  Pre-processing                                 │                         │
│  │  - Format detection (PDF/Image)                │                         │
│  │  - Page extraction (PDF → images)              │                         │
│  │  - Orientation detection & correction          │                         │
│  │  - Deskewing                                   │                         │
│  │  - Noise reduction                             │                         │
│  └───────────────────┬────────────────────────────┘                         │
│                      │                                                       │
│          ┌───────────┴───────────┐                                          │
│          │                       │                                          │
│          ▼                       ▼                                          │
│  ┌──────────────┐       ┌──────────────┐                                   │
│  │  OCR Engine  │       │  Layout      │                                   │
│  │  (Tesseract/ │       │  Analysis    │                                   │
│  │   EasyOCR)   │       │              │                                   │
│  └──────┬───────┘       └──────┬───────┘                                   │
│         │                      │                                            │
│         └──────────┬───────────┘                                            │
│                    │                                                        │
│                    ▼                                                        │
│  ┌─────────────────────────────────────────────────┐                       │
│  │  Entity Extraction                               │                       │
│  │  - License Plates (SPZ)                         │                       │
│  │  - Phone numbers                                │                       │
│  │  - IBANs / Account numbers                      │                       │
│  │  - Names                                        │                       │
│  │  - Dates                                        │                       │
│  │  - Amounts / Currency                           │                       │
│  └────────────────────┬────────────────────────────┘                       │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────────────┐                       │
│  │  Geo/EXIF Extraction (if image)                 │                       │
│  │  - GPS coordinates                              │                       │
│  │  - Timestamp                                    │                       │
│  │  - Device info (sanitized)                      │                       │
│  └────────────────────┬────────────────────────────┘                       │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────────────┐                       │
│  │  Confidence Scoring & Validation                │                       │
│  └────────────────────┬────────────────────────────┘                       │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────────────┐                       │
│  │  Storage (PostgreSQL + S3)                      │                       │
│  │  - Raw OCR text                                 │                       │
│  │  - Extracted entities                           │                       │
│  │  - Confidence scores                            │                       │
│  └─────────────────────────────────────────────────┘                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. OCR Engine Comparison

| Feature | Tesseract | EasyOCR | Google Vision | Azure AI |
|---------|-----------|---------|---------------|----------|
| Cost | Free | Free | $1.50/1K pages | $1.00/1K pages |
| Languages | 100+ | 80+ | 200+ | 200+ |
| Accuracy | Good | Better | Excellent | Excellent |
| Speed | Fast | Slower | Fast (API) | Fast (API) |
| Handwriting | Poor | Good | Excellent | Excellent |
| Self-hosted | Yes | Yes | No | No |
| GPU support | No | Yes | N/A | N/A |

**Recommendation:**
- **MVP**: Tesseract (free, self-hosted)
- **Scale**: EasyOCR + Google Vision fallback for complex documents

## 3. OCR Worker Implementation

### 3.1 Job Queue Setup

```typescript
// src/workers/ocrWorker.ts

import Bull from 'bull';

const ocrQueue = new Bull('ocr', {
  redis: process.env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
    timeout: 300000,  // 5 min timeout
    removeOnComplete: 100
  }
});

interface OCRJob {
  documentId: string;
  fileKey: string;
  mimeType: string;
  reportId: string;
  priority: 'high' | 'normal' | 'low';
}

ocrQueue.process('extract', 2, async (job: Job<OCRJob>) => {
  const { documentId, fileKey, mimeType, reportId } = job.data;

  const logger = createLogger({ documentId, jobId: job.id });
  logger.info('Starting OCR extraction');

  try {
    // 1. Download document
    const buffer = await downloadFromS3(fileKey);

    // 2. Pre-process
    const pages = await preprocessDocument(buffer, mimeType);

    // 3. OCR each page
    const ocrResults: PageOCRResult[] = [];
    for (let i = 0; i < pages.length; i++) {
      job.progress((i / pages.length) * 50);

      const pageResult = await performOCR(pages[i]);
      ocrResults.push(pageResult);
    }

    // 4. Extract entities
    const entities = await extractEntities(ocrResults);
    job.progress(75);

    // 5. Store results
    await storeOCRResults(documentId, ocrResults, entities);
    job.progress(100);

    logger.info('OCR extraction completed', { pages: pages.length, entities: entities.length });

    return { documentId, pages: pages.length, entities };

  } catch (error) {
    logger.error('OCR extraction failed', { error });
    throw error;
  }
});
```

### 3.2 Document Pre-processing

```typescript
// src/services/ocr/preprocessor.ts

import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

class DocumentPreprocessor {
  async preprocessDocument(buffer: Buffer, mimeType: string): Promise<Buffer[]> {
    if (mimeType === 'application/pdf') {
      return this.extractPDFPages(buffer);
    } else {
      return [await this.preprocessImage(buffer)];
    }
  }

  private async extractPDFPages(pdfBuffer: Buffer): Promise<Buffer[]> {
    const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise;
    const pages: Buffer[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });  // 2x for better OCR

      // Render to canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert to PNG buffer
      const imageBuffer = canvas.toBuffer('image/png');
      const processed = await this.preprocessImage(imageBuffer);
      pages.push(processed);
    }

    return pages;
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // 1. Convert to grayscale
    image = image.grayscale();

    // 2. Auto-rotate based on EXIF
    image = image.rotate();

    // 3. Deskew if needed (detect and correct rotation)
    // Using edge detection to find dominant angle
    const angle = await this.detectSkewAngle(imageBuffer);
    if (Math.abs(angle) > 0.5) {
      image = image.rotate(angle, { background: 'white' });
    }

    // 4. Resize if too large (OCR works best at 300 DPI)
    if (metadata.width! > 3000) {
      image = image.resize(3000, null, { withoutEnlargement: true });
    }

    // 5. Increase contrast
    image = image.normalize();

    // 6. Apply adaptive thresholding for better text detection
    image = image.threshold(128);

    return image.png().toBuffer();
  }

  private async detectSkewAngle(buffer: Buffer): Promise<number> {
    // Use Hough transform to detect lines
    // Return dominant angle
    // Simplified implementation - use OpenCV for production
    return 0;
  }
}
```

### 3.3 OCR Engine Wrapper

```typescript
// src/services/ocr/ocrEngine.ts

import Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  words: WordResult[];
  blocks: BlockResult[];
}

interface WordResult {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

class TesseractOCREngine {
  private worker: Tesseract.Worker | null = null;

  async initialize(languages: string[] = ['eng', 'slk', 'ces', 'deu', 'rus', 'ukr']): Promise<void> {
    this.worker = await Tesseract.createWorker(languages.join('+'), 1, {
      logger: (m) => console.log(m),
      cacheMethod: 'readOnly'
    });

    await this.worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: '1'
    });
  }

  async recognize(imageBuffer: Buffer): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    const result = await this.worker!.recognize(imageBuffer);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words.map(w => ({
        text: w.text,
        confidence: w.confidence,
        bbox: {
          x: w.bbox.x0,
          y: w.bbox.y0,
          width: w.bbox.x1 - w.bbox.x0,
          height: w.bbox.y1 - w.bbox.y0
        }
      })),
      blocks: result.data.blocks.map(b => ({
        text: b.text,
        confidence: b.confidence,
        blockType: b.blocktype
      }))
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// EasyOCR alternative (Python worker)
// src/workers/easyocr_worker.py
```

```python
# src/workers/easyocr_worker.py

import easyocr
import json
import sys
from PIL import Image
import io

class EasyOCREngine:
    def __init__(self, languages=['en', 'sk', 'cs', 'de', 'ru', 'uk']):
        self.reader = easyocr.Reader(
            languages,
            gpu=True,  # Use GPU if available
            model_storage_directory='./models/easyocr'
        )

    def recognize(self, image_bytes: bytes) -> dict:
        image = Image.open(io.BytesIO(image_bytes))

        results = self.reader.readtext(
            image,
            detail=1,
            paragraph=True,
            min_size=10,
            text_threshold=0.7,
            low_text=0.4
        )

        words = []
        full_text = []

        for (bbox, text, confidence) in results:
            words.append({
                'text': text,
                'confidence': float(confidence),
                'bbox': {
                    'x': int(bbox[0][0]),
                    'y': int(bbox[0][1]),
                    'width': int(bbox[2][0] - bbox[0][0]),
                    'height': int(bbox[2][1] - bbox[0][1])
                }
            })
            full_text.append(text)

        return {
            'text': ' '.join(full_text),
            'confidence': sum(w['confidence'] for w in words) / len(words) if words else 0,
            'words': words
        }

if __name__ == '__main__':
    engine = EasyOCREngine()
    image_bytes = sys.stdin.buffer.read()
    result = engine.recognize(image_bytes)
    print(json.dumps(result))
```

## 4. Entity Extraction

### 4.1 Pattern-based Extraction

```typescript
// src/services/ocr/entityExtractor.ts

interface ExtractedEntity {
  type: EntityType;
  value: string;
  normalizedValue: string;
  confidence: number;
  source: 'pattern' | 'ner' | 'manual';
  position?: { page: number; bbox: BoundingBox };
}

type EntityType =
  | 'LICENSE_PLATE'
  | 'VIN'
  | 'PHONE'
  | 'EMAIL'
  | 'IBAN'
  | 'AMOUNT'
  | 'DATE'
  | 'NAME'
  | 'ADDRESS';

class EntityExtractor {
  private patterns: Record<EntityType, RegExp[]> = {
    LICENSE_PLATE: [
      // Slovak plates: XX-NNNXX, BA-123AB
      /\b[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}\b/gi,
      // Czech plates: 1A2 3456
      /\b\d[A-Z]\d[-\s]?\d{4}\b/gi,
      // German plates: XX-XX NNNN
      /\b[A-Z]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}[EH]?\b/gi,
      // Ukrainian plates: AA 1234 BB
      /\b[A-Z]{2}[-\s]?\d{4}[-\s]?[A-Z]{2}\b/gi
    ],
    VIN: [
      // 17-character VIN
      /\b[A-HJ-NPR-Z0-9]{17}\b/gi
    ],
    PHONE: [
      // International format
      /(?:\+|00)[1-9]\d{0,2}[-\s.]?\(?\d{1,4}\)?[-\s.]?\d{1,4}[-\s.]?\d{1,9}/g,
      // Local Slovak/Czech format
      /\b0\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/g
    ],
    EMAIL: [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
    ],
    IBAN: [
      // IBAN format
      /\b[A-Z]{2}\d{2}[-\s]?(?:[A-Z0-9]{4}[-\s]?){2,7}[A-Z0-9]{1,4}\b/gi,
      // SK IBAN specifically
      /\bSK\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/gi
    ],
    AMOUNT: [
      // Currency amounts
      /(?:€|EUR|USD|\$|£|CZK|Kč)\s*[\d\s,.]+/gi,
      /[\d\s,.]+\s*(?:€|EUR|USD|\$|£|CZK|Kč)/gi
    ],
    DATE: [
      // DD.MM.YYYY, DD/MM/YYYY
      /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g,
      // YYYY-MM-DD
      /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g
    ],
    NAME: [], // Use NER instead
    ADDRESS: [] // Use NER instead
  };

  async extract(ocrResults: PageOCRResult[]): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    for (let pageNum = 0; pageNum < ocrResults.length; pageNum++) {
      const text = ocrResults[pageNum].text;

      // Pattern-based extraction
      for (const [entityType, patterns] of Object.entries(this.patterns)) {
        for (const pattern of patterns) {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            const entity: ExtractedEntity = {
              type: entityType as EntityType,
              value: match[0],
              normalizedValue: this.normalize(entityType as EntityType, match[0]),
              confidence: this.calculateConfidence(entityType as EntityType, match[0]),
              source: 'pattern',
              position: { page: pageNum, bbox: this.findBbox(match, ocrResults[pageNum]) }
            };

            // Validate and dedupe
            if (this.isValid(entity) && !this.isDuplicate(entities, entity)) {
              entities.push(entity);
            }
          }
        }
      }
    }

    return entities;
  }

  private normalize(type: EntityType, value: string): string {
    switch (type) {
      case 'PHONE':
        return value.replace(/[-\s.()]/g, '');
      case 'IBAN':
        return value.replace(/[-\s]/g, '').toUpperCase();
      case 'LICENSE_PLATE':
        return value.replace(/[-\s]/g, '').toUpperCase();
      case 'VIN':
        return value.toUpperCase();
      case 'EMAIL':
        return value.toLowerCase().trim();
      case 'AMOUNT':
        return value.replace(/\s/g, '');
      default:
        return value.trim();
    }
  }

  private calculateConfidence(type: EntityType, value: string): number {
    // Base confidence from pattern match
    let confidence = 0.7;

    // Boost for valid checksums
    if (type === 'IBAN' && this.validateIBAN(value)) {
      confidence = 0.95;
    }
    if (type === 'VIN' && this.validateVIN(value)) {
      confidence = 0.95;
    }

    return confidence;
  }

  private validateIBAN(iban: string): boolean {
    const normalized = iban.replace(/[-\s]/g, '').toUpperCase();
    if (normalized.length < 15 || normalized.length > 34) return false;

    // Move first 4 chars to end
    const rearranged = normalized.slice(4) + normalized.slice(0, 4);

    // Convert letters to numbers (A=10, B=11, etc.)
    const numeric = rearranged.split('').map(c => {
      const code = c.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : c;
    }).join('');

    // Mod 97 check
    return BigInt(numeric) % 97n === 1n;
  }

  private validateVIN(vin: string): boolean {
    if (vin.length !== 17) return false;

    const weights = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
    const transliteration: Record<string, number> = {
      A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9
    };

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      const value = /\d/.test(char) ? parseInt(char) : transliteration[char] || 0;
      sum += value * weights[i];
    }

    const checkDigit = sum % 11;
    const expectedCheck = checkDigit === 10 ? 'X' : checkDigit.toString();

    return vin[8] === expectedCheck;
  }
}
```

### 4.2 Geo/EXIF Extraction

```typescript
// src/services/ocr/geoExtractor.ts

import exifr from 'exifr';

interface GeoData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  timestamp?: Date;
  deviceInfo?: {
    make?: string;
    model?: string;
  };
}

class GeoExtractor {
  async extractGeoData(imageBuffer: Buffer): Promise<GeoData | null> {
    try {
      const exif = await exifr.parse(imageBuffer, {
        gps: true,
        pick: ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'DateTimeOriginal', 'Make', 'Model']
      });

      if (!exif) return null;

      return {
        latitude: exif.latitude,
        longitude: exif.longitude,
        altitude: exif.GPSAltitude,
        timestamp: exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal) : undefined,
        deviceInfo: {
          make: exif.Make,
          model: exif.Model
        }
      };
    } catch (error) {
      return null;
    }
  }

  // Reverse geocoding (optional)
  async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'ScamnemesisBot/1.0' } }
      );
      const data = await response.json();
      return data.display_name;
    } catch {
      return null;
    }
  }
}
```

## 5. Database Schema

```sql
-- OCR extraction results
CREATE TABLE ocr_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id),

    -- Processing info
    engine VARCHAR(20) NOT NULL,  -- tesseract, easyocr, google_vision
    engine_version VARCHAR(20),
    processing_time_ms INTEGER,

    -- Raw results
    raw_text TEXT,
    page_count INTEGER DEFAULT 1,
    overall_confidence DECIMAL(4,3),

    -- Structured results per page
    pages JSONB DEFAULT '[]',
    /*
    [
      {
        "page": 1,
        "text": "...",
        "confidence": 0.89,
        "words": [...],
        "language": "sk"
      }
    ]
    */

    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_ocr_document ON ocr_extractions(document_id);
CREATE INDEX idx_ocr_report ON ocr_extractions(report_id);
CREATE INDEX idx_ocr_status ON ocr_extractions(status);

-- Extracted entities from OCR
CREATE TABLE extracted_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocr_extraction_id UUID REFERENCES ocr_extractions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id),

    -- Entity info
    entity_type VARCHAR(30) NOT NULL,
    value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    confidence DECIMAL(4,3),
    source VARCHAR(20) DEFAULT 'pattern',  -- pattern, ner, manual

    -- Position in document
    page_number INTEGER,
    bbox JSONB,  -- {x, y, width, height}

    -- Validation
    is_valid BOOLEAN,
    validation_details JSONB,

    -- Linking to existing data
    matched_perpetrator_id UUID REFERENCES perpetrators(id),
    matched_report_id UUID REFERENCES reports(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entities_type ON extracted_entities(entity_type);
CREATE INDEX idx_entities_normalized ON extracted_entities(normalized_value);
CREATE INDEX idx_entities_ocr ON extracted_entities(ocr_extraction_id);

-- Geo data extracted from images
CREATE TABLE evidence_geo_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    image_id UUID REFERENCES evidence_images(id),

    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude DECIMAL(8, 2),

    timestamp TIMESTAMPTZ,
    location_name TEXT,  -- reverse geocoded

    device_make VARCHAR(100),
    device_model VARCHAR(100),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geo_evidence ON evidence_geo_data(evidence_id);
CREATE INDEX idx_geo_location ON evidence_geo_data USING gist (
    ll_to_earth(latitude, longitude)
);
```

## 6. API Endpoints

### 6.1 Queue Document for OCR

```typescript
// POST /api/v1/ocr/queue
router.post('/ocr/queue',
  authMiddleware,
  async (req, res) => {
    const { documentId, priority = 'normal' } = req.body;

    // Verify document exists and user has access
    const document = await db.query(
      'SELECT * FROM evidence WHERE id = $1',
      [documentId]
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Add to queue
    const job = await ocrQueue.add('extract', {
      documentId,
      fileKey: document.file_key,
      mimeType: document.mime_type,
      reportId: document.report_id,
      priority
    }, {
      priority: priority === 'high' ? 1 : priority === 'low' ? 10 : 5
    });

    res.json({
      jobId: job.id,
      status: 'queued',
      estimatedWait: await estimateWaitTime()
    });
  }
);
```

### 6.2 Get OCR Results

```typescript
// GET /api/v1/ocr/:documentId/results
router.get('/ocr/:documentId/results',
  authMiddleware,
  async (req, res) => {
    const { documentId } = req.params;

    const extraction = await db.query(`
      SELECT
        oe.*,
        array_agg(json_build_object(
          'id', ee.id,
          'type', ee.entity_type,
          'value', ee.value,
          'confidence', ee.confidence
        )) as entities
      FROM ocr_extractions oe
      LEFT JOIN extracted_entities ee ON ee.ocr_extraction_id = oe.id
      WHERE oe.document_id = $1
      GROUP BY oe.id
    `, [documentId]);

    if (!extraction) {
      return res.status(404).json({ error: 'OCR results not found' });
    }

    res.json(extraction);
  }
);
```

## 7. Configuration

### 7.1 Environment Variables

```bash
# OCR Configuration
OCR_ENGINE=tesseract  # tesseract, easyocr, google_vision
OCR_LANGUAGES=eng+slk+ces+deu+rus+ukr
OCR_TIMEOUT_MS=300000
OCR_MAX_PAGES=50
OCR_MIN_CONFIDENCE=0.5

# Tesseract specific
TESSERACT_DATA_PATH=/usr/share/tesseract-ocr/4.00/tessdata

# EasyOCR specific (Python worker)
EASYOCR_GPU=true
EASYOCR_MODEL_PATH=./models/easyocr

# Google Vision API (fallback)
GOOGLE_VISION_API_KEY=xxx
GOOGLE_VISION_ENABLED=false
```

### 7.2 Worker Dockerfile

```dockerfile
# Dockerfile.ocr-worker
FROM node:20-slim

# Install Tesseract and language packs
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-slk \
    tesseract-ocr-ces \
    tesseract-ocr-deu \
    tesseract-ocr-rus \
    tesseract-ocr-ukr \
    tesseract-ocr-pol \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

ENV NODE_ENV=production
CMD ["node", "dist/workers/ocrWorker.js"]
```

## 8. Quality Assurance

### 8.1 Confidence Thresholds

```typescript
const OCR_THRESHOLDS = {
  // Minimum confidence to accept entity
  entity: {
    LICENSE_PLATE: 0.8,
    VIN: 0.85,
    IBAN: 0.7,  // Lower because checksum validates
    PHONE: 0.75,
    EMAIL: 0.8,
    AMOUNT: 0.7,
    DATE: 0.75
  },

  // Minimum page confidence to process
  page: 0.5,

  // Trigger manual review if below
  manualReview: 0.6
};
```

### 8.2 Validation Pipeline

```typescript
async function validateExtractedEntities(
  entities: ExtractedEntity[]
): Promise<ValidatedEntity[]> {
  return entities.map(entity => {
    const validation = validateEntity(entity);

    return {
      ...entity,
      isValid: validation.isValid,
      validationDetails: validation.details,
      requiresReview: entity.confidence < OCR_THRESHOLDS.manualReview
    };
  });
}

function validateEntity(entity: ExtractedEntity): ValidationResult {
  switch (entity.type) {
    case 'IBAN':
      return { isValid: validateIBAN(entity.normalizedValue), details: {} };
    case 'VIN':
      return { isValid: validateVIN(entity.normalizedValue), details: {} };
    case 'PHONE':
      return validatePhoneNumber(entity.normalizedValue);
    case 'EMAIL':
      return { isValid: isValidEmail(entity.normalizedValue), details: {} };
    default:
      return { isValid: true, details: {} };
  }
}
```

## 9. Resource Estimates

### MVP Configuration
- OCR Worker: 2 vCPU, 2GB RAM
- Processing: ~2-5 pages/second (CPU)
- Storage: ~1MB metadata per 100 pages

### Scale Configuration
- OCR Workers: 3x (2 vCPU, 4GB RAM each)
- GPU Worker (EasyOCR): 1x (4 vCPU, 8GB RAM, NVIDIA T4)
- Processing: ~20-50 pages/second
- Queue: Handle 1000 documents/hour burst
