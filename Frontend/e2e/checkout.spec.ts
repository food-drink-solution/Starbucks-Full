import { test, expect } from '@playwright/test';

/**
 * Cart & checkout tests. The cart drawer (CartTrigger / CartDrawer) and the
 * checkout page share the zustand store persisted under `starbucks-cart`.
 * Menu data comes from the backend API through the vite proxy.
 */
test.describe('Cart & Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed the cookie-consent decision so the fixed-bottom banner
    // never renders and never intercepts pointer events on drawer controls
    await page.addInitScript(() =>
      localStorage.setItem('starbucks_cookie_consent', 'declined'),
    );
    await page.goto('/en/menu');
    await expect(page.getByTestId('menu-item').first()).toBeVisible({
      timeout: 20_000,
    });
    // Add the first item via the quick-add control
    await page
      .getByTestId('menu-item')
      .first()
      .getByRole('button', { name: /add to cart/i })
      .click();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const raw = window.localStorage.getItem('starbucks-cart');
          if (!raw) return 0;
          try {
            return JSON.parse(raw)?.state?.items?.length ?? 0;
          } catch {
            return 0;
          }
        }),
      { timeout: 10_000 })
      .toBeGreaterThan(0);
  });

  async function openCart(page: import('@playwright/test').Page) {
    await page.getByRole('button', { name: 'Cart', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Cart', level: 2 })).toBeVisible();
  }

  test('cart drawer lists the added item', async ({ page }) => {
    await openCart(page);
    // The drawer shows the item count and the persisted item
    const itemCount = await page.evaluate(() => {
      const raw = window.localStorage.getItem('starbucks-cart');
      if (!raw) return 0;
      try {
        return JSON.parse(raw)?.state?.items?.length ?? 0;
      } catch {
        return 0;
      }
    });
    expect(itemCount).toBeGreaterThan(0);
    // Each cart entry is rendered with a remove control
    await expect(
      page.getByRole('button', { name: /remove/i }).first(),
    ).toBeVisible();
  });

  test('updates item quantity from the drawer', async ({ page }) => {
    await openCart(page);
    const before = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('starbucks-cart') || '{}')?.state?.total ?? 0,
    );
    // Increase quantity with the labeled plus control
    await page.getByRole('button', { name: /increase quantity/i }).first().click();
    await expect
      .poll(async () =>
        page.evaluate(() =>
          JSON.parse(window.localStorage.getItem('starbucks-cart') || '{}')?.state?.total ?? 0,
        ),
      )
      .toBeGreaterThan(before);
  });

  test('removes an item from the cart', async ({ page }) => {
    await openCart(page);
    await page.getByRole('button', { name: /remove/i }).first().click();
    await expect(page.getByText(/your bag is empty/i)).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const raw = window.localStorage.getItem('starbucks-cart');
          if (!raw) return 0;
          try {
            return JSON.parse(raw)?.state?.items?.length ?? 0;
          } catch {
            return 0;
          }
        }),
      )
      .toBe(0);
  });

  test('applies the SAVE10 discount code', async ({ page }) => {
    await openCart(page);
    // The discount input accepts SAVE10 / SAVE20
    const promoInput = page.getByPlaceholder(/promo code/i);
    await promoInput.fill('SAVE10');
    await page.getByRole('button', { name: /apply/i }).click();
    await expect(page.getByText(/discount applied/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('rejects an invalid discount code with an error message', async ({ page }) => {
    await openCart(page);
    const promoInput = page.getByPlaceholder(/promo code/i);
    await promoInput.fill('NOT_A_CODE');
    await page.getByRole('button', { name: /apply/i }).click();
    await expect(page.getByText(/invalid code/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to checkout from the cart drawer', async ({ page }) => {
    await openCart(page);
    await page.getByRole('button', { name: 'Checkout', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/checkout$/);
    // With items in the bag the checkout page renders the order flow
    await expect(
      page.getByRole('button', { name: /place order/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('checkout shows the empty state without items', async ({ page }) => {
    // Drain the cart that beforeEach created
    await page.evaluate(() => {
      const raw = window.localStorage.getItem('starbucks-cart');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      parsed.state.items = [];
      window.localStorage.setItem('starbucks-cart', JSON.stringify(parsed));
    });
    await page.goto('/en/checkout');
    await expect(
      page.getByText(/your (bag|cart) is empty/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
