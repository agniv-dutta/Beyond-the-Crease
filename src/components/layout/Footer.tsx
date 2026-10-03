import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useGamification } from '@/store/gamification';
import { usePrefs } from '@/store/prefs';
import { useLanguage } from './useLanguage';
import { SportSwitcher } from './SportSwitcher';

const COLUMNS: { heading: string; links: { to: string; labelKey: string }[] }[] = [
  {
    heading: 'Watch & read',
    links: [
      { to: '/today', labelKey: 'nav.home' },
      { to: '/live', labelKey: 'nav.live' },
      { to: '/athletes', labelKey: 'nav.athletes' },
      { to: '/parity', labelKey: 'nav.parity' },
    ],
  },
  {
    heading: 'Take part',
    links: [
      { to: '/studio', labelKey: 'nav.studio' },
      { to: '/circles', labelKey: 'nav.circles' },
      { to: '/access', labelKey: 'nav.access' },
      { to: '/partners', labelKey: 'nav.partners' },
    ],
  },
  {
    heading: 'The project',
    links: [
      { to: '/about', labelKey: 'nav.about' },
      { to: '/', labelKey: 'nav.landing' },
      { to: '/design', labelKey: 'nav.design' },
      { to: '/dev', labelKey: 'nav.dev' },
    ],
  },
];

export function Footer() {
  const { t } = useLanguage();
  const badges = useGamification((s) => s.badges);
  const setSkipIntro = usePrefs((s) => s.setSkipIntro);
  const prefs = usePrefs();

  return (
    <footer className="mt-18 border-t border-line bg-surface-sunken">
      <div className="container flex flex-col gap-10 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-dusk-fruit font-display text-xs font-bold text-ink">
                BTC
              </span>
              <span className="font-display text-lg font-semibold text-body">{t('brand.name')}</span>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-pretty text-muted">
              {t('brand.tagline')}
            </p>
            <p className="font-body text-sm font-semibold text-accent">{t('brand.hashtag')}</p>
            <div className="flex flex-col gap-2 pt-2">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">
                Sport
              </span>
              <SportSwitcher />
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="flex flex-col gap-3">
              <h2 className="font-body text-xs font-semibold uppercase tracking-wide text-muted">
                {column.heading}
              </h2>
              <ul className="flex flex-col gap-1.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => {
                        // The landing is skippable; asking for it cancels the skip.
                        if (link.to === '/') setSkipIntro(false);
                      }}
                      className="rounded font-body text-sm text-body underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs leading-relaxed text-muted">
            {t('common.demoData')} — every athlete, team, fixture, statistic and quotation in this prototype is
            fictional. Nothing here represents a real person, club, tournament or broadcast partner.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {badges.length === 0 ? (
              <span className="font-body text-xs text-muted">No scout badges yet — start reading.</span>
            ) : (
              badges.map((b) => (
                <span key={b.id} className="sticker bg-kesar-soft text-ink" title={b.description}>
                  <Heart aria-hidden className="h-3.5 w-3.5" />
                  {b.label}
                </span>
              ))
            )}
            <span className="font-body text-[0.625rem] uppercase tracking-wide text-muted">
              {prefs.textSize} text · {prefs.theme}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}