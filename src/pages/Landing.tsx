import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/features/landing/LandingHeader';
import { LandingFooter } from '@/features/landing/LandingFooter';
import { Hero } from '@/features/landing/Hero';
import {
  CirclesTeaser,
  FinalCta,
  HowItWorks,
  ParityTeaser,
  SportSwap,
  TickerStrip,
  TonePlayground,
  VisibilityGap,
} from '@/features/landing/sections';
import { usePrefs } from '@/store/prefs';
import { usePrefersReducedMotion } from '@/hooks/useMisc';

/**
 * The Pavilion Gate — the landing page at "/".
 *
 * It carries its own dusk surface (aubergine ground, cream text) locally rather
 * than through the global theme: the visitor's saved theme stays untouched on
 * <html> and is restored the moment they leave, so nothing here can overwrite
 * their preference. Everything below the hero reuses the existing design tokens
 * and i18n strings — no new backend, no heavy libraries, no video.
 *
 * The entrance is a single curtain wipe: an aubergine sheet lifts off the page,
 * the headline words rise behind it, and then the page holds still. Reduced
 * motion skips the curtain entirely.
 */
export default function Landing() {
  const reduced = usePrefersReducedMotion();
  const [curtain, setCurtain] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const saved = usePrefs.getState().theme;
    root.setAttribute('data-theme', 'dusk');
    return () => {
      root.setAttribute('data-theme', saved);
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      setCurtain(false);
      return;
    }
    // Safety net in case the animation never reports completion.
    const id = window.setTimeout(() => setCurtain(false), 1600);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <div className="flex min-h-screen flex-col bg-ink text-canvas">
      <LandingHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        <Hero />
        <TickerStrip />
        <VisibilityGap />
        <HowItWorks />
        <TonePlayground />
        <ParityTeaser />
        <CirclesTeaser />
        <SportSwap />
        <FinalCta />
      </main>
      <LandingFooter />

      {curtain && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[85] origin-top bg-ink"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.65, 0, 0.35, 1] }}
          onAnimationComplete={() => setCurtain(false)}
        />
      )}
    </div>
  );
}
