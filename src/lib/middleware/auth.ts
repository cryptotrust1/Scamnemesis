/**
 * Authentication Middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload, hasScope } from '@/lib/auth/jwt';
import prisma from '@/lib/db';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
  apiKey?: {
    id: string;
    userId: string;
    scopes: string[];
  };
}

export interface AuthContext {
  user: TokenPayload | null;
  apiKey: { id: string; userId: string; scopes: string[] } | null;
  scopes: string[];
}

/**
 * Extract and validate authentication from request
 * Supports: Bearer token (header), HttpOnly cookie, API key
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');

  let user: TokenPayload | null = null;
  let apiKey: { id: string; userId: string; scopes: string[] } | null = null;
  let scopes: string[] = [];

  // Try Bearer token from header first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    user = await verifyToken(token);
    if (user) {
      scopes = user.scopes || [];
    }
  }

  // Try access_token from HttpOnly cookie (for browser clients)
  if (!user) {
    const cookieToken = request.cookies.get('access_token')?.value;
    if (cookieToken) {
      user = await verifyToken(cookieToken);
      if (user) {
        scopes = user.scopes || [];
      }
    }
  }

  // Try API key
  if (!user && apiKeyHeader) {
    try {
      const key = await prisma.apiKey.findUnique({
        where: { key: apiKeyHeader, isActive: true },
        select: {
          id: true,
          userId: true,
          scopes: true,
          expiresAt: true,
        },
      });

      if (key) {
        // Check expiration - keys without expiresAt default to 1 year max
        const now = new Date();
        const maxDefaultExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
        const effectiveExpiry = key.expiresAt || maxDefaultExpiry;

        if (effectiveExpiry > now) {
          apiKey = {
            id: key.id,
            userId: key.userId,
            scopes: key.scopes,
          };
          scopes = key.scopes;

          // Update last used (fire and forget - don't block on this)
          prisma.apiKey.update({
            where: { id: key.id },
            data: { lastUsedAt: now },
          }).catch((err) => console.error('[Auth] Failed to update API key lastUsedAt:', err));

          // Log warning for keys without explicit expiration
          if (!key.expiresAt) {
            console.warn(`[Auth] API key ${key.id} has no expiration set. Consider setting an expiration date.`);
          }
        }
      }
    } catch (dbError) {
      console.error('[Auth] Database error checking API key:', dbError);
      // Continue without API key auth - don't break the request
    }
  }

  return { user, apiKey, scopes };
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest,
  requiredScopes: string[] = []
): Promise<{ auth: AuthContext; userId: string } | NextResponse> {
  const auth = await getAuthContext(request);

  if (!auth.user && !auth.apiKey) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  // Check required scopes
  for (const scope of requiredScopes) {
    if (!hasScope(auth.scopes, scope)) {
      return NextResponse.json(
        {
          error: 'forbidden',
          message: `Missing required scope: ${scope}`,
        },
        { status: 403 }
      );
    }
  }

  // Extract userId from either user token or API key
  // We validated above that at least one exists, but verify the userId is present
  const userId = auth.user?.sub || auth.apiKey?.userId;

  if (!userId) {
    // This shouldn't happen if token/apiKey validation is correct,
    // but provides a safety net against malformed auth data
    return NextResponse.json(
      {
        error: 'unauthorized',
        message: 'Invalid authentication: missing user identifier',
      },
      { status: 401 }
    );
  }

  return { auth, userId };
}

/**
 * Optional authentication - doesn't require auth but extracts if present
 */
export async function optionalAuth(request: NextRequest): Promise<AuthContext> {
  return getAuthContext(request);
}

/**
 * Rate limiting check
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 3600000 // 1 hour
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    // Clean up expired entries (fire and forget - don't block on this)
    prisma.rateLimit.deleteMany({
      where: { expiresAt: { lt: now } },
    }).catch((err) => console.error('[RateLimit] Failed to clean up expired entries:', err));

    // Get or create rate limit entry
    let rateLimit = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!rateLimit || rateLimit.windowStart < windowStart) {
      // Create new window
      rateLimit = await prisma.rateLimit.upsert({
        where: { identifier },
        update: {
          count: 1,
          windowStart: now,
          expiresAt: new Date(now.getTime() + windowMs),
        },
        create: {
          identifier,
          count: 1,
          windowStart: now,
          expiresAt: new Date(now.getTime() + windowMs),
        },
      });
    } else {
      // Increment count
      rateLimit = await prisma.rateLimit.update({
        where: { identifier },
        data: { count: { increment: 1 } },
      });
    }

    const remaining = Math.max(0, limit - rateLimit.count);
    const allowed = rateLimit.count <= limit;

    return {
      allowed,
      remaining,
      resetAt: rateLimit.expiresAt,
    };
  } catch (dbError) {
    console.error('[RateLimit] Database error:', dbError);
    // On database error, allow the request but log it
    // This prevents rate limiting from blocking all requests when DB is down
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
}

/**
 * Rate limit middleware
 */
export async function requireRateLimit(
  request: NextRequest,
  limit: number = 100
): Promise<NextResponse | null> {
  // Use IP or user ID as identifier
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  const auth = await getAuthContext(request);
  const identifier = auth.user?.sub || auth.apiKey?.userId || `ip:${ip}`;

  const { allowed, remaining: _remaining, resetAt } = await checkRateLimit(identifier, limit);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Rate limit exceeded. Try again later.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(resetAt.getTime() / 1000).toString(),
          'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
