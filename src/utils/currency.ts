export function formatUSD(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatUSDPlain(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return value.toFixed(2);
}

export function parseNumber(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}
