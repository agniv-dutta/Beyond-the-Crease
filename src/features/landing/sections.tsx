import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Pause, Play, Radio } from 'lucide-react';
import {
  Badge,
  ErrorState,
  IconButton,
  LinkButton,
  LoadingBlock,
  ProgressBar,
  Segmented,
  Slider,
  Toggle,
  buttonClasses,
} from '@/components/ui';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/components/layout/useLanguage';
import { useAsync } from '@/hooks/useAsync';
import { useCountUp, usePrefersReducedMotion } from '@/hooks/useMisc';
import { api } from '@/api/client';
import { LANGUAGES } from '@/i18n/resources';
import { SPORTS } from '@/data/sports';
import { TEAM_BY_ID } from '@/data/teams';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toasts';
import { cn } from '@/utils/cn';
import type { SportId } from '@/types';

/**
 * Landing sections below the hero.
 *
 * They share one file so the landing route stays a single, cheap lazy chunk:
 * `Landing.tsx` imports them in order and never pulls in the app shell. Each
 * section is a labelled landmark with its own working CTA — nothing here is
 * decorative-only. Data comes through the same api layer the rest of the app
 * uses (MSW now, real endpoints later), so loading and error states are real.
 */

function Section({
  id,
  titleKey,
  ledeKey,
  tone = 'ink',
  children,
}: {
  id: string;
  titleKey: string;
  ledeKey?: string;
  tone?: 'ink' | 'mulberry';
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-28', tone === 'mulberry' && 'bg-mulberry-deep')}
    >
      <div className="container flex flex-col gap-4 py-16 md:py-20">
        <h2 id={`${id}-title`} className="font-display text-display-sm text-balance text-canvas">
          {t(titleKey)}
        </h2>
        {ledeKey && (
          <p className="max-w-2xl font-body text-base leading-relaxed text-pretty text-canvas/70">
            {t(ledeKey)}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

/** CTA inside a section: a router link for app routes, a plain anchor for hashes. */
function SectionCta({ to, labelKey }: { to: string; labelKey: string }) {
  const { t } = useLanguage();
  if (to.startsWith('#')) {
    return (
      <a href={to} className={buttonClasses('outline', 'md', 'self-start')}>
        {t(labelKey)}
      </a>
    );
  }
  return (
    <Link to={to} className={buttonClasses('outline', 'md', 'self-start')}>
      {t(labelKey)}
    </Link>
  );
}

function DemoNote({ text }: { text?: string }) {
  const { t } = useLanguage();
  return (
    <p className="flex flex-wrap items-center gap-2 font-body text-xs text-canvas/75">
      <Badge tone="silver">{t('landing.demoBadge')}</Badge>
      <span>{text ?? t('common.demoData')}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ ticker */

export function TickerStrip() {
  const { t } = useLanguage();
  const [paused, setPaused] = useState(false);

  const feed = useAsync(
    (signal) =>
      Promise.all([
        api.getMatches({ sport: 'cricket' }, signal),
        api.getParity({ sport: 'cricket', months: 3 }, signal),
      ]),
    [],
  );

  const items = useMemo(() => {
    const [matches, parity] = feed.data ?? [];
    const list: { id: string; live?: boolean; text: string }[] = [];
    (matches ?? [])
      .filter((m) => m.status === 'live')
      .forEach((m) => {
        const a = TEAM_BY_ID[m.teamAId]?.short ?? m.teamAId;
        const b = TEAM_BY_ID[m.teamBId]?.short ?? m.teamBId;
        list.push({
          id: m.id,
          live: true,
          text: `${a} ${m.scoreA.runs}/${m.scoreA.wickets} · ${b} ${m.scoreB.runs}/${m.scoreB.wickets} — ${m.city}`,
        });
      });
    const metric = parity?.metric;
    if (metric) {
      list.push({ id: 'media', text: `${t('parity.kpiMedia')}: ${metric.mediaShare}%` });
      list.push({ id: 'social', text: `${t('parity.kpiSocial')}: ${metric.socialShare}%` });
      list.push({ id: 'clips', text: `${t('parity.kpiClips')}: ${metric.clipsShare}%` });
      list.push({ id: 'sponsor', text: `${t('parity.kpiSponsor')}: ${metric.sponsorShare}%` });
    }
    return list;
  }, [feed.data, t]);

  const copy = (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span
          key={item.id}
          className="me-8 inline-flex items-center gap-2 whitespace-nowrap font-body text-sm"
        >
          {item.live ? (
            <Badge tone="live" live icon={<Radio aria-hidden className="h-3 w-3" />}>
              {t('live.now')}
            </Badge>
          ) : (
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-kesar" />
          )}
          <span className="font-semibold text-canvas/90">{item.text}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section aria-labelledby="ticker-title" className="scroll-mt-28 border-y border-silver/15 bg-mulberry-deep">
      <div className="container flex flex-col gap-3 pt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 id="ticker-title" className="font-display text-title text-canvas">
            {t('landing.ticker.label')}
          </h2>
          {items.length > 0 && (
            <IconButton
              size="sm"
              variant="soft"
              label={paused ? t('landing.ticker.play') : t('landing.ticker.pause')}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? (
                <Play aria-hidden className="h-4 w-4" />
              ) : (
                <Pause aria-hidden className="h-4 w-4" />
              )}
            </IconButton>
          )}
        </div>
      </div>

      {feed.loading && feed.initial ? (
        <div className="container pb-8">
          <LoadingBlock rows={2} label={t('common.loading')} />
        </div>
      ) : feed.error ? (
        <div className="container pb-8">
          <ErrorState
            title="Could not load the ticker"
            body={feed.error.message}
            onRetry={feed.reload}
            retryLabel={t('common.retry')}
          />
        </div>
      ) : items.length === 0 ? (
        <p className="container pb-8 font-body text-sm text-canvas/70">{t('live.noneNow')}</p>
      ) : (
        <div className="relative overflow-hidden pb-8" role="region" aria-label={t('landing.ticker.label')}>
          {/* Two identical copies so -50% lands exactly on the seam. dir="ltr"
              keeps the loop geometry stable when the page itself is RTL. */}
          <div
            dir="ltr"
            className={cn(
              'flex w-max animate-marquee motion-reduce:animate-none',
              paused && '[animation-play-state:paused]',
            )}
          >
            {copy}
            <div aria-hidden="true">{copy}</div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-mulberry-deep to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-mulberry-deep to-transparent"
          />
        </div>
      )}

      <div className="container pb-6">
        <SectionCta to="/live" labelKey="live.viewAll" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- visibility */

export function VisibilityGap() {
  const { t } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const parity = useAsync((signal) => api.getParity({ sport: 'cricket', months: 12 }, signal), []);

  const metric = parity.data?.metric;
  const mediaPct = metric?.mediaShare ?? 0;
  const shownPct = useCountUp(mediaPct, 900, !reduced);
  const hours = metric ? Math.round(metric.mediaMinutesWomen / 60) : 0;
  const menHours = metric ? Math.round(metric.mediaMinutesMen / 60) : 0;

  return (
    <Section id="gap" titleKey="landing.gap.title" ledeKey="landing.gap.lede" tone="mulberry">
      {parity.loading && parity.initial ? (
        <LoadingBlock rows={4} label={t('common.loading')} />
      ) : parity.error || !metric ? (
        <ErrorState
          title="Could not load the visibility figures"
          body={parity.error?.message}
          onRetry={parity.reload}
          retryLabel={t('common.retry')}
        />
      ) : (
        <>
          {/* Paired bars: width is the story — women's minutes against men's. */}
          <div className="flex flex-col gap-4 rounded-3xl border border-silver/20 bg-ink p-5 sm:p-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex items-center gap-2 font-body text-sm font-semibold text-canvas">
                  <span aria-hidden="true" className="h-3 w-3 rounded-full bg-pomelo" />
                  {t('landing.gap.women')}
                </span>
                <span className="font-display text-title text-pomelo">
                  {Math.round(shownPct)}% · {hours.toLocaleString('en-US')} h
                </span>
              </div>
              <motion.div
                className="h-8 rounded-full bg-pomelo"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${mediaPct}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex items-center gap-2 font-body text-sm font-semibold text-canvas">
                  <span aria-hidden="true" className="h-3 w-3 rounded-full bg-silver" />
                  {t('landing.gap.men')}
                </span>
                <span className="font-display text-title text-silver">
                  {Math.round(100 - mediaPct)}% · {menHours.toLocaleString('en-US')} h
                </span>
              </div>
              <motion.div
                className="h-8 rounded-full bg-silver/80"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${100 - mediaPct}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              />
            </div>

            <div className="mt-2 flex flex-col gap-3 border-t border-silver/15 pt-4">
              <ProgressBar
                label={t('parity.kpiSocial')}
                value={metric.socialShare}
                tone={metric.socialShare >= 40 ? 'positive' : 'warn'}
              />
              <ProgressBar
                label={t('parity.kpiClips')}
                value={metric.clipsShare}
                tone={metric.clipsShare >= 40 ? 'positive' : 'warn'}
              />
              <ProgressBar
                label={t('parity.kpiSponsor')}
                value={metric.sponsorShare}
                tone={metric.sponsorShare >= 40 ? 'positive' : 'warn'}
              />
            </div>
          </div>

          <DemoNote text={t('landing.gap.demo')} />
          <SectionCta to="/parity" labelKey="landing.gap.cta" />
        </>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------- how */

const STEPS = [1, 2, 3] as const;

export function HowItWorks() {
  const { t } = useLanguage();
  return (
    <Section id="how" titleKey="landing.how.title">
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((n) => (
          <article
            key={n}
            className="hairline flex flex-col gap-3 rounded-3xl bg-surface p-6 shadow-btc-sm"
          >
            <span className="flex items-center gap-2">
              <span className="varq flex h-10 w-10 items-center justify-center rounded-full bg-dusk-fruit font-display text-sm font-bold text-ink">
                {n}
              </span>
              <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-kesar">
                {t('landing.how.step')} {n}
              </span>
            </span>
            <h3 className="font-display text-title text-balance text-body">
              {t(`landing.how.${n}.title`)}
            </h3>
            <p className="font-body text-sm leading-relaxed text-muted">
              {t(`landing.how.${n}.body`)}
            </p>
          </article>
        ))}
      </div>
      <SectionCta to="#tone" labelKey="landing.tone.title" />
    </Section>
  );
}

/* ------------------------------------------------------------------- tone */

const TONES = ['bulletin', 'pundit', 'captain', 'fan'] as const;
type ToneKey = (typeof TONES)[number];

export function TonePlayground() {
  const { t } = useLanguage();
  const [tone, setTone] = useState<ToneKey>('bulletin');
  const [fixed, setFixed] = useState(false);

  return (
    <Section id="tone" titleKey="landing.tone.title" ledeKey="landing.tone.lede">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="hairline flex flex-col gap-4 rounded-3xl bg-surface p-5 sm:p-6 shadow-btc-sm">
          <Segmented<ToneKey>
            label={t('landing.tone.title')}
            value={tone}
            onChange={setTone}
            options={TONES.map((key) => ({ value: key, label: t(`landing.tone.${key}`) }))}
            className="w-full flex-wrap"
          />

          <blockquote className="rounded-2xl bg-surface-sunken p-5">
            <p className="font-display text-title leading-snug text-balance text-body">
              “{t(`landing.tone.${tone}.copy`)}”
            </p>
            <footer className="mt-3 font-body text-xs uppercase tracking-[0.16em] text-kesar">
              {t(`landing.tone.${tone}`)}
            </footer>
          </blockquote>

          <LinkButton to="/studio" variant="primary" size="md" className="self-start">
            {t('landing.tone.cta')}
          </LinkButton>
        </div>

        <div className="hairline flex flex-col gap-4 rounded-3xl bg-surface p-5 sm:p-6 shadow-btc-sm">
          <Badge tone={fixed ? 'pistachio' : 'kesar'}>
            {fixed ? t('landing.tone.fairPass') : t('landing.tone.fairWarn')}
          </Badge>
          <p className="font-body text-sm leading-relaxed text-body">
            {fixed ? t('landing.tone.noteFixed') : t('landing.tone.noteUnfair')}
          </p>
          <Toggle
            label={t('landing.tone.fix')}
            checked={fixed}
            onChange={setFixed}
            description={t('landing.tone.lede')}
            className="border-t border-line pt-3"
          />
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- parity */

const W = 640;
const H = 220;
const PAD = 16;

export function ParityTeaser() {
  const { t } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const parity = useAsync((signal) => api.getParity({ sport: 'cricket', months: 24 }, signal), []);
  const [closer, setCloser] = useState(0);

  const series = useMemo(() => parity.data?.series ?? [], [parity.data]);
  const max = Math.max(1, ...series.map((s) => s.men));

  const womenLifted = series.map((s) => s.women + (s.men - s.women) * (closer / 100));
  const share = useMemo(() => {
    const w = series.reduce((a, s) => a + s.women + (s.men - s.women) * (closer / 100), 0);
    const m = series.reduce((a, s) => a + s.men, 0);
    return w + m > 0 ? Math.round((w / (w + m)) * 100) : 0;
  }, [series, closer]);

  const xAt = (i: number) => PAD + (i * (W - 2 * PAD)) / Math.max(1, series.length - 1);
  const yAt = (v: number) => H - PAD - (v / max) * (H - 2 * PAD);
  const points = (vals: number[]) =>
    vals.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

  return (
    <Section id="parity" titleKey="landing.parity.title" ledeKey="landing.parity.lede" tone="mulberry">
      {parity.loading && parity.initial ? (
        <LoadingBlock rows={4} label={t('common.loading')} />
      ) : parity.error || series.length === 0 ? (
        <ErrorState
          title="Could not load the parity lines"
          body={parity.error?.message}
          onRetry={parity.reload}
          retryLabel={t('common.retry')}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="hairline flex flex-col gap-3 rounded-3xl bg-ink p-5 sm:p-6 shadow-btc-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 font-body text-xs font-semibold text-canvas/80">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-pomelo" />
                {t('landing.gap.women')}
              </span>
              <span className="flex items-center gap-2 font-body text-xs font-semibold text-canvas/80">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-silver" />
                {t('landing.gap.men')}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label={`${t('parity.kpiMedia')}: ${share}%`}
            >
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="stroke-silver/25" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} className="stroke-silver/25" />
              <motion.polyline
                points={points(series.map((s) => s.men))}
                fill="none"
                className="stroke-silver"
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
              <motion.polyline
                points={points(womenLifted)}
                fill="none"
                className="stroke-pomelo"
                strokeWidth={3}
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
              />
            </svg>

            <div className="flex justify-between font-body text-[0.6875rem] uppercase tracking-wide text-canvas/70">
              <span>{series[0]?.month}</span>
              <span>{series[series.length - 1]?.month}</span>
            </div>
          </div>

          <div className="hairline flex flex-col gap-4 rounded-3xl bg-ink p-5 sm:p-6 shadow-btc-sm">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-canvas/60">
                {t('parity.kpiMedia')}
              </p>
              <p className="font-display text-display-sm text-pomelo">{share}%</p>
            </div>
            <Slider
              label={t('landing.parity.slider')}
              value={closer}
              min={0}
              max={100}
              onChange={setCloser}
              format={(v) => `${v}%`}
            />
            <p className="font-body text-xs leading-relaxed text-canvas/60">
              {t('landing.gap.demo')}
            </p>
            <LinkButton to="/parity" variant="primary" size="md" className="self-start">
              {t('landing.parity.cta')}
            </LinkButton>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- circles */

export function CirclesTeaser() {
  const { t, language, setLanguage } = useLanguage();
  const circles = useAsync((signal) => api.getCircles(signal), []);
  const [joined, setJoined] = useState<string[]>([]);

  const join = async (id: string, name: string) => {
    if (joined.includes(id)) return;
    try {
      await api.joinCircle(id);
      setJoined((list) => [...list, id]);
      toast.success(t('circles.joined'), name);
    } catch (error) {
      toast.error('Could not join', error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <Section id="circles" titleKey="landing.circles.title" ledeKey="landing.circles.lede">
      {circles.loading && circles.initial ? (
        <LoadingBlock rows={3} label={t('common.loading')} />
      ) : circles.error ? (
        <ErrorState
          title="Could not load the circles"
          body={circles.error.message}
          onRetry={circles.reload}
          retryLabel={t('common.retry')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(circles.data ?? []).slice(0, 3).map((circle) => {
            const isJoined = joined.includes(circle.id);
            return (
              <article
                key={circle.id}
                className="hairline flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-btc-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-title text-balance text-body">{circle.name}</h3>
                  <Badge tone="silver">
                    {LANGUAGES.find((l) => l.code === circle.languages[0])?.native ??
                      circle.languages[0]}
                  </Badge>
                </div>
                <p className="font-body text-sm leading-relaxed text-muted">{circle.description}</p>
                <p className="font-body text-xs uppercase tracking-wide text-kesar">
                  {circle.memberCount.toLocaleString('en-US')} {t('circles.members')}
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void join(circle.id, circle.name)}
                    disabled={isJoined}
                    className={cn(
                      'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 font-body text-sm font-semibold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                      isJoined
                        ? 'cursor-default bg-pistachio text-ink'
                        : 'bg-pomelo text-ink hover:bg-pomelo-soft',
                    )}
                  >
                    {isJoined && <Check aria-hidden className="h-4 w-4" />}
                    {isJoined ? t('circles.joined') : t('circles.join')}
                  </button>
                  <Link
                    to={`/circle/${circle.id}`}
                    className="font-body text-sm font-semibold text-kesar underline underline-offset-4 hover:text-pomelo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar"
                  >
                    {t('landing.circles.open')}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* The language grid: picking one re-renders the whole page in that language. */}
      <div id="languages" className="mt-4 scroll-mt-28 flex flex-col gap-3">
        <h3 className="font-display text-title text-canvas">{t('landing.nav.languages')}</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('landing.nav.languages')}>
          {LANGUAGES.map((lang) => {
            const active = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
                  active
                    ? 'border-kesar bg-kesar text-ink shadow-btc-kesar'
                    : 'border-silver/35 text-canvas/85 hover:border-kesar hover:text-canvas',
                )}
              >
                <span aria-hidden="true" className="text-[0.625rem] font-bold tracking-wider opacity-70">
                  {lang.flag}
                </span>
                {lang.native}
              </button>
            );
          })}
        </div>
      </div>

      <SectionCta to="/circles" labelKey="landing.circles.cta" />
    </Section>
  );
}

/* ------------------------------------------------------------------ sports */

export function SportSwap() {
  const { t } = useLanguage();
  const prefs = usePrefs();
  const [sport, setSport] = useState<SportId>(prefs.sport);
  const feed = useAsync((signal) => api.getFeed({ sport, limit: 3, sort: 'popular' }, signal), [sport]);
  const active = SPORTS.find((s) => s.id === sport);

  const pick = (id: SportId) => {
    setSport(id);
    prefs.setSport(id);
    prefs.setSportPreseeded(true);
  };

  return (
    <Section id="sports" titleKey="landing.sport.title" ledeKey="landing.sport.lede">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('landing.sport.choose')}>
        {SPORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={sport === s.id}
            onClick={() => pick(s.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
              sport === s.id
                ? 'border-kesar bg-kesar text-ink shadow-btc-kesar'
                : 'border-silver/35 text-canvas/85 hover:border-kesar hover:text-canvas',
            )}
          >
            <SportIcon name={s.icon} className="h-4 w-4" aria-hidden />
            {s.label}
          </button>
        ))}
      </div>

      <p className="font-body text-sm text-canvas/70">{active?.tagline}</p>

      {feed.loading && feed.initial ? (
        <LoadingBlock rows={3} label={t('common.loading')} />
      ) : feed.error ? (
        <ErrorState
          title="Could not load the adapted stories"
          body={feed.error.message}
          onRetry={feed.reload}
          retryLabel={t('common.retry')}
        />
      ) : (feed.data?.stories.length ?? 0) === 0 ? (
        <p className="rounded-3xl border border-silver/20 bg-surface p-5 font-body text-sm text-muted">
          {t('home.emptyFeed')}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feed.data!.stories.map((story) => (
            <li key={story.id}>
              <Link
                to={`/story/${story.id}`}
                className="hairline flex h-full flex-col gap-2 rounded-3xl bg-surface p-5 shadow-btc-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar"
              >
                <Badge tone="rose">{story.theme}</Badge>
                <span className="font-display text-title leading-snug text-balance text-body">
                  {story.title}
                </span>
                <span className="mt-auto font-body text-xs text-muted">
                  {story.readingMinutes} {t('common.minRead')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SectionCta to="/today" labelKey="landing.cta" />
    </Section>
  );
}

/* -------------------------------------------------------------------- end */

export function FinalCta() {
  const { t } = useLanguage();
  return (
    <section id="enter" aria-labelledby="enter-title" className="scroll-mt-28 bg-ink">
      <div className="container flex flex-col items-start gap-5 py-20">
        <h2 id="enter-title" className="max-w-3xl font-display text-display text-balance text-canvas">
          {t('landing.final.title')}
        </h2>
        <p className="max-w-2xl font-body text-base leading-relaxed text-canvas/70">
          {t('landing.final.lede')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/today" className={buttonClasses('primary', 'lg')}>
            {t('landing.cta')}
          </Link>
          <Link to="/studio" className={buttonClasses('outline', 'lg')}>
            {t('landing.final.creator')}
          </Link>
        </div>
        <p className="font-body text-sm font-semibold text-kesar">#BeyondTheCrease</p>
        <DemoNote />
      </div>
    </section>
  );
}
