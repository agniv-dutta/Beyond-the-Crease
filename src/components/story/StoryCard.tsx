import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Headphones, Heart, Languages, Play, Share2, Sparkles, Timer } from 'lucide-react';
import { Badge, Button, Card, IconButton, Monogram, Tooltip } from '@/components/ui';
import { storyMotifClass } from '@/data/stories';
import { useGamification } from '@/store/gamification';
import { useAudioPlayer } from '@/store/audioPlayer';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toasts';
import type { LanguageCode, Story } from '@/types';
import { cn } from '@/utils/cn';
import { clockTime, readingLabel, relativeTime } from '@/utils/format';
import { useClipboard } from '@/hooks/useMisc';

const MOTIF_ACCENT: Record<Story['motif'], string> = {
  kesar: 'bg-kesar-soft',
  rose: 'bg-rose-soft',
  pistachio: 'bg-pistachio-soft',
  pomelo: 'bg-pomelo-soft',
  mulberry: 'bg-mulberry text-canvas',
  silver: 'bg-silver-soft',
};

export interface StoryCardProps {
  story: Story;
  /** Hero cards render larger with the summary visible. */
  size?: 'hero' | 'default' | 'compact';
  /** Optional accent rail label, e.g. "Rising now" or "From this match". */
  rail?: string;
  athleteNames?: string[];
  onOpen?: () => void;
}

