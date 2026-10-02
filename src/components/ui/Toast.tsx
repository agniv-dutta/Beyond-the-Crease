import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info, OctagonAlert, Radio, X } from 'lucide-react';
import { useToasts } from '@/store/toasts';
import type { ToastMessage } from '@/types';
import { cn } from '@/utils/cn';

const TONE_STYLE: Record<ToastMessage['tone'], { className: string; Icon: typeof Check }> = {
  success: { className: 'bg-pistachio-soft text-ink border-pistachio', Icon: Check },
  warn: { className: 'bg-pomelo-soft text-ink border-pomelo', Icon: AlertTriangle },
  error: { className: 'bg-ink text-silver border-mulberry', Icon: OctagonAlert },
  live: { className: 'bg-kesar-soft text-ink border-kesar', Icon: Radio },
  default: { className: 'bg-surface text-body border-line', Icon: Info },
};

function ToastCard({ toast }: { toast: ToastMessage }) {
  const dismiss = useToasts((s) => s.dismiss);
  const { className, Icon } = TONE_STYLE[toast.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.tone === 'live' ? 9000 : 6000);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.tone, dismiss]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-btc-lg',
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-body text-sm font-semibold leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="font-body text-xs leading-relaxed opacity-85">{toast.description}</p>
        )}
        {toast.action && toast.actionLabel && (
          <button
            type="button"
            onClick={() => {
              toast.action?.();
              dismiss(toast.id);
            }}
            className="mt-1 self-start rounded-lg text-xs font-bold underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="rounded-lg p-1 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <X aria-hidden className="h-3.5 w-3.5" />
        <span className="sr-only">Dismiss notification</span>
      </button>
    </motion.li>
  );
}

export function ToastViewport() {
  const toasts = useToasts((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      role="region"
      aria-label="Notifications"
    >
      <ul aria-live="polite" aria-atomic="false" className="flex w-full flex-col items-end gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}