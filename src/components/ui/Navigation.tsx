import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/* ==========================================================================
   Tabs, segmented controls, disclosure and pagination. Keyboard behaviour
   follows the WAI-ARIA authoring practices for each pattern.
   ========================================================================== */

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  items,
  value,
  onChange,
  label,
  className,
  variant = 'underline',
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
  variant?: 'underline' | 'pill';
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = items.findIndex((i) => i.id === value);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    const target = items[next];
    onChange(target.id);
    refs.current[target.id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'nice-scroll flex gap-1 overflow-x-auto',
        variant === 'underline' && 'gap-6 border-b border-line',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[item.id] = el;
            }}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={selected}
            aria-controls={`panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative whitespace-nowrap font-body text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              variant === 'underline' &&
                cn(
                  'flex items-center gap-2 px-1 py-3 -mb-px border-b-2',
                  selected
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-body',
                ),
              variant === 'pill' &&
                cn(
                  'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5',
                  selected ? 'bg-accent text-accent-ink' : 'text-muted hover:bg-surface-raised hover:text-body',
                ),
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.6875rem] font-bold',
                  selected ? 'bg-accent-ink/20 text-accent-ink' : 'bg-surface-sunken text-muted',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  id,
  activeId,
  children,
  className,
}: {
  id: string;
  activeId: string;
  children: ReactNode;
  className?: string;
}) {
  if (id !== activeId) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={cn(
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-surface',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'hairline inline-flex w-fit items-center gap-1 rounded-2xl bg-surface-sunken p-1',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl font-body font-semibold transition-all duration-200 ease-silk',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              size === 'sm' ? 'min-h-8 px-2.5 text-xs' : 'min-h-9 px-3.5 text-sm',
              selected ? 'bg-surface text-body shadow-btc-sm' : 'text-muted hover:text-body',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn('hairline overflow-hidden rounded-2xl bg-surface shadow-btc-sm', className)}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start font-body text-sm font-semibold text-body
            transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          {summary}
          <ChevronDown
            aria-hidden
            className={cn('h-4 w-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
          />
        </button>
      </h3>
      <div id={id} hidden={!open} className="border-t border-line px-4 py-3 text-sm text-muted">
        {children}
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-2', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="hairline inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-body shadow-btc-sm
          hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
          disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </button>
      <span className="px-2 font-body text-sm text-muted">
        Page <span className="font-semibold text-body">{page}</span> of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="hairline inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-body shadow-btc-sm
          hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
          disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight aria-hidden className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </button>
    </nav>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-body text-sm text-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 opacity-60" />}
            {item.to ? (
              <Link
                to={item.to}
                className="rounded hover:text-body hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-body">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}