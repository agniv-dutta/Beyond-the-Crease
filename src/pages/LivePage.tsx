import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Sparkles, Zap } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, Rail, SectionHeading, Segmented, SkeletonCardGrid } from '@/components/ui';
import { MatchCard } from '@/components/match/MatchCard';
import { FireTestEvent, LiveTicker } from '@/components/match/LiveTicker';
import { useLiveSimulation } from '@/hooks/useLiveSimulation';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { allMoments } from '@/data/selectors';
import { usePrefs } from '@/store/prefs';
import { useNotifications } from '@/store/notifications';
import { useWebhook } from '@/hooks/useWebhook';

type StatusFilter = 'all' | 'live' | 'upcoming' | 'completed';

export default function LivePage() {
  const sport = usePrefs((s) => s.sport);
  const [status, setStatus] = useState<StatusFilter>('all');
  const pushNotification = useNotifications((s) => s.push);

  const matches = useAsync(
    (signal) => api.getMatches({ sport, status: status === 'all' ? '' : status }, signal),
    [sport, status],
  );

  const liveNow = useMemo(
    () => (matches.data ?? []).filter((m) => m.status === 'live'),
    [matches.data],
  );

  const moments = useMemo(() => {
    const ids = new Set(liveNow.map((m) => m.id));
    return allMoments(sport)
      .filter((m) => ids.has(m.matchId))
      .sort((a, b) => a.order - b.order)
      .reverse();
  }, [sport, liveNow]);

  const { running, toggle } = useLiveSimulation(
    () => {
      const moment = moments[Math.floor(Math.random() * Math.max(1, moments.length))];
      if (!moment) return null;
      return {
        moment: {
          type: 'match.moment',
          payload: {
            matchId: moment.matchId,
            momentId: moment.id,
            text: moment.text,
            over: moment.over,
            runs: moment.runs,
          },
        },
      };
    },
    liveNow.length > 0,
  );

  // Every delivered match.moment also lands in the notification drawer.
  useWebhook('match.moment', (payload) => {
    pushNotification({
      type: 'match.moment',
      title: `Over ${payload.over}`,
      body: payload.text,
      href: `/match/${payload.matchId}`,
    });
  });

  const list = matches.data ?? [];

  return (
    <div className="flex flex-col gap-12">
      <section className="container flex flex-col gap-6 pt-4">
        <SectionHeading
          eyebrow={liveNow.length > 0 ? `${liveNow.length} live` : 'Nothing live'}
          title="Every ball gets a paragraph"
          lede="Live moments arrive through the in-browser webhook bus as match.moment events. Open any moment and turn it into a story draft without leaving the page."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={running ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggle()}
                icon={<Radio aria-hidden className="h-4 w-4" />}
              >
                {running ? 'Pause simulation' : 'Start simulation'}
              </Button>
            </div>
          }
        />

        <Segmented
          label="Filter matches by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all' as const, label: 'All' },
            { value: 'live' as const, label: 'Live' },
            { value: 'upcoming' as const, label: 'Upcoming' },
            { value: 'completed' as const, label: 'Completed' },
          ]}
        />

        {matches.error ? (
          <ErrorState title="Could not load matches" body={matches.error.message} onRetry={matches.reload} />
        ) : matches.initial && matches.loading ? (
          <SkeletonCardGrid count={3} />
        ) : list.length === 0 ? (
          <EmptyState
            title="No matches in this state"
            body="Try another status, or switch sport from the header — the other sports are generated from the same shape."
            icon={<Radio aria-hidden className="h-8 w-8 text-muted" />}
            action={
              <Button variant="outline" onClick={() => setStatus('all')}>
                Show everything
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {list.map((match) => (
              <li key={match.id}>
                <MatchCard match={match} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Rail label="Live webhook stream" className="container">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-title text-body">Webhook stream</h2>
              <Badge tone={running ? 'live' : 'silver'} live={running}>
                {running ? 'Simulating' : 'Idle'}
              </Badge>
            </div>
            <LiveTicker limit={10} />
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">
                Fire a test event
              </span>
              <FireTestEvent type="match.moment" label="match.moment" />
              <FireTestEvent type="story.published" label="story.published" />
              <FireTestEvent type="circle.message" label="circle.message" />
              <FireTestEvent type="milestone.reached" label="milestone.reached" />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-title text-body">Recent moments</h2>
            {moments.length === 0 ? (
              <p className="font-body text-sm text-muted">
                No live moments for this sport right now. Start a live match filter to populate the timeline.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {moments.slice(0, 8).map((moment) => (
                  <li key={moment.id} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pomelo-soft">
                      <Zap aria-hidden className="h-4 w-4 text-ink" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="font-body text-sm font-semibold text-body">{moment.short}</p>
                      <p className="font-body text-xs text-muted">
                        Over {moment.over} · {moment.excitement}/100 excitement
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/studio?match=${moment.matchId}&moment=${moment.id}`}
                          className="inline-flex items-center gap-1 rounded-lg font-body text-xs font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <Sparkles aria-hidden className="h-3.5 w-3.5" />
                          Turn into a story
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </Rail>
    </div>
  );
}