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

  test('Calendar tab renders when clicked', () => {
    render(<App />);
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
  });

  test('Calendar shows current month name and year', () => {
    render(<App />);
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  test('Calendar has navigation arrows (‹ and ›)', () => {
    render(<App />);
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  test('Calendar shows day headers: Sun Mon Tue Wed Thu Fri Sat', () => {
    render(<App />);
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);
    const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test("Today's date has a highlighted circle", () => {
    const { container } = render(<App />);
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);
    
    // Check for today's circle highlight - bg-[#0E1B2A] or equivalent
    const highlighted = container.querySelector('.bg-\\[\\#0E1B2A\\]');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted?.textContent).toContain('25');
  });

  test('Dashboard tab renders when clicked', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  test('Dashboard shows "Task Overview" card', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Task Overview')).toBeInTheDocument();
  });

  test('Dashboard shows "Urgency Breakdown" card', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Urgency Breakdown')).toBeInTheDocument();
  });

  test('Dashboard shows "Deadlines This Week" card', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Deadlines This Week')).toBeInTheDocument();
  });

  test('Dashboard shows "Polaris Impact" card', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Polaris Impact')).toBeInTheDocument();
  });

  test('Dashboard shows "Point-of-No-Return Alerts" card', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Point-of-No-Return Alerts')).toBeInTheDocument();
  });

  test('Task overview shows correct total task count', () => {
    render(<App />);
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    const totalTasksLabel = screen.getByText('Total tasks');
    expect(totalTasksLabel.previousSibling?.textContent).toBe('4');
  });

  test('Adding a task updates dashboard total count', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });
    
    fireEvent.change(input, { target: { value: 'New Test Task' } });
    fireEvent.click(addButton);

    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    
    const totalTasksLabel = screen.getByText('Total tasks');
    expect(totalTasksLabel.previousSibling?.textContent).toBe('5');
  });

  test('Completing a task increments completed count on dashboard', () => {
    render(<App />);
    const doneButtons = screen.getAllByRole('button', { name: /Done/i });
    fireEvent.click(doneButtons[0]);

    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);

    const completedLabel = screen.getByText('Completed');
    expect(completedLabel.previousSibling?.textContent).toBe('1');
  });

  test('Countdown text appears on high urgency seed tasks', () => {
    render(<App />);
    const warningText = screen.getAllByText(/⚠ Start by/i);
    expect(warningText.length).toBeGreaterThan(0);
  });

  test('"Point of no return passed" text appears on overdue task', () => {
    render(<App />);
    const overdueText = screen.getByText(/🔴 Point of no return passed — act now\./i);
    expect(overdueText).toBeInTheDocument();
  });
});
