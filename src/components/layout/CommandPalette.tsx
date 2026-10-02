import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Input } from '@/components/ui';
import { useDebounced } from '@/hooks/useAsync';
import { STORIES } from '@/data/stories';
import { ATHLETE_BY_ID } from '@/data/athletes';
import { CIRCLES } from '@/data/circles';
import { MATCHES } from '@/data/matches';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 200);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('btc:open-search', onOpen as EventListener);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('btc:open-search', onOpen as EventListener);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const results = useMemo(() => {
    if (!debounced.trim()) return [];
    const q = debounced.trim().toLowerCase();
    const list: { label: string; to: string; category: string }[] = [];
    STORIES.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q))
        list.push({ label: s.title, to: `/story/${s.id}`, category: 'Stories' });
    });
    Object.values(ATHLETE_BY_ID).forEach((a) => {
      if (a.name.toLowerCase().includes(q)) list.push({ label: a.name, to: `/athlete/${a.id}`, category: 'Athletes' });
    });
    MATCHES.forEach((m) => {
      list.push({ label: `Match ${m.id}`, to: `/match/${m.id}`, category: 'Matches' });
    });
    CIRCLES.forEach((c) => {
      if (c.name.toLowerCase().includes(q)) list.push({ label: c.name, to: `/circle/${c.id}`, category: 'Circles' });
    });
    return list.slice(0, 8);
  }, [debounced]);

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
    setQuery('');
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Search" hideHeader>
      <div className="flex flex-col gap-4 py-2">
        <Input
          ref={inputRef}
          placeholder="Search stories, athletes, matches, circles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && (
          <ul className="max-h-80 overflow-auto rounded-2xl border border-line bg-surface-sunken">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => go(r.to)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start hover:bg-surface"
                >
                  <span className="truncate font-body text-sm">{r.label}</span>
                  <span className="shrink-0 font-body text-[0.625rem] uppercase tracking-wide text-muted">
                    {r.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 && (
          <p className="py-4 text-center font-body text-sm text-muted">No results for “{query}”.</p>
        )}
      </div>
    </Modal>
  );
}