import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { LANGUAGES } from '@/i18n/resources';
import type { LanguageCode } from '@/types';
import { cn } from '@/utils/cn';

/**
 * The language picker: a compact flag button that opens a menu of every
 * interface language. Shared by the app header and the landing page header so
 * both stay in sync and both are keyboard operable (Escape closes, outside
 * click closes, `aria-checked` marks the current language).
 */
export function LanguageMenu({
  value,
  onChange,
  label,
}: {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 font-body text-sm font-semibold text-body
          hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-accent">{current.flag}</span>
        <span className="hidden sm:inline">{current.native}</span>
        <span className="sr-only">{label}</span>
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={label}
          className="hairline absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-btc-lg"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === value}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start font-body text-sm',
                  l.code === value
                    ? 'bg-rose-soft font-semibold text-ink'
                    : 'text-body hover:bg-surface-raised',
                )}
              >
                <span className="w-6 shrink-0 text-[0.625rem] font-bold uppercase tracking-wider text-accent">
                  {l.flag}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold">{l.native}</span>
                  <span className="text-xs text-muted">{l.label}</span>
                </span>
                {l.code === value && <Check aria-hidden className="h-4 w-4 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
