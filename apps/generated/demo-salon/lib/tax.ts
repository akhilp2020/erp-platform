export type TaxInput = {
  subtotal: number;   // pre-tax, before tip
  zip?: string;       // optional, for overrides later
};
export type TaxResult = {
  rate: number;       // e.g., 0.0725
  tax: number;        // rounded to cents
};

const BASE_CA_RATE = 0.0725; // CA statewide baseline

// Optional: add a couple of overrides if you want to demo (fake or real)
const ZIP_OVERRIDES: Record<string, number> = {
  // "94086": 0.0925, // example
};

export function calcCaTax(input: TaxInput): TaxResult {
  const rate = input.zip && ZIP_OVERRIDES[input.zip] != null
    ? ZIP_OVERRIDES[input.zip]
    : BASE_CA_RATE;

  const tax = round2(input.subtotal * rate);
  return { rate, tax };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}


