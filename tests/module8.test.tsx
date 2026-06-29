import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 8: Task Decomposition (Break it down)', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); localStorage.setItem('polaris-onboarded', 'true');
  });

  test('"Break it down" button exists on "Submit project proposal" card in To Do column', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Break it down' })).toBeInTheDocument();
  });

  test('Clicking "Break it down" shows loading state "Breaking down..."', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    expect(screen.getByText('Breaking down...')).toBeInTheDocument();
  });

  test('Subtask checklist appears after decomposition (mock success)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }, { step: 'Step C', minutes: 20 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });
  });

  test('"SUBTASKS" header appears', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });
  });

  test('Total time display appears', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }, { step: 'Step C', minutes: 20 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('(45m)')).toBeInTheDocument();
    });
  });

  test('At least 3 subtask rows render', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }, { step: 'Step C', minutes: 20 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
      expect(screen.getByText('Step B')).toBeInTheDocument();
      expect(screen.getByText('Step C')).toBeInTheDocument();
    });
  });

  test('Each subtask row has checkbox and time estimate', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }, { step: 'Step C', minutes: 20 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('10m')).toBeInTheDocument();
      expect(screen.getByText('15m')).toBeInTheDocument();
      expect(screen.getByText('20m')).toBeInTheDocument();
    });
  });

  test('Checking a subtask marks it visually complete with line-through', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Step A').closest('div')!);
    expect(screen.getByText('Step A').className).toContain('line-through');
  });

  test('Checking all subtasks shows completion banner', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Step A').closest('div')!);
    fireEvent.click(screen.getByText('Step B').closest('div')!);

    await waitFor(() => {
      expect(screen.getByText(/All steps done/i)).toBeInTheDocument();
    });
  });

  test('Collapse chevron toggles checklist visibility', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Step A', minutes: 10 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Step A')).toBeInTheDocument();
    });

    const collapseHeader = screen.getByText('Subtasks').closest('div')!;
    fireEvent.click(collapseHeader);
    expect(screen.getByText('▶')).toBeInTheDocument();

    fireEvent.click(collapseHeader);
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  test('Fallback subtasks appear when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });
    expect(screen.getByText('Review what needs to be done')).toBeInTheDocument();
  });

  test('Subtask state persists across re-renders', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ subtasks: [{ step: 'Persist Step', minutes: 5 }] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText('Persist Step')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(document.querySelector('#tab-tasks') as HTMLButtonElement);
    expect(screen.getByText('Persist Step')).toBeInTheDocument();
  });
});
