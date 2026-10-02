import { ApiError, runResolver } from './resolvers';

/* ==========================================================================
   Typed api layer.
   Requests go over HTTP so MSW can intercept them. If the service worker is
   unavailable (some preview environments), the same resolver runs in-process —
   swapping in a real backend means deleting the fallback branch only.
   ========================================================================== */

export interface RequestOptions {
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | undefined | null>;
  body?: Record<string, unknown>;
  signal?: AbortSignal;
  /** Skip the simulated latency (used by preflight and tests). */
  instant?: boolean;
}

const LATENCY_MIN = 300;
const LATENCY_MAX = 900;
const ERROR_RATE = 0.05;

let offlineFallbackActive = false;

export function isOfflineFallbackActive(): boolean {
  return offlineFallbackActive;
}

/** Test/demo hook: force the in-process resolver path. */
export function setOfflineFallback(on: boolean): void {
  offlineFallbackActive = on;
}

function delay(min: number, max: number, signal?: AbortSignal): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal, instant } = options;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  const url = `/api${path}${qs ? `?${qs}` : ''}`;

  if (!instant) await delay(LATENCY_MIN, LATENCY_MAX, signal);

  // Fail on purpose, before the transport matters, so the 5% rate is identical
  // whether MSW is intercepting or the in-process fallback is running.
  if (!instant && Math.random() < ERROR_RATE) {
    throw new ApiError(503, 'Simulated network error. The demo fails 5% of requests on purpose.');
  }

  if (!offlineFallbackActive) {
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as T & { error?: string };
        if (!response.ok) throw new ApiError(response.status, payload?.error ?? 'Request failed');
        return payload;
      }
      // Not JSON — the service worker is not intercepting. Fall through.
      offlineFallbackActive = true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      offlineFallbackActive = true;
    }
  }

  const [pathname, searchString] = url.split('?');
  return runResolver(method, pathname, new URLSearchParams(searchString ?? ''), body) as T;
}

/* ------------------------------------------------------------ typed endpoints */

export interface FeedResponse {
  stories: import('@/types').Story[];
  nextCursor: number | null;
  total: number;
}

export const api = {
  getFeed: (params: {
    sport: string;
    theme?: string;
    teamId?: string;
    athleteId?: string;
    matchId?: string;
    maxReadingMinutes?: number;
    q?: string;
    sort?: 'recent' | 'popular';
    limit?: number;
    cursor?: number;
  }, signal?: AbortSignal) =>
    request<FeedResponse>('/feed', { query: params as never, signal }),

  getAthletes: (
    params: { sport: string; q?: string; teamId?: string; role?: string; lang?: string; sort?: string },
    signal?: AbortSignal,
  ) => request<import('@/types').Athlete[]>('/athletes', { query: params as never, signal }),

  getAthlete: (id: string, signal?: AbortSignal) =>
    request<{
      athlete: import('@/types').Athlete;
      team: import('@/types').Team;
      stories: import('@/types').Story[];
    }>(`/athlete/${id}`, { signal }),

  getMatches: (params: { sport: string; status?: string }, signal?: AbortSignal) =>
    request<import('@/types').Match[]>('/matches', { query: params as never, signal }),

  getMatch: (id: string, signal?: AbortSignal) =>
    request<import('@/api/resolvers').MatchPayload>(`/match/${id}`, { signal }),

  getStory: (id: string, signal?: AbortSignal) =>
    request<import('@/types').Story>(`/story/${id}`, { signal }),

  getParity: (
    params: { sport: string; region?: string; platform?: string; months?: number; growth?: number },
    signal?: AbortSignal,
  ) => request<import('@/api/resolvers').ParityPayload>('/parity', { query: params as never, signal }),

  getCircles: (signal?: AbortSignal) =>
    request<import('@/types').Circle[]>('/circles', { signal, instant: true }),

  getCircle: (id: string, signal?: AbortSignal) =>
    request<import('@/types').Circle & { messages: import('@/types').CircleMessage[] }>(
      `/circle/${id}`,
      { signal },
    ),

  getMessages: (id: string, signal?: AbortSignal) =>
    request<import('@/types').CircleMessage[]>(`/circle/${id}/messages`, { signal, instant: true }),

  joinCircle: (id: string) =>
    request<{ circleId: string; joined: boolean; memberCount: number }>(`/circles/${id}/join`, {
      method: 'POST',
    }),

  leaveCircle: (id: string) =>
    request<{ circleId: string; joined: boolean; memberCount: number }>(`/circles/${id}/leave`, {
      method: 'POST',
    }),

  postMessage: (id: string, payload: { body: string; authorId: string; authorName: string }) =>
    request<import('@/types').CircleMessage>(`/circles/${id}/messages`, {
      method: 'POST',
      body: payload,
    }),

  generateStory: (payload: {
    athleteId?: string;
    matchId?: string;
    momentId?: string;
    circleId?: string;
    sport?: string;
    tone: string;
    format: string;
    length: number;
    language: string;
    seed?: number;
  }) =>
    request<import('@/types').GeneratedStory>('/stories/generate', {
      method: 'POST',
      body: payload as Record<string, unknown>,
    }),

  subscribeAlerts: (payload: { kind: 'athlete' | 'match'; id: string; topics: string[] }) =>
    request<{ ok: boolean; channel: string; id: string; deliveriesPerMatch: number }>('/alerts', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    }),

  publishStory: (payload: { title: string; body: string; draftId: string }) =>
    request<{ ok: boolean; story: { id: string; title: string; body: string; publishedAtISO: string } }>(
      '/publish',
      { method: 'POST', body: payload as unknown as Record<string, unknown> },
    ),
};

export type Api = typeof api;
export { ApiError };
