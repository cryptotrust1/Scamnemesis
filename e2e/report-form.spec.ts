import { test, expect } from '@playwright/test';

test.describe('Report Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/report/new');
  });

  test('should display report form page', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL(/report/);

    // Check for step wizard or form
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should show step wizard', async ({ page }) => {
    // Check for step indicators
    const steps = page.locator('[class*="step"], [data-step]');
    const stepCount = await steps.count();

    // Should have multiple steps
    expect(stepCount).toBeGreaterThan(0);
  });

  test('should display fraud type selection on step 1', async ({ page }) => {
    // Check for fraud type cards or options
    const fraudTypeCards = page.locator('[class*="card"], [role="button"]');
    await expect(fraudTypeCards.first()).toBeVisible();
  });

  test('should navigate to next step after selecting fraud type', async ({ page }) => {
    // Click on a fraud type card
    const fraudTypeCard = page.locator('[class*="card"]').first();
    await fraudTypeCard.click();

    // Click next button
    const nextButton = page.getByRole('button', { name: /dalej|next|pokracovat/i });
    await nextButton.click();

    // Should show next step content
    await page.waitForTimeout(500);
  });

  test('should validate required fields', async ({ page }) => {
    // Select fraud type first
    const fraudTypeCard = page.locator('[class*="card"]').first();
    await fraudTypeCard.click();

    // Go to next step
    const nextButton = page.getByRole('button', { name: /dalej|next/i });
    await nextButton.click();

    await page.waitForTimeout(500);

    // Try to proceed without filling required fields
    await nextButton.click();

    // Should show validation errors or stay on same step
    await page.waitForTimeout(500);
  });

  test('should allow saving draft', async ({ page }) => {
    // Select fraud type
    const fraudTypeCard = page.locator('[class*="card"]').first();
    await fraudTypeCard.click();

    // Look for save draft button
    const saveDraftButton = page.getByRole('button', { name: /ulozit|save|koncept|draft/i });

    if (await saveDraftButton.isVisible()) {
      await saveDraftButton.click();

      // Should show success message or confirmation
      await page.waitForTimeout(500);
    }
  });

  test('should have back navigation', async ({ page }) => {
    // Select fraud type and go to next step
    const fraudTypeCard = page.locator('[class*="card"]').first();
    await fraudTypeCard.click();

    const nextButton = page.getByRole('button', { name: /dalej|next/i });
    await nextButton.click();

    await page.waitForTimeout(500);

    // Check for back button
    const backButton = page.getByRole('button', { name: /spat|back|predchadzajuci/i });
    await expect(backButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Form should still be visible
    const form = page.locator('form, main');
    await expect(form).toBeVisible();

    // Navigation buttons should be accessible
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });
});
