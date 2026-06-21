/**
 * ScrollToTop component — manages focus on route changes.
 * 
 * When the user navigates to a new page:
 * 1. Scrolls to the top of the page
 * 2. Announces the page change to screen readers via live region
 * 3. Moves focus to the main content area
 * 
 * This is essential for single-page app accessibility (WCAG 2.1).
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Map routes to human-readable page names for screen reader announcements */
const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/calculator': 'Carbon Calculator',
  '/dashboard': 'Dashboard',
  '/actions': 'Eco Actions',
  '/achievements': 'Achievements',
};

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Announce page change to screen readers
    const pageName = PAGE_NAMES[pathname] || 'Page';
    if (announcerRef.current) {
      announcerRef.current.textContent = `Navigated to ${pageName}`;
    }

    // Move focus to main content for keyboard users
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}
