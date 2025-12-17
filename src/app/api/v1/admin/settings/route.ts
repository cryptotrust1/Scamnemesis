import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Schema for updating a setting
const UpdateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  group: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Schema for bulk update
const BulkUpdateSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.any(),
  })),
});

// GET - Fetch all settings or by group
export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute for admin endpoints
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    const publicOnly = searchParams.get('public') === 'true';

    // Build where clause
    const where: { group?: string; isPublic?: boolean } = {};
    if (group) {
      where.group = group;
    }
    if (publicOnly) {
      where.isPublic = true;
    }

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
      select: {
        id: true,
        key: true,
        value: true,
        type: true,
        group: true,
        label: true,
        description: true,
        isPublic: true,
        updatedAt: true,
        updatedBy: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    // Group settings by group
    const grouped = settings.reduce((acc, setting) => {
      const groupKey = setting.group || 'general';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        label: setting.label,
        description: setting.description,
        isPublic: setting.isPublic,
        updatedAt: setting.updatedAt.toISOString(),
        updatedBy: setting.updatedBy ? {
          id: setting.updatedBy.id,
          displayName: setting.updatedBy.displayName,
        } : null,
      });
      return acc;
    }, {} as Record<string, unknown[]>);

    return NextResponse.json({
      settings: grouped,
      total: settings.length,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update a single setting
export async function PUT(request: NextRequest) {
  // Rate limiting - 30 requests per minute for write operations
  const rateLimitError = await requireRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;

  // Require admin:edit scope
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validatedBody = UpdateSettingSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { key, value, type, group, label, description, isPublic } = validatedBody.data;

    // Upsert the setting
    const setting = await prisma.$transaction(async (tx) => {
      const existingSetting = await tx.systemSetting.findUnique({
        where: { key },
      });

      const settingData = {
        value,
        type: type || existingSetting?.type || 'string',
        group: group || existingSetting?.group || 'general',
        label: label ?? existingSetting?.label,
        description: description ?? existingSetting?.description,
        isPublic: isPublic ?? existingSetting?.isPublic ?? false,
        updatedById: auth.userId,
      };

      const updated = await tx.systemSetting.upsert({
        where: { key },
        create: {
          key,
          ...settingData,
        },
        update: settingData,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: existingSetting ? 'SETTING_UPDATED' : 'SETTING_CREATED',
          entityType: 'SystemSetting',
          entityId: updated.id,
          userId: auth.userId,
          changes: {
            key,
            oldValue: existingSetting?.value,
            newValue: value,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      setting: {
        id: setting.id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        group: setting.group,
        updatedAt: setting.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk update multiple settings
export async function PATCH(request: NextRequest) {
  // Rate limiting - 10 requests per minute for bulk operations
  const rateLimitError = await requireRateLimit(request, 10);
  if (rateLimitError) return rateLimitError;

  // Require admin:edit scope
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validatedBody = BulkUpdateSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { settings } = validatedBody.data;

    // Update all settings in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const updates = [];

      for (const { key, value } of settings) {
        const existingSetting = await tx.systemSetting.findUnique({
          where: { key },
        });

        const updated = await tx.systemSetting.upsert({
          where: { key },
          create: {
            key,
            value,
            type: 'string',
            group: 'general',
            updatedById: auth.userId,
          },
          update: {
            value,
            updatedById: auth.userId,
          },
        });

        updates.push({
          key,
          oldValue: existingSetting?.value,
          newValue: value,
          id: updated.id,
        });
      }

      // Create single audit log for bulk update
      await tx.auditLog.create({
        data: {
          action: 'SETTINGS_BULK_UPDATED',
          entityType: 'SystemSetting',
          entityId: 'bulk',
          userId: auth.userId,
          changes: {
            count: updates.length,
            updates: updates.map(u => ({ key: u.key, oldValue: u.oldValue, newValue: u.newValue })),
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updates;
    });

    return NextResponse.json({
      success: true,
      updated: results.length,
      settings: results.map(r => ({ key: r.key, id: r.id })),
    });
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to bulk update settings' },
      { status: 500 }
    );
  }
}
