import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 6: Calendar & Dashboard Features', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 25, 12, 0, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // CALENDAR TAB
  test('Calendar tab renders when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
  });

  test('Calendar shows current month name and year', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  test('Calendar has navigation arrows', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  test('Clicking next arrow advances month', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    fireEvent.click(screen.getByText('›'));
    expect(screen.getByText('July 2026')).toBeInTheDocument();
  });

  test('Clicking prev arrow goes back a month', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    fireEvent.click(screen.getByText('‹'));
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  test('Calendar shows day headers: Sun Mon Tue Wed Thu Fri Sat', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(h => {
      expect(screen.getByText(h)).toBeInTheDocument();
    });
  });

  test("Today's date has highlighted circle (bg-[#0E1B2A])", () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const highlighted = container.querySelector('.calendar-cell .bg-\\[\\#0E1B2A\\]');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted?.textContent?.trim().length).toBeGreaterThan(0);
  });

  test('Calendar cells have class "calendar-cell"', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = container.querySelectorAll('.calendar-cell');
    expect(cells.length).toBeGreaterThan(28);
  });

  test('Calendar grid has class "calendar-grid"', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(container.querySelector('.calendar-grid')).toBeInTheDocument();
  });

  test('Clicking a date opens slide-in side panel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    const panelHeaders = screen.getAllByText(/Tasks on/i);
    const panelHeader = panelHeaders.find(el => el.closest('[class*="fixed"]'));
    expect(panelHeader).toBeInTheDocument();
  });

  test('Side panel has X close button that closes it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    const panelHeader = screen.getAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'));
    expect(panelHeader).toBeTruthy();
    const closeBtn = screen.getAllByText('✕').find(el => el.closest('[class*="fixed"]'));
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    const panelAfter = screen.queryAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'));
    expect(panelAfter).toBeUndefined();
  });

  // DASHBOARD TAB
  test('Dashboard tab renders when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  test('Dashboard shows "Recovery Score" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Recovery Score')).toBeInTheDocument();
  });

  test('Dashboard shows "Commitment Density" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Commitment Density')).toBeInTheDocument();
  });

  test('Dashboard shows "Polaris Impact" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Polaris Impact')).toBeInTheDocument();
  });

  test('Dashboard shows "Point-of-No-Return Alerts" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Point-of-No-Return Alerts')).toBeInTheDocument();
  });

  test('Dashboard shows "Deadlines This Week" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Deadlines This Week')).toBeInTheDocument();
  });

  test('Dashboard shows "Task Overview" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Task Overview')).toBeInTheDocument();
  });

  test('Dashboard shows "Urgency Breakdown" card', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('Urgency Breakdown')).toBeInTheDocument();
  });

  test('Dashboard shows "Habit Roast" button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Roast my habits/i)).toBeInTheDocument();
  });

  test('Task Overview shows correct total task count (4)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const totalLabel = screen.getByText('Total tasks');
    expect(totalLabel.previousSibling?.textContent).toBe('4');
  });

  test('Adding a task updates dashboard total count', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
    fireEvent.change(input, { target: { value: 'New Test Task' } });
    fireEvent.click(addButton);

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const totalLabel = screen.getByText('Total tasks');
    expect(totalLabel.previousSibling?.textContent).toBe('5');
  });

  test('Recovery Score shows circular SVG progress', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const svgCircles = container.querySelectorAll('circle');
    expect(svgCircles.length).toBeGreaterThanOrEqual(2);
  });

  test('"Polaris found what you almost missed" quote exists', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Polaris found/i)).toBeInTheDocument();
  });

  // COUNTDOWN ON CARDS
  test('Countdown "Start by" text appears on non-overdue tasks', () => {
    render(<App />);
    const warningText = screen.getAllByText(/Start by/i);
    expect(warningText.length).toBeGreaterThan(0);
  });

  test('Overdue task shows "Act now" countdown text', () => {
    render(<App />);
    expect(screen.getByText(/Act now/i)).toBeInTheDocument();
  });

  test('Tasks with "No deadline set" show no countdown bar', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
    fireEvent.change(input, { target: { value: 'No Deadline Task' } });
    fireEvent.click(addButton);

    const card = screen.getByText('No Deadline Task').closest('[id^="task-card-"]');
    expect(card).toBeInTheDocument();
    expect(card?.textContent).not.toContain('Start by');
    expect(card?.textContent).not.toContain('Act now');
  });
});
