import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const buildTask = (id: string, title: string, urgency: StoredTask['urgency'], pillText = 'Due today'): StoredTask => ({
  id, title, urgency, pillText, context: `Context for ${title}`, primaryAction: 'Handle it now', secondaryAction: 'Snooze',
});

const seedTasks = (tasks: StoredTask[]) => localStorage.setItem('polaris-tasks', JSON.stringify(tasks));

const openFutureYou = () => fireEvent.click(screen.getByRole('button', { name: 'Show me next week →' }));

describe('Module 16: Future You', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // TRIGGER
  test('"Show me next week →" button exists in Tasks view', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Show me next week →' })).toBeInTheDocument();
  });

  test('Button has blue background styling', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: 'Show me next week →' });
    expect(btn.className).toContain('bg-[#1A73E8]');
  });

  test('Clicking opens Future You screen with title and subtitle', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText('Next Week')).toBeInTheDocument();
    expect(screen.getByText('Two paths. Same starting point.')).toBeInTheDocument();
  });

  test('"← Back to tasks" link exists and returns to Tasks', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByRole('button', { name: '← Back to tasks' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '← Back to tasks' }));
    expect(screen.queryByText('Next Week')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show me next week →' })).toBeInTheDocument();
  });

  test('Future You does NOT persist to localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    const { unmount } = render(<App />);
    openFutureYou();
    unmount();
    render(<App />);
    expect(screen.queryByText('Next Week')).not.toBeInTheDocument();
    expect(spy).not.toHaveBeenCalledWith(expect.stringMatching(/future/i), expect.any(String));
  });

  // DATE HEADER
  test('Shows "Week of" date range', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText(/Week of/i)).toBeInTheDocument();
  });

  // VS DIVIDER
  test('"OR" text exists between lanes', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  // LEFT LANE
  test('"If you ignore this" header exists with high urgency tasks', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText('If you ignore this')).toBeInTheDocument();
  });

  test('Left lane shows consequence lines', () => {
    render(<App />);
    openFutureYou();
    const consequences = screen.queryAllByText(/Late fee|Relationship damaged|Commitment broken|trust eroded/i);
    expect(consequences.length).toBeGreaterThan(0);
  });

  test('Left lane shows cascade lines with → prefix', () => {
    render(<App />);
    openFutureYou();
    const cascades = screen.queryAllByText(/^→ /);
    expect(cascades.length).toBeGreaterThan(0);
  });

  test('"N commitments broken" summary exists', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText(/commitment.*broken/i)).toBeInTheDocument();
  });

  test('Left lane mood card shows 😰 and "Stressed" text', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText('😰')).toBeInTheDocument();
    expect(screen.getByText(/Stressed, behind, reputation at risk/i)).toBeInTheDocument();
  });

  test('Left lane task titles do NOT have strikethrough', () => {
    render(<App />);
    openFutureYou();
    const leftHeader = screen.getByText('If you ignore this');
    const leftLane = leftHeader.closest('div')?.parentElement;
    const titles = leftLane?.querySelectorAll('.font-sans.font-medium.text-\\[14px\\]');
    titles?.forEach(t => {
      expect((t as HTMLElement).style.textDecoration).not.toContain('line-through');
    });
  });

  // RIGHT LANE
  test('"If you act now" header exists', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText('If you act now')).toBeInTheDocument();
  });

  test('Right lane shows win lines', () => {
    render(<App />);
    openFutureYou();
    const wins = screen.queryAllByText(/Paid on time|Relationship strengthened|Commitment kept/i);
    expect(wins.length).toBeGreaterThan(0);
  });

  test('Right lane shows time estimates', () => {
    render(<App />);
    openFutureYou();
    const times = screen.queryAllByText(/~\d+ min|~\d+ hour/i);
    expect(times.length).toBeGreaterThan(0);
  });

  test('"Start now →" buttons exist on right lane cards', () => {
    render(<App />);
    openFutureYou();
    const startBtns = screen.queryAllByRole('button', { name: 'Start now →' });
    expect(startBtns.length).toBeGreaterThan(0);
    expect(startBtns.length).toBeLessThanOrEqual(3);
  });

  test('"N wins this week" summary exists', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText(/win.*this week/i)).toBeInTheDocument();
  });

  test('Right lane mood card shows 😌 and "Clear, ahead, trusted"', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText('😌')).toBeInTheDocument();
    expect(screen.getByText(/Clear, ahead, trusted/i)).toBeInTheDocument();
  });

  test('Total time estimate shows', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByText(/Total time to prevent all of this:/i)).toBeInTheDocument();
  });

  // CLICK TO START
  test('Clicking "Start now →" closes Future You and moves task to In Progress', () => {
    render(<App />);
    openFutureYou();
    const startBtns = screen.getAllByRole('button', { name: 'Start now →' });
    fireEvent.click(startBtns[0]);

    expect(screen.queryByText('Next Week')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Add a new task/i)).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  // WHAT IF ONE
  test('"What if I only do one? →" button exists', () => {
    render(<App />);
    openFutureYou();
    expect(screen.getByRole('button', { name: /What if I only do one/i })).toBeInTheDocument();
  });

  test('Clicking "What if I only do one?" shows loading then recommendation (mock success)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ taskTitle: 'Electricity bill payment', reason: 'Most urgent', action: 'Pay it now' }),
    } as Response);

    render(<App />);
    openFutureYou();
    fireEvent.click(screen.getByRole('button', { name: /What if I only do one/i }));

    expect(screen.getByText('Thinking... 🤔')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('If you only do one thing:')).toBeInTheDocument();
      expect(screen.getAllByText('Electricity bill payment').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Most urgent')).toBeInTheDocument();
      expect(screen.getByText(/Pay it now/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Do this now →' })).toBeInTheDocument();
  });

  test('Mock API failure falls back to first high urgency task', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API fail'));

    render(<App />);
    openFutureYou();
    fireEvent.click(screen.getByRole('button', { name: /What if I only do one/i }));

    await waitFor(() => {
      expect(screen.getByText('If you only do one thing:')).toBeInTheDocument();
      expect(screen.getByText('Highest urgency — needs attention first')).toBeInTheDocument();
    });
  });

  // TYPEWRITER
  test('Typewriter text eventually shows full closing line', async () => {
    render(<App />);
    openFutureYou();

    await waitFor(() => {
      expect(screen.getByText(/This version of you exists/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.getByText(/Pick one/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('Closing line uses serif font styling', async () => {
    render(<App />);
    openFutureYou();

    await waitFor(() => {
      const el = screen.getByText(/This version of you exists/i);
      expect(el.className).toContain('font-serif');
    }, { timeout: 5000 });
  });

  // EMPTY STATE
  test('With no high urgency tasks: shows "No critical tasks" message', () => {
    seedTasks([
      buildTask('m1', 'Medium task', 'medium', 'Due in 2 days'),
      buildTask('l1', 'Low task', 'low', 'Due next week'),
    ]);
    render(<App />);
    openFutureYou();
    expect(screen.getByText(/No critical tasks/i)).toBeInTheDocument();
  });

  test('Closing line still appears in empty state', async () => {
    seedTasks([buildTask('l1', 'Low task', 'low')]);
    render(<App />);
    openFutureYou();
    await waitFor(() => {
      expect(screen.getByText(/This version of you exists/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // EDGE CASES
  test('10 high urgency tasks: left shows all, right shows max 3', () => {
    const tasks = Array.from({ length: 10 }, (_, i) => buildTask(`h-${i}`, `Urgent task ${i + 1}`, 'high'));
    seedTasks(tasks);
    render(<App />);
    openFutureYou();

    expect(screen.getByText('10 commitments broken')).toBeInTheDocument();
    expect(screen.getByText('3 wins this week')).toBeInTheDocument();

    const startBtns = screen.getAllByRole('button', { name: 'Start now →' });
    expect(startBtns).toHaveLength(3);
  });

  test('Toggle open/close 5 times rapidly: no crash', () => {
    render(<App />);
    for (let i = 0; i < 5; i++) {
      openFutureYou();
      expect(screen.getByText('Next Week')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '← Back to tasks' }));
    }
    expect(screen.getByRole('button', { name: 'Show me next week →' })).toBeInTheDocument();
  });

  test('futureYouSingleTask resets when Future You closes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ taskTitle: 'Test', reason: 'R', action: 'A' }),
    } as Response);

    render(<App />);
    openFutureYou();
    fireEvent.click(screen.getByRole('button', { name: /What if I only do one/i }));
    await waitFor(() => { expect(screen.getByText('If you only do one thing:')).toBeInTheDocument(); });

    fireEvent.click(screen.getByRole('button', { name: '← Back to tasks' }));
    openFutureYou();
    expect(screen.queryByText('If you only do one thing:')).not.toBeInTheDocument();
  });

  // SPECIFIC CONSEQUENCE/WIN KEYWORDS
  test('Bill task shows "Late fee" consequence and "Paid on time" win', () => {
    seedTasks([buildTask('bill', 'Electricity bill payment', 'high')]);
    render(<App />);
    openFutureYou();
    expect(screen.getAllByText(/Late fee/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Paid on time/i)).toBeInTheDocument();
  });

  test('Letter task shows "Relationship damaged" consequence and "Relationship strengthened" win', () => {
    seedTasks([buildTask('letter', 'Recommendation letter for Professor Sharma', 'high')]);
    render(<App />);
    openFutureYou();
    expect(screen.getByText(/Relationship damaged/i)).toBeInTheDocument();
    expect(screen.getByText(/Relationship strengthened/i)).toBeInTheDocument();
  });

  test('Default task shows "Commitment broken" consequence and "Commitment kept" win', () => {
    seedTasks([buildTask('def', 'Call landlord about lease renewal', 'high')]);
    render(<App />);
    openFutureYou();
    expect(screen.getAllByText(/Commitment broken/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Commitment kept/i)).toBeInTheDocument();
  });
});
