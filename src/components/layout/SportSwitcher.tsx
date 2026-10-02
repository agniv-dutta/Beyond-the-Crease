import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { SPORTS } from '@/data/sports';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toasts';
import type { SportId } from '@/types';
import { cn } from '@/utils/cn';

/**
 * Cricket is the fully built dataset; the other sports are generated in
 * crosssport.ts, so switching is a real data swap rather than a label change.
 */
export function SportSwitcher({ compact = false }: { compact?: boolean }) {
  const sport = usePrefs((s) => s.sport);
  const setSport = usePrefs((s) => s.setSport);
  const [open, setOpen] = useState(false);
  const current = SPORTS.find((s) => s.id === sport) ?? SPORTS[0];

  const pick = (id: SportId) => {
    if (id === sport) {
      setOpen(false);
      return;
    }
    setSport(id);
    setOpen(false);
    const next = SPORTS.find((s) => s.id === id);
    toast.info(
      `Switched to ${next?.label ?? id}`,
      id === 'cricket'
        ? 'Fully hand-written dataset: 24 athletes, 12 matches, 40 stories.'
        : 'Generated dataset from the cross-sport bundle. Cricket stays one toggle away.',
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 font-body text-sm font-semibold text-body',
          'hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          compact ? 'min-h-9' : 'min-h-11',
        )}
      >
        <span aria-hidden>{current.icon}</span>
        <span className="hidden md:inline">{current.label}</span>
        <ChevronDown aria-hidden className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <ul
            role="menu"
            aria-label="Choose a sport"
            className="hairline absolute end-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-btc-lg"
          >
            {SPORTS.map((s) => (
              <li key={s.id} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={s.id === sport}
                  onClick={() => pick(s.id)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-start',
                    s.id === sport ? 'bg-rose-soft' : 'hover:bg-surface-raised',
                  )}
                >
                  <span aria-hidden className="mt-0.5 text-lg">
                    {s.icon}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2 font-body text-sm font-semibold text-body">
                      {s.label}
                      {s.id === sport && <Check aria-hidden className="h-3.5 w-3.5 text-accent" />}
                    </span>
                    <span className="font-body text-xs text-muted">{s.tagline}</span>
                    <span className="mt-0.5 font-body text-[0.625rem] uppercase tracking-wide text-accent">
                      {s.id === 'cricket' ? 'hand-written' : 'generated'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}