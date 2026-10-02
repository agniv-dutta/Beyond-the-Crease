import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Handshake, LifeBuoy, Megaphone, Newspaper, Radio, Send, Users } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Field,
  Input,
  SectionHeading,
  Segmented,
  Select,
  StatTile,
  TextLink,
  Textarea,
} from '@/components/ui';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toasts';
import { emitWebhook } from '@/webhooks/bus';
import { SPORT_IDS } from '@/data/visibility';
import { isValidEmail } from '@/utils/format';

type Track = 'broadcast' | 'editorial' | 'league' | 'brand';

const TRACKS: { id: Track; label: string; icon: typeof Radio; pitch: string; asks: string[] }[] = [
  {
    id: 'broadcast',
    label: 'Broadcasters',
    icon: Radio,
    pitch: 'Push a moment, get a drafted story before the highlights go up. The event bus is the integration surface.',
    asks: ['A public moments feed', 'Signed webhooks for story.published'],
  },
  {
    id: 'editorial',
    label: 'Editors & desks',
    icon: Newspaper,
    pitch: 'A fair starting point that does not shrink the athlete, with the numbers to argue about afterwards.',
    asks: ['Studio access for desks', 'CSV of the parity dataset'],
  },
  {
    id: 'league',
    label: 'Leagues & federations',
    icon: Building2,
    pitch: 'Grassroots and development stories, sourced from your own fixtures rather than a newsroom desk.',
    asks: ['Fixture feed', 'Co-branded circle spaces'],
  },
  {
    id: 'brand',
    label: 'Brands',
    icon: Megaphone,
    pitch: 'Sponsor inventory measured against airtime, so the women’s game can be compared with the men’s on its own numbers.',
    asks: ['Sponsor share reporting', 'Campaign moments'],
  },
];

