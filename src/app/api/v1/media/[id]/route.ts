/**
 * Media Item API Routes
 * GET /api/v1/media/[id] - Get media item
 * PATCH /api/v1/media/[id] - Update media metadata
 * DELETE /api/v1/media/[id] - Delete media item
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { mediaService } from '@/lib/services/media';

const UpdateMediaSchema = z.object({
  title: z.string().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/media/[id] - Get media item
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, ['media:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const media = await mediaService.getMedia(id);

    if (!media) {
      return NextResponse.json(
        { error: 'not_found', message: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/media/[id] - Update media metadata
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, ['media:update']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateMediaSchema.parse(body);

    const media = await mediaService.getMedia(id);
    if (!media) {
      return NextResponse.json(
        { error: 'not_found', message: 'Media not found' },
        { status: 404 }
      );
    }

    const updated = await mediaService.updateMedia(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation_error', message: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to update media' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/media/[id] - Delete media item (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, ['media:delete']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const media = await mediaService.getMedia(id);

    if (!media) {
      return NextResponse.json(
        { error: 'not_found', message: 'Media not found' },
        { status: 404 }
      );
    }

    await mediaService.deleteMedia(id);

    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
