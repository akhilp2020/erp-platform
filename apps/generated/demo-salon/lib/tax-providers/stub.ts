import type { TaxProvider } from '../tax-adapter';
const BASE = 0.0725; // CA baseline 7.25%
const ZIP_OVERRIDES: Record<string, number> = {
  "94086": 0.0925, // Sunnyvale demo
  "94103": 0.0875  // SF demo
};
export const stubProvider: TaxProvider = {
  name: 'stub',
  rateFor(zip?: string) {
    if (zip && ZIP_OVERRIDES[zip] != null) return ZIP_OVERRIDES[zip];
    return BASE;
  }
};
