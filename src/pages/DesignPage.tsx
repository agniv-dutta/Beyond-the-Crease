import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Type as TypeIcon } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  SectionHeading,
  Segmented,
  StatTile,
  TextLink,
} from '@/components/ui';
import { useClipboard } from '@/hooks/useMisc';
import { toast } from '@/store/toasts';
import { usePrefs } from '@/store/prefs';
import { cn } from '@/utils/cn';

const PALETTE = [
  { token: '--btc-ink', name: 'Aubergine Ink', role: 'Ink and dark surfaces', use: 'text on cream, dusk backgrounds' },
  { token: '--btc-canvas', name: 'Kulfi Cream', role: 'Base canvas', use: 'Kulfi theme background, body text on dusk' },
  { token: '--btc-pomelo', name: 'Pomelo Flame', role: 'Primary CTA', use: 'Buttons, live accents, live series' },
  { token: '--btc-kesar', name: 'Kesar Gold', role: 'Highlights and stars', use: 'Ratings, gold surfaces, moments' },
  { token: '--btc-pistachio', name: 'Pistachio Barfi', role: 'Positive and success', use: 'Parity gains, passing checks' },
  { token: '--btc-rose', name: 'Rasmalai Rose', role: 'Soft cards', use: 'Story cards, highlighted rails' },
  { token: '--btc-mulberry', name: 'Mulberry Wine', role: 'Depth and secondary', use: 'Dusk surfaces, chart comparison series' },
  { token: '--btc-silver', name: 'Varq Silver', role: 'Borders and shimmer', use: 'Hairlines, stickers, muted chrome' },
] as const;

const TYPE_SCALE = [
  { name: 'display', sample: 'Every match has a story', className: 'font-display text-display' },
  { name: 'title', sample: 'The over she took alone', className: 'font-display text-title' },
  { name: 'body', sample: 'Body copy at sixteen pixels, set in Bricolage Grotesque.', className: 'font-body text-base text-body' },
  { name: 'small', sample: 'Caption and metadata, twelve pixels.', className: 'font-body text-xs text-muted' },
  { name: 'micro', sample: 'Uppercase eyebrow labels with wide tracking.', className: 'font-body text-[0.7rem] uppercase tracking-[0.18em] text-muted' },
];

const RADII = [
  { token: '--btc-radius-scallop', name: 'Scallop', value: '20px', use: 'Cards, sheets, share cards' },
  { token: 'rounded-2xl', name: 'Panel', value: '1rem', use: 'Inputs, message bubbles, stat tiles' },
  { token: 'rounded-full', name: 'Sticker', value: '999px', use: 'Badges, chips, reactions' },
];

/**
 * Reads a token's current value straight out of the stylesheet, so this page
 * reports what the browser is actually painting instead of a second copy of it.
 */
function useTokenValues(tokens: readonly string[]): Record<string, string> {
  const theme = usePrefs((s) => s.theme);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Re-read after the theme attribute lands so the values match what is painted.
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      setValues(
        Object.fromEntries(
          tokens.map((token) => [token, styles.getPropertyValue(token).trim() || 'unresolved']),
        ),
      );
    };
    read();
    const id = window.requestAnimationFrame(read);
    return () => window.cancelAnimationFrame(id);
  }, [tokens, theme]);

  return values;
}

