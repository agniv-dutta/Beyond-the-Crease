import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  FastForward,
  Headphones,
  Pause,
  Play,
  Square,
  X,
} from 'lucide-react';
import { useAudioPlayer } from '@/store/audioPlayer';
import { cn } from '@/utils/cn';

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioMiniPlayer() {
  const {
    currentStory,
    isPlaying,
    isPaused,
    rate,
    availableVoices,
    selectedVoiceUri,
    progress,
    pause,
    resume,
    stop,
    setRate,
    setVoiceUri,
  } = useAudioPlayer();

  const [showSettings, setShowSettings] = useState(false);

  if (!currentStory) return null;

  // Filter voices that match current language or English
  const matchingVoices = availableVoices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith(currentStory.language.toLowerCase()) ||
      v.lang.toLowerCase().startsWith('en'),
  );

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        aria-label="Story audio recap mini-player"
        className="fixed bottom-4 left-3 right-3 z-50 mx-auto max-w-2xl"
      >
        <div className="scallop-t grain hairline flex flex-col gap-2 rounded-2xl bg-ink p-3.5 text-canvas shadow-btc-lg backdrop-blur-md">
          {/* Top row: Track info & primary controls */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mulberry text-kesar">
              <Headphones aria-hidden className="h-5 w-5" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="font-body text-[0.625rem] font-bold uppercase tracking-wider text-kesar">
                  Audio Recap · {currentStory.language.toUpperCase()}
                </span>
                <span className="font-body text-[0.625rem] text-silver">
                  {isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Ready'}
                </span>
              </div>
              <Link
                to={`/story/${currentStory.id}`}
                className="truncate font-display text-sm font-semibold text-canvas hover:text-pomelo transition-colors"
                title={currentStory.title}
              >
                {currentStory.title}
              </Link>
              {currentStory.athleteName && (
                <span className="truncate font-body text-xs text-silver">
                  {currentStory.athleteName}
                </span>
              )}
            </div>

            {/* Play/Pause & Stop */}
            <div className="flex items-center gap-1.5">
              {isPlaying ? (
                <button
                  type="button"
                  onClick={pause}
                  aria-label="Pause recap"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-pomelo text-ink hover:opacity-90 transition-opacity"
                >
                  <Pause aria-hidden className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resume}
                  aria-label="Resume recap"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-pomelo text-ink hover:opacity-90 transition-opacity"
                >
                  <Play aria-hidden className="h-4 w-4 fill-current ms-0.5" />
                </button>
              )}

              <button
                type="button"
                onClick={stop}
                aria-label="Stop audio"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-silver hover:bg-white/10 hover:text-canvas transition-colors"
                title="Stop playback"
              >
                <Square aria-hidden className="h-3.5 w-3.5 fill-current" />
              </button>

              <button
                type="button"
                onClick={() => setShowSettings((s) => !s)}
                aria-label="Audio controls & voices"
                className={cn(
                  'flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-silver hover:bg-white/10 hover:text-canvas transition-colors',
                  showSettings && 'bg-white/15 text-kesar',
                )}
                title="Voice and speed options"
              >
                <FastForward aria-hidden className="h-3.5 w-3.5" />
                <span>{rate}x</span>
                <ChevronDown aria-hidden className={cn('h-3 w-3 transition-transform', showSettings && 'rotate-180')} />
              </button>

              <button
                type="button"
                onClick={stop}
                aria-label="Close player"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-silver hover:bg-white/10 hover:text-canvas transition-colors"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-dusk-fruit transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Expandable voice & speed settings panel */}
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line/40 pt-2.5 text-xs text-silver"
            >
              {/* Speed buttons */}
              <div className="flex items-center gap-1.5">
                <span className="font-body text-[0.6875rem] uppercase tracking-wider text-muted">Speed:</span>
                <div className="flex rounded-lg bg-surface-sunken/40 p-0.5">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRate(s)}
                      className={cn(
                        'rounded-md px-2 py-0.5 font-body font-semibold text-xs transition-colors',
                        rate === s
                          ? 'bg-kesar text-ink'
                          : 'text-silver hover:text-canvas',
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice selector */}
              {matchingVoices.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-body text-[0.6875rem] uppercase tracking-wider text-muted">Voice:</span>
                  <select
                    value={selectedVoiceUri ?? ''}
                    onChange={(e) => setVoiceUri(e.target.value)}
                    className="rounded-lg border border-line/40 bg-ink px-2 py-1 text-xs text-canvas focus:outline-none focus:ring-1 focus:ring-kesar"
                  >
                    <option value="">Default voice</option>
                    {matchingVoices.slice(0, 8).map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name.slice(0, 24)} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
