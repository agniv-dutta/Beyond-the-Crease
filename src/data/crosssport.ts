import type { Athlete, Match, Moment, SportId, Story } from '@/types';
import { CROSS_SPORT_TEAMS } from './teams';

/* ==========================================================================
   Cross-sport engine (E4). Cricket is hand-authored; the other four sports are
   generated from the same typed shapes so switching sport never breaks a screen.
   All names, clubs and figures are fictional.
   ========================================================================== */

const NOW = Date.now();
const iso = (minsAgo: number): string => new Date(NOW - minsAgo * 60_000).toISOString();
const isoAhead = (minsAhead: number): string => new Date(NOW + minsAhead * 60_000).toISOString();

interface SportTemplate {
  sport: SportId;
  roles: Athlete['role'][];
  cities: { city: string; country: string; region: string }[];
  surnames: string[];
  firstNames: string[];
  matchFormat: string;
  venues: string[];
  units: { score: string; secondary: string };
  arcs: string[];
}

const TEMPLATES: SportTemplate[] = [
  {
    sport: 'football',
    roles: ['All-rounder', 'Batter', 'Fast bowler', 'Wicketkeeper', 'Medium bowler'],
    cities: [
      { city: 'Bengaluru', country: 'India', region: 'India · South' },
      { city: 'Liverpool', country: 'England', region: 'Europe' },
    ],
    surnames: ['Vasquez', 'Okonkwo', 'Lindqvist', 'Marchetti', 'Devaraj', 'Halvorsen', 'Baptiste', 'Sørensen'],
    firstNames: ['Amara', 'Priya', 'Noor', 'Ingrid', 'Zainab', 'Théo', 'Marta', 'Salma'],
    matchFormat: 'Women\u2019s League · Round 9',
    venues: ['Saffron Arena, Bengaluru', 'Riverside Park, Liverpool'],
    units: { score: 'goals', secondary: 'saves' },
    arcs: [
      'Started in a five-a-side league with no changing rooms',
      'Called up after a keeper injured herself ten minutes before kick-off',
      'Scored the goal that kept a club in the division',
      'Captained the first side she had ever been respected by',
      'Spent a season at another club on a youth contract, returned home, and was better for it',
    ],
  },
  {
    sport: 'tennis',
    roles: ['All-rounder', 'Batter', 'Fast bowler', 'Leg spinner', 'Off spinner'],
    cities: [
      { city: 'Melbourne', country: 'Australia', region: 'Oceania' },
      { city: 'Cape Town', country: 'South Africa', region: 'Africa · Southern' },
    ],
    surnames: ['Delgado', 'Nakamura', 'Ferreira', 'Olsen', 'Chandra', 'Bennani', 'Kaur', 'Petrova'],
    firstNames: ['Sofia', 'Aiko', 'Lindiwe', 'Rikke', 'Pavleen', 'Yasmine', 'Greta', 'Nadia'],
    matchFormat: 'Tour Open · Round 4',
    venues: ['Baseline Courts, Melbourne', 'Coast Tennis Club, Cape Town'],
    units: { score: 'sets', secondary: 'break points' },
    arcs: [
      'Learned on a public court with one racket and a shared bag of balls',
      'Gave up the game for two years and came back at 24',
      'Won a round nobody seeded her into',
      'Broke serve four times in one match and nobody wrote about it',
      'Played a full season on her own money',
    ],
  },
  {
    sport: 'hockey',
    roles: ['All-rounder', 'Batter', 'Fast bowler', 'Wicketkeeper', 'Medium bowler'],
    cities: [
      { city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
      { city: 'Lahore', country: 'Pakistan', region: 'Asia' },
    ],
    surnames: ['Bakhshi', 'Vermeulen', 'Rahim', 'Novák', 'Steenkamp', 'Iqbal', 'Jansen', 'Ahmadi'],
    firstNames: ['Mariam', 'Sanne', 'Ayesha', 'Klára', 'Nadia', 'Fatima', 'Jorien', 'Rukhsana'],
    matchFormat: 'Pro League · Round 7',
    venues: ['Turfpark Noord, Amsterdam', 'City Hockey Stadium, Lahore'],
    units: { score: 'goals', secondary: 'penalty corners' },
    arcs: [
      'Started on a waterlogged pitch with a stick borrowed from a brother',
      'Trialed three times before a club gave a contract',
      'Earned a place after the coach saw her play on the wrong side',
      'Scored the only goal in a shoot-out',
      'Became the first player from her district on a national squad',
    ],
  },
  {
    sport: 'athletics',
    roles: ['All-rounder', 'Batter', 'Fast bowler', 'Medium bowler', 'Off spinner'],
    cities: [
      { city: 'Nairobi', country: 'Kenya', region: 'Africa · Eastern' },
      { city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia' },
    ],
    surnames: ['Wanjiru', 'Rahman', 'Oduya', 'Sipala', 'Kimani', 'Fadhil', 'Mwangi', 'Aziz'],
    firstNames: ['Neema', 'Aisha', 'Wanjiku', 'Lilian', 'Halima', 'Adaeze', 'Fatuma', 'Imani'],
    matchFormat: 'Continental Circuit · Meeting 5',
    venues: ['Nyayo National Stadium, Nairobi', 'Taman Plaza, Kuala Lumpur'],
    units: { score: 'events', secondary: 'personal bests' },
    arcs: [
      'Ran the 400m at fourteen because it was the only event left',
      'Took two years off with an injury nobody took seriously',
      'Qualified for a major championship by 0.04 seconds',
      'Moved across four countries in one season',
      'Broke a national record in a meet that finished before the local paper printed',
    ],
  },
];

const MOTIFS: Story['motif'][] = ['kesar', 'rose', 'pistachio', 'pomelo', 'silver', 'mulberry'];
const THEMES: Story['theme'][] = ['Comeback', 'Debut', 'Records', 'Leadership', 'Grassroots'];

function buildSport(template: SportTemplate, index: number) {
  const rand = mulberry(9_000 + index * 131);
  const teams = CROSS_SPORT_TEAMS.filter((t) => t.sport === template.sport);
  const pool = teams.length >= 2 ? teams : CROSS_SPORT_TEAMS.slice(0, 2);

  const athletes: Athlete[] = template.firstNames.map((first, i) => {
    const surname = template.surnames[(i + index) % template.surnames.length];
    const name = `${first} ${surname}`;
    const team = pool[i % pool.length];
    const role = template.roles[i % template.roles.length];
    const age = 19 + Math.floor(rand() * 12);
    const arcTitles = [0, 1, 2, 3].map((k) => ({
      year: 2016 + k * 3,
      title: template.arcs[(i + k) % template.arcs.length],
      body: `${name} (${team.name}) — fictional demo biography. ${template.arcs[(i + k) % template.arcs.length]} is a narrative placeholder used to exercise the profile timeline in the Beyond the Crease prototype.`,
      kind: (['origin', 'struggle', 'breakthrough', 'now'] as const)[k],
    }));

    return {
      id: `x-${template.sport}-a${i}`,
      name,
      initials: (first[0] + surname[0]).toUpperCase(),
      sport: template.sport,
      teamId: team.id,
      role,
      captain: i === 0,
      country: team.country,
      region: team.region,
      languages: i % 4 === 0 ? (['en', 'es'] as const) : (['en'] as const),
      age,
      bio: `${name} plays ${role.toLowerCase()} for ${team.name} in the ${template.sport} dataset of the Beyond the Crease prototype. Every figure here is simulated.`,
      quote: 'Simulated athlete quote — replace with a real interview.',
      signature: { label: 'Signature stat', value: `${40 + Math.floor(rand() * 60)}%`, note: 'simulated' },
      themes: [THEMES[i % THEMES.length], THEMES[(i + 2) % THEMES.length]],
      followers: Math.round(20_000 + rand() * 380_000),
      momentum: 30 + Math.floor(rand() * 68),
      featuredShare: Number((0.1 + rand() * 0.35).toFixed(2)),
      visibilityScore: 30 + Math.floor(rand() * 60),
      stats: {
        matches: 20 + Math.floor(rand() * 120),
        runs: Math.round(rand() * 3000),
        wickets: Math.round(rand() * 120),
        battingAverage: Number((20 + rand() * 30).toFixed(1)),
        strikeRate: Number((70 + rand() * 70).toFixed(1)),
        overs: Math.round(rand() * 500),
        wicketsPerOver: Number(rand().toFixed(2)),
        bestInnings: `${2 + Math.floor(rand() * 4)}/${8 + Math.floor(rand() * 20)}`,
        highestScore: Math.round(20 + rand() * 100),
        winContribution: Number((0.4 + rand() * 0.35).toFixed(2)),
      },
      arc: arcTitles,
      spotlightStoryIds: [],
      gallery: [
        { caption: 'Simulated gallery image', tone: 'kesar' },
        { caption: 'Simulated gallery image', tone: 'rose' },
      ],
    };
  });

  const matches: Match[] = [0, 1, 2, 3].map((k) => {
    const a = pool[k % pool.length];
    const b = pool[(k + 1) % pool.length];
    const status = k === 0 ? 'live' : k === 1 ? 'upcoming' : 'completed';
    const wA = 10 + Math.floor(rand() * 90);
    return {
      id: `x-${template.sport}-m${k}`,
      sport: template.sport,
      teamAId: a.id,
      teamBId: b.id,
      venue: template.venues[k % template.venues.length],
      city: a.city,
      region: a.region,
      status,
      format: template.matchFormat,
      startsAtISO: status === 'upcoming' ? isoAhead(600 + k * 900) : iso(30 + k * 900),
      innings: status === 'live' ? 2 : 2,
      scoreA: { runs: wA, wickets: Math.floor(rand() * 4), overs: 20 },
      scoreB: { runs: wA + Math.floor(rand() * 40 - 20), wickets: Math.floor(rand() * 4), overs: 20 },
      winProbabilityA: 30 + Math.floor(rand() * 45),
      result: status === 'completed' ? `${a.name} won by ${1 + Math.floor(rand() * 4)}` : undefined,
      toss: 'Toss not recorded',
      attendance: Math.round(2_000 + rand() * 20_000),
      reachMillions: Number((0.4 + rand() * 3).toFixed(1)),
      storyCount: 2 + Math.floor(rand() * 8),
      topMomentIds: [],
      circleId: 'c-watch',
    } satisfies Match;
  });

  const moments: Moment[] = matches
    .filter((m) => m.status === 'live')
    .flatMap((m, mi) =>
      [0, 1, 2].map((k) => ({
        id: `x-${m.id}-mom${k}`,
        matchId: m.id,
        order: k,
        ball: k * 3 + 1,
        over: `${18 + k}.${k}`,
        type: (['six', 'wicket', 'boundary'] as const)[k],
        text: `Simulated ${template.sport} moment ${k + 1} — ${athletes[k % athletes.length].name}.`,
        short: `${athletes[k % athletes.length].name.split(' ')[1]} moment`,
        batterId: athletes[k % athletes.length].id,
        runs: [3, 0, 1][k],
        excitement: 80 - k * 12,
        atISO: iso(14 - k * 4 - mi),
        highlightClip: k === 0,
      })),
    );

  const stories: Story[] = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
    const athlete = athletes[k % athletes.length];
    return {
      id: `x-${template.sport}-s${k}`,
      sport: template.sport,
      theme: THEMES[k % THEMES.length],
      title: `${athlete.name.split(' ')[1]} and the ${template.arcs[k % template.arcs.length].toLowerCase()}`,
      summary: `A ${template.sport} story card generated from the cross-sport template to demonstrate that the feed, studio and parity screens are sport-agnostic.`,
      body: `${athlete.name} plays for ${pool[k % pool.length].name}. This card exists to prove the same rendering path serves ${template.sport} without a separate codebase.\n\nEverything here is simulated demo content. The cross-sport engine in /src/data/crosssport.ts builds athletes, matches, moments and stories from one typed template per sport, which is the point: a real deployment would swap this module for a per-sport feed adapter behind the same api layer.`,
      tags: [template.sport, THEMES[k % THEMES.length]],
      readingMinutes: 1,
      athleteIds: [athlete.id],
      teamId: athlete.teamId,
      kind: k % 3 === 0 ? 'community' : 'editorial',
      authorName: 'Beyond the Crease Desk',
      publishedAtISO: iso(180 + k * 1_400),
      likes: 400 + k * 260,
      saves: 60 + k * 30,
      shares: 24 + k * 14,
      listens: 180 + k * 90,
      translations: {},
      motif: MOTIFS[k % MOTIFS.length],
      fairScore: 98,
    } satisfies Story;
  });

  return { athletes, matches, moments, stories };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mulberry(seed: number): () => number {
  return mulberry32(seed);
}

export interface CrossSportBundle {
  athletes: Athlete[];
  matches: Match[];
  moments: Moment[];
  stories: Story[];
}

const built = TEMPLATES.map((t, i) => buildSport(t, i));

export const CROSS_SPORT_DATA: Record<string, CrossSportBundle> = built.reduce(
  (acc, bundle, i) => {
    acc[TEMPLATES[i].sport] = bundle;
    return acc;
  },
  {} as Record<string, CrossSportBundle>,
);

export const CROSS_SPORT_IDS = TEMPLATES.map((t) => t.sport);
