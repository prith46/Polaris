import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 32: Confetti on All Tasks Complete', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Confetti state exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('confettiShown');
    expect(code).toContain('triggerConfetti');
    expect(code).toContain('confettiToast');
  });

  test('Confetti does NOT trigger on initial load', () => {
    render(<App />);
    expect(screen.queryByText(/All tasks complete/i)).not.toBeInTheDocument();
  });

  test('Confetti does NOT trigger when tasks remain', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(screen.queryByText(/All tasks complete/i)).not.toBeInTheDocument();
  });

  test('confettiShown prevents duplicate trigger', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('!confettiShown');
    expect(code).toContain('setConfettiShown(true)');
  });

  test('Demo reset resets confettiShown', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('setConfettiShown(false)');
  });

  test('Confetti does not trigger with empty localStorage', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([]));
    render(<App />);
    expect(screen.queryByText(/All tasks complete/i)).not.toBeInTheDocument();
  });
});
