/**
 * OpenAPI Specification Endpoint
 *
 * GET /api/docs/openapi - Returns OpenAPI spec as JSON
 *
 * Protected by feature flag and optional admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { FEATURES } from '@/lib/config/features';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check if Swagger UI is enabled
  if (!FEATURES.SWAGGER_UI.enabled) {
    return NextResponse.json(
      { error: 'not_found', message: 'API documentation is disabled' },
      { status: 404 }
    );
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
    const spec = yaml.load(specContent) as Record<string, unknown>;

    // Dynamically set server URL based on request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';

    spec.servers = [
      {
        url: `${protocol}://${host}/api/v1`,
        description: 'Current environment',
      },
    ];

    return NextResponse.json(spec, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('[OpenAPI] Failed to load spec:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to load API specification' },
      { status: 500 }
    );
  }
}
