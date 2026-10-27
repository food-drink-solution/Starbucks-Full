import { test, expect } from '@playwright/test';

/**
 * Authentication flow tests.
 *
 * The API seeds demo users on startup in Development (see
 * IdentityDataSeeder.SeedTestUsersAsync): customer@test.com,
 * employee@test.com and manager@test.com — all with password
 * `Test@123456`. The login form posts to /api/v1/Auth/login through the
 * vite dev-server proxy.
 */
const DEMO_USER = {
  email: 'customer@test.com',
  password: 'Test@123456',
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed the cookie-consent decision so the fixed-bottom banner
    // never renders and never intercepts pointer events on the navbar
    await page.addInitScript(() =>
      localStorage.setItem('starbucks_cookie_consent', 'declined'),
    );
    await page.goto('/');
  });

  test('opens the login modal from the navbar', async ({ page }) => {
    const authTrigger = page.getByTestId('auth-trigger-button');
    await expect(authTrigger).toBeVisible();
    await authTrigger.click();

    // The auth modal contains the login form
    const emailInput = page.locator('#login-email');
    await expect(emailInput).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('logs in with valid seeded credentials', async ({ page }) => {
    await page.getByTestId('auth-trigger-button').click();

    const loginResponse = page.waitForResponse(
      (res) => res.url().includes('/api/v1/Auth/login') && res.request().method() === 'POST',
      { timeout: 15_000 },
    );

    await page.locator('#login-email').fill(DEMO_USER.email);
    await page.locator('#login-password').fill(DEMO_USER.password);
    await page.locator('button[type="submit"]').click();

    const response = await loginResponse;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.accessToken).toBeTruthy();

    // The auth store persists the session
    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem('auth_token')),
      )
      .toBeTruthy();
    const authState = await page.evaluate(() => {
      const raw = window.localStorage.getItem('auth-storage');
      if (!raw) return null;
      try {
        return JSON.parse(raw)?.state ?? null;
      } catch {
        return null;
      }
    });
    expect(authState?.isAuthenticated).toBe(true);

    // Modal closes after successful login
    await expect(page.locator('#login-email')).toBeHidden();
  });

  test('shows an error message for invalid credentials', async ({ page }) => {
    await page.getByTestId('auth-trigger-button').click();

    await page.locator('#login-email').fill(DEMO_USER.email);
    await page.locator('#login-password').fill('WrongPassword1!');
    await page.locator('button[type="submit"]').click();

    // The modal surfaces the API error in an alert region
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 15_000 });

    // Session was not created
    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  test('navbar switches to the account link once authenticated', async ({ page }) => {
    await page.getByTestId('auth-trigger-button').click();
    await page.locator('#login-email').fill(DEMO_USER.email);
    await page.locator('#login-password').fill(DEMO_USER.password);
    await page.locator('button[type="submit"]').click();

    // Unauthenticated users see the trigger button; authenticated users
    // see a link to their profile instead (no dropdown menu exists).
    const accountLink = page.locator('a[href$="/account/profile"]');
    await expect(accountLink).toBeVisible({ timeout: 15_000 });
  });
});
