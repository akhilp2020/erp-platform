import { calcCaTax } from './tax';

test('calcCaTax baseline', () => {
  const r = calcCaTax({ subtotal: 100 });
  expect(r.rate).toBeCloseTo(0.0725);
  expect(r.tax).toBeCloseTo(7.25);
});


