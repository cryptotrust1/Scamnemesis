/**
 * Admin API Key Management
 *
 * POST /api/v1/admin/api-keys - Create new API key (for partners)
 * GET /api/v1/admin/api-keys - List all API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { generateApiKey } from '@/lib/auth/jwt';
import { ApiKeyType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Valid scopes for partner API keys
const PARTNER_SCOPES = [
  'reports:read',      // Read approved reports (masked data)
  'search:read',       // Search reports
  'stats:read',        // Read public statistics
] as const;

const CreateApiKeySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['PERSONAL', 'PARTNER', 'INTEGRATION']).default('PARTNER'),
  organization: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  scopes: z.array(z.string()).default(['reports:read', 'search:read', 'stats:read']),
  rateLimit: z.number().min(100).max(100000).default(1000),
  dailyLimit: z.number().min(1000).max(1000000).optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
});

/**
 * POST /api/v1/admin/api-keys
 * Create a new API key for partners
 */
export async function POST(request: NextRequest) {
  // Require admin scope
  const authResult = await requireAuth(request, ['admin:*']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validated = CreateApiKeySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const data = validated.data;

    // For PARTNER type, only allow read-only scopes
    if (data.type === 'PARTNER') {
      const invalidScopes = data.scopes.filter(
        scope => !PARTNER_SCOPES.includes(scope as typeof PARTNER_SCOPES[number])
      );
      if (invalidScopes.length > 0) {
        return NextResponse.json(
          {
            error: 'invalid_scopes',
            message: `Partner API keys can only have read-only scopes: ${PARTNER_SCOPES.join(', ')}`,
            invalid_scopes: invalidScopes,
          },
          { status: 400 }
        );
      }
    }

    // Generate API key
    const key = generateApiKey();

    // Calculate expiration
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default: 1 year

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: authResult.userId,
        key,
        name: data.name,
        description: data.description,
        type: data.type as ApiKeyType,
        organization: data.organization,
        contactEmail: data.contactEmail,
        website: data.website,
        scopes: data.scopes,
        rateLimit: data.rateLimit,
        dailyLimit: data.dailyLimit,
        expiresAt,
      },
    });

    // Log creation
    await prisma.auditLog.create({
      data: {
        action: 'API_KEY_CREATED',
        entityType: 'ApiKey',
        entityId: apiKey.id,
        userId: authResult.userId,
        changes: {
          name: data.name,
          type: data.type,
          organization: data.organization,
          scopes: data.scopes,
        },
      },
    });

    return NextResponse.json(
      {
        id: apiKey.id,
        key, // Only show once!
        name: apiKey.name,
        type: apiKey.type,
        organization: apiKey.organization,
        scopes: apiKey.scopes,
        rateLimit: apiKey.rateLimit,
        dailyLimit: apiKey.dailyLimit,
        expiresAt: apiKey.expiresAt?.toISOString(),
        createdAt: apiKey.createdAt.toISOString(),
        warning: 'Store this API key securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/api-keys
 * List all API keys
 */
export async function GET(request: NextRequest) {
  // Require admin scope
  const authResult = await requireAuth(request, ['admin:read']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ApiKeyType | null;
    const isActive = searchParams.get('active');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const [apiKeys, total] = await Promise.all([
      prisma.apiKey.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          organization: true,
          contactEmail: true,
          website: true,
          scopes: true,
          rateLimit: true,
          dailyLimit: true,
          isActive: true,
          lastUsedAt: true,
          requestCount: true,
          expiresAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.apiKey.count({ where }),
    ]);

    return NextResponse.json({
      data: apiKeys.map(key => ({
        ...key,
        // Mask the actual key - never expose it
        keyPreview: `sk_live_...${key.id.slice(-8)}`,
        lastUsedAt: key.lastUsedAt?.toISOString(),
        expiresAt: key.expiresAt?.toISOString(),
        createdAt: key.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + apiKeys.length < total,
      },
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}
