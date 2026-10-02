import { Link } from 'react-router-dom';
import { CalendarClock, MapPin, Radio, Users } from 'lucide-react';
import { Badge, Card, Monogram } from '@/components/ui';
import { TEAM_BY_ID } from '@/data/teams';
import { useGamification } from '@/store/gamification';
import { toast } from '@/store/toasts';
import type { Match } from '@/types';
import { cn } from '@/utils/cn';
import { clockTime, compactNumber, relativeTime } from '@/utils/format';

const STATUS_META: Record<Match['status'], { label: string; tone: 'live' | 'kesar' | 'silver' }> = {
  live: { label: 'Live', tone: 'live' },
  upcoming: { label: 'Upcoming', tone: 'kesar' },
  completed: { label: 'Completed', tone: 'silver' },
};

export function MatchCard({ match, onPredict }: { match: Match; onPredict?: (match: Match, pick: string) => void }) {
  const teamA = TEAM_BY_ID[match.teamAId];
  const followed = useGamification((s) => s.alertMatchIds.includes(match.id));
  const predict = useGamification((s) => s.predict);
  const predictions = useGamification((s) => s.predictions);
  const toggle = useGamification((s) => s.toggle);
  const meta = STATUS_META[match.status];
  const myPick = predictions[match.id];

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Badge tone={meta.tone} live={match.status === 'live'}>
            {meta.label}
          </Badge>
          <span className="font-body text-xs text-muted">
            {match.format} · {match.city}
          </span>
        </div>
        <span className="font-body text-[0.6875rem] uppercase tracking-wide text-muted">
          {match.status === 'upcoming'
            ? clockTime(match.startsAtISO)
            : `${match.innings === 2 ? '2nd innings' : '1st innings'} · ${relativeTime(match.startsAtISO)}`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {[match.teamAId, match.teamBId].map((teamId, i) => {
          const team = TEAM_BY_ID[teamId];
          return (
            <div key={teamId} className={cn('flex items-center gap-2.5', i === 1 && 'flex-row-reverse text-end')}>
              <Monogram initials={team.short} size="sm" tone={i === 0 ? 'rose' : 'kesar'} />
              <span className="font-body text-sm font-semibold text-body">{team.name}</span>
            </div>
          );
        })}
        <div className="ms-auto flex flex-col items-end">
          <span className="font-display text-lg font-bold leading-none text-body">
            {match.status === 'upcoming' ? '—' : `${match.scoreA.runs}/${match.scoreA.wickets}`}
          </span>
          <span className="font-display text-lg font-bold leading-none text-muted">
            {match.status === 'upcoming' ? '—' : `${match.scoreB.runs}/${match.scoreB.wickets}`}
          </span>
        </div>
      </div>

      {match.status === 'live' && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-soft px-3 py-2">
          <Radio aria-hidden className="h-4 w-4 text-pomelo" />
          <span className="font-body text-xs text-ink">
            Women&rsquo;s win probability{' '}
            <strong className="font-bold">{match.winProbabilityA}%</strong> · {match.storyCount} stories drafted
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[0.6875rem] text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin aria-hidden className="h-3.5 w-3.5" />
          {match.venue}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users aria-hidden className="h-3.5 w-3.5" />
          {compactNumber(match.attendance)} watching
        </span>
        {match.status === 'upcoming' && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock aria-hidden className="h-3.5 w-3.5" />
            {relativeTime(match.startsAtISO)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Link
          to={`/match/${match.id}`}
          className="inline-flex min-h-9 items-center rounded-2xl bg-pomelo px-3.5 font-body text-sm font-semibold text-ink shadow-btc-pomelo
            transition-transform hover:bg-pomelo-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Open match room
        </Link>
        {match.status === 'live' && (
          <Link
            to="/live"
            className="inline-flex min-h-9 items-center rounded-2xl border border-line px-3.5 font-body text-sm font-semibold text-body
              hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Watch live
          </Link>
        )}
        {match.status !== 'completed' && (
          <button
            type="button"
            onClick={() => {
              predict(match.id, teamA.short);
              onPredict?.(match, teamA.short);
              toast.success(`Prediction saved: ${teamA.name}`, 'Change it any time before the match starts.');
            }}
            className={cn(
            'inline-flex min-h-9 items-center rounded-2xl border px-3.5 font-body text-sm font-semibold transition-colors',
            myPick === teamA.short
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-line text-body hover:bg-surface-raised',
          )}
        >
          {myPick === teamA.short ? '✓ Predicted' : `Predict ${teamA.short}`}
        </button>
        )}
        <button
          type="button"
          aria-pressed={followed}
          onClick={() => {
            const now = toggle('alertMatchIds', match.id);
            toast.info(
              now ? 'Match alerts on' : 'Match alerts off',
              now ? `You will get webhook alerts for ${match.id}.` : 'No more alerts for this match.',
            );
          }}
          className={cn(
            'ms-auto inline-flex min-h-9 items-center rounded-2xl border px-3 font-body text-xs font-semibold transition-colors',
            followed ? 'border-accent bg-rose-soft text-ink' : 'border-line text-muted hover:text-body',
          )}
        >
          {followed ? 'Alerts on' : 'Alert me'}
        </button>
      </div>
    </Card>
  );
}