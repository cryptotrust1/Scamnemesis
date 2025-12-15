/**
 * Evidence Upload API
 * POST /api/v1/evidence/upload - Upload evidence files directly
 *
 * This endpoint handles direct file uploads for report evidence.
 * Files are uploaded to S3 and the file_key is returned for use in reports.
 * The Evidence record in the Report will reference the fileKey.
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireRateLimit } from '@/lib/middleware/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// S3 Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin';
const S3_BUCKET = process.env.S3_BUCKET || 'scamnemesis';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

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

// Allowed file types for evidence
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 10;

interface UploadedFile {
  fileKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

/**
 * Generate unique file key for S3
 */
function generateFileKey(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = crypto.randomUUID();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  return `evidence/${date}/${uuid}.${ext}`;
}

/**
 * Validate file type
 */
function isValidFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

/**
 * POST /api/v1/evidence/upload - Upload evidence files
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 20 uploads per minute
    const rateLimitError = await requireRateLimit(request, 20);
    if (rateLimitError) return rateLimitError;

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'no_files', message: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: 'too_many_files', message: `Maximum ${MAX_FILES_PER_REQUEST} files per request` },
        { status: 400 }
      );
    }

    const uploadedFiles: UploadedFile[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const file of files) {
      // Validate file type
      if (!isValidFileType(file.type)) {
        errors.push({
          filename: file.name,
          error: `File type not allowed: ${file.type}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          filename: file.name,
          error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
        });
        continue;
      }

      try {
        // Generate file key
        const fileKey = generateFileKey(file.name);

        // Get file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to S3
        const command = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
          ContentLength: file.size,
          Metadata: {
            'original-name': encodeURIComponent(file.name),
          },
        });

        await s3Client.send(command);

        // Generate URL
        const url = `${S3_ENDPOINT}/${S3_BUCKET}/${fileKey}`;

        // Note: We don't create a Media record here since Evidence records
        // in the Report will reference the fileKey directly

        uploadedFiles.push({
          fileKey,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url,
        });
      } catch (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError);
        errors.push({
          filename: file.name,
          error: 'Failed to upload file',
        });
      }
    }

    // Return results
    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: 'upload_failed',
          message: 'All file uploads failed',
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Evidence upload error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to process upload',
      },
      { status: 500 }
    );
  }
}
