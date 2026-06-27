import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 15: Commitment Density & Proactive Warning', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // COMMITMENT DENSITY CARD
  test('Dashboard shows "Commitment Density" card with subtitle', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Commitment Density')).toBeInTheDocument();
    expect(screen.getByText('Your task load over the next 7 days')).toBeInTheDocument();
  });

  test('7 day labels render including Today and Tomorrow', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getAllByText('Today')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Tomorrow')[0]).toBeInTheDocument();
  });

  test('Peak and Avg stats display', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Peak:/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg:/i)).toBeInTheDocument();
  });

  test('BAR COLORS: correct background colors for different task counts', () => {
    const day3Name = new Date();
    day3Name.setDate(day3Name.getDate() + 2);
    const day3Str = day3Name.toLocaleDateString('en-US', { weekday: 'long' });
    const day4Name = new Date();
    day4Name.setDate(day4Name.getDate() + 3);
    const day4Str = day4Name.toLocaleDateString('en-US', { weekday: 'long' });

    const customTasks = [
      { id: 't1', title: 'T1', urgency: 'low', pillText: 'Due tomorrow', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't2', title: 'T2', urgency: 'low', pillText: `Due on ${day3Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't3', title: 'T3', urgency: 'low', pillText: `Due on ${day3Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't4', title: 'T4', urgency: 'low', pillText: `Due on ${day3Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't5', title: 'T5', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't6', title: 'T6', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't7', title: 'T7', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't8', title: 'T8', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));

    const densityCard = screen.getByText('Commitment Density').closest('.bg-white');
    expect(densityCard).toBeInTheDocument();

    const bars = densityCard?.querySelectorAll('div[style*="background-color"]');
    const bgColors = Array.from(bars || []).map(b => (b as HTMLElement).style.backgroundColor.toLowerCase());

    expect(bgColors.some(c => c.includes('rgb(229, 229, 229)') || c.includes('#e5e5e5'))).toBe(true);
    expect(bgColors.some(c => c.includes('rgb(15, 157, 88)') || c.includes('#0f9d58'))).toBe(true);
    expect(bgColors.some(c => c.includes('rgb(200, 137, 59)') || c.includes('#c8893b'))).toBe(true);
    expect(bgColors.some(c => c.includes('rgb(178, 58, 46)') || c.includes('#b23a2e'))).toBe(true);
  });

  // OVERCOMMITMENT WARNING — REMOVED FROM TASKS VIEW
  test('Warning banner is NOT present in Tasks view (was removed)', () => {
    const customTasks = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));
    const { container } = render(<App />);
    expect(container.querySelector('#density-warning-banner')).not.toBeInTheDocument();
  });

  test('"Renegotiate now →" button does NOT exist in Tasks view', () => {
    const customTasks = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Renegotiate now →' })).not.toBeInTheDocument();
  });

  // INTEGRATION
  test('Commitment density updates when tasks added', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Add a new task/i);
    fireEvent.change(input, { target: { value: 'Density Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Commitment Density')).toBeInTheDocument();
  });

  test('Dashboard density card still shows when overloaded', () => {
    const customTasks = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Commitment Density')).toBeInTheDocument();
  });

  test('All bars render without crashing when tasks array is empty', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([]));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Commitment Density')).toBeInTheDocument();
  });
});
