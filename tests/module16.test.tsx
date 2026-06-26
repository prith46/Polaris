import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

type StoredTask = {
  id: string;
  title: string;
  urgency: 'high' | 'medium' | 'low';
  pillText: string;
  context: string;
  primaryAction: string;
  secondaryAction: string;
};

const buildTask = (
  id: string,
  title: string,
  urgency: StoredTask['urgency'],
  pillText = 'Due today'
): StoredTask => ({
  id,
  title,
  urgency,
  pillText,
  context: `Context for ${title}`,
  primaryAction: 'Handle it now',
  secondaryAction: 'Snooze',
});

const seedTasks = (tasks: StoredTask[]) => {
  localStorage.setItem('polaris-tasks', JSON.stringify(tasks));
};

const openFutureYou = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Show me next week →' }));
};

const expectTasksView = () => {
  expect(screen.getByRole('button', { name: 'Show me next week →' })).toBeInTheDocument();
  expect(screen.queryByText('Next Week')).not.toBeInTheDocument();
};

describe('Module 16: Future You', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('TRIGGER: opens Future You from Tasks and returns via back link', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Show me next week →' })).toBeInTheDocument();

    openFutureYou();

    expect(screen.queryByText("I'm overwhelmed — what do I do RIGHT NOW?")).not.toBeInTheDocument();
    expect(screen.getByText('Next Week')).toBeInTheDocument();
    expect(screen.getByText('Two paths. Same starting point.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Back to tasks' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '← Back to tasks' }));

    expectTasksView();
    expect(screen.getByText("I'm overwhelmed — what do I do RIGHT NOW?")).toBeInTheDocument();
  });

  test('LEFT LANE: shows all high urgency tasks, strikethroughs, consequences, and correct summary', () => {
    seedTasks([
      buildTask('bill', 'Electricity bill payment', 'high'),
      buildTask('letter', 'Recommendation letter for Professor Sharma', 'high'),
      buildTask('default', 'Call landlord about lease renewal', 'high'),
      buildTask('medium', 'Submit project proposal', 'medium', 'Due in 2 days'),
    ]);

    const { container } = render(<App />);
    openFutureYou();

    expect(screen.getByText('If you ignore this')).toBeInTheDocument();
    expect(screen.getByText('3 commitments broken')).toBeInTheDocument();
    expect(screen.getByText('Late fee + possible service interruption')).toBeInTheDocument();
    expect(screen.getByText('Relationship damaged — hard to recover')).toBeInTheDocument();
    expect(screen.getByText('Commitment broken — trust eroded')).toBeInTheDocument();

    ['Electricity bill payment', 'Recommendation letter for Professor Sharma', 'Call landlord about lease renewal'].forEach((title) => {
      const titleNode = screen.getByText(title);
      expect(titleNode).toBeInTheDocument();
      expect(titleNode).toHaveStyle({ textDecoration: 'line-through' });
    });

    const leftLane = screen.getByText('If you ignore this').parentElement;
    expect(leftLane?.textContent).toContain('Electricity bill payment');
    expect(leftLane?.textContent).toContain('Recommendation letter for Professor Sharma');
    expect(leftLane?.textContent).toContain('Call landlord about lease renewal');
    expect(container.querySelector('#future-you-screen')).toBeInTheDocument();
  });

  test('RIGHT LANE: shows top 3 high urgency tasks, win lines, and correct summary', () => {
    seedTasks([
      buildTask('bill', 'Electricity bill payment', 'high'),
      buildTask('letter', 'Recommendation letter for Professor Sharma', 'high'),
      buildTask('default', 'Call landlord about lease renewal', 'high'),
      buildTask('medium', 'Submit project proposal', 'medium', 'Due in 2 days'),
      buildTask('low', 'Renew gym membership', 'low', 'Due next week'),
    ]);

    render(<App />);
    openFutureYou();

    expect(screen.getByText('If you act now')).toBeInTheDocument();
    expect(screen.getByText('3 wins this week')).toBeInTheDocument();
    expect(screen.getByText('Paid on time — no stress, no fees')).toBeInTheDocument();
    expect(screen.getByText('Relationship strengthened — favor returned')).toBeInTheDocument();
    expect(screen.getByText('Commitment kept — trust built')).toBeInTheDocument();

    const rightLane = screen.getByText('If you act now').parentElement;
    expect(rightLane?.textContent).toContain('Electricity bill payment');
    expect(rightLane?.textContent).toContain('Recommendation letter for Professor Sharma');
    expect(rightLane?.textContent).toContain('Call landlord about lease renewal');
    expect(rightLane?.textContent).not.toContain('Submit project proposalOpportunity seized — you showed up');
  });

  test('CLOSING: shows closing line and CTA returns to tasks view', () => {
    render(<App />);
    openFutureYou();

    expect(screen.getByText('This version of you exists. Pick one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start with the most critical task →' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start with the most critical task →' }));

    expectTasksView();
  });

  test('EMPTY STATE: shows no critical tasks message and still keeps closing line', () => {
    seedTasks([
      buildTask('medium', 'Submit project proposal', 'medium', 'Due in 2 days'),
      buildTask('low', 'Renew gym membership', 'low', 'Due next week'),
    ]);

    render(<App />);
    openFutureYou();

    expect(screen.getByText('✓ No critical tasks — you\'re ahead of the curve.')).toBeInTheDocument();
    expect(screen.getByText('This version of you exists. Pick one.')).toBeInTheDocument();
  });

  test('EDGE CASE: 1 high urgency task renders without crash and summaries singularize correctly', () => {
    seedTasks([
      buildTask('only', 'Electricity bill payment', 'high'),
      buildTask('medium', 'Submit project proposal', 'medium', 'Due in 2 days'),
    ]);

    render(<App />);
    openFutureYou();

    expect(screen.getByText('1 commitment broken')).toBeInTheDocument();
    expect(screen.getByText('1 win this week')).toBeInTheDocument();
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('EDGE CASE: 10 high urgency tasks show all on left and max 3 on right', () => {
    const tasks = Array.from({ length: 10 }, (_, index) =>
      buildTask(`high-${index + 1}`, `Urgent task ${index + 1}`, 'high')
    );
    seedTasks(tasks);

    render(<App />);
    openFutureYou();

    expect(screen.getByText('10 commitments broken')).toBeInTheDocument();
    expect(screen.getByText('3 wins this week')).toBeInTheDocument();

    tasks.forEach((task) => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });

    expect(screen.getAllByText('Commitment kept — trust built')).toHaveLength(3);
    expect(screen.queryByText('Urgent task 4Commitment kept — trust built')).not.toBeInTheDocument();
  });

  test('EDGE CASE: rapidly toggling Future You 10 times does not crash', () => {
    render(<App />);

    for (let index = 0; index < 10; index += 1) {
      openFutureYou();
      expect(screen.getByText('Next Week')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '← Back to tasks' }));
      expectTasksView();
    }
  });

  test('EDGE CASE: Future You open state does not persist to localStorage across remounts', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { unmount } = render(<App />);

    openFutureYou();
    expect(screen.getByText('Next Week')).toBeInTheDocument();

    unmount();
    render(<App />);

    expectTasksView();
    expect(screen.queryByText('Next Week')).not.toBeInTheDocument();
    expect(setItemSpy).not.toHaveBeenCalledWith(expect.stringMatching(/future/i), expect.any(String));
  });
});