export default function PartnersPage() {
  const [track, setTrack] = useState<Track>('broadcast');
  const [form, setForm] = useState({ org: '', name: '', email: '', sport: 'cricket', ask: '', consent: false });
  const [submitted, setSubmitted] = useState(false);

  const sport = usePrefs((s) => s.sport);
  const active = useMemo(() => TRACKS.find((t) => t.id === track) ?? TRACKS[0], [track]);
  const emailOk = isValidEmail(form.email);
  const canSubmit = form.org.trim().length > 1 && form.name.trim().length > 1 && emailOk && form.consent;

  const submit = () => {
    if (!canSubmit) {
      toast.warn('A few fields are missing', 'Organisation, name, a valid email and consent are required.');
      return;
    }
    emitWebhook(
      'milestone.reached',
      {
        label: `${active.label} enquiry`,
        detail: `${form.org} · ${form.name} <${form.email}>`,
        value: TRACKS.findIndex((t) => t.id === track) + 1,
      },
      { source: 'manual', failRate: 0 },
    );
    setSubmitted(true);
    toast.success('Enquiry logged', 'No email was sent — this is a demo, and the webhook log shows it.');
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-6">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Partners' }]} />
          <SectionHeading
            eyebrow="Partners"
            title="Four ways in, one shared interest"
            lede="This is a hackathon prototype, so nothing here is a contract and the form sends nothing anywhere. It does fire a webhook, which you can watch land on the dev page — that is the whole pitch."
            action={<TextLink to="/access">What we will never do with your data</TextLink>}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Integration surface" value="4 events" hint="moment, story, message, milestone" tone="accent" />
            <StatTile label="Sports" value={SPORT_IDS.length} hint="cricket first, four on the same rails" />
            <StatTile label="Languages" value={6} hint="interface and generated bodies" />
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-6">
        <Segmented
          label="Partnership track"
          value={track}
          onChange={setTrack}
          options={TRACKS.map((t) => ({ value: t.id, label: t.label }))}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-col gap-5">
            {TRACKS.map((t) => {
              const Icon = t.icon;
              const isActive = t.id === track;
              return (
                <Card
                  key={t.id}
className={`flex flex-col gap-3 p-6 transition ${isActive ? 'border-accent shadow-btc' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon aria-hidden className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-title text-body">{t.label}</h2>
                    {isActive && <Badge tone="accent">Selected</Badge>}
                  </div>
                  <p className="font-body text-sm leading-relaxed text-pretty text-muted">{t.pitch}</p>
                  <ul className="flex flex-wrap gap-2">
                    {t.asks.map((ask) => (
                      <li key={ask} className="sticker bg-silver-soft text-ink">
                        {ask}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isActive ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setTrack(t.id)}
                    aria-pressed={isActive}
                  >
                    {isActive ? 'You are here' : 'Pick this track'}
                  </Button>
                </Card>
              );
            })}
          </div>

          <Card className="flex flex-col gap-4 p-6">
            {submitted ? (
              <div className="flex flex-col items-start gap-3">
                <Badge tone="pistachio">Logged</Badge>
                <h2 className="font-display text-title text-body">Thanks — that went nowhere on purpose</h2>
                <p className="font-body text-sm text-muted">
                  A <code className="rounded bg-surface-sunken px-1 font-body text-xs">milestone.reached</code> event
                  fired with your details and appears in the webhook log. No mail was sent, no data left this browser.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/dev">
                    <Button variant="outline" size="sm">
                      See the log
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ org: '', name: '', email: '', sport, ask: '', consent: false });
                    }}
                  >
                    Send another
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="flex items-center gap-2 font-display text-title text-body">
                  <Handshake aria-hidden className="h-5 w-5 text-accent" />
                  Talk to us
                </h2>
                <p className="font-body text-sm text-muted">
                  Selected track: <strong className="text-body">{active.label}</strong>
                </p>

                <Field label="Organisation" required>
                  <Input
                    value={form.org}
                    onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
                    placeholder="Federation, broadcaster or brand"
                    autoComplete="organization"
                  />
                </Field>
                <Field label="Your name" required>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="A person, not a role"
                    autoComplete="name"
                  />
                </Field>
                <Field
                  label="Email"
                  required
                  error={form.email.length > 0 && !emailOk ? 'That does not look like an email address' : undefined}
                  hint="Validated in the browser, never transmitted"
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.org"
                    autoComplete="email"
                    invalid={form.email.length > 0 && !emailOk}
                  />
                </Field>
                <Field label="Sport you care about">
                  <Select
                    value={form.sport}
                    onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                    options={SPORT_IDS.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
                <Field label="What would you want first?">
                  <Textarea
                    rows={3}
                    value={form.ask}
                    onChange={(e) => setForm((f) => ({ ...f, ask: e.target.value }))}
                    placeholder="A moments feed, a studio seat, a co-branded circle…"
                  />
                </Field>

                <label className="flex items-start gap-2 font-body text-sm text-body">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                    className="mt-1 h-4 w-4 accent-[var(--btc-pomelo)]"
                  />
                  I understand this is a fictional demo and nothing is stored off this device.
                </label>

                <Button onClick={submit} disabled={!canSubmit} fullWidth icon={<Send aria-hidden className="h-4 w-4" />}>
                  Send enquiry
                </Button>
              </>
            )}
          </Card>
        </div>
      </section>

      <section className="container grid gap-6 pb-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-3 p-6">
          <Users aria-hidden className="h-5 w-5 text-accent" />
          <h2 className="font-display text-title text-body">For fan communities</h2>
          <p className="font-body text-sm text-muted">
            Run a circle in your language with your own moderators. The house rules are enforced by people, and every
            moderation action is logged in the open.
          </p>
          <TextLink to="/circles">Browse the circles</TextLink>
        </Card>
        <Card className="flex flex-col gap-3 p-6">
          <LifeBuoy aria-hidden className="h-5 w-5 text-accent" />
          <h2 className="font-display text-title text-body">For accessibility teams</h2>
          <p className="font-body text-sm text-muted">
            Audit the preferences, the keyboard map and the contrast ratios. If something fails, tell us what it was.
          </p>
          <TextLink to="/access">Open the access centre</TextLink>
        </Card>
        <Card className="flex flex-col gap-3 p-6">
          <Newspaper aria-hidden className="h-5 w-5 text-accent" />
          <h2 className="font-display text-title text-body">For researchers</h2>
          <p className="font-body text-sm text-muted">
            Export the parity dataset as CSV. It is generated from a documented seed, so you can reproduce every row.
          </p>
          <TextLink to="/parity">Export the data</TextLink>
        </Card>
      </section>
    </div>
  );
}