# Authentication System Analysis Report

**Analysis Date:** 2025-12-18
**Repository:** /home/user/Scamnemesis
**Focus:** Schema changes affecting authentication

---

## Executive Summary

The authentication system has been analyzed for issues related to recent schema changes, particularly the `onDelete: Restrict` constraint on `Report.reporter` and other relations. **Two critical bugs were found** in the user deletion endpoint that will cause database constraint violations.

---

## Schema Changes Affecting Authentication

### 1. User.onDelete: Restrict on Report.reporter
- **Schema Location:** Line 268 of `prisma/schema.prisma`
- **Impact:** Users with reports cannot be deleted via CASCADE
- **Status:** ⚠️ PARTIAL FIX NEEDED

### 2. Other Restrict Constraints on User Relations
- **Media.uploadedBy:** `onDelete: Restrict` (line 717)
- **Page.author:** `onDelete: Restrict` (line 838)
- **PageRevision.author:** `onDelete: Restrict` (line 870)
- **Status:** ⚠️ NOT HANDLED

### 3. Cascade Relations (Working Correctly)
- **RefreshToken.user:** `onDelete: Cascade` (line 199) ✓
- **ApiKey.user:** `onDelete: Cascade` (line 185) ✓
- **Comment.user:** `onDelete: Cascade` (line 512) ✓

---

## Critical Issues Found

### ISSUE 1: Hard Delete Violates Restrict Constraints on Media, Pages, and PageRevisions

**File:** `/home/user/Scamnemesis/src/app/api/v1/admin/users/[id]/route.ts`
**Lines:** 187-189
**Severity:** CRITICAL

#### Problem
```typescript
// Hard delete: Remove user and all related data
// Delete in correct order due to foreign key constraints
await tx.refreshToken.deleteMany({ where: { userId: id } });
await tx.apiKey.deleteMany({ where: { userId: id } });
await tx.comment.deleteMany({ where: { userId: id } });
await tx.pageRevision.deleteMany({ where: { authorId: id } });  // ❌ FAILS if has revisions
await tx.page.deleteMany({ where: { authorId: id } });          // ❌ FAILS if has pages
await tx.media.deleteMany({ where: { uploadedById: id } });     // ❌ FAILS if has media
```

These `deleteMany` operations will **FAIL** with a foreign key constraint error because:
- `PageRevision.author` has `onDelete: Restrict`
- `Page.author` has `onDelete: Restrict`
- `Media.uploadedBy` has `onDelete: Restrict`

Prisma enforces `onDelete: Restrict` by preventing the deletion of the parent record (User) when child records exist. Attempting to delete child records directly that have a `Restrict` constraint on them is also not allowed.

#### Why This Happens
The `onDelete: Restrict` constraint means:
1. You cannot delete a User if they have authored Pages/PageRevisions or uploaded Media
2. The child records must be reassigned or the constraint must be changed to allow deletion

#### Impact
- Admin attempts to hard delete users with media/pages will fail with error 500
- Users are stuck and cannot be removed from the system
- No graceful error handling or user feedback

---

### ISSUE 2: Hard Delete Reports Without Anonymization Violates Restrict Constraint

**File:** `/home/user/Scamnemesis/src/app/api/v1/admin/users/[id]/route.ts`
**Lines:** 205-214, 218
**Severity:** CRITICAL

#### Problem
```typescript
// Handle reports - either anonymize or delete
if (body.anonymizeData) {
  // Anonymize reports (keep data but remove PII)
  await tx.report.updateMany({
    where: { reporterId: id },
    data: {
      reporterEmail: 'deleted@anonymous.user',
      reporterName: 'Deleted User',
      reporterPhone: null,
    },
  });
}

// Finally delete the user
await tx.user.delete({ where: { id } });  // ❌ FAILS if anonymizeData=false and has reports
```

If `anonymizeData: false` and the user has reports, the deletion will **FAIL** because:
- `Report.reporter` has `onDelete: Restrict` (schema line 268)
- No anonymization happens when `anonymizeData` is false
- The user still has reports, so deletion is prevented

#### Impact
- Hard delete with `anonymizeData: false` fails for any user with reports
- Error 500 with no clear feedback to admin
- Reports are critical data and most users will have them

---

## System Components Status

### ✓ Working Correctly

1. **User Registration** (`/api/v1/auth/register`)
   - Password validation ✓
   - Email verification token generation ✓
   - Audit logging ✓

2. **User Login** (`/api/v1/auth/token`)
   - Password authentication ✓
   - API key authentication ✓
   - HttpOnly cookie support ✓
   - Rate limiting ✓

3. **User Logout** (`/api/v1/auth/logout`)
   - Token invalidation ✓
   - Cookie clearing ✓
   - Bulk token deletion ✓

4. **Token Refresh** (`/api/v1/auth/refresh`)
   - Token rotation ✓
   - Expiration checking ✓
   - User active status verification ✓

5. **Session Management**
   - Access tokens (1 hour) ✓
   - Refresh tokens (7 days) ✓
   - HttpOnly cookies ✓

6. **Email Verification** (`/api/v1/auth/verify-email`)
   - Token validation ✓
   - Email enumeration prevention ✓

7. **Password Reset** (`/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`)
   - Token generation ✓
   - All tokens invalidation on reset ✓
   - Email enumeration prevention ✓

8. **User Ban/Unban** (`/api/v1/admin/users/[id]/ban`, `/api/v1/admin/users/[id]/unban`)
   - Token revocation on ban ✓
   - Audit logging ✓
   - Permission checks ✓

