import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 35: Mark Done When All Subtasks Complete', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('"Break it down" button exists on Submit project proposal card', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Break it down' })).toBeInTheDocument();
  });

  test('After decomposition, subtask checklist appears', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }] }),
    } as any);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => { expect(screen.getByText('Step A')).toBeInTheDocument(); });
  });

  test('"✓ Mark as Done" does NOT appear when subtasks incomplete', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }] }),
    } as any);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => { expect(screen.getByText('Step A')).toBeInTheDocument(); });
    expect(screen.queryByRole('button', { name: /Mark as Done/i })).not.toBeInTheDocument();
  });

  test('Checking all subtasks shows completion banner', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }] }),
    } as any);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => { expect(screen.getByText('Step A')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Step A').closest('div')!);
    fireEvent.click(screen.getByText('Step B').closest('div')!);
    expect(screen.getByText(/All steps done/i)).toBeInTheDocument();
  });

  test('"✓ Mark as Done" appears when ALL subtasks checked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: [{ step: 'Step A', minutes: 10 }, { step: 'Step B', minutes: 15 }] }),
    } as any);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => { expect(screen.getByText('Step A')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Step A').closest('div')!);
    fireEvent.click(screen.getByText('Step B').closest('div')!);
    expect(screen.getByRole('button', { name: /Mark as Done/i })).toBeInTheDocument();
  });

  test('Clicking "✓ Mark as Done" removes task from To Do', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ subtasks: [{ step: 'Step A', minutes: 10 }] }),
    } as any);
    render(<App />);
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => { expect(screen.getByText('Step A')).toBeInTheDocument(); });
    fireEvent.click(screen.getByText('Step A').closest('div')!);
    fireEvent.click(screen.getByRole('button', { name: /Mark as Done/i }));
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(initialCount - 1);
  });

  test('Mark as Done source code exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('Mark as Done');
    expect(code).toContain('allStepsCompleted');
    expect(code).toContain('#0F9D58');
  });
});
