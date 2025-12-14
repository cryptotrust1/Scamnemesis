/**
 * Health Check API Route
 *
 * GET /api/v1/health - Lightweight health check endpoint for Docker/Kubernetes
 *
 * This endpoint is designed for container orchestration health checks.
 * It does NOT require authentication or parameters.
 * It does NOT query the database to ensure fast response times.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/health - Health check endpoint
 *
 * Returns:
 * - 200 OK with status "healthy" when the application is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