9. **Soft Delete** (User deactivation)
   - Deactivation works correctly ✓
   - Token revocation ✓
   - API key deactivation ✓
   - Anonymization ✓

### ⚠️ Issues Found

1. **Hard Delete** (User deletion)
   - ❌ Fails for users with Media
   - ❌ Fails for users with Pages
   - ❌ Fails for users with PageRevisions
   - ❌ Fails for users with Reports (when anonymizeData=false)

### ℹ️ Not Implemented

1. **API Key Management Endpoints**
   - No create/list/delete endpoints for user API keys
   - Schema supports it, but no API routes exist
   - Users cannot manage their own API keys

---

## Recommended Fixes

### FIX 1: Update User Deletion Logic to Handle Restrict Constraints

**File:** `/home/user/Scamnemesis/src/app/api/v1/admin/users/[id]/route.ts`

Replace lines 179-218 with:

```typescript
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
      if (!body.anonymizeData) {
        throw new Error(
          `Cannot delete user: User has ${userCounts._count.media} media file(s). ` +
          'Media cannot be deleted due to data retention policies. ' +
          'Use soft delete (deactivation) instead, or contact super admin to reassign media.'
        );
      }
      // Option: Could reassign to a system user, but for now we prevent deletion
      throw new Error(
        `Cannot delete user: User has ${userCounts._count.media} media file(s). ` +
        'Media must be reassigned or deleted manually before user deletion. ' +
        'Use soft delete (deactivation) instead.'
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

    // Finally delete the user (reports are anonymized, no restrict violations)
    await tx.user.delete({ where: { id } });
  } else {
    // Soft delete: Deactivate and anonymize (existing code is fine)
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
```

### FIX 2: Add Better Error Handling

Update the catch block (line 271) to provide more specific error messages:

```typescript
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
          suggestion: 'Consider using soft delete (deactivation) instead of hard delete.'
        },
        { status: 409 } // Conflict
      );
    }

    // Prisma foreign key constraint errors
    if (error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        {
          error: 'constraint_violation',
          message: 'Cannot delete user due to existing related records. Use soft delete instead.',
          details: error.message
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
```

### FIX 3: Update API Documentation

Add to the DELETE endpoint documentation:

```typescript
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
```

---

## Alternative Solution: Schema Changes

If you want to allow full deletion of users with media/pages, you have two options:

### Option A: Change Constraints to SetNull

```prisma
model Media {
  // ... other fields
  uploadedById   String?     @map("uploaded_by_id")
  uploadedBy     User?       @relation(fields: [uploadedById], references: [id], onDelete: SetNull)
  // ...
}

model Page {
  // ... other fields
  authorId    String?      @map("author_id")
  author      User?        @relation(fields: [authorId], references: [id], onDelete: SetNull)
  // ...
}

model PageRevision {
  // ... other fields
  authorId    String?    @map("author_id")
  author      User?      @relation(fields: [authorId], references: [id], onDelete: SetNull)
  // ...
}
```

**Pros:**
- Allows user deletion without data loss
- Preserves media/pages as "orphaned" records

**Cons:**
- Loses authorship information
- May create data integrity issues
- Requires migration

### Option B: Create System User for Reassignment

1. Create a system user (e.g., "Deleted User") on startup
2. Reassign media/pages/revisions to this user before deletion
3. Keep `onDelete: Restrict` for data integrity

**Pros:**
- Preserves authorship trail
- Allows deletion
- Maintains data integrity

**Cons:**
- Requires additional logic
- System user management overhead

---

## Testing Recommendations

### Unit Tests Needed

1. **Test User Deletion with Media**
   ```typescript
   it('should prevent hard delete of user with uploaded media', async () => {
     // Create user with media
     // Attempt hard delete
     // Expect 409 error
   });
   ```

2. **Test User Deletion with Pages**
   ```typescript
   it('should prevent hard delete of user with authored pages', async () => {
     // Create user with pages
     // Attempt hard delete
     // Expect 409 error
   });
   ```

3. **Test User Deletion with Reports**
   ```typescript
   it('should anonymize reports on hard delete', async () => {
     // Create user with reports
     // Attempt hard delete with anonymizeData=true
     // Expect success
     // Verify reports are anonymized
   });
   ```

4. **Test Soft Delete**
   ```typescript
   it('should soft delete user regardless of related records', async () => {
     // Create user with media/pages/reports
     // Attempt soft delete
     // Expect success
     // Verify user is deactivated but not deleted
   });
   ```

---

## Migration Checklist

- [ ] Apply Fix 1 to user deletion logic
- [ ] Apply Fix 2 for better error handling
- [ ] Update API documentation
- [ ] Add unit tests for deletion scenarios
- [ ] Test in development environment
- [ ] Create database backup before production deployment
- [ ] Deploy to production
- [ ] Monitor error logs for constraint violations
- [ ] Update admin UI to show deletion restrictions

---

## Summary

The authentication system is generally well-implemented with proper security measures, rate limiting, and audit logging. However, the user deletion functionality has critical bugs that prevent hard deletion of users with media, pages, or reports due to schema `onDelete: Restrict` constraints.

**Recommended Action:** Apply the fixes above to handle Restrict constraints properly and prevent deletion attempts that will fail. Consider using soft delete (deactivation) as the primary user removal method, with hard delete reserved for users with no associated content.
