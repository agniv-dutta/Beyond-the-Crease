import type { Team } from '@/types';

/* Fictional clubs. Cities and regions are real; every team name is invented. */
export const TEAMS: Team[] = [
  {
    id: 't-mav',
    name: 'Marigold Mavericks',
    short: 'MAV',
    sport: 'cricket',
    city: 'Mumbai',
    country: 'India',
    region: 'India · West',
    home: 'Sassoon Maidan, Mumbai',
    accent: 'pomelo',
    founded: 2016,
    titles: 3,
  },
  {
    id: 't-nil',
    name: 'Nilgiri Nightjars',
    short: 'NIL',
    sport: 'cricket',
    city: 'Coimbatore',
    country: 'India',
    region: 'India · South',
    home: 'Ukkadam Ground, Coimbatore',
    accent: 'kesar',
    founded: 2018,
    titles: 1,
  },
  {
    id: 't-kes',
    name: 'Kestrel Kites',
    short: 'KES',
    sport: 'cricket',
    city: 'Cape Town',
    country: 'South Africa',
    region: 'Africa · Southern',
    home: 'Kite Park, Cape Town',
    accent: 'pistachio',
    founded: 2015,
    titles: 4,
  },
  {
    id: 't-aur',
    name: 'Aurora Aces',
    short: 'AUR',
    sport: 'cricket',
    city: 'Auckland',
    country: 'New Zealand',
    region: 'Oceania',
    home: 'Aurora Oval, Auckland',
    accent: 'rose',
    founded: 2017,
    titles: 2,
  },
  {
    id: 't-fal',
    name: 'Desert Falcons',
    short: 'FAL',
    sport: 'cricket',
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    home: 'Falcon Sands, Dubai',
    accent: 'mulberry',
    founded: 2019,
    titles: 0,
  },
  {
    id: 't-gng',
    name: 'Ganga Ghats',
    short: 'GNG',
    sport: 'cricket',
    city: 'Lucknow',
    country: 'India',
    region: 'India · North',
    home: 'Ganga Ghats Oval, Lucknow',
    accent: 'kesar',
    founded: 2020,
    titles: 1,
  },
];

/* Cross-sport companion squads used by the sport switcher demo. */
export const CROSS_SPORT_TEAMS: Team[] = [
  {
    id: 'f-lyo',
    name: 'Saffron City FC',
    short: 'SCF',
    sport: 'football',
    city: 'Bengaluru',
    country: 'India',
    region: 'India · South',
    home: 'Saffron Arena, Bengaluru',
    accent: 'pistachio',
    founded: 2016,
    titles: 2,
  },
  {
    id: 'f-kau',
    name: 'Riverside Athletic',
    short: 'RVA',
    sport: 'football',
    city: 'Liverpool',
    country: 'England',
    region: 'Europe',
    home: 'Riverside Park, Liverpool',
    accent: 'pomelo',
    founded: 2014,
    titles: 5,
  },
  {
    id: 'n-ash',
    name: 'Baseline Collective',
    short: 'BSC',
    sport: 'tennis',
    city: 'Melbourne',
    country: 'Australia',
    region: 'Oceania',
    home: 'Baseline Courts, Melbourne',
    accent: 'kesar',
    founded: 2015,
    titles: 3,
  },
  {
    id: 'n-sur',
    name: 'Southern Coast Tennis',
    short: 'SCT',
    sport: 'tennis',
    city: 'Cape Town',
    country: 'South Africa',
    region: 'Africa · Southern',
    home: 'Coast Tennis Club, Cape Town',
    accent: 'rose',
    founded: 2018,
    titles: 1,
  },
];

export const TEAM_BY_ID = Object.fromEntries([...TEAMS, ...CROSS_SPORT_TEAMS].map((t) => [t.id, t])) as Record<
  string,
  Team
>;

export function teamName(id: string | undefined): string {
  if (!id) return 'Neutral side';
  return TEAM_BY_ID[id]?.name ?? 'Neutral side';
}

export function teamShort(id: string | undefined): string {
  if (!id) return '—';
  return TEAM_BY_ID[id]?.short ?? '—';
}
