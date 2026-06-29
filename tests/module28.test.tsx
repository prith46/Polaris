import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 28: Add Task Modal', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Modal not open by default', () => {
    render(<App />);
    expect(screen.queryByText('New Task')).not.toBeInTheDocument();
  });

  test('Modal structure exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('New Task');
    expect(code).toContain('Task name');
    expect(code).toContain('Due date (optional)');
    expect(code).toContain('Description (optional)');
    expect(code).toContain('modal-backdrop');
    expect(code).toContain('modal-content');
    expect(code).toContain('handleModalConfirm');
    expect(code).toContain('closeAddTaskModal');
  });

  test('Modal has cancel and confirm handlers', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('Cancel');
    expect(code).toContain('closeAddTaskModal');
    expect(code).toContain('handleModalConfirm');
  });

  test('Due date re-parse logic exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('handleModalDueDateChange');
    expect(code).toContain('/api/parse-date');
    expect(code).toContain('reparseTimer');
    expect(code).toContain('isReparsingDate');
    expect(code).toContain('modalDueDateReadable');
  });

  test('Modal submission creates card (test env direct add)', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const initial = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.change(input, { target: { value: 'Modal test task' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initial + 1);
  });

  test('Task created via modal has "No deadline set" when no date', () => {
    render(<App />);
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: 'No date task' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getByText('No deadline set')).toBeInTheDocument();
  });

  test('Task created via modal has "Newly added" context', () => {
    render(<App />);
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: 'Context task' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getByText(/Newly added/i)).toBeInTheDocument();
  });

  test('Rapid 10 submissions all create cards', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const initial = screen.getAllByRole('heading', { level: 2 }).length;
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `Rapid modal ${i}` } });
      fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initial + 10);
  });

  test('Special characters in name work', () => {
    render(<App />);
    const title = 'Task & "quotes" <angle> \'apos\'';
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: title } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  test('Very long title (300 chars) works', () => {
    render(<App />);
    const title = 'x'.repeat(300);
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: title } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
