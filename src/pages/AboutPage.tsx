import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users } from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  StatTile,
  TextLink,
} from '@/components/ui';
import { datasetSummary } from '@/api/resolvers';
import { VISIBILITY } from '@/data/visibility';
import { CROSS_SPORT_IDS } from '@/data/crosssport';

const PRINCIPLES = [
  {
    title: 'Every match has a story. Not every story gets heard.',
    body: 'The tagline is the thesis. Coverage of the women’s game is not absent — it is thin, and thinness reads as unimportance. This prototype makes the thinness measurable, then makes the storytelling easy.',
  },
  {
    title: 'Fictional data, honest shape',
    body: 'Athletes, teams, fixtures, statistics and quotations are invented. But the structure is real: 24 months of visibility rows, six regions, five platforms, five sports, one seeded generator. Swap the endpoint and the pages do not change.',
  },
  {
    title: 'Nothing is published without a human',
    body: 'The Studio generates drafts and flags diminishing language, but publishing is a deliberate click. The fairness check is a phrase matcher, not a censor — it is here to start an argument, not end one.',
  },
  {
    title: 'Accessibility is not a settings page',
    body: 'Text scaling, contrast, reduced motion, dyslexia-friendly type, plain language and six interface languages ship in the first paint. The access page only documents what is already true.',
  },
];

export default function AboutPage() {
  const summary = datasetSummary();

  return (
    <div className="flex flex-col gap-12">
      <section className="jaali-panel hairline bg-surface py-10">
        <div className="container flex flex-col gap-6">
          <Breadcrumbs items={[{ label: 'Home', to: '/today' }, { label: 'About' }]} />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-2xl flex-col gap-4">
              <Badge tone="kesar">ICC Global Hackathon · Track 1</Badge>
              <h1 className="font-display text-display text-balance text-body">
                Every match has a story. Not every story gets heard.
              </h1>
              <p className="font-body text-base leading-relaxed text-pretty text-muted">
                Beyond the Crease is a prototype for sport visibility and engagement: a storytelling engine, a
                visibility-parity tracker, and fan communities that run in more than one language. Cricket first,
                four other sports on the same rails.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/today">
                  <Button icon={<Sparkles aria-hidden className="h-4 w-4" />}>Open the feed</Button>
                </Link>
                <Link to="/parity">
                  <Button variant="outline">See the parity data</Button>
                </Link>
              </div>
            </div>
            <p className="sticker max-w-[16rem] bg-ink text-canvas">
              #BeyondTheCrease
              <span className="mt-1 block font-body text-[0.7rem] text-silver">Demo build · fictional data</span>
            </p>
          </div>
        </div>
      </section>

      <section className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Athletes" value={summary.athletes.cricket} hint={`cricketers, plus ${CROSS_SPORT_IDS.length} companion sports`} tone="accent" />
        <StatTile label="Stories" value={summary.stories} hint="hand-written arcs, generated in six languages" />
        <StatTile label="Matches" value={summary.matches} hint={`${summary.moments} tracked moments`} />
        <StatTile label="Visibility rows" value={VISIBILITY.length.toLocaleString('en-IN')} hint="24 months x 6 regions x 5 platforms" />
      </section>

      <section className="container grid gap-6 lg:grid-cols-2">
        {PRINCIPLES.map((principle) => (
          <Card key={principle.title} className="flex flex-col gap-3 p-6">
            <h2 className="font-display text-title text-balance text-body">{principle.title}</h2>
            <p className="font-body text-sm leading-relaxed text-pretty text-muted">{principle.body}</p>
          </Card>
        ))}
      </section>

      <section className="container grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-3 p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-title text-body">
            <Users aria-hidden className="h-5 w-5 text-accent" />
            Who this is for
          </h2>
          <ul className="flex flex-col gap-3 font-body text-sm text-muted">
            {[
              ['Commissioning editors', 'who need a fair, fast starting point for a 90-second piece that does not shrink the athlete.'],
              ['Broadcast and digital teams', 'who need the moment-to-story pipeline to exist before the highlights go up.'],
              ['Fans', 'who want a room where the women’s game is the subject, and where they can argue in their own language.'],
              ['Researchers and advocates', 'who need a dashboard whose numbers can be audited, exported and argued with.'],
            ].map(([who, why]) => (
              <li key={who} className="flex flex-col gap-1 border-s-2 border-line ps-3">
                <strong className="font-display text-sm text-body">{who}</strong>
                <span>{why}</span>
              </li>
            ))}
          </ul>
          <TextLink to="/partners">See how a partnership would work</TextLink>
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <h2 className="font-display text-title text-balance text-body">A story to start with</h2>
          <p className="font-body text-sm text-muted">
            <code className="rounded bg-surface-sunken px-1 py-0.5 font-body text-xs">s-six-languages</code> — the
            pinned story in the multilingual circle.
          </p>
          <TextLink to="/story/s-six-languages">Read “Six languages, one dressing room”</TextLink>
        </Card>
      </section>

      <section className="container pb-8">
        <Card className="scallop flex flex-col items-start gap-3 bg-ink p-8 text-canvas">
          <Heart aria-hidden className="h-6 w-6 text-kesar" />
          <h2 className="font-display text-display-sm text-balance text-canvas">
            The only people who can fix this are the people who publish
          </h2>
          <p className="max-w-2xl font-body text-sm leading-relaxed text-pretty text-silver">
            Parity is not a chart, it is a commissioning decision repeated a thousand times. If this prototype changed
            one editor’s morning, it did its job.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/studio">
              <Button variant="pistachio">Draft something</Button>
            </Link>
            <Link to="/circles">
              <Button variant="ghost" className="text-silver hover:text-canvas">
                Join a circle
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}