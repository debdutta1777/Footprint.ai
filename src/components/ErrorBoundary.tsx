/**
 * Error Boundary component for graceful error handling.
 * Catches rendering errors and displays an accessible recovery UI.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // In production, send to an error tracking service (e.g. Sentry)
    console.error('CarbonWise Error Boundary caught:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" aria-live="assertive" className="error-container">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <h1 className="error-title">Something went wrong</h1>
          <p className="error-message">
            An unexpected error occurred. Your data is safe — it&apos;s stored locally on your device.
          </p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={this.handleReset}>
              Try Again
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
          {this.state.error && (
            <details className="error-details">
              <summary style={{ cursor: 'pointer' }}>Technical Details</summary>
              <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
