import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScoutBadge } from '@/types';
import { uid } from '@/utils/id';

const BADGES: ScoutBadge[] = [
  { id: 'b-first-read', label: 'First read', description: 'Read your first story.' },
  { id: 'b-sharer', label: 'Sharer', description: 'Share a story card.' },
  { id: 'b-translator', label: 'Translator', description: 'Read a story in another language.' },
  { id: 'b-joiner', label: 'Joiner', description: 'Join a fan circle.' },
  { id: 'b-streaker', label: 'Three in a row', description: 'Return three days in a row.' },
  { id: 'b-publisher', label: 'Publisher', description: 'Publish a story from the Studio.' },
  { id: 'b-fair', label: 'Fair writer', description: 'Fix every fairness flag in one draft.' },
  { id: 'b-scout', label: 'Story Scout', description: 'Earn every other badge.' },
];

interface GamificationState {
  likedStoryIds: string[];
  savedStoryIds: string[];
  sharedStoryIds: string[];
  translatedStoryIds: string[];
  joinedCircleIds: string[];
  followedAthleteIds: string[];
  alertAthleteIds: string[];
  alertMatchIds: string[];
  rsvpEventIds: string[];
  publishedStoryIds: string[];
  streakDays: number;
  lastActiveDay: string;
  badges: ScoutBadge[];
  predictions: Record<string, string>;
  reset: () => void;
  toggle: (bucket: keyof Pick<GamificationState, 'likedStoryIds' | 'savedStoryIds' | 'sharedStoryIds' | 'translatedStoryIds' | 'joinedCircleIds' | 'followedAthleteIds' | 'alertAthleteIds' | 'alertMatchIds' | 'rsvpEventIds' | 'publishedStoryIds'>, id: string) => boolean;
  award: (badgeId: string) => ScoutBadge | undefined;
  touchStreak: () => number;
  predict: (matchId: string, pick: string) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toggleIn(list: string[], id: string): { list: string[]; added: boolean } {
  return list.includes(id)
    ? { list: list.filter((x) => x !== id), added: false }
    : { list: [...list, id], added: true };
}

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      likedStoryIds: [],
      savedStoryIds: [],
      sharedStoryIds: [],
      translatedStoryIds: [],
      joinedCircleIds: ['c-watch'],
      followedAthleteIds: [],
      alertAthleteIds: [],
      alertMatchIds: [],
      rsvpEventIds: [],
      publishedStoryIds: [],
      streakDays: 0,
      lastActiveDay: '',
      badges: BADGES,
      predictions: {},
      reset: () =>
        set({
          likedStoryIds: [],
          savedStoryIds: [],
          sharedStoryIds: [],
          translatedStoryIds: [],
          joinedCircleIds: [],
          followedAthleteIds: [],
          alertAthleteIds: [],
          alertMatchIds: [],
          rsvpEventIds: [],
          publishedStoryIds: [],
          streakDays: 0,
          lastActiveDay: '',
          badges: BADGES,
          predictions: {},
        }),
      toggle: (bucket, id) => {
        const { list, added } = toggleIn(get()[bucket], id);
        set({ [bucket]: list } as unknown as Partial<GamificationState>);
        return added;
      },
      award: (badgeId) => {
        const badge = get().badges.find((b) => b.id === badgeId);
        if (!badge || badge.earnedAtISO) return undefined;
        const next = get().badges.map((b) =>
          b.id === badgeId ? { ...b, earnedAtISO: new Date().toISOString() } : b,
        );
        set({ badges: next });
        return { ...badge, earnedAtISO: new Date().toISOString() };
      },
      touchStreak: () => {
        const state = get();
        const day = today();
        if (state.lastActiveDay === day) return state.streakDays;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const streak = state.lastActiveDay === yesterday ? state.streakDays + 1 : 1;
        set({ streakDays: streak, lastActiveDay: day });
        return streak;
      },
      predict: (matchId, pick) => set({ predictions: { ...get().predictions, [matchId]: pick } }),
    }),
    {
      name: 'btc.gamification',
      partialize: (s) => ({
        likedStoryIds: s.likedStoryIds,
        savedStoryIds: s.savedStoryIds,
        sharedStoryIds: s.sharedStoryIds,
        translatedStoryIds: s.translatedStoryIds,
        joinedCircleIds: s.joinedCircleIds,
        followedAthleteIds: s.followedAthleteIds,
        alertAthleteIds: s.alertAthleteIds,
        alertMatchIds: s.alertMatchIds,
        rsvpEventIds: s.rsvpEventIds,
        publishedStoryIds: s.publishedStoryIds,
        streakDays: s.streakDays,
        lastActiveDay: s.lastActiveDay,
        badges: s.badges,
        predictions: s.predictions,
      }),
    },
  ),
);

export const BADGE_DEFINITIONS = BADGES;

export function newLocalId(prefix: string): string {
  return uid(prefix);
}
