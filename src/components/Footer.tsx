/** Site footer with copyright and links. */
export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <p>
        © {new Date().getFullYear()} CarbonWise — Helping you reduce your carbon footprint, one step at a time.
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
        Emission factors based on DEFRA, EPA & IPCC data. For educational purposes.
      </p>
    </footer>
  );
}
