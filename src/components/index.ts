/**
 * Barrel export for all components.
 * Provides a single import point for consumers.
 */

export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as EcoAssistant } from './EcoAssistant';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ScrollToTop } from './ScrollToTop';
export { default as WeeklyGoalCard } from './WeeklyGoalCard';
export {
  TransportStep,
  EnergyStep,
  FoodStep,
  ShoppingStep,
  ResultsStep,
} from './CalculatorSteps';