export default function DesignPage() {
  const theme = usePrefs((s) => s.theme);
  const toggleTheme = usePrefs((s) => s.toggleTheme);
  const { copy } = useClipboard();
  const [preview, setPreview] = useState<'buttons' | 'cards' | 'motifs'>('buttons');
  const tokens = useTokenValues(PALETTE.map((p) => p.token));

  return (
    <div className="flex flex-col gap-12">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-5">
          <Breadcrumbs items={[{ label: 'Home', to: '/today' }, { label: 'Design' }]} />
          <SectionHeading
            eyebrow="Design system"
            title="Mithai Dusk"
            lede="An Indian sweet-shop counter at golden hour: pistachio barfi, rose sweets, saffron and silver varq foil against a deep aubergine dusk. Every value below is a CSS variable, so a component never hardcodes a hex."
            action={
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={toggleTheme}>
                  Switch to {theme === 'kulfi' ? 'Aubergine Dusk' : 'Kulfi Cream'}
                </Button>
                <TextLink to="/access">Accessibility notes</TextLink>
              </div>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Palette" value="8 roles" hint="no fifth primary" tone="accent" />
            <StatTile label="Typefaces" value={3} hint="Fraunces, Bricolage, Atkinson" />
            <StatTile label="Themes" value={2} hint="kulfi and dusk" />
            <StatTile label="Hardcoded hex in components" value={0} hint="tokens only" />
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-5">
        <h2 className="font-display text-display-sm text-body">Palette</h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PALETTE.map((colour) => {
            const value = tokens[colour.token] ?? 'unresolved';
            return (
            <li key={colour.token}>
              <Card className="flex flex-col gap-3 overflow-hidden p-0">
                <span
                  aria-hidden
                  className="block h-20 w-full border-b border-line"
                  style={{ background: `var(${colour.token})` }}
                />
                <div className="flex flex-col gap-1.5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-title text-body">{colour.name}</h3>
                    <Badge tone="silver">{colour.role}</Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void copy(`${colour.token}: ${value};`);
                      toast.info(`${colour.token} copied`);
                    }}
                    className="inline-flex items-center gap-1.5 self-start font-body text-sm text-accent underline-offset-4 hover:underline"
                  >
                    <Copy aria-hidden className="h-3.5 w-3.5" />
                    {colour.token} · {value}
                  </button>
                  <p className="font-body text-xs text-muted">{colour.use}</p>
                </div>
              </Card>
            </li>
            );
          })}
        </ul>
        <p className="max-w-3xl font-body text-sm leading-relaxed text-pretty text-muted">
          Proportions are roughly 60% kulfi or aubergine, 30% rose and mulberry, and 10% pomelo, kesar and pistachio.
          Aubergine text sits on pomelo and kesar buttons — never the reverse, because cream on gold fails AA.
        </p>
      </section>

      <section className="container grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="flex items-center gap-2 font-display text-title text-body">
            <TypeIcon aria-hidden className="h-5 w-5 text-accent" />
            Type scale
          </h2>
          <ul className="flex flex-col gap-4">
            {TYPE_SCALE.map((step) => (
              <li key={step.name} className="flex flex-col gap-1 border-b border-line/60 pb-3 last:border-0">
                <span className="font-body text-[0.7rem] uppercase tracking-[0.18em] text-muted">{step.name}</span>
                <span className={cn('text-body', step.className)}>{step.sample}</span>
              </li>
            ))}
          </ul>
          <p className="font-body text-xs text-muted">
            Display and title are fluid clamps, so they never overflow at 320px and never look small on a 27-inch
            screen. The dyslexia toggle swaps the body family only.
          </p>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-title text-body">Shape</h2>
          <ul className="flex flex-col gap-3">
            {RADII.map((radius) => (
              <li key={radius.name} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-12 w-20 border-2 border-accent bg-accent/15"
                  style={{ borderRadius: radius.value }}
                />
                <span className="flex flex-col">
                  <span className="font-body text-sm font-semibold text-body">{radius.name}</span>
                  <span className="font-body text-xs text-muted">
                    {radius.token} · {radius.value} · {radius.use}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <h3 className="font-display text-title text-body">Gradients</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <span className="flex h-16 items-center justify-center rounded-2xl bg-dusk-fruit font-body text-xs font-semibold text-ink">
              dusk-fruit
            </span>
            <span className="flex h-16 items-center justify-center rounded-2xl bg-barfi-glow font-body text-xs font-semibold text-ink">
              barfi-glow
            </span>
          </div>
        </Card>
      </section>

      <section className="container flex flex-col gap-5">
        <Segmented
          label="Component preview"
          value={preview}
          onChange={setPreview}
          options={[
            { value: 'buttons', label: 'Buttons' },
            { value: 'cards', label: 'Cards' },
            { value: 'motifs', label: 'Motifs' },
          ]}
        />

        <Card className="flex flex-col gap-5 p-8">
          {preview === 'buttons' && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary CTA</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="pistachio">Success</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <div className="flex items-center gap-2">
                <Badge tone="accent">accent</Badge>
                <Badge tone="kesar">kesar</Badge>
                <Badge tone="pistachio">pistachio</Badge>
                <Badge tone="rose">rose</Badge>
                <Badge tone="mulberry">mulberry</Badge>
                <Badge tone="silver">silver</Badge>
                <Badge tone="live">live</Badge>
              </div>
            </div>
          )}

          {preview === 'cards' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col gap-2 p-5">
                <Badge tone="accent">Flat card</Badge>
                <h3 className="font-display text-title text-body">Scallop top</h3>
                <p className="font-body text-sm text-muted">The default surface. One hairline, no shadow.</p>
              </Card>
              <Card className="scallop flex flex-col gap-2 p-5">
                <Badge tone="kesar">Scalloped</Badge>
                <h3 className="font-display text-title text-body">Sweet-shop edge</h3>
                <p className="font-body text-sm text-muted">Used for hero panels and share cards.</p>
              </Card>
              <Card className="grain flex flex-col gap-2 bg-mulberry-deep p-5 text-canvas">
                <Badge tone="kesar">Deep</Badge>
                <h3 className="font-display text-title text-canvas">Paper grain</h3>
                <p className="font-body text-sm text-silver">Mulberry gradient with a 4% grain overlay.</p>
              </Card>
            </div>
          )}

          {preview === 'motifs' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="jaali-panel hairline flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-surface">
                <span className="font-display text-title text-body">Jaali lattice</span>
                <span className="font-body text-xs text-muted">Diamond lattice, 16% ink</span>
              </div>
              <div className="grain flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-canvas">
                <span className="font-display text-title text-body">Paper grain</span>
                <span className="font-body text-xs text-muted">SVG turbulence, no image request</span>
              </div>
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-ink">
                <span className="sticker bg-kesar text-ink">Sticker badge</span>
                <span className="font-body text-xs text-silver">Rotated, hard edge, no blur</span>
              </div>
              <div className="hairline flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-surface">
                <span className="font-display text-title text-body">Hairline</span>
                <span className="font-body text-xs text-muted">One silver pixel, never a shadow</span>
              </div>
              <div className="relative flex h-40 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-kesar">
                <span className="font-display text-title text-ink">Varq sweep</span>
                <span className="font-body text-xs text-ink/70">Shimmer, disabled under reduced motion</span>
              </div>
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-pistachio">
                <Check aria-hidden className="h-6 w-6 text-ink" />
                <span className="font-display text-title text-ink">Confirmations</span>
                <span className="font-body text-xs text-ink/70">Pistachio only for success</span>
              </div>
            </div>
          )}
        </Card>
      </section>

      <section className="container grid gap-6 pb-8 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="font-display text-title text-body">Rules that are not negotiable</h2>
          <ul className="flex flex-col gap-2 font-body text-sm text-muted">
            {[
              'No hex literals in a component. Tokens only.',
              'Aubergine text on pomelo and kesar, never cream on gold.',
              'One primary CTA per view. The rest are secondary or ghost.',
              'Pistachio means success only, never decoration.',
              'Silver carries structure; it never carries meaning.',
              'Every focusable element has a visible 2px focus ring.',
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
                {rule}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <h2 className="font-display text-title text-body">Wordmark</h2>
          <div className="flex items-center gap-3">
            <span className="scallop flex h-16 w-16 items-center justify-center rounded-scallop bg-kesar font-display text-title text-ink">
              BTC
            </span>
            <span className="flex flex-col">
              <span className="font-display text-title text-body">Beyond the Crease</span>
              <span className="font-body text-xs text-muted">
                Every match has a story. Not every story gets heard.
              </span>
              <span className="font-body text-xs text-muted">#BeyondTheCrease</span>
            </span>
          </div>
          <Link to="/today">
            <Button variant="outline" size="sm">
              Back to the feed
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}