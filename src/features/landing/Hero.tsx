import { Fragment, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogIn, Pause, Play, Radio } from 'lucide-react';
import {
  Badge,
  Button,
  Checkbox,
  Disclosure,
  LinkButton,
  Modal,
  ProgressBar,
} from '@/components/ui';
import { SportIcon } from '@/components/SportIcon';
import { SPORTS } from '@/data/sports';
import { TEAM_BY_ID } from '@/data/teams';
import { liveMatches, momentsOfMatch, allMatches } from '@/data/selectors';
import { useLanguage } from '@/components/layout/useLanguage';
import { useLanding } from '@/store/landing';
import { usePrefs } from '@/store/prefs';
import { usePrefersReducedMotion } from '@/hooks/useMisc';
import { cn } from '@/utils/cn';
import type { SportId } from '@/types';

const TOUR_STEPS = [1, 2, 3, 4, 5] as const;

/**
 * "Step into the story" — the landing hero.
 *
 * Dusk ground, slowly turning pitch rings, a headline whose words rise into
 * place behind their own line mask, the primary CTA (which always leads to
 * /today, through the pavilion gate), the 60-second tour, sport chips that seed
 * onboarding, and a live moment preview anchored to the lower corner.
 */
export function Hero() {
  const { t } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const enterPavilion = useLanding((s) => s.enterPavilion);
  const preloadToday = useLanding((s) => s.preloadToday);
  const prefs = usePrefs();
  const hasEntered = prefs.hasEntered;

  const [tourOpen, setTourOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Auto-advance the tour only when motion is welcome, the visitor has not
  // paused it, and there is still somewhere left to go.
  useEffect(() => {
    if (!tourOpen || reduced || !playing) return;
    if (step >= TOUR_STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), 4200);
    return () => window.clearTimeout(id);
  }, [tourOpen, reduced, playing, step]);

  // Each line lives inside an overflow mask; words rise from below it. Line
  // classes (like the headline gradient) go on the mask so they span the words.
  // The joining space sits *between* the word spans: a trailing space inside an
  // inline-block is collapsed by the browser, which would glue the words together.
  const line = (text: string, delay: number, lineClassName?: string) => {
    const words = text.split(' ');
    return (
      <span className={cn('block overflow-hidden', lineClassName)}>
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            {i > 0 && ' '}
            <motion.span
              className="inline-block"
              initial={reduced ? { opacity: 0 } : { y: '115%', opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { y: '0%', opacity: 1 }}
              transition={{ duration: 0.65, delay: delay + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          </Fragment>
        ))}
      </span>
    );
  };

  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.35, delay } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const match = liveMatches('cricket')[0] ?? allMatches('cricket')[0];
  const moment = momentsOfMatch(match.id)[0];
  const teamA = TEAM_BY_ID[match.teamAId];
  const teamB = TEAM_BY_ID[match.teamBId];

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-ink">
      {/* Concentric pitch rings — they drift once as the page enters, then hold still. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={reduced ? false : { rotate: -18, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute h-[34rem] w-[34rem] rounded-full border border-silver/15" />
        <div className="absolute h-[52rem] w-[52rem] rounded-full border border-silver/10" />
        <div className="absolute h-[74rem] w-[74rem] rounded-full border border-silver/5" />
      </motion.div>
      <div aria-hidden="true" className="jaali-panel pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="container relative flex min-h-[84vh] flex-col items-start justify-center gap-7 py-24">
        <motion.div {...rise(0)}>
          <Badge tone="kesar">{t('landing.eyebrow')}</Badge>
        </motion.div>

        <h1
          id="hero-title"
          className="max-w-4xl font-display text-display-lg text-balance text-canvas"
        >
          {line(t('landing.headlineA'), 0.08)}
          {line(t('landing.headlineB'), 0.24, 'bg-dusk-fruit bg-clip-text text-transparent')}
        </h1>

        <motion.p className="max-w-2xl font-body text-lg leading-relaxed text-canvas/75" {...rise(0.36)}>
          {t('landing.heroSub')}
        </motion.p>

        <motion.div className="flex flex-wrap items-center gap-3" {...rise(0.46)}>
          <Button
            variant="primary"
            size="lg"
            icon={<LogIn aria-hidden className="h-5 w-5" />}
            onMouseEnter={preloadToday}
            onFocus={preloadToday}
            onClick={enterPavilion}
          >
            {hasEntered ? t('landing.welcomeBack') : t('landing.cta')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setTourOpen(true);
              setStep(0);
              setPlaying(!reduced);
            }}
          >
            {t('landing.tour')}
          </Button>
        </motion.div>

        <motion.div {...rise(0.52)}>
          <Checkbox
            label={t('landing.skipNext')}
            checked={prefs.skipIntro}
            onChange={(e) => prefs.setSkipIntro(e.target.checked)}
            className="text-canvas/70"
          />
        </motion.div>

        {/* Sport chips — the choice seeds onboarding, which then skips that step. */}
        <motion.div className="flex w-full flex-col gap-2.5" {...rise(0.6)}>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-kesar">
            {t('landing.pickSport')}
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('landing.pickSport')}>
            {SPORTS.map((sport) => {
              const selected = prefs.sport === sport.id;
              return (
                <button
                  key={sport.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    prefs.setSport(sport.id as SportId);
                    prefs.setSportPreseeded(true);
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
                    selected
                      ? 'border-kesar bg-kesar text-ink shadow-btc-kesar'
                      : 'border-silver/35 text-canvas/80 hover:border-kesar hover:text-canvas',
                  )}
                >
                  <SportIcon name={sport.icon} className="h-4 w-4" aria-hidden />
                  {sport.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.a
          href="#how"
          className="mt-4 inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-canvas/60 hover:text-kesar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar"
          {...rise(0.7)}
        >
          <span aria-hidden="true" className="h-10 w-px bg-gradient-to-b from-transparent to-kesar" />
          {t('landing.scroll')}
        </motion.a>

        {/* Live moment preview: under the CTA on small screens, corner card from lg up. */}
        <motion.aside
          aria-label="Live moment"
          className="hairline w-full max-w-md rounded-3xl bg-surface p-4 shadow-btc-lg lg:absolute lg:bottom-12 lg:end-6 lg:w-80 xl:end-10"
          {...rise(0.8)}
        >
          <div className="flex items-center justify-between gap-2">
            <Badge tone="live" live icon={<Radio aria-hidden className="h-3 w-3" />}>
              {t('live.now')}
            </Badge>
            <span className="font-body text-[0.625rem] uppercase tracking-wide text-muted">{match.format}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-body text-sm font-semibold text-body">{teamA.short}</span>
            <span className="font-display text-title text-body">
              {match.scoreA.runs}/{match.scoreA.wickets}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-body text-sm font-semibold text-body">{teamB.short}</span>
            <span className="font-display text-title text-body">
              {match.scoreB.runs}/{match.scoreB.wickets}
            </span>
          </div>
          <p className="mt-3 border-t border-line pt-3 font-body text-xs leading-relaxed text-muted">
            {moment ? moment.text : `${match.venue}, ${match.city}`}
          </p>
          <LinkButton to={`/match/${match.id}`} variant="outline" size="sm" className="mt-3">
            {t('live.viewAll')}
          </LinkButton>
        </motion.aside>
      </div>

      {/* Scalloped lower edge, barfi-tray motif. */}
      <div aria-hidden="true" className="scallop-b h-6 w-full bg-ink" />

      <Modal
        open={tourOpen}
        onClose={() => {
          setTourOpen(false);
          setPlaying(false);
        }}
        title={t('landing.tourTitle')}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <Badge tone="kesar">{t('landing.tourCaptions')}</Badge>
            <span className="font-body text-xs text-muted">
              {step + 1} / {TOUR_STEPS.length}
            </span>
          </div>

          <div className="jaali-panel hairline flex min-h-[7rem] items-center rounded-3xl bg-surface-sunken p-6">
            <p className="font-display text-title text-balance text-body">
              {t(`landing.tour${step + 1}`)}
            </p>
          </div>

          <ProgressBar
            value={step + 1}
            max={TOUR_STEPS.length}
            label={t('landing.tourTitle')}
            showValue={false}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              icon={<ChevronLeft aria-hidden className="h-4 w-4" />}
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {t('common.onboardingBack')}
            </Button>
            <Button
              variant="soft"
              icon={
                playing ? (
                  <Pause aria-hidden className="h-4 w-4" />
                ) : (
                  <Play aria-hidden className="h-4 w-4" />
                )
              }
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="ghost"
              trailing={<ChevronRight aria-hidden className="h-4 w-4" />}
              disabled={step >= TOUR_STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1))}
            >
              {t('common.onboardingNext')}
            </Button>
          </div>

          <Disclosure summary={t('landing.tourTranscript')}>
            <ol className="flex list-decimal flex-col gap-1.5 ps-5 font-body text-sm text-body">
              {TOUR_STEPS.map((n) => (
                <li key={n}>{t(`landing.tour${n}`)}</li>
              ))}
            </ol>
          </Disclosure>
        </div>
      </Modal>
    </section>
  );
}
