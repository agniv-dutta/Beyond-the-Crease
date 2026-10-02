import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  BookOpen,
  Check,
  Contrast,
  Eye,
  Keyboard,
  Languages as LanguagesIcon,
  RotateCcw,
  ShieldCheck,
  Type,
  Wifi,
} from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Disclosure,
  EmptyState,
  SectionHeading,
  Segmented,
  StatTile,
  Table,
  Tabs,
  TabPanel,
  TextLink,
  Toggle,
} from '@/components/ui';
import { usePrefs } from '@/store/prefs';
import { useSafety } from '@/store/safety';
import { toast } from '@/store/toasts';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@/i18n/resources';
import { getWebhookLog } from '@/webhooks/bus';
import type { TextSize } from '@/types';
import { clockTime, relativeTime } from '@/utils/format';
import { contrastRatio, cssVarValue, passesAA } from '@/utils/colour';

const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Powerplay', meaning: 'The first six overs, when only a limited number of fielders may be used.' },
  { term: 'Dot ball', meaning: 'A legal delivery from which no run is scored.' },
  { term: 'Raid', meaning: 'In kabaddi, one attacker crossing into the opposition half while a defender guards.' },
  { term: 'Chase', meaning: 'Batting second against a target set by the other side.' },
  { term: 'Break point', meaning: 'A point a player can convert to win a set in tennis.' },
  { term: 'Woodwork', meaning: 'Post or stump — the frame, in cricket.' },
  { term: 'Split', meaning: 'A tie in a tennis set, played as a tie-break.' },
  { term: 'Offside', meaning: 'A legal position ahead of the ball in football; the closest modern comparison to LBW.' },
];

const MOTION_REMEDY = [
  'Every animation respects prefers-reduced-motion and the in-app motion toggle.',
  'The live ticker can be muted without losing the stories themselves.',
  'Nothing flashes more than three times per second anywhere in the interface.',
];

