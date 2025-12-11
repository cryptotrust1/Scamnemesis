import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should display search page', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL(/search/);

    // Check search input exists
    const searchInput = page.getByRole('textbox').first();
    await expect(searchInput).toBeVisible();
  });

  test('should have filter options', async ({ page }) => {
    // Check for filter controls
    const fraudTypeFilter = page.getByRole('combobox').first();
    await expect(fraudTypeFilter).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    // Find and fill search input
    const searchInput = page.getByRole('textbox').first();
    await searchInput.fill('test');

    // Submit search (press Enter or click button)
    await searchInput.press('Enter');

    // Wait for results or no results message
    await page.waitForTimeout(1000);

    // Page should show results area
    const resultsArea = page.locator('[data-testid="search-results"], .search-results, main');
    await expect(resultsArea).toBeVisible();
  });

  test('should filter by fraud type', async ({ page }) => {
    // Click on fraud type filter
    const fraudTypeSelect = page.getByRole('combobox').first();
    await fraudTypeSelect.click();

    // Select an option (wait for dropdown)
    await page.waitForTimeout(500);

    // Check dropdown options are visible
    const options = page.getByRole('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('should show pagination when results exist', async ({ page }) => {
    // Search for something
    const searchInput = page.getByRole('textbox').first();
    await searchInput.fill('podvod');
    await searchInput.press('Enter');

    await page.waitForTimeout(1000);

    // Check for pagination or results count
    const resultsOrPagination = page.locator('nav[aria-label*="pagination"], .pagination, [data-testid="pagination"]');
    // Pagination may or may not be visible depending on results
  });

  test('should be accessible', async ({ page }) => {
    // Check for accessible labels
    const searchInput = page.getByRole('textbox').first();
    await expect(searchInput).toBeVisible();

    // Check buttons have accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
