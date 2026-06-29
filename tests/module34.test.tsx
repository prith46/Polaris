import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 34: Dark/Light Mode Toggle', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('Theme toggle button exists in top bar', () => {
    render(<App />);
    const toggles = screen.getAllByRole('button').filter(b => b.textContent === '🌙' || b.textContent === '☀️');
    expect(toggles.length).toBeGreaterThanOrEqual(1);
  });

  test('Button shows 🌙 in light mode', () => {
    render(<App />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  test('Clicking toggle saves dark to localStorage', () => {
    render(<App />);
    fireEvent.click(screen.getByText('🌙'));
    expect(localStorage.getItem('polaris-theme')).toBe('dark');
  });

  test('Clicking toggle twice returns to light', () => {
    render(<App />);
    fireEvent.click(screen.getByText('🌙'));
    fireEvent.click(screen.getByText('☀️'));
    expect(localStorage.getItem('polaris-theme')).toBe('light');
  });

  test('Dark mode from localStorage loads on re-render', () => {
    localStorage.setItem('polaris-theme', 'dark');
    render(<App />);
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  test('Light mode from localStorage loads on re-render', () => {
    localStorage.setItem('polaris-theme', 'light');
    render(<App />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  test('Toggle works multiple times without crashing', () => {
    render(<App />);
    for (let i = 0; i < 10; i++) {
      const btn = screen.queryByText('🌙') || screen.queryByText('☀️');
      if (btn) fireEvent.click(btn);
    }
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('isDarkMode state and useEffect exist in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('isDarkMode');
    expect(code).toContain('polaris-theme');
    expect(code).toContain("classList.toggle('dark'");
  });
});
