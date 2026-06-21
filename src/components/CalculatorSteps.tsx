/**
 * Calculator step sub-components.
 *
 * Each step is a standalone, memoized component with clear prop interfaces
 * and JSDoc documentation. This decomposition follows the Single Responsibility
 * Principle and improves testability and maintainability.
 */

import { memo } from 'react';
import type { TransportData, EnergyData, FoodData, ShoppingData, CarbonBreakdown } from '../types/carbon';
import { formatCO2 } from '../utils/formatters';

/* ──────────────────────────────────────────────
 * Prop Interfaces
 * ────────────────────────────────────────────── */

export interface TransportStepProps {
  data: TransportData;
  onChange: (update: Partial<TransportData>) => void;
}

export interface EnergyStepProps {
  data: EnergyData;
  onChange: (update: Partial<EnergyData>) => void;
}

export interface FoodStepProps {
  data: FoodData;
  onChange: (update: Partial<FoodData>) => void;
}

export interface ShoppingStepProps {
  data: ShoppingData;
  onChange: (update: Partial<ShoppingData>) => void;
}

export interface ResultsStepProps {
  breakdown: CarbonBreakdown;
  total: number;
  rating: { label: string; color: string; description: string };
}

/* ──────────────────────────────────────────────
 * Transport Step
 * ────────────────────────────────────────────── */

