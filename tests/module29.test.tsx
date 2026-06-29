import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 29: Task Notes', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  test('Notes feature state exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('expandedTaskId');
    expect(code).toContain('noteEditValue');
    expect(code).toContain('📝 Notes');
    expect(code).toContain('Save');
    expect(code).toContain('Clear note');
  });

  test('Task card is clickable', () => {
    const { container } = render(<App />);
    const card = container.querySelector('[id^="task-card-"]');
    expect(card?.className).toContain('cursor-pointer');
  });

  test('Clicking card shows edit and notes headers', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    expect(screen.getByText('📝 Notes')).toBeInTheDocument();
  });

  test('Notes textarea has placeholder', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    const noteTextarea = textareas[1] as HTMLTextAreaElement;
    expect(noteTextarea?.placeholder).toContain('note');
  });

  test('Unified Save and Cancel buttons exist', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const card = container.querySelector('[id="task-card-task-1"]');
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    const cancelBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Cancel');
    expect(saveBtn).toBeTruthy();
    expect(cancelBtn).toBeTruthy();
  });

  test('Only one card expanded at a time', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getAllByText('📝 Notes')).toHaveLength(1);
    fireEvent.click(container.querySelector('[id="task-card-task-3"]')!);
    expect(screen.getAllByText('📝 Notes')).toHaveLength(1);
  });

  test('Saving note shows preview on collapsed card', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    const noteTextarea = textareas[1] as HTMLTextAreaElement;
    fireEvent.change(noteTextarea, { target: { value: 'My test note content' } });
    const card = container.querySelector('[id="task-card-task-1"]');
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    fireEvent.click(saveBtn!);
    expect(screen.getByText(/📝 My test note content/)).toBeInTheDocument();
  });

  test('Note preview truncates at 60 chars', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const longNote = 'A'.repeat(80);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    fireEvent.change(textareas[1], { target: { value: longNote } });
    const card = container.querySelector('[id="task-card-task-1"]');
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    fireEvent.click(saveBtn!);
    expect(screen.getByText(/📝 A{60}…/)).toBeInTheDocument();
  });

  test('Expanding card with existing note pre-fills textarea', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    fireEvent.change(textareas[1], { target: { value: 'Existing note' } });
    const card = container.querySelector('[id="task-card-task-1"]');
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    fireEvent.click(saveBtn!);

    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas2 = container.querySelectorAll('[id="task-card-task-1"] textarea');
    expect((textareas2[1] as HTMLTextAreaElement).value).toBe('Existing note');
  });

  test('"Clear note" button appears when note exists', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    let card = container.querySelector('[id="task-card-task-1"]');
    expect(Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Clear note')).toBeFalsy();

    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    fireEvent.change(textareas[1], { target: { value: 'Some note' } });
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    fireEvent.click(saveBtn!);

    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    card = container.querySelector('[id="task-card-task-1"]');
    expect(Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Clear note'))).toBeTruthy();
  });

  test('"Clear note" removes note preview', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    fireEvent.change(textareas[1], { target: { value: 'To be cleared' } });
    let card = container.querySelector('[id="task-card-task-1"]');
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    fireEvent.click(saveBtn!);
    expect(screen.getByText(/📝 To be cleared/)).toBeInTheDocument();

    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    card = container.querySelector('[id="task-card-task-1"]');
    const clearBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Clear note'));
    fireEvent.click(clearBtn!);
    // Clear note doesn't collapse, just clears
    const cancelBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Cancel');
    fireEvent.click(cancelBtn!);
    expect(screen.queryByText(/📝 To be cleared/)).not.toBeInTheDocument();
  });

  test('Cancel discards unsaved changes', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    fireEvent.change(textareas[1], { target: { value: 'Unsaved' } });
    const card = container.querySelector('[id="task-card-task-1"]');
    const cancelBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Cancel');
    fireEvent.click(cancelBtn!);
    expect(screen.queryByText(/📝 Unsaved/)).not.toBeInTheDocument();
  });

  test('Note persists across tab switches', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textareas = container.querySelectorAll('[id="task-card-task-1"] textarea');
    fireEvent.change(textareas[1], { target: { value: 'Persist note' } });
    const card = container.querySelector('[id="task-card-task-1"]');
    const saveBtn = Array.from(card?.querySelectorAll('button') || []).find(b => b.textContent === 'Save');
    fireEvent.click(saveBtn!);

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText(/📝 Persist note/)).toBeInTheDocument();
  });

  test('Clicking buttons inside card does not trigger expand', () => {
    render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    expect(screen.queryByText('📝 Notes')).not.toBeInTheDocument();
  });
});
