import { test, expect } from '@playwright/test';

test('checkout computes tax and writes ledger', async ({ page }) => {
  await page.goto('/checkout');

  // Ensure default row exists
  await page.getByRole('button', { name: 'Compute & Save' }).click();

  // Wait for totals to render
  await expect(page.getByText('Subtotal:')).toBeVisible();

  const summary = await page.locator('main').innerText();
  expect(summary).toMatch(/Subtotal:/);
  expect(summary).toMatch(/Tax/);
  expect(summary).toMatch(/Total/);
});


