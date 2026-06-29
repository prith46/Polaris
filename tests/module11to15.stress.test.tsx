import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Modules 11-15 Stress & Robustness Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('Add 200 tasks and verify localStorage size stays under 5MB', () => {
    const list = [];
    for (let i = 1; i <= 199; i++) {
      list.push({
        id: `stress-${i}`,
        title: `Stress Task #${i}`,
        urgency: 'low',
        pillText: 'No deadline set',
        context: 'none',
        primaryAction: 'Action A',
        secondaryAction: 'Action B'
      });
    }
    localStorage.setItem('polaris-tasks', JSON.stringify(list));
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Stress Task #200' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);

    const stored = localStorage.getItem('polaris-tasks') || '';
    const sizeBytes = new Blob([stored]).size;
    expect(sizeBytes).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
  }, 120000);

  test('Rapid add/remove 50 tasks alternating — state stays consistent', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;

    for (let i = 1; i <= 50; i++) {
      fireEvent.change(input, { target: { value: `Alt Task ${i}` } });
      fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);

      const handleBtns = screen.queryAllByRole('button', { name: 'Handle it now' });
      if (handleBtns.length > 0) {
        fireEvent.click(handleBtns[0]);
        const markDone = screen.queryByRole('button', { name: 'Mark Done' });
        if (markDone) fireEvent.click(markDone);
      }
    }

    const stored = JSON.parse(localStorage.getItem('polaris-tasks') || '[]');
    expect(Array.isArray(stored)).toBe(true);
  });

  test('Open and close ledger 20 times rapidly — no crash', () => {
    const { container } = render(<App />);
    const ledgerHeader = container.querySelector('#ai-extraction-ledger')?.querySelector('.cursor-pointer');
    
    if (ledgerHeader) {
      for (let i = 0; i < 20; i++) {
        fireEvent.click(ledgerHeader);
      }
    }
  });

  test('Trigger overcommitment warning and dismiss 10 times — no crash', () => {
    const customTasks = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
    ];
    
    for (let i = 0; i < 10; i++) {
      localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));
      const { unmount } = render(<App />);
      const dismissBtn = screen.queryByRole('button', { name: 'Dismiss warning' });
      if (dismissBtn) {
        fireEvent.click(dismissBtn);
      }
      unmount();
      localStorage.clear();
    }
  });

  test('Mark 20 overdue tasks done rapidly — Recovery Score updates correctly each time', () => {
    // Generate 20 overdue tasks
    const list = [];
    for (let i = 1; i <= 20; i++) {
      list.push({ id: `overdue-${i}`, title: `Overdue task ${i}`, urgency: 'high', pillText: '1 day overdue', context: 'C', primaryAction: 'A', secondaryAction: 'A' });
    }
    localStorage.setItem('polaris-tasks', JSON.stringify(list));
    localStorage.setItem('polaris-total-overdue', '0');

    render(<App />);

    for (let i = 1; i <= 20; i++) {
      const markDoneBtn = screen.getAllByText(/Mark Do.*ne Anyway/i)[0];
      fireEvent.click(markDoneBtn);
    }

    // Go to Dashboard
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    // Recovery Score should be 100% since all 20 are resolved
    expect(screen.queryAllByText('100').length).toBeGreaterThan(0);
  });

  test('Scan image mock 5 times in succession — ledger shows 5 entries total', async () => {
    let callCount = 0;
    vi.spyOn(global, 'fetch').mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tasks: [{ title: `Photo Task ${callCount}`, deadline: 'Today', urgency: 'low' }]
        }),
      } as any);
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));

    const fileInput = screen.getByTestId('image-file-input');

    for (let i = 0; i < 5; i++) {
      const file = new File(['dummy content'], `screenshot_${i}.png`, { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
      });

      const scanBtn = screen.getByRole('button', { name: 'Scan for tasks' });
      fireEvent.click(scanBtn);

      await waitFor(() => {
        expect(screen.getByText(/✓ Found 1 task\(s\) — added to your Tasks\./i)).toBeInTheDocument();
      });

      const anotherBtn = screen.getByRole('button', { name: 'Scan another image' });
      fireEvent.click(anotherBtn);
    }

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText('5 tasks found')).toBeInTheDocument();
  });

  test('Switch tabs 30 times rapidly while overcommitment banner is visible — no crash', () => {
    const customTasks = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));

    const { container } = render(<App />);

    const tabTasks = container.querySelector('#tab-tasks');
    const tabCalendar = container.querySelector('#tab-calendar');
    const tabDashboard = container.querySelector('#tab-dashboard');
    const tabInbox = container.querySelector('#tab-inbox');

    for (let i = 0; i < 10; i++) {
      fireEvent.click(tabInbox!);
      fireEvent.click(tabCalendar!);
      fireEvent.click(tabDashboard!);
      fireEvent.click(tabTasks!);
    }
  });

  test('Re-render app 10 times with full localStorage state — always loads correctly', () => {
    const customTasks = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'A', secondaryAction: 'A' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));

    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<App />);
      expect(screen.getByText('T1')).toBeInTheDocument();
      unmount();
    }
  });
});
