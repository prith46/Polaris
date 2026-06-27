import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 11: localStorage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // BASIC PERSISTENCE
  test('App loads with 4 seed tasks when localStorage is empty', () => {
    render(<App />);
    ['Electricity bill payment', 'Recommendation letter for Professor Sharma', 'Submit project proposal', 'Renew gym membership'].forEach(t => {
      expect(screen.getAllByText(t)[0]).toBeInTheDocument();
    });
  });

  test('Adding a task persists it to localStorage key "polaris-tasks"', () => {
    const { unmount } = render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    fireEvent.change(input, { target: { value: 'New Test Task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    expect(screen.getByText('New Test Task')).toBeInTheDocument();
    unmount();
    const stored = localStorage.getItem('polaris-tasks');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored || '[]').some((t: any) => t.title === 'New Test Task')).toBe(true);
  });

  test('Moving task to In Progress shows In progress badge', () => {
    render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  test('Marking task Done via Handle it now → Mark Done persists removal', () => {
    const { unmount } = render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    unmount();
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(3);
  });

  test('completedCount persists to "polaris-completed"', () => {
    render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(localStorage.getItem('polaris-completed')).toBe('1');
  });

  test('scannedCount persists to "polaris-scanned" after scan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ result: JSON.stringify([{ title: 'S1', deadline: 'Today', urgency: 'low' }]) }),
    } as any);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await screen.findByText(/✓ Found 1 task\(s\) — added to your Tasks\./i);
    await waitFor(() => { expect(Number(localStorage.getItem('polaris-scanned'))).toBe(1); });
  });

  test('localStorage "polaris-tasks" contains valid JSON after operations', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    fireEvent.change(input, { target: { value: 'JSON check' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    expect(() => JSON.parse(localStorage.getItem('polaris-tasks') || '')).not.toThrow();
  });

  test('Re-rendering app loads saved tasks from localStorage', () => {
    const { unmount } = render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    fireEvent.change(input, { target: { value: 'Persist Me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    unmount();
    render(<App />);
    expect(screen.getByText('Persist Me')).toBeInTheDocument();
  });

  // SCHEMA VALIDATION
  test('Malformed JSON in "polaris-tasks" → loads seed tasks', () => {
    localStorage.setItem('polaris-tasks', '{malformed[json]');
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Array with missing required field → loads seed tasks', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([{ id: 'x', urgency: 'high', pillText: 'Due today' }]));
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Empty array in localStorage → loads seed tasks', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Valid saved tasks load correctly on mount', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([
      { id: 'c1', title: 'Custom saved', urgency: 'low', pillText: 'No deadline set', context: 'c', primaryAction: 'Handle it now', secondaryAction: 'Snooze' }
    ]));
    render(<App />);
    expect(screen.getByText('Custom saved')).toBeInTheDocument();
    expect(screen.queryByText('Electricity bill payment')).not.toBeInTheDocument();
  });

  // RESET DEMO
  test('Hidden reset button exists in DOM', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#demo-reset-corner')).toBeInTheDocument();
    expect(container.querySelector('#demo-reset-btn')).toBeInTheDocument();
  });

  test('Clicking reset clears localStorage and resets to 4 seed tasks', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([{ id: 'x', title: 'X', urgency: 'low', pillText: 'P', context: 'C', primaryAction: 'A', secondaryAction: 'B' }]));
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#demo-reset-btn')!);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(localStorage.getItem('polaris-tasks')).toBeNull();
  });

  test('After reset completedCount and scannedCount are 0', () => {
    localStorage.setItem('polaris-completed', '5');
    localStorage.setItem('polaris-scanned', '3');
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#demo-reset-btn')!);
    expect(localStorage.getItem('polaris-completed')).toBeNull();
    expect(localStorage.getItem('polaris-scanned')).toBeNull();
  });

  // OVERDUE PERSISTENCE
  test('totalOverdueEncountered persists to "polaris-total-overdue"', () => {
    render(<App />);
    expect(localStorage.getItem('polaris-total-overdue')).toBeTruthy();
  });

  test('resolvedOverdueCount persists to "polaris-resolved-overdue"', () => {
    render(<App />);
    expect(localStorage.getItem('polaris-resolved-overdue')).toBeTruthy();
  });

  test('overdueTaskIds persists to "polaris-overdue-ids"', () => {
    render(<App />);
    expect(localStorage.getItem('polaris-overdue-ids')).toBeTruthy();
  });

  // EXTRACTION LOG PERSISTENCE
  test('extractionLog persists to "polaris-extraction-log" after scan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ result: JSON.stringify([{ title: 'Log Task', deadline: 'Soon', urgency: 'low' }]) }),
    } as any);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await screen.findByText(/✓ Found 1 task\(s\) — added to your Tasks\./i);
    await waitFor(() => {
      const log = JSON.parse(localStorage.getItem('polaris-extraction-log') || '[]');
      expect(log.length).toBe(1);
      expect(log[0].taskTitle).toBe('Log Task');
    });
  });

  // EDGE CASES
  test('Adding 50 tasks, re-rendering — all 50 persist', () => {
    const { unmount } = render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    for (let i = 1; i <= 50; i++) {
      fireEvent.change(input, { target: { value: `Task #${i}` } });
      fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    }
    unmount();
    render(<App />);
    expect(screen.getByText('Task #50')).toBeInTheDocument();
  }, 120000);

  test('Special characters in task title persist correctly', () => {
    const { unmount } = render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const title = '✨ Emoji <tag> & "quotes"';
    fireEvent.change(input, { target: { value: title } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    unmount();
    render(<App />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  test('Very long task title (500 chars) persists correctly', () => {
    const { unmount } = render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const title = 'A'.repeat(500);
    fireEvent.change(input, { target: { value: title } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    unmount();
    render(<App />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
