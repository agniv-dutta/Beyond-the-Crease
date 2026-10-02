import type { Sport } from '@/types';

export const SPORTS: Sport[] = [
  {
    id: 'cricket',
    label: 'Cricket',
    icon: 'circle-dot',
    tagline: 'Cricket-first. Every format, every over.',
    accent: 'pomelo',
    unit: 'runs',
    positionUnit: 'overs',
  },
  {
    id: 'football',
    label: 'Football',
    icon: 'circle',
    tagline: 'Same engine, different pitch.',
    accent: 'pistachio',
    unit: 'goals',
    positionUnit: 'minutes',
  },
  {
    id: 'tennis',
    label: 'Tennis',
    icon: 'circle-dot-dashed',
    tagline: 'Point by point, visibility point by point.',
    accent: 'kesar',
    unit: 'points',
    positionUnit: 'games',
  },
  {
    id: 'hockey',
    label: 'Hockey',
    icon: 'hexagon',
    tagline: 'Turf hockey, end-to-end visibility.',
    accent: 'rose',
    unit: 'goals',
    positionUnit: 'minutes',
  },
  {
    id: 'athletics',
    label: 'Athletics',
    icon: 'timer',
    tagline: 'Track, field, and the coverage gap that follows.',
    accent: 'silver',
    unit: 'seconds',
    positionUnit: 'laps',
  },
];

export const SPORT_BY_ID = Object.fromEntries(SPORTS.map((s) => [s.id, s])) as Record<
  Sport['id'],
  Sport
>;

export const SPORT_IDS = SPORTS.map((s) => s.id);
