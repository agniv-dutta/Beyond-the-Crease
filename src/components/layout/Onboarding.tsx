import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Moon, Sun } from 'lucide-react';
import { Button, Segmented, Slider, Toggle } from '@/components/ui';
import { SportIcon } from '@/components/SportIcon';
import { SPORTS } from '@/data/sports';
import { LANGUAGES } from '@/i18n/resources';
import { usePrefs } from '@/store/prefs';
import type { LanguageCode, SportId, TextSize } from '@/types';
import { cn } from '@/utils/cn';
import { useLanguage } from './useLanguage';

const STEPS = ['language', 'sport', 'access'] as const;
type Step = (typeof STEPS)[number];

const ACCESS_NEEDS_HINT = 'Saved on this device only, and reversible any time in /access.';

export function Onboarding() {
  const prefs = usePrefs();
  const completeOnboarding = usePrefs((s) => s.completeOnboarding);
  const [step, setStep] = useState<Step>('language');
  const { t, setLanguage } = useLanguage();

  const index = STEPS.indexOf(step);

  const next = useCallback(() => {
    if (index < STEPS.length - 1) setStep(STEPS[index + 1]);
    else completeOnboarding({});
  }, [index, completeOnboarding]);

  const back = useCallback(() => {
    if (index > 0) setStep(STEPS[index - 1]);
    else completeOnboarding({});
  }, [index, completeOnboarding]);

  if (prefs.onboarded) return null;

  /** Records the need alongside the setting, but never ends onboarding early. */
  const toggleNeed = (need: string, apply: () => void) => {
    apply();
    prefs.toggleAccessibilityNeed(need);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="hairline jaali-panel flex max-h-[92vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-3xl bg-surface p-6 shadow-btc-xl sm:p-8"
      >
        <div className="flex flex-col gap-2">
          <span className="sticker self-start bg-kesar-soft text-ink">
            Step {index + 1} of {STEPS.length}
          </span>
          <h2 id="onboarding-title" className="font-display text-display-sm text-balance text-body">
            {step === 'language' && 'Choose your language'}
            {step === 'sport' && 'Pick a sport to start with'}
            {step === 'access' && 'Set up how the app reads'}
          </h2>
          <p className="font-body text-sm text-muted">{t('brand.tagline')}</p>
        </div>

        {step === 'language' && (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Language</legend>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code as LanguageCode)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-colors',
                  prefs.language === l.code
                    ? 'border-accent bg-rose-soft'
                    : 'border-line bg-surface hover:bg-surface-raised',
                )}
              >
                <span className="w-8 shrink-0 text-xs font-bold uppercase tracking-wider text-accent">
                  {l.flag}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-body font-semibold text-body">{l.native}</span>
                  <span className="font-body text-xs text-muted">
                    {l.label} · {l.dir.toUpperCase()}
                  </span>
                </span>
                {prefs.language === l.code && <Check aria-hidden className="h-5 w-5 text-accent" />}
              </button>
            ))}
          </fieldset>
        )}

        {step === 'sport' && (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Sport</legend>
            {SPORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => prefs.setSport(s.id as SportId)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border px-4 py-3 text-start transition-colors',
                  prefs.sport === s.id
                    ? 'border-accent bg-rose-soft'
                    : 'border-line bg-surface hover:bg-surface-raised',
                )}
              >
                <span aria-hidden className="text-xl">
                  <SportIcon name={s.icon} className="h-6 w-6" />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="font-body font-semibold text-body">{s.label}</span>
                  <span className="font-body text-xs text-muted">{s.tagline}</span>
                </span>
                {prefs.sport === s.id && <Check aria-hidden className="h-5 w-5 text-accent" />}
              </button>
            ))}
          </fieldset>
        )}

        {step === 'access' && (
          <div className="flex flex-col gap-4">
            <Slider
              label="Text size"
              min={100}
              max={140}
              step={5}
              value={Number(prefs.textSize === 'sm' ? 100 : prefs.textSize === 'md' ? 112 : prefs.textSize === 'lg' ? 125 : 140)}
              format={(v) => `${v}%`}
              onChange={(v) => {
                const size: TextSize = v <= 100 ? 'sm' : v <= 115 ? 'md' : v <= 130 ? 'lg' : 'xl';
                prefs.setTextSize(size);
              }}
            />
            <Toggle
              label="Dyslexia-friendly font"
              description="Switches body copy to Atkinson Hyperlegible."
              checked={prefs.dyslexiaFont}
              onChange={() => toggleNeed('dyslexia', () => prefs.setDyslexiaFont(!prefs.dyslexiaFont))}
            />
            <Toggle
              label="Reduce motion"
              description="Turns off shimmer, marquee and entrance animation."
              checked={prefs.reducedMotion}
              onChange={() => toggleNeed('reduced-motion', () => prefs.setReducedMotion(!prefs.reducedMotion))}
            />
            <Toggle
              label="Plain-language stories"
              description="Shorter sentences and clearer labels throughout story pages."
              checked={prefs.plainLanguage}
              onChange={() => toggleNeed('plain-language', () => prefs.setPlainLanguage(!prefs.plainLanguage))}
            />
            <Segmented
              label="Theme"
              value={prefs.theme}
              onChange={(theme) => prefs.setTheme(theme)}
              options={[
                {
                  value: 'kulfi' as const,
                  label: 'Kulfi Cream',
                  icon: <Sun aria-hidden className="h-4 w-4" />,
                },
                { value: 'dusk' as const, label: 'Aubergine Dusk', icon: <Moon aria-hidden className="h-4 w-4" /> },
              ]}
            />
            <p className="font-body text-xs text-muted">
              {ACCESS_NEEDS_HINT}{' '}
              <Link to="/access" className="font-semibold text-accent underline-offset-4 hover:underline">
                Open /access
              </Link>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => completeOnboarding({})}
            className="rounded-lg px-2 py-1 font-body text-sm text-muted underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={back}>
              Back
            </Button>
            <Button variant="primary" onClick={next}>
              {index === STEPS.length - 1 ? 'Start reading' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}