import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 5: Email Scanner (mocked)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('"Scan for deadlines" button visibility', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    // Not visible in email list view
    expect(screen.queryByRole('button', { name: /Scan for deadlines/i })).not.toBeInTheDocument();

    // Click on an email to open reading view
    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    // Visible in reading view
    expect(screen.getByRole('button', { name: /Scan for deadlines/i })).toBeInTheDocument();
  });

  test('Clicking scan shows loading state "Scanning…"', () => {
    const fetchPromise = new Promise<any>(() => {});
    vi.spyOn(global, 'fetch').mockImplementation(() => fetchPromise);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    expect(screen.getByText('Scanning…')).toBeInTheDocument();
    expect(scanBtn).toBeDisabled();
  });

  test('Mock successful response returning one task', async () => {
    const mockTasks = [
      { title: 'Pay electricity bill', deadline: 'Friday the 27th', urgency: 'high' }
    ];
    const mockResponse = {
      result: JSON.stringify(mockTasks)
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\) — added to your Tasks\./i)).toBeInTheDocument();
    });

    // Check that button returns to normal state
    expect(screen.getByRole('button', { name: /Scan for deadlines/i })).not.toBeDisabled();

    // Verify task is added to Tasks list and context contains sender name
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTab);

    expect(screen.getByText('Pay electricity bill')).toBeInTheDocument();
    expect(screen.getByText('Friday the 27th')).toBeInTheDocument();
    expect(screen.getByText('Found in your inbox — City Power & Utilities')).toBeInTheDocument();
  });

  test('Mock response returning empty array []', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: '[]' }),
    } as Response);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText('No deadlines found in this email.')).toBeInTheDocument();
    });
  });

  test('Mock network failure (fetch throws)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      const errorMsg = screen.getByText("Couldn't scan right now — try again.");
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveClass('text-[#B23A2E]');
    });
  });

  test('Mock timeout (fetch never resolves within 10s)', async () => {
    vi.useFakeTimers();

    // Mock fetch that does not resolve
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    // Fast-forward time by 11 seconds and flush all microtasks inside React's act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(11000);
    });

    expect(screen.getByText("Couldn't scan right now — try again.")).toBeInTheDocument();
  });

  test('Mock malformed JSON response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'invalid json string' }),
    } as Response);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText("Couldn't scan right now — try again.")).toBeInTheDocument();
    });
  });

  test('Mock urgency value not in allowed set (defaults to low)', async () => {
    const mockTasks = [
      { title: 'Invalid Urgency Task', deadline: 'Soon', urgency: 'very-high' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    const { container } = render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\) — added to your Tasks\./i)).toBeInTheDocument();
    });

    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTab);

    expect(screen.getByText('Invalid Urgency Task')).toBeInTheDocument();
    
    const lowUrgencyPill = container.querySelector('.text-\\[\\#5B6B7B\\]');
    expect(lowUrgencyPill).toBeInTheDocument();
  });

  test('Result message disappears when navigating back to inbox list', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: '[]' }),
    } as Response);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText('No deadlines found in this email.')).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /Back to Inbox/i });
    fireEvent.click(backBtn);

    // Open again
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    
    // Result message should be gone
    expect(screen.queryByText('No deadlines found in this email.')).not.toBeInTheDocument();
  });

  test('Tasks added from scan persist in Tasks list during same session', async () => {
    const mockTasks = [
      { title: 'Persisted Scan Task', deadline: 'Someday', urgency: 'medium' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const emailRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(emailRow);

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    // Go to tasks tab
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTab);
    expect(screen.getByText('Persisted Scan Task')).toBeInTheDocument();

    // Go back to Inbox
    fireEvent.click(inboxTab);
    // Go back to Tasks
    fireEvent.click(tasksTab);
    expect(screen.getByText('Persisted Scan Task')).toBeInTheDocument();
  });

  test('Multiple sequential scans work correctly (mock)', async () => {
    let mockResponse = { result: JSON.stringify([{ title: 'First Sequential Task', deadline: 'Soon', urgency: 'medium' }]) };
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({
      ok: true,
      json: async () => mockResponse,
    } as Response));

    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    // Open first email
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    // Go back and open another email
    fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));
    
    // Change mock response for second scan
    mockResponse = { result: JSON.stringify([{ title: 'Second Sequential Task', deadline: 'Later', urgency: 'low' }]) };

    fireEvent.click(screen.getByText('Following up on the recommendation letter'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    // Check Tasks tab
    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));
    expect(screen.getByText('First Sequential Task')).toBeInTheDocument();
    expect(screen.getByText('Second Sequential Task')).toBeInTheDocument();
  });
});
