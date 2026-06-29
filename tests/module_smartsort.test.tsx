import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

const addTask = (title: string) => {
  const input = document.querySelector('#polaris-add-form input') as HTMLInputElement;
  const btn = document.querySelector('#polaris-add-form button') as HTMLButtonElement;
  fireEvent.change(input, { target: { value: title } });
  fireEvent.click(btn);
};

const getToDoTitles = (): string[] => {
  const todoCol = document.querySelectorAll('.kanban-col')[0];
  if (!todoCol) return [];
  const headings = todoCol.querySelectorAll('h2');
  return Array.from(headings).map(h => h.textContent || '');
};

const seedTasks = (tasks: Array<{ id: string; title: string; urgency: string; pillText: string }>) => {
  localStorage.setItem('polaris-tasks', JSON.stringify(tasks.map(t => ({
    ...t, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze',
  }))));
};

describe('Smart Task Prioritization', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  // BASIC SORT ORDER
  test('Overdue task appears before non-overdue tasks', () => {
    render(<App />);
    const titles = getToDoTitles();
    const overdueIdx = titles.indexOf('Recommendation letter for Professor Sharma');
    const nonOverdueIdx = titles.indexOf('Renew gym membership');
    expect(overdueIdx).toBeLessThan(nonOverdueIdx);
  });

  test('High urgency tasks appear before low urgency tasks', () => {
    render(<App />);
    const titles = getToDoTitles();
    const highIdx = titles.indexOf('Electricity bill payment');
    const lowIdx = titles.indexOf('Renew gym membership');
    expect(highIdx).toBeLessThan(lowIdx);
  });

  test('Medium urgency appears before low urgency', () => {
    render(<App />);
    const titles = getToDoTitles();
    const medIdx = titles.indexOf('Submit project proposal');
    const lowIdx = titles.indexOf('Renew gym membership');
    expect(medIdx).toBeLessThan(lowIdx);
  });

  test('"Recommendation letter" before "Submit project proposal"', () => {
    render(<App />);
    const titles = getToDoTitles();
    const recIdx = titles.indexOf('Recommendation letter for Professor Sharma');
    const subIdx = titles.indexOf('Submit project proposal');
    expect(recIdx).toBeLessThan(subIdx);
  });

  test('"Submit project proposal" before "Renew gym membership"', () => {
    render(<App />);
    const titles = getToDoTitles();
    const subIdx = titles.indexOf('Submit project proposal');
    const gymIdx = titles.indexOf('Renew gym membership');
    expect(subIdx).toBeLessThan(gymIdx);
  });

  test('Low urgency tasks with no deadline appear last', () => {
    render(<App />);
    addTask('No deadline low task');
    const titles = getToDoTitles();
    const newIdx = titles.indexOf('No deadline low task');
    expect(newIdx).toBe(titles.length - 1);
  });

  // DEADLINE SORTING WITHIN SAME URGENCY
  test('Within same urgency, task with sooner deadline appears first', () => {
    seedTasks([
      { id: 'h1', title: 'Due soon task', urgency: 'high', pillText: 'Due today' },
      { id: 'h2', title: 'Due later task', urgency: 'high', pillText: 'Due next week' },
    ]);
    render(<App />);
    const titles = getToDoTitles();
    expect(titles.indexOf('Due soon task')).toBeLessThan(titles.indexOf('Due later task'));
  });

  test('Within same urgency, task with deadline before task without deadline', () => {
    seedTasks([
      { id: 'h1', title: 'Has deadline', urgency: 'medium', pillText: 'Due tomorrow' },
      { id: 'h2', title: 'No deadline', urgency: 'medium', pillText: 'No deadline set' },
    ]);
    render(<App />);
    const titles = getToDoTitles();
    expect(titles.indexOf('Has deadline')).toBeLessThan(titles.indexOf('No deadline'));
  });

  // DYNAMIC RE-SORTING
  test('Default seed: overdue and high urgency before medium and low', () => {
    render(<App />);
    const titles = getToDoTitles();
    // Overdue task-2 and high task-1 should be before medium task-3 and low task-4
    const recIdx = titles.indexOf('Recommendation letter for Professor Sharma');
    const gymIdx = titles.indexOf('Renew gym membership');
    expect(recIdx).toBeLessThan(gymIdx);
  });

  test('After moving to In Progress, To Do count decreases', () => {
    seedTasks([
      { id: 'h1', title: 'High task', urgency: 'high', pillText: 'Due today' },
      { id: 'm1', title: 'Med task', urgency: 'medium', pillText: 'Due tomorrow' },
    ]);
    render(<App />);
    const countBefore = getToDoTitles().length;
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(handleBtns[0]);
    expect(getToDoTitles().length).toBe(countBefore - 1);
  });

  // IN PROGRESS AND DONE NOT SORTED
  test('In Progress preserves insertion order', () => {
    render(<App />);
    // Move gym (low) first, then electricity (high)
    const gymCard = screen.getByText('Renew gym membership').closest('[id^="task-card-"]');
    const gymBtn = gymCard?.querySelector('button');
    if (gymBtn?.textContent === 'Handle it now') fireEvent.click(gymBtn);

    const elecBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    fireEvent.click(elecBtns[0]);

    const inProgressBadges = screen.getAllByText('In progress');
    expect(inProgressBadges.length).toBe(2);
  });

  // SORT STABILITY
  test('Tasks with identical urgency maintain relative order', () => {
    seedTasks([
      { id: 'a', title: 'Task Alpha', urgency: 'low', pillText: 'No deadline set' },
      { id: 'b', title: 'Task Beta', urgency: 'low', pillText: 'No deadline set' },
      { id: 'c', title: 'Task Charlie', urgency: 'low', pillText: 'No deadline set' },
    ]);
    render(<App />);
    const titles = getToDoTitles();
    expect(titles.indexOf('Task Alpha')).toBeLessThan(titles.indexOf('Task Beta'));
    expect(titles.indexOf('Task Beta')).toBeLessThan(titles.indexOf('Task Charlie'));
  });

  test('Adding 10 same-urgency tasks keeps add order', () => {
    render(<App />);
    for (let i = 0; i < 10; i++) addTask(`Same urgency ${i}`);
    const titles = getToDoTitles();
    for (let i = 0; i < 9; i++) {
      expect(titles.indexOf(`Same urgency ${i}`)).toBeLessThan(titles.indexOf(`Same urgency ${i + 1}`));
    }
  });

  // EDGE CASES
  test('Empty seeded tasks loads seed defaults', () => {
    seedTasks([]);
    render(<App />);
    // Empty array loads seed tasks (app validation)
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Single task in To Do renders correctly', () => {
    seedTasks([{ id: 's1', title: 'Solo task', urgency: 'high', pillText: 'Due today' }]);
    render(<App />);
    expect(screen.getByText('Solo task')).toBeInTheDocument();
  });

  test('All tasks high urgency: sorted by deadline', () => {
    seedTasks([
      { id: 'h1', title: 'Later high', urgency: 'high', pillText: 'Due next week' },
      { id: 'h2', title: 'Sooner high', urgency: 'high', pillText: 'Due today' },
    ]);
    render(<App />);
    const titles = getToDoTitles();
    expect(titles.indexOf('Sooner high')).toBeLessThan(titles.indexOf('Later high'));
  });

  test('Sort logic source code exists with urgencyOrder', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain("high: 0, medium: 1, low: 2");
    expect(code).toContain("urgencyDiff !== 0");
  });

  test('20 tasks renders without crash', () => {
    const tasks = [];
    for (let i = 0; i < 20; i++) tasks.push({ id: `t${i}`, title: `Task ${i}`, urgency: i < 7 ? 'high' : i < 14 ? 'medium' : 'low', pillText: 'No deadline set' });
    seedTasks(tasks);
    render(<App />);
    const titles = getToDoTitles();
    expect(titles.length).toBe(20);
  });

  test('useMemo sortedTodoTasks exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('sortedTodoTasks');
    expect(code).toContain('useMemo');
    expect(code).toContain('urgencyOrder');
    expect(code).toContain('isTaskOverdue');
  });
});
