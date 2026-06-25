import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('New Features: Countdown, Calendar, and Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Seed the date to a fixed value: Thursday, June 25, 2026
    vi.setSystemTime(new Date(2026, 5, 25, 12, 0, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Navigation tabs now include Calendar and Dashboard in the correct order', () => {
    render(<App />);
    const tabs = screen.getAllByRole('button');
    // Filter to only tab-nav buttons (they start with tab- id or are inside the nav)
    const tabNames = tabs
      .filter((tab) => tab.id && tab.id.startsWith('tab-'))
      .map((tab) => tab.textContent?.trim());

    expect(tabNames).toEqual(['Tasks', 'Calendar', 'Dashboard', 'Inbox']);
  });

  test('Countdown progress bar and text render on task cards in Tasks tab', () => {
    render(<App />);
    
    // Check for Point-of-No-Return countdown elements on Task Cards
    // task-1: "today at 11:59 PM", titles: "Electricity bill payment"
    // Duration: pay/bill => 20 mins. PONR: 11:39 PM.
    // task-2: "2 days ago at 11:59 PM" -> overdue -> Point of no return passed.
    // task-3: "2 days from now at 11:59 PM" -> future.
    
    const overdueText = screen.getByText(/🔴 Point of no return passed — act now\./i);
    expect(overdueText).toBeInTheDocument();

    const warningText = screen.getAllByText(/⚠ Start by/i);
    expect(warningText.length).toBeGreaterThan(0);
  });

  test('Calendar tab renders monthly view and allows month navigation', () => {
    render(<App />);
    
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);

    expect(screen.getByText('Calendar View')).toBeInTheDocument();
    
    // Current month is June 2026
    expect(screen.getByText('June 2026')).toBeInTheDocument();

    // Navigate to next month
    const nextButton = screen.getByText('›');
    fireEvent.click(nextButton);
    expect(screen.getByText('July 2026')).toBeInTheDocument();

    // Navigate back
    const prevButton = screen.getByText('‹');
    fireEvent.click(prevButton);
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  test('Clicking a calendar cell with a task opens a popover listing the tasks', () => {
    render(<App />);
    
    const calendarTab = screen.getByRole('button', { name: /Calendar/i });
    fireEvent.click(calendarTab);

    // June 25th 2026 is today.
    // task-1 (Electricity bill payment) is due today.
    // Let's find the calendar cell for June 25th or search for the task dot/text inside cell.
    const cellDayNumber = screen.getByText('25');
    const cellContainer = cellDayNumber.closest('[class*="min-h-"]');
    expect(cellContainer).toBeInTheDocument();
    fireEvent.click(cellContainer!);

    // Should open popover
    const closeBtn = screen.getByText('✕');
    expect(closeBtn).toBeInTheDocument();

    // Close popover
    fireEvent.click(closeBtn);
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  test('Dashboard tab renders counters, urgency breakdown, and weekly deadlines', () => {
    render(<App />);
    
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Task Overview')).toBeInTheDocument();
    expect(screen.getByText('Urgency Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Deadlines This Week')).toBeInTheDocument();
    expect(screen.getByText('Polaris Impact')).toBeInTheDocument();
    expect(screen.getByText('Point-of-No-Return Alerts')).toBeInTheDocument();
    
    // Check that we display the correct task count (4 initially)
    const totalTasksLabel = screen.getByText('Total tasks');
    expect(totalTasksLabel.previousSibling?.textContent).toBe('4');
  });

  test('Dashboard metrics update when a task is completed (deleted)', () => {
    render(<App />);
    
    // In Tasks tab, delete the first task
    const doneButtons = screen.getAllByRole('button', { name: /Done/i });
    // Click Done on the first task card
    fireEvent.click(doneButtons[0]);

    // Switch to Dashboard
    const dashboardTab = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);

    // Total tasks should now be 3, completed should be 1
    const totalTasksLabel = screen.getByText('Total tasks');
    expect(totalTasksLabel.previousSibling?.textContent).toBe('3');

    const completedLabel = screen.getByText('Completed');
    expect(completedLabel.previousSibling?.textContent).toBe('1');
  });
});
