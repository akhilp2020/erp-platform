export type TaxInput = { subtotal: number; zip?: string };
export type TaxResult = { rate: number; tax: number };

export interface TaxProvider {
  name: string;
  rateFor(zip?: string): number; // decimal: 0.0725
}

// env: TAX_PROVIDER = "stub" | "table"
export function getTaxProvider(): TaxProvider {
  const prov = (process.env.TAX_PROVIDER || 'stub').toLowerCase();
  if (prov === 'table') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { tableProvider } = require('./tax-providers/table');
    return tableProvider;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { stubProvider } = require('./tax-providers/stub');
  return stubProvider;
}

export function calcTax(input: TaxInput): TaxResult {
  const p = getTaxProvider();
  const rate = p.rateFor(input.zip);
  const tax = round2(input.subtotal * rate);
  return { rate, tax };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
