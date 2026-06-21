/**
 * Component integration tests using React Testing Library.
 * Tests component rendering, user interactions, and state updates.
 * 
 * Note: Pages are lazy-loaded via React.lazy, so we use findBy* (async)
 * queries to wait for Suspense resolution.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import App from '../App';

/** Helper to render components within required providers */
function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  it('renders brand name', async () => {
    renderApp();
    expect(await screen.findByText('CarbonWise')).toBeInTheDocument();
  });

  it('has skip-to-content link for accessibility', () => {
    renderApp();
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderApp();
    const nav = screen.getByRole('menubar');
    expect(nav).toBeInTheDocument();
  });
});

describe('Landing Page', () => {
  it('renders hero heading', async () => {
    renderApp('/');
    expect(await screen.findByText(/Understand Your/i)).toBeInTheDocument();
  });

  it('renders calculate CTA button', async () => {
    renderApp('/');
    const cta = await screen.findByText(/Calculate Your Footprint/i);
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/calculator');
  });

  it('renders feature section', async () => {
    renderApp('/');
    expect(await screen.findByText('Carbon Calculator')).toBeInTheDocument();
    expect(screen.getByText('Personal Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Private & Secure')).toBeInTheDocument();
  });
});

describe('Calculator Page', () => {
  it('renders fuel type selector', async () => {
    renderApp('/calculator');
    const fuelSelect = await screen.findByLabelText(/fuel type/i);
    expect(fuelSelect).toBeInTheDocument();
  });

  it('renders Next button for step navigation', async () => {
    renderApp('/calculator');
    const nextBtn = await screen.findByText(/Next/i);
    expect(nextBtn).toBeInTheDocument();
  });
});

describe('Dashboard Page (empty state)', () => {
  it('shows no data message when no entries', async () => {
    renderApp('/dashboard');
    // Dashboard lazy-loads with Recharts (heavy). Use extended timeout.
    expect(await screen.findByText(/No Data Yet/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('shows link to calculator from empty dashboard', async () => {
    renderApp('/dashboard');
    const link = await screen.findByText(/Calculate Your Footprint/i, {}, { timeout: 5000 });
    expect(link).toBeInTheDocument();
  });
});

describe('Actions Page', () => {
  it('renders stat cards', async () => {
    renderApp('/actions');
    expect(await screen.findByText('Total Completions')).toBeInTheDocument();
  });

  it('renders category filter tabs', async () => {
    renderApp('/actions');
    const tablist = await screen.findByRole('tablist');
    expect(tablist).toBeInTheDocument();
  });

  it('renders Total CO₂ Saved stat', async () => {
    renderApp('/actions');
    expect(await screen.findByText(/Total CO.*Saved/i)).toBeInTheDocument();
  });

  it('shows Done buttons', async () => {
    renderApp('/actions');
    const doneButtons = await screen.findAllByText('✓ Done');
    expect(doneButtons.length).toBeGreaterThan(0);
  });

  it('shows toast on action completion', async () => {
    renderApp('/actions');
    const doneButtons = await screen.findAllByText('✓ Done');
    fireEvent.click(doneButtons[0]);
    await waitFor(() => {
      const status = document.querySelector('[role="status"]');
      expect(status).not.toBeNull();
    });
  });
});

describe('Achievements Page', () => {
  it('renders achievement badges list', async () => {
    renderApp('/achievements');
    const list = await screen.findByRole('list', { name: /achievement badges/i });
    expect(list).toBeInTheDocument();
  });

  it('renders at least 8 badges', async () => {
    renderApp('/achievements');
    const list = await screen.findByRole('list', { name: /achievement badges/i });
    const items = list.querySelectorAll('[role="listitem"]');
    expect(items.length).toBeGreaterThanOrEqual(8);
  });

  it('renders progress indicator', async () => {
    renderApp('/achievements');
    expect(await screen.findByText(/Achievements Unlocked/i)).toBeInTheDocument();
  });
});

describe('EcoAssistant Widget', () => {
  it('renders floating toggle button', async () => {
    renderApp('/');
    const toggle = await screen.findByLabelText(/open eco assistant/i);
    expect(toggle).toBeInTheDocument();
  });

  it('opens assistant panel on click', async () => {
    renderApp('/');
    const toggle = await screen.findByLabelText(/open eco assistant/i);
    fireEvent.click(toggle);
    expect(await screen.findByText('EcoAssistant')).toBeInTheDocument();
  });

  it('shows tip navigation controls', async () => {
    renderApp('/');
    const toggle = await screen.findByLabelText(/open eco assistant/i);
    fireEvent.click(toggle);
    expect(await screen.findByLabelText(/next tip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/previous tip/i)).toBeInTheDocument();
  });

  it('closes panel on close button', async () => {
    renderApp('/');
    const toggle = await screen.findByLabelText(/open eco assistant/i);
    fireEvent.click(toggle);
    await screen.findByText('EcoAssistant');
    const closeBtn = screen.getByLabelText(/close eco assistant/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByText('EcoAssistant')).not.toBeInTheDocument();
  });
});

describe('Error Boundary', () => {
  it('renders children successfully when no error', () => {
    renderApp('/');
    expect(screen.getByText('CarbonWise')).toBeInTheDocument();
  });
});
