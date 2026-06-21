/**
 * Dashboard page — the central hub for tracking carbon footprint progress.
 *
 * Displays:
 * - Summary stats (footprint, streak, actions, CO₂ saved)
 * - Weekly goal progress (via WeeklyGoalCard)
 * - Donut chart breakdown by category (accessible with hidden data table)
 * - Personalized insights
 * - Historical bar chart
 * - Data export buttons
 */

import { useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAppContext } from '@/context/AppContext';
import { getFootprintRating, getPersonalizedInsights, WORLD_AVERAGE_FOOTPRINT } from '@/utils/carbonCalculator';
import { formatCO2, formatDate } from '@/utils/formatters';
import { exportAsJSON, exportAsCSV } from '@/utils/dataExport';
import WeeklyGoalCard from '@/components/WeeklyGoalCard';
import { CATEGORY_COLORS } from '@/constants';

/* ──────────────────────────────────────────────
 * Sub-Components
 * ────────────────────────────────────────────── */

/** A single stat card on the dashboard header. */
interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

const StatCard = memo(function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
});

/* ──────────────────────────────────────────────
 * Dashboard Page
 * ────────────────────────────────────────────── */

/** Dashboard page with charts, insights, and progress tracking. */
export default function Dashboard() {
  const {
    state, dispatch,
    totalActionsCompleted, totalCO2Saved, currentStreak, weeklyProgress,
  } = useAppContext();

  const latestEntry = state.entries[state.entries.length - 1];

  const pieData = useMemo(() => {
    if (!latestEntry) return [];
    return [
      { name: 'Transport', value: latestEntry.breakdown.transport, color: CATEGORY_COLORS.transport },
      { name: 'Energy',    value: latestEntry.breakdown.energy,    color: CATEGORY_COLORS.energy },
      { name: 'Food',      value: latestEntry.breakdown.food,      color: CATEGORY_COLORS.food },
      { name: 'Shopping',  value: latestEntry.breakdown.shopping,  color: CATEGORY_COLORS.shopping },
    ].filter(d => d.value > 0);
  }, [latestEntry]);

  const historyData = useMemo(() =>
    state.entries.slice(-10).map(entry => ({
      date: formatDate(entry.date),
      total: Math.round(entry.totalKgCO2 / 1000 * 10) / 10,
      worldAvg: WORLD_AVERAGE_FOOTPRINT / 1000,
    })),
    [state.entries]
  );

  const insights = useMemo(() => {
    if (!latestEntry) return [];
    return getPersonalizedInsights(latestEntry.breakdown);
  }, [latestEntry]);

  // Empty state — no calculation yet
  if (!latestEntry) {
    return (
      <div className="page-container animate-in" style={{ textAlign: 'center', paddingTop: 'var(--space-16)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-6)' }} aria-hidden="true">📊</div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>No Data Yet</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Complete the carbon calculator to see your personalized dashboard.
        </p>
        <Link to="/calculator" className="btn btn-primary btn-lg">
          🧮 Calculate Your Footprint
        </Link>
      </div>
    );
  }

  const rating = getFootprintRating(latestEntry.totalKgCO2);

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Your Dashboard</h1>
        <p>Track your carbon footprint and see your environmental impact</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard icon="🌍" value={`${(latestEntry.totalKgCO2 / 1000).toFixed(1)}t`} label="Annual Footprint" color={rating.color} />
        <StatCard icon="🔥" value={currentStreak} label="Day Streak" color="var(--color-accent)" />
        <StatCard icon="✅" value={totalActionsCompleted} label="Actions Done" color="var(--color-secondary)" />
        <StatCard icon="💚" value={formatCO2(totalCO2Saved)} label="CO₂ Saved" color="var(--color-primary)" />
      </div>

      {/* Weekly Goal */}
      <WeeklyGoalCard
        goal={state.weeklyGoalKgCO2}
        progress={weeklyProgress}
        onGoalChange={(g) => dispatch({ type: 'SET_WEEKLY_GOAL', payload: g })}
      />

      <div className="grid grid-2">
        {/* Pie Chart */}
        <div className="card" role="figure" aria-label="Carbon footprint breakdown by category" aria-describedby="pie-chart-desc">
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>
            Carbon Breakdown
          </h2>
          <p id="pie-chart-desc" className="sr-only">
            Donut chart showing your annual carbon footprint divided into {pieData.length} categories:
            {pieData.map(d => ` ${d.name} at ${formatCO2(d.value)}`).join(',')}. Total: {formatCO2(latestEntry.totalKgCO2)}.
          </p>
          <div className="chart-container" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCO2(Number(value))}
                  contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Accessible data table for screen readers */}
          <table className="sr-only" aria-label="Carbon breakdown data">
            <thead><tr><th>Category</th><th>Emissions (kgCO₂e)</th></tr></thead>
            <tbody>
              {pieData.map(d => (
                <tr key={d.name}><td>{d.name}</td><td>{d.value.toFixed(0)}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Visual legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} aria-hidden="true" />
                <span>{d.name}: {formatCO2(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Insights */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>
            💡 Personalized Insights
          </h2>
          <ul role="list" aria-label="Personalized carbon reduction insights" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {insights.map((insight) => (
              <li key={insight} className="insight-card" role="listitem">
                {insight}
              </li>
            ))}
          </ul>
          <Link to="/actions" className="btn btn-outline" style={{ marginTop: 'var(--space-4)', width: '100%' }}>
            🌱 View Eco Actions
          </Link>
        </div>
      </div>

      {/* History Chart */}
      {historyData.length > 1 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>
            📈 Footprint Over Time
          </h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} unit="t" />
                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
                <Bar dataKey="total" name="Your Footprint" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Export & Recalculate */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          Last calculated: {formatDate(latestEntry.date)}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link to="/calculator" className="btn btn-secondary">🔄 Recalculate</Link>
          <button className="btn btn-outline" onClick={() => exportAsJSON(state)} aria-label="Export your carbon data as JSON">
            📥 Export JSON
          </button>
          <button className="btn btn-outline" onClick={() => exportAsCSV(state)} aria-label="Export your carbon data as CSV">
            📊 Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
