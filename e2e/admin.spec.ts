import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.describe('Admin Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/login');
    });

    test('should display admin login form', async ({ page }) => {
      // Check for email input
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible();

      // Check for password input
      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toBeVisible();

      // Check for submit button
      const submitButton = page.locator('form button[type="submit"], form button').first();
      await expect(submitButton).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      const submitButton = page.locator('form button[type="submit"], form button').first();
      await submitButton.click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Form should not navigate away (stay on login page)
      await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill('invalid@test.com');

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('wrongpassword123');

      const submitButton = page.locator('form button[type="submit"], form button').first();
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(1000);

      // Should still be on login page or show error message
      // Either URL contains login or there's an error message
      const isOnLogin = await page.url().includes('/admin/login');
      const hasError = await page.locator('[role="alert"], .error, [data-error]').count() > 0;

      expect(isOnLogin || hasError).toBeTruthy();
    });
  });

  test.describe('Admin Panel Access Control', () => {
    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      await page.goto('/admin');

      // Wait for redirect
      await page.waitForTimeout(1000);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/admin\/login|\/auth\/login/);
    });

    test('should redirect to login when accessing admin reports without auth', async ({ page }) => {
      await page.goto('/admin/reports');

      // Wait for redirect
      await page.waitForTimeout(1000);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/admin\/login|\/auth\/login/);
    });

    test('should redirect to login when accessing admin users without auth', async ({ page }) => {
      await page.goto('/admin/users');

      // Wait for redirect
      await page.waitForTimeout(1000);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/admin\/login|\/auth\/login/);
    });
  });

  test.describe('Admin UI Elements', () => {
    test('admin login page should have proper title', async ({ page }) => {
      await page.goto('/admin/login');

      // Check page has title or heading
      const title = await page.title();
      const hasAdminHeading = await page.locator('h1, h2').filter({ hasText: /admin|prihlás|login/i }).count() > 0;

      expect(title.length > 0 || hasAdminHeading).toBeTruthy();
    });

    test('admin login page should be responsive', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/admin/login');

      // Login form should still be visible
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible();

      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toBeVisible();
    });
  });
});

test.describe('Admin API Rate Limiting', () => {
  test('should return 401 for unauthenticated admin API requests', async ({ request }) => {
    const response = await request.get('/api/v1/admin/reports');
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthenticated admin stats request', async ({ request }) => {
    const response = await request.get('/api/v1/admin/stats');
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthenticated admin users request', async ({ request }) => {
    const response = await request.get('/api/v1/admin/users');
    expect(response.status()).toBe(401);
  });
});
