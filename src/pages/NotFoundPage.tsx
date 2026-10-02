import { Link, useLocation } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button, Card, TextLink } from '@/components/ui';

const SUGGESTIONS = [
  { to: '/', label: 'Story feed', hint: 'Latest arcs from the fictional dataset' },
  { to: '/live', label: 'Live now', hint: 'Moments turning into stories' },
  { to: '/athletes', label: 'Athletes', hint: '24 cricketers with arcs and stats' },
  { to: '/parity', label: 'Parity dashboard', hint: 'Who gets the airtime, and the CSV' },
  { to: '/circles', label: 'Fan circles', hint: 'Eight moderated rooms' },
  { to: '/studio', label: 'Studio', hint: 'Draft a story, run the fairness check' },
];

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <span className="scallop flex h-20 w-20 items-center justify-center rounded-scallop bg-kesar font-display text-display-sm text-ink">
        404
      </span>
      <div className="flex max-w-xl flex-col gap-3">
        <h1 className="font-display text-display-sm text-balance text-body">
          That page is not in the fixture list
        </h1>
        <p className="font-body text-base leading-relaxed text-pretty text-muted">
          Nothing is routed to <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-body text-sm text-body">{location.pathname}</code>.
          Either the link was wrong, or the demo data changed under you.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/">
          <Button icon={<Home aria-hidden className="h-4 w-4" />}>Back to the feed</Button>
        </Link>
        <Link to="/live">
          <Button variant="outline" icon={<Compass aria-hidden className="h-4 w-4" />}>
            See what is live
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-2xl p-6 text-start">
        <h2 className="font-display text-title text-body">Try one of these</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((item) => (
            <li key={item.to}>
              <TextLink to={item.to}>{item.label}</TextLink>
              <p className="font-body text-xs text-muted">{item.hint}</p>
            </li>
          ))}
        </ul>
      </Card>

      <p className="font-body text-xs text-muted">
        Beyond the Crease · demo build · all athletes, teams and results are fictional.
      </p>
    </div>
  );
}