import { test, expect } from '@playwright/test';

/**
 * Menu page tests — data comes from the backend API (seeded catalog),
 * served through the vite dev-server proxy. Assertions are count-agnostic
 * so they stay valid as the seeded catalog evolves.
 */
test.describe('Menu Page', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed the cookie-consent decision so the fixed-bottom banner
    // never renders and never intercepts pointer events on cards
    await page.addInitScript(() =>
      localStorage.setItem('starbucks_cookie_consent', 'declined'),
    );
    await page.goto('/en/menu');
    // Menu items are API-driven; wait for the first card to render
    await expect(page.getByTestId('menu-item').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('displays menu categories', async ({ page }) => {
    const categories = page.getByTestId('category-item');
    await expect(categories.first()).toBeVisible();
    expect(await categories.count()).toBeGreaterThan(0);
  });

  test('displays menu items with name and price', async ({ page }) => {
    const firstItem = page.getByTestId('menu-item').first();
    // Every card shows a price in EGP
    await expect(firstItem).toContainText(/EGP/);
    // Every card has an accessible name (the item title)
    const name = await firstItem.getAttribute('aria-label');
    expect(name, 'menu item should have an aria-label title').toBeTruthy();
  });

  test('opens item details from a card', async ({ page }) => {
    await page.getByTestId('menu-item').first().click();
    const details = page.getByTestId('item-details');
    await expect(details).toBeVisible();
  });

  test('adds an item to the cart from the card', async ({ page }) => {
    const firstItem = page.getByTestId('menu-item').first();
    await firstItem.getByRole('button', { name: /add to cart/i }).click();

    // The cart store persists the added item
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const raw = window.localStorage.getItem('starbucks-cart');
          if (!raw) return null;
          try {
            return JSON.parse(raw)?.state?.items?.length ?? 0;
          } catch {
            return 0;
          }
        }),
      )
      .toBeGreaterThan(0);
  });

  test('keyboard activation opens item details', async ({ page }) => {
    const firstItem = page.getByTestId('menu-item').first();
    await firstItem.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('item-details')).toBeVisible();
  });
});
