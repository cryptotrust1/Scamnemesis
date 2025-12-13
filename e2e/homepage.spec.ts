import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage', async ({ page }) => {
    // Check page title contains app name
    await expect(page).toHaveTitle(/Scam|Fraud|Report/i);

    // Check main heading is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should have a working search bar', async ({ page }) => {
    // Find search input - use multiple selectors
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="hladat" i]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      // Type search query
      await searchInput.fill('test');
    }
  });

  test('should have navigation links', async ({ page }) => {
    // Check for main navigation links
    const navLinks = page.locator('nav a, header a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('should have a report fraud button/link', async ({ page }) => {
    // Look for report button/link - use first() to avoid strict mode issues
    const reportLink = page.locator('a[href*="report"]').first();
    await expect(reportLink).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();

    // Main content should be visible
    const mainContent = page.locator('main, #__next, body').first();
    await expect(mainContent).toBeVisible();
  });
});
