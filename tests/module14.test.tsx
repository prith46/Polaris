import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 14: AI Extraction Ledger', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('LEDGER UI: verifies default collapsed state and empty state text', () => {
    const { container } = render(<App />);

    const ledger = container.querySelector('#ai-extraction-ledger');
    expect(ledger).toBeInTheDocument();
    expect(ledger?.textContent).toContain('AI Extraction Ledger');
    expect(ledger?.textContent).toContain('No extractions yet');

    // Collapsed by default (maxHeight is 0px)
    const collapsible = ledger?.querySelector('.overflow-hidden');
    expect(collapsible).toHaveStyle({ maxHeight: '0px' });

    // Toggles open on click
    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);
    expect(collapsible).toHaveStyle({ maxHeight: '600px' });

    // Expanded empty ledger shows "No extractions yet" and scanning description
    expect(screen.getByRole('heading', { name: 'No extractions yet' })).toBeInTheDocument();
    expect(screen.getByText(/Scan an email or image to see what Polaris finds for you/i)).toBeInTheDocument();
  });

  test('AFTER EMAIL SCAN: mock scan adding entries to ledger', async () => {
    const mockTasks = [
      { title: 'Scanned Task A', deadline: 'Tomorrow', urgency: 'high' },
      { title: 'Scanned Task B', deadline: 'Friday', urgency: 'medium' }
    ];
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: JSON.stringify(mockTasks) }),
      } as any)
    );

    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));

    await screen.findByText(/✓ Found 2 task\(s\) — added to your Tasks\./i);

    // Go back to Tasks view to check ledger
    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));

    const ledger = container.querySelector('#ai-extraction-ledger');
    expect(ledger?.textContent).toContain('2 tasks found');

    // Expand ledger
    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);

    // Verify entries exist with correct titles, source name, deadline, badges, and icons
    expect(screen.getByText(/Scanned Task A/i)).toBeInTheDocument();
    expect(screen.getByText(/Scanned Task B/i)).toBeInTheDocument();
    expect(screen.getAllByText(/City Power & Utilities/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Tomorrow/i)).toBeInTheDocument();
    expect(screen.getByText(/Friday/i)).toBeInTheDocument();
    
    // Status badge is "In progress"
    const inProgressBadges = screen.getAllByText('In progress');
    expect(inProgressBadges.length).toBe(2);

    // Email source icon 📧
    expect(screen.getAllByText('📧').length).toBe(2);

    // Footer check
    expect(screen.getByText(/Polaris found 2 tasks across 1 source/i)).toBeInTheDocument();
  });

  test('AFTER IMAGE SCAN: successful scan adds entries to the extraction ledger', async () => {
    const mockTasks = [
      { title: 'Task from photo', deadline: 'Today', urgency: 'low' }
    ];
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks }),
      } as any)
    );

    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));

    const file = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const scanBtn = screen.getByRole('button', { name: 'Scan for tasks' });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 task\(s\) — added to your Tasks\./i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));
    
    const ledger = container.querySelector('#ai-extraction-ledger');
    expect(ledger?.textContent).toContain('1 tasks found');

    const header = ledger?.querySelector('.cursor-pointer');
    fireEvent.click(header!);

    expect(screen.getByText(/Task from photo/i)).toBeInTheDocument();
    expect(screen.getAllByText('📸').length).toBe(1);
    expect(screen.getAllByText('screenshot.png').length).toBeGreaterThanOrEqual(1);
  });

  test('STATUS TRACKING: status badge updates based on task completion and archive', async () => {
    const mockTasks = [
      { title: 'Scanned Task A', deadline: 'Tomorrow', urgency: 'high' }
    ];
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: JSON.stringify(mockTasks) }),
      } as any)
    );

    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: 'Scan for deadlines' }));

    await screen.findByText(/✓ Found 1 task\(s\) — added to your Tasks\./i);
    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));

    // Expand ledger
    const header = container.querySelector('#ai-extraction-ledger')?.querySelector('.cursor-pointer');
    fireEvent.click(header!);

    expect(screen.getByText('In progress')).toBeInTheDocument();

    // Mark task done
    // Find the task card for "Scanned Task A"
    const scannedCard = screen.getByText('Scanned Task A').closest('.bg-white');
    const doneBtn = scannedCard?.querySelector('button');
    fireEvent.click(doneBtn!);

    // Ledger status updates to "✓ Done"
    expect(screen.getByText('✓ Done')).toBeInTheDocument();
  });
});
