import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Check, Flame, Globe, ShieldCheck, Users } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Monogram,
  SectionHeading,
  Segmented,
  SkeletonCardGrid,
  TextLink,
} from '@/components/ui';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { useGamification } from '@/store/gamification';
import { toast } from '@/store/toasts';
import { usePrefs } from '@/store/prefs';
import type { Circle, CircleCategory, LanguageCode } from '@/types';
import { compactNumber, relativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

const CATEGORIES: (CircleCategory | 'All')[] = [
  'All',
  'Match watch parties',
  'Regional & language',
  'Grassroots & parents',
  'Coaches',
  'Women in tech & sport',
];

const ACCENT_BAR: Record<Circle['accent'], string> = {
  pomelo: 'bg-pomelo',
  kesar: 'bg-kesar',
  pistachio: 'bg-pistachio',
  rose: 'bg-rose',
  mulberry: 'bg-mulberry',
};

const LANGUAGES: LanguageCode[] = ['en', 'hi', 'ta', 'ar', 'es', 'bn'];

export default function CirclesPage() {
  const sport = usePrefs((s) => s.sport);
  const [category, setCategory] = useState<CircleCategory | 'All'>('All');
  const [lang, setLang] = useState<LanguageCode | 'all'>('all');
  const [onlyMySport, setOnlyMySport] = useState(true);
  const state = useAsync((signal) => api.getCircles(signal), []);
  const joined = useGamification((s) => s.joinedCircleIds);
  const rsvps = useGamification((s) => s.rsvpEventIds);
  const toggle = useGamification((s) => s.toggle);

  const filtered = useMemo(
    () =>
      (state.data ?? []).filter((circle) => {
        if (onlyMySport && circle.sport !== sport) return false;
        if (category !== 'All' && circle.category !== category) return false;
        if (lang !== 'all' && !circle.languages.includes(lang)) return false;
        return true;
      }),
    [state.data, onlyMySport, sport, category, lang],
  );

  const totals = useMemo(
    () => ({
      members: filtered.reduce((a, c) => a + c.memberCount, 0),
      events: filtered.reduce((a, c) => a + c.events.length, 0),
      verified: filtered.filter((c) => c.verified).length,
    }),
    [filtered],
  );

  const join = async (circle: Circle) => {
    const isJoined = joined.includes(circle.id);
    const call = isJoined ? api.leaveCircle(circle.id) : api.joinCircle(circle.id);
    const now = toggle('joinedCircleIds', circle.id);
    try {
      const res = await call;
      toast.success(now ? `Joined ${circle.name}` : `Left ${circle.name}`,
        now ? `${compactNumber(res.memberCount)} members now.` : 'You can rejoin any time.');
    } catch {
      toggle('joinedCircleIds', circle.id);
      toast.warn('Could not update your membership', 'The demo API refused the change. Try again.');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-5">
          <Breadcrumbs items={[{ label: 'Home', to: '/today' }, { label: 'Circles' }]} />
          <SectionHeading
            eyebrow="Fan circles"
            title="Rooms where the women’s game is the main event"
            lede="Eight moderated circles, each with its own language mix, house rules and host roster. Nothing here is a comment section: guidelines are pinned, moderators are named, and every post can be translated."
            action={<TextLink to="/access">How the safety layer works</TextLink>}
          />

          <Card className="flex flex-col gap-4 p-5">
            <Segmented
              label="Circle category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: c === 'All' ? 'All rooms' : c.split(' & ')[0] }))}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                label="Circle language"
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'all' as const, label: 'Any language' },
                  ...LANGUAGES.map((code) => ({ value: code, label: code.toUpperCase() })),
                ]}
              />
              <Button
                variant={onlyMySport ? 'secondary' : 'outline'}
                size="sm"
                aria-pressed={onlyMySport}
                onClick={() => setOnlyMySport((v) => !v)}
                icon={<Flame aria-hidden className="h-4 w-4" />}
              >
                {onlyMySport ? `Showing ${sport} only` : 'Showing all sports'}
              </Button>
              <span className="font-body text-xs text-muted">
                {filtered.length} rooms · {compactNumber(totals.members)} members · {totals.events} events ·{' '}
                {totals.verified} verified
              </span>
            </div>
          </Card>
        </div>
      </section>

      {state.error ? (
        <div className="container">
          <ErrorState title="Could not load the circles" body={state.error.message} onRetry={state.reload} />
        </div>
      ) : state.initial && state.loading ? (
        <div className="container">
          <SkeletonCardGrid count={6} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="container">
          <EmptyState
            title="No circle matches those filters"
            body="Turn off the sport filter to see every room, including the other four sports."
            icon={<Users aria-hidden className="h-8 w-8 text-muted" />}
            action={
              <Button
                onClick={() => {
                  setCategory('All');
                  setLang('all');
                  setOnlyMySport(false);
                }}
              >
                Show every circle
              </Button>
            }
          />
        </div>
      ) : (
        <section className="container grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((circle) => {
            const isJoined = joined.includes(circle.id);
            const nextEvent = circle.events[0];
            return (
              <Card key={circle.id} className="relative flex flex-col gap-4 overflow-hidden p-6">
                <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1.5', ACCENT_BAR[circle.accent])} />
                <div className="flex items-start gap-3">
                  <Monogram
                    initials={circle.name.replace(/[^A-Za-z ]/g, '').slice(0, 2).toUpperCase()}
                    size="lg"
                    tone={circle.accent === 'mulberry' ? 'mulberry' : circle.accent}
                    label={circle.name}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {circle.verified && (
                        <Badge tone="pistachio">
                          <ShieldCheck aria-hidden className="mr-1 inline h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      <Badge tone="silver">{circle.sport}</Badge>
                      {circle.busyTonight && <Badge tone="kesar">Busy tonight</Badge>}
                    </div>
                    <h2 className="font-display text-title text-body">
                      <Link to={`/circle/${circle.id}`} className="hover:underline">
                        {circle.name}
                      </Link>
                    </h2>
                  </div>
                </div>

                <p className="font-body text-sm leading-relaxed text-pretty text-muted">{circle.description}</p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Globe aria-hidden className="h-3.5 w-3.5 text-muted" />
                  {circle.languages.map((code) => (
                    <span key={code} className="sticker bg-silver-soft text-ink">
                      {code.toUpperCase()}
                    </span>
                  ))}
                </div>

                <ul className="flex flex-col gap-1.5 font-body text-xs text-muted">
                  <li className="flex items-center gap-1.5">
                    <Users aria-hidden className="h-3.5 w-3.5" />
                    {compactNumber(circle.memberCount)} members · {circle.moderators.length} moderators
                  </li>
                  {nextEvent && (
                    <li className="flex items-center gap-1.5">
                      <CalendarClock aria-hidden className="h-3.5 w-3.5" />
                      {nextEvent.title} · {relativeTime(nextEvent.startsAtISO)}
                      {rsvps.includes(nextEvent.id) && <Check aria-label="You are going" className="h-3.5 w-3.5 text-pistachio" />}
                    </li>
                  )}
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant={isJoined ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => void join(circle)}
                    icon={isJoined ? <Check aria-hidden className="h-4 w-4" /> : undefined}
                  >
                    {isJoined ? 'Joined' : 'Join circle'}
                  </Button>
                  <Link to={`/circle/${circle.id}`}>
                    <Button variant="ghost" size="sm">
                      Open room
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <section className="container pb-6">
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="font-display text-title text-body">House rules apply everywhere</h2>
          <p className="max-w-3xl font-body text-sm leading-relaxed text-pretty text-muted">
            Every circle carries the same four rules: no body-shaming, no asking for private contact details, no
            arguing about a player&rsquo;s worth without a reason, and one bad week is not a bad career. Circles can add
            their own on top. Moderators are fictional and named, and the whole moderation log is visible on the access
            page.
          </p>
          <TextLink to="/access">Read the safety layer</TextLink>
        </Card>
      </section>
    </div>
  );
}