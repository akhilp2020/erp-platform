import { getTaxProvider, calcTax } from './tax-adapter';

test('selects table provider by env', () => {
  process.env.TAX_PROVIDER = 'table';
  const p = getTaxProvider();
  expect(p.name).toBe('table');
  expect(p.rateFor('94086')).toBeCloseTo(0.0925);
});

test('calcTax uses selected provider', () => {
  process.env.TAX_PROVIDER = 'stub';
  const r = calcTax({ subtotal: 100, zip: '94086' });
  expect(r.rate).toBeCloseTo(0.0925); // overridden
  expect(r.tax).toBeCloseTo(9.25);
});
