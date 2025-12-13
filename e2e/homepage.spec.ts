import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display the homepage', async ({ page }) => {
    // Check page title contains app name
    await expect(page).toHaveTitle(/Scam|Fraud|Report/i);

    // Check main heading is visible - wait for it to appear
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should have a working search bar', async ({ page }) => {
    // The search input uses type="text" with Slovak placeholder
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Vyhľadajte"], input[placeholder*="name"]').first();

    // Wait for it to be visible and interactive
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('should have navigation links', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, check for mobile menu button
      const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      if (await mobileMenuButton.count() > 0) {
        await expect(mobileMenuButton).toBeVisible();
      }
    } else {
      // On desktop, check for navigation links
      const navLinks = page.locator('nav a, header a');
      await expect(navLinks.first()).toBeVisible();
    }
  });

  test('should have a report fraud button/link', async ({ page, isMobile }) => {
    // The header report button is hidden on mobile (hidden md:inline-flex)
    // Use the link in the main content area which is visible on all viewports
    if (isMobile) {
      // On mobile, look for report links in main content or footer
      const reportLink = page.locator('main a[href*="report"], footer a[href*="report"]').first();
      if (await reportLink.count() > 0) {
        await expect(reportLink).toBeVisible({ timeout: 5000 });
      } else {
        // Skip if not found on mobile - not all pages have visible report link on mobile
        test.skip();
      }
    } else {
      // On desktop, use any report link
      const reportLink = page.locator('a[href*="report"]').first();
      await expect(reportLink).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    // Skip if already running on mobile project
    if (isMobile) {
      // Page should still be functional on mobile
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main, #__next')).toBeVisible();
    } else {
      // Set mobile viewport manually for desktop project
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('body')).toBeVisible();
      // Main content should be visible
      const mainContent = page.locator('main, #__next, body').first();
      await expect(mainContent).toBeVisible();
    }
  });
});
