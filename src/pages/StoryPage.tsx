import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Flag,
  Headphones,
  Heart,
  Languages,
  Quote,
  Share2,
  Sparkles,
  Timer,
} from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Disclosure,
  EmptyState,
  ErrorState,
  Monogram,
  SectionHeading,
  Skeleton,
  TextLink,
} from '@/components/ui';
import { StoryCard } from '@/components/story/StoryCard';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { storyMotifClass } from '@/data/stories';
import { allStories } from '@/data/selectors';
import { ATHLETE_BY_ID } from '@/data/athletes';
import { TEAM_BY_ID } from '@/data/teams';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@/i18n/resources';
import { useGamification } from '@/store/gamification';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toasts';
import { useClipboard } from '@/hooks/useMisc';
import type { LanguageCode } from '@/types';
import { cn } from '@/utils/cn';
import { compactNumber, longDate, readingLabel, relativeTime } from '@/utils/format';

export default function StoryPage() {
  const { id = '' } = useParams();
  const [lang, setLang] = useState<LanguageCode | null>(null);
  const state = useAsync((signal) => api.getStory(id, signal), [id]);
  const toggle = useGamification((s) => s.toggle);
  const liked = useGamification((s) => s.likedStoryIds.includes(id));
  const saved = useGamification((s) => s.savedStoryIds.includes(id));
  const { copy, copied } = useClipboard();
  const sport = usePrefs((s) => s.sport);

  const story = state.data;

  const related = useMemo(() => {
    if (!story) return [];
    return allStories(story.sport)
      .filter((s) => s.id !== story.id)
      .sort((a, b) => {
        const score = (s: typeof a) =>
          (s.theme === story.theme ? 2 : 0) + (s.matchId === story.matchId ? 2 : 0) + s.athleteIds.filter((x) => story.athleteIds.includes(x)).length;
        return score(b) - score(a);
      })
      .slice(0, 3);
  }, [story]);

  if (state.error) {
    return (
      <div className="container py-10">
        <ErrorState title="That story is not in the feed" body={state.error.message} onRetry={state.reload} />
        <Link to="/">
          <Button variant="outline" className="mt-5" icon={<ArrowLeft aria-hidden className="h-4 w-4" />}>
            Back to the feed
          </Button>
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container flex flex-col gap-4 py-10">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const translation = lang ? story.translations[lang] : undefined;
  const available = (Object.keys(story.translations) as LanguageCode[]).filter((l) => story.translations[l]);
  const athletes = story.athleteIds.map((aid) => ATHLETE_BY_ID[aid]).filter(Boolean);
  const team = story.teamId ? TEAM_BY_ID[story.teamId] : undefined;

  const share = () => {
    void copy(`${translation?.title ?? story.title}\n\n#BeyondTheCrease`);
    toast.info('Share text copied', 'The headline and hashtag are on your clipboard.');
  };

  return (
    <div className="flex flex-col gap-12">
      <article className="flex flex-col gap-8">
        <section className="jaali-panel hairline bg-surface py-8">
          <div className="container flex flex-col gap-6">
            <Breadcrumbs
              items={[
                { label: 'Home', to: '/' },
                { label: 'Feed', to: '/' },
                { label: story.theme, to: `/?theme=${story.theme}` },
                { label: translation?.title ?? story.title },
              ]}
            />

            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{story.theme}</Badge>
                <Badge tone="silver">{story.sport}</Badge>
                <Badge tone="silver">{story.kind}</Badge>
                {story.tone && <Badge tone="kesar">{story.tone}</Badge>}
                <Badge tone={story.fairScore >= 70 ? 'pistachio' : 'rose'}>fairness {story.fairScore}</Badge>
              </div>

              <h1 className="font-display text-display text-balance text-body">
                {translation?.title ?? story.title}
              </h1>
              <p className="font-body text-base leading-relaxed text-pretty text-muted">{story.summary}</p>

              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <Monogram
                  initials={story.authorName.slice(0, 2).toUpperCase()}
                  size="sm"
                  tone="rose"
                  label={story.authorName}
                />
                <span className="flex flex-col">
                  <span className="font-body text-sm font-semibold text-body">{story.authorName}</span>
                  <span className="font-body text-xs text-muted">
                    Published {relativeTime(story.publishedAtISO)} · {longDate(story.publishedAtISO)}
                  </span>
                </span>
                <span className="ms-auto inline-flex items-center gap-1 font-body text-xs text-muted">
                  <Timer aria-hidden className="h-3.5 w-3.5" />
                  {readingLabel(story.readingMinutes)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="container grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex flex-col gap-6">
            <Card className={cn('relative flex flex-col gap-5 overflow-hidden p-8', storyMotifClass(story.motif))}>
              <div className="flex flex-col gap-4 font-body text-base leading-[1.75] text-body">
                {(translation?.body ?? story.body)
                  .split('\n')
                  .filter((para) => para.trim().length > 0)
                  .map((para, i) => (
                    <p key={i} className={cn(i === 0 && 'text-lg')}>
                      {para}
                    </p>
                  ))}
              </div>

              {translation && (
                <p className="rounded-2xl bg-pistachio-soft px-4 py-2.5 font-body text-xs text-ink">
                  Shown in {LANGUAGE_BY_CODE[translation.lang].label} ({LANGUAGE_BY_CODE[translation.lang].native}).
                  Translations are written for this demo, not machine output.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Button
                  variant={liked ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const now = toggle('likedStoryIds', story.id);
                    toast.info(now ? 'Liked' : 'Like removed');
                  }}
                  icon={<Heart aria-hidden className={cn('h-4 w-4', liked && 'fill-current')} />}
                >
                  {liked ? 'Liked' : 'Like'} · {compactNumber(story.likes + (liked ? 1 : 0))}
                </Button>
                <Button
                  variant={saved ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const now = toggle('savedStoryIds', story.id);
                    toast.info(now ? 'Saved to your list' : 'Removed from your list');
                  }}
                  icon={<Bookmark aria-hidden className={cn('h-4 w-4', saved && 'fill-current')} />}
                >
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggle('sharedStoryIds', story.id);
                    share();
                  }}
                  icon={<Share2 aria-hidden className="h-4 w-4" />}
                >
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggle('sharedStoryIds', story.id);
                    toast.info(
                      'Listening recorded',
                      'Audio is out of scope for the prototype, so the counter is honest about being a stub.',
                    );
                  }}
                  icon={<Headphones aria-hidden className="h-4 w-4" />}
                >
                  Listen · {compactNumber(story.listens)}
                </Button>
                {copied && <span className="font-body text-xs font-semibold text-accent">Copied</span>}
              </div>
            </Card>

            {available.length > 0 && (
              <Card className="flex flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-title text-body">
                    <Languages aria-hidden className="h-5 w-5 text-accent" />
                    Read this in another language
                  </h2>
                  <span className="font-body text-xs text-muted">{available.length} translations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={lang === null ? 'secondary' : 'outline'}
                    aria-pressed={lang === null}
                    onClick={() => {
                      setLang(null);
                      toast.info('Showing the original');
                    }}
                  >
                    Original
                  </Button>
                  {available.map((code) => (
                    <Button
                      key={code}
                      size="sm"
                      variant={lang === code ? 'secondary' : 'outline'}
                      aria-pressed={lang === code}
                      onClick={() => {
                        setLang(code);
                        toggle('translatedStoryIds', story.id);
                        toast.info(`Now in ${LANGUAGE_BY_CODE[code].label}`);
                      }}
                    >
                      {LANGUAGE_BY_CODE[code].label} · {LANGUAGE_BY_CODE[code].native}
                    </Button>
                  ))}
                </div>
                <p className="font-body text-xs text-muted">
                  {LANGUAGES.length} languages ship in the interface. Story translations are per-story, and only the
                  languages listed above were written for this one.
                </p>
              </Card>
            )}

            <Card className="flex flex-col gap-3 p-6">
              <h2 className="font-display text-title text-body">How this was checked</h2>
              <p className="font-body text-sm leading-relaxed text-pretty text-muted">
                Every story carries a fairness score from the same phrase engine the Studio uses. It is not proof of
                anything: it is a prompt to read the copy again before it ships.
              </p>
              <Disclosure summary="What the score means">
                <ul className="flex list-disc flex-col gap-1.5 ps-4 font-body text-xs text-muted">
                  <li>90 and above: no diminishing phrases found.</li>
                  <li>70 to 89: at least one suggestion to rephrase.</li>
                  <li>Below 70: several flags, and it should not publish without a human rewrite.</li>
                </ul>
              </Disclosure>
              <div className="flex flex-wrap gap-2">
                <Link to={`/studio?athlete=${story.athleteIds[0] ?? ''}`}>
                  <Button variant="outline" size="sm" icon={<Sparkles aria-hidden className="h-4 w-4" />}>
                    Draft your own version
                  </Button>
                </Link>
                <Link to="/access">
                  <Button variant="ghost" size="sm">
                    How the engine works
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <aside className="flex flex-col gap-5">
            {athletes.length > 0 && (
              <Card className="flex flex-col gap-3 p-5">
                <h2 className="font-display text-title text-body">In this story</h2>
                <ul className="flex flex-col gap-2.5">
                  {athletes.map((athlete) =>
                    athlete ? (
                      <li key={athlete.id}>
                        <Link
                          to={`/athlete/${athlete.id}`}
                          className="flex items-center gap-2.5 rounded-2xl p-1.5 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <Monogram initials={athlete.initials} size="sm" tone="rose" label={athlete.name} />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-body text-sm font-medium text-body">{athlete.name}</span>
                            <span className="font-body text-[0.7rem] text-muted">{athlete.role}</span>
                          </span>
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
                {team && (
                  <p className="border-t border-line pt-3 font-body text-xs text-muted">
                    Playing for <strong className="text-body">{team.name}</strong> · {team.city}
                  </p>
                )}
              </Card>
            )}

            <Card className="flex flex-col gap-3 p-5">
              <h2 className="font-display text-title text-body">Where this goes next</h2>
              <div className="flex flex-col gap-2">
                {story.matchId && (
                  <TextLink to={`/match/${story.matchId}`}>Open the match page</TextLink>
                )}
                {story.circleId && <TextLink to={`/circle/${story.circleId}`}>Read the circle thread</TextLink>}
                <TextLink to="/parity">Check her airtime share</TextLink>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <h2 className="font-display text-title text-body">Tags</h2>
              <ul className="flex flex-wrap gap-1.5">
                {story.tags.map((tag) => (
                  <li key={tag} className="sticker bg-silver-soft text-ink">
                    {tag}
                  </li>
                ))}
              </ul>
              <Link to={`/?q=${encodeURIComponent(story.tags[0] ?? '')}`}>
                <Button variant="ghost" size="sm" fullWidth>
                  Find more like this
                </Button>
              </Link>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <h2 className="flex items-center gap-2 font-display text-title text-body">
                <Flag aria-hidden className="h-4 w-4 text-accent" />
                Something wrong?
              </h2>
              <p className="font-body text-xs leading-relaxed text-muted">
                Every story can be flagged. Flags go to a named moderator queue, and nothing is deleted automatically.
              </p>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  toast.success('Flag sent', 'A moderator will read it. Thanks for telling us.');
                }}
              >
                Flag this story
              </Button>
            </Card>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container flex flex-col gap-5 pb-8">
          <SectionHeading
            eyebrow="Keep reading"
            title="Related stories from the same dataset"
            lede={`Ranked by shared theme, match and athletes. ${sport} is the sport you are following; the feed itself is cross-sport.`}
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <StoryCard story={item} athleteNames={item.athleteIds.map((x) => ATHLETE_BY_ID[x]?.name ?? '')} />
              </li>
            ))}
          </ul>
          {related.length === 0 && (
            <EmptyState
              title="No related stories yet"
              body="The dataset is finite, so the tail of it runs out. There are 40 hand-written stories in total."
            />
          )}
        </section>
      )}

      <section className="container pb-10">
        <Card className="scallop flex flex-col items-start gap-3 bg-ink p-8 text-canvas">
          <Quote aria-hidden className="h-6 w-6 text-kesar" />
          <p className="max-w-2xl font-display text-title text-balance text-canvas">
            Every match has a story. Not every story gets heard.
          </p>
          <p className="max-w-2xl font-body text-sm leading-relaxed text-silver">
            The next one is written by whoever shows up to write it. All athletes, teams, statistics and quotations in
            this prototype are fictional.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/">
              <Button variant="pistachio">Back to the feed</Button>
            </Link>
            <Link to="/circles">
              <Button variant="ghost" className="text-silver hover:text-canvas">
                Join a circle
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

