/**
 * Confirm Media Upload
 * POST /api/v1/media/[id]/confirm - Confirm upload completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { mediaService } from '@/lib/services/media';

const ConfirmSchema = z.object({
  hash: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/media/[id]/confirm - Confirm upload completed
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request, ['media:create']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const data = ConfirmSchema.parse(body);

    const media = await mediaService.confirmUpload(id, data.hash);

    return NextResponse.json(media);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Media not found') {
        return NextResponse.json(
          { error: 'not_found', message: 'Media not found' },
          { status: 404 }
        );
      }
      if (error.message === 'Media already processed') {
        return NextResponse.json(
          { error: 'already_processed', message: 'Media already processed' },
          { status: 400 }
        );
      }
    }
    console.error('Error confirming upload:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}
