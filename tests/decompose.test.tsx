import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Task Decomposition Feature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Clicking Break it down button triggers loading state and renders subtask checklist (mocked API success)', async () => {
    const mockSubtasks = [
      { step: 'Step 1: Write outline', minutes: 20 },
      { step: 'Step 2: Draft introduction', minutes: 30 },
      { step: 'Step 3: Revise details', minutes: 15 }
    ];

    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ subtasks: mockSubtasks }),
      } as any)
    );

    render(<App />);

    // task-3: "Submit project proposal", primaryAction: "Break it down"
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    expect(breakDownBtn).toBeInTheDocument();

    fireEvent.click(breakDownBtn);

    // Should show loading text "Breaking down..."
    expect(screen.getByText('Breaking down...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });

    // Check header time sum: 20 + 30 + 15 = 65
    expect(screen.getByText('(65 min total)')).toBeInTheDocument();

    // Verify subtasks are rendered
    expect(screen.getByText('Step 1: Write outline')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Draft introduction')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Revise details')).toBeInTheDocument();

    // Toggle a checkbox
    const subtaskRow1 = screen.getByText('Step 1: Write outline');
    fireEvent.click(subtaskRow1.closest('div')!);

    // Toggle collapse
    const collapseHeader = screen.getByText('Subtasks').closest('div')!;
    // Should show chevron point down initially (▼)
    expect(screen.getByText('▼')).toBeInTheDocument();
    
    // Click header to collapse
    fireEvent.click(collapseHeader);
    expect(screen.getByText('▶')).toBeInTheDocument();

    mockFetch.mockRestore();
  });

  test('All subtasks checked triggers card completion decorations and green banner', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 10 }
    ];

    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ subtasks: mockSubtasks }),
      } as any)
    );

    render(<App />);

    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    // Both unchecked initially. Verify no banner.
    expect(screen.queryByText(/✓ All steps done/i)).not.toBeInTheDocument();

    // Check first subtask
    const rowA = screen.getByText('Step A');
    fireEvent.click(rowA.closest('div')!);

    // Check second subtask
    const rowB = screen.getByText('Step B');
    fireEvent.click(rowB.closest('div')!);

    // Now both should be checked. Verify green banner is visible.
    expect(screen.getByText('✓ All steps done — ready to mark complete?')).toBeInTheDocument();

    mockFetch.mockRestore();
  });

  test('Decomposition API failure falls back gracefully to hardcoded subtasks', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<App />);

    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });

    // Fallback has 5 subtasks: sum = 10 + 15 + 45 + 15 + 5 = 90
    expect(screen.getByText('(90 min total)')).toBeInTheDocument();
    expect(screen.getByText('Review what needs to be done')).toBeInTheDocument();
    expect(screen.getByText('Gather required materials')).toBeInTheDocument();
    expect(screen.getByText('Complete the main work')).toBeInTheDocument();

    mockFetch.mockRestore();
  });
});
