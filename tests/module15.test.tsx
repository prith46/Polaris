import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 15: Commitment Density & Proactive Warning', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('COMMITMENT DENSITY CARD: renders correctly on Dashboard', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));

    expect(screen.getByText('Commitment Density')).toBeInTheDocument();
    expect(screen.getByText('Your task load over the next 7 days')).toBeInTheDocument();

    expect(screen.getAllByText('Today')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Tomorrow')[0]).toBeInTheDocument();

    expect(screen.getByText(/Peak:/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg:/i)).toBeInTheDocument();
  });

  test('BAR COLORS: correct background colors depending on count', () => {
    const day3Name = new Date();
    day3Name.setDate(day3Name.getDate() + 2);
    const day3Str = day3Name.toLocaleDateString('en-US', { weekday: 'long' });
    
    const day4Name = new Date();
    day4Name.setDate(day4Name.getDate() + 3);
    const day4Str = day4Name.toLocaleDateString('en-US', { weekday: 'long' });

    const customTasks = [
      { id: 't1', title: 'T1', urgency: 'low', pillText: 'Due tomorrow', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't2', title: 'T2', urgency: 'low', pillText: `Due on ${day3Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't3', title: 'T3', urgency: 'low', pillText: `Due on ${day3Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't4', title: 'T4', urgency: 'low', pillText: `Due on ${day3Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't5', title: 'T5', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't6', title: 'T6', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't7', title: 'T7', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't8', title: 'T8', urgency: 'high', pillText: `Due on ${day4Str}`, context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));

    const densityCard = screen.getByText('Commitment Density').closest('.bg-white');
    expect(densityCard).toBeInTheDocument();

    const bars = densityCard?.querySelectorAll('div[style*="background-color"]');
    const backgroundColors = Array.from(bars || []).map(b => b.style.backgroundColor.toLowerCase());
    
    expect(backgroundColors.some(c => c.includes('rgb(229, 229, 229)') || c.includes('#e5e5e5'))).toBe(true);
    expect(backgroundColors.some(c => c.includes('rgb(15, 157, 88)') || c.includes('#0f9d58'))).toBe(true);
    expect(backgroundColors.some(c => c.includes('rgb(200, 137, 59)') || c.includes('#c8893b'))).toBe(true);
    expect(backgroundColors.some(c => c.includes('rgb(178, 58, 46)') || c.includes('#b23a2e'))).toBe(true);
  });

  test('OVERCOMMITMENT WARNING: displays, dismisses, and triggers renegotiation', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ protect: [], extend: [], drop: [] }),
      } as any)
    );

    const customTasks = [
      { id: 't1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: 't4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(customTasks));

    const { container } = render(<App />);

    const banner = container.querySelector('#density-warning-banner');
    expect(banner).toBeInTheDocument();
    expect(banner?.textContent).toContain("You're overcommitted");
    expect(banner?.textContent).toContain('You have 4 tasks due on the same day. Polaris recommends renegotiating.');

    const containerChildren = Array.from(container.querySelector('#polaris-tasks-container')?.children || []);
    const bannerIdx = containerChildren.findIndex(el => el.id === 'density-warning-banner');
    const panicBarIdx = containerChildren.findIndex(el => el.textContent?.includes("I'm overwhelmed"));
    expect(bannerIdx).toBeLessThan(panicBarIdx);

    const renBtn = screen.getByRole('button', { name: 'Renegotiate now →' });
    fireEvent.click(renBtn);
    await waitFor(() => {
      expect(screen.getByText('Analyzing your tasks...')).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole('button', { name: 'Dismiss warning' });
    fireEvent.click(dismissBtn);
    expect(container.querySelector('#density-warning-banner')).not.toBeInTheDocument();
  });

  test('PROACTIVE BEHAVIOR: warning automatically shows/hides when task count crosses 4 threshold', () => {
    render(<App />);

    expect(document.querySelector('#density-warning-banner')).not.toBeInTheDocument();

    const loadOverload = [
      { id: '1', title: 'T1', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '2', title: 'T2', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '3', title: 'T3', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
      { id: '4', title: 'T4', urgency: 'high', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' },
    ];
    localStorage.setItem('polaris-tasks', JSON.stringify(loadOverload));
    const { unmount } = render(<App />);
    expect(document.querySelector('#density-warning-banner')).toBeInTheDocument();

    const doneBtns = screen.getAllByRole('button', { name: 'Done' });
    fireEvent.click(doneBtns[0]);
    await waitFor(() => {
      expect(document.querySelector('#density-warning-banner')).not.toBeInTheDocument();
    });
  });
});
