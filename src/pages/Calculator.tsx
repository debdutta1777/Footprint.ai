import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { calculateTotalFootprint, getFootprintRating } from '../utils/carbonCalculator';
import { formatCO2 } from '../utils/formatters';
import {
  validateTransportInput,
  validateEnergyInput,
  validateFoodInput,
  validateShoppingInput,
} from '../utils/validation';
import type { TransportData, EnergyData, FoodData, ShoppingData } from '../types/carbon';

const STEPS = ['Transport', 'Energy', 'Food', 'Shopping', 'Results'];

/** Multi-step carbon footprint calculator. */
export default function Calculator() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Form state
  const [transport, setTransport] = useState<TransportData>({
    carKm: 0, carFuelType: 'petrol', publicTransportTrips: 0,
    shortFlightsPerYear: 0, longFlightsPerYear: 0,
  });
  const [energy, setEnergy] = useState<EnergyData>({
    electricityKwh: 200, gasKwh: 100, renewableEnergy: false, householdSize: 2,
  });
  const [food, setFood] = useState<FoodData>({
    dietType: 'medium-meat', localFood: false, foodWaste: 'medium',
  });
  const [shopping, setShopping] = useState<ShoppingData>({
    clothingItems: 2, electronicsPurchases: 0, secondHand: false, recyclingLevel: 'some',
  });

  // Calculate results
  const result = calculateTotalFootprint(transport, energy, food, shopping);
  const rating = getFootprintRating(result.total);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const handleSave = useCallback(() => {
    // Validate all inputs before saving
    const validTransport = validateTransportInput({ ...transport });
    const validEnergy = validateEnergyInput({ ...energy });
    const validFood = validateFoodInput({ ...food });
    const validShopping = validateShoppingInput({ ...shopping });

    const entry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      transport: validTransport,
      energy: validEnergy,
      food: validFood,
      shopping: validShopping,
      breakdown: result.breakdown,
      totalKgCO2: result.total,
    };

    dispatch({ type: 'ADD_ENTRY', payload: entry });
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    navigate('/dashboard');
  }, [transport, energy, food, shopping, result, dispatch, navigate]);

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Carbon Calculator</h1>
        <p>Answer a few questions to estimate your annual carbon footprint</p>
      </div>

      {/* Step Progress */}
      <div className="calculator-progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`step-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`}
              onClick={() => i <= step && setStep(i)}
              aria-label={`Step ${i + 1}: ${s}`}
              disabled={i > step}
            >
              {i < step ? '✓' : i + 1}
            </button>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'active' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="calculator-form">
        {/* Step 0: Transport */}
        {step === 0 && (
          <fieldset style={{ border: 'none' }}>
            <legend className="step-title">🚗 Transport</legend>
            <p className="step-subtitle">How do you get around?</p>

            <div className="form-group">
              <label htmlFor="car-fuel" className="form-label">Car fuel type</label>
              <select id="car-fuel" className="form-select" value={transport.carFuelType}
                onChange={e => setTransport(t => ({ ...t, carFuelType: e.target.value as TransportData['carFuelType'] }))}>
                <option value="none">I don't drive</option>
                <option value="petrol">Petrol / Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            {transport.carFuelType !== 'none' && (
              <div className="form-group">
                <label htmlFor="car-km" className="form-label">Weekly driving distance (km)</label>
                <input id="car-km" type="number" className="form-input" min="0" max="5000"
                  value={transport.carKm} onChange={e => setTransport(t => ({ ...t, carKm: Number(e.target.value) }))}
                  aria-describedby="car-km-hint" />
                <span id="car-km-hint" className="form-hint">Average commute is ~150 km/week</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="public-transport" className="form-label">Public transport trips per week</label>
              <input id="public-transport" type="number" className="form-input" min="0" max="100"
                value={transport.publicTransportTrips}
                onChange={e => setTransport(t => ({ ...t, publicTransportTrips: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label htmlFor="short-flights" className="form-label">Short-haul flights per year (&lt;3 hours)</label>
              <input id="short-flights" type="number" className="form-input" min="0" max="100"
                value={transport.shortFlightsPerYear}
                onChange={e => setTransport(t => ({ ...t, shortFlightsPerYear: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label htmlFor="long-flights" className="form-label">Long-haul flights per year (&gt;3 hours)</label>
              <input id="long-flights" type="number" className="form-input" min="0" max="50"
                value={transport.longFlightsPerYear}
                onChange={e => setTransport(t => ({ ...t, longFlightsPerYear: Number(e.target.value) }))} />
            </div>
          </fieldset>
        )}

        {/* Step 1: Energy */}
        {step === 1 && (
          <fieldset style={{ border: 'none' }}>
            <legend className="step-title">⚡ Home Energy</legend>
            <p className="step-subtitle">Tell us about your home energy usage</p>

            <div className="form-group">
              <label htmlFor="electricity" className="form-label">Monthly electricity (kWh)</label>
              <input id="electricity" type="number" className="form-input" min="0" max="10000"
                value={energy.electricityKwh}
                onChange={e => setEnergy(en => ({ ...en, electricityKwh: Number(e.target.value) }))}
                aria-describedby="elec-hint" />
              <span id="elec-hint" className="form-hint">Average household uses ~300 kWh/month</span>
            </div>

            <div className="form-group">
              <label htmlFor="gas" className="form-label">Monthly natural gas (kWh)</label>
              <input id="gas" type="number" className="form-input" min="0" max="10000"
                value={energy.gasKwh}
                onChange={e => setEnergy(en => ({ ...en, gasKwh: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label htmlFor="household" className="form-label">People in household</label>
              <input id="household" type="number" className="form-input" min="1" max="20"
                value={energy.householdSize}
                onChange={e => setEnergy(en => ({ ...en, householdSize: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={energy.renewableEnergy}
                  onChange={e => setEnergy(en => ({ ...en, renewableEnergy: e.target.checked }))} />
                <span>I use renewable energy (solar, wind, etc.)</span>
              </label>
            </div>
          </fieldset>
        )}

        {/* Step 2: Food */}
        {step === 2 && (
          <fieldset style={{ border: 'none' }}>
            <legend className="step-title">🥗 Food & Diet</legend>
            <p className="step-subtitle">What does your diet look like?</p>

            <div className="form-group">
              <label htmlFor="diet-type" className="form-label">Diet type</label>
              <select id="diet-type" className="form-select" value={food.dietType}
                onChange={e => setFood(f => ({ ...f, dietType: e.target.value as FoodData['dietType'] }))}>
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
              <select id="food-waste" className="form-select" value={food.foodWaste}
                onChange={e => setFood(f => ({ ...f, foodWaste: e.target.value as FoodData['foodWaste'] }))}>
                <option value="none">Almost none — I use everything</option>
                <option value="low">Low — occasional waste</option>
                <option value="medium">Medium — some waste weekly</option>
                <option value="high">High — significant waste</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={food.localFood}
                  onChange={e => setFood(f => ({ ...f, localFood: e.target.checked }))} />
                <span>I prioritize locally-sourced food</span>
              </label>
            </div>
          </fieldset>
        )}

        {/* Step 3: Shopping */}
        {step === 3 && (
          <fieldset style={{ border: 'none' }}>
            <legend className="step-title">🛍️ Shopping & Consumption</legend>
            <p className="step-subtitle">Tell us about your purchasing habits</p>

            <div className="form-group">
              <label htmlFor="clothing" className="form-label">Clothing items purchased per month</label>
              <input id="clothing" type="number" className="form-input" min="0" max="100"
                value={shopping.clothingItems}
                onChange={e => setShopping(s => ({ ...s, clothingItems: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label htmlFor="electronics" className="form-label">Electronics purchased per month</label>
              <input id="electronics" type="number" className="form-input" min="0" max="50"
                value={shopping.electronicsPurchases}
                onChange={e => setShopping(s => ({ ...s, electronicsPurchases: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label htmlFor="recycling" className="form-label">Recycling habits</label>
              <select id="recycling" className="form-select" value={shopping.recyclingLevel}
                onChange={e => setShopping(s => ({ ...s, recyclingLevel: e.target.value as ShoppingData['recyclingLevel'] }))}>
                <option value="none">I don't recycle</option>
                <option value="some">I recycle some items</option>
                <option value="most">I recycle most items</option>
                <option value="all">I recycle everything possible</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={shopping.secondHand}
                  onChange={e => setShopping(s => ({ ...s, secondHand: e.target.checked }))} />
                <span>I regularly buy second-hand items</span>
              </label>
            </div>
          </fieldset>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div role="region" aria-label="Carbon footprint results">
            <div className="step-title">📊 Your Results</div>
            <p className="step-subtitle">Here's your estimated annual carbon footprint</p>

            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
              <div className="result-ring">
                <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={`Your footprint is ${formatCO2(result.total)}`}>
                  <circle cx="100" cy="100" r="85" fill="none" stroke="var(--color-surface)" strokeWidth="12" />
                  <circle cx="100" cy="100" r="85" fill="none"
                    stroke={rating.color} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${Math.min((result.total / 12000) * 534, 534)} 534`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="result-ring-value" style={{ position: 'absolute' }}>
                  <span className="value" style={{ color: rating.color }}>
                    {(result.total / 1000).toFixed(1)}
                  </span>
                  <span className="unit">tonnes CO₂e/year</span>
                </div>
              </div>

              <div className="badge" style={{ background: `${rating.color}20`, color: rating.color, fontSize: 'var(--font-size-base)', padding: 'var(--space-2) var(--space-4)', margin: '0 auto var(--space-4)' }}>
                {rating.label}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto' }}>{rating.description}</p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
              {([
                { label: 'Transport', value: result.breakdown.transport, color: 'var(--color-transport)', icon: '🚗' },
                { label: 'Energy', value: result.breakdown.energy, color: 'var(--color-energy)', icon: '⚡' },
                { label: 'Food', value: result.breakdown.food, color: 'var(--color-food)', icon: '🥗' },
                { label: 'Shopping', value: result.breakdown.shopping, color: 'var(--color-shopping)', icon: '🛍️' },
              ] as const).map(cat => (
                <div key={cat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span style={{ fontSize: '2rem' }} aria-hidden="true">{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{cat.label}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${result.total > 0 ? (cat.value / result.total) * 100 : 0}%`,
                        background: cat.color,
                      }} />
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: cat.color, whiteSpace: 'nowrap' }}>
                    {formatCO2(cat.value)}
                  </div>
                </div>
              ))}
            </div>

            {/* World comparison bar */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>How You Compare</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                    <span>You</span><span style={{ fontWeight: 600 }}>{formatCO2(result.total)}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 12 }}>
                    <div className="progress-fill" style={{ width: `${Math.min((result.total / 12000) * 100, 100)}%`, background: rating.color }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    <span>World Average</span><span>4.7t CO₂e</span>
                  </div>
                  <div className="progress-bar" style={{ height: 12 }}>
                    <div className="progress-fill" style={{ width: `${(4700 / 12000) * 100}%`, background: 'var(--color-text-muted)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                    <span>Paris Target</span><span>2.5t CO₂e</span>
                  </div>
                  <div className="progress-bar" style={{ height: 12 }}>
                    <div className="progress-fill" style={{ width: `${(2500 / 12000) * 100}%`, background: 'var(--color-primary)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="calculator-nav">
          {step > 0 ? (
            <button className="btn btn-secondary" onClick={handleBack} type="button">
              ← Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext} type="button">
              Next →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSave} type="button" id="save-results">
              💾 Save & View Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
