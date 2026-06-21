/**
 * Landing page with hero, features, quick stats, and CTA.
 * Shown to all users; adapts to display quick stats if the user has existing data.
 */

import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCO2 } from '../utils/formatters';

/** Feature card data structure */
interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { icon: '🧮', title: 'Carbon Calculator',     desc: 'Answer simple questions about your lifestyle to get an accurate estimate of your annual carbon footprint across transport, energy, food, and shopping.' },
  { icon: '📊', title: 'Personal Dashboard',    desc: 'Visualize your carbon breakdown with interactive charts. See where your emissions come from and track changes over time.' },
  { icon: '🌱', title: 'Eco Actions',           desc: 'Discover 18+ actionable steps to reduce your footprint. Track completions, build streaks, and earn achievements.' },
  { icon: '💡', title: 'Personalized Insights', desc: 'Get tailored recommendations based on your specific footprint profile. Focus on the changes that matter most for you.' },
  { icon: '🏆', title: 'Achievements & Badges', desc: 'Stay motivated with gamified milestones. Unlock badges as you make progress in your sustainability journey.' },
  { icon: '🔒', title: 'Private & Secure',      desc: 'All your data stays on your device. No accounts required, no tracking — just you and your environmental impact.' },
];

/** Landing page with hero, features, and CTA. */
export default function Landing() {
  const { state, totalActionsCompleted, totalCO2Saved } = useAppContext();
  const latestEntry = state.entries[state.entries.length - 1];

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">
            Understand Your<br />Carbon Footprint
          </h1>
          <p>
            Track, understand, and reduce your environmental impact through
            simple actions and personalized insights. Every small step counts.
          </p>
          <div className="hero-actions">
            <Link to="/calculator" className="btn btn-primary btn-lg" id="cta-calculator">
              🧮 Calculate Your Footprint
            </Link>
            {latestEntry && (
              <Link to="/dashboard" className="btn btn-secondary btn-lg" id="cta-dashboard">
                📊 View Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats (if user has data) */}
      {latestEntry && (
        <section className="page-container" aria-label="Your carbon summary">
          <div className="grid grid-3">
            <div className="card stat-card">
              <div className="stat-icon" aria-hidden="true">🌍</div>
              <div className="stat-value text-primary">{formatCO2(latestEntry.totalKgCO2)}</div>
              <div className="stat-label">Your Annual Footprint</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" aria-hidden="true">✅</div>
              <div className="stat-value text-secondary-color">{totalActionsCompleted}</div>
              <div className="stat-label">Actions Completed</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" aria-hidden="true">💚</div>
              <div className="stat-value text-primary">{formatCO2(totalCO2Saved)}</div>
              <div className="stat-label">CO₂ Saved</div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features" aria-labelledby="features-title">
        <div className="page-container">
          <div className="page-header">
            <h2 id="features-title" className="page-title-gradient">
              How CarbonWise Helps
            </h2>
            <p>Simple tools to make a real difference</p>
          </div>
          <div className="grid grid-3">
            {FEATURES.map(feature => (
              <div key={feature.title} className="card feature-card">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="page-container" aria-label="Call to action">
        <div className="card cta-banner">
          <h2 className="text-2xl font-700 mb-4">Ready to Make a Difference?</h2>
          <p className="text-secondary max-w-md mx-auto mb-6">
            It takes less than 2 minutes to calculate your carbon footprint and discover personalized ways to reduce it.
          </p>
          <Link to="/calculator" className="btn btn-primary btn-lg">
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
