/**
 * Colour maths and token reading. No component hardcodes a hex: SVG fills use
 * `var(--token)` and anything that needs a numeric value reads it back out of
 * the stylesheet here.
 */

/** Reads a CSS custom property from the document root, e.g. `var(--btc-ink)`. */
export function cssVarValue(token: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

/** Accepts `#rgb`, `#rrggbb` or `rgb()`/`rgba()` output from the browser. */
export function parseColour(value: string): [number, number, number] | null {
  const hex = value.trim().match(/^#?([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const body = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [
      parseInt(body.slice(0, 2), 16) / 255,
      parseInt(body.slice(2, 4), 16) / 255,
      parseInt(body.slice(4, 6), 16) / 255,
    ];
  }
  const rgb = value.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const [r, g, b] = rgb[1].split(',').map((part) => parseFloat(part) / 255);
    return [r, g, b];
  }
  return null;
}

/** WCAG relative luminance. */
export function luminance(value: string): number {
  const rgb = parseColour(value);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** AA verdict for body text, which needs 4.5:1. */
export function passesAA(ratio: number): boolean {
  return ratio >= 4.5;
}
