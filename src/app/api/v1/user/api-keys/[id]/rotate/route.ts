/**
 * User API Key Rotation
 *
 * POST /api/v1/user/api-keys/:id/rotate - Rotate API key (generate new key, same settings)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { generateApiKey } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/user/api-keys/:id/rotate
 * Rotate an API key - generates a new key while keeping the same settings
 *
 * The old key is immediately invalidated and replaced with a new one.
 * Use this when you suspect a key may have been compromised.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  // Quick check: return 401 immediately if no auth credentials present
  const hasAuth = request.headers.get('authorization') ||
                  request.cookies.get('access_token')?.value ||
                  request.headers.get('x-api-key');
  if (!hasAuth) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    // Find the API key and verify ownership
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: 'not_found', message: 'API key not found' },
        { status: 404 }
      );
    }

    if (!existingKey.isActive) {
      return NextResponse.json(
        { error: 'key_revoked', message: 'Cannot rotate a revoked API key' },
        { status: 400 }
      );
    }

    // Check if key is expired
    if (existingKey.expiresAt && new Date(existingKey.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'key_expired', message: 'Cannot rotate an expired API key. Please create a new one.' },
        { status: 400 }
      );
    }

    // Generate new API key
    const newKey = generateApiKey();

    // Update the API key with the new key value
    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: {
        key: newKey,
        // Reset request count on rotation
        requestCount: 0,
        lastUsedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        rateLimit: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log rotation
    await prisma.auditLog.create({
      data: {
        action: 'USER_API_KEY_ROTATED',
        entityType: 'ApiKey',
        entityId: id,
        userId: authResult.userId,
        changes: {
          name: existingKey.name,
          previous_request_count: existingKey.requestCount,
          rotated_at: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      id: updatedKey.id,
      key: newKey, // Only shown once!
      name: updatedKey.name,
      description: updatedKey.description,
      scopes: updatedKey.scopes,
      rate_limit: updatedKey.rateLimit,
      expires_at: updatedKey.expiresAt?.toISOString() || null,
      created_at: updatedKey.createdAt.toISOString(),
      rotated_at: updatedKey.updatedAt.toISOString(),
      message: 'API key rotated successfully. The old key is now invalid.',
      warning: 'Store this new API key securely. It will NOT be shown again.',
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to rotate API key' },
      { status: 500 }
    );
  }
}
