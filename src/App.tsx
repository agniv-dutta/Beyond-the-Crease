import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingBlock, ToastViewport } from '@/components/ui';
import HomePage from '@/pages/HomePage';

/**
 * Only the home route is bundled eagerly — it is the landing route and shares the
 * most with the shell. Everything else is code-split so a visitor who reads one
 * story never downloads the chart library or the Studio.
 */
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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <a href="#main" className="skip-link">
        Skip to the story feed
      </a>
      <ErrorBoundary>
        <Layout>
          <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
            <Suspense
              fallback={
                <div className="container py-12">
                  <LoadingBlock label="Loading this page" rows={5} />
                </div>
              }
            >
              <Routes>
              <Route path="/" element={<HomePage />} />
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
              </Routes>
            </Suspense>
          </main>
        </Layout>
      </ErrorBoundary>
      <ToastViewport />
    </>
  );
}