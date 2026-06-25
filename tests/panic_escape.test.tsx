import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Panic Button and Escape Hatch Features', () => {
  beforeEach(() => {
    // Clear mocks
    vi.restoreAllMocks();
  });

  test('Renders persistent Panic Button bar in Tasks view', () => {
    render(<App />);
    const panicBar = screen.getByText("I'm overwhelmed — what do I do RIGHT NOW?");
    expect(panicBar).toBeInTheDocument();
    
    const focusMeButton = screen.getByRole('button', { name: /Focus me/i });
    expect(focusMeButton).toBeInTheDocument();
  });

  test('Focus me button triggers focus mode with banner and filters tasks (mocked API success)', async () => {
    const mockTriage = {
      taskTitle: 'Electricity bill payment',
      reason: 'Electricity will be cut off tonight.',
      action: 'Pay the bill online immediately.'
    };

    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTriage),
      } as any)
    );

    render(<App />);

    const focusMeButton = screen.getByRole('button', { name: /Focus me/i });
    fireEvent.click(focusMeButton);

    // Should show loading text "Thinking..."
    expect(screen.getByText('Thinking...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });

    expect(screen.getByText('Electricity will be cut off tonight.')).toBeInTheDocument();
    expect(screen.getByText('→ Pay the bill online immediately.')).toBeInTheDocument();

    // Verify task cards are filtered (only Electricity bill payment is shown)
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.queryByText('Submit project proposal')).not.toBeInTheDocument();

    // Panic Bar text updates
    expect(screen.getByText(/Focus mode active/i)).toBeInTheDocument();

    // Click "Show all tasks" to exit Focus Mode
    const showAllBtn = screen.getByRole('button', { name: /Show all tasks/i });
    fireEvent.click(showAllBtn);

    expect(screen.queryByText('⚡ Focus mode')).not.toBeInTheDocument();
    expect(screen.getByText('Submit project proposal')).toBeInTheDocument();
    
    mockFetch.mockRestore();
  });

  test('Panic button handles API failure gracefully by falling back locally', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );

    render(<App />);

    const focusMeButton = screen.getByRole('button', { name: /Focus me/i });
    fireEvent.click(focusMeButton);

    await waitFor(() => {
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });

    // Fallback picks highest urgency: "Electricity bill payment"
    expect(screen.getByText('Highest urgency task')).toBeInTheDocument();
    expect(screen.getByText('→ Start working on this immediately.')).toBeInTheDocument();
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();

    mockFetch.mockRestore();
  });

  test('Draft a reply button triggers Escape Hatch Modal (mocked API success)', async () => {
    const mockDraft = {
      draft: 'Dear Prof. Sharma, I apologize for the delay. I will send the letter by tomorrow.'
    };

    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDraft),
      } as any)
    );

    render(<App />);

    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    // Verify loading state
    expect(screen.getByText('Drafting...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });

    expect(screen.getByText('Dear Prof. Sharma, I apologize for the delay. I will send the letter by tomorrow.')).toBeInTheDocument();

    // Copy to clipboard mock
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const copyBtn = screen.getByRole('button', { name: 'Copy to clipboard' });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('Dear Prof. Sharma, I apologize for the delay. I will send the letter by tomorrow.');
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();

    // Close Modal
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Escape Hatch Draft')).not.toBeInTheDocument();

    mockFetch.mockRestore();
  });

  test('Escape Hatch handles API failure gracefully using local apology message fallback', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('API failure'))
    );

    render(<App />);

    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });

    expect(screen.getByText(/Hi, I sincerely apologize for the delay/)).toBeInTheDocument();

    mockFetch.mockRestore();
  });
});
