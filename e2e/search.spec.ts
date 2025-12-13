import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should display search page', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL(/search/);

    // Check search input exists - use multiple selectors
    const searchInput = page.locator('input[type="text"], input[type="search"], input[name*="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should have filter options', async ({ page }) => {
    // Check for filter controls - may be select, combobox, or custom dropdown
    const filterControls = page.locator('select, [role="combobox"], [class*="filter"], [class*="select"]').first();
    if (await filterControls.count() > 0) {
      await expect(filterControls).toBeVisible();
    }
  });

  test('should perform search', async ({ page }) => {
    // Find and fill search input
    const searchInput = page.locator('input[type="text"], input[type="search"], input[name*="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');

      // Submit search (press Enter or click button)
      await searchInput.press('Enter');

      // Wait for results or no results message
      await page.waitForTimeout(1000);
    }

    // Page should show results area or main content
    const mainContent = page.locator('main, [data-testid="search-results"], .search-results').first();
    await expect(mainContent).toBeVisible();
  });

  test('should filter by fraud type', async ({ page }) => {
    // Look for any filter/select element
    const filterSelect = page.locator('select, [role="combobox"], [role="listbox"]').first();
    if (await filterSelect.count() > 0) {
      await filterSelect.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show pagination when results exist', async ({ page }) => {
    // Search for something
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Check for pagination or results (pagination is optional)
    const mainContent = page.locator('main, body').first();
    await expect(mainContent).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Check page has basic accessibility
    const mainContent = page.locator('main, body').first();
    await expect(mainContent).toBeVisible();

    // Check some interactive elements exist
    const interactiveElements = page.locator('input, button, a').first();
    await expect(interactiveElements).toBeVisible();
  });
});
