import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 11: localStorage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('App loads with 4 seed tasks when localStorage is empty', () => {
    render(<App />);
    const taskTitles = [
      'Electricity bill payment',
      'Recommendation letter for Professor Sharma',
      'Submit project proposal',
      'Renew gym membership',
    ];
    taskTitles.forEach(title => {
      expect(screen.getAllByText(title)[0]).toBeInTheDocument();
    });
  });

  test('Adding a task and re-rendering loads the saved task from localStorage', () => {
    const { unmount } = render(<App />);
    
    const input = screen.getByPlaceholderText('Add a new task…');
    fireEvent.change(input, { target: { value: 'New Test Task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    
    expect(screen.getByText('New Test Task')).toBeInTheDocument();
    unmount();
    
    const stored = localStorage.getItem('polaris-tasks');
    expect(stored).toBeDefined();
    const tasks = JSON.parse(stored || '[]');
    expect(tasks.some((t: any) => t.title === 'New Test Task')).toBe(true);

    render(<App />);
    expect(screen.getByText('New Test Task')).toBeInTheDocument();
  });

  test('Removing a task (Done) persists the removal across re-renders', () => {
    const { unmount } = render(<App />);
    
    const doneButtons = screen.getAllByRole('button', { name: 'Done' });
    fireEvent.click(doneButtons[0]);
    
    unmount();
    
    render(<App />);
    expect(screen.queryByText('Electricity bill payment')).not.toBeInTheDocument();
  });

  test('completedCount persists to localStorage after marking a task done', () => {
    const { unmount } = render(<App />);
    const doneButtons = screen.getAllByRole('button', { name: 'Done' });
    fireEvent.click(doneButtons[0]);
    
    expect(localStorage.getItem('polaris-completed')).toBe('1');
    unmount();
    
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.queryAllByText('1').length).toBeGreaterThan(0);
  });

  test('scannedCount persists to localStorage after a scan (mock the scan)', async () => {
    const mockTasks = [
      { title: 'Scanned task 1', deadline: 'Today', urgency: 'high' }
    ];
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: JSON.stringify(mockTasks) }),
      } as any)
    );

    render(<App />);
    
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);
    
    const scanBtn = screen.getByRole('button', { name: 'Scan for deadlines' });
    fireEvent.click(scanBtn);
    
    await screen.findByText(/✓ Found 1 task\(s\) — added to your Tasks\./i);
    
    expect(localStorage.getItem('polaris-scanned')).toBe('1');
  });

  test('localStorage key "polaris-tasks" contains valid JSON after any task operation', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    fireEvent.change(input, { target: { value: 'JSON verification task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    
    const raw = localStorage.getItem('polaris-tasks');
    expect(() => JSON.parse(raw || '')).not.toThrow();
  });

  test('localStorage key "polaris-completed" contains a number after marking done', () => {
    render(<App />);
    const doneButtons = screen.getAllByRole('button', { name: 'Done' });
    fireEvent.click(doneButtons[0]);
    expect(Number(localStorage.getItem('polaris-completed'))).toBe(1);
  });

  test('localStorage key "polaris-scanned" contains a number after a scan', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: JSON.stringify([{ title: 'S1', deadline: 'Today', urgency: 'low' }]) }),
      } as any)
    );

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await screen.findByText(/✓ Found 1 task\(s\) — added to your Tasks\./i);
    
    expect(Number(localStorage.getItem('polaris-scanned'))).toBe(1);
  });

  test('If localStorage contains malformed JSON for "polaris-tasks", app loads seed tasks instead', () => {
    localStorage.setItem('polaris-tasks', '{malformed[json]');
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('If localStorage contains an array with a missing required field (no title), app loads seed tasks', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([{ id: 'task-test', urgency: 'high', pillText: 'Due today' }]));
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('If localStorage contains an empty array, app loads seed tasks (not empty list)', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('If localStorage contains valid tasks, they load correctly on mount', () => {
    const valid = [
      { id: 'custom-t1', title: 'My custom task', urgency: 'low', pillText: 'No deadline set', context: 'none', primaryAction: 'Handle it now', secondaryAction: 'Snooze' }
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(valid));
    render(<App />);
    expect(screen.getByText('My custom task')).toBeInTheDocument();
    expect(screen.queryByText('Electricity bill payment')).not.toBeInTheDocument();
  });

  test('Hovering bottom-right corner reveals the reset button (check it exists in DOM)', () => {
    const { container } = render(<App />);
    const resetCorner = container.querySelector('#demo-reset-corner');
    const resetBtn = container.querySelector('#demo-reset-btn');
    expect(resetCorner).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();
  });

  test('Clicking reset clears localStorage and resets to 4 seed tasks', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([{ id: 'custom-t1', title: 'My custom task', urgency: 'low', pillText: 'No deadline set' }]));
    const { container } = render(<App />);
    const resetBtn = container.querySelector('#demo-reset-btn');
    fireEvent.click(resetBtn!);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(localStorage.getItem('polaris-tasks')).toBeNull();
  });

  test('After reset, completedCount is 0 and scannedCount is 0', () => {
    localStorage.setItem('polaris-completed', '5');
    localStorage.setItem('polaris-scanned', '3');
    const { container } = render(<App />);
    const resetBtn = container.querySelector('#demo-reset-btn');
    fireEvent.click(resetBtn!);
    expect(localStorage.getItem('polaris-completed')).toBeNull();
    expect(localStorage.getItem('polaris-scanned')).toBeNull();
  });

  test('Adding 50 tasks, refreshing (re-rendering) — all 50 persist', () => {
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

  test('Special characters in task title persist correctly (emoji, < > & quotes)', () => {
    const { unmount } = render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const title = '✨ Emoji <tag> & "quotes" \'test\'';
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

  test('Task with subtasks persists subtask state', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ subtasks: ['Subtask 1', 'Subtask 2'] }),
      } as any)
    );
    const { unmount } = render(<App />);
    const breakBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakBtn);
    await screen.findByText('Subtask 1');
    
    unmount();
    render(<App />);
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
  });

  test('Checked subtasks remain checked after re-render', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ subtasks: ['Subtask 1', 'Subtask 2'] }),
      } as any)
    );
    const { unmount } = render(<App />);
    const breakBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakBtn);
    await screen.findByText('Subtask 1');

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    unmount();
    render(<App />);
    const checkedCheckbox = screen.getAllByRole('checkbox')[0];
    expect(checkedCheckbox).toBeChecked();
  });
});
