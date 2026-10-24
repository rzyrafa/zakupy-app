export const UNITS = ['', 'g', 'kg', 'ml', 'l', 'szt', 'łyżka', 'łyżeczka', 'szklanka', 'opak.', 'szczypta', 'ząbek'];

/** "1,5" / "1.5" -> 1.5; puste lub niepoprawne -> null */
export function parseQuantity(text: string): number | null {
  const value = parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** 1.5 -> "1,5" (polski zapis, max 2 miejsca po przecinku) */
export function formatQuantity(value: number | null): string {
  if (value == null) return '';
  return String(Math.round(value * 100) / 100).replace('.', ',');
}

export function formatAmount(quantity: number | null, unit: string): string {
  return [formatQuantity(quantity), unit].filter(Boolean).join(' ');
}

/** Polska odmiana po liczbie: plural(1, 'składnik', 'składniki', 'składników') -> "składnik" */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}

export const ingredientsLabel = (n: number) => `${n} ${plural(n, 'składnik', 'składniki', 'składników')}`;
export const servingsWord = (n: number) => plural(n, 'porcja', 'porcje', 'porcji');
