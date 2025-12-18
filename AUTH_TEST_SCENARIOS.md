# Authentication System - Test Scenarios

## Test Scenarios for User Deletion Issues

### Scenario 1: Delete User with Reports (FAILS with current code)

**Setup:**
1. Create user A
2. User A submits a fraud report
3. Admin attempts hard delete with `anonymizeData: false`

**Current Behavior:**
- ❌ Error 500: Foreign key constraint violation
- Database prevents deletion due to `Report.reporter` having `onDelete: Restrict`

**Expected Behavior with Fix:**
- ✓ Error 409: Clear message explaining reports must be anonymized
- Reports are anonymized automatically when `anonymizeData: true`

**Test:**
```bash
# Create user and report
POST /api/v1/auth/register
{
  "email": "test@example.com",
  "password": "TestPass123!",
  "name": "Test User"
}

POST /api/v1/reports
{
  "fraudType": "PHISHING",
  "summary": "Test fraud report",
  ...
}

# Try to delete without anonymization
DELETE /api/v1/admin/users/{userId}
{
  "hardDelete": true,
  "anonymizeData": false
}

# Expected: 409 error with clear message
```

---

### Scenario 2: Delete User with Uploaded Media (FAILS)

**Setup:**
1. Create user B (admin/editor)
2. User B uploads media files to CMS
3. Admin attempts hard delete

**Current Behavior:**
- ❌ Error 500: Foreign key constraint violation
- Code tries `await tx.media.deleteMany({ where: { uploadedById: id } })`
- Fails because `Media.uploadedBy` has `onDelete: Restrict`

**Expected Behavior with Fix:**
- ✓ Error 409: Clear message explaining media must be deleted/reassigned first
- Suggests using soft delete instead

**Test:**
```bash
# Upload media as user
POST /api/v1/media/upload
[Upload files]

# Try to delete user
DELETE /api/v1/admin/users/{userId}
{
  "hardDelete": true
}

# Expected: 409 error with message about media files
```

---

### Scenario 3: Delete User with Authored Pages (FAILS)

**Setup:**
1. Create user C (admin/editor)
2. User C creates CMS pages
3. Admin attempts hard delete

**Current Behavior:**
- ❌ Error 500: Foreign key constraint violation
- Code tries `await tx.page.deleteMany({ where: { authorId: id } })`
- Fails because `Page.author` has `onDelete: Restrict`

**Expected Behavior with Fix:**
- ✓ Error 409: Clear message explaining pages must be deleted/reassigned first
- Suggests using soft delete instead

**Test:**
```bash
# Create page as user
POST /api/v1/pages
{
  "title": "Test Page",
  "content": "...",
  ...
}

# Try to delete user
DELETE /api/v1/admin/users/{userId}
{
  "hardDelete": true
}

# Expected: 409 error with message about pages
```

---

### Scenario 4: Soft Delete User with Content (WORKS)

**Setup:**
1. Create user D
2. User D has reports, media, pages, comments
3. Admin attempts soft delete

**Current Behavior:**
- ✓ Works correctly
- User is deactivated (isActive=false)
- Data is optionally anonymized
- Tokens are revoked

**Expected Behavior:**
- ✓ Same - no changes needed

**Test:**
```bash
DELETE /api/v1/admin/users/{userId}
{
  "hardDelete": false,
  "anonymizeData": true,
  "reason": "User requested account deletion"
}

# Expected: 200 OK, user deactivated
```

---

### Scenario 5: Delete Clean User (WORKS)

**Setup:**
1. Create user E
2. User E has no reports, media, pages, or revisions
3. Admin attempts hard delete

**Current Behavior:**
- ✓ Works (user has no content)

**Expected Behavior with Fix:**
- ✓ Same - deletion succeeds

**Test:**
```bash
# Create user but don't create any content
POST /api/v1/auth/register
{
  "email": "clean@example.com",
  "password": "TestPass123!",
  "name": "Clean User"
}

# Delete immediately
DELETE /api/v1/admin/users/{userId}
{
  "hardDelete": true
}

# Expected: 200 OK, user deleted
```

---

## Manual Testing Steps

### 1. Setup Test Environment
```bash
# Ensure database is seeded with test users
pnpm prisma db seed
```

### 2. Test User Deletion with Reports
```bash
# Create test user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deleteme1@test.com",
    "password": "TestPass123!",
    "name": "Delete Me 1"
  }'

# Login as that user and create a report
# Then login as admin and try to delete the user

# With CURRENT code:
# Expected: 500 error

# With FIXED code:
# Expected: 409 error with clear message
```

### 3. Test Soft Delete
```bash
# Should always work regardless of content
curl -X DELETE http://localhost:3000/api/v1/admin/users/{userId} \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "hardDelete": false,
    "anonymizeData": true,
    "reason": "Test soft delete"
  }'

# Expected: 200 OK
```

---

## Automated Test Suite

Create this test file: `src/app/api/v1/admin/users/__tests__/delete.test.ts`

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { prisma } from '@/lib/db';

describe('DELETE /api/v1/admin/users/[id]', () => {
  let testUser: any;
  let adminToken: string;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        role: 'BASIC',
      },
    });

    // Get admin token
    // ... (setup admin auth)
  });

  it('should prevent hard delete of user with reports', async () => {
    // Create report for user
    await prisma.report.create({
      data: {
        reporterId: testUser.id,
        reporterEmail: testUser.email,
        fraudType: 'PHISHING',
        summary: 'Test report',
        // ... other required fields
      },
    });

    // Attempt hard delete without anonymization
    const response = await fetch(`/api/v1/admin/users/${testUser.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hardDelete: true,
        anonymizeData: false,
      }),
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe('constraint_violation');
  });

  it('should prevent hard delete of user with media', async () => {
    // Create media for user
    await prisma.media.create({
      data: {
        uploadedById: testUser.id,
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1000,
        fileKey: 'test-key',
      },
    });

    // Attempt hard delete
    const response = await fetch(`/api/v1/admin/users/${testUser.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hardDelete: true,
      }),
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.message).toContain('media');
  });

  it('should allow soft delete of user with content', async () => {
    // Create various content
    await prisma.report.create({
      data: {
        reporterId: testUser.id,
        reporterEmail: testUser.email,
        fraudType: 'PHISHING',
        summary: 'Test report',
      },
    });

    // Attempt soft delete
    const response = await fetch(`/api/v1/admin/users/${testUser.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hardDelete: false,
        anonymizeData: true,
      }),
    });

    expect(response.status).toBe(200);

    // Verify user is deactivated
    const user = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    expect(user?.isActive).toBe(false);
  });

  it('should allow hard delete of clean user', async () => {
    // User with no content
    // Attempt hard delete
    const response = await fetch(`/api/v1/admin/users/${testUser.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hardDelete: true,
      }),
    });

    expect(response.status).toBe(200);

    // Verify user is deleted
    const user = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    expect(user).toBeNull();
  });
});
```

---

## Verification Checklist

After applying the fix:

- [ ] Soft delete works for all users
- [ ] Hard delete works for users with no content
- [ ] Hard delete is blocked for users with media (409 error)
- [ ] Hard delete is blocked for users with pages (409 error)
- [ ] Hard delete is blocked for users with page revisions (409 error)
- [ ] Reports are always anonymized during hard delete
- [ ] Error messages are clear and actionable
- [ ] Admin UI shows appropriate warnings
- [ ] Audit logs are created for all operations
- [ ] No 500 errors for constraint violations
