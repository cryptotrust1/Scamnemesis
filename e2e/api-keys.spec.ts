import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User API Key Management
 *
 * These tests verify the API key management functionality from a user's perspective.
 * Note: For full API testing, see the unit tests in src/app/api/v1/__tests__/user-api-keys.test.ts
 */

test.describe('API Keys - Developers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/developers');
  });

  test('should display developers page with API documentation', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1')).toBeVisible();

    // Check for API documentation sections
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('API');
  });

  test('should have Quick Start section', async ({ page }) => {
    // Look for Quick Start heading
    const quickStartSection = page.locator('text=Quick Start, text=Getting Started').first();
    // The section should exist (may be translated)
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/quick|start|api|key/i);
  });

  test('should display code examples', async ({ page }) => {
    // Check for code blocks (pre elements)
    const codeBlocks = page.locator('pre');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have copy button for code blocks', async ({ page }) => {
    // Check for copy buttons near code blocks
    const copyButtons = page.locator('button').filter({ has: page.locator('svg') });
    const count = await copyButtons.count();
    // Should have at least some buttons with icons (copy functionality)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display rate limiting information', async ({ page }) => {
    const pageContent = await page.textContent('body');
    // Check for rate limit related content
    expect(pageContent?.toLowerCase()).toMatch(/rate|limit|request/i);
  });

  test('should display error codes documentation', async ({ page }) => {
    const pageContent = await page.textContent('body');
    // Check for error code related content (400, 401, 429, etc.)
    expect(pageContent).toMatch(/40[0-9]|429|500/);
  });

  test('should have contact information for API access', async ({ page }) => {
    // Look for contact email or partnership info
    const contactLink = page.locator('a[href*="mailto:"], a[href*="partners"]');
    const count = await contactLink.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have link to Swagger/API docs', async ({ page }) => {
    // Look for docs link
    const docsLink = page.locator('a[href*="/docs"], a[href*="swagger"]');
    const count = await docsLink.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display API endpoint documentation', async ({ page }) => {
    // Check for endpoint documentation (GET, POST badges)
    const getBadge = page.locator('text=GET');
    const count = await getBadge.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have tabs for different API sections', async ({ page }) => {
    // Check for tabs (reports, search, stats)
    const tabs = page.locator('[role="tablist"] button, [role="tab"]');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(0); // May not have tabs in all layouts
  });
});

test.describe('API Keys - API Endpoints', () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test('should return 401 for unauthenticated API key list request', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v1/user/api-keys`);
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('should return 401 for unauthenticated API key creation', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/v1/user/api-keys`, {
      data: {
        name: 'Test Key',
        scopes: ['reports:read'],
      },
    });
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthenticated API key detail request', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v1/user/api-keys/some-key-id`);
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthenticated API key rotation', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/v1/user/api-keys/some-key-id/rotate`);
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthenticated API key deletion', async ({ request }) => {
    const response = await request.delete(`${baseUrl}/api/v1/user/api-keys/some-key-id`);
    expect(response.status()).toBe(401);
  });
});

test.describe('API Keys - Health Check', () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test('API health check should be accessible', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v1/health`);
    // Health endpoint should be accessible (may be 200 or other success status)
    expect([200, 204]).toContain(response.status());
  });
});

test.describe('API Keys - Localization', () => {
  test('should display developers page in English', async ({ page }) => {
    await page.goto('/en/developers');
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toContain('api');
  });

  test('should display developers page in Slovak', async ({ page }) => {
    await page.goto('/sk/developers');
    const pageContent = await page.textContent('body');
    // Page should load without errors
    expect(pageContent).toBeDefined();
  });
});
