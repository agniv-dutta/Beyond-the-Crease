import type { InningsScore, Match, Moment, MomentType } from '@/types';

/* ==========================================================================
   12 fictional matches: 3 live, 4 upcoming, 5 completed.
   Times are generated relative to load so the demo always looks "now".
   ========================================================================== */

const NOW = Date.now();
const iso = (minsAgo: number): string => new Date(NOW - minsAgo * 60_000).toISOString();
const isoAhead = (minsAhead: number): string => new Date(NOW + minsAhead * 60_000).toISOString();

const z: InningsScore = { runs: 0, wickets: 0, overs: 0 };

function score(runs: number, wickets: number, overs: number): InningsScore {
  return { runs, wickets, overs };
}

interface MomentSeed {
  matchId: string;
  order: number;
  ball: number;
  over: string;
  type: MomentType;
  text: string;
  short: string;
  batterId?: string;
  bowlerId?: string;
  runs: number;
  excitement: number;
  minsAgo: number;
  highlightClip?: boolean;
}

function moment(seed: MomentSeed): Moment {
  return {
    id: `m-${seed.matchId}-${seed.order}`,
    matchId: seed.matchId,
    order: seed.order,
    ball: seed.ball,
    over: seed.over,
    type: seed.type,
    text: seed.text,
    short: seed.short,
    batterId: seed.batterId,
    bowlerId: seed.bowlerId,
    runs: seed.runs,
    excitement: seed.excitement,
    atISO: iso(seed.minsAgo),
    highlightClip: seed.highlightClip,
  };
}