/** Step 1: Transport inputs — car, public transport, and flights. */
export const TransportStep = memo(function TransportStep({ data, onChange }: TransportStepProps) {
  return (
    <fieldset style={{ border: 'none' }}>
      <legend className="step-title">🚗 Transport</legend>
      <p className="step-subtitle">How do you get around?</p>

      <div className="form-group">
        <label htmlFor="car-fuel" className="form-label">Car fuel type</label>
        <select
          id="car-fuel"
          className="form-select"
          value={data.carFuelType}
          onChange={e => onChange({ carFuelType: e.target.value as TransportData['carFuelType'] })}
        >
          <option value="none">I don't drive</option>
          <option value="petrol">Petrol / Gasoline</option>
          <option value="diesel">Diesel</option>
          <option value="hybrid">Hybrid</option>
          <option value="electric">Electric</option>
        </select>
      </div>

      {data.carFuelType !== 'none' && (
        <div className="form-group">
          <label htmlFor="car-km" className="form-label">Weekly driving distance (km)</label>
          <input
            id="car-km"
            type="number"
            className="form-input"
            min="0"
            max="5000"
            value={data.carKm}
            onChange={e => onChange({ carKm: Number(e.target.value) })}
            aria-describedby="car-km-hint"
          />
          <span id="car-km-hint" className="form-hint">Average commute is ~150 km/week</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="public-transport" className="form-label">Public transport trips per week</label>
        <input
          id="public-transport"
          type="number"
          className="form-input"
          min="0"
          max="100"
          value={data.publicTransportTrips}
          onChange={e => onChange({ publicTransportTrips: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="short-flights" className="form-label">Short-haul flights per year (&lt;3 hours)</label>
        <input
          id="short-flights"
          type="number"
          className="form-input"
          min="0"
          max="100"
          value={data.shortFlightsPerYear}
          onChange={e => onChange({ shortFlightsPerYear: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="long-flights" className="form-label">Long-haul flights per year (&gt;3 hours)</label>
        <input
          id="long-flights"
          type="number"
          className="form-input"
          min="0"
          max="50"
          value={data.longFlightsPerYear}
          onChange={e => onChange({ longFlightsPerYear: Number(e.target.value) })}
        />
      </div>
    </fieldset>
  );
});

/* ──────────────────────────────────────────────
 * Energy Step
 * ────────────────────────────────────────────── */

/** Step 2: Home energy inputs. */
export const EnergyStep = memo(function EnergyStep({ data, onChange }: EnergyStepProps) {
  return (
    <fieldset style={{ border: 'none' }}>
      <legend className="step-title">⚡ Home Energy</legend>
      <p className="step-subtitle">Tell us about your home energy usage</p>

      <div className="form-group">
        <label htmlFor="electricity" className="form-label">Monthly electricity (kWh)</label>
        <input
          id="electricity"
          type="number"
          className="form-input"
          min="0"
          max="10000"
          value={data.electricityKwh}
          onChange={e => onChange({ electricityKwh: Number(e.target.value) })}
          aria-describedby="elec-hint"
        />
        <span id="elec-hint" className="form-hint">Average household uses ~300 kWh/month</span>
      </div>

      <div className="form-group">
        <label htmlFor="gas" className="form-label">Monthly natural gas (kWh)</label>
        <input
          id="gas"
          type="number"
          className="form-input"
          min="0"
          max="10000"
          value={data.gasKwh}
          onChange={e => onChange({ gasKwh: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="household" className="form-label">People in household</label>
        <input
          id="household"
          type="number"
          className="form-input"
          min="1"
          max="20"
          value={data.householdSize}
          onChange={e => onChange({ householdSize: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={data.renewableEnergy}
            onChange={e => onChange({ renewableEnergy: e.target.checked })}
          />
          <span>I use renewable energy (solar, wind, etc.)</span>
        </label>
      </div>
    </fieldset>
  );
});

/* ──────────────────────────────────────────────
 * Food Step
 * ────────────────────────────────────────────── */

/** Step 3: Food & diet inputs. */
export const FoodStep = memo(function FoodStep({ data, onChange }: FoodStepProps) {
  return (
    <fieldset style={{ border: 'none' }}>
      <legend className="step-title">🥗 Food & Diet</legend>
      <p className="step-subtitle">What does your diet look like?</p>

      <div className="form-group">
        <label htmlFor="diet-type" className="form-label">Diet type</label>
        <select
          id="diet-type"
          className="form-select"
          value={data.dietType}
          onChange={e => onChange({ dietType: e.target.value as FoodData['dietType'] })}
        >
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="low-meat">Low Meat (1-2 times/week)</option>
          <option value="medium-meat">Medium Meat (3-5 times/week)</option>
          <option value="high-meat">High Meat (daily)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="food-waste" className="form-label">Food waste level</label>
        <select
          id="food-waste"
          className="form-select"
          value={data.foodWaste}
          onChange={e => onChange({ foodWaste: e.target.value as FoodData['foodWaste'] })}
        >
          <option value="none">Almost none — I use everything</option>
          <option value="low">Low — occasional waste</option>
          <option value="medium">Medium — some waste weekly</option>
          <option value="high">High — significant waste</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={data.localFood}
            onChange={e => onChange({ localFood: e.target.checked })}
          />
          <span>I prioritize locally-sourced food</span>
        </label>
      </div>
    </fieldset>
  );
});

/* ──────────────────────────────────────────────
 * Shopping Step
 * ────────────────────────────────────────────── */

/** Step 4: Shopping & consumption inputs. */
export const ShoppingStep = memo(function ShoppingStep({ data, onChange }: ShoppingStepProps) {
  return (
    <fieldset style={{ border: 'none' }}>
      <legend className="step-title">🛍️ Shopping & Consumption</legend>
      <p className="step-subtitle">Tell us about your purchasing habits</p>

      <div className="form-group">
        <label htmlFor="clothing" className="form-label">Clothing items purchased per month</label>
        <input
          id="clothing"
          type="number"
          className="form-input"
          min="0"
          max="100"
          value={data.clothingItems}
          onChange={e => onChange({ clothingItems: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="electronics" className="form-label">Electronics purchased per month</label>
        <input
          id="electronics"
          type="number"
          className="form-input"
          min="0"
          max="50"
          value={data.electronicsPurchases}
          onChange={e => onChange({ electronicsPurchases: Number(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="recycling" className="form-label">Recycling habits</label>
        <select
          id="recycling"
          className="form-select"
          value={data.recyclingLevel}
          onChange={e => onChange({ recyclingLevel: e.target.value as ShoppingData['recyclingLevel'] })}
        >
          <option value="none">I don't recycle</option>
          <option value="some">I recycle some items</option>
          <option value="most">I recycle most items</option>
          <option value="all">I recycle everything possible</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={data.secondHand}
            onChange={e => onChange({ secondHand: e.target.checked })}
          />
          <span>I regularly buy second-hand items</span>
        </label>
      </div>
    </fieldset>
  );
});

/* ──────────────────────────────────────────────
 * Results Step
 * ────────────────────────────────────────────── */

/** Category entry for the results breakdown */
interface BreakdownItem {
  label: string;
  value: number;
  color: string;
  icon: string;
}

/** Step 5: Results display with breakdown, rating, and world comparison. */
export const ResultsStep = memo(function ResultsStep({ breakdown, total, rating }: ResultsStepProps) {
  const categories: BreakdownItem[] = [
    { label: 'Transport', value: breakdown.transport, color: 'var(--color-transport)', icon: '🚗' },
    { label: 'Energy',    value: breakdown.energy,    color: 'var(--color-energy)',    icon: '⚡' },
    { label: 'Food',      value: breakdown.food,      color: 'var(--color-food)',      icon: '🥗' },
    { label: 'Shopping',  value: breakdown.shopping,  color: 'var(--color-shopping)',  icon: '🛍️' },
  ];

  return (
    <div role="region" aria-label="Carbon footprint results">
      <div className="step-title">📊 Your Results</div>
      <p className="step-subtitle">Here's your estimated annual carbon footprint</p>

      {/* Total Ring */}
      <div className="card result-card">
        <div className="result-ring">
          <svg
            width="200" height="200" viewBox="0 0 200 200"
            role="img"
            aria-label={`Your footprint is ${formatCO2(total)}`}
          >
            <circle cx="100" cy="100" r="85" fill="none" stroke="var(--color-surface)" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="85" fill="none"
              stroke={rating.color} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${Math.min((total / 12000) * 534, 534)} 534`}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="result-ring-value" style={{ position: 'absolute' }}>
            <span className="value" style={{ color: rating.color }}>
              {(total / 1000).toFixed(1)}
            </span>
            <span className="unit">tonnes CO₂e/year</span>
          </div>
        </div>

        <div
          className="badge"
          style={{
            background: `${rating.color}20`,
            color: rating.color,
            fontSize: 'var(--font-size-base)',
            padding: 'var(--space-2) var(--space-4)',
            margin: '0 auto var(--space-4)',
          }}
        >
          {rating.label}
        </div>
        <p className="text-secondary mb-4 max-w-sm mx-auto">{rating.description}</p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-2 mb-6">
        {categories.map(cat => (
          <div key={cat.label} className="card flex-start gap-4">
            <span style={{ fontSize: '2rem' }} aria-hidden="true">{cat.icon}</span>
            <div className="flex-1">
              <div className="font-600 mb-1">{cat.label}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${total > 0 ? (cat.value / total) * 100 : 0}%`,
                    background: cat.color,
                  }}
                />
              </div>
            </div>
            <div className="font-700 whitespace-nowrap" style={{ color: cat.color }}>
              {formatCO2(cat.value)}
            </div>
          </div>
        ))}
      </div>

      {/* World Comparison */}
      <ComparisonBar total={total} ratingColor={rating.color} />
    </div>
  );
});

/* ──────────────────────────────────────────────
 * Comparison Bar
 * ────────────────────────────────────────────── */

interface ComparisonBarProps {
  total: number;
  ratingColor: string;
}

/** Comparison chart: user vs world average vs Paris target. */
const ComparisonBar = memo(function ComparisonBar({ total, ratingColor }: ComparisonBarProps) {
  const MAX_SCALE = 12000;
  return (
    <div className="card mb-6">
      <h3 className="font-600 mb-4">How You Compare</h3>
      <div className="flex-col gap-3">
        <ComparisonRow label="You" value={formatCO2(total)} percent={(total / MAX_SCALE) * 100} color={ratingColor} />
        <ComparisonRow label="World Average" value="4.7t CO₂e" percent={(4700 / MAX_SCALE) * 100} color="var(--color-text-muted)" muted />
        <ComparisonRow label="Paris Target" value="2.5t CO₂e" percent={(2500 / MAX_SCALE) * 100} color="var(--color-primary)" muted />
      </div>
    </div>
  );
});

interface ComparisonRowProps {
  label: string;
  value: string;
  percent: number;
  color: string;
  muted?: boolean;
}

const ComparisonRow = memo(function ComparisonRow({ label, value, percent, color, muted }: ComparisonRowProps) {
  return (
    <div>
      <div className={`comparison-row-label ${muted ? 'text-secondary' : ''}`}>
        <span>{label}</span>
        <span className={muted ? '' : 'font-600'}>{value}</span>
      </div>
      <div className="progress-bar comparison-bar">
        <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%`, background: color }} />
      </div>
    </div>
  );
});
