import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const DeleteSchema = z.object({
  reason: z.string().min(1).max(1000).optional(),
  hardDelete: z.boolean().default(false),
  anonymizeData: z.boolean().default(true),
});

// GET - Fetch individual user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reports: true,
            comments: true,
            apiKeys: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Determine user status
    let status = 'ACTIVE';
    if (!user.isActive) {
      status = 'BANNED';
    } else if (!user.emailVerified) {
      status = 'PENDING';
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      status,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() || null,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      counts: {
        reports: user._count.reports,
        comments: user._count.comments,
        apiKeys: user._count.apiKeys,
        auditLogs: user._count.auditLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/users/:id
 *
 * Delete or deactivate a user account.
 *
 * Soft Delete (default):
 * - Sets isActive=false
 * - Optionally anonymizes user data
 * - Revokes all refresh tokens
 * - Deactivates all API keys
 *
 * Hard Delete (requires SUPER_ADMIN):
 * - Permanently removes user from database
 * - IMPORTANT: Cannot delete users with:
 *   - Uploaded media (onDelete: Restrict)
 *   - Authored pages (onDelete: Restrict)
 *   - Authored page revisions (onDelete: Restrict)
 * - Reports are ALWAYS anonymized (cannot be deleted)
 * - Use soft delete for users with media/pages
 *
 * Request Body:
 * - reason?: string - Reason for deletion/deactivation
 * - hardDelete?: boolean - Permanent deletion (default: false)
 * - anonymizeData?: boolean - Anonymize user data (default: true)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting - strict for delete operations
  const rateLimitError = await requireRateLimit(request, 10);
  if (rateLimitError) return rateLimitError;

  // Require admin:moderate scope
  const auth = await requireAuth(request, ['admin:moderate']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Parse request body (optional)
    let body: { reason?: string; hardDelete: boolean; anonymizeData: boolean } = {
      reason: undefined,
      hardDelete: false,
      anonymizeData: true,
    };
    try {
      const rawBody = await request.json();
      const parsed = DeleteSchema.safeParse(rawBody);
      if (parsed.success) {
        body = {
          reason: parsed.data.reason,
          hardDelete: parsed.data.hardDelete,
          anonymizeData: parsed.data.anonymizeData,
        };
      }
    } catch {
      // Empty body is OK
    }

    // Check if SUPER_ADMIN for hard delete
    const isSuperAdmin = auth.auth?.scopes?.includes('*');
    if (body.hardDelete && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Only SUPER_ADMIN can perform hard delete' },
        { status: 403 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        displayName: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (user.id === auth.userId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Cannot delete yourself' },
        { status: 403 }
      );
    }

    // Prevent deleting admins unless super admin
    if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Perform delete operation within transaction
    await prisma.$transaction(async (tx) => {
      if (body.hardDelete) {
        // Hard delete: Remove user and all related data

        // Check for restrict constraints FIRST
        const userCounts = await tx.user.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                reports: true,
                media: true,
                pages: true,
                pageRevisions: true,
              },
            },
          },
        });

        if (!userCounts) {
          throw new Error('User not found');
        }

        // Reports: ALWAYS anonymize (cannot delete due to Restrict constraint)
        if (userCounts._count.reports > 0) {
          await tx.report.updateMany({
            where: { reporterId: id },
            data: {
              reporterEmail: 'deleted@anonymous.user',
              reporterName: 'Deleted User',
              reporterPhone: null,
            },
          });
        }

        // Media: Cannot delete due to Restrict constraint - must reassign or fail
        if (userCounts._count.media > 0) {
          throw new Error(
            `Cannot delete user: User has ${userCounts._count.media} media file(s). ` +
            'Media cannot be deleted due to data retention policies. ' +
            'Use soft delete (deactivation) instead, or manually delete media first.'
          );
        }

        // Pages: Cannot delete due to Restrict constraint - must reassign or fail
        if (userCounts._count.pages > 0) {
          throw new Error(
            `Cannot delete user: User has ${userCounts._count.pages} page(s). ` +
            'Pages must be reassigned or deleted manually before user deletion. ' +
            'Use soft delete (deactivation) instead.'
          );
        }

        // PageRevisions: Cannot delete due to Restrict constraint - must reassign or fail
        if (userCounts._count.pageRevisions > 0) {
          throw new Error(
            `Cannot delete user: User has ${userCounts._count.pageRevisions} page revision(s). ` +
            'Page revisions must be deleted manually before user deletion. ' +
            'Use soft delete (deactivation) instead.'
          );
        }

        // If we get here, user has no media/pages/revisions, safe to proceed

        // Delete CASCADE relations (these are safe)
        await tx.refreshToken.deleteMany({ where: { userId: id } });
        await tx.apiKey.deleteMany({ where: { userId: id } });
        await tx.comment.deleteMany({ where: { userId: id } });

        // Set null for SetNull relations
        await tx.systemSetting.updateMany({
          where: { updatedById: id },
          data: { updatedById: null },
        });

        // Set moderated comments to null (SetNull constraint)
        await tx.comment.updateMany({
          where: { moderatedById: id },
          data: { moderatedById: null },
        });

        // Set moderated reports to null (SetNull constraint)
        await tx.report.updateMany({
          where: { moderatedById: id },
          data: { moderatedById: null },
        });

        // Set resolved duplicate clusters to null
        await tx.duplicateCluster.updateMany({
          where: { resolvedById: id },
          data: { resolvedById: null },
        });

        // Set reviewed enrichments to null
        await tx.enrichment.updateMany({
          where: { reviewedById: id },
          data: { reviewedById: null },
        });

        // Set audit logs user to null (SetNull constraint)
        await tx.auditLog.updateMany({
          where: { userId: id },
          data: { userId: null },
        });

        // Finally delete the user (reports are anonymized, no restrict violations)
        await tx.user.delete({ where: { id } });
      } else {
        // Soft delete: Deactivate and anonymize
        const anonymizedEmail = `deleted_${Date.now()}@anonymous.user`;

        await tx.user.update({
          where: { id },
          data: {
            isActive: false,
            email: body.anonymizeData ? anonymizedEmail : user.email,
            name: body.anonymizeData ? 'Deleted User' : user.name,
            displayName: body.anonymizeData ? 'Deleted User' : user.displayName,
            passwordHash: 'DELETED',
          },
        });

        // Revoke all refresh tokens
        await tx.refreshToken.deleteMany({ where: { userId: id } });

        // Deactivate all API keys
        await tx.apiKey.updateMany({
          where: { userId: id },
          data: { isActive: false },
        });
      }

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: body.hardDelete ? 'USER_DELETED' : 'USER_DEACTIVATED',
          entityType: 'User',
          entityId: id,
          userId: auth.userId,
          changes: {
            userEmail: user.email,
            userName: user.displayName || user.name,
            reason: body.reason || 'No reason provided',
            hardDelete: body.hardDelete,
            anonymized: body.anonymizeData,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: body.hardDelete
        ? 'User permanently deleted'
        : 'User deactivated and anonymized',
      id,
      action: body.hardDelete ? 'deleted' : 'deactivated',
    });
  } catch (error) {
    console.error('Error deleting user:', error);

    // Provide specific error messages for constraint violations
    if (error instanceof Error) {
      // Our custom errors from the checks
      if (error.message.includes('Cannot delete user:')) {
        return NextResponse.json(
          {
            error: 'constraint_violation',
            message: error.message,
            suggestion: 'Consider using soft delete (deactivation) instead of hard delete.',
          },
          { status: 409 } // Conflict
        );
      }

      // Prisma foreign key constraint errors
      if (error.message.includes('Foreign key constraint') ||
          error.message.includes('violates foreign key constraint')) {
        return NextResponse.json(
          {
            error: 'constraint_violation',
            message: 'Cannot delete user due to existing related records. Use soft delete instead.',
            details: error.message,
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
