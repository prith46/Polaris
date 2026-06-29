import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 14: AI Extraction Ledger', () => {
  beforeEach(() => {
    localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // LEDGER ON DASHBOARD
  test('Dashboard has AI Extraction Ledger section', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(container.querySelector('#dashboard-extraction-ledger')).toBeInTheDocument();
  });

  test('Ledger shows "No extractions yet" badge when empty', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    expect(ledger?.textContent).toContain('No extractions yet');
  });

  test('Ledger is collapsible — clicking header toggles', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    const collapsible = ledger?.querySelector('.overflow-hidden');
    expect(collapsible).toHaveStyle({ maxHeight: '0px' });

    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);
    expect(collapsible).toHaveStyle({ maxHeight: '600px' });
  });

  // AFTER EMAIL SCAN
  test('After email scan, ledger shows entries with correct data', async () => {
    const mockTasks = [
      { title: 'Scanned Task A', deadline: 'Tomorrow', urgency: 'high' },
      { title: 'Scanned Task B', deadline: 'Friday', urgency: 'medium' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ result: JSON.stringify(mockTasks) }),
    } as any);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await waitFor(() => { expect(screen.getAllByText(/✓ Found 2/i).length).toBeGreaterThanOrEqual(1); });

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    expect(ledger?.textContent).toContain('2 tasks found');

    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);

    expect(screen.getAllByText(/Scanned Task A/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Scanned Task B/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText('📧').length).toBe(2);

    const inProgressBadges = screen.getAllByText('In progress');
    expect(inProgressBadges.length).toBe(2);
  });

  // AFTER IMAGE SCAN
  test('After image scan, ledger shows entries with 📸 icon', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ tasks: [{ title: 'Photo Task', deadline: 'Today', urgency: 'low' }] }),
    } as any);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));

    const file = new File(['dummy'], 'shot.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByAltText('Selected preview')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    await waitFor(() => expect(screen.getByText(/✓ Found 1 task\(s\)/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    expect(ledger?.textContent).toContain('1 tasks found');

    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);
    expect(screen.getAllByText('📸').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Photo Task/i)[0]).toBeInTheDocument();
  });

  // STATUS TRACKING
  test('Moving scanned task to Done changes ledger status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ result: JSON.stringify([{ title: 'Track Task', deadline: 'Soon', urgency: 'high' }]) }),
    } as any);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await waitFor(() => { expect(screen.getAllByText(/✓ Found 1/i).length).toBeGreaterThanOrEqual(1); });

    fireEvent.click(document.querySelector('#tab-tasks') as HTMLButtonElement);

    // Move the scanned task to In Progress then Mark Done
    const handleBtns = screen.getAllByRole('button', { name: 'Handle it now' });
    // The scanned task will have "Handle it now" — click the last one (newly added)
    fireEvent.click(handleBtns[handleBtns.length - 1]);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));

    // Check ledger on Dashboard
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);
    expect(screen.getByText('✓ Done')).toBeInTheDocument();
  });

  // SUMMARY FOOTER
  test('Footer shows "Polaris found N task(s) across M source(s)"', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ result: JSON.stringify([{ title: 'Footer Task', deadline: 'Today', urgency: 'low' }]) }),
    } as any);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await waitFor(() => { expect(screen.getAllByText(/✓ Found 1/i).length).toBeGreaterThanOrEqual(1); });

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);
    expect(screen.getByText(/Polaris found 1 task across 1 source/i)).toBeInTheDocument();
  });

  // PERSISTENCE
  test('Ledger entries persist to localStorage', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ result: JSON.stringify([{ title: 'Persist Entry', deadline: 'Soon', urgency: 'low' }]) }),
    } as any);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));
    await waitFor(() => { expect(screen.getAllByText(/✓ Found 1/i).length).toBeGreaterThanOrEqual(1); });

    await waitFor(() => {
      const log = JSON.parse(localStorage.getItem('polaris-extraction-log') || '[]');
      expect(log.length).toBe(1);
    });
  });
});
