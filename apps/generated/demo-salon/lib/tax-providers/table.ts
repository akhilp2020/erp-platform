import type { TaxProvider } from '../tax-adapter';
// Minimal demo table; replace with real data later
const TABLE: Record<string, number> = {
  "94086": 0.0925,
  "90001": 0.0950,
  "94103": 0.0875
};
const DEFAULT = 0.0725;
export const tableProvider: TaxProvider = {
  name: 'table',
  rateFor(zip?: string) {
    if (zip && TABLE[zip] != null) return TABLE[zip];
    return DEFAULT;
  }
};
