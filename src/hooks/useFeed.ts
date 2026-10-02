import { useEffect, useMemo, useState } from 'react';
import { api } from '@/api/client';
import { useAsync, useDebounced } from '@/hooks/useAsync';
import { usePrefs } from '@/store/prefs';
import type { Story, Theme } from '@/types';

export interface FeedFilters {
  theme: Theme | 'All';
  teamId: string;
  q: string;
  maxReadingMinutes: number;
  sort: 'recent' | 'popular';
}

export const ALL_THEMES: (Theme | 'All')[] = ['All', 'Comeback', 'Debut', 'Records', 'Leadership', 'Grassroots'];

export function useFeed(limit = 9) {
  const sport = usePrefs((s) => s.sport);
  const [filters, setFilters] = useState<FeedFilters>({
    theme: 'All',
    teamId: '',
    q: '',
    maxReadingMinutes: 99,
    sort: 'recent',
  });
  const [cursor, setCursor] = useState(0);
  const query = useDebounced(filters.q, 250);

  /** Everything except the cursor — a change here invalidates the accumulated pages. */
  const filterKey = [
    sport,
    filters.theme,
    filters.teamId,
    filters.maxReadingMinutes,
    filters.sort,
    query,
  ].join('|');

  const [acc, setAcc] = useState<{ key: string; stories: Story[] }>({ key: '', stories: [] });

  const state = useAsync(
    (signal) =>
      api.getFeed(
        {
          sport,
          theme: filters.theme === 'All' ? '' : filters.theme,
          teamId: filters.teamId,
          maxReadingMinutes: filters.maxReadingMinutes,
          q: query,
          sort: filters.sort,
          limit,
          cursor,
        },
        signal,
      ),
    [sport, filters.theme, filters.teamId, filters.maxReadingMinutes, filters.sort, query, cursor],
  );

  // A filter or sport change rewinds the cursor and drops the pages already held.
  useEffect(() => {
    setCursor(0);
    setAcc({ key: filterKey, stories: [] });
  }, [filterKey]);

  // Each successful page appends to the accumulated list, de-duplicated by id.
  useEffect(() => {
    const page = state.data?.stories;
    if (!page || page.length === 0) return;
    setAcc((prev) => {
      const base = prev.key === filterKey ? prev.stories : [];
      const seen = new Set(base.map((s) => s.id));
      const merged = [...base, ...page.filter((s) => !seen.has(s.id))];
      if (merged.length === base.length) return prev;
      return { key: filterKey, stories: merged };
    });
  }, [state.data, filterKey]);

  const stories = acc.key === filterKey ? acc.stories : [];

  const loadMore = () => {
    const next = state.data?.nextCursor;
    if (next === null || next === undefined) return;
    setCursor(next);
  };

  return {
    ...state,
    stories,
    filters,
    setFilters,
    loadMore: state.loading ? () => undefined : loadMore,
    /** Rewind to the first page: clears the cursor and re-runs the fetch. */
    reset: () => setCursor(0),
    hasMore: (state.data?.nextCursor ?? null) !== null,
    cursor,
    setCursor,
  };
}

/** Client-side athlete names for a list of stories, in one pass. */
export function useAthleteNames(athletesById: Record<string, { name: string }>): (story: Story) => string[] {
  return useMemo(
    () => (story: Story) => story.athleteIds.map((id) => athletesById[id]?.name).filter((n): n is string => Boolean(n)),
    [athletesById],
  );
}