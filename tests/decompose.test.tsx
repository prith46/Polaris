import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Task Decomposition Feature', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); localStorage.setItem('polaris-onboarded', 'true');
  });

  test('Clicking Break it down button triggers loading state and renders subtask checklist (mocked API success)', async () => {
    const mockSubtasks = [
      { step: 'Step 1: Write outline', minutes: 20 },
      { step: 'Step 2: Draft introduction', minutes: 30 },
      { step: 'Step 3: Revise details', minutes: 15 }
    ];

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: mockSubtasks }),
    } as any);

    render(<App />);
    const breakDownBtn = screen.getByRole('button', { name: 'Break it down' });
    fireEvent.click(breakDownBtn);
    expect(screen.getByText('Breaking down...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Subtasks')).toBeInTheDocument();
    });

    expect(screen.getByText('(65m)')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Write outline')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Draft introduction')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Revise details')).toBeInTheDocument();

    const subtaskRow1 = screen.getByText('Step 1: Write outline');
    fireEvent.click(subtaskRow1.closest('div')!);

    const collapseHeader = screen.getByText('Subtasks').closest('div')!;
    expect(screen.getByText('▼')).toBeInTheDocument();
    fireEvent.click(collapseHeader);
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  test('All subtasks checked triggers card completion decorations and green banner', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 10 }] }),
    } as any);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));

    await waitFor(() => { expect(screen.getByText('Step A')).toBeInTheDocument(); });

    expect(screen.queryByText(/All steps done/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Step A').closest('div')!);
    fireEvent.click(screen.getByText('Step B').closest('div')!);

    expect(screen.getByText(/All steps done/i)).toBeInTheDocument();
  });

  test('Decomposition API failure falls back gracefully to hardcoded subtasks', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));

    await waitFor(() => { expect(screen.getByText('Subtasks')).toBeInTheDocument(); });

    expect(screen.getByText('(90m)')).toBeInTheDocument();
    expect(screen.getByText('Review what needs to be done')).toBeInTheDocument();
    expect(screen.getByText('Gather required materials')).toBeInTheDocument();
    expect(screen.getByText('Complete the main work')).toBeInTheDocument();
  });
});
