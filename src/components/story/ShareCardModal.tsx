import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  Copy,
  Download,
  Quote as QuoteIcon,
} from 'lucide-react';
import { Button, Modal, Segmented } from '@/components/ui';
import { useGamification } from '@/store/gamification';
import { toast } from '@/store/toasts';
import { useClipboard } from '@/hooks/useMisc';
import type { Athlete, Story } from '@/types';
import { cn } from '@/utils/cn';

export type CardTemplate = 'quote' | 'athlete' | 'parity';
export type CardAspect = '1:1' | '9:16' | '16:9';
export type CardPalette = 'ink' | 'canvas' | 'mulberry';

export interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  defaultTemplate?: CardTemplate;
  story?: Story | null;
  athlete?: Athlete | null;
  parityStat?: {
    label: string;
    value: string;
    subtext: string;
    gap: string;
  };
}

export function ShareCardModal({
  open,
  onClose,
  defaultTemplate = 'quote',
  story,
  athlete,
  parityStat,
}: ShareCardModalProps) {
  const [template, setTemplate] = useState<CardTemplate>(defaultTemplate);
  const [aspect, setAspect] = useState<CardAspect>('1:1');
  const [palette, setPalette] = useState<CardPalette>('ink');
  const [exporting, setExporting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const { copy } = useClipboard();
  const award = useGamification((s) => s.award);

  const resolvedStory = useMemo(() => {
    return {
      title: story?.title ?? 'Every match has a story. Not every story gets heard.',
      body:
        story?.summary ??
        story?.body?.slice(0, 160) ??
        'Beyond the Crease tracks visibility parity across women’s sports, turning match data into cultural impact.',
      athleteName: athlete?.name ?? story?.authorName ?? 'Athlete Spotlight',
      quote:
        athlete?.quote ??
        'We do not need sympathy or charity. We need cameras, coverage, and the same broadcast dignity.',
      sport: story?.sport ?? athlete?.sport ?? 'cricket',
    };
  }, [story, athlete]);

  const resolvedParity = useMemo(() => {
    return (
      parityStat ?? {
        label: "Women's Share of Sports Media",
        value: '8.2%',
        subtext: '43% of active sports participants, 8.2% of broadcast airtime.',
        gap: '34.8% visibility deficit',
      }
    );
  }, [parityStat]);

  const exportPng = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `btc-card-${template}-${aspect.replace(':', 'x')}.png`;
      link.href = dataUrl;
      link.click();

      award('b-sharer');
      toast.success('Card downloaded', 'High-res share card ready for social media.');
    } catch (err) {
      console.error('Failed to export share card:', err);
      toast.warn('Download error', 'Could not render PNG. Try copying the share text.');
    } finally {
      setExporting(false);
    }
  };

  const copyShareText = () => {
    let text = '';
    if (template === 'quote') {
      text = `"${resolvedStory.quote}"\n— ${resolvedStory.athleteName}\n\nRead more on #BeyondTheCrease`;
    } else if (template === 'athlete') {
      text = `${athlete?.name ?? resolvedStory.athleteName} · ${athlete?.role ?? 'All-rounder'} (${athlete?.country ?? 'Global'})\n${athlete?.bio?.slice(0, 120) ?? ''}\n\n#BeyondTheCrease`;
    } else {
      text = `${resolvedParity.label}: ${resolvedParity.value} (${resolvedParity.gap})\n\nClosing the visibility gap at #BeyondTheCrease`;
    }
    void copy(text);
    award('b-sharer');
    toast.info('Share text copied with hashtag');
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Create Share Card" size="lg">
      <div className="flex flex-col gap-5">
        {/* Controls Row */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Template Picker */}
          <div>
            <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-muted">
              Template
            </label>
            <Segmented
              label="Card Template"
              value={template}
              onChange={(v) => setTemplate(v as CardTemplate)}
              options={[
                { value: 'quote', label: 'Quote' },
                { value: 'athlete', label: 'Athlete' },
                { value: 'parity', label: 'Parity' },
              ]}
            />
          </div>

          {/* Aspect Ratio Picker */}
          <div>
            <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-muted">
              Format
            </label>
            <Segmented
              label="Aspect Ratio"
              value={aspect}
              onChange={(v) => setAspect(v as CardAspect)}
              options={[
                { value: '1:1', label: '1:1 Post' },
                { value: '9:16', label: '9:16 Story' },
                { value: '16:9', label: '16:9 Wide' },
              ]}
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-muted">
              Palette
            </label>
            <Segmented
              label="Card Palette"
              value={palette}
              onChange={(v) => setPalette(v as CardPalette)}
              options={[
                { value: 'ink', label: 'Aubergine' },
                { value: 'canvas', label: 'Kulfi' },
                { value: 'mulberry', label: 'Mulberry' },
              ]}
            />
          </div>
        </div>

        {/* Live Card Preview Box */}
        <div className="flex items-center justify-center rounded-2xl bg-surface-sunken p-4 sm:p-6 overflow-hidden">
          <div
            ref={cardRef}
            className={cn(
              'scallop grain relative flex flex-col justify-between overflow-hidden p-6 transition-all shadow-btc-lg select-none',
              // Aspect ratio sizing
              aspect === '1:1' && 'w-full max-w-[380px] aspect-square',
              aspect === '9:16' && 'w-full max-w-[320px] aspect-[9/16]',
              aspect === '16:9' && 'w-full max-w-[480px] aspect-[16/9]',
              // Mithai Dusk Palettes
              palette === 'ink' && 'bg-[#2D1238] text-[#F2E6CF]',
              palette === 'canvas' && 'bg-[#F2E6CF] text-[#2D1238]',
              palette === 'mulberry' && 'bg-[#6E1F4B] text-[#F2E6CF]',
            )}
            style={{ minHeight: aspect === '9:16' ? 440 : 260 }}
          >
            {/* Jaali background overlay */}
            <div className="jaali-panel absolute inset-0 opacity-15 pointer-events-none" />

            {/* Header / Brand Monogram */}
            <div className="relative z-10 flex items-center justify-between border-b border-current/20 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full font-display text-[0.625rem] font-bold shadow-sm',
                    palette === 'canvas' ? 'bg-[#2D1238] text-[#F2E6CF]' : 'bg-[#F2B33D] text-[#2D1238]',
                  )}
                >
                  BTC
                </span>
                <span className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.2em] opacity-80">
                  Beyond the Crease
                </span>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-body text-[0.625rem] font-bold uppercase tracking-wider',
                  palette === 'canvas'
                    ? 'bg-[#2D1238]/10 text-[#2D1238]'
                    : 'bg-[#F2B33D]/25 text-[#F2B33D]',
                )}
              >
                {resolvedStory.sport}
              </span>
            </div>

            {/* Template 1: Story Quote */}
            {template === 'quote' && (
              <div className="relative z-10 my-auto flex flex-col gap-3 py-3">
                <QuoteIcon
                  aria-hidden
                  className={cn('h-7 w-7 opacity-50', palette === 'canvas' ? 'text-[#FF6F8E]' : 'text-[#F2B33D]')}
                />
                <p className="font-display text-lg sm:text-xl font-bold leading-snug tracking-tight text-balance">
                  &ldquo;{resolvedStory.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1 opacity-90">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      palette === 'canvas' ? 'bg-[#FF6F8E]' : 'bg-[#F2B33D]',
                    )}
                  />
                  <span className="font-body text-xs font-semibold">{resolvedStory.athleteName}</span>
                </div>
              </div>
            )}

            {/* Template 2: Athlete Spotlight */}
            {template === 'athlete' && (
              <div className="relative z-10 my-auto flex flex-col gap-3 py-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold shadow-md',
                      palette === 'canvas'
                        ? 'bg-[#FF6F8E] text-[#2D1238]'
                        : 'bg-[#F2B33D] text-[#2D1238]',
                    )}
                  >
                    {athlete?.initials ?? resolvedStory.athleteName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-display text-lg sm:text-xl font-bold leading-none">
                      {athlete?.name ?? resolvedStory.athleteName}
                    </h3>
                    <p className="font-body text-xs opacity-75 mt-0.5">
                      {athlete?.role ?? 'Specialist'} · {athlete?.country ?? 'International'}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-xl p-3 border backdrop-blur-sm',
                    palette === 'canvas'
                      ? 'bg-black/5 border-black/10'
                      : 'bg-white/10 border-white/15',
                  )}
                >
                  <p className="font-body text-[0.6875rem] font-bold uppercase tracking-wider opacity-70">
                    {athlete?.signature.label ?? 'Signature Metric'}
                  </p>
                  <p
                    className={cn(
                      'font-display text-2xl font-black',
                      palette === 'canvas' ? 'text-[#FF6F8E]' : 'text-[#F2B33D]',
                    )}
                  >
                    {athlete?.signature.value ?? '94.2%'}
                  </p>
                  <p className="font-body text-[0.625rem] opacity-75">
                    {athlete?.signature.note ?? 'Parity-adjusted game contribution'}
                  </p>
                </div>
              </div>
            )}

            {/* Template 3: Parity Stat */}
            {template === 'parity' && (
              <div className="relative z-10 my-auto flex flex-col gap-2 py-3">
                <p className="font-body text-xs font-semibold uppercase tracking-wider opacity-80">
                  {resolvedParity.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'font-display text-4xl sm:text-5xl font-black tracking-tight',
                      palette === 'canvas' ? 'text-[#FF6F8E]' : 'text-[#F2B33D]',
                    )}
                  >
                    {resolvedParity.value}
                  </span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 font-body text-[0.625rem] font-bold uppercase',
                      palette === 'canvas' ? 'bg-[#FF6F8E]/20 text-[#FF6F8E]' : 'bg-[#A9CC6B]/30 text-[#A9CC6B]',
                    )}
                  >
                    {resolvedParity.gap}
                  </span>
                </div>
                <p className="font-body text-xs leading-relaxed opacity-85">
                  {resolvedParity.subtext}
                </p>
              </div>
            )}

            {/* Footer / Hashtag */}
            <div className="relative z-10 flex items-center justify-between border-t border-current/20 pt-2.5 text-[0.6875rem]">
              <span className="font-body font-semibold tracking-wide">
                #BeyondTheCrease
              </span>
              <span className="font-body opacity-65 text-[0.625rem]">
                Demo data · Track 1 ICC Hackathon
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="font-body text-xs text-muted">
            Rendered client-side via html-to-image. No image or data ever leaves this device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareText}
              icon={<Copy aria-hidden className="h-4 w-4" />}
            >
              Copy text
            </Button>
            <Button
              size="sm"
              onClick={() => void exportPng()}
              loading={exporting}
              icon={<Download aria-hidden className="h-4 w-4" />}
            >
              Download PNG ({aspect})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
