/**
 * OpenAPI Specification Endpoint (YAML format)
 *
 * GET /api/docs/openapi.yaml - Returns OpenAPI spec as YAML
 *
 * Protected by feature flag and optional admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FEATURES } from '@/lib/config/features';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check if Swagger UI is enabled
  if (!FEATURES.SWAGGER_UI.enabled) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Check authentication if required
  if (FEATURES.SWAGGER_UI.requireAuth) {
    const authResult = await requireAuth(request, ['admin:read']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  }

  try {
    // Read OpenAPI spec from versioned location
    const specPath = join(process.cwd(), 'openapi', 'v1', 'openapi.yaml');
    const specContent = readFileSync(specPath, 'utf-8');

    return new NextResponse(specContent, {
      headers: {
        'Content-Type': 'application/x-yaml',
        'Cache-Control': 'private, max-age=300',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('[OpenAPI] Failed to load spec:', error);
    return new NextResponse('Failed to load API specification', { status: 500 });
  }
}
