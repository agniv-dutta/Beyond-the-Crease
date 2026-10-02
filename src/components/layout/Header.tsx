import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, Check, Compass, Menu, Moon, Search, Settings2, Sun, X } from 'lucide-react';
import { Badge, IconButton, LinkButton, Tooltip } from '@/components/ui';
import { useNotifications } from '@/store/notifications';
import { useGamification } from '@/store/gamification';
import { usePrefs } from '@/store/prefs';
import type { LanguageCode } from '@/types';
import { cn } from '@/utils/cn';
import { LANGUAGES } from '@/i18n/resources';
import { SportSwitcher } from './SportSwitcher';
import { useLanguage } from './useLanguage';
import { NotificationDrawer } from './NotificationDrawer';

const NAV = [
  { to: '/', label: 'Today', hint: 'The feed' },
  { to: '/live', label: 'Live', hint: 'Match moments' },
  { to: '/athletes', label: 'Athletes', hint: 'Who to follow' },
  { to: '/parity', label: 'Parity', hint: 'Visibility data' },
  { to: '/circles', label: 'Circles', hint: 'Fan communities' },
  { to: '/studio', label: 'Studio', hint: 'Write a story' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefs = usePrefs();
  const unread = useNotifications((s) => s.items.filter((i) => !i.read).length);
  const setDrawerOpen = useNotifications((s) => s.setDrawerOpen);
  const joinCount = useGamification((s) => s.joinedCircleIds.length);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-xl px-3 py-2 font-body text-sm font-semibold transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
      isActive ? 'text-accent' : 'text-muted hover:text-body',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="container flex items-center gap-3 py-2.5">
        <IconButton
          label={menuOpen ? 'Close the menu' : 'Open the menu'}
          className="lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </IconButton>

        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-2xl py-1 pe-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="varq flex h-10 w-10 items-center justify-center rounded-full bg-dusk-fruit font-display text-xs font-bold text-ink shadow-btc-sm">
            BTC
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold tracking-tight text-body">
              Beyond the Crease
            </span>
            <span className="mt-0.5 hidden font-body text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted xl:block">
              Every match has a story
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="ms-4 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <SportSwitcher compact />
          <LanguageMenu
            value={language}
            onChange={setLanguage}
            label={t('access.language')}
          />
          <Tooltip label={prefs.theme === 'kulfi' ? t('common.themeDusk') : t('common.themeKulfi')}>
            <IconButton
              label={prefs.theme === 'kulfi' ? t('common.themeDusk') : t('common.themeKulfi')}
              onClick={() => prefs.toggleTheme()}
            >
              {prefs.theme === 'kulfi' ? (
                <Moon aria-hidden className="h-[1.125rem] w-[1.125rem]" />
              ) : (
                <Sun aria-hidden className="h-[1.125rem] w-[1.125rem]" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip label="Search the archive">
            <IconButton
              label="Search the archive"
              onClick={() => window.dispatchEvent(new CustomEvent('btc:open-search'))}
            >
              <Search aria-hidden className="h-[1.125rem] w-[1.125rem]" />
            </IconButton>
          </Tooltip>
          <Tooltip label="Notifications">
            <IconButton label="Notifications" onClick={() => setDrawerOpen(true)}>
              <Bell aria-hidden className="h-[1.125rem] w-[1.125rem]" />
              {unread > 0 && (
                <span className="absolute end-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-pomelo px-1 font-body text-[0.625rem] font-bold text-ink">
                  {unread}
                </span>
              )}
            </IconButton>
          </Tooltip>
          <LinkButton
            to="/access"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            icon={<Settings2 aria-hidden className="h-4 w-4" />}
          >
            Access
          </LinkButton>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface lg:hidden">
          <nav aria-label="Main (mobile)" className="container flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 font-body text-base font-semibold',
                    isActive ? 'bg-rose-soft text-ink' : 'text-body hover:bg-surface-raised',
                  )
                }
              >
                {item.label}
                <span className="font-body text-xs font-normal text-muted">{item.hint}</span>
              </NavLink>
            ))}
            <NavLink
              to="/access"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3 font-body text-base font-semibold text-body hover:bg-surface-raised"
            >
              Accessibility
              <span className="font-body text-xs font-normal text-muted">Text, motion, contrast</span>
            </NavLink>
          </nav>
        </div>
      )}

      <div className="border-t border-line/60 bg-surface-sunken">
        <div className="container flex items-center gap-2 py-1.5">
          <Compass aria-hidden className="h-3.5 w-3.5 shrink-0 text-accent" />
          <p className="nice-scroll flex-1 overflow-x-auto whitespace-nowrap font-body text-xs text-muted">
            Cricket-first, cross-sport ready · {joinCount} {joinCount === 1 ? 'circle' : 'circles'} joined ·{' '}
            <Link to="/parity" className="font-semibold text-accent underline-offset-4 hover:underline">
              media minutes are the story
            </Link>
          </p>
          <Badge tone="live" live className="shrink-0">
            Live demo
          </Badge>
        </div>
      </div>

      <NotificationDrawer />
    </header>
  );
}

function LanguageMenu({
  value,
  onChange,
  label,
}: {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 font-body text-sm font-semibold text-body
          hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-accent">{current.flag}</span>
        <span className="hidden sm:inline">{current.native}</span>
        <span className="sr-only">{label}</span>
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={label}
          className="hairline absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-btc-lg"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === value}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start font-body text-sm',
                  l.code === value
                    ? 'bg-rose-soft font-semibold text-ink'
                    : 'text-body hover:bg-surface-raised',
                )}
              >
                <span className="w-6 shrink-0 text-[0.625rem] font-bold uppercase tracking-wider text-accent">
                  {l.flag}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-semibold">{l.native}</span>
                  <span className="text-xs text-muted">{l.label}</span>
                </span>
                {l.code === value && <Check aria-hidden className="h-4 w-4 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}