export function StoryCard({ story, size = 'default', rail, athleteNames, onOpen }: StoryCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  const toggle = useGamification((s) => s.toggle);
  const liked = useGamification((s) => s.likedStoryIds.includes(story.id));
  const saved = useGamification((s) => s.savedStoryIds.includes(story.id));
  const translated = useGamification((s) => s.translatedStoryIds.includes(story.id));
  const { copy, copied } = useClipboard();

  const translation = language ? story.translations[language] : undefined;
  const availableLanguages = useMemo(
    () => (Object.keys(story.translations) as LanguageCode[]).filter((l) => story.translations[l]),
    [story.translations],
  );

  const hero = size === 'hero';

  return (
    <Card
      motif={undefined}
      className={cn('group flex flex-col', hero && 'sm:col-span-2')}
      interactive
      onClick={onOpen}
    >
      <div
        aria-hidden
        className={cn(
          'relative h-28 overflow-hidden bg-gradient-to-br sm:h-36',
          MOTIF_ACCENT[story.motif],
          storyMotifClass(story.motif),
        )}
      >
        <div className="jaali-panel absolute inset-0 opacity-40" aria-hidden />
        <div className="absolute bottom-3 start-3 flex items-center gap-2">
          <Monogram initials={initialsOf(athleteNames?.[0] ?? story.authorName)} size="sm" tone={story.motif === 'mulberry' ? 'mulberry' : 'kesar'} />
          {rail && <Badge tone="silver">{rail}</Badge>}
        </div>
        <div className="absolute end-3 top-3 flex gap-1.5">
          {story.kind === 'generated' && (
            <Badge tone="accent" icon={<Sparkles aria-hidden className="h-3.5 w-3.5" />}>
              Generated
            </Badge>
          )}
          {story.kind === 'community' && <Badge tone="kesar">Community</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[0.6875rem] uppercase tracking-wide text-muted">
          <span className="font-semibold text-accent">{story.theme}</span>
          <span aria-hidden>·</span>
          <span>{clockTime(story.publishedAtISO)}</span>
          <span aria-hidden>·</span>
          <span>{relativeTime(story.publishedAtISO)}</span>
        </div>

        <h3 className={cn('font-display leading-tight text-body', hero ? 'text-display-sm' : 'text-title')}>
          <Link
            to={`/story/${story.id}`}
            className="rounded underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={(e) => e.stopPropagation()}
          >
            {story.title}
          </Link>
        </h3>

        <p className={cn('font-body text-sm leading-relaxed text-pretty text-muted', size === 'compact' && 'line-clamp-2')}>
          {translation ? translation.body : story.summary}
        </p>

        {translation && (
          <p className="font-body text-[0.6875rem] font-semibold uppercase tracking-wide text-accent">
            Translated for demo ({translation.lang})
          </p>
        )}

        {athleteNames && athleteNames.length > 0 && (
          <p className="truncate font-body text-xs text-muted">{athleteNames.join(' · ')}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Tooltip label={liked ? 'Unlike' : 'Like'}>
            <IconButton
              label={liked ? 'Unlike this story' : 'Like this story'}
              size="sm"
              active={liked}
              onClick={() => {
                const nowLiked = toggle('likedStoryIds', story.id);
                toast.info(nowLiked ? 'Liked' : 'Like removed');
              }}
            >
              <Heart aria-hidden className={cn('h-4 w-4', liked && 'fill-current')} />
            </IconButton>
          </Tooltip>
          <span className="font-body text-xs text-muted">{story.likes + (liked ? 1 : 0)}</span>

          <Tooltip label={saved ? 'Remove from reading list' : 'Save to reading list'}>
            <IconButton
              label={saved ? 'Remove from reading list' : 'Save to reading list'}
              size="sm"
              active={saved}
              onClick={() => {
                const nowSaved = toggle('savedStoryIds', story.id);
                toast.info(nowSaved ? 'Saved for later' : 'Removed from your list');
              }}
            >
              <Bookmark aria-hidden className={cn('h-4 w-4', saved && 'fill-current')} />
            </IconButton>
          </Tooltip>

          <Tooltip label="Share a link">
            <IconButton
              label="Share a link to this story"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/story/${story.id}`;
                void copy(`${story.title} — ${url} #BeyondTheCrease`);
                toggle('sharedStoryIds', story.id);
              }}
            >
              <Share2 aria-hidden className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          <Tooltip label="Listen to audio recap">
            <IconButton
              label="Listen to audio recap"
              size="sm"
              onClick={() => {
                const appLang = usePrefs.getState().language;
                const langToUse: LanguageCode = language ?? (story.translations[appLang] ? appLang : 'en');
                const trans = story.translations[langToUse];
                useAudioPlayer.getState().playStory({
                  id: story.id,
                  title: trans?.title ?? story.title,
                  body: trans?.body ?? story.body,
                  athleteName: athleteNames?.[0],
                  language: langToUse,
                });
              }}
            >
              <Headphones aria-hidden className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          {copied && <span className="font-body text-xs font-semibold text-accent">Copied</span>}

          {availableLanguages.length > 0 && (
            <Tooltip label="Read in another language">
              <IconButton
                label="Read this story in another language"
                size="sm"
                active={translated || showTranslation}
                onClick={() => {
                  const next = language ?? availableLanguages[0];
                  setLanguage(next);
                  setShowTranslation(true);
                  if (!translated) toggle('translatedStoryIds', story.id);
                }}
              >
                <Languages aria-hidden className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          )}

          <span className="ms-auto inline-flex items-center gap-1 font-body text-xs text-muted">
            <Timer aria-hidden className="h-3.5 w-3.5" />
            {readingLabel(story.readingMinutes)}
          </span>
        </div>

        {showTranslation && availableLanguages.length > 1 && (
          <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
            {availableLanguages.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                aria-pressed={language === l}
                className={cn(
                  'rounded-full px-2 py-0.5 font-body text-[0.625rem] font-bold uppercase tracking-wide',
                  language === l ? 'bg-accent text-accent-ink' : 'bg-surface-sunken text-muted hover:text-body',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {story.format === 'podcast' && (
          <Button
            variant="soft"
            size="sm"
            className="self-start"
            icon={<Play aria-hidden className="h-4 w-4" />}
            onClick={() => toast.info('Listen mode', 'Audio narration is out of scope for this prototype.')}
          >
            Listen · {story.listens} plays
          </Button>
        )}
      </div>
    </Card>
  );
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BTC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}