import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('Module 3: Add & Manage Tasks', () => {
  test('Input placeholder reads "Add a new task…"', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Add a new task…')).toBeInTheDocument();
  });

  test('Typing a name and clicking "Add task" adds a new card at bottom', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    fireEvent.change(input, { target: { value: 'New Custom Task' } });
    fireEvent.click(addButton);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[headings.length - 1]).toHaveTextContent('New Custom Task');

    expect(screen.getByText('No deadline set')).toBeInTheDocument();
    expect(screen.getByText('Newly added. Details can be set later.')).toBeInTheDocument();
  });

  test('Pressing Enter also adds task', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');

    fireEvent.change(input, { target: { value: 'Task added via Enter' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    // Since it's a form submit:
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[headings.length - 1]).toHaveTextContent('Task added via Enter');
  });

  test('Empty input does nothing (card count unchanged)', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount);

    fireEvent.click(addButton);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount);
  });

  test('Whitespace-only input ("   ") does nothing', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount);
  });

  test('Clicking "Done" on a card removes it', () => {
    render(<App />);

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    const doneButtons = screen.getAllByRole('button', { name: /Done/i });
    fireEvent.click(doneButtons[3]);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount - 1);
    expect(screen.queryByText('Renew gym membership')).not.toBeInTheDocument();
  });

  test('Clicking "Done" on correct card when two identical titles exist — only one removed', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    // Add two identical tasks
    fireEvent.change(input, { target: { value: 'Identical Task' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Identical Task' } });
    fireEvent.click(addButton);

    const initialHeadings = screen.getAllByRole('heading', { level: 2 });
    const count = initialHeadings.length;

    // Find all Done buttons
    const doneButtons = screen.getAllByRole('button', { name: /Done/i });
    
    // Click Done on the last card
    fireEvent.click(doneButtons[doneButtons.length - 1]);

    const remainingHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(remainingHeadings).toHaveLength(count - 1);
    
    const matched = remainingHeadings.filter(h => h.textContent === 'Identical Task');
    expect(matched).toHaveLength(1);
  });

  test('Adding 20 tasks rapidly — all 20 appear, no crash', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    for (let i = 0; i < 20; i++) {
      fireEvent.change(input, { target: { value: `Rapid Task ${i}` } });
      fireEvent.click(addButton);
    }

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount + 20);
  });

  test('Long title 300+ characters — creates one card, no crash', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    const longTitle = 'a'.repeat(305);

    fireEvent.change(input, { target: { value: longTitle } });
    fireEvent.click(addButton);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(initialCount + 1);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  test('Special characters and emoji in title — renders as text, no crash', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const specialTitle = '🔥 Test & Specia! Ch@r$; <=>?/ \\"\'';
    fireEvent.change(input, { target: { value: specialTitle } });
    fireEvent.click(addButton);

    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  test('Delete all 4 seed tasks — list is empty, no crash', () => {
    render(<App />);

    let doneButtons = screen.queryAllByRole('button', { name: /Done/i });
    while (doneButtons.length > 0) {
      fireEvent.click(doneButtons[0]);
      doneButtons = screen.queryAllByRole('button', { name: /Done/i });
    }

    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  });

  test('Adding 50 tasks in sequence — all appear, no duplicates', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;

    for (let i = 0; i < 50; i++) {
      fireEvent.change(input, { target: { value: `Sequenced Task ${i}` } });
      fireEvent.click(addButton);
    }

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(initialCount + 50);

    // Verify all 50 unique tasks are present
    for (let i = 0; i < 50; i++) {
      expect(screen.getByText(`Sequenced Task ${i}`)).toBeInTheDocument();
    }
  });

  test('Done button removes exactly the right card by index when titles are identical', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    // Add three identical tasks with distinct internal or date identifiers if any, or just check the text/DOM list
    // Wait, let's add three tasks: "Duplicate Task", "Duplicate Task", "Duplicate Task"
    fireEvent.change(input, { target: { value: 'Duplicate Task' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Duplicate Task' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Duplicate Task' } });
    fireEvent.click(addButton);

    // Let's check card contexts or headings list
    const headingsBefore = screen.getAllByRole('heading', { level: 2 });
    const countBefore = headingsBefore.length;

    // Find the Done buttons specifically for "Duplicate Task"
    // Since we know the index: they are added at the end
    const doneButtons = screen.getAllByRole('button', { name: /Done/i });
    
    // Click Done on the second "Duplicate Task" (which is index doneButtons.length - 2)
    fireEvent.click(doneButtons[doneButtons.length - 2]);

    const headingsAfter = screen.getAllByRole('heading', { level: 2 });
    expect(headingsAfter).toHaveLength(countBefore - 1);
    
    const matched = headingsAfter.filter(h => h.textContent === 'Duplicate Task');
    expect(matched).toHaveLength(2);
  });

  test('After removing all tasks, adding a new one works correctly', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Add a new task…');
    const addButton = screen.getByRole('button', { name: /Add task/i });

    // Remove all tasks first
    let doneButtons = screen.queryAllByRole('button', { name: /Done/i });
    while (doneButtons.length > 0) {
      fireEvent.click(doneButtons[0]);
      doneButtons = screen.queryAllByRole('button', { name: /Done/i });
    }

    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);

    // Add a new task
    fireEvent.change(input, { target: { value: 'Post-Empty Task' } });
    fireEvent.click(addButton);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Post-Empty Task');
  });
});
