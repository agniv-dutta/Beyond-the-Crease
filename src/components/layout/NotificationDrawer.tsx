import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Radio, Sparkles, Trash2, TrendingUp } from 'lucide-react';
import { Badge, Button, EmptyState, Sheet } from '@/components/ui';
import { useNotifications } from '@/store/notifications';
import type { NotificationItem, WebhookEventType } from '@/types';
import { cn } from '@/utils/cn';
import { relativeTime } from '@/utils/format';
import { useLanguage } from './useLanguage';

const EVENT_META: Record<WebhookEventType, { label: string; tone: 'live' | 'accent' | 'kesar' | 'pistachio'; Icon: typeof Bell }> = {
  'match.moment': { label: 'Live moment', tone: 'live', Icon: Radio },
  'story.published': { label: 'Story published', tone: 'accent', Icon: Sparkles },
  'circle.message': { label: 'Circle message', tone: 'kesar', Icon: Bell },
  'milestone.reached': { label: 'Milestone', tone: 'pistachio', Icon: TrendingUp },
};

function NotificationRow({ item }: { item: NotificationItem }) {
  const markRead = useNotifications((s) => s.markRead);
  const meta = EVENT_META[item.type];

  return (
    <li className="flex items-start gap-3">
      <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', item.read ? 'bg-line' : 'bg-accent')} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          <span className="font-body text-[0.625rem] text-muted">{relativeTime(item.atISO)}</span>
        </div>
        <p className="font-body text-sm font-semibold text-body">{item.title}</p>
        <p className="font-body text-xs leading-relaxed text-muted">{item.body}</p>
        <div className="flex items-center gap-3 pt-0.5">
          {item.href && (
            <Link
              to={item.href}
              onClick={() => markRead(item.id)}
              className="rounded font-body text-xs font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Open
            </Link>
          )}
          {!item.read && (
            <button
              type="button"
              onClick={() => markRead(item.id)}
              className="rounded font-body text-xs text-muted underline-offset-4 hover:text-body hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function NotificationDrawer() {
  const items = useNotifications((s) => s.items);
  const open = useNotifications((s) => s.drawerOpen);
  const setOpen = useNotifications((s) => s.setDrawerOpen);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const clear = useNotifications((s) => s.clear);
  const { t } = useLanguage();

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title={t('common.notifications')}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0} icon={<Check aria-hidden className="h-4 w-4" />}>
            {t('common.markAllRead')}
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={items.length === 0} icon={<Trash2 aria-hidden className="h-4 w-4" />}>
            Clear
          </Button>
        </div>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title={t('common.noNotifications')}
          body="Live moments, published stories and circle messages arrive here through the in-browser webhook bus. Stay on /live or /match to watch them land."
          icon={<Bell aria-hidden className="h-8 w-8 text-muted" />}
        />
      ) : (
        <ul className="flex flex-col gap-5">
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Sheet>
  );
}