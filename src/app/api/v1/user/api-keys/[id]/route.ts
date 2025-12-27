/**
 * User API Key Management - Individual Key Operations
 *
 * GET /api/v1/user/api-keys/:id - Get API key details
 * PATCH /api/v1/user/api-keys/:id - Update API key (name, description, scopes)
 * DELETE /api/v1/user/api-keys/:id - Revoke API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// User-allowed scopes (read-only for self-service)
const USER_ALLOWED_SCOPES = [
  'reports:read',
  'search:read',
  'stats:read',
] as const;

const UpdateApiKeySchema = z.object({
  name: z.string().min(3).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens and underscores').optional(),
  description: z.string().max(500).optional(),
  scopes: z.array(z.enum(USER_ALLOWED_SCOPES)).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/user/api-keys/:id
 * Get details of a specific API key
 */
export async function GET(
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
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: authResult.userId, // Only user's own keys
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        scopes: true,
        rateLimit: true,
        dailyLimit: true,
        isActive: true,
        lastUsedAt: true,
        requestCount: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'not_found', message: 'API key not found' },
        { status: 404 }
      );
    }

    // Get recent usage stats (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAuditLogs = await prisma.auditLog.count({
      where: {
        entityType: 'ApiKey',
        entityId: id,
        action: { in: ['API_KEY_USED', 'API_REQUEST'] },
        createdAt: { gte: sevenDaysAgo },
      },
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      description: apiKey.description,
      type: apiKey.type.toLowerCase(),
      scopes: apiKey.scopes,
      rate_limit: apiKey.rateLimit,
      daily_limit: apiKey.dailyLimit,
      is_active: apiKey.isActive,
      last_used_at: apiKey.lastUsedAt?.toISOString() || null,
      request_count: apiKey.requestCount,
      requests_last_7_days: recentAuditLogs,
      expires_at: apiKey.expiresAt?.toISOString() || null,
      is_expired: apiKey.expiresAt ? new Date(apiKey.expiresAt) < new Date() : false,
      days_until_expiry: apiKey.expiresAt
        ? Math.max(0, Math.ceil((new Date(apiKey.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
        : null,
      created_at: apiKey.createdAt.toISOString(),
      updated_at: apiKey.updatedAt.toISOString(),
      key_preview: `sk_live_...${apiKey.id.slice(-8)}`,
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to get API key details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/user/api-keys/:id
 * Update API key (name, description, scopes)
 */
export async function PATCH(
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
        { error: 'key_revoked', message: 'Cannot update a revoked API key' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = UpdateApiKeySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request data',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scopes !== undefined) updateData.scopes = data.scopes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'no_changes', message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the API key
    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        updatedAt: true,
      },
    });

    // Log update
    await prisma.auditLog.create({
      data: {
        action: 'USER_API_KEY_UPDATED',
        entityType: 'ApiKey',
        entityId: id,
        userId: authResult.userId,
        changes: {
          before: {
            name: existingKey.name,
            description: existingKey.description,
            scopes: existingKey.scopes,
          },
          after: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.scopes !== undefined && { scopes: data.scopes }),
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedKey.id,
      name: updatedKey.name,
      description: updatedKey.description,
      scopes: updatedKey.scopes,
      updated_at: updatedKey.updatedAt.toISOString(),
      message: 'API key updated successfully',
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/user/api-keys/:id
 * Revoke (soft-delete) an API key
 */
export async function DELETE(
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
        { error: 'already_revoked', message: 'API key is already revoked' },
        { status: 400 }
      );
    }

    // Soft-delete: mark as inactive
    await prisma.apiKey.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    // Log revocation
    await prisma.auditLog.create({
      data: {
        action: 'USER_API_KEY_REVOKED',
        entityType: 'ApiKey',
        entityId: id,
        userId: authResult.userId,
        changes: {
          name: existingKey.name,
          reason: 'User revoked key',
        },
      },
    });

    return NextResponse.json({
      id,
      message: 'API key revoked successfully',
      revoked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
