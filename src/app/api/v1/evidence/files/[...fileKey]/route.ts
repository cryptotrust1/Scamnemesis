/**
 * Evidence Files Proxy API
 * GET /api/v1/evidence/files/[...fileKey] - Serve evidence files from S3/MinIO
 *
 * This endpoint proxies file requests to MinIO, avoiding the need to expose
 * MinIO directly to the internet. It also enables caching and access control.
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

// S3/MinIO Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_BUCKET = process.env.S3_BUCKET || 'scamnemesis';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

// Lazy S3 client initialization
let _s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (_s3Client) return _s3Client;

  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;

  if (!accessKey || !secretKey) {
    console.error('[Evidence Files] S3 credentials not configured');
    return null;
  }

  _s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true,
  });

  return _s3Client;
}

// MIME types for content disposition
const INLINE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'text/plain',
]);

/**
 * GET /api/v1/evidence/files/[...fileKey] - Serve file from S3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileKey: string[] } }
) {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      return NextResponse.json(
        { error: 'service_unavailable', message: 'File service not configured' },
        { status: 503 }
      );
    }

    // Reconstruct the file key from path segments
    const fileKey = decodeURIComponent(params.fileKey.join('/'));

    // Validate file key to prevent directory traversal
    if (fileKey.includes('..') || !fileKey.startsWith('evidence/')) {
      return NextResponse.json(
        { error: 'invalid_path', message: 'Invalid file path' },
        { status: 400 }
      );
    }

    try {
      // Get object from S3
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileKey,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        return NextResponse.json(
          { error: 'not_found', message: 'File not found' },
          { status: 404 }
        );
      }

      // Convert stream to buffer
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      // Determine content disposition
      const contentType = response.ContentType || 'application/octet-stream';
      const disposition = INLINE_TYPES.has(contentType) ? 'inline' : 'attachment';

      // Extract original filename from metadata
      const originalName = response.Metadata?.['original-name']
        ? decodeURIComponent(response.Metadata['original-name'])
        : fileKey.split('/').pop() || 'download';

      // Build response headers
      const headers: HeadersInit = {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `${disposition}; filename="${originalName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      };

      // Add ETag for caching
      if (response.ETag) {
        headers['ETag'] = response.ETag;
      }

      return new NextResponse(buffer, {
        status: 200,
        headers,
      });
    } catch (s3Error) {
      const errorMessage = s3Error instanceof Error ? s3Error.message : String(s3Error);

      // Handle specific S3 errors
      if (errorMessage.includes('NoSuchKey') || errorMessage.includes('NotFound')) {
        return NextResponse.json(
          { error: 'not_found', message: 'File not found' },
          { status: 404 }
        );
      }

      if (errorMessage.includes('AccessDenied')) {
        return NextResponse.json(
          { error: 'access_denied', message: 'Access denied to file' },
          { status: 403 }
        );
      }

      console.error('[Evidence Files] S3 error:', errorMessage);
      return NextResponse.json(
        { error: 'storage_error', message: 'Failed to retrieve file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Evidence Files] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/v1/evidence/files/[...fileKey] - Get file metadata
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { fileKey: string[] } }
) {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      return new NextResponse(null, { status: 503 });
    }

    const fileKey = decodeURIComponent(params.fileKey.join('/'));

    if (fileKey.includes('..') || !fileKey.startsWith('evidence/')) {
      return new NextResponse(null, { status: 400 });
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileKey,
      });

      const response = await s3Client.send(command);

      const contentType = response.ContentType || 'application/octet-stream';
      const disposition = INLINE_TYPES.has(contentType) ? 'inline' : 'attachment';
      const originalName = response.Metadata?.['original-name']
        ? decodeURIComponent(response.Metadata['original-name'])
        : fileKey.split('/').pop() || 'download';

      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': response.ContentLength?.toString() || '0',
          'Content-Disposition': `${disposition}; filename="${originalName}"`,
          'Last-Modified': response.LastModified?.toUTCString() || '',
          ...(response.ETag ? { 'ETag': response.ETag } : {}),
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
