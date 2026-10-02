import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Radio, Zap } from 'lucide-react';
import { Badge } from '@/components/ui';
import { onWebhookLog, onWebhook, emitWebhook } from '@/webhooks/bus';
import type { WebhookEvent, WebhookPayloadMap } from '@/types';
import { cn } from '@/utils/cn';
import { relativeTime } from '@/utils/format';

interface TickerItem {
  id: string;
  kind: 'moment' | 'story' | 'circle' | 'milestone';
  label: string;
  detail: string;
  atISO: string;
}

const KIND_LABEL: Record<TickerItem['kind'], string> = {
  moment: 'Moment',
  story: 'Story',
  circle: 'Circle',
  milestone: 'Milestone',
};

const KIND_TONE: Record<TickerItem['kind'], 'live' | 'accent' | 'kesar' | 'pistachio'> = {
  moment: 'live',
  story: 'accent',
  circle: 'kesar',
  milestone: 'pistachio',
};

/** Rolling feed of delivered webhook events. Renders nothing when empty. */
export function LiveTicker({ limit = 8, compact = false }: { limit?: number; compact?: boolean }) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [, force] = useState(0);

  useEffect(() => {
    const add = (event: WebhookEvent) => {
      setItems((prev) => {
        const item = toTickerItem(event);
        return item ? [item, ...prev].slice(0, limit) : prev;
      });
    };
    const unsubs = [
      onWebhook('match.moment', (e) => add(e as WebhookEvent)),
      onWebhook('story.published', (e) => add(e as WebhookEvent)),
      onWebhook('circle.message', (e) => add(e as WebhookEvent)),
      onWebhook('milestone.reached', (e) => add(e as WebhookEvent)),
      onWebhookLog(() => force((n) => n + 1)),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [limit]);

  if (items.length === 0) {
    return (
      <div className="hairline flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-btc-sm">
        <Radio aria-hidden className="h-4 w-4 text-muted" />
        <p className="font-body text-xs text-muted">
          Waiting for the first webhook. Simulated events arrive every few seconds while a match is live.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={cn('flex flex-col gap-2', compact && 'gap-1.5')}
      aria-live="polite"
      aria-label="Recent webhook events"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, x: -12, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                'hairline flex items-start gap-3 rounded-2xl bg-surface px-4 py-2.5 shadow-btc-sm',
                item.kind === 'moment' && 'border-s-4 border-s-pomelo',
                item.kind === 'story' && 'border-s-4 border-s-accent',
                item.kind === 'circle' && 'border-s-4 border-s-kesar',
                item.kind === 'milestone' && 'border-s-4 border-s-pistachio',
              )}
            >
              <Zap aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <Badge tone={KIND_TONE[item.kind]}>{KIND_LABEL[item.kind]}</Badge>
                  <span className="font-body text-[0.625rem] text-muted">{relativeTime(item.atISO)}</span>
                </div>
                <p className="truncate font-body text-sm font-semibold text-body">{item.label}</p>
                {!compact && <p className="font-body text-xs text-muted">{item.detail}</p>}
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function FireTestEvent({ type, label }: { type: 'match.moment' | 'story.published' | 'circle.message' | 'milestone.reached'; label: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        emitWebhook(
          type,
          type === 'match.moment'
            ? { matchId: 'match-mav-fal', momentId: 'm-test', text: label, over: '14.3', runs: 4 }
            : type === 'story.published'
              ? { storyId: 's-test', title: label, theme: 'Comeback', authorName: 'You' }
              : type === 'circle.message'
                ? { circleId: 'c-tamil', messageId: 'm-test', authorName: 'You', body: label }
                : { label: 'Manual test', detail: label, value: 1 },
          { source: 'manual', failRate: 0 },
        )
      }
      className="rounded-xl border border-line px-3 py-2 font-body text-xs font-semibold text-body hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {label}
    </button>
  );
}

function toTickerItem(event: WebhookEvent): TickerItem | null {
  if (event.status !== 'delivered') return null;
  const atISO = event.deliveredAtISO ?? event.createdAtISO;

  if (event.type === 'match.moment') {
    const p = event.payload as WebhookPayloadMap['match.moment'];
    return {
      id: event.id,
      kind: 'moment',
      label: `${p.text} (over ${p.over})`,
      detail: `match.moment · ${p.runs} run${p.runs === 1 ? '' : 's'}`,
      atISO,
    };
  }
  if (event.type === 'story.published') {
    const p = event.payload as WebhookPayloadMap['story.published'];
    return {
      id: event.id,
      kind: 'story',
      label: p.title,
      detail: `story.published · ${p.authorName} · ${p.theme}`,
      atISO,
    };
  }
  if (event.type === 'circle.message') {
    const p = event.payload as WebhookPayloadMap['circle.message'];
    return {
      id: event.id,
      kind: 'circle',
      label: `${p.authorName}: ${p.body}`,
      detail: `circle.message · ${p.circleId}`,
      atISO,
    };
  }
  const p = event.payload as WebhookPayloadMap['milestone.reached'];
  return {
    id: event.id,
    kind: 'milestone',
    label: p.label,
    detail: p.detail,
    atISO,
  };
}