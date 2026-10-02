import type { Athlete, Match, Moment, SportId, Story } from '@/types';
import { ATHLETES, ATHLETE_BY_ID } from './athletes';
import { MATCHES, MATCH_BY_ID, MOMENTS } from './matches';
import { STORIES, STORY_BY_ID } from './stories';
import { CROSS_SPORT_DATA } from './crosssport';

/* ==========================================================================
   Sport-agnostic selectors. Cricket is hand-authored; the other four sports
   come from the cross-sport engine. Everything upstream of here (api, pages,
   studio, parity) reads through these functions only.
   ========================================================================== */

export function allAthletes(sport: SportId): Athlete[] {
  if (sport === 'cricket') return ATHLETES;
  return CROSS_SPORT_DATA[sport]?.athletes ?? [];
}

export function allMatches(sport: SportId): Match[] {
  if (sport === 'cricket') return MATCHES;
  return CROSS_SPORT_DATA[sport]?.matches ?? [];
}

export function allMoments(sport: SportId): Moment[] {
  if (sport === 'cricket') return MOMENTS;
  return CROSS_SPORT_DATA[sport]?.moments ?? [];
}

export function allStories(sport: SportId): Story[] {
  if (sport === 'cricket') return STORIES;
  return CROSS_SPORT_DATA[sport]?.stories ?? [];
}

export function athleteById(id: string): Athlete | undefined {
  return (
    ATHLETE_BY_ID[id] ??
    Object.values(CROSS_SPORT_DATA).flatMap((b) => b.athletes).find((a) => a.id === id)
  );
}

export function matchById(id: string): Match | undefined {
  return (
    MATCH_BY_ID[id] ??
    Object.values(CROSS_SPORT_DATA).flatMap((b) => b.matches).find((m) => m.id === id)
  );
}

export function momentById(id: string): Moment | undefined {
  return (
    MOMENTS.find((m) => m.id === id) ??
    Object.values(CROSS_SPORT_DATA).flatMap((b) => b.moments).find((m) => m.id === id)
  );
}

export function storyById(id: string): Story | undefined {
  return (
    STORY_BY_ID[id] ??
    Object.values(CROSS_SPORT_DATA).flatMap((b) => b.stories).find((s) => s.id === id)
  );
}

export function momentsOfMatch(matchId: string): Moment[] {
  const found = allMoments(matchById(matchId)?.sport ?? 'cricket').filter((m) => m.matchId === matchId);
  return [...found].sort((a, b) => b.order - a.order);
}

export function storiesOfAthlete(sport: SportId, athleteId: string): Story[] {
  return allStories(sport).filter((s) => s.athleteIds.includes(athleteId));
}

export function storiesOfMatch(sport: SportId, matchId: string): Story[] {
  return allStories(sport).filter((s) => s.matchId === matchId);
}

export function storiesOfTheme(sport: SportId, theme: string): Story[] {
  return allStories(sport).filter((s) => s.theme === theme);
}

export function risingAthletes(sport: SportId, limit = 8): Athlete[] {
  return [...allAthletes(sport)].sort((a, b) => b.momentum - a.momentum).slice(0, limit);
}

export function liveMatches(sport: SportId): Match[] {
  return allMatches(sport).filter((m) => m.status === 'live');
}
