import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 7: Panic Button & Escape Hatch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Panic button bar renders in Tasks view', () => {
    render(<App />);
    expect(screen.getByText("I'm overwhelmed — what do I do RIGHT NOW?")).toBeInTheDocument();
  });

  test('"Focus me" button exists in panic bar', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Focus me/i })).toBeInTheDocument();
  });

  test('Clicking "Focus me" shows loading state "Thinking..."', () => {
    // Make fetch hang
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    const focusBtn = screen.getByRole('button', { name: /Focus me/i });
    fireEvent.click(focusBtn);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  test('Focus mode shows only one task card', async () => {
    const mockTriage = {
      taskTitle: 'Electricity bill payment',
      reason: 'Urgent',
      action: 'Pay it'
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockTriage,
    } as Response);

    render(<App />);
    const focusBtn = screen.getByRole('button', { name: /Focus me/i });
    fireEvent.click(focusBtn);

    await waitFor(() => {
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });

    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.queryByText('Submit project proposal')).not.toBeInTheDocument();
  });

  test('"Show all tasks" link appears in focus mode', async () => {
    const mockTriage = {
      taskTitle: 'Electricity bill payment',
      reason: 'Urgent',
      action: 'Pay it'
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockTriage,
    } as Response);

    render(<App />);
    const focusBtn = screen.getByRole('button', { name: /Focus me/i });
    fireEvent.click(focusBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show all tasks/i })).toBeInTheDocument();
    });
  });

  test('Clicking "Show all tasks" restores all task cards', async () => {
    const mockTriage = {
      taskTitle: 'Electricity bill payment',
      reason: 'Urgent',
      action: 'Pay it'
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockTriage,
    } as Response);

    render(<App />);
    const focusBtn = screen.getByRole('button', { name: /Focus me/i });
    fireEvent.click(focusBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show all tasks/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Show all tasks/i }));
    expect(screen.getByText('Submit project proposal')).toBeInTheDocument();
  });

  test('"Draft a reply" button exists on recommendation letter card', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Draft a reply' })).toBeInTheDocument();
  });

  test('Clicking "Draft a reply" shows loading state', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);
    expect(screen.getByText('Drafting...')).toBeInTheDocument();
  });

  test('Escape hatch modal renders with title "Escape Hatch Draft"', async () => {
    const mockDraft = { draft: 'Dear Professor, apology.' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDraft,
    } as Response);

    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });
  });

  test('Modal has "Copy to clipboard" button', async () => {
    const mockDraft = { draft: 'Dear Professor, apology.' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDraft,
    } as Response);

    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    });
  });

  test('Modal has "Close" button', async () => {
    const mockDraft = { draft: 'Dear Professor, apology.' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDraft,
    } as Response);

    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  test('Clicking "Close" dismisses modal', async () => {
    const mockDraft = { draft: 'Dear Professor, apology.' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDraft,
    } as Response);

    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Escape Hatch Draft')).not.toBeInTheDocument();
  });

  test('Clicking backdrop dismisses modal', async () => {
    const mockDraft = { draft: 'Dear Professor, apology.' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDraft,
    } as Response);

    const { container } = render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });

    // Click backdrop (the overlay div containing onClick={handleCloseEscapeModal})
    const backdrop = container.querySelector('.bg-black\\/50') || container.querySelector('[class*="fixed inset-0"]');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(screen.queryByText('Escape Hatch Draft')).not.toBeInTheDocument();
  });

  test('Copy button changes to "✓ Copied!" after click', async () => {
    const mockDraft = { draft: 'Dear Professor, apology.' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDraft,
    } as Response);

    // Mock clipboard API
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: 'Copy to clipboard' });
    fireEvent.click(copyBtn);

    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
  });

  test('Fallback draft text appears when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByText(/Hi, I sincerely apologize for the delay/)).toBeInTheDocument();
    });
  });
});
