/**
 * Widget Single Item API
 *
 * GET /api/v1/widgets/:id - Get widget details
 * PATCH /api/v1/widgets/:id - Update widget
 * DELETE /api/v1/widgets/:id - Delete widget
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { FEATURES } from '@/lib/config/features';
import { WidgetTheme, WidgetSearchMode } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation for hex color
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const UpdateWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  locale: z.enum(['en', 'sk', 'cs', 'de']).optional(),
  theme: z.enum(['LIGHT', 'DARK']).optional(),
  primaryColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
  backgroundColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
  textColor: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
  borderRadius: z.number().min(0).max(32).optional(),
  showReportButton: z.boolean().optional(),
  showAdvancedByDefault: z.boolean().optional(),
  defaultSearchMode: z.enum(['AUTO', 'FUZZY', 'EXACT']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/v1/widgets/:id
 * Get widget details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

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
    const widget = await prisma.widget.findUnique({
      where: { id },
    });

    if (!widget) {
      return NextResponse.json(
        { error: 'not_found', message: 'Widget not found' },
        { status: 404 }
      );
    }

    // IDOR protection - check ownership
    if (widget.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
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
      updatedAt: widget.updatedAt.toISOString(),
      embedUrl: `/${widget.locale}/embed/widget/${widget.id}`,
    });
  } catch (error) {
    console.error('Error getting widget:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to get widget' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/widgets/:id
 * Update widget
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

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
    const existing = await prisma.widget.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'Widget not found' },
        { status: 404 }
      );
    }

    // IDOR protection - check ownership
    if (existing.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = UpdateWidgetSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const data = validated.data;

    const widget = await prisma.widget.update({
      where: { id },
      data: {
        name: data.name,
        locale: data.locale,
        theme: data.theme as WidgetTheme | undefined,
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        borderRadius: data.borderRadius,
        showReportButton: data.showReportButton,
        showAdvancedByDefault: data.showAdvancedByDefault,
        defaultSearchMode: data.defaultSearchMode as WidgetSearchMode | undefined,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({
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
      updatedAt: widget.updatedAt.toISOString(),
      embedUrl: `/${widget.locale}/embed/widget/${widget.id}`,
    });
  } catch (error) {
    console.error('Error updating widget:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to update widget' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/widgets/:id
 * Delete widget
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

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
    const existing = await prisma.widget.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'not_found', message: 'Widget not found' },
        { status: 404 }
      );
    }

    // IDOR protection - check ownership
    if (existing.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Access denied' },
        { status: 403 }
      );
    }

    await prisma.widget.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Widget deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to delete widget' },
      { status: 500 }
    );
  }
}