export const MATCHES: Match[] = [
  /* ------------------------------ LIVE ---------------------------------- */
  {
    id: 'match-mav-fal',
    sport: 'cricket',
    teamAId: 't-mav',
    teamBId: 't-fal',
    venue: 'Sassoon Maidan',
    city: 'Mumbai',
    region: 'India · West',
    status: 'live',
    format: 'Twenty20 · Match 18',
    startsAtISO: iso(74),
    innings: 2,
    scoreA: score(142, 3, 18.4),
    scoreB: score(58, 1, 7.2),
    winProbabilityA: 74,
    toss: 'Desert Falcons won the toss and fielded first',
    attendance: 18_420,
    reachMillions: 4.2,
    storyCount: 11,
    topMomentIds: ['m-match-mav-fal-1', 'm-match-mav-fal-2', 'm-match-mav-fal-3'],
    circleId: 'c-watch',
  },
  {
    id: 'match-kes-aur',
    sport: 'cricket',
    teamAId: 't-kes',
    teamBId: 't-aur',
    venue: 'Kite Park',
    city: 'Cape Town',
    region: 'Africa · Southern',
    status: 'live',
    format: 'Twenty20 · Match 18',
    startsAtISO: iso(38),
    innings: 1,
    scoreA: score(96, 2, 13.1),
    scoreB: z,
    winProbabilityA: 63,
    toss: 'Kestrel Kites elected to field',
    attendance: 6_180,
    reachMillions: 2.8,
    storyCount: 6,
    topMomentIds: ['m-match-kes-aur-1', 'm-match-kes-aur-2'],
    circleId: 'c-kes',
  },
  {
    id: 'match-gng-nil',
    sport: 'cricket',
    teamAId: 't-gng',
    teamBId: 't-nil',
    venue: 'Ganga Ghats Oval',
    city: 'Lucknow',
    region: 'India · North',
    status: 'live',
    format: 'Twenty20 · Match 17',
    startsAtISO: iso(96),
    innings: 2,
    scoreA: score(78, 4, 11.3),
    scoreB: score(171, 2, 20),
    winProbabilityA: 16,
    toss: 'Nilgiri Nightjars chose to bowl',
    attendance: 9_940,
    reachMillions: 3.6,
    storyCount: 9,
    topMomentIds: ['m-match-gng-nil-1', 'm-match-gng-nil-2'],
    circleId: 'c-coaches',
  },

  /* ------------------------------ UPCOMING ------------------------------ */
  {
    id: 'match-aur-mav',
    sport: 'cricket',
    teamAId: 't-aur',
    teamBId: 't-mav',
    venue: 'Aurora Oval',
    city: 'Auckland',
    region: 'Oceania',
    status: 'upcoming',
    format: 'Twenty20 · Match 19',
    startsAtISO: isoAhead(310),
    innings: 1,
    scoreA: z,
    scoreB: z,
    winProbabilityA: 50,
    attendance: 12_000,
    reachMillions: 2.1,
    storyCount: 4,
    topMomentIds: [],
    circleId: 'c-watch',
  },
  {
    id: 'match-nil-kes',
    sport: 'cricket',
    teamAId: 't-nil',
    teamBId: 't-kes',
    venue: 'Ukkadam Ground',
    city: 'Coimbatore',
    region: 'India · South',
    status: 'upcoming',
    format: 'Twenty20 · Match 19',
    startsAtISO: isoAhead(1_450),
    innings: 1,
    scoreA: z,
    scoreB: z,
    winProbabilityA: 44,
    attendance: 7_600,
    reachMillions: 1.6,
    storyCount: 2,
    topMomentIds: [],
    circleId: 'c-tamil',
  },
  {
    id: 'match-fal-gng',
    sport: 'cricket',
    teamAId: 't-fal',
    teamBId: 't-gng',
    venue: 'Falcon Sands',
    city: 'Dubai',
    region: 'Middle East',
    status: 'upcoming',
    format: 'Twenty20 · Match 20',
    startsAtISO: isoAhead(2_980),
    innings: 1,
    scoreA: z,
    scoreB: z,
    winProbabilityA: 52,
    attendance: 5_400,
    reachMillions: 1.2,
    storyCount: 1,
    topMomentIds: [],
    circleId: 'c-arabic',
  },
  {
    id: 'match-kes-nil',
    sport: 'cricket',
    teamAId: 't-kes',
    teamBId: 't-nil',
    venue: 'Kite Park',
    city: 'Cape Town',
    region: 'Africa · Southern',
    status: 'upcoming',
    format: 'Twenty20 · Eliminator',
    startsAtISO: isoAhead(4_400),
    innings: 1,
    scoreA: z,
    scoreB: z,
    winProbabilityA: 58,
    attendance: 15_000,
    reachMillions: 3.4,
    storyCount: 3,
    topMomentIds: [],
    circleId: 'c-watch',
  },

  /* ------------------------------ COMPLETED ----------------------------- */
  {
    id: 'match-mav-gng',
    sport: 'cricket',
    teamAId: 't-mav',
    teamBId: 't-gng',
    venue: 'Sassoon Maidan',
    city: 'Mumbai',
    region: 'India · West',
    status: 'completed',
    format: 'Twenty20 · Match 16',
    startsAtISO: iso(2_760),
    innings: 2,
    scoreA: score(189, 4, 20),
    scoreB: score(164, 7, 20),
    winProbabilityA: 100,
    result: 'Marigold Mavericks won by 25 runs',
    toss: 'Ganga Ghats chose to field',
    attendance: 21_300,
    reachMillions: 5.1,
    storyCount: 14,
    topMomentIds: [],
    circleId: 'c-watch',
  },
  {
    id: 'match-aur-kes',
    sport: 'cricket',
    teamAId: 't-aur',
    teamBId: 't-kes',
    venue: 'Aurora Oval',
    city: 'Auckland',
    region: 'Oceania',
    status: 'completed',
    format: 'Twenty20 · Match 15',
    startsAtISO: iso(4_320),
    innings: 2,
    scoreA: score(143, 6, 20),
    scoreB: score(146, 4, 19.2),
    winProbabilityA: 0,
    result: 'Kestrel Kites won by 4 wickets',
    toss: 'Aurora Aces elected to bat',
    attendance: 8_240,
    reachMillions: 2.9,
    storyCount: 8,
    topMomentIds: [],
    circleId: 'c-kes',
  },
  {
    id: 'match-nil-mav',
    sport: 'cricket',
    teamAId: 't-nil',
    teamBId: 't-mav',
    venue: 'Ukkadam Ground',
    city: 'Coimbatore',
    region: 'India · South',
    status: 'completed',
    format: 'Twenty20 · Match 14',
    startsAtISO: iso(7_200),
    innings: 2,
    scoreA: score(128, 8, 20),
    scoreB: score(129, 5, 18.5),
    winProbabilityA: 0,
    result: 'Marigold Mavericks won by 4 wickets',
    toss: 'Nilgiri Nightjars elected to field',
    attendance: 6_900,
    reachMillions: 1.8,
    storyCount: 11,
    topMomentIds: [],
    circleId: 'c-tamil',
  },
  {
    id: 'match-fal-nil',
    sport: 'cricket',
    teamAId: 't-fal',
    teamBId: 't-nil',
    venue: 'Falcon Sands',
    city: 'Dubai',
    region: 'Middle East',
    status: 'completed',
    format: 'Twenty20 · Match 13',
    startsAtISO: iso(10_060),
    innings: 2,
    scoreA: score(167, 3, 20),
    scoreB: score(132, 9, 17.2),
    winProbabilityA: 100,
    result: 'Desert Falcons won by 35 runs',
    toss: 'Desert Falcons chose to bat',
    attendance: 5_100,
    reachMillions: 1.4,
    storyCount: 7,
    topMomentIds: [],
    circleId: 'c-arabic',
  },
  {
    id: 'match-gng-aur',
    sport: 'cricket',
    teamAId: 't-gng',
    teamBId: 't-aur',
    venue: 'Ganga Ghats Oval',
    city: 'Lucknow',
    region: 'India · North',
    status: 'completed',
    format: 'Twenty20 · Match 12',
    startsAtISO: iso(13_000),
    innings: 2,
    scoreA: score(155, 5, 20),
    scoreB: score(156, 3, 18),
    winProbabilityA: 0,
    result: 'Aurora Aces won by 7 wickets',
    toss: 'Ganga Ghats elected to field',
    attendance: 10_600,
    reachMillions: 2.7,
    storyCount: 6,
    topMomentIds: [],
    circleId: 'c-coaches',
  },
];

export const MATCH_BY_ID = Object.fromEntries(MATCHES.map((m) => [m.id, m])) as Record<string, Match>;

