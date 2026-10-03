import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useLanding } from '@/store/landing';
import { usePrefs } from '@/store/prefs';
import { usePrefersReducedMotion } from '@/hooks/useMisc';

/**
 * The pavilion gate.
 *
 * Two aubergine doors close over the landing page, the route swaps underneath
 * them, and they open again onto /today. Mounted once at the router level and
 * driven entirely by the `landing` store, so any component — the hero CTA, the
 * header, a keyboard shortcut — can ask for the same transition.
 *
 * With reduced motion the doors do not slide: the screen cross-fades shut for
 * 120ms, the route swaps, and it cross-fades open for 180ms.
 */
export function GateTransition() {
  const gatePhase = useLanding((s) => s.gatePhase);
  const beginGateOpening = useLanding((s) => s.beginGateOpening);
  const finishGate = useLanding((s) => s.finishGate);
  const prefersReduced = usePrefersReducedMotion();
  const prefReduced = usePrefs((s) => s.reducedMotion);
  const navigate = useNavigate();
  const reduced = prefersReduced || prefReduced;

  const [announced, setAnnounced] = useState(false);
  /** 0 = doors open, 1 = doors shut. */
  const progress = useMotionValue(0);
  const fade = useMotionValue(1);
  const leftX = useTransform(progress, (v) => `${-100 + v * 100}%`);
  const rightX = useTransform(progress, (v) => `${100 - v * 100}%`);
  const roundelOpacity = useTransform(progress, [0.75, 1], [0, 1]);

  useEffect(() => {
    if (gatePhase === 'idle') {
      setAnnounced(false);
      return;
    }
    let cancelled = false;

    const run = async () => {
      if (gatePhase === 'closing') {
        if (reduced) {
          progress.set(1);
          fade.set(0);
          await animate(fade, 1, { duration: 0.12 });
        } else {
          fade.set(1);
          await animate(progress, 1, { duration: 0.7, ease: [0.65, 0, 0.35, 1] });
        }
        if (cancelled) return;
        navigate('/today');
        beginGateOpening();
        setAnnounced(true);
        return;
      }

      // 'opening' — the doors part over the freshly routed page.
      if (reduced) {
        await animate(fade, 0, { duration: 0.18 });
        progress.set(0);
        fade.set(1);
      } else {
        await animate(progress, 0, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
      }
      if (cancelled) return;
      finishGate();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [gatePhase, reduced, navigate, beginGateOpening, finishGate, progress, fade]);

  if (gatePhase === 'idle') return null;

  return (
    <>
      <p className="sr-only" role="status">
        {announced ? 'The pavilion is open. Today.' : 'Entering the pavilion…'}
      </p>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[90] overflow-hidden"
        style={{ opacity: fade }}
      >
        <motion.div
          className="jaali-panel absolute inset-y-0 left-0 flex w-1/2 justify-end bg-mulberry-deep"
          style={{ x: leftX }}
        >
          <span className="h-full w-1 bg-dusk-fruit" />
        </motion.div>
        <motion.div
          className="jaali-panel absolute inset-y-0 right-0 flex w-1/2 bg-mulberry-deep"
          style={{ x: rightX }}
        >
          <span className="h-full w-1 bg-dusk-fruit" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ opacity: roundelOpacity }}
        >
          <span className="varq flex h-24 w-24 items-center justify-center rounded-full bg-dusk-fruit font-display text-title font-bold text-ink shadow-btc-xl">
            BTC
          </span>
          <span className="font-display text-title text-canvas">Beyond the Crease</span>
        </motion.div>
      </motion.div>
    </>
  );
}
