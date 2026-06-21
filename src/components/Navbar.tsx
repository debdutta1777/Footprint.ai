/**
 * Main navigation bar with responsive mobile menu.
 *
 * Features:
 * - Responsive hamburger menu for mobile viewports
 * - Active link highlighting via NavLink
 * - ARIA roles: menubar, menuitem, expanded state
 * - Memoized to prevent re-renders when parent state changes
 */

import { useState, useCallback, memo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ROUTES } from '../constants';

/** Navigation link definition */
interface NavItem {
  to: string;
  label: string;
  icon: string;
}

/** Ordered navigation links */
const NAV_LINKS: NavItem[] = [
  { to: ROUTES.HOME, label: 'Home', icon: '🏠' },
  { to: ROUTES.CALCULATOR, label: 'Calculator', icon: '🧮' },
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
  { to: ROUTES.ACTIONS, label: 'Eco Actions', icon: '🌱' },
  { to: ROUTES.ACHIEVEMENTS, label: 'Achievements', icon: '🏆' },
];

/** Main navigation bar with responsive mobile menu. */
const Navbar = memo(function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to={ROUTES.HOME} className="navbar-brand" aria-label="CarbonWise Home">
          🌍 <span>CarbonWise</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul
          id="nav-menu"
          className={`navbar-links ${menuOpen ? 'open' : ''}`}
          role="menubar"
        >
          {NAV_LINKS.map(link => (
            <li key={link.to} role="none">
              <NavLink
                to={link.to}
                end={link.to === ROUTES.HOME}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
                role="menuitem"
                onClick={closeMenu}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});

export default Navbar;