export default function AccessPage() {
  const [tab, setTab] = useState('settings');
  const prefs = usePrefs();
  const safety = useSafety();
  const [log, setLog] = useState(getWebhookLog);

  /**
   * Reads the live theme's body/background pair straight out of the stylesheet,
   * so the number shown here is the contrast actually being painted.
   */
  const contrast = useMemo(() => {
    const root = document.documentElement;
    const read = (token: string) =>
      getComputedStyle(root).getPropertyValue(token).trim() || cssVarValue(token);
    const ratio = contrastRatio(read('--btc-ink'), read('--btc-canvas'));
    return { ratio, passes: passesAA(ratio), theme: prefs.theme };
  }, [prefs.theme]);

  const flags = safety.records.filter((r) => !r.resolved);

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-5">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Access' }]} />
          <SectionHeading
            eyebrow="Access centre"
            title="Turn anything on or off. Nothing is behind a sign-up."
            lede="Every preference here applies immediately, persists in this browser, and is applied before first paint so the page never flashes the wrong contrast. The moderation log below is the real one your actions write to."
            action={<TextLink to="/dev">How the accessibility plumbing works</TextLink>}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Body contrast"
              value={`${contrast.ratio.toFixed(1)}:1`}
              tone={contrast.passes ? 'positive' : 'warn'}
              hint={`WCAG AA needs 4.5:1 · ${contrast.passes ? 'passing' : 'failing'}`}
            />
            <StatTile label="Interface languages" value={LANGUAGES.length} hint="one fully translated, Tamil partial" />
            <StatTile label="Text sizes" value={4} hint="sm, md, lg, xl" />
          </div>
        </div>
      </section>

      <div className="container">
        <Tabs
          label="Access sections"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'settings', label: 'Settings' },
            { id: 'safety', label: 'Safety log', count: safety.records.length },
            { id: 'glossary', label: 'Glossary' },
            { id: 'events', label: 'Webhooks', count: log.length },
          ]}
        />

        <TabPanel id="settings" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-5 p-6">
              <h2 className="flex items-center gap-2 font-display text-title text-body">
                <Eye aria-hidden className="h-5 w-5 text-accent" />
                Reading
              </h2>

              <div className="flex flex-col gap-2">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Text size</span>
                <Segmented
                  label="Text size"
                  value={prefs.textSize}
                  onChange={(v) => prefs.setTextSize(v as TextSize)}
                  options={[
                    { value: 'sm', label: 'Small' },
                    { value: 'md', label: 'Medium' },
                    { value: 'lg', label: 'Large' },
                    { value: 'xl', label: 'Extra large' },
                  ]}
                />
                <p className="font-body text-sm text-muted">
                  The quick brown fox jumps over the lazy dog — 0123456789 in every size.
                </p>
              </div>

              <Toggle
                label="Dyslexia-friendly font"
                description="Switches body copy to Atkinson Hyperlegible. Letters keep their shape at low contrast."
                checked={prefs.dyslexiaFont}
                onChange={prefs.setDyslexiaFont}
              />
              <Toggle
                label="Plain language"
                description="Shortens sentences, hides secondary detail and replaces cricket jargon with plain words."
                checked={prefs.plainLanguage}
                onChange={prefs.setPlainLanguage}
              />
              <Toggle
                label="High contrast"
                description="Thicker borders and brighter text on every surface, not just the one you are looking at."
                checked={prefs.highContrast}
                onChange={prefs.setHighContrast}
              />
              <Toggle
                label="Reduced motion"
                description="Turns off ticker scrolling, card lifts and the shimmer on gold buttons."
                checked={prefs.reducedMotion}
                onChange={prefs.setReducedMotion}
              />
              <Toggle
                label="Low data"
                description="Replaces charts with tables and skips decorative textures."
                checked={prefs.lowData}
                onChange={prefs.setLowData}
              />
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="flex flex-col gap-4 p-6">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <LanguagesIcon aria-hidden className="h-5 w-5 text-accent" />
                  Language and direction
                </h2>
                <p className="font-body text-sm text-muted">
                  Arabic flips the entire layout to right-to-left, including icon direction and the reading order of
                  every card.
                </p>
                <ul className="flex flex-col gap-2">
                  {LANGUAGES.map((l) => (
                    <li key={l.code} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-body text-sm text-body">
                        <span aria-hidden>{l.flag}</span>
                        {l.label} · {l.native}
                        {l.dir === 'rtl' && <Badge tone="silver">RTL</Badge>}
                      </span>
                      <Button
                        size="sm"
                        variant={prefs.language === l.code ? 'secondary' : 'outline'}
                        onClick={() => {
                          prefs.setLanguage(l.code);
                          toast.info(`Interface is now ${l.label}`);
                        }}
                      >
                        {prefs.language === l.code ? 'Current' : 'Use'}
                      </Button>
                    </li>
                  ))}
                </ul>
                <p className="font-body text-xs text-muted">
                  Interface language is currently {LANGUAGE_BY_CODE[prefs.language].label}. Story bodies are generated per
                  story, and circle rooms carry their own language mix.
                </p>
              </Card>

              <Card className="flex flex-col gap-4 p-6">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <Keyboard aria-hidden className="h-5 w-5 text-accent" />
                  Keyboard map
                </h2>
                <ul className="flex flex-col gap-2 font-body text-sm">
                  {[
                    ['Tab / Shift+Tab', 'Move through every control in reading order'],
                    ['Enter or Space', 'Activate the focused button, link or card'],
                    ['/', 'Jump to the search box from anywhere'],
                    ['Ctrl + K', 'Open the command palette'],
                    ['Escape', 'Close any dialog and return focus to where you were'],
                    ['Ctrl + Enter', 'Post a message in a circle or publish a draft'],
                    ['Arrow keys', 'Move between tabs in the segmented controls'],
                  ].map(([keys, what]) => (
                    <li key={keys} className="flex flex-wrap items-baseline gap-2">
                      <kbd className="rounded border border-line bg-surface-sunken px-1.5 py-0.5 font-body text-xs text-body">
                        {keys}
                      </kbd>
                      <span className="text-muted">{what}</span>
                    </li>
                  ))}
                </ul>
                <Disclosure summary="Focus ring behaviour">
                  <p>
                    Focus is never removed, only restyled: a 2px accent ring with a 2px offset on every interactive
                    element, so the current position is obvious at 200% zoom and in high-contrast mode. Dialogs trap
                    focus and restore it to the trigger on close.
                  </p>
                </Disclosure>
              </Card>

              <Card className="flex flex-col gap-3 p-6">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <RotateCcw aria-hidden className="h-5 w-5 text-accent" />
                  Reset everything
                </h2>
                <p className="font-body text-sm text-muted">
                  Returns text size, theme, language, sport and all accessibility toggles to their defaults. Your drafts,
                  likes and moderation log are kept.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      prefs.resetPrefs();
                      toast.success('Preferences reset');
                    }}
                  >
                    Reset preferences
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      prefs.resetOnboarding();
                      toast.info('Onboarding replayed', 'The welcome tour will show on the next load.');
                    }}
                  >
                    Replay the tour
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="safety" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <ShieldCheck aria-hidden className="h-5 w-5 text-accent" />
                  Moderation log
                </h2>
                {flags.length > 0 && <Badge tone="rose">{flags.length} open</Badge>}
              </div>
              {safety.records.length === 0 ? (
                <EmptyState
                  title="Nothing logged yet"
                  body="Mute, block or report someone in a circle and the action appears here with a timestamp."
                  icon={<ShieldCheck aria-hidden className="h-8 w-8 text-muted" />}
                  action={
                    <Link to="/circles">
                      <Button>Find a circle</Button>
                    </Link>
                  }
                />
              ) : (
                <ul className="flex flex-col gap-2">
                  {safety.records.map((record) => (
                    <li
                      key={record.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-3.5"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="font-body text-sm text-body">
                          <strong className="uppercase">{record.kind}</strong> · {record.targetLabel}
                        </span>
                        <span className="font-body text-xs text-muted">{record.note}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <time className="font-body text-xs text-muted" dateTime={record.atISO}>
                          {clockTime(record.atISO)} · {relativeTime(record.atISO)}
                        </time>
                        {!record.resolved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              safety.resolve(record.id);
                              toast.info('Marked resolved');
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-3 p-5">
                <h2 className="font-display text-title text-body">Your settings</h2>
                <p className="font-body text-sm text-muted">
                  {safety.blockedUserIds.length} blocked · {safety.mutedUserIds.length} muted ·{' '}
                  {safety.gentleNudgesAccepted} rule sheets read
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    safety.clear();
                    toast.info('Safety log cleared');
                  }}
                >
                  Clear the log
                </Button>
              </Card>

              <Card className="flex flex-col gap-3 p-5">
                <h2 className="font-display text-title text-body">How circles stay civil</h2>
                <ol className="flex list-decimal flex-col gap-2 ps-4 font-body text-sm text-muted">
                  <li>Reports hold the message but do not delete it.</li>
                  <li>A named moderator, not an algorithm, makes the call.</li>
                  <li>Mutes are private; blocks are yours alone.</li>
                  <li>Every moderator action is written to this log.</li>
                  <li>Nothing here is ever sold, shared or used for ad targeting.</li>
                </ol>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="glossary" activeId={tab}>
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="flex items-center gap-2 font-display text-title text-body">
              <BookOpen aria-hidden className="h-5 w-5 text-accent" />
              Glossary
            </h2>
            <p className="max-w-3xl font-body text-sm text-pretty text-muted">
              Cross-sport terminology, written for readers who follow a different game. Plain-language mode uses these
              same definitions in shortened form.
            </p>
            <Table
              caption="Glossary of sport terms used across the site"
              head={['Term', 'What it means']}
              rows={GLOSSARY.map((g) => [g.term, g.meaning])}
            />
          </Card>
        </TabPanel>

        <TabPanel id="events" activeId={tab}>
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-title text-body">
                <Wifi aria-hidden className="h-5 w-5 text-accent" />
                Webhook stream
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLog(getWebhookLog());
                  toast.info('Stream refreshed');
                }}
                icon={<Contrast aria-hidden className="h-4 w-4" />}
              >
                Refresh
              </Button>
            </div>
            {log.length === 0 ? (
              <EmptyState
                title="No events yet"
                body="Open the live page and fire a test moment, or post a message in a circle."
                icon={<Wifi aria-hidden className="h-8 w-8 text-muted" />}
                action={
                  <Link to="/live">
                    <Button>Open live</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2 font-body text-sm">
                {log.slice(0, 25).map((event) => (
                  <li key={event.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-line p-3">
                    <Badge tone={event.status === 'delivered' ? 'pistachio' : 'rose'}>{event.status}</Badge>
                    <span className="font-display text-sm text-body">{event.type}</span>
                    <span className="min-w-0 flex-1 truncate text-muted">
                      {JSON.stringify(event.payload)}
                    </span>
                    <time className="font-body text-xs text-muted" dateTime={event.createdAtISO}>
                      {clockTime(event.createdAtISO)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            <Disclosure summary="What these events are for">
              <p>
                These four event types are the integration surface the project is really about: a broadcaster can push a{' '}
                <code>match.moment</code>, the app can turn it into a story draft, and a{' '}
                <code>story.published</code> event can fan out to every open tab. Circle messages and athlete milestones
                ride the same bus.
              </p>
              <p className="mt-2">
                Deliveries can fail, and the retry log is on the <Link className="underline" to="/dev">dev page</Link>.
              </p>
            </Disclosure>
          </Card>
        </TabPanel>
      </div>

      <section className="container grid gap-6 pb-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="flex items-center gap-2 font-display text-title text-body">
            <Accessibility aria-hidden className="h-5 w-5 text-accent" />
            Conformance notes
          </h2>
          <ul className="flex flex-col gap-2 font-body text-sm text-muted">
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
              Body text targets 7:1 or better on both themes; large text stays above 4.5:1.
            </li>
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
              Gold and pomelo buttons always carry aubergine text, never cream.
            </li>
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
              Icon-only controls have accessible names; every chart has a table equivalent in low-data mode.
            </li>
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
              Live regions announce new messages and new match moments without stealing focus.
            </li>
            <li className="flex items-start gap-2">
              <Type aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
              Text scales to 200% without horizontal scrolling on any route.
            </li>
          </ul>
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <h2 className="font-display text-title text-body">Motion</h2>
          <ul className="flex flex-col gap-2 font-body text-sm text-muted">
            {MOTION_REMEDY.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
                {line}
              </li>
            ))}
          </ul>
          <TextLink to="/design">See the design system</TextLink>
        </Card>
      </section>
    </div>
  );
}