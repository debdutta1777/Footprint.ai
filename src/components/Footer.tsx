/**
 * Site footer with copyright and data source attribution.
 * Memoized as it never needs to re-render from parent state changes.
 */

import { memo } from 'react';

/** Site footer with copyright and attribution. */
const Footer = memo(function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <p>
        © {new Date().getFullYear()} CarbonWise — Helping you reduce your carbon footprint, one step at a time.
      </p>
      <p className="text-xs mt-2">
        Emission factors based on DEFRA, EPA &amp; IPCC data. For educational purposes.
      </p>
    </footer>
  );
});

export default Footer;
