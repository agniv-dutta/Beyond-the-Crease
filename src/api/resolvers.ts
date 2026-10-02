import type {
  Athlete,
  Circle,
  CircleMessage,
  LanguageCode,
  Match,
  Moment,
  Platform,
  SportId,
  Story,
  Theme,
} from '@/types';
import {
  allAthletes,
  allMatches,
  allMoments,
  allStories,
  athleteById,
  matchById,
  momentsOfMatch,
  storyById,
} from '@/data/selectors';
import { CIRCLES, CIRCLE_BY_ID, SEED_MESSAGES } from '@/data/circles';
import { ATHLETE_BY_ID } from '@/data/athletes';
import { MATCHES, MOMENTS } from '@/data/matches';
import { STORIES } from '@/data/stories';
import { aggregate, filterRows, parityProjection, platformBreakdown, regionHeatmap, series } from '@/data/visibility';
import { TEAM_BY_ID } from '@/data/teams';
import { generateStory } from './storyEngine';

/* ==========================================================================
   Pure resolvers. MSW serves them over HTTP, and the api client falls back to
   them directly if the service worker is unavailable. One implementation, two
   transports — swapping in a real backend means deleting the MSW layer only.
   ========================================================================== */

export interface ResolverCtx {
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, unknown> | undefined;
}

export interface FeedQuery {
  stories: Story[];
  nextCursor: number | null;
  total: number;
}

export interface FeedFilters {
  sport: SportId;
  theme?: Theme | 'All';
  teamId?: string;
  athleteId?: string;
  matchId?: string;
  maxReadingMinutes?: number;
  query?: string;
  sort?: 'recent' | 'popular';
}

export interface ParityPayload {
  metric: ReturnType<typeof aggregate>;
  series: ReturnType<typeof series>;
  platforms: ReturnType<typeof platformBreakdown>;
  regions: ReturnType<typeof regionHeatmap>;
  projection: number | null;
  csv: string;
}

function sportFrom(ctx: ResolverCtx): SportId {
  const raw = (ctx.query.get('sport') ?? 'cricket') as SportId;
  return ['cricket', 'football', 'tennis', 'hockey', 'athletics'].includes(raw) ? raw : 'cricket';
}

/* ---------------------------------------------------------------------- feed */

export function resolveFeed(ctx: ResolverCtx): FeedQuery {
  const sport = sportFrom(ctx);
  const theme = (ctx.query.get('theme') ?? 'All') as Theme | 'All';
  const teamId = ctx.query.get('teamId') ?? '';
  const athleteId = ctx.query.get('athleteId') ?? '';
  const matchId = ctx.query.get('matchId') ?? '';
  const maxMinutes = Number(ctx.query.get('maxReadingMinutes') ?? '99');
  const query = (ctx.query.get('q') ?? '').trim().toLowerCase();
  const sort = (ctx.query.get('sort') ?? 'recent') as 'recent' | 'popular';
  const limit = Math.min(24, Math.max(1, Number(ctx.query.get('limit') ?? '9')));
  const cursor = Math.max(0, Number(ctx.query.get('cursor') ?? '0'));

  let stories = allStories(sport);

  if (theme !== 'All') stories = stories.filter((s) => s.theme === theme);
  if (teamId) stories = stories.filter((s) => s.teamId === teamId);
  if (athleteId) stories = stories.filter((s) => s.athleteIds.includes(athleteId));
  if (matchId) stories = stories.filter((s) => s.matchId === matchId);
  if (maxMinutes < 99) stories = stories.filter((s) => s.readingMinutes <= maxMinutes);
  if (query) {
    stories = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.summary.toLowerCase().includes(query) ||
        s.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }

  stories = [...stories].sort((a, b) => {
    if (sort === 'popular') return b.likes + b.saves - (a.likes + a.saves);
    return new Date(b.publishedAtISO).getTime() - new Date(a.publishedAtISO).getTime();
  });

  const page = stories.slice(cursor, cursor + limit);
  const next = cursor + limit < stories.length ? cursor + limit : null;
  return { stories: page, nextCursor: next, total: stories.length };
}

/* ------------------------------------------------------------------- athletes */

