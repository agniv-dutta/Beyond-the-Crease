import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui';
import { LanguageMenu } from '@/components/layout/LanguageMenu';
import { useLanguage } from '@/components/layout/useLanguage';
import { useLanding } from '@/store/landing';
import { usePrefersReducedMotion } from '@/hooks/useMisc';
import { cn } from '@/utils/cn';

const ANCHORS = [
  { href: '#how', key: 'landing.nav.how' },
  { href: '#parity', key: 'landing.nav.parity' },
  { href: '#circles', key: 'landing.nav.circles' },
  { href: '#languages', key: 'landing.nav.languages' },
];

/**
 * The landing page's own slim header — the app shell (Header/Footer/palette) is
 * deliberately not mounted here so the first paint stays light. Transparent at
 * the top of the page, a frosted aubergine bar once you scroll.
 */
export function LandingHeader() {
  const { t, language, setLanguage } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const enterPavilion = useLanding((s) => s.enterPavilion);
  const preloadToday = useLanding((s) => s.preloadToday);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const anchorClass =
    'rounded-xl px-3 py-2 font-body text-sm font-semibold text-canvas/75 transition-colors hover:text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-300',
        scrolled
          ? 'border-b border-silver/25 bg-ink/75 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="container flex items-center gap-3 py-3">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
          aria-label="Beyond the Crease — back to the top"
          className="flex shrink-0 items-center gap-2.5 rounded-2xl py-1 pe-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar"
        >
          <motion.span
            initial={reduced ? false : { scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="varq flex h-10 w-10 items-center justify-center rounded-full bg-dusk-fruit font-display text-xs font-bold text-ink shadow-btc-sm"
          >
            BTC
          </motion.span>
          <span className="font-display text-base font-semibold tracking-tight text-canvas">
            Beyond the Crease
          </span>
        </button>

        <nav aria-label="Landing sections" className="mx-auto hidden items-center gap-1 md:flex">
          {ANCHORS.map((item) => (
            <a key={item.href} href={item.href} className={anchorClass}>
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageMenu value={language} onChange={setLanguage} label={t('access.language')} />
          <Button
            variant="primary"
            size="sm"
            icon={<LogIn aria-hidden className="h-4 w-4" />}
            onMouseEnter={preloadToday}
            onFocus={preloadToday}
            onClick={enterPavilion}
          >
            {t('landing.nav.enter')}
          </Button>
        </div>
      </div>

      {/* Small screens get the same anchors as a scrollable row rather than a menu. */}
      <nav
        aria-label="Landing sections, compact"
        className="nice-scroll flex gap-1 overflow-x-auto border-t border-silver/15 px-3 py-1.5 md:hidden"
      >
        {ANCHORS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-body text-xs font-semibold text-canvas/75 hover:text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kesar"
          >
            {t(item.key)}
          </a>
        ))}
      </nav>
    </header>
  );
}
