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
    expect(code).toContain('Save note');
    expect(code).toContain('Clear note');
  });

  test('Task card is clickable (cursor-pointer class)', () => {
    const { container } = render(<App />);
    const card = container.querySelector('[id^="task-card-"]');
    expect(card?.className).toContain('cursor-pointer');
  });

  test('Clicking card body expands notes section with header', () => {
    const { container } = render(<App />);
    const card = container.querySelector('[id="task-card-task-1"]');
    fireEvent.click(card!);
    expect(screen.getByText('📝 Notes')).toBeInTheDocument();
  });

  test('Notes section shows textarea with placeholder', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textarea = screen.getByPlaceholderText(/Add a private note/i);
    expect(textarea).toBeInTheDocument();
  });

  test('Notes section shows Save note and Cancel buttons', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('Save note')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('Clicking X in notes collapses it', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('📝 Notes')).toBeInTheDocument();
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('📝 Notes')).not.toBeInTheDocument();
  });

  test('Only one card expanded at a time', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('📝 Notes')).toBeInTheDocument();

    fireEvent.click(container.querySelector('[id="task-card-task-3"]')!);
    const notesHeaders = screen.getAllByText('📝 Notes');
    expect(notesHeaders).toHaveLength(1);
  });

  test('Typing and saving note shows preview on collapsed card', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textarea = screen.getByPlaceholderText(/Add a private note/i);
    fireEvent.change(textarea, { target: { value: 'My test note content' } });
    fireEvent.click(screen.getByText('Save note'));

    expect(screen.queryByText('📝 Notes')).not.toBeInTheDocument();
    expect(screen.getByText(/📝 My test note content/)).toBeInTheDocument();
  });

  test('Note preview truncates at 60 chars', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const longNote = 'A'.repeat(80);
    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: longNote } });
    fireEvent.click(screen.getByText('Save note'));
    expect(screen.getByText(/📝 A{60}…/)).toBeInTheDocument();
  });

  test('Expanding card with existing note pre-fills textarea', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: 'Existing note' } });
    fireEvent.click(screen.getByText('Save note'));

    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const textarea = screen.getByPlaceholderText(/Add a private note/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Existing note');
  });

  test('"Clear note" button appears when note exists', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.queryByText('Clear note')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: 'Some note' } });
    fireEvent.click(screen.getByText('Save note'));

    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    expect(screen.getByText('Clear note')).toBeInTheDocument();
  });

  test('Clicking "Clear note" removes note and preview', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: 'To be cleared' } });
    fireEvent.click(screen.getByText('Save note'));
    expect(screen.getByText(/📝 To be cleared/)).toBeInTheDocument();

    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    fireEvent.click(screen.getByText('Clear note'));
    expect(screen.queryByText(/📝 To be cleared/)).not.toBeInTheDocument();
  });

  test('Cancel discards unsaved changes', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: 'Unsaved change' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(/📝 Unsaved change/)).not.toBeInTheDocument();
  });

  test('Note persists across tab switches', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: 'Persist note' } });
    fireEvent.click(screen.getByText('Save note'));

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));

    expect(screen.getByText(/📝 Persist note/)).toBeInTheDocument();
  });

  test('Note with special characters saves correctly', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('[id="task-card-task-1"]')!);
    const specialNote = '✨ Special & <chars> "quotes"';
    fireEvent.change(screen.getByPlaceholderText(/Add a private note/i), { target: { value: specialNote } });
    fireEvent.click(screen.getByText('Save note'));
    expect(screen.getByText(new RegExp(`📝 ${specialNote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 30)}`))).toBeInTheDocument();
  });

  test('Clicking buttons inside card does not toggle expand', () => {
    render(<App />);
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    expect(screen.queryByText('📝 Notes')).not.toBeInTheDocument();
  });
});