export function resolveAthletes(ctx: ResolverCtx): Athlete[] {
  const sport = sportFrom(ctx);
  const query = (ctx.query.get('q') ?? '').trim().toLowerCase();
  const teamId = ctx.query.get('teamId') ?? '';
  const role = ctx.query.get('role') ?? '';
  const lang = (ctx.query.get('lang') ?? '') as LanguageCode | '';
  const sort = ctx.query.get('sort') ?? 'momentum';

  let list = allAthletes(sport);
  if (query) list = list.filter((a) => a.name.toLowerCase().includes(query) || a.role.toLowerCase().includes(query));
  if (teamId) list = list.filter((a) => a.teamId === teamId);
  if (role) list = list.filter((a) => a.role === role);
  if (lang) list = list.filter((a) => a.languages.includes(lang));

  const sorted = [...list];
  if (sort === 'momentum') sorted.sort((a, b) => b.momentum - a.momentum);
  else if (sort === 'followers') sorted.sort((a, b) => b.followers - a.followers);
  else if (sort === 'visibility') sorted.sort((a, b) => b.visibilityScore - a.visibilityScore);
  else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

/* --------------------------------------------------------------------- match */

export interface MatchPayload {
  match: Match;
  moments: Moment[];
  stories: Story[];
  athletes: Athlete[];
  winProbabilityA: number;
}

export function resolveMatch(id: string, ctx: ResolverCtx): MatchPayload {
  void ctx;
  const match = matchById(id);
  if (!match) throw new ApiError(404, `No match with id "${id}"`);
  const moments = momentsOfMatch(match.id);
  const involved = allAthletes(match.sport).filter(
    (a) => a.teamId === match.teamAId || a.teamId === match.teamBId,
  );
  const involvedIds = new Set(involved.map((a) => a.id));
  const stories = allStories(match.sport)
    .filter((s) => s.matchId === match.id || s.athleteIds.some((aid) => involvedIds.has(aid)))
    .slice(0, 12);
  return {
    match,
    moments,
    stories,
    athletes: involved,
    winProbabilityA: match.winProbabilityA,
  };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/* --------------------------------------------------------------------- parity */

export function resolveParity(ctx: ResolverCtx): ParityPayload {
  const sport = sportFrom(ctx);
  const region = ctx.query.get('region') ?? 'All';
  const platform = (ctx.query.get('platform') ?? 'All') as Platform | 'All';
  const months = Number(ctx.query.get('months') ?? '24') as 6 | 12 | 24;
  const growth = Number(ctx.query.get('growth') ?? '4.4');

  const rows = filterRows({ sport, region, platform, months });
  return {
    metric: aggregate(rows),
    series: series({ sport, region, platform, months }),
    platforms: platformBreakdown({ sport, region, months }),
    regions: regionHeatmap({ sport, months }),
    projection: parityProjection(growth),
    csv: toCsv(rows),
  };
}

export function toCsv(rows: ReturnType<typeof filterRows>): string {
  const header = [
    'month',
    'sport',
    'region',
    'platform',
    'media_minutes_women',
    'media_minutes_men',
    'social_mentions_women',
    'social_mentions_men',
    'sponsor_share_women_pct',
    'sponsor_share_men_pct',
    'highlight_clips_women',
    'highlight_clips_men',
  ].join(',');
  const body = rows.map((r) =>
    [
      r.monthISO,
      r.sport,
      `"${r.region}"`,
      r.platform,
      r.mediaMinutesWomen,
      r.mediaMinutesMen,
      r.socialMentionsWomen,
      r.socialMentionsMen,
      r.sponsorShareWomen,
      r.sponsorShareMen,
      r.highlightClipsWomen,
      r.highlightClipsMen,
    ].join(','),
  );
  return [header, ...body].join('\n');
}

/* -------------------------------------------------------------------- circles */

export function resolveCircles(): Circle[] {
  return CIRCLES;
}

export function resolveCircle(id: string): Circle & { messages: CircleMessage[] } {
  const circle = CIRCLE_BY_ID[id];
  if (!circle) throw new ApiError(404, `No circle with id "${id}"`);
  return { ...circle, messages: SEED_MESSAGES[id] ?? [] };
}

export function resolveMessages(id: string): CircleMessage[] {
  if (!CIRCLE_BY_ID[id]) throw new ApiError(404, `No circle with id "${id}"`);
  return SEED_MESSAGES[id] ?? [];
}

/* ------------------------------------------------------------------- generate */

export function resolveGenerate(ctx: ResolverCtx) {
  const body = ctx.body ?? {};
  const circleId = body.circleId as string | undefined;
  const circle = circleId ? CIRCLE_BY_ID[circleId] : undefined;
  if (circleId && !circle) throw new ApiError(404, `No circle with id "${circleId}"`);

  /** A circle draft inherits its subject from what the room is actually watching. */
  const pinnedStory = circle?.pinnedStoryId ? storyById(circle.pinnedStoryId) : undefined;
  const circleMatch = circle?.events.find((e) => e.matchId);

  const athleteId =
    (body.athleteId as string | undefined) ?? pinnedStory?.athleteIds[0] ?? undefined;
  const matchId =
    (body.matchId as string | undefined) ??
    pinnedStory?.matchId ??
    circleMatch?.matchId ??
    undefined;
  const momentId = body.momentId as string | undefined;
  const match = matchId ? matchById(matchId) : undefined;
  const sport =
    (body.sport as SportId) ?? match?.sport ?? circle?.sport ?? (athleteId ? athleteById(athleteId)?.sport : undefined) ?? 'cricket';
  return generateStory({
    athlete: athleteId ? athleteById(athleteId) : undefined,
    match,
    moment: momentId ? allMoments(sport).find((m) => m.id === momentId) : undefined,
    tone: (body.tone as never) ?? 'cinematic',
    format: (body.format as never) ?? (circle ? 'recap' : 'headline'),
    length: Number(body.length ?? 55),
    language: (body.language as LanguageCode) ?? circle?.languages[0] ?? 'en',
    seed: body.seed as number | undefined,
  });
}

/* -------------------------------------------------------------------- routing */

export type ResolverHandler = (ctx: ResolverCtx) => unknown;

export interface Route {
  method: string;
  /** Path template as written, e.g. "/api/match/:id". */
  path: string;
  pattern: RegExp;
  keys: string[];
  handler: ResolverHandler;
}

function route(method: string, path: string, handler: ResolverHandler): Route {
  const keys: string[] = [];
  const pattern = new RegExp(
    `^${path.replace(/:[A-Za-z0-9_]+/g, (m) => {
      keys.push(m.slice(1));
      return '([^/]+)';
    })}$`,
  );
  return { method, path, pattern, keys, handler };
}

export const ROUTES: Route[] = [
  route('GET', '/api/feed', resolveFeed),
  route('GET', '/api/athletes', resolveAthletes),
  route('GET', '/api/athlete/:id', (ctx) => {
    const athlete = athleteById(ctx.params.id);
    if (!athlete) throw new ApiError(404, 'Athlete not found');
    return { athlete, team: TEAM_BY_ID[athlete.teamId], stories: allStories(athlete.sport).filter((s) => s.athleteIds.includes(athlete.id)) };
  }),
  route('GET', '/api/matches', (ctx) => {
    const sport = sportFrom(ctx);
    const status = ctx.query.get('status');
    const list = allMatches(sport).filter((m) => !status || status === 'All' || m.status === status);
    return list;
  }),
  route('GET', '/api/match/:id', (ctx) => resolveMatch(ctx.params.id, ctx)),
  route('GET', '/api/match/:id/moments', (ctx) => resolveMatch(ctx.params.id, ctx).moments),
  route('GET', '/api/story/:id', (ctx) => {
    const story = storyById(ctx.params.id);
    if (!story) throw new ApiError(404, 'Story not found');
    return story;
  }),
  route('GET', '/api/parity', resolveParity),
  route('GET', '/api/circles', resolveCircles),
  route('GET', '/api/circle/:id', (ctx) => resolveCircle(ctx.params.id)),
  route('GET', '/api/circle/:id/messages', (ctx) => resolveMessages(ctx.params.id)),
  route('POST', '/api/circles/:id/join', (ctx) => ({
    circleId: ctx.params.id,
    joined: true,
    memberCount: (CIRCLE_BY_ID[ctx.params.id]?.memberCount ?? 0) + 1,
  })),
  route('POST', '/api/circles/:id/leave', (ctx) => ({
    circleId: ctx.params.id,
    joined: false,
    memberCount: Math.max(0, (CIRCLE_BY_ID[ctx.params.id]?.memberCount ?? 0) - 1),
  })),
  route('POST', '/api/circles/:id/messages', (ctx) => {
    const body = ctx.body ?? {};
    const now = new Date().toISOString();
    return {
      id: `msg-${now}`,
      circleId: ctx.params.id,
      authorId: (body.authorId as string) ?? 'you',
      authorName: (body.authorName as string) ?? 'You',
      authorInitials: 'YO',
      body: String(body.body ?? ''),
      atISO: now,
      reactions: {},
    } satisfies CircleMessage;
  }),
  route('POST', '/api/stories/generate', resolveGenerate),
  route('POST', '/api/alerts', (ctx) => {
    const body = ctx.body ?? {};
    return {
      ok: true,
      channel: body.kind === 'athlete' ? 'athlete' : 'match',
      id: body.id,
      deliveriesPerMatch: 4,
    };
  }),
  route('POST', '/api/publish', (ctx) => {
    const body = ctx.body ?? {};
    return {
      ok: true,
      story: {
        id: `s-published-${Date.now()}`,
        title: String(body.title ?? 'Untitled draft'),
        body: String(body.body ?? ''),
        publishedAtISO: new Date().toISOString(),
      },
    };
  }),
];

/** Find and run a resolver for a method + pathname. */
export function runResolver(method: string, pathname: string, query: URLSearchParams, body?: Record<string, unknown>): unknown {
  const verb = method.toUpperCase();
  for (const r of ROUTES) {
    if (r.method !== verb) continue;
    const match = r.pattern.exec(pathname);
    if (!match) continue;
    const params: Record<string, string> = {};
    r.keys.forEach((key, i) => {
      params[key] = decodeURIComponent(match[i + 1]);
    });
    return r.handler({ params, query, body });
  }
  throw new ApiError(404, `No route for ${verb} ${pathname}`);
}

/** Snapshot of the demo dataset, used by the /dev console. */
export function datasetSummary() {
  return {
    athletes: { cricket: Object.keys(ATHLETE_BY_ID).length },
    matches: MATCHES.length,
    moments: MOMENTS.length,
    stories: STORIES.length,
    circles: CIRCLES.length,
  };
}
