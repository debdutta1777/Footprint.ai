import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 * Displayed when no route matches the current URL.
 * Provides accessible navigation back to the home page.
 */
export default function NotFound() {
  return (
    <div className="page-container animate-in not-found" role="alert">
      <div className="not-found-code" aria-hidden="true">404</div>
      <h1 className="mb-4">Page Not Found</h1>
      <p className="text-secondary max-w-sm mx-auto mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        🏠 Back to Home
      </Link>
    </div>
  );
}
