import { useEffect, type ReactNode } from 'react';
import { useGamification } from '@/store/gamification';
import { Header } from './Header';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { Onboarding } from './Onboarding';

export function Layout({ children }: { children: ReactNode }) {
  const touchStreak = useGamification((s) => s.touchStreak);

  useEffect(() => {
    // Opening the app counts as activity for the reading-streak badge.
    touchStreak();
  }, [touchStreak]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas bg-grain">
      <Header />
      {children}
      <Footer />
      <CommandPalette />
      <Onboarding />
    </div>
  );
}