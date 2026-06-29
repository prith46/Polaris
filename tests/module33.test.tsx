import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 33: Calendar Slide-in Side Panel', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Calendar renders with day cells', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(container.querySelectorAll('.calendar-cell').length).toBeGreaterThan(28);
  });

  test('Clicking a date cell opens side panel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    const panelHeader = screen.getAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'));
    expect(panelHeader).toBeTruthy();
  });

  test('Side panel has X close button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    const closeBtn = screen.getAllByText('✕').find(el => el.closest('[class*="fixed"]'));
    expect(closeBtn).toBeTruthy();
  });

  test('X button closes the panel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    const closeBtn = screen.getAllByText('✕').find(el => el.closest('[class*="fixed"]'));
    fireEvent.click(closeBtn!);
    const panelAfter = screen.queryAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'));
    expect(panelAfter).toBeUndefined();
  });

  test('Multiple date clicks update panel content', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const cells = document.querySelectorAll('.calendar-cell');
    fireEvent.click(cells[0]);
    expect(screen.getAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'))).toBeTruthy();
    fireEvent.click(cells[5]);
    expect(screen.getAllByText(/Tasks on/i).find(el => el.closest('[class*="fixed"]'))).toBeTruthy();
  });
});
