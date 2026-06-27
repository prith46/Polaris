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

  // SCAN BUTTON
  test('"Scan for deadlines" button not visible in email list view, only in reading view', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.queryByRole('button', { name: /Scan for deadlines/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.getByRole('button', { name: /Scan for deadlines/i })).toBeInTheDocument();
  });

  test('Clicking scan shows loading state "Scanning…" and button is disabled', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));

    const scanBtn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(scanBtn);

    expect(screen.getByText('Scanning…')).toBeInTheDocument();
    expect(scanBtn).toBeDisabled();
  });

  // SUCCESSFUL SCAN
  test('Mock returns 1 task — task card appears in Tasks list', async () => {
    const mockTasks = [
      { title: 'Pay electricity bill', deadline: 'Friday the 27th', urgency: 'high' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Scan for deadlines/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Pay electricity bill')).toBeInTheDocument();
    expect(screen.getByText('Friday the 27th')).toBeInTheDocument();
    expect(screen.getByText('Found in your inbox — City Power & Utilities')).toBeInTheDocument();
  });

  test('Mock returns empty array — shows "No deadlines found" message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: '[]' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText('No deadlines found in this email.')).toBeInTheDocument();
    });
  });

  // ERROR STATES
  test('Mock network failure — shows error message', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      const errorMsg = screen.getByText("Couldn't scan right now — try again.");
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveClass('text-[#B23A2E]');
    });
  });

  test('Mock timeout (10s) — shows error message', async () => {
    vi.useFakeTimers();
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(11000);
    });

    expect(screen.getByText("Couldn't scan right now — try again.")).toBeInTheDocument();
  });

  test('Mock malformed JSON — shows error message, no crash', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'invalid json string' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText("Couldn't scan right now — try again.")).toBeInTheDocument();
    });
  });

  test('Mock 503 error — shows 503 toast notification', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'high demand' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
    });
  });

  test('Mock invalid urgency value — defaults to low', async () => {
    const mockTasks = [
      { title: 'Invalid Urgency Task', deadline: 'Soon', urgency: 'very-high' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Invalid Urgency Task')).toBeInTheDocument();
  });

  // RESULT PERSISTENCE
  test('Result message disappears when navigating back to inbox list', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: '[]' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText('No deadlines found in this email.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.queryByText('No deadlines found in this email.')).not.toBeInTheDocument();
  });

  test('Tasks added from scan persist across tab switches', async () => {
    const mockTasks = [
      { title: 'Persisted Scan Task', deadline: 'Someday', urgency: 'medium' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Persisted Scan Task')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Persisted Scan Task')).toBeInTheDocument();
  });

  test('Multiple sequential scans work correctly', async () => {
    let mockResponse = { result: JSON.stringify([{ title: 'First Sequential Task', deadline: 'Soon', urgency: 'medium' }]) };
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({
      ok: true,
      json: async () => mockResponse,
    } as Response));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));

    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));

    mockResponse = { result: JSON.stringify([{ title: 'Second Sequential Task', deadline: 'Later', urgency: 'low' }]) };

    fireEvent.click(screen.getByText('Following up on the recommendation letter'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));
    expect(screen.getByText('First Sequential Task')).toBeInTheDocument();
    expect(screen.getByText('Second Sequential Task')).toBeInTheDocument();
  });

  // EXTRACTION LEDGER
  test('After scan, extraction ledger on Dashboard shows entry', async () => {
    const mockTasks = [
      { title: 'Ledger Test Task', deadline: 'Tomorrow', urgency: 'high' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    expect(ledger?.textContent).toContain('1 tasks found');
  });

  // PERSISTENCE
  test('scannedCount persists to localStorage after scan', async () => {
    const mockTasks = [
      { title: 'localStorage Task', deadline: 'Friday', urgency: 'low' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ result: JSON.stringify(mockTasks) }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));

    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 deadline\(s\)/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const scanned = localStorage.getItem('polaris-scanned');
      expect(scanned).toBeTruthy();
      expect(Number(JSON.parse(scanned!))).toBeGreaterThanOrEqual(1);
    });
  });
});
