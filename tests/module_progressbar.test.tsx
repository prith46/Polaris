import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Progress Bar', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('Progress bar shows "0/4 done" initially', () => {
    render(<App />);
    expect(screen.getByText('0/4 done')).toBeInTheDocument();
  });

  test('Shows correct fraction after marking task done', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(screen.getByText('1/4 done')).toBeInTheDocument();
  });

  test('Updates when Restored from Done', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(screen.getByText('1/4 done')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(screen.getByText('0/4 done')).toBeInTheDocument();
  });

  test('Tooltip text exists', () => {
    render(<App />);
    expect(screen.getByText(/tasks completed this session/i)).toBeInTheDocument();
  });

  test('0 total tasks renders without crash', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText(/\/.*done/)).toBeInTheDocument();
  });

  test('Progress bar structure exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('completedTasks.length');
    expect(code).toContain('done');
    expect(code).toContain('fillColor');
    expect(code).toContain('tasks completed this session');
  });
});
