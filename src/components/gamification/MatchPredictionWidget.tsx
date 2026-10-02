import { useState } from 'react';
import {
  Check,
  Flame,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Badge, Card, Segmented } from '@/components/ui';
import { useGamification } from '@/store/gamification';
import { teamName } from '@/data/teams';
import { toast } from '@/store/toasts';
import type { Match } from '@/types';
import { cn } from '@/utils/cn';

export interface MatchPredictionWidgetProps {
  matches: Match[];
  className?: string;
  defaultTab?: 'predict' | 'leaderboard';
}

export function MatchPredictionWidget({
  matches,
  className,
  defaultTab = 'predict',
}: MatchPredictionWidgetProps) {
  const [tab, setTab] = useState<'predict' | 'leaderboard'>(defaultTab);
  const predictions = useGamification((s) => s.predictions);
  const predict = useGamification((s) => s.predict);
  const streakDays = useGamification((s) => s.streakDays);
  const userPoints = useGamification((s) => s.getUserPoints());
  const leaderboard = useGamification((s) => s.getLeaderboard());

  const handlePick = (match: Match, pick: string) => {
    predict(match.id, pick);
    toast.success(
      'Prediction logged!',
      `You backed ${pick}. +25 scout points added to your leaderboard rank.`,
    );
  };

  return (
    <Card className={cn('flex flex-col gap-4 p-5', className)}>
      {/* Header with Streaks & Points */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kesar-soft text-ink font-display font-bold">
            <Trophy aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-body">
              Match Predictions & Leaderboard
            </h3>
            <p className="font-body text-xs text-muted">
              Fan predictions · Local scout rankings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fan Streak pill */}
          <div
            className="flex items-center gap-1.5 rounded-full bg-pomelo-soft px-3 py-1 font-body text-xs font-bold text-ink shadow-sm"
            title={`${streakDays} days active streak`}
          >
            <Flame aria-hidden className="h-3.5 w-3.5 fill-current text-pomelo-deep" />
            <span>{streakDays}d streak</span>
          </div>

          {/* User Points */}
          <div className="flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 font-body text-xs font-semibold text-body">
            <Sparkles aria-hidden className="h-3 w-3 text-kesar" />
            <span>{userPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Segmented
        label="Widget View"
        value={tab}
        onChange={(v) => setTab(v as 'predict' | 'leaderboard')}
        options={[
          { value: 'predict', label: `Predictions (${Object.keys(predictions).length}/${matches.length})` },
          { value: 'leaderboard', label: 'Scout Leaderboard' },
        ]}
      />

      {/* View 1: Predict Matches */}
      {tab === 'predict' && (
        <div className="flex flex-col gap-3">
          {matches.length === 0 ? (
            <p className="py-4 text-center font-body text-sm text-muted">
              No live or upcoming fixtures available to predict.
            </p>
          ) : (
            matches.slice(0, 4).map((m) => {
              const nameA = teamName(m.teamAId);
              const nameB = teamName(m.teamBId);
              const currentPick = predictions[m.id];

              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-surface-sunken/40 p-3.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-body font-semibold uppercase tracking-wider text-muted">
                      {m.format}
                    </span>
                    <Badge tone={m.status === 'live' ? 'live' : 'silver'}>
                      {m.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between font-display text-sm font-bold text-body">
                    <span className="truncate">{nameA}</span>
                    <span className="font-body text-xs font-normal text-muted px-2">vs</span>
                    <span className="truncate">{nameB}</span>
                  </div>

                  {/* Pick Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handlePick(m, nameA)}
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-lg border py-1.5 px-2 font-body text-xs font-semibold transition-all',
                        currentPick === nameA
                          ? 'border-kesar bg-kesar text-ink shadow-sm font-bold'
                          : 'border-line bg-surface text-body hover:border-kesar/60',
                      )}
                    >
                      {currentPick === nameA && <Check aria-hidden className="h-3 w-3" />}
                      <span className="truncate">{nameA}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePick(m, 'Draw')}
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-lg border py-1.5 px-2 font-body text-xs font-semibold transition-all',
                        currentPick === 'Draw'
                          ? 'border-kesar bg-kesar text-ink shadow-sm font-bold'
                          : 'border-line bg-surface text-body hover:border-kesar/60',
                      )}
                    >
                      {currentPick === 'Draw' && <Check aria-hidden className="h-3 w-3" />}
                      <span>Draw</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePick(m, nameB)}
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-lg border py-1.5 px-2 font-body text-xs font-semibold transition-all',
                        currentPick === nameB
                          ? 'border-kesar bg-kesar text-ink shadow-sm font-bold'
                          : 'border-line bg-surface text-body hover:border-kesar/60',
                      )}
                    >
                      {currentPick === nameB && <Check aria-hidden className="h-3 w-3" />}
                      <span className="truncate">{nameB}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-muted px-2 font-body font-semibold uppercase tracking-wider">
            <span>Scout</span>
            <span>Badges · Pts</span>
          </div>

          <ul className="flex flex-col gap-1.5">
            {leaderboard.map((entry) => (
              <li
                key={entry.name}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors',
                  entry.isUser
                    ? 'border-2 border-kesar bg-kesar-soft/40 font-bold text-ink'
                    : 'border border-line/60 bg-surface text-body',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full font-display text-[0.625rem] font-bold',
                      entry.rank === 1
                        ? 'bg-kesar text-ink'
                        : entry.rank === 2
                        ? 'bg-silver text-ink'
                        : entry.rank === 3
                        ? 'bg-rose text-ink'
                        : 'bg-surface-sunken text-muted',
                    )}
                  >
                    {entry.rank}
                  </span>
                  <span className="font-body font-semibold">
                    {entry.name}
                    {entry.isUser && (
                      <span className="ms-1.5 rounded bg-kesar px-1 py-0.5 text-[0.625rem] text-ink uppercase">
                        You
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-body text-muted">{entry.badgeCount} badges</span>
                  <span className="font-display font-bold text-accent">{entry.points} pts</span>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-1 font-body text-[0.6875rem] text-muted text-center">
            Leaderboard rankings update locally with each prediction, badge earned, and streak day.
          </p>
        </div>
      )}
    </Card>
  );
}
