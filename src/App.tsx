import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastViewport } from '@/components/ui';
import { usePrefs } from '@/store/prefs';
import { GateTransition } from '@/features/landing/GateTransition';

/**
 * Everything is code-split. The landing page is the only route a first-time
 * visitor needs, and /today is warmed by the landing CTA before it is asked for,
 * so neither route pays for the other's bundle.
 */
const Landing = lazy(() => import('@/pages/Landing'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const LivePage = lazy(() => import('@/pages/LivePage'));
const MatchPage = lazy(() => import('@/pages/MatchPage'));
const StoryPage = lazy(() => import('@/pages/StoryPage'));
const AthletesPage = lazy(() => import('@/pages/AthletesPage'));
const AthletePage = lazy(() => import('@/pages/AthletePage'));
const StudioPage = lazy(() => import('@/pages/StudioPage'));
const ParityPage = lazy(() => import('@/pages/ParityPage'));
const CirclesPage = lazy(() => import('@/pages/CirclesPage'));
const CirclePage = lazy(() => import('@/pages/CirclePage'));
const AccessPage = lazy(() => import('@/pages/AccessPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PartnersPage = lazy(() => import('@/pages/PartnersPage'));
const DevPage = lazy(() => import('@/pages/DevPage'));
const DesignPage = lazy(() => import('@/pages/DesignPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Fallback shown while the landing chunk is in flight — aubergine, so it never flashes cream. */
function LandingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <p className="font-body text-sm text-canvas/70" role="status">
        {t('landing.opening')}
      </p>
    </div>
  );
}

/**
 * `/` is the landing page. A visitor who asked to skip the intro goes straight
 * to the feed; the landing page remains reachable from the footer and /access.
 */
function LandingRoute() {
  const skipIntro = usePrefs((s) => s.skipIntro);
  if (skipIntro) return <Navigate to="/today" replace />;
  return (
    <Suspense fallback={<LandingFallback />}>
      <Landing />
    </Suspense>
  );
}

export default function App() {
  const { t } = useTranslation();
  return (
    <>
      <ScrollToTop />
      <a href="#main" className="skip-link">
        {t('nav.skip')}
      </a>
      <ErrorBoundary>
        <GateTransition />
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route element={<Layout />}>
            <Route path="/today" element={<HomePage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/story/:id" element={<StoryPage />} />
            <Route path="/athletes" element={<AthletesPage />} />
            <Route path="/athlete/:id" element={<AthletePage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/parity" element={<ParityPage />} />
            <Route path="/circles" element={<CirclesPage />} />
            <Route path="/circle/:id" element={<CirclePage />} />
            <Route path="/access" element={<AccessPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/dev" element={<DevPage />} />
            <Route path="/design" element={<DesignPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
      <ToastViewport />
    </>
  );
}
