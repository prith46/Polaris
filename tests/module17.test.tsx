import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 17: Habit Roast', () => {
  beforeEach(() => {
    localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('Dashboard shows "Roast my habits" button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Roast my habits/i)).toBeInTheDocument();
  });

  test('Roast button has id="roast-habits-btn"', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(container.querySelector('#roast-habits-btn')).toBeInTheDocument();
  });

  test('Clicking roast button shows loading state "Roasting... 🔥"', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Roast my habits/i));
    expect(screen.getByText('Roasting... 🔥')).toBeInTheDocument();
    vi.useRealTimers();
  });

  test('Roast button is disabled during loading', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const btn = screen.getByText(/Roast my habits/i);
    fireEvent.click(btn);
    expect(screen.getByText('Roasting... 🔥').closest('button')).toBeDisabled();
    vi.useRealTimers();
  });

  test('After roast completes, result text appears inline', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Roast my habits/i));

    await waitFor(() => {
      expect(screen.queryByText('Roasting... 🔥')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    const roastText = screen.getAllByText(/overdue|tasks|deadlines/i);
    expect(roastText.length).toBeGreaterThan(0);
  });

  test('Roast result contains readable text from session data', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Roast my habits/i));

    await waitFor(() => {
      expect(screen.queryByText('Roasting... 🔥')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    const resultContainer = document.querySelector('#roast-habits-btn')?.parentElement;
    const resultCard = resultContainer?.querySelector('.bg-white');
    expect(resultCard).toBeInTheDocument();
    expect((resultCard?.textContent || '').length).toBeGreaterThan(10);
  });

  test('Clicking roast twice replaces the previous result', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));

    fireEvent.click(screen.getByText(/Roast my habits/i));
    await waitFor(() => {
      expect(screen.queryByText('Roasting... 🔥')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    fireEvent.click(screen.getByText(/Roast my habits/i));
    expect(screen.getByText('Roasting... 🔥')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Roasting... 🔥')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
