import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LanguageCode, Prefs, SportId, TextSize } from '@/types';
import { setLanguage } from '@/i18n';

export const DEFAULT_PREFS: Prefs = {
  theme: 'kulfi',
  sport: 'cricket',
  language: 'en',
  textSize: 'md',
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  plainLanguage: false,
  lowData: false,
  onboarded: false,
  favouriteTeamIds: [],
  favouriteAthleteIds: [],
  accessibilityNeeds: [],
};

interface PrefsState extends Prefs {
  setTheme: (theme: Prefs['theme']) => void;
  toggleTheme: () => void;
  setSport: (sport: SportId) => void;
  setLanguage: (language: LanguageCode) => void;
  setTextSize: (textSize: TextSize) => void;
  setDyslexiaFont: (on: boolean) => void;
  setHighContrast: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setPlainLanguage: (on: boolean) => void;
  setLowData: (on: boolean) => void;
  completeOnboarding: (patch: Partial<Prefs>) => void;
  toggleAccessibilityNeed: (need: string) => void;
  resetOnboarding: () => void;
  toggleFavouriteTeam: (teamId: string) => void;
  toggleFavouriteAthlete: (athleteId: string) => void;
  resetPrefs: () => void;
}

/** Mirror preference state onto <html> so CSS and the pre-paint script agree. */
function applyToDocument(prefs: Prefs): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', prefs.theme);
  root.setAttribute('data-text-size', prefs.textSize);
  root.setAttribute('data-contrast', prefs.highContrast ? 'high' : 'normal');
  root.setAttribute('data-motion', prefs.reducedMotion ? 'reduced' : 'full');
  root.setAttribute('data-plain-language', prefs.plainLanguage ? 'true' : 'false');
  root.setAttribute('data-low-data', prefs.lowData ? 'true' : 'false');
  if (prefs.dyslexiaFont) root.setAttribute('data-dyslexia-font', 'true');
  else root.removeAttribute('data-dyslexia-font');
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', prefs.theme === 'dusk' ? '#2D1238' : '#F2E6CF');
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PREFS,
      setTheme: (theme) => {
        set({ theme });
        applyToDocument(get());
      },
      toggleTheme: () => {
        const theme = get().theme === 'kulfi' ? 'dusk' : 'kulfi';
        set({ theme });
        applyToDocument(get());
      },
      setSport: (sport) => set({ sport }),
      setLanguage: (language) => {
        set({ language });
        setLanguage(language);
        applyToDocument(get());
      },
      setTextSize: (textSize) => {
        set({ textSize });
        applyToDocument(get());
      },
      setDyslexiaFont: (dyslexiaFont) => {
        set({ dyslexiaFont });
        applyToDocument(get());
      },
      setHighContrast: (highContrast) => {
        set({ highContrast });
        applyToDocument(get());
      },
      setReducedMotion: (reducedMotion) => {
        set({ reducedMotion });
        applyToDocument(get());
      },
      setPlainLanguage: (plainLanguage) => {
        set({ plainLanguage });
        applyToDocument(get());
      },
      setLowData: (lowData) => {
        set({ lowData });
        applyToDocument(get());
      },
      completeOnboarding: (patch) => {
        set({ ...patch, onboarded: true });
        setLanguage(get().language);
        applyToDocument(get());
      },
      toggleAccessibilityNeed: (need) => {
        const current = get().accessibilityNeeds;
        set({
          accessibilityNeeds: current.includes(need)
            ? current.filter((n) => n !== need)
            : [...current, need],
        });
      },
      resetOnboarding: () => set({ onboarded: false }),
      toggleFavouriteTeam: (teamId) => {
        const current = get().favouriteTeamIds;
        set({
          favouriteTeamIds: current.includes(teamId)
            ? current.filter((id) => id !== teamId)
            : [...current, teamId],
        });
      },
      toggleFavouriteAthlete: (athleteId) => {
        const current = get().favouriteAthleteIds;
        set({
          favouriteAthleteIds: current.includes(athleteId)
            ? current.filter((id) => id !== athleteId)
            : [...current, athleteId],
        });
      },
      resetPrefs: () => {
        set({ ...DEFAULT_PREFS });
        setLanguage('en');
        applyToDocument(get());
      },
    }),
    {
      name: 'btc.prefs',
      partialize: (state) => ({
        theme: state.theme,
        sport: state.sport,
        language: state.language,
        textSize: state.textSize,
        dyslexiaFont: state.dyslexiaFont,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
        plainLanguage: state.plainLanguage,
        lowData: state.lowData,
        onboarded: state.onboarded,
        favouriteTeamIds: state.favouriteTeamIds,
        favouriteAthleteIds: state.favouriteAthleteIds,
        accessibilityNeeds: state.accessibilityNeeds,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setLanguage(state.language);
        applyToDocument(state);
      },
    },
  ),
);

export function applyInitialPrefs(): void {
  const prefs = usePrefs.getState();
  applyToDocument(prefs);
  setLanguage(prefs.language);
}
