import { Link } from 'react-router-dom';
import { Toggle } from '@/components/ui';
import { useLanguage } from '@/components/layout/useLanguage';
import { usePrefs } from '@/store/prefs';

const ANCHORS = [
  { href: '#how', key: 'landing.nav.how' },
  { href: '#parity', key: 'landing.nav.parity' },
  { href: '#circles', key: 'landing.nav.circles' },
  { href: '#languages', key: 'landing.nav.languages' },
];

const APP_LINKS = [
  { to: '/today', labelKey: 'nav.home' },
  { to: '/live', labelKey: 'nav.live' },
  { to: '/athletes', labelKey: 'nav.athletes' },
  { to: '/parity', labelKey: 'nav.parity' },
  { to: '/studio', labelKey: 'nav.studio' },
  { to: '/circles', labelKey: 'nav.circles' },
  { to: '/access', labelKey: 'nav.access' },
  { to: '/about', labelKey: 'nav.about' },
];

const linkClass =
  'rounded font-body text-sm text-canvas/75 underline-offset-4 hover:text-canvas hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar';

export function LandingFooter() {
  const { t } = useLanguage();
  const skipIntro = usePrefs((s) => s.skipIntro);
  const setSkipIntro = usePrefs((s) => s.setSkipIntro);

  return (
    <footer className="border-t border-silver/25 bg-ink">
      <div className="container flex flex-col gap-10 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="varq flex h-10 w-10 items-center justify-center rounded-full bg-dusk-fruit font-display text-xs font-bold text-ink">
                BTC
              </span>
              <span className="font-display text-lg font-semibold text-canvas">{t('brand.name')}</span>
            </div>
            <p className="max-w-xs font-body text-sm leading-relaxed text-canvas/70">{t('brand.tagline')}</p>
            <p className="font-body text-sm font-semibold text-kesar">{t('brand.hashtag')}</p>
          </div>

          <nav aria-label="On this page" className="flex flex-col gap-3">
            <h2 className="font-body text-xs font-semibold uppercase tracking-wide text-canvas/75">
              {t('landing.nav.how')}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {ANCHORS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkClass}>
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Inside the app" className="flex flex-col gap-3">
            <h2 className="font-body text-xs font-semibold uppercase tracking-wide text-canvas/75">
              In the app
            </h2>
            <ul className="flex flex-col gap-1.5">
              {APP_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-body text-xs font-semibold uppercase tracking-wide text-canvas/75">
              Your visit
            </h2>
            <Toggle
              label={t('landing.skipNext')}
              description="You can turn this back off any time in /access."
              checked={skipIntro}
              onChange={(next) => setSkipIntro(next)}
            />
            <Link to="/access" className={linkClass}>
              {t('access.title')}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-silver/20 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl font-body text-xs leading-relaxed text-canvas/60">
            {t('common.demoData')} Every athlete, team, fixture, statistic and quotation in this prototype is
            fictional. Nothing here represents a real person, club, tournament or broadcast partner.
          </p>
          <span className="font-body text-[0.625rem] uppercase tracking-wide text-canvas/70">
            The Pavilion Gate
          </span>
        </div>
      </div>
    </footer>
  );
}
