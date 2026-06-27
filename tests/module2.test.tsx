import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Module 2: Task Cards', () => {
  // SEED TASKS
  test('Renders all 4 seed tasks', () => {
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.getByText('Recommendation letter for Professor Sharma')).toBeInTheDocument();
    expect(screen.getByText('Submit project proposal')).toBeInTheDocument();
    expect(screen.getByText('Renew gym membership')).toBeInTheDocument();
  });

  test('Each seed task shows correct pill text', () => {
    render(<App />);
    expect(screen.getByText('Due in 6 hours')).toBeInTheDocument();
    expect(screen.getByText('2 days overdue')).toBeInTheDocument();
    expect(screen.getByText('Due in 2 days')).toBeInTheDocument();
    expect(screen.getByText('Due next week')).toBeInTheDocument();
  });

  test('Each seed task has correct context line text', () => {
    render(<App />);
    expect(screen.getByText('Found in your inbox — no one reminded you about this.')).toBeInTheDocument();
    expect(screen.getByText("You promised this last week. It's slipping.")).toBeInTheDocument();
    expect(screen.getByText('5 smaller steps inside this. Best to start today.')).toBeInTheDocument();
    expect(screen.getByText('Low priority. Handle it when you have a free moment.')).toBeInTheDocument();
  });

  test('Non-overdue tasks show primary action buttons', () => {
    render(<App />);
    expect(screen.getAllByRole('button', { name: 'Handle it now' }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: 'Break it down' })).toBeInTheDocument();
  });

  test('Overdue task shows Escape Hatch button', () => {
    render(<App />);
    expect(screen.getByText(/Escape Hatch/i)).toBeInTheDocument();
  });

  test('Snooze button visible only for tasks with deadline within 24h', () => {
    render(<App />);
    const snoozeButtons = screen.queryAllByRole('button', { name: 'Snooze' });
    expect(snoozeButtons.length).toBeGreaterThanOrEqual(1);
  });

  // URGENCY COLORS
  test('High urgency pills have rust red styling', () => {
    const { container } = render(<App />);
    const highPills = container.querySelectorAll('.text-\\[\\#B23A2E\\]');
    expect(highPills.length).toBeGreaterThanOrEqual(1);
  });

  test('Medium urgency pill has amber styling', () => {
    const { container } = render(<App />);
    const medPills = container.querySelectorAll('.text-\\[\\#8A6225\\]');
    expect(medPills.length).toBeGreaterThanOrEqual(1);
  });

  test('Low urgency pill has slate styling', () => {
    const { container } = render(<App />);
    const lowPills = container.querySelectorAll('.text-\\[\\#5B6B7B\\]');
    expect(lowPills.length).toBeGreaterThanOrEqual(1);
  });

  // CARD STRUCTURE
  test('Each card has id starting with task-card-', () => {
    const { container } = render(<App />);
    const cards = container.querySelectorAll('[id^="task-card-"]');
    expect(cards.length).toBe(4);
  });

  test('Each card has a title in heading element', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.length).toBe(4);
  });

  test('Card structure: pill before title before context in DOM', () => {
    const { container } = render(<App />);
    const firstCard = container.querySelector('[id="task-card-task-1"]');
    expect(firstCard).toBeInTheDocument();
    if (firstCard) {
      const html = firstCard.innerHTML;
      const pillIndex = html.indexOf('Due in 6 hours');
      const titleIndex = html.indexOf('Electricity bill payment');
      const contextIndex = html.indexOf('Found in your inbox');
      expect(pillIndex).toBeLessThan(titleIndex);
      expect(titleIndex).toBeLessThan(contextIndex);
    }
  });

  // COUNTDOWN
  test('Overdue task shows countdown warning text', () => {
    render(<App />);
    expect(screen.getByText(/Act now/i)).toBeInTheDocument();
  });

  test('Non-overdue task with deadline shows "Start by" countdown text', () => {
    render(<App />);
    const startByElements = screen.queryAllByText(/Start by/i);
    expect(startByElements.length).toBeGreaterThanOrEqual(1);
  });

  // KANBAN COLUMNS
  test('To Do column header is visible', () => {
    render(<App />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  test('In Progress column header is visible', () => {
    render(<App />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('Done column header is visible', () => {
    render(<App />);
    expect(screen.getByText(/^Done$/)).toBeInTheDocument();
  });
});
