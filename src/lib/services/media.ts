/**
 * Media Service
 * Handles file uploads, thumbnails, virus scanning, and media management
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/lib/db';
import { MediaType, MediaStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';

// Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin';
const S3_BUCKET = process.env.S3_BUCKET || 'scamnemesis';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

const CLAMAV_HOST = process.env.CLAMAV_HOST || 'localhost';
const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT || '3310');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

// Magic bytes for file type validation
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
};

// Initialize S3 Client
const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export interface UploadOptions {
  userId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  mediaId: string;
  expiresIn: number;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  status: MediaStatus;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string | null;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  title: string | null;
  altText: string | null;
  createdAt: Date;
}

/**
 * Determine media type from MIME type
 */
function getMediaType(mimeType: string): MediaType {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'IMAGE';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'VIDEO';
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'DOCUMENT';
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'AUDIO';
  return 'OTHER';
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(mimeType: string): boolean {
  const allAllowed = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_DOCUMENT_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_AUDIO_TYPES,
  ];
  return allAllowed.includes(mimeType);
}

/**
 * Validate file size based on type
 */
export function validateFileSize(mimeType: string, size: number): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return size <= MAX_IMAGE_SIZE;
  }
  return size <= MAX_FILE_SIZE;
}

/**
 * Validate magic bytes of file buffer
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = MAGIC_BYTES[mimeType];
  if (!expectedBytes) return true; // Skip validation for unknown types

  if (buffer.length < expectedBytes.length) return false;

  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) return false;
  }
  return true;
}

/**
 * Generate file hash (SHA-256)
 */
export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generate unique file key
 */
function generateFileKey(userId: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = crypto.randomUUID();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  return `media/${date}/${userId}/${uuid}.${ext}`;
}

/**
 * Generate thumbnail key from file key
 */
function generateThumbnailKey(fileKey: string): string {
  const parts = fileKey.split('.');
  const ext = parts.pop();
  return `${parts.join('.')}_thumb.${ext}`;
}

/**
 * Create presigned upload URL
 */
export async function createPresignedUpload(options: UploadOptions): Promise<PresignedUploadResult> {
  const { userId, filename, mimeType, fileSize, title, altText, caption, description } = options;

  // Validate file type
  if (!validateFileType(mimeType)) {
    throw new Error(`File type not allowed: ${mimeType}`);
  }

  // Validate file size
  if (!validateFileSize(mimeType, fileSize)) {
    const maxSize = ALLOWED_IMAGE_TYPES.includes(mimeType) ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    throw new Error(`File size exceeds limit: ${maxSize} bytes`);
  }

  // Generate file key
  const fileKey = generateFileKey(userId, filename);
  const thumbnailKey = ALLOWED_IMAGE_TYPES.includes(mimeType) ? generateThumbnailKey(fileKey) : null;

  // Create media record in PROCESSING status
  const media = await prisma.media.create({
    data: {
      type: getMediaType(mimeType),
      status: 'PROCESSING',
      filename: fileKey.split('/').pop()!,
      originalName: filename,
      mimeType,
      fileSize,
      fileKey,
      thumbnailKey,
      title,
      altText,
      caption,
      description,
      uploadedById: userId,
    },
  });

  // Generate presigned URL
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
    ContentType: mimeType,
    ContentLength: fileSize,
    Metadata: {
      'original-name': encodeURIComponent(filename),
      'media-id': media.id,
    },
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    fileKey,
    mediaId: media.id,
    expiresIn: 3600,
  };
}

/**
 * Confirm upload and process media (called after client uploads)
 */
