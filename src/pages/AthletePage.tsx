import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Globe, Quote, Share2, Sparkles, TrendingUp } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Monogram,
  ProgressBar,
  ScoreRing,
  SectionHeading,
  SkeletonCardGrid,
  StatTile,
  Tabs,
  TabPanel,
  TextLink,
} from '@/components/ui';
import { StoryCard } from '@/components/story/StoryCard';
import { ShareCardModal } from '@/components/story/ShareCardModal';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { useState } from 'react';
import { useGamification } from '@/store/gamification';
import { toast } from '@/store/toasts';
import { emitWebhook } from '@/webhooks/bus';
import type { ArcChapter } from '@/types';
import { cn } from '@/utils/cn';
import { compactNumber, longDate, pct } from '@/utils/format';

const CHAPTER_TONE: Record<ArcChapter['kind'], 'silver' | 'accent' | 'kesar' | 'pistachio' | 'mulberry'> = {
  origin: 'silver',
  breakthrough: 'accent',
  struggle: 'kesar',
  leadership: 'pistachio',
  record: 'mulberry',
  now: 'accent',
};

export default function AthletePage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState('story');
  const [shareOpen, setShareOpen] = useState(false);
  const state = useAsync((signal) => api.getAthlete(id, signal), [id]);
  const toggle = useGamification((s) => s.toggle);
  const following = useGamification((s) => s.followedAthleteIds.includes(id));
  const alerts = useGamification((s) => s.alertAthleteIds.includes(id));

  const payload = state.data;
  const stories = payload?.stories ?? [];
  const athlete = payload?.athlete;

  const arcByChapter = useMemo(() => {
    if (!athlete) return [] as ArcChapter[];
    return athlete.arc;
  }, [athlete]);

  if (state.error) {
    return (
      <div className="container py-10">
        <ErrorState title="Athlete not found" body={state.error.message} onRetry={state.reload} />
        <Link to="/athletes">
          <Button variant="outline" className="mt-5" icon={<ArrowLeft aria-hidden className="h-4 w-4" />}>
            Back to athletes
          </Button>
        </Link>
      </div>
    );
  }

  if (!payload || !athlete) {
    return (
      <div className="container py-10">
        <SkeletonCardGrid count={3} />
      </div>
    );
  }

  const { team } = payload;

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-6">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Athletes', to: '/athletes' },
              { label: athlete.name },
            ]}
          />

          <div className="flex flex-wrap items-start gap-6">
            <Monogram initials={athlete.initials} size="xl" tone={athlete.captain ? 'kesar' : 'rose'} label={athlete.name} />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {athlete.captain && <Badge tone="kesar">Captain</Badge>}
                {athlete.themes.map((theme) => (
                  <Badge key={theme} tone="silver">
                    {theme}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display text-display-sm text-balance text-body">{athlete.name}</h1>
              <p className="font-body text-sm text-muted">
                {athlete.role} · {team?.name ?? athlete.teamId} · {athlete.country} · aged {athlete.age}
              </p>
              <p className="max-w-2xl font-body text-base leading-relaxed text-pretty text-body">{athlete.bio}</p>
              <div className="flex flex-wrap items-center gap-2">
                {athlete.languages.map((lang) => (
                  <span key={lang} className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 font-body text-xs uppercase text-muted">
                    <Globe aria-hidden className="h-3 w-3" />
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={athlete.visibilityScore} label="visibility" caption="peer-normalised" size={112} />
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={following ? 'secondary' : 'primary'}
                  onClick={() => {
                    const now = toggle('followedAthleteIds', athlete.id);
                    toast.info(now ? `Following ${athlete.name}` : 'Unfollowed');
                  }}
                >
                  {following ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="outline"
                  aria-pressed={alerts}
                  onClick={() => {
                    const now = toggle('alertAthleteIds', athlete.id);
                    if (now) {
                      emitWebhook(
                        'milestone.reached',
                        {
                          label: `${athlete.name} milestones`,
                          detail: `You will hear when ${athlete.name} passes a round number.`,
                          athleteId: athlete.id,
                        },
                        { source: 'action', failRate: 0 },
                      );
                    } else {
                      toast.info('Alerts off');
                    }
                  }}
                  icon={<Bell aria-hidden className="h-4 w-4" />}
                >
                  {alerts ? 'Alerts on' : 'Alerts'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShareOpen(true)}
                  icon={<Share2 aria-hidden className="h-4 w-4" />}
                >
                  Share Card
                </Button>
                <Link to={`/studio?athlete=${athlete.id}`}>
                  <Button variant="ghost" icon={<Sparkles aria-hidden className="h-4 w-4" />}>
                    Draft a story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label={athlete.signature.label} value={athlete.signature.value} hint={athlete.signature.note} tone="accent" />
          <StatTile label="Matches" value={athlete.stats.matches} hint={`${compactNumber(athlete.stats.runs)} runs`} />
          <StatTile label="Wickets" value={athlete.stats.wickets} hint={`${athlete.stats.wicketsPerOver.toFixed(2)} per over`} />
          <StatTile label="Featured share" value={pct(athlete.featuredShare * 100)} hint="of her team's stories" />
        </div>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <TrendingUp aria-hidden className="h-5 w-5 text-accent" />
            <h2 className="font-display text-title text-body">Momentum vs the men&rsquo;s game</h2>
          </div>
          <p className="font-body text-sm text-pretty text-muted">
            Visibility is not the same as quality. This score compares her share of minutes and mentions
            against the men&rsquo;s baseline for the same sport and region.
          </p>
          <ProgressBar
            label="Visibility parity"
            value={athlete.visibilityScore}
            tone={athlete.visibilityScore >= 60 ? 'positive' : athlete.visibilityScore >= 40 ? 'accent' : 'warn'}
          />
          <TextLink to="/parity">See the aggregate numbers</TextLink>
        </Card>
      </section>

      <section className="container flex flex-col gap-5">
        <Tabs
          label="Athlete detail"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'story', label: 'Stories', count: stories.length },
            { id: 'arc', label: 'The arc', count: arcByChapter.length },
            { id: 'stats', label: 'Numbers' },
          ]}
        />

        <TabPanel id="story" activeId={tab}>
          {stories.length === 0 ? (
            <EmptyState
              title="No stories yet"
              body="Draft the first one in the Studio with her as the subject."
              action={
                <Link to={`/studio?athlete=${athlete.id}`}>
                  <Button>Open the Studio</Button>
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <li key={story.id}>
                  <StoryCard story={story} athleteNames={[athlete.name]} />
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel id="arc" activeId={tab}>
          <ol className="relative flex flex-col gap-4 border-s-2 border-line ps-6">
            {arcByChapter.map((chapter) => (
              <li key={`${chapter.year}-${chapter.title}`} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    'absolute -start-[1.9375rem] top-4 h-3.5 w-3.5 rounded-full border-2 border-ink',
                    chapter.kind === 'record' ? 'bg-mulberry' : 'bg-kesar',
                  )}
                />
                <Card className="flex flex-col gap-2 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={CHAPTER_TONE[chapter.kind]}>{chapter.kind}</Badge>
                    <span className="font-body text-xs uppercase tracking-wide text-muted">{chapter.year}</span>
                  </div>
                  <h3 className="font-display text-title text-body">{chapter.title}</h3>
                  <p className="font-body text-sm leading-relaxed text-pretty text-muted">{chapter.body}</p>
                </Card>
              </li>
            ))}
          </ol>
          <Card className="mt-6 flex flex-col gap-2 p-6">
            <p className="flex items-start gap-2 font-display text-title text-body">
              <Quote aria-hidden className="mt-1 h-5 w-5 shrink-0 text-accent" />
              “{athlete.quote}”
            </p>
            <p className="font-body text-xs text-muted">
              Fictional quotation, written for this prototype.
            </p>
          </Card>
        </TabPanel>

        <TabPanel id="stats" activeId={tab}>
          <Card className="overflow-x-auto p-6">
            <h2 className="font-display text-title text-body">Career numbers</h2>
            <table className="mt-4 w-full min-w-[32rem] border-collapse font-body text-sm">
              <caption className="sr-only">Career statistics for {athlete.name}</caption>
              <tbody>
                {(
                  [
                    ['Matches', athlete.stats.matches],
                    ['Runs', athlete.stats.runs],
                    ['Wickets', athlete.stats.wickets],
                    ['Batting average', athlete.stats.battingAverage],
                    ['Strike rate', athlete.stats.strikeRate],
                    ['Overs bowled', athlete.stats.overs],
                    ['Wickets per over', athlete.stats.wicketsPerOver],
                    ['Best innings', athlete.stats.bestInnings],
                    ['Highest score', athlete.stats.highestScore],
                    ['Win contribution', pct(athlete.stats.winContribution * 100)],
                  ] as [string, string | number][]
                ).map(([label, value]) => (
                  <tr key={label} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="py-2.5 text-start font-medium text-muted">
                      {label}
                    </th>
                    <td className="py-2.5 text-end font-display">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 font-body text-xs text-muted">
              Career started {longDate(new Date(new Date().setFullYear(new Date().getFullYear() - 6)).toISOString())} ·
              all figures invented for this demo.
            </p>
          </Card>
        </TabPanel>
      </section>

      <section className="container pb-4">
        <SectionHeading
          eyebrow="Next"
          title="Where her story goes next"
          lede="The visibility dashboard shows how much of her season actually made air, and the circles are where fans discuss it."
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

      {athlete && (
        <ShareCardModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          athlete={athlete}
          defaultTemplate="athlete"
        />
      )}
    </div>
  );
}