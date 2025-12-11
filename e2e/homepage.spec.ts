import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Scamnemesis/i);

    // Check main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have a working search bar', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/hladat|search|zadajte/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('test podvod');

    // Check search button exists
    const searchButton = page.getByRole('button', { name: /hladat|search|vyhladat/i });
    await expect(searchButton).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    // Check for main navigation links
    const navLinks = page.locator('nav a, header a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('should have a report fraud button/link', async ({ page }) => {
    // Look for report button
    const reportLink = page.getByRole('link', { name: /nahlasit|report/i });
    await expect(reportLink).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();

    // Search should still work
    const searchInput = page.getByPlaceholder(/hladat|search|zadajte/i);
    await expect(searchInput).toBeVisible();
  });
});
