/* Formatting helpers used across pages. Deterministic, no Intl surprises in snapshots. */

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export function withCommas(n: number): string {
  return n.toLocaleString('en-US');
}

export function pct(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.35],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ];
  let value = diff;
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  for (const [u, step] of units) {
    unit = u;
    if (Math.abs(value) < step) break;
    value = value / step;
  }
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 45) return rtf.format(Math.round(diff), 'second');
  return rtf.format(Math.round(value), unit);
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function monthLabel(monthISO: string): string {
  const d = new Date(`${monthISO}-01T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

export function readingLabel(minutes: number): string {
  return minutes <= 1 ? '1 min read' : `${minutes} min read`;
}

export function pluralise(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function deltaLabel(current: number, previous: number, unit = '%'): string {
  const diff = current - previous;
  const sign = diff >= 0 ? '+' : '−';
  return `${sign}${Math.abs(diff).toFixed(unit === '%' ? 1 : 0)}${unit}`;
}

/** Fisher–Yates, non-mutating. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function groupBy<T, K extends string>(items: readonly T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ||= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function average(values: readonly number[]): number {
  return values.length ? sum(values) / values.length : 0;
}

export function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

/** Deliberately permissive: the demo never sends mail, it only refuses obvious nonsense. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
