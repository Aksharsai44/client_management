export interface UniversalCurrency {
  code: string;
  symbol: string;
  name: string;
  rateFromUSD: number; // Rates relative to 1 USD
}

export const UNIVERSAL_CURRENCIES: UniversalCurrency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateFromUSD: 86.5 },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateFromUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateFromUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateFromUSD: 0.79 },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', rateFromUSD: 3.67 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)', rateFromUSD: 1.38 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', rateFromUSD: 1.54 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', rateFromUSD: 1.35 },
];

export const getCurrencyConfig = (code?: string): UniversalCurrency => {
  const match = UNIVERSAL_CURRENCIES.find((c) => c.code.toUpperCase() === (code || 'INR').toUpperCase());
  return match || UNIVERSAL_CURRENCIES[0];
};

/**
 * Format price according to target currency and plan base currency.
 * If target matches base currency, returns exact amount.
 * Otherwise converts dynamically using exchange rate.
 */
export const formatUniversalPrice = (
  amount: number,
  targetCurrencyCode: string = 'INR',
  baseCurrencyCode: string = 'INR'
): { symbol: string; formatted: string; amount: number } => {
  const target = getCurrencyConfig(targetCurrencyCode);
  const base = getCurrencyConfig(baseCurrencyCode);

  let converted = amount;
  if (target.code !== base.code) {
    // Convert to USD first, then to target currency
    const amountInUSD = amount / base.rateFromUSD;
    converted = Math.round(amountInUSD * target.rateFromUSD);
  }

  // Format with commas based on locale (e.g. 1,00,000 for INR or 100,000 for USD)
  const formattedNumber = converted.toLocaleString(target.code === 'INR' ? 'en-IN' : 'en-US');

  return {
    symbol: target.symbol,
    formatted: `${target.symbol}${formattedNumber}`,
    amount: converted,
  };
};
