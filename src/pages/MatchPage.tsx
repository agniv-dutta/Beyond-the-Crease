import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, MessagesSquare, Sparkles, Zap } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ProgressBar,
  SectionHeading,
  SkeletonCardGrid,
  StatTile,
  TabPanel,
  Tabs,
} from '@/components/ui';
import { StoryCard } from '@/components/story/StoryCard';
import { LiveTicker } from '@/components/match/LiveTicker';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { ATHLETE_BY_ID } from '@/data/athletes';
import { TEAM_BY_ID } from '@/data/teams';
import { CIRCLE_BY_ID } from '@/data/circles';
import { useGamification } from '@/store/gamification';
import { useNotifications } from '@/store/notifications';
import { useWebhook } from '@/hooks/useWebhook';
import { toast } from '@/store/toasts';
import type { MomentType } from '@/types';
import { cn } from '@/utils/cn';
import { compactNumber, relativeTime } from '@/utils/format';

const MOMENT_ICON: Record<MomentType, string> = {
  boundary: '4',
  six: '6',
  wicket: 'W',
  milestone: '★',
  drop: '!',
  'innings-break': '—',
  review: 'DRS',
  chase: '→',
  debut: 'NEW',
  drill: '🛠',
};

export default function MatchPage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState('moments');
  const state = useAsync((signal) => api.getMatch(id, signal), [id]);
  const pushNotification = useNotifications((s) => s.push);
  const toggle = useGamification((s) => s.toggle);
  const joined = useGamification((s) => s.joinedCircleIds);
  const followingMatch = useGamification((s) => s.alertMatchIds.includes(id));

  useWebhook('match.moment', (payload) => {
    if (payload.matchId !== id) return;
    pushNotification({
      type: 'match.moment',
      title: `Over ${payload.over}`,
      body: payload.text,
      href: `/match/${id}`,
    });
  });

  const payload = state.data;
  const moments = payload?.moments ?? [];
  const stories = payload?.stories ?? [];

  const storyAthleteNames = useMemo(
    () => (athleteIds: string[]) =>
      athleteIds.map((aid) => ATHLETE_BY_ID[aid]?.name).filter((n): n is string => Boolean(n)),
    [],
  );

  if (state.error) {
    return (
      <div className="container py-10">
        <ErrorState title="Match not found" body={state.error.message} onRetry={state.reload} />
        <Button variant="outline" className="mt-5" icon={<ArrowLeft aria-hidden className="h-4 w-4" />} onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="container py-10">
        <SkeletonCardGrid count={3} />
      </div>
    );
  }

  const { match } = payload;
  const teamA = TEAM_BY_ID[match.teamAId];
  const teamB = TEAM_BY_ID[match.teamBId];
  const circle = CIRCLE_BY_ID[match.circleId];

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-6">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/today' },
              { label: 'Live', to: '/live' },
              { label: `${teamA.short} v ${teamB.short}` },
            ]}
          />

          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={match.status === 'live' ? 'live' : match.status === 'upcoming' ? 'kesar' : 'silver'} live={match.status === 'live'}>
                  {match.status}
                </Badge>
                <span className="font-body text-xs uppercase tracking-wide text-muted">
                  {match.format} · {match.venue}
                </span>
              </div>
              <h1 className="font-display text-display-sm text-balance text-body">
                {teamA.name} <span className="text-muted">v</span> {teamB.name}
              </h1>
              <p className="font-body text-sm text-muted">
                {match.result ??
                  `${relativeTime(match.startsAtISO)} · ${compactNumber(match.reachMillions)} million reached · ${match.toss ?? 'Toss pending'}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/studio?match=${match.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-pomelo px-4 font-body text-sm font-semibold text-ink shadow-btc-pomelo hover:bg-pomelo-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Sparkles aria-hidden className="h-4 w-4" />
                Turn this match into a story
              </Link>
              <Button
                variant="outline"
                aria-pressed={followingMatch}
                onClick={async () => {
                  const now = toggle('alertMatchIds', match.id);
                  if (!now) {
                    toast.info('Match alerts off', 'You will not be notified about this match.');
                    return;
                  }
                  try {
                    await api.subscribeAlerts({ kind: 'match', id: match.id, topics: ['moments'] });
                    toast.success('Match alerts on', 'You will get a moment notification when play resumes.');
                  } catch (error) {
                    toggle('alertMatchIds', match.id);
                    toast.error('Could not save that alert', error instanceof Error ? error.message : 'Please try again.');
                  }
                }}
              >
                {followingMatch ? 'Alerts on' : 'Alert me'}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label={`${teamA.short} score`}
              value={`${match.scoreA.runs}/${match.scoreA.wickets}`}
              hint={`${match.scoreA.overs} overs`}
            />
            <StatTile label={`${teamB.short} score`} value={`${match.scoreB.runs}/${match.scoreB.wickets}`} hint={`${match.scoreB.overs} overs`} />
            <StatTile
              label="Women's win probability"
              value={`${match.winProbabilityA}%`}
              tone="accent"
              hint="Model estimate, not a result"
            />
            <StatTile label="Stories drafted" value={match.storyCount} hint={`${moments.length} moments tagged`} />
          </div>

          {match.status === 'live' && (
            <ProgressBar
              label={`${teamA.short} momentum`}
              value={match.winProbabilityA}
              tone={match.winProbabilityA > 55 ? 'positive' : 'warn'}
            />
          )}
        </div>
      </section>

      <section className="container flex flex-col gap-5">
        <Tabs
          label="Match detail"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'moments', label: 'Moments', count: moments.length },
            { id: 'stories', label: 'Stories', count: stories.length },
            { id: 'stats', label: 'Stats' },
            { id: 'circle', label: 'Watch party' },
          ]}
        />

        <TabPanel id="moments" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-3">
              {moments.length === 0 ? (
                <EmptyState title="No moments tagged yet" body="Moments appear once the scoreline changes in the demo feed." />
              ) : (
                <ol className="relative flex flex-col gap-3 border-s-2 border-line ps-5">
                  {moments.map((moment) => (
                    <li key={moment.id} className="relative">
                      <span
                        aria-hidden
                        className={cn(
                          'absolute -start-[1.6875rem] top-3 flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold',
                          moment.highlightClip ? 'bg-kesar text-ink' : 'bg-surface text-muted hairline',
                        )}
                      >
                        {MOMENT_ICON[moment.type] ?? '•'}
                      </span>
                      <Card className="flex flex-col gap-2 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={moment.highlightClip ? 'kesar' : 'silver'}>{moment.type}</Badge>
                          <span className="font-body text-[0.6875rem] uppercase tracking-wide text-muted">
                            Over {moment.over} · ball {moment.ball} · {relativeTime(moment.atISO)}
                          </span>
                        </div>
                        <p className="font-body text-sm leading-relaxed text-body">{moment.text}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {moment.batterId && (
                            <Link
                              to={`/athlete/${moment.batterId}`}
                              className="font-body text-xs font-semibold text-accent underline-offset-4 hover:underline"
                            >
                              {ATHLETE_BY_ID[moment.batterId]?.name}
                            </Link>
                          )}
                          <span className="font-body text-xs text-muted">
                            Excitement {moment.excitement}/100
                          </span>
                          <Link
                            to={`/studio?match=${match.id}&moment=${moment.id}`}
                            className="ms-auto inline-flex items-center gap-1 rounded-lg font-body text-xs font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <Sparkles aria-hidden className="h-3.5 w-3.5" />
                            Draft from this moment
                          </Link>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <Card className="flex flex-col gap-3 p-5">
                <h3 className="font-display text-title text-body">In the squad sheet</h3>
                <ul className="flex flex-col gap-2">
                  {payload.athletes.slice(0, 8).map((athlete) => (
                    <li key={athlete.id} className="flex items-center justify-between gap-3">
                      <Link
                        to={`/athlete/${athlete.id}`}
                        className="truncate rounded font-body text-sm text-body underline-offset-4 hover:text-accent hover:underline"
                      >
                        {athlete.name}
                      </Link>
                      <span className="shrink-0 font-body text-xs text-muted">{athlete.role}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <LiveTicker limit={5} compact />
            </div>
          </div>
        </TabPanel>

        <TabPanel id="stories" activeId={tab}>
          {stories.length === 0 ? (
            <EmptyState
              title="No stories for this match yet"
              body="Draft one in the Studio — the moment context is pre-filled."
              icon={<Sparkles aria-hidden className="h-8 w-8 text-muted" />}
              action={
                <Link to={`/studio?match=${match.id}`}>
                  <Button>Open the Studio</Button>
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <li key={story.id}>
                  <StoryCard story={story} athleteNames={storyAthleteNames(story.athleteIds)} rail="From this match" />
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel id="stats" activeId={tab}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-title text-body">Scorecard summary</h3>
              <table className="mt-4 w-full border-collapse font-body text-sm">
                <caption className="sr-only">Innings summary</caption>
                <thead>
                  <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="py-2 text-start">Team</th>
                    <th scope="col" className="py-2 text-end">Runs</th>
                    <th scope="col" className="py-2 text-end">Wickets</th>
                    <th scope="col" className="py-2 text-end">Overs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line/60">
                    <th scope="row" className="py-2.5 text-start font-semibold text-body">{teamA.name}</th>
                    <td className="py-2.5 text-end">{match.scoreA.runs}</td>
                    <td className="py-2.5 text-end">{match.scoreA.wickets}</td>
                    <td className="py-2.5 text-end">{match.scoreA.overs}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2.5 text-start font-semibold text-body">{teamB.name}</th>
                    <td className="py-2.5 text-end">{match.scoreB.runs}</td>
                    <td className="py-2.5 text-end">{match.scoreB.wickets}</td>
                    <td className="py-2.5 text-end">{match.scoreB.overs}</td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-title text-body">Reach</h3>
              <dl className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <dt className="font-body text-sm text-muted">Attendance</dt>
                  <dd className="font-display text-lg">{compactNumber(match.attendance)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-body text-sm text-muted">Estimated reach</dt>
                  <dd className="font-display text-lg">{compactNumber(match.reachMillions)}M</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-body text-sm text-muted">Stories drafted</dt>
                  <dd className="font-display text-lg">{match.storyCount}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-body text-sm text-muted">Highlight clips</dt>
                  <dd className="font-display text-lg">{moments.filter((m) => m.highlightClip).length}</dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-2 font-body text-xs text-muted">
                <BarChart3 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                Compare this reach against the parity baseline on the{' '}
                <Link to="/parity" className="font-semibold text-accent underline-offset-4 hover:underline">
                  dashboard
                </Link>
                .
              </p>
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="circle" activeId={tab}>
          {circle && (
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-title text-body">{circle.name}</h3>
                  <p className="font-body text-sm text-muted">{circle.description}</p>
                </div>
                <Badge tone="kesar">{compactNumber(circle.memberCount)} members</Badge>
              </div>
              <ul className="flex flex-wrap gap-2">
                {circle.guidelines.map((g) => (
                  <li key={g} className="rounded-full bg-surface-sunken px-3 py-1 font-body text-xs text-muted">
                    {g}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/circle/${circle.id}`}>
                  <Button variant="primary" icon={<MessagesSquare aria-hidden className="h-4 w-4" />}>
                    Open the circle
                  </Button>
                </Link>
                <Button
                  variant={joined.includes(circle.id) ? 'outline' : 'secondary'}
                  onClick={() => {
                    const now = toggle('joinedCircleIds', circle.id);
                    if (now) void api.joinCircle(circle.id).catch(() => undefined);
                    else void api.leaveCircle(circle.id).catch(() => undefined);
                  }}
                >
                  {joined.includes(circle.id) ? 'Leave the circle' : 'Join the watch party'}
                </Button>
              </div>
              {circle.busyTonight && (
                <p className="flex items-center gap-2 rounded-2xl bg-pomelo-soft px-4 py-2 font-body text-xs font-semibold text-ink">
                  <Zap aria-hidden className="h-4 w-4" />
                  Busy tonight — 42 people are in the thread right now.
                </p>
              )}
            </Card>
          )}
        </TabPanel>
      </section>

      <section className="container pb-6">
        <SectionHeading
          eyebrow="Keep going"
          title="Two more rooms"
          lede="The parity dashboard explains why this fixture barely moved the needle, and the circles list has eight more communities to compare."
          action={
            <div className="flex gap-2">
              <Link to="/parity">
                <Button variant="outline">Parity dashboard</Button>
              </Link>
              <Link to="/circles">
                <Button variant="outline">Circles</Button>
              </Link>
            </div>
          }
        />
      </section>
    </div>
  );
}