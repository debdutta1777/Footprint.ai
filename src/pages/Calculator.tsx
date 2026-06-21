/**
 * Multi-step carbon footprint calculator page.
 *
 * Orchestrates a 5-step form flow (Transport → Energy → Food → Shopping → Results)
 * using decomposed step components from CalculatorSteps.
 * Each step is rendered lazily based on the current step index.
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { calculateTotalFootprint, getFootprintRating } from '../utils/carbonCalculator';
import {
  validateTransportInput,
  validateEnergyInput,
  validateFoodInput,
  validateShoppingInput,
} from '../utils/validation';
import {
  TransportStep,
  EnergyStep,
  FoodStep,
  ShoppingStep,
  ResultsStep,
} from '../components/CalculatorSteps';
import type { TransportData, EnergyData, FoodData, ShoppingData } from '../types/carbon';
import { CALCULATOR_STEPS } from '../constants';

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

  // Memoized calculations
  const result = useMemo(
    () => calculateTotalFootprint(transport, energy, food, shopping),
    [transport, energy, food, shopping]
  );
  const rating = useMemo(() => getFootprintRating(result.total), [result.total]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (step < CALCULATOR_STEPS.length - 1) setStep(s => s + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  // Partial update handlers (clean interface for step components)
  const updateTransport = useCallback((update: Partial<TransportData>) => {
    setTransport(prev => ({ ...prev, ...update }));
  }, []);

  const updateEnergy = useCallback((update: Partial<EnergyData>) => {
    setEnergy(prev => ({ ...prev, ...update }));
  }, []);

  const updateFood = useCallback((update: Partial<FoodData>) => {
    setFood(prev => ({ ...prev, ...update }));
  }, []);

  const updateShopping = useCallback((update: Partial<ShoppingData>) => {
    setShopping(prev => ({ ...prev, ...update }));
  }, []);

  /** Validate all inputs, create entry, and navigate to dashboard. */
  const handleSave = useCallback(() => {
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

  /** Render the currently active step */
  const renderStep = () => {
    switch (step) {
      case 0: return <TransportStep data={transport} onChange={updateTransport} />;
      case 1: return <EnergyStep data={energy} onChange={updateEnergy} />;
      case 2: return <FoodStep data={food} onChange={updateFood} />;
      case 3: return <ShoppingStep data={shopping} onChange={updateShopping} />;
      case 4: return <ResultsStep breakdown={result.breakdown} total={result.total} rating={rating} />;
      default: return null;
    }
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Carbon Calculator</h1>
        <p>Answer a few questions to estimate your annual carbon footprint</p>
      </div>

      {/* Step Progress */}
      <div
        className="calculator-progress"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={CALCULATOR_STEPS.length}
        aria-label={`Step ${step + 1} of ${CALCULATOR_STEPS.length}: ${CALCULATOR_STEPS[step]}`}
      >
        {CALCULATOR_STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`step-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`}
              onClick={() => i <= step && setStep(i)}
              aria-label={`Step ${i + 1}: ${s}`}
              disabled={i > step}
            >
              {i < step ? '✓' : i + 1}
            </button>
            {i < CALCULATOR_STEPS.length - 1 && (
              <div className={`step-line ${i < step ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Active Step */}
      <div className="calculator-form">
        {renderStep()}

        {/* Navigation */}
        <div className="calculator-nav">
          {step > 0 ? (
            <button className="btn btn-secondary" onClick={handleBack} type="button">
              ← Back
            </button>
          ) : <div />}
          {step < CALCULATOR_STEPS.length - 1 ? (
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
