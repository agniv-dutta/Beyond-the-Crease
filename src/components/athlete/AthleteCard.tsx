import { Link } from 'react-router-dom';
import { Flame, Globe, TrendingUp } from 'lucide-react';
import { Badge, Card, Monogram, ProgressBar } from '@/components/ui';
import { TEAM_BY_ID } from '@/data/teams';
import { useGamification } from '@/store/gamification';
import { toast } from '@/store/toasts';
import type { Athlete } from '@/types';
import { cn } from '@/utils/cn';
import { compactNumber, pct } from '@/utils/format';

export function AthleteCard({
  athlete,
  rank,
  onOpen,
}: {
  athlete: Athlete;
  rank?: number;
  onOpen?: () => void;
}) {
  const team = TEAM_BY_ID[athlete.teamId];
  const following = useGamification((s) => s.followedAthleteIds.includes(athlete.id));
  const alerts = useGamification((s) => s.alertAthleteIds.includes(athlete.id));
  const toggle = useGamification((s) => s.toggle);

  return (
    <Card interactive className="flex flex-col gap-3 p-5" onClick={onOpen}>
      <div className="flex items-start gap-3">
        {rank !== undefined && (
          <span className="font-display text-2xl font-bold leading-none text-muted/60">#{rank}</span>
        )}
        <Monogram initials={athlete.initials} tone={athlete.captain ? 'kesar' : 'rose'} label={athlete.name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            to={`/athlete/${athlete.id}`}
            className="truncate rounded font-display text-lg font-semibold text-body underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={(e) => e.stopPropagation()}
          >
            {athlete.name}
          </Link>
          <span className="truncate font-body text-xs text-muted">
            {athlete.role} · {team?.name ?? athlete.teamId}
          </span>
        </div>
        {athlete.captain && <Badge tone="kesar">Captain</Badge>}
      </div>

      <p className="font-body text-sm leading-relaxed text-pretty text-muted">{athlete.bio}</p>

      <div className="grid grid-cols-3 gap-2">
        <div className="hairline rounded-xl bg-surface-sunken px-2.5 py-2">
          <span className="block font-body text-[0.625rem] uppercase tracking-wide text-muted">Momentum</span>
          <span className="font-display text-lg leading-none text-body">{athlete.momentum}</span>
        </div>
        <div className="hairline rounded-xl bg-surface-sunken px-2.5 py-2">
          <span className="block font-body text-[0.625rem] uppercase tracking-wide text-muted">Featured</span>
          <span className="font-display text-lg leading-none text-body">{pct(athlete.featuredShare * 100)}</span>
        </div>
        <div className="hairline rounded-xl bg-surface-sunken px-2.5 py-2">
          <span className="block font-body text-[0.625rem] uppercase tracking-wide text-muted">Followers</span>
          <span className="font-display text-lg leading-none text-body">{compactNumber(athlete.followers)}</span>
        </div>
      </div>

      <ProgressBar
        label="Visibility parity with the men’s game"
        value={athlete.visibilityScore}
        tone={athlete.visibilityScore >= 60 ? 'positive' : athlete.visibilityScore >= 40 ? 'accent' : 'warn'}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {athlete.themes.map((theme) => (
          <Badge key={theme} tone="silver">
            {theme}
          </Badge>
        ))}
        {athlete.languages.slice(0, 3).map((lang) => (
          <span
            key={lang}
            className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 font-body text-[0.625rem] uppercase text-muted"
          >
            <Globe aria-hidden className="h-3 w-3" />
            {lang}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <button
          type="button"
          aria-pressed={following}
          onClick={() => {
            const now = toggle('followedAthleteIds', athlete.id);
            toast.info(now ? `Following ${athlete.name}` : `Unfollowed ${athlete.name}`);
          }}
          className={cn(
            'inline-flex min-h-9 items-center gap-1.5 rounded-2xl px-3 font-body text-sm font-semibold transition-colors',
            following ? 'bg-accent text-accent-ink' : 'hairline bg-surface text-body hover:bg-surface-raised',
          )}
        >
          <Flame aria-hidden className="h-4 w-4" />
          {following ? 'Following' : 'Follow'}
        </button>
        <button
          type="button"
          aria-pressed={alerts}
          onClick={() => {
            const now = toggle('alertAthleteIds', athlete.id);
            toast.info(
              now ? `Alerts on for ${athlete.name}` : 'Alerts off',
              now ? 'milestone.reached webhooks will appear in your drawer.' : undefined,
            );
          }}
          className={cn(
            'inline-flex min-h-9 items-center gap-1.5 rounded-2xl border px-3 font-body text-sm font-semibold transition-colors',
            alerts ? 'border-accent bg-rose-soft text-ink' : 'border-line text-muted hover:text-body',
          )}
        >
          <TrendingUp aria-hidden className="h-4 w-4" />
          {alerts ? 'Alerts on' : 'Alerts'}
        </button>
      </div>
    </Card>
  );
}