export const MAX_VND_AMOUNT = 1_000_000_000_000;

export function parseVndAmount(value: string): number | null {
  const compact = value.trim().replace(/[\s₫đĐ]/g, '');
  if (!/^\d+$|^\d{1,3}(?:[.,]\d{3})+$/.test(compact)) return null;

  const digits = compact.replace(/[.,]/g, '');
  const amount = Number(digits);
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_VND_AMOUNT
    ? amount
    : null;
}

export function sumVndAmounts(amounts: readonly number[]): bigint {
  return amounts.reduce((total, amount) => {
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_VND_AMOUNT) {
      throw new RangeError('VND amount must be a non-negative safe integer within the supported limit.');
    }
    return total + BigInt(amount);
  }, 0n);
}

export function formatVndAmount(amount: number | bigint): string {
  if (typeof amount === 'number' && (!Number.isSafeInteger(amount) || amount < 0)) {
    throw new RangeError('VND amount must be a non-negative safe integer.');
  }
  const exactAmount = typeof amount === 'bigint' ? amount : BigInt(amount);
  const grouped = exactAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped} ₫`;
}

export function formatVndInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatPercentChange(basisPoints: number): string {
  if (!Number.isSafeInteger(basisPoints)) {
    throw new RangeError('Percent change must be provided as integer basis points.');
  }
  const absoluteValue = Math.abs(basisPoints);
  const wholePercent = Math.floor(absoluteValue / 100);
  const fraction = String(absoluteValue % 100).padStart(2, '0').replace(/0+$/, '');
  const arrow = basisPoints < 0 ? '↓' : '↑';
  return `${arrow} ${wholePercent}${fraction ? `,${fraction}` : ''}%`;
}
