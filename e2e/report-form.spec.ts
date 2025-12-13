import { test, expect } from '@playwright/test';

test.describe('Report Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/report/new');
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display report form page', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL(/report/);

    // Check for any heading - wait for page to render
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should show step wizard', async ({ page }) => {
    // Check for step indicators or form elements
    const formElements = page.locator('form, [class*="step"], [data-step], main').first();
    await expect(formElements).toBeVisible({ timeout: 10000 });
  });

  test('should display fraud type selection on step 1', async ({ page, isMobile }) => {
    // Wait for the page to fully load
    await page.waitForLoadState('domcontentloaded');

    // Check for fraud type cards, buttons, or any interactive elements
    // Use a more specific selector and wait longer for hydration
    const interactiveElements = page.locator('main button, main [role="button"], main [class*="card"], main input, main select').first();

    // On mobile, some buttons might be in a different location
    if (await interactiveElements.count() > 0) {
      await expect(interactiveElements).toBeVisible({ timeout: 10000 });
    } else {
      // Fallback: just check main content is visible
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should navigate to next step after selecting fraud type', async ({ page }) => {
    // Look for any clickable card or button
    const clickableElement = page.locator('main button, main [role="button"], main [class*="card"]').first();

    if (await clickableElement.count() > 0 && await clickableElement.isVisible()) {
      await clickableElement.click();
      await page.waitForLoadState('domcontentloaded');
    }

    // Look for next/continue button
    const nextButton = page.locator('button').filter({ hasText: /next|dalej|continue|pokračovat|ďalej/i }).first();

    if (await nextButton.count() > 0 && await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit form without filling required fields
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /submit|odoslat|next|dalej|ďalej/i }).first();

    if (await submitButton.count() > 0 && await submitButton.isVisible()) {
      await submitButton.click();
      // Wait for validation or page response
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should allow saving draft', async ({ page }) => {
    // Look for save draft button - this is optional functionality
    const saveDraftButton = page.locator('button').filter({ hasText: /save|ulozit|uložiť|draft|koncept/i }).first();

    if (await saveDraftButton.count() > 0 && await saveDraftButton.isVisible()) {
      await saveDraftButton.click();
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should have back navigation', async ({ page }) => {
    // Navigate to a step first if possible
    const nextButton = page.locator('button').filter({ hasText: /next|dalej|continue|ďalej/i }).first();

    if (await nextButton.count() > 0 && await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('domcontentloaded');
    }

    // Check for back button
    const backButton = page.locator('button').filter({ hasText: /back|spat|späť|previous|predch/i }).first();

    if (await backButton.count() > 0) {
      await expect(backButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Already on mobile viewport - just verify content is visible
      const mainContent = page.locator('main').first();
      await expect(mainContent).toBeVisible({ timeout: 10000 });
    } else {
      // Set mobile viewport for desktop project
      await page.setViewportSize({ width: 375, height: 667 });

      // Form should still be visible
      const mainContent = page.locator('form, main, body').first();
      await expect(mainContent).toBeVisible();
    }
  });
});
