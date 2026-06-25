import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Stress Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Add 100 tasks in a loop', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `Stress Task ${i}` } });
      fireEvent.click(addButton);
    }

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount + 100);
  });

  test('Switch tabs 50 times rapidly', () => {
    render(<App />);

    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });

    for (let i = 0; i < 25; i++) {
      fireEvent.click(inboxTab);
      fireEvent.click(tasksTab);
    }

    expect(screen.getByPlaceholderText('Add a new task…')).toBeInTheDocument();
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();
  });

  test('Scan mock called 20 times in succession', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify([{ title: 'Scanned Task', deadline: 'Soon', urgency: 'low' }]) }),
    } as Response);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    // Open email
    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });

    for (let i = 0; i < 20; i++) {
      fireEvent.click(scanBtn);
      await waitFor(() => {
        expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
      });
    }

    // Go back to tasks tab and count tasks
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTab);

    const allHeadings = screen.getAllByRole('heading', { level: 2 });
    const scannedTasks = allHeadings.filter(h => h.textContent === 'Scanned Task');
    expect(scannedTasks).toHaveLength(20);
  });

  test('Delete all tasks including scanned ones', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        result: JSON.stringify([
          { title: 'Scanned Task 1', deadline: 'Soon', urgency: 'low' },
          { title: 'Scanned Task 2', deadline: 'Soon', urgency: 'low' }
        ])
      }),
    } as Response);

    render(<App />);

    // Scan first
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);
    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);
    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);
    await waitFor(() => {
      expect(screen.getByText(/✓ Found 2 deadline\(s\)/i)).toBeInTheDocument();
    });

    // Go back to tasks tab
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTab);

    // Delete all
    let doneButtons = screen.queryAllByRole('button', { name: /Done/i });
    while (doneButtons.length > 0) {
      fireEvent.click(doneButtons[0]);
      doneButtons = screen.queryAllByRole('button', { name: /Done/i });
    }

    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  });

  test('Add task with 1000 character title', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const longTitle = 'x'.repeat(1000);
    fireEvent.change(input, { target: { value: longTitle } });
    fireEvent.click(addButton);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  test('Inject script tag as task title renders as text', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const scriptTitle = '<script>alert("hack")</script>';
    fireEvent.change(input, { target: { value: scriptTitle } });
    fireEvent.click(addButton);

    const taskCardTitle = screen.getByText(scriptTitle);
    expect(taskCardTitle).toBeInTheDocument();
    expect(taskCardTitle.tagName).not.toBe('SCRIPT');
  });
});
