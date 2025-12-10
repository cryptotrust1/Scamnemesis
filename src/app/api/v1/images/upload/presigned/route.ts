import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { randomUUID } from 'crypto';

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
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { filename, content_type, size } = validatedBody.data;

    // Generate unique file key
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const fileKey = `uploads/${auth.userId}/${randomUUID()}.${ext}`;

    // In production, this would use AWS S3 SDK to generate presigned URL
    // For now, we return a mock presigned URL structure
    const s3Bucket = process.env.S3_BUCKET || 'scamnemesis-uploads';
    const s3Region = process.env.S3_REGION || 'eu-central-1';

    // Note: In production, use AWS SDK:
    // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    // import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
    //
    // const s3Client = new S3Client({ region: s3Region });
    // const command = new PutObjectCommand({
    //   Bucket: s3Bucket,
    //   Key: fileKey,
    //   ContentType: content_type,
    //   ContentLength: size,
    // });
    // const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Mock presigned URL for development
    const uploadUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCK&X-Amz-Date=MOCK&X-Amz-Expires=3600&X-Amz-Signature=MOCK`;

    return NextResponse.json({
      upload_url: uploadUrl,
      file_key: fileKey,
      expires_in: 3600,
      max_size: MAX_FILE_SIZE,
      content_type,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