export async function confirmUpload(mediaId: string, fileHash?: string): Promise<MediaItem> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!media) {
    throw new Error('Media not found');
  }

  if (media.status !== 'PROCESSING') {
    throw new Error('Media already processed');
  }

  try {
    // Get public URL
    const url = `${S3_ENDPOINT}/${S3_BUCKET}/${media.fileKey}`;
    const thumbnailUrl = media.thumbnailKey ? `${S3_ENDPOINT}/${S3_BUCKET}/${media.thumbnailKey}` : null;

    // Update media record
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        status: 'READY',
        url,
        thumbnailUrl,
        hash: fileHash,
        scanStatus: 'pending',
      },
    });

    // Queue background jobs for:
    // 1. Virus scanning
    // 2. Thumbnail generation (for images)
    // 3. Image dimension extraction
    // These would be handled by BullMQ workers

    return {
      id: updatedMedia.id,
      type: updatedMedia.type,
      status: updatedMedia.status,
      filename: updatedMedia.filename,
      originalName: updatedMedia.originalName,
      mimeType: updatedMedia.mimeType,
      fileSize: updatedMedia.fileSize,
      url: updatedMedia.url,
      thumbnailUrl: updatedMedia.thumbnailUrl,
      width: updatedMedia.width,
      height: updatedMedia.height,
      title: updatedMedia.title,
      altText: updatedMedia.altText,
      createdAt: updatedMedia.createdAt,
    };
  } catch (error) {
    // Mark as failed
    await prisma.media.update({
      where: { id: mediaId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}

/**
 * Get media by ID
 */
export async function getMedia(mediaId: string): Promise<MediaItem | null> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId, deletedAt: null },
  });

  if (!media) return null;

  return {
    id: media.id,
    type: media.type,
    status: media.status,
    filename: media.filename,
    originalName: media.originalName,
    mimeType: media.mimeType,
    fileSize: media.fileSize,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    width: media.width,
    height: media.height,
    title: media.title,
    altText: media.altText,
    createdAt: media.createdAt,
  };
}

/**
 * List media with pagination and filters
 */
export async function listMedia(options: {
  page?: number;
  limit?: number;
  type?: MediaType;
  status?: MediaStatus;
  uploadedById?: string;
  search?: string;
}): Promise<{ items: MediaItem[]; total: number; page: number; pages: number }> {
  const { page = 1, limit = 20, type, status, uploadedById, search } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
    ...(type && { type }),
    ...(status && { status }),
    ...(uploadedById && { uploadedById }),
    ...(search && {
      OR: [
        { originalName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.media.count({ where }),
  ]);

  return {
    items: items.map((media) => ({
      id: media.id,
      type: media.type,
      status: media.status,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      fileSize: media.fileSize,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      width: media.width,
      height: media.height,
      title: media.title,
      altText: media.altText,
      createdAt: media.createdAt,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Update media metadata
 */
export async function updateMedia(
  mediaId: string,
  data: {
    title?: string;
    altText?: string;
    caption?: string;
    description?: string;
  }
): Promise<MediaItem> {
  const media = await prisma.media.update({
    where: { id: mediaId },
    data: {
      title: data.title,
      altText: data.altText,
      caption: data.caption,
      description: data.description,
    },
  });

  return {
    id: media.id,
    type: media.type,
    status: media.status,
    filename: media.filename,
    originalName: media.originalName,
    mimeType: media.mimeType,
    fileSize: media.fileSize,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    width: media.width,
    height: media.height,
    title: media.title,
    altText: media.altText,
    createdAt: media.createdAt,
  };
}

/**
 * Soft delete media
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  await prisma.media.update({
    where: { id: mediaId },
    data: {
      deletedAt: new Date(),
      status: 'DELETED',
    },
  });
}

/**
 * Hard delete media (removes from S3 too)
 */
export async function permanentlyDeleteMedia(mediaId: string): Promise<void> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!media) {
    throw new Error('Media not found');
  }

  // Delete from S3
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: media.fileKey,
    }));

    if (media.thumbnailKey) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: media.thumbnailKey,
      }));
    }
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }

  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId },
  });
}

/**
 * Generate presigned download URL
 */
export async function getDownloadUrl(mediaId: string): Promise<string> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId, deletedAt: null },
  });

  if (!media) {
    throw new Error('Media not found');
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: media.fileKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(media.originalName)}"`,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Check for duplicate media by hash
 */
export async function findDuplicateByHash(hash: string): Promise<MediaItem | null> {
  const media = await prisma.media.findFirst({
    where: { hash, deletedAt: null },
  });

  if (!media) return null;

  return {
    id: media.id,
    type: media.type,
    status: media.status,
    filename: media.filename,
    originalName: media.originalName,
    mimeType: media.mimeType,
    fileSize: media.fileSize,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    width: media.width,
    height: media.height,
    title: media.title,
    altText: media.altText,
    createdAt: media.createdAt,
  };
}

export const mediaService = {
  createPresignedUpload,
  confirmUpload,
  getMedia,
  listMedia,
  updateMedia,
  deleteMedia,
  permanentlyDeleteMedia,
  getDownloadUrl,
  findDuplicateByHash,
  validateFileType,
  validateFileSize,
  validateMagicBytes,
  generateFileHash,
};
