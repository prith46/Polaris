import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 8: Task Decomposition (Break it down)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('"Break it down" button exists on "Submit project proposal" card', () => {
    render(<App />);
    // "Submit project proposal" is the 3rd seed task, which has 'Break it down' primary action
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    expect(breakDownBtn).toBeInTheDocument();
  });

  test('Clicking "Break it down" shows loading state "Breaking down..."', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);
    expect(screen.getByText('Breaking down...')).toBeInTheDocument();
  });

  test('Subtask checklist appears after decomposition', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 },
      { step: 'Step C', minutes: 20 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });
  });

  test('"SUBTASKS" header appears', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 },
      { step: 'Step C', minutes: 20 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });
  });

  test('Total time display appears (e.g. "45 min total")', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 },
      { step: 'Step C', minutes: 20 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('(45 min total)')).toBeInTheDocument();
    });
  });

  test('At least 3 subtask rows render', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 },
      { step: 'Step C', minutes: 20 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
      expect(screen.getByText('Step B')).toBeInTheDocument();
      expect(screen.getByText('Step C')).toBeInTheDocument();
    });
  });

  test('Each subtask row has a checkbox and time estimate', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 },
      { step: 'Step C', minutes: 20 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('10m')).toBeInTheDocument();
      expect(screen.getByText('15m')).toBeInTheDocument();
      expect(screen.getByText('20m')).toBeInTheDocument();
    });
  });

  test('Checking a subtask marks it visually complete', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 },
      { step: 'Step C', minutes: 20 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    const rowA = screen.getByText('Step A');
    fireEvent.click(rowA.closest('div')!);
    
    // Checked items have line-through - line-through text decoration or className text-[#5B6B7B]/50
    // Let's verify style/className
    const element = screen.getByText('Step A');
    expect(element.className).toContain('line-through');
  });

  test('Checking all subtasks shows completion banner', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 },
      { step: 'Step B', minutes: 15 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Step A').closest('div')!);
    fireEvent.click(screen.getByText('Step B').closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('✓ All steps done — ready to mark complete?')).toBeInTheDocument();
    });
  });

  test('Collapse chevron toggles checklist visibility', async () => {
    const mockSubtasks = [
      { step: 'Step A', minutes: 10 }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: mockSubtasks }),
    } as Response);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    const collapseHeader = screen.getByText('Subtasks').closest('div')!;
    // Click header to collapse
    fireEvent.click(collapseHeader);
    expect(screen.getByText('▶')).toBeInTheDocument();

    // Click again to expand
    fireEvent.click(collapseHeader);
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  test('Fallback subtasks appear when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);

    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });

    expect(screen.getByText('Review what needs to be done')).toBeInTheDocument();
  });
});
