import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 13: Overdue Task Lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // OVERDUE DETECTION
  test('Recommendation letter card shows "Overdue" pill on load', () => {
    const { container } = render(<App />);
    const overdueCard = container.querySelector('.overdue-card');
    expect(overdueCard).toBeInTheDocument();
    expect(overdueCard?.textContent).toContain('Overdue');
  });

  test('Overdue card has class "overdue-card"', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.overdue-card')).toBeInTheDocument();
  });

  test('Non-overdue cards do NOT have "overdue-card" class', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    ['Electricity bill payment', 'Submit project proposal', 'Renew gym membership'].forEach(title => {
      const h = headings.find(h => h.textContent === title);
      const card = h?.closest('[id^="task-card-"]');
      expect(card?.className).not.toContain('overdue-card');
    });
  });

  // OVERDUE BUTTONS
  test('Overdue card shows Escape Hatch, Mark Done Anyway, Archive buttons', () => {
    render(<App />);
    expect(screen.getByText(/Escape Hatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark Done Anyway/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Archive/i })).toBeInTheDocument();
  });

  test('Non-overdue cards do NOT show Mark Done Anyway or Archive', () => {
    render(<App />);
    const normalCard = screen.getByText('Electricity bill payment').closest('[id^="task-card-"]');
    expect(normalCard?.textContent).not.toContain('Mark Done Anyway');
    expect(normalCard?.textContent).not.toContain('Archive');
  });

  test('Clicking Mark Done Anyway removes task from To Do and increments completedCount', () => {
    render(<App />);
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(screen.getByText(/Mark Done Anyway/i));
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(initialCount - 1);
    expect(localStorage.getItem('polaris-completed')).toBe('1');
  });

  test('Clicking Archive removes task from To Do', () => {
    render(<App />);
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(screen.getByRole('button', { name: /Archive/i }));
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(initialCount - 1);
  });

  test('Clicking Escape Hatch triggers modal (mock)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ draft: 'Sample draft' }),
    } as any);
    render(<App />);
    const overdueCard = document.querySelector('.overdue-card');
    const escBtn = overdueCard?.querySelector('[aria-label="Draft a reply"]');
    fireEvent.click(escBtn!);
    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });
  });

  // RECOVERY SCORE
  test('Dashboard shows Recovery Score card with 0% when overdue unresolved', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Recovery Score')).toBeInTheDocument();
    expect(screen.getByText('🔴 Critical — address overdue tasks now')).toBeInTheDocument();
    expect(screen.getByText(/1 overdue encountered/i)).toBeInTheDocument();
    expect(screen.getByText(/0 resolved/i)).toBeInTheDocument();
  });

  test('Recovery Score has circular SVG', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  test('Mark Done Anyway increases recovery to 100%', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Mark Done Anyway/i));
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText("✓ You're recovering well")).toBeInTheDocument();
    expect(screen.getByText(/1 resolved/i)).toBeInTheDocument();
    expect(localStorage.getItem('polaris-resolved-overdue')).toBe('1');
  });

  test('Archive also increases resolvedOverdueCount', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Archive/i }));
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/1 resolved/i)).toBeInTheDocument();
    expect(localStorage.getItem('polaris-resolved-overdue')).toBe('1');
  });

  test('Overdue state persists across re-renders', () => {
    const { unmount } = render(<App />);
    unmount();
    render(<App />);
    expect(document.querySelector('.overdue-card')).toBeInTheDocument();
  });

  test('totalOverdueEncountered persists to localStorage', () => {
    render(<App />);
    expect(localStorage.getItem('polaris-total-overdue')).toBeTruthy();
  });

  test('resolvedOverdueCount persists to localStorage', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Mark Done Anyway/i));
    expect(localStorage.getItem('polaris-resolved-overdue')).toBe('1');
  });
});
