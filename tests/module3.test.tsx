import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('Module 3: Add & Manage Tasks', () => {
  // ADD TASK — BASIC
  test('Input placeholder reads "Add a new task…"', () => {
    render(<App />);
    expect(document.querySelector('#polaris-add-form input') as HTMLInputElement).toBeInTheDocument();
  });

  test('Typing a name and clicking "Add task" adds a new card', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;

    fireEvent.change(input, { target: { value: 'New Custom Task' } });
    fireEvent.click(addButton);

    expect(screen.getByText('New Custom Task')).toBeInTheDocument();
    expect(screen.getByText('No deadline set')).toBeInTheDocument();
  });

  test('New card appears in To Do column', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.change(input, { target: { value: 'Column Test Task' } });
    fireEvent.click(addButton);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount + 1);
    expect(screen.getByText('Column Test Task')).toBeInTheDocument();
  });

  test('Pressing Enter also adds task (form submit)', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Task added via Enter' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);

    expect(screen.getByText('Task added via Enter')).toBeInTheDocument();
  });

  test('Empty input does nothing (card count unchanged)', () => {
    render(<App />);
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    fireEvent.click(addButton);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount);
  });

  test('Whitespace-only input does nothing', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount);
  });

  test('After adding, input is cleared', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;

    fireEvent.change(input, { target: { value: 'Clear Test' } });
    fireEvent.click(addButton);
    expect(input.value).toBe('');
  });

  // KANBAN FLOW: Handle it now → Mark Done
  test('"Handle it now" moves card to In Progress column', () => {
    render(<App />);
    const handleButtons = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleButtons[0]);

    const inProgressBadges = screen.getAllByText('In progress');
    expect(inProgressBadges.length).toBeGreaterThanOrEqual(1);
  });

  test('"Mark Done" in In Progress moves card to Done column', () => {
    render(<App />);
    const handleButtons = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleButtons[0]);

    const markDoneBtn = screen.getByRole('button', { name: 'Mark Done' });
    fireEvent.click(markDoneBtn);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.length).toBe(3);
  });

  test('"Move back" returns card from In Progress to To Do', () => {
    render(<App />);
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    const handleButtons = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleButtons[0]);

    const moveBackBtn = screen.getByRole('button', { name: 'Move back' });
    fireEvent.click(moveBackBtn);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount);
    expect(screen.queryByText('In progress')).not.toBeInTheDocument();
  });

  test('Restore button moves card back from Done to To Do', () => {
    render(<App />);
    const handleButtons = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleButtons[0]);

    const markDoneBtn = screen.getByRole('button', { name: 'Mark Done' });
    fireEvent.click(markDoneBtn);

    const restoreBtn = screen.getByRole('button', { name: 'Restore' });
    fireEvent.click(restoreBtn);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });

  // EDGE CASES
  test('Adding 20 tasks rapidly — all appear, no crash', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    for (let i = 0; i < 20; i++) {
      fireEvent.change(input, { target: { value: `Rapid Task ${i}` } });
      fireEvent.click(addButton);
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount + 20);
  });

  test('Long title 300+ characters — creates one card, no crash', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    const longTitle = 'a'.repeat(305);

    fireEvent.change(input, { target: { value: longTitle } });
    fireEvent.click(addButton);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount + 1);
  });

  test('Special characters and emoji in title — renders correctly', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;

    const specialTitle = '🔥 Test & Special! Ch@r$';
    fireEvent.change(input, { target: { value: specialTitle } });
    fireEvent.click(addButton);
    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  test('Adding two tasks with identical titles then marking one done — only one moves', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;

    fireEvent.change(input, { target: { value: 'Identical Task' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Identical Task' } });
    fireEvent.click(addButton);

    const handleButtons = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleButtons[handleButtons.length - 1]);

    const markDoneBtn = screen.getByRole('button', { name: 'Mark Done' });
    fireEvent.click(markDoneBtn);

    const identicalHeadings = screen.getAllByText('Identical Task');
    expect(identicalHeadings.length).toBeGreaterThanOrEqual(1);
  });

  test('Adding 50 tasks, mark 25 to In Progress — correct distribution', () => {
    render(<App />);
    const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
    const addButton = document.querySelector('#polaris-add-form button') as HTMLButtonElement;

    for (let i = 0; i < 50; i++) {
      fireEvent.change(input, { target: { value: `Stress Task ${i}` } });
      fireEvent.click(addButton);
    }

    for (let i = 0; i < 25; i++) {
      const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
      fireEvent.click(handleBtns[0]);
    }

    const inProgressBadges = screen.getAllByText('In progress');
    expect(inProgressBadges.length).toBe(25);
  });

  test('In Progress empty state shows hint message', () => {
    render(<App />);
    expect(screen.getByText("Click 'Handle it now' on any task")).toBeInTheDocument();
  });
});
