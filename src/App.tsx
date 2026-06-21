import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EcoAssistant from './components/EcoAssistant';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

/* Code-split page routes for optimal bundle size */
const Landing = lazy(() => import('./pages/Landing'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Actions = lazy(() => import('./pages/Actions'));
const Achievements = lazy(() => import('./pages/Achievements'));

/** Loading fallback with accessible messaging */
function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div className="loading-spinner" aria-hidden="true" />
      <span style={{ color: 'var(--color-text-secondary)' }}>Loading...</span>
    </div>
  );
}

/**
 * Root application component with routing, error boundary,
 * lazy-loaded pages, and the smart EcoAssistant widget.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <EcoAssistant />
    </ErrorBoundary>
  );
}