export const MOMENTS: Moment[] = [
  moment({ matchId: 'match-mav-fal', order: 1, ball: 3, over: '16.2', type: 'milestone', text: 'Ishara Venkataraman brings up a fifty off 41 balls, having come in at 2 for 34.', short: 'Fifty for Venkataraman', batterId: 'a-venk', runs: 1, excitement: 92, minsAgo: 68, highlightClip: true }),
  moment({ matchId: 'match-mav-fal', order: 2, ball: 1, over: '17.1', type: 'six', text: 'Poornima Balaji clears the front foot for six — first ball of the over, 92 metres.', short: 'Six! Balaji clears front foot', batterId: 'a-balaj', runs: 6, excitement: 88, minsAgo: 41, highlightClip: true }),
  moment({ matchId: 'match-mav-fal', order: 3, ball: 4, over: '17.4', type: 'wicket', text: 'Hessa Al-Mansoori is caught at long-on. The Desert Falcons need 71 from 22.', short: 'Mansoori caught long-on', batterId: 'a-mans', bowlerId: 'a-somp', runs: 0, excitement: 80, minsAgo: 33, highlightClip: true }),
  moment({ matchId: 'match-mav-fal', order: 4, ball: 3, over: '18.3', type: 'boundary', text: 'Four runs through midwicket. Score 142 for 3.', short: 'Four through midwicket', batterId: 'a-venk', runs: 4, excitement: 46, minsAgo: 12 }),
  moment({ matchId: 'match-mav-fal', order: 5, ball: 2, over: '18.4', type: 'boundary', text: 'Two more to the same place. Marigold Mavericks 142 for 3 after 18.4.', short: 'Two more, same place', batterId: 'a-venk', runs: 2, excitement: 38, minsAgo: 6 }),
  moment({ matchId: 'match-mav-fal', order: 6, ball: 5, over: '19.1', type: 'drill', text: 'Noora Rahman takes the ball at the top of the circle and sends it straight down the ground.', short: 'Rahman goes long', batterId: 'a-rahma', runs: 4, excitement: 52, minsAgo: 2 }),

  moment({ matchId: 'match-kes-aur', order: 1, ball: 2, over: '11.2', type: 'wicket', text: 'Tui Foley takes a hat-trick ball — caught at cover. Karabo Moagi walks in at 62 for 2.', short: 'Foley has a hat-trick ball', bowlerId: 'a-fole', runs: 0, excitement: 84, minsAgo: 30, highlightClip: true }),
  moment({ matchId: 'match-kes-aur', order: 2, ball: 5, over: '12.5', type: 'six', text: 'Thandiwe Mabaso brings up her fifty with a straight six over midwicket.', short: 'Mabaso fifty, straight six', batterId: 'a-maba', runs: 6, excitement: 86, minsAgo: 14, highlightClip: true }),
  moment({ matchId: 'match-kes-aur', order: 3, ball: 1, over: '13.1', type: 'boundary', text: 'Sienna Whitlock bowls, Marama Te Rangi takes a single into the leg side.', short: 'Single into the leg', batterId: 'a-rang', bowlerId: 'a-whit', runs: 1, excitement: 30, minsAgo: 4 }),

  moment({ matchId: 'match-gng-nil', order: 1, ball: 6, over: '14.6', type: 'wicket', text: 'Aishwarya Pathak is bowled for 62. The Ghats are 118 for 4 and folding.', short: 'Pathak bowled for 62', batterId: 'a-path', bowlerId: 'a-seth', runs: 0, excitement: 78, minsAgo: 62, highlightClip: true }),
  moment({ matchId: 'match-gng-nil', order: 2, ball: 4, over: '12.4', type: 'milestone', text: 'Meenakshi Iyengar finishes the Nightjars innings unbeaten on 74 — the highest of her season.', short: 'Iyengar 74* seals it', batterId: 'a-iyen', runs: 4, excitement: 82, minsAgo: 74, highlightClip: true }),
  moment({ matchId: 'match-gng-nil', order: 3, ball: 2, over: '8.2', type: 'review', text: 'A lbw review that goes upstairs and comes down not out. Ghats keep their review.', short: 'Lbw review survives', batterId: 'a-chau', runs: 0, excitement: 58, minsAgo: 95 }),
];

export const MOMENTS_BY_MATCH: Record<string, Moment[]> = MOMENTS.reduce<Record<string, Moment[]>>(
  (acc, m) => {
    (acc[m.matchId] ||= []).push(m);
    return acc;
  },
  {},
);

export const LIVE_MATCHES = MATCHES.filter((m) => m.status === 'live');

export function matchHeadline(match: Match): string {
  if (match.status === 'live') {
    const lead = match.innings === 1 ? `${match.scoreA.runs}/${match.scoreA.wickets}` : `${match.scoreA.runs}/${match.scoreA.wickets} v ${match.scoreB.runs}/${match.scoreB.wickets}`;
    return `${lead} · ${match.format}`;
  }
  if (match.status === 'completed') return match.result ?? 'Completed';
  return `Starts ${new Date(match.startsAtISO).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`;
}
