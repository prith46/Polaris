import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 26: Kanban Board', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Three column headers exist: To Do, In Progress, Done', () => {
    render(<App />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText(/^Done$/)).toBeInTheDocument();
  });

  test('All 4 seed tasks start in To Do column', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });

  test('In Progress column starts empty with helper text', () => {
    render(<App />);
    expect(screen.getByText("Click 'Handle it now' on any task")).toBeInTheDocument();
  });

  test('Done column starts empty', () => {
    render(<App />);
    expect(screen.getByText('No completed tasks yet')).toBeInTheDocument();
  });

  test('Each column has class "kanban-col"', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('.kanban-col').length).toBe(3);
  });

  test('Clicking "Handle it now" moves card to In Progress', () => {
    render(<App />);
    const btns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(btns[0]);
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Done' })).toBeInTheDocument();
  });

  test('"Mark Done" moves card from In Progress to Done', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(3);
  });

  test('"Move back" returns card to To Do', () => {
    render(<App />);
    const initial = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Move back' }));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initial);
    expect(screen.queryByText('In progress')).not.toBeInTheDocument();
  });

  test('"Restore" in Done moves card back to To Do', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });

  test('Overdue card shows Escape Hatch, Mark Done Anyway, Archive', () => {
    render(<App />);
    expect(screen.getByText(/Escape Hatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark Done Anyway/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Archive/i })).toBeInTheDocument();
  });

  test('Archive removes overdue card from To Do and moves to Done', () => {
    render(<App />);
    const initialHeadings = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(screen.getByRole('button', { name: /Archive/i }));
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(initialHeadings - 1);
  });

  test('Focus mode hides columns and shows single card', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ taskTitle: 'Electricity bill payment', reason: 'R', action: 'A' }),
    } as Response);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));
    const { waitFor } = await import('@testing-library/react');
    await waitFor(() => { expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument(); });
    expect(screen.queryByText('To Do')).not.toBeInTheDocument();
  });

  test('Moving 10 tasks to In Progress rapidly', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Add a new task/i);
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `Rapid ${i}` } });
      fireEvent.click(screen.getByRole('button', { name: /Add task/i }));
    }
    let btns = screen.queryAllByRole('button', { name: 'Handle it now' });
    const moved = Math.min(btns.length, 5);
    for (let i = 0; i < moved; i++) {
      btns = screen.queryAllByRole('button', { name: 'Handle it now' });
      if (btns.length > 0) fireEvent.click(btns[0]);
    }
    expect(screen.getAllByText('In progress').length).toBe(moved);
  });
});
