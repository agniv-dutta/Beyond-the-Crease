import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { TOUR_STEPS, usePitchMode } from '@/store/pitchMode';
import { cn } from '@/utils/cn';

export function PitchModeTour() {
  const { isActive, stepIndex, nextStep, prevStep, stopTour, resetDemoState } =
    usePitchMode();
  const navigate = useNavigate();
  const location = useLocation();

  const currentStep = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];

  // Auto-navigate to current step's route if not already there
  useEffect(() => {
    if (!isActive) return;
    if (location.pathname !== currentStep.route) {
      navigate(currentStep.route);
    }
  }, [isActive, stepIndex, currentStep.route, location.pathname, navigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, stopTour]);

  if (!isActive) return null;

  return (
    <>
      {/* Subtle top spotlight bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-kesar via-pomelo to-pistachio h-1" />

      {/* Floating Pitch Mode Judge Card */}
      <aside
        aria-label="Pitch Mode Tour Guide"
        className="fixed bottom-6 left-4 right-4 z-[70] mx-auto max-w-2xl animate-fade-in"
      >
        <div className="scallop grain varq flex flex-col gap-3 rounded-2xl bg-ink p-4 sm:p-5 text-canvas shadow-btc-lg border-2 border-kesar">
          {/* Card Top: Step info, duration, and close */}
          <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-kesar text-ink font-bold text-xs">
                <Sparkles aria-hidden className="h-4 w-4" />
              </span>
              <span className="font-display text-sm font-bold text-kesar">
                Pitch Mode · Judge Tour
              </span>
              <Badge tone="kesar" className="text-[0.625rem]">
                {currentStep.badge}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 font-body text-xs text-silver">
                <Clock aria-hidden className="h-3 w-3" />
                ~{currentStep.duration}
              </span>
              <button
                type="button"
                onClick={stopTour}
                aria-label="Exit Pitch Mode"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-silver hover:bg-white/10 hover:text-canvas transition-colors"
                title="Exit Tour (Esc)"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Card Body: Title & Judge Talking Points */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-lg font-bold text-canvas leading-snug">
              {currentStep.title}
            </h2>
            <p className="font-body text-xs sm:text-sm text-silver leading-relaxed">
              {currentStep.judgeNote}
            </p>
            <div className="mt-1 rounded-lg bg-white/10 px-2.5 py-1.5 font-body text-xs text-kesar">
              <strong>Focus area:</strong> {currentStep.highlightText}
            </div>
          </div>

          {/* Card Footer: Step Dots, Navigation Controls, and Reset Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-2.5">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => usePitchMode.getState().goToStep(idx)}
                  aria-label={`Jump to step ${idx + 1}: ${s.title}`}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    idx === stepIndex
                      ? 'w-6 bg-kesar'
                      : idx < stepIndex
                      ? 'w-2 bg-pistachio'
                      : 'w-2 bg-white/25 hover:bg-white/40',
                  )}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDemoState}
                className="text-silver hover:text-canvas text-xs"
                icon={<RotateCcw aria-hidden className="h-3.5 w-3.5" />}
              >
                Reset demo state
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={stepIndex === 0}
                className="text-canvas border-white/30 text-xs"
                icon={<ArrowLeft aria-hidden className="h-3.5 w-3.5" />}
              >
                Back
              </Button>

              <Button
                size="sm"
                onClick={nextStep}
                className="bg-kesar text-ink hover:opacity-90 font-bold text-xs"
                icon={<ArrowRight aria-hidden className="h-3.5 w-3.5" />}
              >
                {stepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Flow (Space)'}
              </Button>
            </div>
          </div>

          {/* Keyboard tip */}
          <div className="hidden sm:flex items-center justify-center gap-3 text-[0.625rem] text-silver/70 pt-0.5">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">Space</kbd> or{' '}
              <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">→</kbd> Next flow
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">←</kbd> Back
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">Esc</kbd> Exit tour
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
