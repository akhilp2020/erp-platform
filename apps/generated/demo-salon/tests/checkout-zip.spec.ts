import { test, expect } from '@playwright/test';

test('ZIP override affects tax and total (adaptive tip)', async ({ page }) => {
  await page.goto('/checkout');

  // One $100 line item
  await page.getByRole('textbox', { name: /Item name/i }).first().fill('Demo Item');
  const amountInputs = await page.getByPlaceholder('Amount').all();
  await amountInputs[0].fill('100');

  // Try to detect/edit tip if there is a visible input
  const tipByLabel = page.getByLabel(/Tip/i);
  const tipByPlaceholder = page.getByPlaceholder(/Tip|%/i);
  const tipLocator = tipByLabel.or(tipByPlaceholder);
  const hasTip = (await tipLocator.count()) > 0;

  let tipEnteredPct: number | null = null;
  if (hasTip) {
    let v = '';
    try { v = await tipLocator.first().inputValue(); } catch { v = ''; }
    if (!v || Number.isNaN(Number(v))) {
      await tipLocator.first().fill('10'); // normalize to 10% so expectation is deterministic
      tipEnteredPct = 10;
    } else {
      tipEnteredPct = parseFloat(v);
    }
  }

  // ZIP with 9.25% in our provider
  await page.getByLabel('ZIP (optional)').fill('94086');

  // Intercept the checkout POST and assert from source of truth
  const respPromise = page.waitForResponse(r => r.url().includes('/api/checkout') && r.request().method() === 'POST');
  await page.getByRole('button', { name: /Compute & Save/i }).click();
  const resp = await respPromise;
  const data = await resp.json();

  const subtotal = Number(data?.summary?.subtotal);
  const tax      = Number(data?.summary?.tax);
  const total    = Number(data?.summary?.total);
  const rate     = Number(data?.summary?.rate);
  const tipApi   = data?.summary?.tip;  // may be undefined if API doesn’t include it

  // Baselines
  expect(subtotal).toBeCloseTo(100.0, 2);
  expect(rate).toBeGreaterThan(0.09); expect(rate).toBeLessThan(0.095);
  expect(tax).toBeCloseTo(9.25, 2);

  // Compare totals with flexible tip handling
  const tipInferred = Math.round((total - (subtotal + tax)) * 100) / 100;

  if (hasTip) {
    // UI had a tip input: assert exact math based on what we set/read
    const pct = tipEnteredPct ?? 10; // if unreadable, assume 10 (we filled it)
    const expectedTip = Math.round(subtotal * (pct / 100) * 100) / 100;
    expect(tipInferred).toBeCloseTo(expectedTip, 2);
  } else if (typeof tipApi === 'number') {
    // No tip input, but API reports a tip → assert with API value
    expect(tipInferred).toBeCloseTo(tipApi, 2);
  } else {
    // No tip input and no API tip → just ensure total is sane (>= subtotal+tax)
    expect(tipInferred).toBeGreaterThanOrEqual(0);
    // Optional: cap tip at 30% to catch wild values
    expect(tipInferred).toBeLessThanOrEqual(30);
  }

  // Basic UX check
  await expect(page.getByText(/Total:/)).toBeVisible();
});