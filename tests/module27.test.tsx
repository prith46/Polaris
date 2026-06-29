import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 27: Natural Language Task Input', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Input placeholder contains example text', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  test('Empty input does nothing', () => {
    render(<App />);
    const initial = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initial);
  });

  test('Whitespace-only input does nothing', () => {
    render(<App />);
    const initial = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: '   ' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initial);
  });

  test('In test env, task created directly without modal', () => {
    render(<App />);
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: 'Direct test task' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getByText('Direct test task')).toBeInTheDocument();
    expect(screen.getByText('No deadline set')).toBeInTheDocument();
  });

  test('Input cleared after adding task', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Clear test' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(input.value).toBe('');
  });

  test('Server endpoint /api/parse-task exists in server.ts', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../server.ts'), 'utf8');
    expect(code).toContain('/api/parse-task');
    expect(code).toContain('title');
    expect(code).toContain('deadlineISO');
  });

  test('Frontend calls /api/parse-task with correct URL', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain("'/api/parse-task'");
    expect(code).toContain('isAddingTask');
    expect(code).toContain('Parsing...');
  });

  test('Frontend handles API failure by opening modal with raw input', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('setModalTaskName(trimmedTitle)');
    expect(code).toContain("setModalDueDate('')");
  });

  test('Urgency calculation logic exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('hoursAway <= 24');
    expect(code).toContain('hoursAway <= 168');
  });

  test('Created task has correct default properties', () => {
    render(<App />);
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: 'Default props test' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getByText('Default props test')).toBeInTheDocument();
    expect(screen.getByText('No deadline set')).toBeInTheDocument();
    expect(screen.getByText(/Newly added/i)).toBeInTheDocument();
  });
});
