/**
 * User API Key Management
 *
 * POST /api/v1/user/api-keys - Create new API key (self-service)
 * GET /api/v1/user/api-keys - List user's own API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { generateApiKey } from '@/lib/auth/jwt';
import { ApiKeyType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Maximum number of API keys per user
const MAX_API_KEYS_PER_USER = 10;

// User-allowed scopes (read-only for self-service)
const USER_ALLOWED_SCOPES = [
  'reports:read',      // Read approved reports (masked data)
  'search:read',       // Search reports
  'stats:read',        // Read public statistics
] as const;

const CreateApiKeySchema = z.object({
  name: z.string().min(3).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens and underscores'),
  description: z.string().max(500).optional(),
  scopes: z.array(z.enum(USER_ALLOWED_SCOPES)).default(['reports:read', 'search:read', 'stats:read']),
  expiresInDays: z.number().min(1).max(365).optional().default(365),
});

/**
 * POST /api/v1/user/api-keys
 * Create a new API key for the authenticated user
 */
export async function POST(request: NextRequest) {
  // Require authenticated user (not just API key)
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Check if user has reached the maximum number of API keys
    const existingKeysCount = await prisma.apiKey.count({
      where: {
        userId: authResult.userId,
        isActive: true,
      },
    });

    if (existingKeysCount >= MAX_API_KEYS_PER_USER) {
      return NextResponse.json(
        {
          error: 'limit_exceeded',
          message: `You can only have up to ${MAX_API_KEYS_PER_USER} active API keys. Please revoke an existing key first.`,
          current_count: existingKeysCount,
          max_allowed: MAX_API_KEYS_PER_USER,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = CreateApiKeySchema.safeParse(body);

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

    // Generate API key
    const key = generateApiKey();

    // Calculate expiration
    const expiresAt = new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000);

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: authResult.userId,
        key,
        name: data.name,
        description: data.description,
        type: ApiKeyType.PERSONAL,
        scopes: data.scopes,
        rateLimit: 1000, // Default: 1000 requests/hour
        expiresAt,
      },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        action: 'USER_API_KEY_CREATED',
        entityType: 'ApiKey',
        entityId: apiKey.id,
        userId: authResult.userId,
        changes: {
          name: data.name,
          scopes: data.scopes,
          expiresInDays: data.expiresInDays,
        },
      },
    });

    return NextResponse.json(
      {
        id: apiKey.id,
        key, // Only shown once!
        name: apiKey.name,
        description: apiKey.description,
        scopes: apiKey.scopes,
        rate_limit: apiKey.rateLimit,
        expires_at: apiKey.expiresAt?.toISOString(),
        created_at: apiKey.createdAt.toISOString(),
        warning: 'Store this API key securely. It will NOT be shown again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/user/api-keys
 * List user's own API keys
 */
export async function GET(request: NextRequest) {
  // Require authenticated user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const includeRevoked = searchParams.get('include_revoked') === 'true';

    const where: Record<string, unknown> = {
      userId: authResult.userId,
    };

    if (!includeRevoked) {
      where.isActive = true;
    }

    const apiKeys = await prisma.apiKey.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    // Calculate usage stats
    const activeCount = apiKeys.filter(k => k.isActive).length;
    const totalRequests = apiKeys.reduce((sum, k) => sum + k.requestCount, 0);

    return NextResponse.json({
      data: apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        description: key.description,
        type: key.type.toLowerCase(),
        scopes: key.scopes,
        rate_limit: key.rateLimit,
        daily_limit: key.dailyLimit,
        is_active: key.isActive,
        last_used_at: key.lastUsedAt?.toISOString() || null,
        request_count: key.requestCount,
        expires_at: key.expiresAt?.toISOString() || null,
        is_expired: key.expiresAt ? new Date(key.expiresAt) < new Date() : false,
        created_at: key.createdAt.toISOString(),
        updated_at: key.updatedAt.toISOString(),
        // Key preview (masked)
        key_preview: `sk_live_...${key.id.slice(-8)}`,
      })),
      stats: {
        total: apiKeys.length,
        active: activeCount,
        total_requests: totalRequests,
        max_allowed: MAX_API_KEYS_PER_USER,
        remaining: MAX_API_KEYS_PER_USER - activeCount,
      },
    });
  } catch (error) {
    console.error('Error listing user API keys:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}
