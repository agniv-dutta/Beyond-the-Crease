import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IconButton } from './Button';

/* ==========================================================================
   Modal + Sheet. Both trap focus, close on Escape and restore focus on unmount.
   ========================================================================== */

function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    const node = ref.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Hide the visible header but keep the accessible name. */
  hideHeader?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, size, hideHeader }: ModalProps) {
  const ref = useFocusTrap(open, onClose);
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size ?? 'md'];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-describedby={description ? 'modal-description' : undefined}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'hairline relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-btc-xl sm:rounded-4xl',
              width,
            )}
          >
            <div id="modal-description" className="sr-only">
              {description ?? title}
            </div>
            {!hideHeader && (
              <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-title text-body">{title}</h2>
                  {description && (
                    <p className="font-body text-sm text-pretty text-muted">{description}</p>
                  )}
                </div>
                <IconButton label="Close dialog" size="sm" onClick={onClose}>
                  <X aria-hidden className="h-4 w-4" />
                </IconButton>
              </header>
            )}
            <div className="nice-scroll flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <footer className="border-t border-line px-6 py-4">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'right' | 'left';
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, side = 'right', children, footer }: SheetProps) {
  const ref = useFocusTrap(open, onClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 flex w-full max-w-md flex-col bg-surface shadow-btc-xl"
            style={side === 'right' ? { right: 0 } : { left: 0 }}
          >
            <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <h2 className="font-display text-title text-body">{title}</h2>
              <IconButton label="Close panel" size="sm" onClick={onClose}>
                <X aria-hidden className="h-4 w-4" />
              </IconButton>
            </header>
            <div className="nice-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <footer className="border-t border-line px-5 py-4">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
}

/**
 * Tooltip that also works on touch: the trigger gets aria-describedby and the
 * bubble is always in the DOM for screen readers, visually shown on hover.
 */
export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  const id = useId();
  return (
    <span className="group/tt relative inline-flex">
      <span aria-describedby={id} tabIndex={0} className="inline-flex rounded-lg focus-visible:outline-none">
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute left-1/2 z-40 w-max max-w-56 -translate-x-1/2 rounded-xl px-2.5 py-1.5',
          'bg-ink font-body text-xs font-medium text-canvas opacity-0 shadow-btc transition-opacity duration-200',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {label}
      </span>
    </span>
  );
}