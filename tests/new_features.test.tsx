import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('New Features: Countdown, Calendar, and Dashboard', () => {
  beforeEach(() => { localStorage.setItem('polaris-onboarded', 'true'); });
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 25, 12, 0, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Navigation tabs include Calendar and Dashboard in correct order', () => {
    render(<App />);
    const tabNames = screen.getAllByRole('button')
      .filter(tab => tab.id?.startsWith('tab-'))
      .map(tab => tab.textContent?.trim());
    expect(tabNames).toEqual(['Tasks', 'Calendar', 'Dashboard', 'Inbox']);
  });

  test('Countdown progress bar and text render on task cards in Tasks tab', () => {
    render(<App />);
    expect(screen.getByText(/Act now/i)).toBeInTheDocument();
    const warningText = screen.getAllByText(/Start by/i);
    expect(warningText.length).toBeGreaterThan(0);
  });

  test('Calendar tab renders monthly view and allows month navigation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
    expect(screen.getByText('June 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByText('›'));
    expect(screen.getByText('July 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByText('‹'));
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  test('Clicking a calendar cell opens side panel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    const panelHeader = screen.getAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'));
    expect(panelHeader).toBeTruthy();
  });

  test('Dashboard tab renders counters and cards', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Task Overview')).toBeInTheDocument();
    expect(screen.getByText('Urgency Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Deadlines This Week')).toBeInTheDocument();
    expect(screen.getByText('Polaris Impact')).toBeInTheDocument();
    expect(screen.getByText('Point-of-No-Return Alerts')).toBeInTheDocument();
    const totalLabel = screen.getByText('Total tasks');
    expect(totalLabel.previousSibling?.textContent).toBe('4');
  });

  test('Dashboard metrics update when a task is completed via Kanban flow', () => {
    render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const totalLabel = screen.getByText('Total tasks');
    expect(totalLabel.previousSibling?.textContent).toBe('3');
    const completedLabel = screen.getByText('Completed');
    expect(completedLabel.previousSibling?.textContent).toBe('1');
  });
});
