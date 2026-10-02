import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Button, Card, EmptyState, ErrorState, Input, Rail, SectionHeading, Select, SkeletonCardGrid, TextLink } from '@/components/ui';
import { AthleteCard } from '@/components/athlete/AthleteCard';
import { api } from '@/api/client';
import { useAsync, useDebounced } from '@/hooks/useAsync';
import { TEAMS } from '@/data/teams';
import { usePrefs } from '@/store/prefs';
import type { LanguageCode } from '@/types';

type SortKey = 'momentum' | 'followers' | 'visibility' | 'name';

export default function AthletesPage() {
  const sport = usePrefs((s) => s.sport);
  const [query, setQuery] = useState('');
  const [teamId, setTeamId] = useState('');
  const [lang, setLang] = useState('');
  const [sort, setSort] = useState<SortKey>('momentum');
  const debounced = useDebounced(query, 250);

  const athletes = useAsync(
    (signal) => api.getAthletes({ sport, q: debounced, teamId, lang, sort }, signal),
    [sport, debounced, teamId, lang, sort],
  );

  const list = useMemo(() => athletes.data ?? [], [athletes.data]);
  const languageSpeakers = useMemo(() => {
    const counts = new Map<string, number>();
    list.forEach((a) => a.languages.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [list]);

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-5">
          <SectionHeading
            eyebrow="The squad sheets"
            title="Twenty-four cricketers, all fictional, all worth a paragraph"
            lede="Sort by momentum, followers, visibility or name. Filter by team, or find who can be interviewed in your language."
            action={<TextLink to="/parity">Why visibility is the ranking to argue about</TextLink>}
          />

          <Card className="flex flex-col gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Search</span>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or role…"
                  type="search"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Team</span>
                <Select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  options={[
                    { value: '', label: 'All teams' },
                    ...TEAMS.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Speaks</span>
                <Select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  options={[
                    { value: '', label: 'Any language' },
                    ...languageSpeakers.map(([code, count]) => ({
                      value: code,
                      label: `${code.toUpperCase()} · ${count}`,
                    })),
                  ]}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Sort by</span>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  options={[
                    { value: 'momentum', label: 'Momentum' },
                    { value: 'followers', label: 'Followers' },
                    { value: 'visibility', label: 'Visibility score' },
                    { value: 'name', label: 'Name A–Z' },
                  ]}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-body text-xs text-muted">
                <Search aria-hidden className="h-3.5 w-3.5" />
                {list.length} result{list.length === 1 ? '' : 's'}
              </span>
              {(query || teamId || lang) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setTeamId('');
                    setLang('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Rail label="Athletes" className="container">
        {athletes.error ? (
          <ErrorState title="Could not load the squad sheets" body={athletes.error.message} onRetry={athletes.reload} />
        ) : athletes.initial && athletes.loading ? (
          <SkeletonCardGrid count={8} />
        ) : list.length === 0 ? (
          <EmptyState
            title="No athletes match those filters"
            body="Try clearing the team or language filter. Everything here is fictional demo data."
            icon={<Users aria-hidden className="h-8 w-8 text-muted" />}
            action={
              <Button
                onClick={() => {
                  setQuery('');
                  setTeamId('');
                  setLang('');
                  setSort('momentum');
                }}
              >
                Reset everything
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((athlete, i) => (
              <li key={athlete.id}>
                <AthleteCard athlete={athlete} rank={sort === 'momentum' ? i + 1 : undefined} />
              </li>
            ))}
          </ul>
        )}
      </Rail>

      <section className="container pb-4">
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="font-display text-title text-body">Language coverage</h2>
          <ul className="flex flex-wrap gap-2">
            {(['en', 'hi', 'ta', 'ar', 'es', 'bn'] as LanguageCode[]).map((code) => {
              const count = languageSpeakers.find(([c]) => c === code)?.[1] ?? 0;
              return (
                <li key={code} className="sticker bg-silver-soft text-ink">
                  {code.toUpperCase()} · {count}
                </li>
              );
            })}
          </ul>
          <p className="font-body text-xs text-muted">
            Every athlete profile lists the languages she can be interviewed in — the basis for the
            multilingual circle filters.
          </p>
        </Card>
      </section>
    </div>
  );
}