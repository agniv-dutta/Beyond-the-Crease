import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

/* ==========================================================================
   Loading, empty and error states. Every data surface uses these so the app
   never shows a bare spinner or a blank gap.
   ========================================================================== */

export function Skeleton({
  className,
  variant = 'block',
}: {
  className?: string;
  variant?: 'block' | 'text' | 'circle';
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse bg-silver-soft',
        variant === 'block' && 'h-24 w-full rounded-2xl',
        variant === 'text' && 'h-3.5 w-full rounded-full',
        variant === 'circle' && 'h-12 w-12 rounded-full',
        className,
      )}
    />
  );
}

export function SkeletonCardGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="hairline flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-btc-sm">
          <Skeleton variant="circle" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="text" className={cn(i === rows - 1 && 'w-2/5')} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  icon,
  action,
  className,
}: {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'jaali-panel hairline flex flex-col items-center gap-3 rounded-3xl bg-surface px-6 py-12 text-center shadow-btc-sm',
        className,
      )}
    >
      {icon}
      <h3 className="font-display text-title text-body">{title}</h3>
      {body && <p className="max-w-sm font-body text-sm text-pretty text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went sideways',
  body,
  onRetry,
  retryLabel = 'Try again',
  offlineHint,
  className,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
  offlineHint?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'hairline flex flex-col items-start gap-3 rounded-3xl bg-pomelo-soft px-6 py-8 shadow-btc-sm',
        className,
      )}
    >
      <span className="flex items-center gap-2 font-display text-title text-ink">
        {offlineHint ? (
          <WifiOff aria-hidden className="h-5 w-5" />
        ) : (
          <AlertTriangle aria-hidden className="h-5 w-5" />
        )}
        {title}
      </span>
      <p className="max-w-prose font-body text-sm text-ink/85">
        {body ??
          'The demo simulates a 5% failure rate so you can see how errors look. Nothing was lost — retry when you are ready.'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw aria-hidden className="h-4 w-4" />} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  tone = 'accent',
  className,
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  tone?: 'accent' | 'positive' | 'warn';
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barTone = {
    accent: 'bg-accent',
    positive: 'bg-pistachio',
    warn: 'bg-pomelo',
  }[tone];
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-body text-xs font-semibold text-muted">{label}</span>
        {showValue && (
          <span className="font-display text-sm font-semibold text-body">{Math.round(pct)}%</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken"
      >
        <div className={cn('h-full rounded-full transition-[width] duration-700 ease-silk', barTone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScoreRing({
  score,
  label,
  size = 96,
  caption,
}: {
  score: number;
  label: string;
  size?: number;
  caption?: string;
}) {
  const pct = Math.max(0, Math.min(100, score));
  const tone = pct >= 80 ? 'var(--btc-pistachio)' : pct >= 55 ? 'var(--btc-kesar)' : 'var(--btc-pomelo)';
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(pct)} out of 100${caption ? `, ${caption}` : ''}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--btc-line)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 264} 264`}
          className="transition-[stroke-dasharray] duration-1000 ease-silk"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold leading-none text-body">{Math.round(pct)}</span>
        <span className="font-body text-[0.625rem] font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
      </span>
    </div>
  );
}