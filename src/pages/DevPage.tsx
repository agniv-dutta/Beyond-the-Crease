import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bug, CheckCircle2, Database, Play, RefreshCw, Terminal, Trash2, Zap } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Disclosure,
  EmptyState,
  SectionHeading,
  StatTile,
  Table,
  Tabs,
  TabPanel,
  TextLink,
  Toggle,
} from '@/components/ui';
import { api, isOfflineFallbackActive, setOfflineFallback } from '@/api/client';
import { ROUTES, datasetSummary } from '@/api/resolvers';
import { MOMENTS } from '@/data/matches';
import {
  DEFAULT_SIMULATION,
  clearWebhookLog,
  emitWebhook,
  getWebhookLog,
  isSimulationRunning,
  startSimulation,
  stopSimulation,
} from '@/webhooks/bus';
import { useStudio } from '@/store/studio';
import { useGamification } from '@/store/gamification';
import { useSafety } from '@/store/safety';
import { usePrefs } from '@/store/prefs';
import { useToasts } from '@/store/toasts';
import { toast } from '@/store/toasts';
import { FAIRNESS_RULES, applyFairnessFixes, checkFairness } from '@/utils/fairness';
import { clockTime, relativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { WebhookEventType } from '@/types';

const EVENT_TYPES: WebhookEventType[] = ['match.moment', 'story.published', 'circle.message', 'milestone.reached'];

const PLAYGROUNDS: { id: string; label: string; run: () => Promise<void> }[] = [
  {
    id: 'feed',
    label: 'GET /api/feed',
    run: async () => {
      const res = await api.getFeed({ sport: 'cricket', limit: 3 });
      toast.info(`${res.stories.length} stories`, res.stories.map((s) => s.title).slice(0, 2).join(' · '));
    },
  },
  {
    id: 'parity',
    label: 'GET /api/parity',
    run: async () => {
      const res = await api.getParity({ sport: 'cricket', region: 'All', platform: 'All', months: 12, growth: 4.4 });
      toast.info(`women’s minutes share ${res.metric.mediaShare.toFixed(1)}%`, `${res.csv.split('\n').length - 1} CSV rows`);
    },
  },
  {
    id: 'generate',
    label: 'POST /api/stories/generate',
    run: async () => {
      const res = await api.generateStory({ tone: 'analyst', format: 'recap', length: 90, language: 'en' });
      toast.info(res.title, `${res.fairScore}/100 fairness · ${res.readSeconds}s read`);
    },
  },
  {
    id: 'fairness',
    label: 'Fail 5% deliberately',
    run: async () => {
      let caught = 0;
      for (let i = 0; i < 25; i += 1) {
        try {
          await api.getMatches({ sport: 'cricket' });
        } catch {
          caught += 1;
        }
      }
      toast.warn(`${caught}/25 requests failed`, 'That is the simulated 5% error rate, honestly counted.');
    },
  },
];

/** Cycles the real dataset's moments so the simulation is not inventing fixtures. */
let demoCursor = 0;
function pickDemoMoment() {
  const candidates = MOMENTS.filter((m) => m.excitement >= 4);
  if (candidates.length === 0) return null;
  const moment = candidates[demoCursor % candidates.length];
  demoCursor += 1;
  return {
    type: 'match.moment' as const,
    payload: {
      matchId: moment.matchId,
      momentId: moment.id,
      text: moment.text,
      over: moment.over,
      runs: moment.runs,
    },
  };
}

const SAMPLE_SENTENCES = [
  'She is a feisty, diminutive wicketkeeper and everyone knows it.',
  'For a woman, 42 runs off 28 balls is exceptional.',
  'He was clearly angry while she remained calm and composed throughout.',
  'The only good thing about her game is her fielding in the slips.',
];

export default function DevPage() {
  const [tab, setTab] = useState('api');
  const [offline, setOffline] = useState(isOfflineFallbackActive());
  const [running, setRunning] = useState(isSimulationRunning());
  const [log, setLog] = useState(getWebhookLog);
  const [busy, setBusy] = useState<string | null>(null);
  const [sample, setSample] = useState(SAMPLE_SENTENCES[0]);

  const summary = datasetSummary();
  const drafts = useStudio((s) => s.drafts);
  const gamification = useGamification();
  const safety = useSafety();
  const prefs = usePrefs();
  const toasts = useToasts((s) => s.toasts);

  useEffect(() => {
    const timer = setInterval(() => setLog(getWebhookLog()), 1500);
    return () => clearInterval(timer);
  }, []);

  const fairness = useMemo(() => checkFairness(sample), [sample]);
  const stored = useMemo(
    () => Object.keys(localStorage).filter((k) => k.startsWith('btc.')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drafts, gamification, safety, prefs, toasts],
  );

  const fire = async (type: WebhookEventType) => {
    const payloads = {
      'match.moment': { matchId: 'm-t20-01', momentId: 'mo-demo', text: 'Two runs off the last ball.', over: '19.4', runs: 2 },
      'story.published': { storyId: 's-demo', title: 'A demo headline', theme: 'Comeback' as const, authorName: 'You' },
      'circle.message': { circleId: 'c-watch', messageId: 'm-demo', authorName: 'Neha', body: 'Did anyone else see that?!' },
      'milestone.reached': { label: '100k views', detail: 'A fictional athlete passed a round number.', value: 100000 },
    } as const;
    emitWebhook(type, payloads[type], { source: 'manual', failRate: 0 });
    setLog(getWebhookLog());
    toast.success(`${type} emitted`, 'It should already be on the ticker and in the log.');
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-5">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Dev' }]} />
          <SectionHeading
            eyebrow="Developer console"
            title="Everything the demo fakes, in one place"
            lede="The MSW routes, the webhook bus, the seeded generators and the browser-local stores. Nothing on this page is secret — it is a prototype, and pretending otherwise would be the dishonest choice."
            action={<TextLink to="/design">Design tokens</TextLink>}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="API routes" value={ROUTES.length} hint="one resolver, two transports" tone="accent" />
            <StatTile label="Transport" value={offline ? 'in-process' : 'MSW worker'} hint="same resolver either way" tone={offline ? 'warn' : 'positive'} />
            <StatTile label="Webhook events" value={log.length} hint="ring buffer, 100 entries" />
            <StatTile label="Local stores" value={stored.length} hint="persisted in this browser only" />
          </div>
        </div>
      </section>

      <div className="container">
        <Tabs
          label="Developer sections"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'api', label: 'API', count: ROUTES.length },
            { id: 'events', label: 'Events', count: log.length },
            { id: 'fairness', label: 'Fairness' },
            { id: 'stores', label: 'Stores', count: stored.length },
          ]}
        />

        <TabPanel id="api" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <Database aria-hidden className="h-5 w-5 text-accent" />
                  Route table
                </h2>
                <Badge tone={offline ? 'rose' : 'pistachio'}>
                  {offline ? 'fallback resolver' : 'intercepted by MSW'}
                </Badge>
              </div>
              <Table
                caption="Every API route, its method and its keys"
                head={['Method', 'Path', 'Keys']}
                rows={ROUTES.map((r) => [r.method, r.path.replace('/api', ''), r.keys.join(', ') || '—'])}
              />
              <div className="flex flex-col gap-2">
                <Toggle
                  label="Force the in-process fallback"
                  description="Ignores the service worker and runs the resolver directly, so you can see the client work without MSW."
                  checked={offline}
                  onChange={(on) => {
                    setOfflineFallback(on);
                    setOffline(on);
                    toast.info(on ? 'Offline fallback on' : 'Back to MSW');
                  }}
                />
                <Disclosure summary="Dataset summary">
                  <ul className="font-body text-sm text-muted">
                    {Object.entries(summary).map(([key, value]) => (
                      <li key={key}>
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              </div>
            </Card>

            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-3 p-5">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <Play aria-hidden className="h-5 w-5 text-accent" />
                  Try a request
                </h2>
                {PLAYGROUNDS.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    loading={busy === item.id}
                    onClick={async () => {
                      setBusy(item.id);
                      try {
                        await item.run();
                      } catch (error) {
                        toast.warn('Request failed', error instanceof Error ? error.message : 'Unknown error');
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <p className="font-body text-[0.7rem] text-muted">
                  Latency is 300–900ms and 5% of requests fail on purpose, so the error states you see in the app are
                  real states and not decoration.
                </p>
              </Card>

              <Card className="flex flex-col gap-3 p-5">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <Bug aria-hidden className="h-5 w-5 text-accent" />
                  Cross-sport
                </h2>
                <p className="font-body text-sm text-muted">
                  The switcher in the header rewrites athletes, matches and stories. Cricket has hand-written data;
                  the other four are generated from templates with the same shape.
                </p>
                <Link to="/athletes">
                  <Button variant="ghost" size="sm" fullWidth>
                    Open the athlete list
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="events" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="font-display text-title text-body">Fire an event</h2>
              <div className="flex flex-col gap-2">
                {EVENT_TYPES.map((type) => (
                  <Button key={type} variant="outline" size="sm" onClick={() => void fire(type)} icon={<Zap aria-hidden className="h-4 w-4" />}>
                    Emit {type}
                  </Button>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
                <Button
                  variant={running ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => {
                    if (running) {
                      stopSimulation();
                      setRunning(false);
                      toast.info('Simulation stopped');
                    } else {
                      startSimulation({ ...DEFAULT_SIMULATION, momentIntervalMs: 12000 }, () => {
                        const moment = pickDemoMoment();
                        return moment ? { moment } : {};
                      });
                      setRunning(true);
                      toast.success('Simulation running', 'A synthetic moment every twelve seconds.');
                    }
                  }}
                >
                  {running ? 'Stop the simulation' : 'Start the simulation'}
                </Button>
                <p className="font-body text-xs text-muted">
                  The live ticker is listening for these. Open{' '}
                  <Link className="underline" to="/live">
                    /live
                  </Link>{' '}
                  in another tab to watch one push update both.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <Terminal aria-hidden className="h-5 w-5 text-accent" />
                  Delivery log
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setLog(getWebhookLog())} icon={<RefreshCw aria-hidden className="h-4 w-4" />}>
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      clearWebhookLog();
                      setLog([]);
                      toast.info('Log cleared');
                    }}
                    icon={<Trash2 aria-hidden className="h-4 w-4" />}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              {log.length === 0 ? (
                <EmptyState
                  title="No events yet"
                  body="Emit one from the panel, or open the live page and let the simulation run."
                  icon={<Terminal aria-hidden className="h-8 w-8 text-muted" />}
                />
              ) : (
                <ul className="flex flex-col gap-2">
                  {log.map((event) => (
                    <li key={event.id} className="flex flex-col gap-1 rounded-2xl border border-line p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', event.status === 'delivered' ? 'bg-pistachio' : 'bg-pomelo')} aria-hidden />
                        <span className="font-display text-sm text-body">{event.type}</span>
                        <Badge tone={event.status === 'delivered' ? 'pistachio' : 'rose'}>{event.status}</Badge>
                        <Badge tone="silver">{event.source}</Badge>
                        {event.attempt > 1 && <Badge tone="kesar">{event.attempt} attempts</Badge>}
                        <time className="ms-auto font-body text-xs text-muted" dateTime={event.createdAtISO}>
                          {clockTime(event.createdAtISO)} · {relativeTime(event.createdAtISO)}
                        </time>
                      </div>
                      <pre className="overflow-x-auto rounded-xl bg-surface-sunken/60 p-2.5 font-body text-xs text-muted">
{JSON.stringify(event.payload, null, 1)}
                      </pre>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="fairness" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <h2 className="font-display text-title text-body">Live checker</h2>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Try a sentence</span>
                <textarea
                  value={sample}
                  onChange={(e) => setSample(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-line bg-surface-sunken/40 p-4 font-body text-base text-body outline-none focus-visible:border-accent"
                />
              </label>
              <StatTile
                label="Fairness score"
                value={`${fairness.score}/100`}
                tone={fairness.verdict === 'pass' ? 'positive' : 'warn'}
                hint={fairness.verdict === 'pass' ? 'No diminishing language' : `${fairness.flags.length} flag(s)`}
              />
              {fairness.flags.length === 0 ? (
                <>
                  <p className="flex items-center gap-2 font-body text-sm text-muted">
                    <CheckCircle2 aria-hidden className="h-4 w-4 text-pistachio" />
                    Nothing flagged means the sentence describes the work, not the body.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSample(SAMPLE_SENTENCES[Math.floor(Math.random() * SAMPLE_SENTENCES.length)])}
                  >
                    Give me a bad one
                  </Button>
                </>
              ) : (
                <>
                  <ul className="flex flex-col gap-2">
                    {fairness.flags.map((flag) => (
                      <li key={flag.id} className="rounded-2xl border border-pomelo/50 bg-pomelo-soft/40 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="rose">{flag.kind}</Badge>
                          <Badge tone="silver">{flag.severity}</Badge>
                          <span className="font-body text-xs text-muted">index {flag.index}</span>
                        </div>
                        <p className="mt-1.5 font-display text-sm text-body">&ldquo;{flag.phrase}&rdquo;</p>
                        <p className="mt-1 font-body text-xs text-muted">{flag.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => {
                      const fixed = applyFairnessFixes(sample);
                      setSample(fixed.text);
                      toast.success(`${fixed.applied} phrase(s) rephrased`);
                    }}
                  >
                    Fix them all
                  </Button>
                </>
              )}
            </Card>

            <Card className="flex flex-col gap-3 p-6">
              <h2 className="font-display text-title text-body">The rule table</h2>
              <p className="font-body text-sm text-muted">
                {FAIRNESS_RULES.length} phrase rules, each with a severity and a suggested rewrite. They are
                intentionally blunt: the point is to catch &ldquo;diminutive&rdquo;, not to be a sentiment model.
              </p>
              <Disclosure summary="Show every rule">
                <ul className="flex flex-col gap-2">
                  {FAIRNESS_RULES.map((rule) => (
                    <li key={rule.phrase} className="rounded-2xl border border-line p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="silver">{rule.kind}</Badge>
                        <span className="font-body text-xs text-muted">{rule.severity}</span>
                      </div>
                      <p className="mt-1 font-body text-sm text-body">{rule.phrase}</p>
                      <p className="mt-1 font-body text-xs text-muted">{rule.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </Disclosure>
              <p className="flex items-start gap-2 font-body text-xs text-muted">
                <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-kesar" />
                Known limitation: a phrase matcher will flag quotes and quoted criticism. That is why it offers
                suggestions instead of edits, and why the flag list is dismissible.
              </p>
            </Card>
          </div>
        </TabPanel>

        <TabPanel id="stores" activeId={tab}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <h2 className="flex items-center gap-2 font-display text-title text-body">
                <Database aria-hidden className="h-5 w-5 text-accent" />
                Persisted keys
              </h2>
              <p className="font-body text-sm text-muted">
                Four Zustand stores write to localStorage under the <code className="rounded bg-surface-sunken px-1 font-body text-xs">btc.</code>{' '}
                prefix. Clearing the site data resets the demo completely.
              </p>
              <Table caption="Zustand persistence keys in this browser" head={['Key', 'Size']} rows={stored.map((key) => [key, `${((localStorage.getItem(key) ?? '').length / 1024).toFixed(1)} kB`])} />
            </Card>

            <div className="flex flex-col gap-5">
              <Card className="flex flex-col gap-3 p-5">
                <h2 className="font-display text-title text-body">Reset tools</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      useStudio.getState().clearAll();
                      toast.success('Studio cleared');
                    }}
                  >
                    Clear drafts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      useGamification.getState().reset();
                      toast.success('Scout progress reset');
                    }}
                  >
                    Reset scout progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      useSafety.getState().clear();
                      toast.success('Moderation log cleared');
                    }}
                  >
                    Clear moderation log
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      useToasts.getState().clear();
                      toast.info('Toasts dismissed');
                    }}
                  >
                    Dismiss toasts
                  </Button>
                </div>
              </Card>

              <Card className="flex flex-col gap-3 p-5">
                <h2 className="font-display text-title text-body">Current state</h2>
                <ul className="flex flex-col gap-1.5 font-body text-sm text-muted">
                  <li>
                    Prefs: {prefs.theme} · {prefs.language} · {prefs.sport} · text {prefs.textSize}
                  </li>
                  <li>
                    Scout: {gamification.badges.length} badges · streak {gamification.streakDays} ·{' '}
                    {gamification.likedStoryIds.length} likes · {gamification.savedStoryIds.length} saves
                  </li>
                  <li>
                    Studio: {drafts.length} drafts · {drafts.filter((d) => d.published).length} published
                  </li>
                  <li>
                    Safety: {safety.records.length} records · {safety.blockedUserIds.length} blocked
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}