/**
 * Widget CRUD API
 *
 * GET /api/v1/widgets - List user's widgets
 * POST /api/v1/widgets - Create a new widget
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { FEATURES } from '@/lib/config/features';
import { WidgetTheme, WidgetSearchMode } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Validation for hex color
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const CreateWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  locale: z.enum(['en', 'sk', 'cs', 'de']).default('en'),
  theme: z.enum(['LIGHT', 'DARK']).default('LIGHT'),
  primaryColor: z.string().regex(hexColorRegex, 'Invalid hex color').default('#4f46e5'),
  backgroundColor: z.string().regex(hexColorRegex, 'Invalid hex color').default('#ffffff'),
  textColor: z.string().regex(hexColorRegex, 'Invalid hex color').default('#1f2937'),
  borderRadius: z.number().min(0).max(32).default(8),
  showReportButton: z.boolean().default(true),
  showAdvancedByDefault: z.boolean().default(false),
  defaultSearchMode: z.enum(['AUTO', 'FUZZY', 'EXACT']).default('AUTO'),
});

/**
 * GET /api/v1/widgets
 * List all widgets for the authenticated user
 */
export async function GET(request: NextRequest) {
  // Check if feature is enabled
  if (!FEATURES.PARTNER_WIDGETS.enabled) {
    return NextResponse.json(
      { error: 'not_found', message: 'Widget feature is not enabled' },
      { status: 404 }
    );
  }

  // Rate limit
  const rateLimitResult = await requireRateLimit(request, 100);
  if (rateLimitResult) return rateLimitResult;

  // Require authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const widgets = await prisma.widget.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        locale: true,
        theme: true,
        primaryColor: true,
        backgroundColor: true,
        textColor: true,
        borderRadius: true,
        showReportButton: true,
        showAdvancedByDefault: true,
        defaultSearchMode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: widgets,
      total: widgets.length,
    });
  } catch (error) {
    console.error('Error listing widgets:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to list widgets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/widgets
 * Create a new widget
 */
export async function POST(request: NextRequest) {
  // Check if feature is enabled
  if (!FEATURES.PARTNER_WIDGETS.enabled) {
    return NextResponse.json(
      { error: 'not_found', message: 'Widget feature is not enabled' },
      { status: 404 }
    );
  }

  // Rate limit
  const rateLimitResult = await requireRateLimit(request, 50);
  if (rateLimitResult) return rateLimitResult;

  // Require authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Check widget limit
    const widgetCount = await prisma.widget.count({
      where: { userId: authResult.userId },
    });

    if (widgetCount >= FEATURES.PARTNER_WIDGETS.maxWidgetsPerUser) {
      return NextResponse.json(
        {
          error: 'limit_exceeded',
          message: `Maximum ${FEATURES.PARTNER_WIDGETS.maxWidgetsPerUser} widgets allowed per user`,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = CreateWidgetSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const data = validated.data;

    const widget = await prisma.widget.create({
      data: {
        userId: authResult.userId,
        name: data.name,
        locale: data.locale,
        theme: data.theme as WidgetTheme,
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        borderRadius: data.borderRadius,
        showReportButton: data.showReportButton,
        showAdvancedByDefault: data.showAdvancedByDefault,
        defaultSearchMode: data.defaultSearchMode as WidgetSearchMode,
      },
    });

    return NextResponse.json(
      {
        id: widget.id,
        name: widget.name,
        locale: widget.locale,
        theme: widget.theme,
        primaryColor: widget.primaryColor,
        backgroundColor: widget.backgroundColor,
        textColor: widget.textColor,
        borderRadius: widget.borderRadius,
        showReportButton: widget.showReportButton,
        showAdvancedByDefault: widget.showAdvancedByDefault,
        defaultSearchMode: widget.defaultSearchMode,
        isActive: widget.isActive,
        createdAt: widget.createdAt.toISOString(),
        embedUrl: `/${widget.locale}/embed/widget/${widget.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create widget' },
      { status: 500 }
    );
  }
}
