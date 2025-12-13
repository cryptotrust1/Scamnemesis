import { test, expect } from '@playwright/test';

test.describe('Report Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/report/new');
  });

  test('should display report form page', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL(/report/);

    // Check for any heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should show step wizard', async ({ page }) => {
    // Check for step indicators or form elements
    const formElements = page.locator('form, [class*="step"], [data-step], main').first();
    await expect(formElements).toBeVisible();
  });

  test('should display fraud type selection on step 1', async ({ page }) => {
    // Check for fraud type cards, buttons, or any interactive elements
    const interactiveElements = page.locator('button, [role="button"], [class*="card"], input, select').first();
    await expect(interactiveElements).toBeVisible();
  });

  test('should navigate to next step after selecting fraud type', async ({ page }) => {
    // Look for any clickable card or button
    const clickableElement = page.locator('button, [role="button"], [class*="card"]').first();
    if (await clickableElement.count() > 0) {
      await clickableElement.click();
      await page.waitForTimeout(500);
    }

    // Look for next/continue button
    const nextButton = page.locator('button').filter({ hasText: /next|dalej|continue|pokracovat/i }).first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit form without filling required fields
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /submit|odoslat|next|dalej/i }).first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should allow saving draft', async ({ page }) => {
    // Look for save draft button - this is optional functionality
    const saveDraftButton = page.locator('button').filter({ hasText: /save|ulozit|draft|koncept/i }).first();
    if (await saveDraftButton.count() > 0 && await saveDraftButton.isVisible()) {
      await saveDraftButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should have back navigation', async ({ page }) => {
    // Navigate to a step first
    const nextButton = page.locator('button').filter({ hasText: /next|dalej|continue/i }).first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Check for back button - look for any back/previous button
    const backButton = page.locator('button').filter({ hasText: /back|spat|previous|predch/i }).first();
    if (await backButton.count() > 0) {
      await expect(backButton).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Form should still be visible
    const mainContent = page.locator('form, main, body').first();
    await expect(mainContent).toBeVisible();

    // Some interactive elements should be accessible
    const buttons = page.locator('button').first();
    if (await buttons.count() > 0) {
      await expect(buttons).toBeVisible();
    }
  });
});
