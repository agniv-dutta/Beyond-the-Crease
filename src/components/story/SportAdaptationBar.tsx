import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { SportId, Story } from '@/types';
import { cn } from '@/utils/cn';

interface SportAdaptationBarProps {
  currentSport: SportId;
  story: Story;
  onAdapt: (adapted: { sport: SportId; title: string; body: string } | null) => void;
}

export function SportAdaptationBar({
  currentSport: _currentSport,
  story,
  onAdapt,
}: SportAdaptationBarProps) {
  const [selectedSport, setSelectedSport] = useState<SportId | 'original'>('original');

  const handleSelect = (target: SportId | 'original') => {
    setSelectedSport(target);

    if (target === 'original') {
      onAdapt(null);
      return;
    }

    // Dynamic adaptation engine
    const adapted = adaptStory(story, target);
    onAdapt(adapted);
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-kesar/40 bg-kesar-soft/20 p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-kesar text-ink font-bold text-xs">
            <ArrowRightLeft aria-hidden className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-sm font-bold text-body">
            Same story, new sport
          </span>
          <Badge tone="kesar" className="text-[0.625rem]">
            Pitch Mode Engine
          </Badge>
        </div>
        <span className="font-body text-xs text-muted">
          Cross-sport translation demonstration
        </span>
      </div>

      <p className="font-body text-xs text-muted leading-relaxed">
        Watch how the exact same athlete journey, fairness checks, and media visibility
        parity metrics re-target seamlessly to another sport without rewriting the editorial pipeline.
      </p>

      {/* Sport Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handleSelect('original')}
          className={cn(
            'rounded-full px-3 py-1 font-body text-xs font-semibold transition-colors',
            selectedSport === 'original'
              ? 'bg-ink text-canvas shadow-sm'
              : 'bg-surface border border-line text-body hover:bg-surface-raised',
          )}
        >
          Original ({story.sport})
        </button>

        <button
          type="button"
          onClick={() => handleSelect('football')}
          className={cn(
            'rounded-full px-3 py-1 font-body text-xs font-semibold transition-colors',
            selectedSport === 'football'
              ? 'bg-pistachio text-ink shadow-sm font-bold'
              : 'bg-surface border border-line text-body hover:bg-surface-raised',
          )}
        >
          ⚽ Football Edition
        </button>

        <button
          type="button"
          onClick={() => handleSelect('tennis')}
          className={cn(
            'rounded-full px-3 py-1 font-body text-xs font-semibold transition-colors',
            selectedSport === 'tennis'
              ? 'bg-kesar text-ink shadow-sm font-bold'
              : 'bg-surface border border-line text-body hover:bg-surface-raised',
          )}
        >
          🎾 Tennis Edition
        </button>
      </div>
    </div>
  );
}

function adaptStory(
  story: Story,
  targetSport: SportId,
): { sport: SportId; title: string; body: string } {
  let title = story.title;
  let body = story.body;

  if (targetSport === 'football') {
    title = title
      .replace(/crease/gi, 'penalty box')
      .replace(/innings/gi, 'half')
      .replace(/overs/gi, 'stoppage time')
      .replace(/wicket/gi, 'clean sheet')
      .replace(/bowler/gi, 'midfielder')
      .replace(/batter/gi, 'striker')
      .replace(/cricket/gi, 'football');

    body = body
      .replace(/overs/gi, 'minutes of extra time')
      .replace(/over/gi, 'phase of play')
      .replace(/bowler/gi, 'center-back')
      .replace(/bowling/gi, 'pressing')
      .replace(/batter/gi, 'striker')
      .replace(/batting/gi, 'counter-attacking')
      .replace(/runs/gi, 'goals')
      .replace(/wickets/gi, 'interceptions')
      .replace(/crease/gi, 'six-yard box')
      .replace(/pitch/gi, 'turf')
      .replace(/cricket/gi, 'football');

    body += `\n\n[Demonstration note: This story was dynamically adapted to Football by the Cross-Sport Engine, preserving the same editorial dignity, fairness audit, and media parity benchmark.]`;
  } else if (targetSport === 'tennis') {
    title = title
      .replace(/crease/gi, 'baseline')
      .replace(/innings/gi, 'set')
      .replace(/overs/gi, 'tiebreak')
      .replace(/wicket/gi, 'break point')
      .replace(/bowler/gi, 'server')
      .replace(/batter/gi, 'returner')
      .replace(/cricket/gi, 'tennis');

    body = body
      .replace(/overs/gi, 'games')
      .replace(/over/gi, 'set')
      .replace(/bowler/gi, 'server')
      .replace(/bowling/gi, 'serving out wide')
      .replace(/batter/gi, 'baseliner')
      .replace(/batting/gi, 'returning deep')
      .replace(/runs/gi, 'aces')
      .replace(/wickets/gi, 'break points')
      .replace(/crease/gi, 'baseline')
      .replace(/pitch/gi, 'centre court')
      .replace(/cricket/gi, 'tennis');

    body += `\n\n[Demonstration note: This story was dynamically adapted to Tennis by the Cross-Sport Engine, preserving the same editorial dignity, fairness audit, and media parity benchmark.]`;
  }

  return { sport: targetSport, title, body };
}
