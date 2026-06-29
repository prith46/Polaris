import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Dark/Light Mode Toggle', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Theme toggle button exists', () => {
    render(<App />);
    const btn = screen.queryByText('🌙') || screen.queryByText('☀️');
    expect(btn).toBeInTheDocument();
  });

  test('Default is light mode (🌙 shown)', () => {
    render(<App />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  test('Clicking toggle saves dark to localStorage', () => {
    render(<App />);
    fireEvent.click(screen.getByText('🌙'));
    expect(localStorage.getItem('polaris-theme')).toBe('dark');
  });

  test('Clicking twice returns to light', () => {
    render(<App />);
    fireEvent.click(screen.getByText('🌙'));
    fireEvent.click(screen.getByText('☀️'));
    expect(localStorage.getItem('polaris-theme')).toBe('light');
  });

  test('Dark from localStorage shows ☀️ on render', () => {
    localStorage.setItem('polaris-theme', 'dark');
    render(<App />);
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  test('Light from localStorage shows 🌙', () => {
    localStorage.setItem('polaris-theme', 'light');
    render(<App />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  test('Toggle 10 times without crashing', () => {
    render(<App />);
    for (let i = 0; i < 10; i++) {
      const btn = screen.queryByText('🌙') || screen.queryByText('☀️');
      if (btn) fireEvent.click(btn);
    }
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('App renders all tabs in dark mode', () => {
    localStorage.setItem('polaris-theme', 'dark');
    render(<App />);
    ['Tasks', 'Calendar', 'Dashboard', 'Inbox'].forEach(tab => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(tab, 'i') }));
    });
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('No console errors in dark mode', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('polaris-theme', 'dark');
    render(<App />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('isDarkMode and classList.toggle exist in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('isDarkMode');
    expect(code).toContain('polaris-theme');
    expect(code).toContain("classList.toggle('dark'");
  });
});
