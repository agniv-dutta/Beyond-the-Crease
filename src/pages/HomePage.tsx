import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, Radio, Sparkles, TrendingUp } from 'lucide-react';
import { Button, Card, Chip, EmptyState, ErrorState, LinkButton, Rail, SectionHeading, Segmented, SkeletonCardGrid, StatTile, TextLink } from '@/components/ui';
import { StoryCard } from '@/components/story/StoryCard';
import { LiveTicker } from '@/components/match/LiveTicker';
import { useLiveSimulation } from '@/hooks/useLiveSimulation';
import { AthleteCard } from '@/components/athlete/AthleteCard';
import { ATHLETE_BY_ID } from '@/data/athletes';
import { TEAMS, TEAM_BY_ID } from '@/data/teams';
import { allMoments, liveMatches, risingAthletes } from '@/data/selectors';
import { ALL_THEMES, useFeed } from '@/hooks/useFeed';
import { usePrefs } from '@/store/prefs';
import type { Story } from '@/types';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/components/layout/useLanguage';
import { emitWebhook } from '@/webhooks/bus';
import { relativeTime } from '@/utils/format';

export default function HomePage() {
  const sport = usePrefs((s) => s.sport);
  const { t } = useLanguage();
  const feed = useFeed(9);
  const [showFilters, setShowFilters] = useState(false);

  const live = useMemo(() => liveMatches(sport), [sport]);
  const rising = useMemo(() => risingAthletes(sport, 4), [sport]);
  const liveMoments = useMemo(() => {
    const ids = new Set(live.map((m) => m.id));
    return allMoments(sport)
      .filter((m) => ids.has(m.matchId))
      .slice(-4)
      .reverse();
  }, [sport, live]);

  const namesFor = (story: Story) =>
    story.athleteIds.map((id) => ATHLETE_BY_ID[id]?.name).filter((n): n is string => Boolean(n));

  const { running, toggle } = useLiveSimulation(
    () => {
      const moment = liveMoments[Math.floor(Math.random() * Math.max(1, liveMoments.length))];
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
    live.length > 0,
  );

  return (
    <div className="flex flex-col gap-14">
      {/* ------------------------------------------------------------- hero */}
      <section className="jaali-panel hairline relative overflow-hidden rounded-4xl bg-surface py-10 shadow-btc-lg sm:py-14">
        <div className="container relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-5">
            <span className="sticker self-start bg-dusk-fruit text-ink">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              ICC Global Hackathon · Track 1
            </span>
            <h1 className="font-display text-display-lg text-balance text-body">{t('home.heroTitle')}</h1>
            <p className="max-w-xl font-body text-base leading-relaxed text-pretty text-muted">
              {t('home.heroSub')}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton to="/live" variant="primary" size="lg" trailing={<ArrowRight aria-hidden className="h-4 w-4" />}>
                {live.length > 0 ? `${live.length} matches live now` : 'See what is live'}
              </LinkButton>
              <LinkButton to="/studio" variant="outline" size="lg">
                Draft a story
              </LinkButton>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Athletes" value={Object.keys(ATHLETE_BY_ID).length} hint="Fictional, all female" />
              <StatTile label="Stories" value={40} hint="Pre-written in 6 languages" />
              <StatTile label="Live matches" value={live.length} tone={live.length > 0 ? 'accent' : 'default'} hint="Webhook-driven" />
              <StatTile label="Visibility gap" value="23%" tone="warn" hint="Broadcast minutes" />
            </dl>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-96">
            <Card className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-title text-body">{t('home.liveMoments')}</h2>
                <Badgeish running={running} />
              </div>
              {live.length === 0 ? (
                <p className="font-body text-sm text-muted">{t('live.noneNow')}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {liveMoments.map((moment) => (
                    <li key={moment.id} className="rounded-2xl bg-surface-sunken px-3 py-2">
                      <p className="font-body text-sm font-semibold text-body">{moment.short}</p>
                      <p className="font-body text-xs text-muted">
                        Over {moment.over} · {relativeTime(moment.atISO)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggle();
                }}
              >
                {running ? 'Pause the live simulation' : 'Resume the live simulation'}
              </Button>
            </Card>
            <LiveTicker limit={3} compact />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- feed */}
      <section className="container flex flex-col gap-6">
        <SectionHeading
          eyebrow="The feed"
          title={t('home.storiesForYou')}
          lede="Every card is a real object from the typed api layer: filter it, sort it, open it, translate it. 5% of requests fail on purpose so you can see the error state."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
              icon={<Filter aria-hidden className="h-4 w-4" />}
              aria-expanded={showFilters}
            >
              Filters
            </Button>
          }
        />

        {showFilters && (
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {ALL_THEMES.map((theme) => (
                <Chip
                  key={theme}
                  selected={feed.filters.theme === theme}
                  onSelect={() => feed.setFilters({ ...feed.filters, theme })}
                >
                  {theme}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {TEAMS.map((team) => (
                <Chip
                  key={team.id}
                  selected={feed.filters.teamId === team.id}
                  onSelect={() =>
                    feed.setFilters({
                      ...feed.filters,
                      teamId: feed.filters.teamId === team.id ? '' : team.id,
                    })
                  }
                >
                  {team.short}
                </Chip>
              ))}
              <Chip
                selected={feed.filters.maxReadingMinutes === 2}
                onSelect={() =>
                  feed.setFilters({
                    ...feed.filters,
                    maxReadingMinutes: feed.filters.maxReadingMinutes === 2 ? 99 : 2,
                  })
                }
              >
                Under 2 min read
              </Chip>
            </div>
            <Segmented
              label="Sort the feed"
              value={feed.filters.sort}
              onChange={(sort) => feed.setFilters({ ...feed.filters, sort })}
              options={[
                { value: 'recent', label: 'Most recent' },
                { value: 'popular', label: 'Most saved' },
              ]}
            />
          </Card>
        )}

        {feed.error ? (
          <ErrorState
            title={t('home.loadError')}
            body={`${feed.error.message} The feed reloads from /api/feed when you retry.`}
            onRetry={feed.reload}
          />
        ) : feed.initial && feed.loading ? (
          <SkeletonCardGrid count={6} />
        ) : feed.stories.length === 0 ? (
          <EmptyState
            title={t('home.emptyFeed')}
            body="Every story in this sport is filtered out. Clear a filter to bring the feed back."
            icon={<Sparkles aria-hidden className="h-8 w-8 text-muted" />}
            action={
              <Button
                onClick={() =>
                  feed.setFilters({ theme: 'All', teamId: '', q: '', maxReadingMinutes: 99, sort: 'recent' })
                }
              >
                Clear all filters
              </Button>
            }
          />
        ) : (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {feed.stories.map((story, i) => (
                <li key={story.id} className={cn(i === 0 && 'sm:col-span-2 lg:col-span-1')}>
                  <StoryCard story={story} athleteNames={namesFor(story)} size={i === 0 ? 'hero' : 'default'} />
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-3">
              {feed.hasMore ? (
                <Button variant="secondary" onClick={feed.loadMore} loading={feed.loading}>
                  Load more stories
                </Button>
              ) : (
                <p className="font-body text-sm text-muted">
                  That is all {feed.data?.total ?? 0} stories for this sport.
                </p>
              )}
              {feed.cursor > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    feed.reset();
                    feed.setCursor(0);
                  }}
                >
                  Back to the top
                </Button>
              )}
            </div>
          </>
        )}
      </section>

      {/* ----------------------------------------------------------- rising */}
      <Rail label={t('home.risingNow')}>
        <div className="container flex flex-col gap-6">
          <SectionHeading
            eyebrow="Momentum, not fame"
            title={t('home.risingNow')}
            lede="Ranked on momentum and featured share — the two numbers this prototype argues are used too rarely."
            action={<TextLink to="/athletes">All athletes</TextLink>}
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rising.map((athlete, i) => (
              <li key={athlete.id}>
                <AthleteCard athlete={athlete} rank={i + 1} />
              </li>
            ))}
          </ul>
        </div>
      </Rail>

      {/* ----------------------------------------------------------- parity */}
      <section className="container">
        <Card className="bg-mulberry-deep jaali-panel flex flex-col gap-6 overflow-hidden p-8 text-canvas sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex max-w-xl flex-col gap-3">
              <span className="sticker self-start bg-kesar text-ink">
                <TrendingUp aria-hidden className="h-3.5 w-3.5" />
                {t('home.exploreParity')}
              </span>
              <h2 className="font-display text-display-sm text-balance text-canvas">
                24 months of visibility data, no spin.
              </h2>
              <p className="font-body text-sm leading-relaxed text-pretty text-canvas/80">
                Broadcast, print, digital, social and highlight-reel minutes — split by gender, region and
                sport. Filter it, export the CSV, and take the projection slider to see what a 4.4% growth
                rate would mean by the next biennium.
              </p>
            </div>
            <LinkButton to="/parity" variant="secondary" size="lg" trailing={<ArrowRight aria-hidden className="h-4 w-4" />}>
              Open the parity dashboard
            </LinkButton>
          </div>
          <div className="flex flex-wrap gap-3">
            {TEAMS.slice(0, 6).map((team) => (
              <span key={team.id} className="rounded-full bg-canvas/10 px-3 py-1 font-body text-xs font-semibold text-canvas/85">
                {TEAM_BY_ID[team.id]?.name ?? team.name}
              </span>
            ))}
          </div>
        </Card>
      </section>

      {/* ---------------------------------------------------------- circles */}
      <section className="container flex flex-col gap-6 pb-6">
        <SectionHeading
          eyebrow="Community"
          title="Join a circle before the next match"
          lede="Eight moderated fan spaces, each with its own guidelines, languages and moderators."
          action={<TextLink to="/circles">Browse circles</TextLink>}
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/circle/c-tamil"
            onClick={() =>
              emitWebhook(
                'circle.message',
                { circleId: 'c-tamil', messageId: 'seed', authorName: 'M. Kausalya', body: 'Vanakkam from Chennai 🏏' },
                { source: 'action', failRate: 0 },
              )
            }
            className="hairline flex flex-col gap-1 rounded-2xl bg-surface px-5 py-4 shadow-btc-sm hover:shadow-btc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="font-body text-sm font-semibold text-body">Tamil Circle</span>
            <span className="font-body text-xs text-muted">Tamil &amp; English · verified</span>
          </Link>
          <Link
            to="/parity"
            className="hairline flex flex-col gap-1 rounded-2xl bg-surface px-5 py-4 shadow-btc-sm hover:shadow-btc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="font-body text-sm font-semibold text-body">Broadcast Minutes Circle</span>
            <span className="font-body text-xs text-muted">Six languages · research + campaigns</span>
          </Link>
          <Link
            to="/live"
            className="hairline flex flex-col gap-1 rounded-2xl bg-surface px-5 py-4 shadow-btc-sm hover:shadow-btc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="font-body text-sm font-semibold text-body">
              <Radio aria-hidden className="me-1.5 inline h-3.5 w-3.5 text-pomelo" />
              Late-night watch parties
            </span>
            <span className="font-body text-xs text-muted">Busy tonight · 3 matches</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Badgeish({ running }: { running: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-[0.625rem] font-bold uppercase tracking-wide',
        running ? 'bg-pomelo text-ink' : 'bg-surface-sunken text-muted',
      )}
    >
      {running && <span className="live-dot" aria-hidden />}
      {running ? 'Streaming' : 'Paused'}
    </span>
  );
}