/**
 * ScrollToTop — manages accessibility on route changes.
 *
 * On every navigation event this component:
 * 1. Scrolls the viewport to the top
 * 2. Announces the new page name to screen readers via an aria-live region
 * 3. Moves keyboard focus to the main content area (WCAG 2.4.3)
 *
 * Must be rendered inside a Router and alongside a `<main id="main-content">` element.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';

/** Human-readable page names keyed by route path (for screen reader announcements) */
const PAGE_NAMES: Record<string, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.CALCULATOR]: 'Carbon Calculator',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.ACTIONS]: 'Eco Actions',
  [ROUTES.ACHIEVEMENTS]: 'Achievements',
};

/** Renders a visually hidden live region and manages focus/scroll on route change. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const pageName = PAGE_NAMES[pathname] ?? 'Page';
    if (announcerRef.current) {
      announcerRef.current.textContent = `Navigated to ${pageName}`;
    }

    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
