import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  Languages as LanguagesIcon,
  MessagesSquare,
  PenLine,
  Save,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Disclosure,
  EmptyState,
  Input,
  ProgressBar,
  SectionHeading,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  Slider,
  StatTile,
  TabPanel,
  Tabs,
  TextLink,
} from '@/components/ui';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { ShareCardModal } from '@/components/story/ShareCardModal';
import { useStudio } from '@/store/studio';
import { useGamification } from '@/store/gamification';
import { toast } from '@/store/toasts';
import { usePrefs } from '@/store/prefs';
import { teamName } from '@/data/teams';
import { allStories } from '@/data/selectors';
import { emitWebhook } from '@/webhooks/bus';
import { useClipboard } from '@/hooks/useMisc';
import { FAIRNESS_EXPLAINER, applyFairnessFixes, checkFairness } from '@/utils/fairness';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@/i18n/resources';
import type { LanguageCode, StoryFormat, Tone } from '@/types';
import { cn } from '@/utils/cn';
import { relativeTime } from '@/utils/format';

const TONES: { value: Tone; label: string; blurb: string }[] = [
  { value: 'cinematic', label: 'Cinematic', blurb: 'Slow, visual, match-camera detail.' },
  { value: 'analyst', label: 'Analyst', blurb: 'Numbers first, plain English.' },
  { value: 'heartfelt', label: 'Heartfelt', blurb: 'Warm, about the person behind it.' },
  { value: 'kid', label: 'Explain to a kid', blurb: 'Simple words, no jargon.' },
  { value: 'hype', label: 'Hype', blurb: 'Short, punchy, social-ready.' },
];

const FORMATS: { value: StoryFormat; label: string; words: string }[] = [
  { value: 'headline', label: 'Headline', words: '1 line' },
  { value: 'social', label: 'Social card', words: '~40 words' },
  { value: 'recap', label: 'Match recap', words: '~90 words' },
  { value: 'feature', label: 'Feature intro', words: '~200 words' },
  { value: 'podcast', label: 'Podcast cold open', words: '~120 words' },
];

