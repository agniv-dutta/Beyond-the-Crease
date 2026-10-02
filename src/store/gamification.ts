import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScoutBadge } from '@/types';
import { uid } from '@/utils/id';
import { emitWebhook } from '@/webhooks/bus';

const BADGES: ScoutBadge[] = [
  { id: 'b-first-read', label: 'First read', description: 'Read your first story.' },
  { id: 'b-sharer', label: 'Sharer', description: 'Share a story card.' },
  { id: 'b-translator', label: 'Translator', description: 'Read a story in another language.' },
  { id: 'b-joiner', label: 'Joiner', description: 'Join a fan circle.' },
  { id: 'b-predictor', label: 'Match Predictor', description: 'Log a match prediction.' },
  { id: 'b-streaker', label: 'Three in a row', description: 'Return three days in a row.' },
  { id: 'b-publisher', label: 'Publisher', description: 'Publish a story from the Studio.' },
  { id: 'b-fair', label: 'Fair writer', description: 'Fix every fairness flag in one draft.' },
  { id: 'b-scout', label: 'Story Scout', description: 'Earn every other badge.' },
];

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badgeCount: number;
  isUser?: boolean;
}

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
  toggle: (
    bucket: keyof Pick<
      GamificationState,
      | 'likedStoryIds'
      | 'savedStoryIds'
      | 'sharedStoryIds'
      | 'translatedStoryIds'
      | 'joinedCircleIds'
      | 'followedAthleteIds'
      | 'alertAthleteIds'
      | 'alertMatchIds'
      | 'rsvpEventIds'
      | 'publishedStoryIds'
    >,
    id: string,
  ) => boolean;
  award: (badgeId: string) => ScoutBadge | undefined;
  touchStreak: () => number;
  predict: (matchId: string, pick: string) => void;
  getUserPoints: () => number;
  getLeaderboard: () => LeaderboardEntry[];
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
      streakDays: 1,
      lastActiveDay: today(),
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

        // Gamification trigger checks
        if (bucket === 'sharedStoryIds' && added) get().award('b-sharer');
        if (bucket === 'translatedStoryIds' && added) get().award('b-translator');
        if (bucket === 'joinedCircleIds' && added) get().award('b-joiner');
        if (bucket === 'publishedStoryIds' && added) get().award('b-publisher');

        return added;
      },

      award: (badgeId) => {
        const badge = get().badges.find((b) => b.id === badgeId);
        if (!badge || badge.earnedAtISO) return undefined;
        const earnedAtISO = new Date().toISOString();
        const next = get().badges.map((b) =>
          b.id === badgeId ? { ...b, earnedAtISO } : b,
        );
        set({ badges: next });

        // Trigger Milestone celebration webhook (E3)
        emitWebhook(
          'milestone.reached',
          {
            label: `Badge Unlocked: ${badge.label}`,
            detail: badge.description,
            value: 100,
          },
          { source: 'action', failRate: 0 },
        );

        // Dispatch browser celebration event for confetti
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('btc:milestone-celebrate', {
              detail: { label: badge.label, detail: badge.description },
            }),
          );
        }

        // Check if all regular badges earned -> award Story Scout master badge
        const regularBadges = next.filter((b) => b.id !== 'b-scout');
        const allRegularEarned = regularBadges.every((b) => b.earnedAtISO);
        if (allRegularEarned && badgeId !== 'b-scout') {
          setTimeout(() => get().award('b-scout'), 800);
        }

        return { ...badge, earnedAtISO };
      },

      touchStreak: () => {
        const state = get();
        const day = today();
        if (state.lastActiveDay === day) return state.streakDays;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const streak = state.lastActiveDay === yesterday ? state.streakDays + 1 : 1;
        set({ streakDays: streak, lastActiveDay: day });

        if (streak >= 3) {
          get().award('b-streaker');
        }
        return streak;
      },

      predict: (matchId, pick) => {
        const current = get().predictions;
        set({ predictions: { ...current, [matchId]: pick } });

        // Award predictor badge on first pick
        get().award('b-predictor');

        // Milestone event on every 3 predictions
        const total = Object.keys(get().predictions).length;
        if (total % 3 === 0) {
          emitWebhook(
            'milestone.reached',
            {
              label: `${total} Match Predictions Logged`,
              detail: 'Consistent match analysis contribution',
              value: total * 25,
            },
            { source: 'action', failRate: 0 },
          );
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('btc:milestone-celebrate', {
                detail: { label: `${total} Predictions!`, detail: 'Leaderboard rank boosted!' },
              }),
            );
          }
        }
      },

      getUserPoints: () => {
        const state = get();
        const earnedBadges = state.badges.filter((b) => b.earnedAtISO).length;
        const predCount = Object.keys(state.predictions).length;
        const streakBonus = state.streakDays * 15;
        const storiesLiked = state.likedStoryIds.length * 5;
        return earnedBadges * 50 + predCount * 25 + streakBonus + storiesLiked;
      },

      getLeaderboard: () => {
        const userPoints = get().getUserPoints();
        const userBadges = get().badges.filter((b) => b.earnedAtISO).length;

        const communityScouts: LeaderboardEntry[] = [
          { rank: 1, name: 'Pooja_Fan99', points: 340, badgeCount: 6 },
          { rank: 2, name: 'Ananya_Cricket', points: 285, badgeCount: 5 },
          { rank: 3, name: 'Maya_Scout', points: 240, badgeCount: 4 },
          { rank: 4, name: 'Zara_Analyst', points: 195, badgeCount: 4 },
          { rank: 5, name: 'Rhea_Spin', points: 140, badgeCount: 3 },
          { rank: 6, name: 'Fatima_CoverDrive', points: 95, badgeCount: 2 },
        ];

        // Insert local user dynamically based on points
        const userEntry: LeaderboardEntry = {
          rank: 0,
          name: 'You (Local Fan)',
          points: userPoints,
          badgeCount: userBadges,
          isUser: true,
        };

        const combined = [...communityScouts, userEntry].sort((a, b) => b.points - a.points);
        return combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      },
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
