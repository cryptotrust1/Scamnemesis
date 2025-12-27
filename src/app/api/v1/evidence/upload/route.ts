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
import { requireRateLimit, optionalAuth } from '@/lib/middleware/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// S3/MinIO Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_BUCKET = process.env.S3_BUCKET || 'scamnemesis';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
// Public URL for accessing files - defaults to internal endpoint if not set
// In production, this should be set to the public-facing MinIO URL or CDN
// Note: Currently unused but kept for future CDN integration
const _S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || S3_ENDPOINT;

// S3 credentials validation at runtime to avoid build-time failures
function getS3Client(): S3Client | null {
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;

  if (!accessKey || !secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Evidence] S3_ACCESS_KEY and S3_SECRET_KEY are required in production.');
    } else {
      console.warn('[Evidence] S3 credentials not set. File uploads will be disabled.');
    }
    return null;
  }

  return new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for MinIO
  });
}

// Lazy initialization of S3 client
let _s3Client: S3Client | null | undefined = undefined;
function getS3ClientInstance(): S3Client | null {
  if (_s3Client === undefined) {
    _s3Client = getS3Client();
  }
  return _s3Client;
}

// Allowed file types for evidence with their magic bytes
const ALLOWED_TYPES: Record<string, { magicBytes: number[][]; extensions: string[] }> = {
  'image/jpeg': {
    magicBytes: [[0xFF, 0xD8, 0xFF]],
    extensions: ['jpg', 'jpeg'],
  },
  'image/png': {
    magicBytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    extensions: ['png'],
  },
  'image/gif': {
    magicBytes: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    extensions: ['gif'],
  },
  'image/webp': {
    magicBytes: [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    extensions: ['webp'],
  },
  'application/pdf': {
    magicBytes: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    extensions: ['pdf'],
  },
  'video/mp4': {
    magicBytes: [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]], // ftyp signature
    extensions: ['mp4'],
  },
  'video/webm': {
    magicBytes: [[0x1A, 0x45, 0xDF, 0xA3]], // EBML header
    extensions: ['webm'],
  },
  'text/plain': {
    magicBytes: [], // Text files don't have magic bytes
    extensions: ['txt'],
  },
  'application/msword': {
    magicBytes: [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]], // OLE header
    extensions: ['doc'],
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    magicBytes: [[0x50, 0x4B, 0x03, 0x04]], // ZIP header (DOCX is a ZIP)
    extensions: ['docx'],
  },
};

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
 * Validate file type by MIME type
 */
function isValidMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_TYPES;
}

/**
 * Validate file content using magic bytes
 * Returns true if the file content matches the claimed MIME type
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const typeInfo = ALLOWED_TYPES[mimeType];
  if (!typeInfo) return false;

  // Text files don't have magic bytes - do basic validation
  if (typeInfo.magicBytes.length === 0) {
    // Check for null bytes which would indicate binary file
    for (let i = 0; i < Math.min(buffer.length, 512); i++) {
      if (buffer[i] === 0) return false;
    }
    return true;
  }

  // Check if buffer starts with any of the valid magic byte sequences
  for (const magic of typeInfo.magicBytes) {
    if (buffer.length >= magic.length) {
      let matches = true;
      for (let i = 0; i < magic.length; i++) {
        if (buffer[i] !== magic[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
  }

  return false;
}

/**
 * Validate file extension matches MIME type
 */
function validateExtension(filename: string, mimeType: string): boolean {
  const typeInfo = ALLOWED_TYPES[mimeType];
  if (!typeInfo) return false;

  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return false;

  return typeInfo.extensions.includes(ext);
}

/**
 * POST /api/v1/evidence/upload - Upload evidence files
 */
export async function POST(request: NextRequest) {
  try {
    // Check if S3 client is available
    const s3Client = getS3ClientInstance();
    if (!s3Client) {
      console.warn('[Evidence] S3 client not available - file uploads disabled');
      return NextResponse.json(
        { error: 'service_unavailable', message: 'File upload service is not configured. You can submit your report without file attachments.' },
        { status: 503 }
      );
    }

    // Rate limiting - 50 uploads per hour (per IP/user)
    let rateLimitError = null;
    try {
      rateLimitError = await requireRateLimit(request, 50);
    } catch (rateLimitErr) {
      console.error('[Evidence] Rate limit check failed:', rateLimitErr);
      // Continue without rate limiting if database is unavailable
    }
    if (rateLimitError) return rateLimitError;

    // Optional authentication - track who uploads
    let uploaderId: string | null = null;
    try {
      const auth = await optionalAuth(request);
      uploaderId = auth.user?.sub || auth.apiKey?.userId || null;
    } catch (authErr) {
      console.error('[Evidence] Auth check failed:', authErr);
      // Continue without authentication tracking
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseErr) {
      console.error('[Evidence] Failed to parse form data:', parseErr);
      return NextResponse.json(
        { error: 'invalid_request', message: 'Failed to parse upload request. Please ensure files are properly formatted.' },
        { status: 400 }
      );
    }
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
      // Validate MIME type
      if (!isValidMimeType(file.type)) {
        errors.push({
          filename: file.name,
          error: `File type not allowed: ${file.type}`,
        });
        continue;
      }

      // Validate file extension matches claimed MIME type
      if (!validateExtension(file.name, file.type)) {
        errors.push({
          filename: file.name,
          error: `File extension does not match content type`,
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

        // Validate magic bytes to prevent file type spoofing
        if (!validateMagicBytes(buffer, file.type)) {
          errors.push({
            filename: file.name,
            error: 'File content does not match claimed type (possible file spoofing detected)',
          });
          continue;
        }

        // Upload to S3
        const command = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
          ContentLength: file.size,
          Metadata: {
            'original-name': encodeURIComponent(file.name),
            'uploaded-at': new Date().toISOString(),
            ...(uploaderId ? { 'uploader-id': uploaderId } : {}),
          },
        });

        await s3Client.send(command);

        // Generate URL - use API proxy endpoint for serving files
        // This avoids exposing MinIO directly and handles authentication
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
        const publicUrl = siteUrl
          ? `${siteUrl}/api/v1/evidence/files/${encodeURIComponent(fileKey)}`
          : `/api/v1/evidence/files/${encodeURIComponent(fileKey)}`;

        // Note: We don't create a Media record here since Evidence records
        // in the Report will reference the fileKey directly

        uploadedFiles.push({
          fileKey,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: publicUrl,
        });
      } catch (uploadError) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
        console.error(`[Evidence] Error uploading file ${file.name}:`, errorMessage);

        // Provide more specific error messages based on error type
        let userMessage = 'Failed to upload file';
        if (errorMessage.includes('NoSuchBucket')) {
          userMessage = 'Storage bucket not configured properly';
        } else if (errorMessage.includes('AccessDenied') || errorMessage.includes('InvalidAccessKeyId')) {
          userMessage = 'Storage authentication failed';
        } else if (errorMessage.includes('NetworkingError') || errorMessage.includes('ECONNREFUSED')) {
          userMessage = 'Storage service unreachable';
        } else if (errorMessage.includes('EntityTooLarge')) {
          userMessage = 'File too large for storage service';
        }

        errors.push({
          filename: file.name,
          error: userMessage,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';

    console.error('[Evidence] Upload error:', {
      message: errorMessage,
      stack: errorStack,
      nodeEnv: process.env.NODE_ENV,
      s3Endpoint: process.env.S3_ENDPOINT || 'default (localhost:9000)',
      hasS3Credentials: !!(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY),
    });

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to process upload. Please try again or submit your report without attachments.',
        debugInfo: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
