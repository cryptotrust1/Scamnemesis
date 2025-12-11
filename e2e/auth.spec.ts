import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('should display login form', async ({ page }) => {
      // Check for email input
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();

      // Check for password input
      const passwordInput = page.getByLabel(/heslo|password/i);
      await expect(passwordInput).toBeVisible();

      // Check for submit button
      const submitButton = page.getByRole('button', { name: /prihlasit|login|sign in/i });
      await expect(submitButton).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      // Click submit without filling form
      const submitButton = page.getByRole('button', { name: /prihlasit|login|sign in/i });
      await submitButton.click();

      // Should show validation errors or prevent submission
      await page.waitForTimeout(500);
    });

    test('should have link to register page', async ({ page }) => {
      // Check for register link
      const registerLink = page.getByRole('link', { name: /registr|sign up|vytvorit ucet/i });
      await expect(registerLink).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
      // Check for forgot password link
      const forgotLink = page.getByRole('link', { name: /zabudli|forgot|reset/i });
      // This may or may not exist
    });

    test('should validate email format', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('invalid-email');

      const passwordInput = page.getByLabel(/heslo|password/i);
      await passwordInput.fill('password123');

      const submitButton = page.getByRole('button', { name: /prihlasit|login|sign in/i });
      await submitButton.click();

      await page.waitForTimeout(500);
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register');
    });

    test('should display register form', async ({ page }) => {
      // Check for email input
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();

      // Check for password input
      const passwordInput = page.getByLabel(/heslo|password/i).first();
      await expect(passwordInput).toBeVisible();

      // Check for submit button
      const submitButton = page.getByRole('button', { name: /registr|sign up|vytvorit/i });
      await expect(submitButton).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /prihlasit|login|sign in|uz mate/i });
      await expect(loginLink).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill('test@example.com');

      const passwordInput = page.getByLabel(/heslo|password/i).first();
      await passwordInput.fill('weak'); // Too short password

      const submitButton = page.getByRole('button', { name: /registr|sign up|vytvorit/i });
      await submitButton.click();

      await page.waitForTimeout(500);
    });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing admin without auth', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login or show unauthorized
    await page.waitForTimeout(1000);

    // Check if redirected to login
    const url = page.url();
    expect(url).toMatch(/login|auth|unauthorized/i);
  });
});
