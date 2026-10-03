import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  Flag,
  Languages,
  MessageSquare,
  Pin,
  Send,
  ShieldAlert,
  SmilePlus,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Disclosure,
  EmptyState,
  ErrorState,
  IconButton,
  Monogram,
  Select,
  Sheet,
  Skeleton,
  Textarea,
  TextLink,
} from '@/components/ui';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { useGamification } from '@/store/gamification';
import { useSafety } from '@/store/safety';
import { toast } from '@/store/toasts';
import { usePrefs } from '@/store/prefs';
import { emitWebhook } from '@/webhooks/bus';
import { useWebhook } from '@/hooks/useWebhook';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@/i18n/resources';
import type { CircleMessage, LanguageCode } from '@/types';
import { clockTime, compactNumber, relativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

const ME = { authorId: 'u-you', authorName: 'You' };
const langLabel = (code: LanguageCode): string => LANGUAGE_BY_CODE[code].label;
const QUICK_REACT = [
  { emoji: '\u{1F44F}', label: 'Applaud' },
  { emoji: '\u{1F525}', label: 'Fire' },
  { emoji: '\u{1F49B}', label: 'Love' },
];
const QUICK_REPLIES = [
  'What a match. Anyone else rewatching the last over?',
  'The commentary ignored her entirely on the second innings.',
  'Sharing this with my daughter’s club tonight.',
  'Can we get a clip with context next time?',
];

export default function CirclePage() {
  const { id = '' } = useParams();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [readLang, setReadLang] = useState<LanguageCode | 'auto'>('auto');
  const [showReport, setShowReport] = useState<CircleMessage | null>(null);
  const [muted, setMuted] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const logRef = useRef<HTMLDivElement>(null);

  const uiLang = usePrefs((s) => s.language);
  const joined = useGamification((s) => s.joinedCircleIds);
  const rsvps = useGamification((s) => s.rsvpEventIds);
  const toggle = useGamification((s) => s.toggle);
  const safety = useSafety();

  const circle = useAsync((signal) => api.getCircle(id, signal), [id]);
  const messages = useAsync((signal) => api.getMessages(id, signal), [id]);

  const blocked = useMemo(() => new Set(safety.blockedUserIds), [safety.blockedUserIds]);
  const mutedSet = useMemo(() => new Set(safety.mutedUserIds), [safety.mutedUserIds]);

  const thread = useMemo(() => {
    const rows = messages.data ?? [];
    return rows.filter((m) => !blocked.has(m.authorId));
  }, [messages.data, blocked]);

  const translations = useMemo(
    () => circle.data?.languages.filter((l) => l !== uiLang) ?? [],
    [circle.data, uiLang],
  );

  useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.length]);

  useWebhook('circle.message', (payload) => {
    if (muted || payload.circleId !== id) return;
    messages.reload();
    toast.live(`${payload.authorName} in ${data?.name ?? 'the circle'}`, payload.body.slice(0, 60));
  });

  if (circle.error) {
    return (
      <div className="container py-10">
        <ErrorState title="That circle does not exist" body={circle.error.message} onRetry={circle.reload} />
        <Link to="/circles">
          <Button variant="outline" className="mt-5" icon={<ArrowLeft aria-hidden className="h-4 w-4" />}>
            All circles
          </Button>
        </Link>
      </div>
    );
  }

  const data = circle.data;
  if (!data) {
    return (
      <div className="container flex flex-col gap-4 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isJoined = joined.includes(data.id);
  const canTranslate = readLang !== 'auto' && data.languages.includes(readLang);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft('');
    try {
      const posted = await api.postMessage(data.id, { body, ...ME });
      messages.reload();
      emitWebhook(
        'circle.message',
        { circleId: data.id, messageId: posted.id, authorName: posted.authorName, body: posted.body },
        { source: 'action', failRate: 0 },
      );
    } catch {
      setDraft(body);
      toast.warn('Message not sent', 'The demo API refused it. Your draft is still in the box.');
    } finally {
      setSending(false);
    }
  };

  const react = (message: CircleMessage, emoji: string) => {
    setReactions((prev) => {
      const forMessage = prev[message.id] ?? {};
      return { ...prev, [message.id]: { ...forMessage, [emoji]: (forMessage[emoji] ?? 0) + 1 } };
    });
    toast.info(`${emoji} added`, 'Reactions are private in this demo — the author is not notified.');
  };

  const displayBody = (m: CircleMessage) => {
    if (m.system) return m.body;
    if (readLang === 'auto') return m.body;
    if (m.translation?.lang === readLang) return m.translation.body;
    return m.body;
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="jaali-panel hairline bg-surface py-6">
        <div className="container flex flex-wrap items-start gap-4">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/today' },
              { label: 'Circles', to: '/circles' },
              { label: data.name },
            ]}
          />
          <div className="flex w-full flex-wrap items-start gap-4">
            <Monogram
              initials={data.name.replace(/[^A-Za-z ]/g, '').slice(0, 2).toUpperCase()}
              size="lg"
              tone={data.accent === 'mulberry' ? 'mulberry' : data.accent}
              label={data.name}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {data.verified && <Badge tone="pistachio">Verified</Badge>}
                <Badge tone="silver">{data.sport}</Badge>
                <Badge tone="kesar">{data.category}</Badge>
              </div>
              <h1 className="font-display text-display-sm text-balance text-body">{data.name}</h1>
              <p className="max-w-3xl font-body text-sm leading-relaxed text-pretty text-muted">{data.description}</p>
              <p className="flex flex-wrap items-center gap-2 font-body text-xs text-muted">
                <Languages aria-hidden className="h-3.5 w-3.5" />
                {data.languages.map((l) => langLabel(l)).join(' · ')} · {compactNumber(data.memberCount)} members ·
                moderated by {data.moderators.join(', ')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant={isJoined ? 'secondary' : 'primary'}
                onClick={() => {
                  const now = toggle('joinedCircleIds', data.id);
                  void (now ? api.joinCircle(data.id) : api.leaveCircle(data.id));
                  toast.info(now ? 'Joined the circle' : 'Left the circle');
                }}
              >
                {isJoined ? 'Joined' : 'Join circle'}
              </Button>
              <div className="flex items-center gap-1.5">
                <IconButton
                  label={muted ? 'Unmute live messages' : 'Mute live messages'}
                  aria-pressed={muted}
                  onClick={() => {
                    setMuted((v) => !v);
                    toast.info(muted ? 'Live messages on' : 'Live messages muted');
                  }}
                  active={muted}
                >
                  {muted ? <VolumeX aria-hidden className="h-4 w-4" /> : <Volume2 aria-hidden className="h-4 w-4" />}
                </IconButton>
                <IconButton label="Read the house rules" onClick={() => setGuidelinesOpen(true)}>
                  <ShieldAlert aria-hidden className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-title text-body">
              <MessageSquare aria-hidden className="h-5 w-5 text-accent" />
              The room
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Read in</span>
                <Select
                  value={readLang}
                  onChange={(e) => setReadLang(e.target.value as LanguageCode | 'auto')}
                  options={[
                    { value: 'auto', label: 'Original' },
                    ...translations.map((l) => ({ value: l, label: langLabel(l) })),
                  ]}
                />
              </label>
              {readLang !== 'auto' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggle('translatedStoryIds', `circle-${data.id}`);
                    toast.info('Reading mode saved', 'We remembered that you read this room in another language.');
                  }}
                >
                  Remember
                </Button>
              )}
            </div>
          </div>

          {canTranslate && (
            <p className="rounded-2xl bg-pistachio-soft px-4 py-2.5 font-body text-xs text-ink">
              Machine-translated demo text. Named people keep their names; match terms are glossed in the glossary on
              the access page.
            </p>
          )}

          <div
            ref={logRef}
            className="flex max-h-[28rem] min-h-[16rem] flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-surface-sunken/40 p-4"
            role="log"
            aria-live="polite"
            aria-label={`Messages in ${data.name}`}
          >
            {messages.error ? (
              <ErrorState title="Could not load the thread" body={messages.error.message} onRetry={messages.reload} />
            ) : messages.initial && messages.loading ? (
              <>
                <Skeleton className="h-14 w-3/4" />
                <Skeleton className="ml-auto h-14 w-2/3" />
                <Skeleton className="h-14 w-3/5" />
              </>
            ) : thread.length === 0 ? (
              <EmptyState
                title="No messages yet"
                body="Be the first to say something kind about this week’s fixtures."
                icon={<MessageSquare aria-hidden className="h-7 w-7 text-muted" />}
              />
            ) : (
              thread.map((m) => {
                const mine = m.authorId === ME.authorId;
                const hidden = mutedSet.has(m.authorId);
                return (
                  <article
                    key={m.id}
                    className={cn(
                      'flex flex-col gap-1.5 rounded-2xl border p-3.5',
                      mine ? 'ms-auto border-line bg-pomelo-soft/50' : 'me-auto border-line/70 bg-surface',
                      m.system && 'border-dashed bg-transparent',
                      m.flagged && 'border-pomelo',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {!m.system && (
                        <span className="font-body text-xs font-semibold text-body">
                          {m.authorName}
                          {m.authorId.startsWith('u-mod') && (
                            <Badge tone="pistachio" className="ms-1.5">
                              mod
                            </Badge>
                          )}
                        </span>
                      )}
                      <time className="font-body text-[0.7rem] text-muted" dateTime={m.atISO}>
                        {relativeTime(m.atISO)} · {clockTime(m.atISO)}
                      </time>
                      {m.flagged && (
                        <span className="inline-flex items-center gap-1 font-body text-[0.7rem] text-pomelo">
                          <Flag aria-hidden className="h-3 w-3" />
                          held for review
                        </span>
                      )}
                    </div>
                    <p className={cn('font-body text-sm leading-relaxed', m.system ? 'text-muted italic' : 'text-body')}>
                      {displayBody(m)}
                    </p>
                    {readLang !== 'auto' && m.translation && m.translation.lang !== readLang && (
                      <p className="border-s-2 border-line ps-3 font-body text-xs text-muted">
                        No {langLabel(readLang)} version yet — showing the original.
                      </p>
                    )}
                    {!m.system && !hidden && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {QUICK_REACT.map(({ emoji, label }) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => react(m, emoji)}
                            className="sticker bg-silver-soft text-ink hover:bg-kesar"
                            aria-label={`React ${label} to ${m.authorName}`}
                          >
                            {emoji}
                            {(m.reactions[emoji] ?? 0) + (reactions[m.id]?.[emoji] ?? 0) > 0 && (
                              <span className="ms-1 font-body text-[0.65rem] text-muted">
                                {(m.reactions[emoji] ?? 0) + (reactions[m.id]?.[emoji] ?? 0)}
                              </span>
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setShowReport(m)}
                          className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-body text-[0.7rem] text-muted hover:border-pomelo hover:text-pomelo"
                          aria-label={`Report ${m.authorName}'s message`}
                        >
                          <Flag aria-hidden className="h-3 w-3" />
                          Report
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            safety.mute(m.authorId, m.authorName);
                            toast.info(`${m.authorName} muted`, 'Their messages stay visible to moderators only.');
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-body text-[0.7rem] text-muted hover:border-line hover:text-body"
                          aria-label={`Mute ${m.authorName}`}
                        >
                          <VolumeX aria-hidden className="h-3 w-3" />
                          Mute
                        </button>
                      </div>
                    )}
                    {hidden && (
                      <p className="font-body text-[0.7rem] text-muted">
                        You muted {m.authorName}.{' '}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => {
                            safety.unmute(m.authorId);
                            toast.info(`${m.authorName} unmuted`);
                          }}
                        >
                          Undo
                        </button>
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">
                Message {data.name}
              </span>
              <Textarea
                id="circle-message-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Keep it about the sport…"
                rows={3}
                maxLength={280}
                aria-describedby="circle-message-hint"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <span id="circle-message-hint" className="font-body text-xs text-muted">
                {draft.trim().length}/280 characters · posts as You
              </span>
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <SmilePlus aria-hidden className="h-4 w-4 text-muted" />
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => setDraft(reply)}
                    className="max-w-[16rem] truncate rounded-full border border-line px-2.5 py-1 font-body text-xs text-muted hover:border-kesar hover:text-body"
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <Button onClick={() => void send()} loading={sending} icon={<Send aria-hidden className="h-4 w-4" />}>
                Post message
              </Button>
            </div>
            <p className="font-body text-[0.7rem] text-muted">
              <kbd className="rounded border border-line px-1 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-line px-1 py-0.5">Enter</kbd>{' '}
              to post. Ctrl+Enter is the only keyboard shortcut here — no hidden slash commands.
            </p>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-title text-body">Hosts</h2>
            <ul className="flex flex-col gap-2.5">
              {data.members.slice(0, 6).map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <Monogram initials={member.initials} size="sm" tone="rose" label={member.name} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-body text-sm font-medium text-body">{member.name}</span>
                    <span className="font-body text-[0.7rem] text-muted">
                      {member.role}
                      {member.badge ? ` · ${member.badge}` : ''} · {member.country}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {data.members.length > 6 && (
              <p className="font-body text-xs text-muted">+{data.members.length - 6} more members</p>
            )}
          </Card>

          {data.pinnedStoryId && (
            <Card className="flex flex-col gap-2 p-5">
              <h2 className="flex items-center gap-2 font-display text-title text-body">
                <Pin aria-hidden className="h-4 w-4 text-accent" />
                Pinned story
              </h2>
              <TextLink to={`/story/${data.pinnedStoryId}`}>Read the pinned story</TextLink>
              <p className="font-body text-xs text-muted">
                Moderators pin one story at a time so newcomers land on context, not a take.
              </p>
            </Card>
          )}

          {data.events.length > 0 && (
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="flex items-center gap-2 font-display text-title text-body">
                <CalendarClock aria-hidden className="h-4 w-4 text-accent" />
                Events
              </h2>
              <ul className="flex flex-col gap-3">
                {data.events.map((event) => {
                  const going = rsvps.includes(event.id);
                  return (
                    <li key={event.id} className="flex flex-col gap-2 rounded-2xl border border-line p-3.5">
                      <p className="font-body text-sm font-semibold text-body">{event.title}</p>
                      <p className="font-body text-xs text-muted">
                        {relativeTime(event.startsAtISO)} · {event.durationMinutes} min · hosted by {event.hostId} ·{' '}
                        {event.rsvps + (going ? 1 : 0)} going
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={going ? 'secondary' : 'primary'}
                          onClick={() => {
                            const now = toggle('rsvpEventIds', event.id);
                            toast.info(now ? 'You are going' : 'RSVP removed', event.title);
                          }}
                        >
                          {going ? 'Going' : 'RSVP'}
                        </Button>
                        {event.matchId && (
                          <Link to={`/match/${event.matchId}`}>
                            <Button size="sm" variant="ghost">
                              Match page
                            </Button>
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-title text-body">Your safety settings</h2>
            <p className="font-body text-xs leading-relaxed text-muted">
              {safety.blockedUserIds.length} blocked · {safety.mutedUserIds.length} muted ·{' '}
              {safety.records.length} moderation actions logged
            </p>
            {safety.records.length > 0 && (
              <Disclosure summary="Recent moderation log">
                <ul className="flex flex-col gap-2">
                  {safety.records.slice(0, 5).map((record) => (
                    <li key={record.id} className="font-body text-xs text-muted">
                      <strong className="text-body">{record.kind}</strong> · {record.targetLabel} · {record.note}
                    </li>
                  ))}
                </ul>
              </Disclosure>
            )}
            <TextLink to="/access">Everything about the safety layer</TextLink>
          </Card>

          <Card className="flex flex-col gap-2 p-5">
            <h2 className="flex items-center gap-2 font-display text-title text-body">
              <Sparkles aria-hidden className="h-4 w-4 text-accent" />
              Turn the room into a story
            </h2>
            <p className="font-body text-xs text-muted">
              The Studio can draft a 90-second piece from this thread&rsquo;s themes. Nothing is published without you
              reading it first.
            </p>
            <Link to={`/studio?circle=${data.id}`}>
              <Button variant="outline" size="sm" fullWidth>
                Draft from this room
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      <Sheet open={guidelinesOpen} onClose={() => setGuidelinesOpen(false)} title={`${data.name} house rules`}>
        <ul className="flex flex-col gap-2.5">
          {data.guidelines.map((rule) => (
            <li key={rule} className="flex items-start gap-2 font-body text-sm text-body">
              <ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {rule}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              safety.recordNudge();
              setGuidelinesOpen(false);
              toast.success('Understood', 'Thanks for reading them.');
            }}
          >
            Got it
          </Button>
          <TextLink to="/access">Full safety notes</TextLink>
        </div>
      </Sheet>

      <Sheet
        open={showReport !== null}
        onClose={() => setShowReport(null)}
        title={showReport ? `Report ${showReport.authorName}` : 'Report message'}
      >
        <p className="font-body text-sm text-muted">
          &ldquo;{showReport?.body}&rdquo;
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (!showReport) return;
              safety.log({
                kind: 'report',
                targetId: showReport.id,
                targetLabel: `${showReport.authorName}'s message`,
                note: 'Sent to the fictional moderation queue. The message stays up until a moderator decides.',
                resolved: false,
              });
              toast.success('Report sent', 'A named moderator will look at it.');
              setShowReport(null);
            }}
          >
            Send to moderators
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!showReport) return;
              safety.block(showReport.authorId, showReport.authorName);
              toast.info(`${showReport.authorName} blocked`, 'Their messages disappear from your view only.');
              setShowReport(null);
            }}
          >
            Block them instead
          </Button>
        </div>
      </Sheet>

      <section className="container flex flex-wrap items-center gap-3 pb-8">
        <TextLink to="/circles">Back to all circles</TextLink>
        <span className="font-body text-xs text-muted">
          {LANGUAGES.length} interface languages · {data.languages.length} room languages
        </span>
      </section>
    </div>
  );
}