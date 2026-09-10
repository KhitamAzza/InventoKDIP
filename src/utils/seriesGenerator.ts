import { SeriesBreakdown } from '../types';

/**
 * Format a Date or date string (YYYY-MM-DD) into YYMMDD
 * Example: '2026-09-09' -> '260909'
 */
export function formatDateToYYMMDD(dateInput?: string | Date): string {
  let d: Date;
  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === 'string') {
    // If it's already YYYY-MM-DD
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      const year = parts[0].slice(-2);
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}${month}${day}`;
    }
    d = new Date(dateInput);
  } else {
    d = dateInput;
  }

  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/**
 * Generate 2 random uppercase alphabets (A-Z)
 */
export function generateRandomTwoLetters(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const c1 = chars.charAt(Math.floor(Math.random() * chars.length));
  const c2 = chars.charAt(Math.floor(Math.random() * chars.length));
  return `${c1}${c2}`;
}

/**
 * Generate equipment series number:
 * Format: INV.{2Letters}{3DigitsIncrement}.{YYMMDD}
 * Example: INV.AE001.260909
 */
export function generateSeriesNumber(
  dateInput?: string | Date,
  incrementCounter: number = 1,
  forcedLetters?: string
): { seriesNumber: string; breakdown: SeriesBreakdown } {
  const prefix = 'INV';
  const letters = forcedLetters ? forcedLetters.toUpperCase().slice(0, 2) : generateRandomTwoLetters();
  const counterStr = String(incrementCounter).padStart(3, '0').slice(-3);
  const tag = `${letters}${counterStr}`;
  const dateCode = formatDateToYYMMDD(dateInput);
  const fullCode = `${prefix}.${tag}.${dateCode}`;

  return {
    seriesNumber: fullCode,
    breakdown: {
      prefix,
      tag,
      letters,
      counter: counterStr,
      dateCode,
      fullCode,
    },
  };
}

/**
 * Parse an existing series number to extract its components
 */
export function parseSeriesNumber(seriesNumber: string): SeriesBreakdown | null {
  const clean = seriesNumber.trim().toUpperCase();
  const regex = /^(INV)\.([A-Z]{2})(\d{3})\.(\d{6})$/;
  const match = clean.match(regex);

  if (!match) return null;

  const [, prefix, letters, counter, dateCode] = match;
  return {
    prefix,
    tag: `${letters}${counter}`,
    letters,
    counter,
    dateCode,
    fullCode: clean,
  };
}
