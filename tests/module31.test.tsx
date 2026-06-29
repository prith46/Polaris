import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 31: Progress Bar on Top Bar', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('Progress bar element exists in top bar', () => {
    render(<App />);
    expect(screen.getByText(/\/.*done/)).toBeInTheDocument();
  });

  test('Shows "0/N done" when no tasks completed', () => {
    render(<App />);
    expect(screen.getByText('0/4 done')).toBeInTheDocument();
  });

  test('Shows correct fraction after marking task done', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(screen.getByText('1/4 done')).toBeInTheDocument();
  });

  test('Tooltip text exists', () => {
    render(<App />);
    expect(screen.getByText(/tasks completed this session/i)).toBeInTheDocument();
  });

  test('Updates when tasks completed and restored', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));
    expect(screen.getByText('1/4 done')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(screen.getByText('0/4 done')).toBeInTheDocument();
  });
});
