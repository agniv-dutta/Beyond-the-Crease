import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingBlock } from '@/components/ui';
import { useGamification } from '@/store/gamification';
import { Header } from './Header';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { Onboarding } from './Onboarding';
import { AudioMiniPlayer } from '@/components/story/AudioMiniPlayer';
import { ConfettiEffect } from '@/components/gamification/ConfettiEffect';
import { PitchModeTour } from '@/components/demo/PitchModeTour';

/**
 * The application shell. Every route except the landing page renders inside it:
 * the landing page carries its own slim header so the marketing route stays
 * light, while /today and its siblings keep the full navigation, palette and
 * onboarding chrome.
 */
export function Layout() {
  const touchStreak = useGamification((s) => s.touchStreak);

  useEffect(() => {
    // Opening the app counts as activity for the reading-streak badge.
    touchStreak();
  }, [touchStreak]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas bg-grain">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        <Suspense
          fallback={
            <div className="container py-12">
              <LoadingBlock label="Loading this page" rows={5} />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <AudioMiniPlayer />
      <ConfettiEffect />
      <PitchModeTour />
      <CommandPalette />
      <Onboarding />
    </div>
  );
}