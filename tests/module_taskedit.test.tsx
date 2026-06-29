import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Task Edit + Notes Unified Panel', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('Task card has cursor pointer style', () => {
    const { container } = render(<App />);
    const card = container.querySelector('[id^="task-card-"]');
    expect(card?.className).toContain('cursor-pointer');
  });

  test('Clicking card expands panel with edit and notes headers', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    expect(screen.getByText('📝 Notes')).toBeInTheDocument();
  });

  test('Only one card expanded at a time', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getAllByText('✏️ Edit Task')).toHaveLength(1);
    fireEvent.click(container.querySelector('[id="task-card-task-3"]')!);
    expect(screen.getAllByText('✏️ Edit Task')).toHaveLength(1);
  });

  test('Task name input pre-filled with current title', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const inputs = container.querySelectorAll('[id="task-card-task-1"] input[type="text"]');
    const nameInput = inputs[0] as HTMLInputElement;
    expect(nameInput?.value).toBe('Electricity bill payment');
  });

  test('Description textarea pre-filled with context', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    const descTextarea = textareas[0] as HTMLTextAreaElement;
    expect(descTextarea?.value).toContain('Found in your inbox');
  });

  test('Clicking Save collapses card', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    const saveBtn = screen.getAllByText('Save').find(b => b.closest('[id="task-card-task-1"]'));
    if (saveBtn) fireEvent.click(saveBtn);
    expect(screen.queryByText('✏️ Edit Task')).not.toBeInTheDocument();
  });

  test('Clicking Cancel collapses card without saving changes', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const nameInput = container.querySelector('[id="task-card-task-1"] input[type="text"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Changed name' } });
    const cancelBtn = screen.getAllByText('Cancel').find(b => b.closest('[id="task-card-task-1"]'));
    if (cancelBtn) fireEvent.click(cancelBtn);
    expect(screen.queryByText('✏️ Edit Task')).not.toBeInTheDocument();
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Save with empty name keeps original', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const nameInput = container.querySelector('[id="task-card-task-1"] input[type="text"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });
    const saveBtn = screen.getAllByText('Save').find(b => b.closest('[id="task-card-task-1"]'));
    if (saveBtn) fireEvent.click(saveBtn);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Saving note shows preview on collapsed card', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    const noteTextarea = textareas[1] as HTMLTextAreaElement;
    fireEvent.change(noteTextarea, { target: { value: 'My test note' } });
    const saveBtn = screen.getAllByText('Save').find(b => b.closest('[id="task-card-task-1"]'));
    if (saveBtn) fireEvent.click(saveBtn);
    expect(screen.getByText(/📝 My test note/)).toBeInTheDocument();
  });

  test('Clicking buttons inside card does NOT trigger expand', () => {
    render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    expect(screen.queryByText('✏️ Edit Task')).not.toBeInTheDocument();
  });

  test('Source code has edit-related functions', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('handleSaveTaskEdit');
    expect(code).toContain('editTaskName');
    expect(code).toContain('editTaskDate');
    expect(code).toContain('editTaskDescription');
    expect(code).toContain('closeExpandedTask');
  });
});
