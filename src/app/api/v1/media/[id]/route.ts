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
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const UpdateMediaSchema = z.object({
  title: z.string().max(255).optional(),
  altText: z.string().max(500).optional(),
  caption: z.string().max(2000).optional(),
  description: z.string().max(5000).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Check if user has permission to access/modify media
 * Admins can access any media, regular users only their own
 */
async function checkMediaOwnership(
  mediaId: string,
  userId: string,
  userScopes: string[]
): Promise<{ allowed: boolean; media: { uploadedById: string } | null }> {
  // Admins with wildcard scope can access anything
  if (userScopes.includes('*') || userScopes.includes('admin:read')) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId, deletedAt: null },
      select: { uploadedById: true },
    });
    return { allowed: true, media };
  }

  // Regular users can only access their own media
  const media = await prisma.media.findUnique({
    where: { id: mediaId, deletedAt: null },
    select: { uploadedById: true },
  });

  if (!media) {
    return { allowed: false, media: null };
  }

  return {
    allowed: media.uploadedById === userId,
    media,
  };
}

/**
 * GET /api/v1/media/[id] - Get media item
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, ['media:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // SECURITY: Check ownership before returning media
    const { allowed, media: ownerCheck } = await checkMediaOwnership(
      id,
      auth.userId,
      auth.scopes
    );

    if (!ownerCheck) {
      return NextResponse.json(
        { error: 'not_found', message: 'Media not found' },
        { status: 404 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { error: 'forbidden', message: 'You do not have permission to access this media' },
        { status: 403 }
      );
    }

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

    // SECURITY: Check ownership before allowing update
    const { allowed, media: ownerCheck } = await checkMediaOwnership(
      id,
      auth.userId,
      auth.scopes
    );

    if (!ownerCheck) {
      return NextResponse.json(
        { error: 'not_found', message: 'Media not found' },
        { status: 404 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { error: 'forbidden', message: 'You do not have permission to modify this media' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = UpdateMediaSchema.parse(body);

    const updated = await mediaService.updateMedia(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation_error', message: error.errors[0]?.message || 'Validation failed' },
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

    // SECURITY: Check ownership before allowing deletion
    const { allowed, media: ownerCheck } = await checkMediaOwnership(
      id,
      auth.userId,
      auth.scopes
    );

    if (!ownerCheck) {
      return NextResponse.json(
        { error: 'not_found', message: 'Media not found' },
        { status: 404 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { error: 'forbidden', message: 'You do not have permission to delete this media' },
        { status: 403 }
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
