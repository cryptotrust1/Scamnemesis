/**
 * Admin API Key Management - Single Key
 *
 * GET /api/v1/admin/api-keys/:id - Get API key details
 * PATCH /api/v1/admin/api-keys/:id - Update API key
 * DELETE /api/v1/admin/api-keys/:id - Revoke API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UpdateApiKeySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  organization: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  scopes: z.array(z.string()).optional(),
  rateLimit: z.number().min(100).max(100000).optional(),
  dailyLimit: z.number().min(1000).max(1000000).optional().nullable(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/v1/admin/api-keys/:id
 * Get API key details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const authResult = await requireAuth(request, ['admin:read']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'not_found', message: 'API key not found' },
        { status: 404 }
      );
    }

    // Get usage stats for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usageStats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        entityType: 'ApiKey',
        entityId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    return NextResponse.json({
      id: apiKey.id,
      keyPreview: `sk_live_...${apiKey.id.slice(-8)}`,
      name: apiKey.name,
      description: apiKey.description,
      type: apiKey.type,
      organization: apiKey.organization,
      contactEmail: apiKey.contactEmail,
      website: apiKey.website,
      scopes: apiKey.scopes,
      rateLimit: apiKey.rateLimit,
      dailyLimit: apiKey.dailyLimit,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt?.toISOString(),
      requestCount: apiKey.requestCount,
      expiresAt: apiKey.expiresAt?.toISOString(),
      createdAt: apiKey.createdAt.toISOString(),
      updatedAt: apiKey.updatedAt.toISOString(),
      createdBy: apiKey.user,
      usageStats: {
        last30Days: usageStats,
      },
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to get API key' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/api-keys/:id
 * Update API key
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const authResult = await requireAuth(request, ['admin:*']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const existing = await prisma.apiKey.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'API key not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = UpdateApiKeySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const data = validated.data;

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        organization: data.organization,
        contactEmail: data.contactEmail,
        website: data.website,
        scopes: data.scopes,
        rateLimit: data.rateLimit,
        dailyLimit: data.dailyLimit,
        isActive: data.isActive,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });

    // Log update
    await prisma.auditLog.create({
      data: {
        action: 'API_KEY_UPDATED',
        entityType: 'ApiKey',
        entityId: id,
        userId: authResult.userId,
        oldValue: existing as object,
        newValue: apiKey as object,
      },
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      type: apiKey.type,
      organization: apiKey.organization,
      scopes: apiKey.scopes,
      rateLimit: apiKey.rateLimit,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt?.toISOString(),
      updatedAt: apiKey.updatedAt.toISOString(),
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
 * DELETE /api/v1/admin/api-keys/:id
 * Revoke (soft-delete) API key
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const authResult = await requireAuth(request, ['admin:*']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const existing = await prisma.apiKey.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'API key not found' },
        { status: 404 }
      );
    }

    // Soft delete - deactivate instead of deleting
    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    // Log revocation
    await prisma.auditLog.create({
      data: {
        action: 'API_KEY_REVOKED',
        entityType: 'ApiKey',
        entityId: id,
        userId: authResult.userId,
        changes: {
          name: existing.name,
          organization: existing.organization,
          reason: 'Manual revocation by admin',
        },
      },
    });

    return NextResponse.json({
      message: 'API key revoked successfully',
      id,
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
