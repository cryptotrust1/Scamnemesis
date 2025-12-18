/**
 * POST /api/v1/images/upload/presigned
 * Generate presigned URL for direct S3/MinIO upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { mediaService } from '@/lib/services/media';

export const dynamic = 'force-dynamic';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const PresignedRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  content_type: z.string().refine(
    (val) => ALLOWED_CONTENT_TYPES.includes(val),
    { message: `Content type must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}` }
  ),
  size: z.number().int().positive().max(MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE} bytes`),
  // Optional metadata
  title: z.string().max(255).optional(),
  alt_text: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request, ['report:create']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    const validatedBody = PresignedRequestSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { filename, content_type, size, title, alt_text } = validatedBody.data;

    // Use the media service to create a real presigned upload URL
    const result = await mediaService.createPresignedUpload({
      userId: auth.userId,
      filename,
      mimeType: content_type,
      fileSize: size,
      title,
      altText: alt_text,
    });

    return NextResponse.json({
      upload_url: result.uploadUrl,
      file_key: result.fileKey,
      media_id: result.mediaId,
      expires_in: result.expiresIn,
      max_size: MAX_FILE_SIZE,
      content_type,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('File type not allowed')) {
        return NextResponse.json(
          { error: 'invalid_type', message: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('File size exceeds')) {
        return NextResponse.json(
          { error: 'file_too_large', message: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
