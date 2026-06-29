import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Search and Filter', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  // SEARCH
  test('Search input exists with placeholder', () => {
    render(<App />);
    expect(document.querySelector('#polaris-task-input')).toBeInTheDocument();
    expect((document.querySelector('#polaris-task-input') as HTMLInputElement)?.placeholder).toContain('Search');
  });

  test('Typing "electricity" filters to matching cards', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'electricity' } });
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.queryByText('Renew gym membership')).not.toBeInTheDocument();
  });

  test('Typing non-matching text shows "No tasks match"', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'xyz123notexist' } });
    expect(screen.getAllByText(/No tasks match/i).length).toBeGreaterThanOrEqual(1);
  });

  test('Clearing search shows all cards', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'electricity' } });
    expect(screen.queryByText('Renew gym membership')).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByText('Renew gym membership')).toBeInTheDocument();
  });

  test('Search is case insensitive', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'ELECTRICITY' } });
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Search matches context too', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'inbox' } });
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  // FILTER PILLS
  test('Filter pills exist: All, High, Med, Low', () => {
    render(<App />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Med')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('Clicking "Low" shows only low urgency cards', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Low'));
    expect(screen.getByText('Renew gym membership')).toBeInTheDocument();
    const todoCol = document.querySelectorAll('.kanban-col')[0];
    const headings = todoCol?.querySelectorAll('h2') || [];
    const titles = Array.from(headings).map(h => h.textContent);
    expect(titles.every(t => t === 'Renew gym membership' || !t)).toBe(true);
  });

  test('Clicking "All" restores all cards', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Low'));
    fireEvent.click(screen.getByText('All'));
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.getByText('Renew gym membership')).toBeInTheDocument();
  });

  // COMBINED
  test('Search + filter combined', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'bill' } });
    fireEvent.click(screen.getByText('High'));
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  // EDGE CASES
  test('Special characters in search — no crash', () => {
    render(<App />);
    const search = document.querySelector('#polaris-task-input') as HTMLInputElement;
    fireEvent.change(search, { target: { value: '<script>alert(1)</script>' } });
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('Rapid filter switching — no crash', () => {
    render(<App />);
    for (let i = 0; i < 20; i++) {
      fireEvent.click(screen.getByText(['All', 'High', 'Med', 'Low'][i % 4]));
    }
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('Search and filter state exist in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('searchQuery');
    expect(code).toContain('urgencyFilter');
    expect(code).toContain('filterTask');
    expect(code).toContain('isFiltering');
  });
});
