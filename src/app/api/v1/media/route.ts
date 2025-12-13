/**
 * Media API Routes
 * GET /api/v1/media - List media
 * POST /api/v1/media - Create presigned upload URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { mediaService } from '@/lib/services/media';
import { MediaType, MediaStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Schema for creating presigned upload
const CreatePresignedSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  title: z.string().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
});

// Schema for listing media
const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.nativeEnum(MediaType).optional(),
  status: z.nativeEnum(MediaStatus).optional(),
  search: z.string().optional(),
});

/**
 * GET /api/v1/media - List media with pagination
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ['media:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const query = ListQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const result = await mediaService.listMedia({
      page: query.page,
      limit: query.limit,
      type: query.type,
      status: query.status,
      search: query.search,
      uploadedById: auth.auth.scopes.some(s => s.startsWith('admin:')) ? undefined : auth.userId,
    });

    return NextResponse.json({
      items: result.items,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total,
        limit: query.limit,
      },
    });
  } catch (error) {
    console.error('Error listing media:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to list media' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/media - Create presigned upload URL
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ['media:create']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = CreatePresignedSchema.parse(body);

    // Validate file type
    if (!mediaService.validateFileType(data.mimeType)) {
      return NextResponse.json(
        { error: 'invalid_file_type', message: `File type not allowed: ${data.mimeType}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (!mediaService.validateFileSize(data.mimeType, data.fileSize)) {
      return NextResponse.json(
        { error: 'file_too_large', message: 'File size exceeds limit' },
        { status: 400 }
      );
    }

    const result = await mediaService.createPresignedUpload({
      userId: auth.userId,
      filename: data.filename,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      title: data.title,
      altText: data.altText,
      caption: data.caption,
      description: data.description,
    });

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
      mediaId: result.mediaId,
      expiresIn: result.expiresIn,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation_error', message: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating presigned URL:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
