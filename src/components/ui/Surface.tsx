import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkle } from 'lucide-react';
import { cn } from '@/utils/cn';

/* ==========================================================================
   Surfaces, headings, badges and stat tiles.
   ========================================================================== */

export type Motif = 'kesar' | 'rose' | 'pistachio' | 'pomelo' | 'mulberry' | 'silver';

const MOTIF_BG: Record<Motif, string> = {
  kesar: 'bg-kesar-soft',
  rose: 'bg-rose-soft',
  pistachio: 'bg-pistachio-soft',
  pomelo: 'bg-pomelo-soft',
  mulberry: 'bg-mulberry text-canvas',
  silver: 'bg-silver-soft',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  motif?: Motif;
  /** Scallop the bottom edge — use on cards that sit on a tray/section edge. */
  scalloped?: boolean;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { motif, scalloped, interactive, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'hairline relative overflow-hidden rounded-3xl bg-surface shadow-btc',
        motif && MOTIF_BG[motif],
        scalloped && 'scallop-b pb-6',
        interactive &&
          'cursor-pointer transition-all duration-300 ease-silk hover:-translate-y-1 hover:shadow-btc-lg focus-within:-translate-y-1',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export function CardHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </span>
        )}
        <h3 className="font-display text-title text-body">{title}</h3>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mt-3', className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  align = 'start',
  id,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  align?: 'start' | 'center';
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('flex max-w-2xl flex-col gap-2', align === 'center' && 'items-center')}>
        {eyebrow && (
          <span className="sticker bg-kesar-soft text-ink">
            <Sparkle aria-hidden className="h-3.5 w-3.5" />
            {eyebrow}
          </span>
        )}
        <h2 id={id} className="font-display text-display-sm text-balance text-body">
          {title}
        </h2>
        {lede && <p className="font-body text-sm leading-relaxed text-pretty text-muted">{lede}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export type BadgeTone = 'accent' | 'kesar' | 'pistachio' | 'rose' | 'mulberry' | 'silver' | 'live';

const BADGE_TONE: Record<BadgeTone, string> = {
  accent: 'bg-accent text-accent-ink',
  kesar: 'bg-kesar-soft text-ink',
  pistachio: 'bg-pistachio-soft text-ink',
  rose: 'bg-rose-soft text-ink',
  mulberry: 'bg-mulberry text-canvas',
  silver: 'bg-silver-soft text-ink',
  live: 'bg-pomelo text-ink',
};

export function Badge({
  tone = 'accent',
  children,
  icon,
  className,
  live,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  live?: boolean;
}) {
  return (
    <span className={cn('sticker', BADGE_TONE[tone], className)}>
      {live && <span className="live-dot" aria-hidden />}
      {icon}
      {children}
    </span>
  );
}

export interface ChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  selected?: boolean;
  onSelect?: () => void;
  count?: number;
  removeLabel?: string;
  onRemove?: () => void;
}

export function Chip({
  selected,
  onSelect,
  count,
  removeLabel,
  onRemove,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-body text-sm font-semibold',
          'transition-all duration-200 ease-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          selected
            ? 'border-accent bg-accent text-accent-ink shadow-btc-sm'
            : 'border-line bg-surface text-muted hover:border-accent hover:text-body',
        )}
        {...rest}
      >
        {selected && <Check aria-hidden className="h-3.5 w-3.5" />}
        {children}
        {count !== undefined && (
          <span className={cn('text-xs', selected ? 'opacity-80' : 'text-muted')}>{count}</span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? 'Remove'}
          className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-muted hover:border-accent hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 fill-none stroke-current stroke-2">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}

export function Monogram({
  initials,
  size = 'md',
  tone = 'kesar',
  className,
  label,
}: {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: Motif;
  className?: string;
  label?: string;
}) {
  const dimension = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  }[size];
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={cn(
        'varq inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink/10 font-display font-bold',
        dimension,
        MOTIF_BG[tone],
        tone === 'mulberry' ? 'text-canvas' : 'text-ink',
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = 'default',
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'accent' | 'positive' | 'warn';
  className?: string;
}) {
  const valueTone = {
    default: 'text-body',
    accent: 'text-accent',
    positive: 'text-pistachio-deep',
    warn: 'text-pomelo-deep',
  }[tone];
  return (
    <div className={cn('hairline flex flex-col gap-1 rounded-2xl bg-surface px-4 py-3 shadow-btc-sm', className)}>
      <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className={cn('font-display text-2xl leading-none', valueTone)}>{value}</span>
      {hint && <span className="font-body text-xs text-muted">{hint}</span>}
    </div>
  );
}

export function TextLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1 font-body text-sm font-semibold text-accent underline-offset-4',
        'hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className,
      )}
    >
      {children}
      <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function Rail({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-4', className)}>
      <h2 id={id} className="sr-only">
        {label}
      </h2>
      {children}
    </section>
  );
}

/** Data table with a caption and row headers, used wherever a chart needs a text equivalent. */
export function Table({
  caption,
  head,
  rows,
  className,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[28rem] border-collapse font-body text-sm">
        <caption className="pb-2 text-start font-body text-xs text-muted">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-line">
            {head.map((cell, i) => (
              <th
                key={cell}
                scope="col"
                className={cn('py-2 font-semibold uppercase tracking-wide text-muted', i === 0 ? 'text-start' : 'text-end')}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])} className="border-b border-line/60 last:border-0">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="py-2.5 text-start font-medium text-body">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="py-2.5 text-end text-muted">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}