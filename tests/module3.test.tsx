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
});