export default function StudioPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState('generate');
  const [subject, setSubject] = useState({ athleteId: params.get('athlete') ?? '', matchId: params.get('match') ?? '' });
  /** Arriving from a circle: the draft inherits that room's subject and language. */
  const [circleId, setCircleId] = useState(params.get('circle') ?? '');
  const [language, setLanguage] = useState<LanguageCode>(usePrefs.getState().language);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fairOpen, setFairOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const studio = useStudio();
  const sport = usePrefs((s) => s.sport);
  const { copy } = useClipboard();
  const award = useGamification((s) => s.award);
  const publishBucket = useGamification((s) => s.toggle);
  const setStudioFormat = studio.setFormat;

  const athletes = useAsync((signal) => api.getAthletes({ sport }, signal), [sport]);
  const matches = useAsync((signal) => api.getMatches({ sport }, signal), [sport]);
  const circle = useAsync((signal) => (circleId ? api.getCircle(circleId, signal) : Promise.resolve(null)), [circleId]);

  // A circle draft adopts the room's first language, and the story it has pinned.
  useEffect(() => {
    const data = circle.data;
    if (!data) return;
    setLanguage((current) => (data.languages.includes(current) ? current : data.languages[0]));
    setStudioFormat('recap');
    if (data.pinnedStoryId) {
      const pinned = allStories(data.sport).find((s) => s.id === data.pinnedStoryId);
      setSubject((s) => ({
        athleteId: s.athleteId || pinned?.athleteIds[0] || '',
        matchId: s.matchId || pinned?.matchId || '',
      }));
    }
    // Only react to a newly selected circle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circle.data?.id]);

  const report = useMemo(() => (body ? checkFairness(body) : null), [body]);
  const dirty = title.trim().length > 0 || body.trim().length > 0;

  const generate = async () => {
    setGenerating(true);
    try {
      const result = await api.generateStory({
        circleId: circleId || undefined,
        athleteId: subject.athleteId || undefined,
        matchId: subject.matchId || undefined,
        tone: studio.tone,
        format: studio.format,
        length: studio.length,
        language,
      });
      setTitle(result.title);
      setBody(result.body);
      toast.info('Draft generated', `${result.readSeconds}s read · fairness score ${result.fairScore}/100`);
      if (report && report.flags.length > 0) setFairOpen(true);
    } catch {
      toast.warn('Could not generate', 'The demo generator refused. Try a different tone or length.');
    } finally {
      setGenerating(false);
    }
  };

  const saveDraft = () => {
    if (!dirty) {
      toast.info('Nothing to save', 'Generate a draft or write something first.');
      return;
    }
    const id = studio.addDraft({
      tone: studio.tone,
      format: studio.format,
      length: studio.length,
      language,
      athleteId: subject.athleteId || undefined,
      matchId: subject.matchId || undefined,
      title: title.trim(),
      body: body.trim(),
      hashtags: extractHashtags(body),
      published: false,
    });
    toast.success('Draft saved', `Draft ${id.slice(-6)} is in your Studio list.`);
  };

  const applyFixes = () => {
    setFixing(true);
    const result = applyFairnessFixes(body);
    setBody(result.text);
    setFixing(false);
    setFairOpen(false);
    toast.success(
      result.applied === 0 ? 'Nothing to change' : `${result.applied} phrase${result.applied === 1 ? '' : 's'} rephrased`,
      'The wording is now about the work, not the body.',
    );
  };

  const publish = async () => {
    if (!title.trim() || !body.trim()) {
      toast.info('Title and body needed', 'A story needs both before it can go out.');
      return;
    }
    setPublishing(true);
    try {
      const draftId = studio.addDraft({
        tone: studio.tone,
        format: studio.format,
        length: studio.length,
        language,
        athleteId: subject.athleteId || undefined,
        matchId: subject.matchId || undefined,
        title: title.trim(),
        body: body.trim(),
        hashtags: extractHashtags(body),
        published: false,
      });
      const res = await api.publishStory({ title: title.trim(), body: body.trim(), draftId });
      studio.markPublished(draftId);
      publishBucket('publishedStoryIds', draftId);
      setTitle('');
      setBody('');
      emitWebhook(
        'story.published',
        { storyId: res.story.id, title: res.story.title, theme: 'Comeback', authorName: 'You' },
        { source: 'action', failRate: 0 },
      );
      toast.success('Story published', 'It is now in the feed and on the live ticker.');
      const badge = award('b-publisher');
      if (badge) toast.info('Badge earned', badge.description);
      if (report?.verdict === 'pass') award('b-fair');
    } catch {
      toast.warn('Not published', 'The demo API refused. Your text is still here.');
    } finally {
      setPublishing(false);
    }
  };


  const toneMeta = TONES.find((t) => t.value === studio.tone);
  const athleteList = athletes.data ?? [];
  const matchList = matches.data ?? [];
const published = studio.drafts.filter((d) => d.published);

  return (
    <div className="flex flex-col gap-10">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-5">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Studio' }]} />
          <SectionHeading
            eyebrow="The Studio"
            title="Draft the story, then argue with the machine about it"
            lede="Generates a fictional draft from a template engine — no external AI service is called. The fairness check runs on every keystroke and is the point of the exercise: it will tell you when your copy has drifted into diminishing someone."
            action={<TextLink to="/dev">See the generator internals</TextLink>}
          />
          <p className="inline-flex items-center gap-2 rounded-2xl bg-kesar-soft px-4 py-2.5 font-body text-xs text-ink">
            <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />
            Nothing you write here is stored on a server. Drafts live in this browser only, and the fairness log is
            visible on the access page.
          </p>
        </div>
      </section>

      <div className="container flex flex-col gap-4">
        {circleId && (
          <Card className="hairline flex flex-wrap items-center gap-3 p-4">
            <MessagesSquare aria-hidden className="h-4 w-4 shrink-0 text-accent" />
            {circle.loading && <span className="font-body text-sm text-muted">Loading that circle…</span>}
            {circle.error && (
              <span className="font-body text-sm text-muted">
                That circle could not be loaded, so the draft falls back to your own subject.
              </span>
            )}
            {circle.data && (
              <>
                <span className="flex min-w-0 flex-col">
                  <span className="font-body text-sm font-semibold text-body">
                    Drafting from {circle.data.name}
                  </span>
                  <span className="font-body text-xs text-muted">
                    Subject, format and language come from that room. Change anything below and it is yours.
                  </span>
                </span>
                <Link to={`/circle/${circle.data.id}`} className="ms-auto">
                  <Button variant="ghost" size="sm">
                    Open the thread
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCircleId('');
                setSubject({ athleteId: '', matchId: '' });
                toast.info('Circle context cleared');
              }}
            >
              Clear
            </Button>
          </Card>
        )}
      </div>

      <div className="container grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="flex items-center gap-2 font-display text-title text-body">
              <Wand2 aria-hidden className="h-5 w-5 text-accent" />
              Controls
            </h2>

            <div className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Tone</span>
              <Segmented
                label="Tone"
                value={studio.tone}
                onChange={studio.setTone}
                options={TONES.map((t) => ({ value: t.value, label: t.label }))}
              />
              <p className="font-body text-xs text-muted">{toneMeta?.blurb}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Format</span>
              <Segmented
                label="Format"
                value={studio.format}
                onChange={studio.setFormat}
                options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
              />
              <p className="font-body text-xs text-muted">
                {FORMATS.find((f) => f.value === studio.format)?.words}
              </p>
            </div>

            <Slider
              label="Target length"
              min={20}
              max={240}
              step={5}
              value={studio.length}
              format={(v) => `${v} words`}
              onChange={studio.setLength}
            />

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Output language</span>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.label} · ${l.native}` }))}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Subject</span>
              <Select
                value={subject.athleteId}
                onChange={(e) => setSubject((s) => ({ ...s, athleteId: e.target.value }))}
                options={[
                  { value: '', label: 'No athlete — generic draft' },
                  ...athleteList.map((a) => ({ value: a.id, label: `${a.name} · ${a.role}` })),
                ]}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Match</span>
              <Select
                value={subject.matchId}
                onChange={(e) => setSubject((s) => ({ ...s, matchId: e.target.value }))}
                options={[
                  { value: '', label: 'No match' },
                  ...matchList.map((m) => ({ value: m.id, label: `${teamName(m.teamAId)} v ${teamName(m.teamBId)}` })),
                ]}
              />
            </label>

            <Button onClick={() => void generate()} loading={generating} fullWidth icon={<Sparkles aria-hidden className="h-4 w-4" />}>
              Generate draft
            </Button>
            <p className="font-body text-[0.7rem] text-muted">
              Same inputs give the same draft — the engine is seeded, so a demo run is reproducible.
            </p>
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-title text-body">Fairness</h2>
            {report ? (
              <>
                <StatTile
                  label="Fairness score"
                  value={`${report.score}/100`}
                  tone={report.verdict === 'pass' ? 'positive' : 'warn'}
                  hint={report.verdict === 'pass' ? 'Reads as a report, not a diminishment' : `${report.flags.length} phrase(s) to review`}
                />
                <ProgressBar
                  label="Fairness"
                  value={report.score}
                  tone={report.verdict === 'pass' ? 'positive' : 'warn'}
                />
                <p className="font-body text-xs text-muted">
                  {report.checkedWords} words checked against {FAIRNESS_EXPLAINER.length} rules. The engine is a
                  phrase matcher, not a judgement of intent.
                </p>
                <Button
                  variant={report.flags.length ? 'primary' : 'outline'}
                  disabled={report.flags.length === 0}
                  loading={fixing}
                  onClick={applyFixes}
                  fullWidth
                  icon={<Eraser aria-hidden className="h-4 w-4" />}
                >
                  Fix all {report.flags.length}
                </Button>
                <Disclosure summary="What the engine looks for">
                  <ul className="flex list-disc flex-col gap-1.5 ps-4 font-body text-xs text-muted">
                    {FAIRNESS_EXPLAINER.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </Disclosure>
              </>
            ) : (
              <EmptyState
                title="Nothing to check yet"
                body="Write or generate a draft and the fairness report appears here, live."
                icon={<Check aria-hidden className="h-7 w-7 text-muted" />}
              />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Tabs
            label="Studio sections"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'generate', label: 'Editor' },
              { id: 'drafts', label: 'Drafts', count: studio.drafts.length },
              { id: 'publish', label: 'Publish', count: published.length },
            ]}
          />

          <TabPanel id="generate" activeId={tab}>
            <Card className="flex flex-col gap-4 p-6">
              {generating ? (
                <>
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-32 w-full" />
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Headline</span>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="The over she took alone, with nobody else in the frame"
                      maxLength={90}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Body</span>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={12}
                      placeholder="Paste or generate. The fairness engine reads every keystroke."
                      className="w-full rounded-2xl border border-line bg-surface-sunken/40 p-4 font-body text-base leading-relaxed text-body outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                      aria-label="Story body"
                    />
                    <span className="font-body text-xs text-muted">
                      {body.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={saveDraft} icon={<Save aria-hidden className="h-4 w-4" />}>
                      Save draft
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        void copy(`${title}\n\n${body}`);
                        toast.info('Copied', 'Headline and body on your clipboard.');
                      }}
                      icon={<Copy aria-hidden className="h-4 w-4" />}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!dirty}
                      onClick={() => setShareOpen(true)}
                      icon={<Download aria-hidden className="h-4 w-4" />}
                    >
                      Share card
                    </Button>
                    {report && report.flags.length > 0 && (
                      <Button variant="ghost" onClick={() => setFairOpen(true)} icon={<AlertTriangle aria-hidden className="h-4 w-4" />}>
                        {report.flags.length} fairness flag{report.flags.length === 1 ? '' : 's'}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card>
          </TabPanel>

          <TabPanel id="drafts" activeId={tab}>
            <Card className="flex flex-col gap-4 p-6">
              {studio.drafts.length === 0 ? (
                <EmptyState
                  title="No drafts saved"
                  body="Generate one, edit it, then save it here. Drafts persist in this browser."
                  icon={<PenLine aria-hidden className="h-8 w-8 text-muted" />}
                  action={<Button onClick={() => setTab('generate')}>Back to the editor</Button>}
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {studio.drafts.map((draft) => (
                    <li key={draft.id} className="flex flex-col gap-2 rounded-2xl border border-line p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-title text-body">{draft.title || 'Untitled draft'}</h3>
                        {draft.published ? <Badge tone="pistachio">Published</Badge> : <Badge tone="silver">Draft</Badge>}
                        <Badge tone="silver">{draft.tone}</Badge>
                        <Badge tone="silver">{LANGUAGE_BY_CODE[draft.language].label}</Badge>
                      </div>
                      <p className="line-clamp-2 font-body text-sm text-muted">{draft.body}</p>
                      <p className="font-body text-xs text-muted">
                        Edited {relativeTime(draft.updatedAtISO)} · {draft.length} word target
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTitle(draft.title);
                            setBody(draft.body);
                            setLanguage(draft.language);
                            studio.setTone(draft.tone);
                            studio.setFormat(draft.format);
                            studio.setLength(draft.length);
                            setSubject({ athleteId: draft.athleteId ?? '', matchId: draft.matchId ?? '' });
                            setTab('generate');
                          }}
                        >
                          Open in editor
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            studio.removeDraft(draft.id);
                            toast.info('Draft deleted');
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabPanel>

          <TabPanel id="publish" activeId={tab}>
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-title text-body">Publish checklist</h2>
                  <p className="font-body text-xs text-muted">
                    Nothing publishes without a human reading it. This is the rule, not a suggestion.
                  </p>
                </div>
                <Button onClick={() => void publish()} loading={publishing} icon={<Send aria-hidden className="h-4 w-4" />}>
                  Publish now
                </Button>
              </div>
              <ul className="flex flex-col gap-2 font-body text-sm">
                <ChecklistItem done={title.trim().length > 0} label="Headline written" />
                <ChecklistItem done={body.trim().length > 40} label="Body is more than a sentence" />
                <ChecklistItem done={!report || report.verdict === 'pass'} label="Fairness check passes or was read" />
                <ChecklistItem done={language !== 'en'} label={`Output language: ${LANGUAGE_BY_CODE[language].label}`} />
              </ul>
              {published.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {published.map((draft) => (
                    <li key={draft.id} className="flex items-center justify-between gap-3 rounded-2xl border border-pistachio/60 bg-pistachio-soft/40 p-3">
                      <span className="font-body text-sm text-ink">{draft.title}</span>
                      <span className="font-body text-xs text-ink/70">{relativeTime(draft.updatedAtISO)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-body text-sm text-muted">You have not published anything yet.</p>
              )}
            </Card>
          </TabPanel>
        </div>
      </div>

      <Sheet open={fairOpen} onClose={() => setFairOpen(false)} title="Fairness flags">
        {report && report.flags.length > 0 ? (
          <>
            <ul className="flex flex-col gap-3">
              {report.flags.map((flag) => (
                <li key={flag.id} className="rounded-2xl border border-line p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={flag.severity === 'warn' ? 'rose' : 'silver'}>{flag.kind}</Badge>
                    <span className="font-body text-xs text-muted">character {flag.index}</span>
                  </div>
                  <p className="mt-2 font-display text-title text-body">&ldquo;{flag.phrase}&rdquo;</p>
                  <p className="mt-1 font-body text-sm text-muted">{flag.suggestion}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={applyFixes} loading={fixing} icon={<Eraser aria-hidden className="h-4 w-4" />}>
                Fix all {report.flags.length}
              </Button>
              <Button variant="ghost" onClick={() => setFairOpen(false)}>
                Keep my wording
              </Button>
            </div>
          </>
        ) : (
          <p className="font-body text-sm text-muted">Nothing flagged. The copy reads as a report of work, not a comment on a body.</p>
        )}
      </Sheet>

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        defaultTemplate="quote"
        story={{
          id: 'draft',
          title: title || 'Draft story headline',
          summary: body ? body.slice(0, 160) : 'Beyond the Crease editorial draft',
          body: body || 'Draft body text written in Beyond the Crease Studio.',
          sport,
          theme: 'Debut',
          kind: 'generated',
          authorName: 'Studio Writer',
          publishedAtISO: new Date().toISOString(),
          likes: 0,
          saves: 0,
          shares: 0,
          listens: 0,
          translations: {},
          motif: 'kesar',
          fairScore: 98,
          tags: ['studio', sport],
          readingMinutes: 1,
          athleteIds: subject.athleteId ? [subject.athleteId] : [],
        }}
      />

      <section className="container flex flex-wrap items-center gap-3 pb-8">
        <TextLink to="/athletes">Pick an athlete to write about</TextLink>
        <span className="font-body text-xs text-muted">
          <LanguagesIcon aria-hidden className="me-1 inline h-3.5 w-3.5" />
          {LANGUAGES.length} output languages · {studio.drafts.length} drafts · {published.length} published
        </span>
      </section>
    </div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={cn('flex items-center gap-2', done ? 'text-body' : 'text-muted')}>
      <span
        aria-hidden
        className={cn('flex h-4 w-4 items-center justify-center rounded-full border', done ? 'border-pistachio bg-pistachio' : 'border-line')}
      >
        {done && <Check className="h-3 w-3 text-ink" />}
      </span>
      <span>
        {done ? '' : 'Not yet: '}
        {label}
      </span>
    </li>
  );
}

function extractHashtags(text: string): string[] {
  const found = text.match(/#[\p{L}\d_]+/gu) ?? [];
  return [...new Set(found)].slice(0, 5);
}