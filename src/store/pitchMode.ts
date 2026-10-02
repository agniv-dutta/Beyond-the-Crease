import { create } from 'zustand';
import { useGamification } from './gamification';
import { useStudio } from './studio';
import { useSafety } from './safety';
import { usePrefs } from './prefs';
import { toast } from './toasts';

export interface TourStep {
  route: string;
  badge: string;
  title: string;
  duration: string;
  judgeNote: string;
  highlightText: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/',
    badge: '1 of 5 · Feed & Parity',
    title: 'The Parity-First Feed & Live Pulse',
    duration: '35 sec',
    judgeNote:
      'Beyond the Crease flips the script on sports coverage: women athletes receive primary narrative dignity, backed by real-time airtime and engagement metrics instead of relegated sidebar scores.',
    highlightText: 'Explore hero stories, real-time momentum tags, and live moments.',
  },
  {
    route: '/story/s-1',
    badge: '2 of 5 · AI Storytelling',
    title: 'Deep Storytelling & Web Speech Recaps',
    duration: '35 sec',
    judgeNote:
      'Matches are more than arithmetic: each recap is crafted with emotional arcs. Try the "Listen recap" audio mini-player or the "Same story, new sport" cross-sport translation toggle below.',
    highlightText: 'Listen in browser voice, switch languages, or inspect the fairness score.',
  },
  {
    route: '/studio',
    badge: '3 of 5 · Studio & Bias Engine',
    title: 'AI Studio & Automated Fairness Check',
    duration: '40 sec',
    judgeNote:
      'Newsrooms and fans generate tailored stories with 5 distinct tones. The real-time Fairness Engine audits the text for gendered diminutives, body-shaming, and coverage disparities before publishing.',
    highlightText: 'Try generating a draft or click "Fairness score" to see bias remediation.',
  },
  {
    route: '/parity',
    badge: '4 of 5 · Hard Data',
    title: 'The Visibility Parity Tracker',
    duration: '35 sec',
    judgeNote:
      'Transparent empirical tracking: 8.2% media airtime vs 43% participation. Move the growth slider to simulate what year women’s sports actually reaches 50/50 parity at current investment rates.',
    highlightText: 'Interactive multi-sport chart, CSV export, and crossover projection model.',
  },
  {
    route: '/circle/c-watch',
    badge: '5 of 5 · Fan Spaces & Safety',
    title: 'Multilingual Circles & Local-First Moderation',
    duration: '35 sec',
    judgeNote:
      'Fan communities with automatic translation bridges across 6 languages. Protected by client-side toxicity word-filters with gentle nudges before posting and transparent public moderation logs.',
    highlightText: 'Language switching, live reactions, safety center, and brand partnerships.',
  },
];

interface PitchModeState {
  isActive: boolean;
  stepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  resetDemoState: () => void;
}

export const usePitchMode = create<PitchModeState>((set, get) => ({
  isActive: false,
  stepIndex: 0,

  startTour: () => {
    set({ isActive: true, stepIndex: 0 });
    toast.info('Pitch Mode Activated', 'Use Left / Right arrow keys to navigate the 5 core flows (< 3 min).');
  },

  stopTour: () => {
    set({ isActive: false });
    toast.info('Exited Pitch Mode');
  },

  nextStep: () => {
    const { stepIndex } = get();
    if (stepIndex < TOUR_STEPS.length - 1) {
      set({ stepIndex: stepIndex + 1 });
    } else {
      set({ isActive: false });
      toast.success('Tour Complete!', 'You have reviewed all 5 core flows. Thank you judges!');
    }
  },

  prevStep: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) {
      set({ stepIndex: stepIndex - 1 });
    }
  },

  goToStep: (index) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      set({ stepIndex: index });
    }
  },

  resetDemoState: () => {
    useGamification.getState().reset();
    useStudio.getState().clearAll();
    useSafety.getState().clear();
    usePrefs.getState().resetPrefs();
    set({ stepIndex: 0 });
    toast.success('Demo state reset', 'Restored to clean pristine state for judges.');
  },
}));
