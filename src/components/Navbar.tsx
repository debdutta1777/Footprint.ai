import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

/** Main navigation bar with responsive mobile menu. */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/calculator', label: 'Calculator', icon: '🧮' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/actions', label: 'Eco Actions', icon: '🌱' },
    { to: '/achievements', label: 'Achievements', icon: '🏆' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="CarbonWise Home">
          🌍 <span>CarbonWise</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
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
          {links.map(link => (
            <li key={link.to} role="none">
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
                role="menuitem"
                onClick={() => setMenuOpen(false)}
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
}
