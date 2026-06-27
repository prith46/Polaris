import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 7: Panic Button & Escape Hatch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // PANIC BUTTON
  test('Panic bar renders in Tasks view', () => {
    render(<App />);
    expect(screen.getByText(/What do I do RIGHT NOW/i)).toBeInTheDocument();
  });

  test('Panic bar and renegotiate button are on same row', () => {
    const { container } = render(<App />);
    const panicBar = container.querySelector('.bg-\\[\\#B23A2E\\]');
    const renegotiateBtn = container.querySelector('#renegotiate-btn');
    expect(panicBar).toBeInTheDocument();
    expect(renegotiateBtn).toBeInTheDocument();
    expect(panicBar?.parentElement).toBe(renegotiateBtn?.parentElement);
  });

  test('"Focus me" button exists in panic bar', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Focus me/i })).toBeInTheDocument();
  });

  test('Clicking "Focus me" shows loading state "Thinking..."', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  test('Focus mode shows single task card (mock API success)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ taskTitle: 'Electricity bill payment', reason: 'Urgent', action: 'Pay it' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));

    await waitFor(() => {
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.queryByText('Submit project proposal')).not.toBeInTheDocument();
  });

  test('"Show all tasks" link appears in focus mode', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ taskTitle: 'Electricity bill payment', reason: 'Urgent', action: 'Pay it' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show all tasks/i })).toBeInTheDocument();
    });
  });

  test('Clicking "Show all tasks" restores all columns', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ taskTitle: 'Electricity bill payment', reason: 'Urgent', action: 'Pay it' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show all tasks/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Show all tasks/i }));
    expect(screen.getByText('Submit project proposal')).toBeInTheDocument();
  });

  test('Panic bar fallback: if API fails, shows highest urgency task', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));

    await waitFor(() => {
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });
  });

  test('Focus mode hides Kanban columns and shows focus banner', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ taskTitle: 'Electricity bill payment', reason: 'Urgent', action: 'Pay it' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));

    await waitFor(() => {
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });
    expect(screen.queryByText('To Do')).not.toBeInTheDocument();
    expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
  });

  // ESCAPE HATCH
  test('Overdue task shows "Escape Hatch" button text', () => {
    render(<App />);
    expect(screen.getByText(/Escape Hatch/i)).toBeInTheDocument();
  });

  test('Clicking Escape Hatch / Draft a reply shows "Drafting..."', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    const draftBtn = screen.getByRole('button', { name: 'Draft a reply' });
    fireEvent.click(draftBtn);
    expect(screen.getByText('Drafting...')).toBeInTheDocument();
  });

  test('Escape Hatch modal renders with title "Escape Hatch Draft"', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ draft: 'Dear Professor, apology.' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });
  });

  test('Modal has "Copy to clipboard" and "Close" buttons', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ draft: 'Dear Professor, apology.' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  test('Clicking "Close" dismisses modal', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ draft: 'Dear Professor, apology.' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Escape Hatch Draft')).not.toBeInTheDocument();
  });

  test('Clicking backdrop dismisses modal', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ draft: 'Dear Professor, apology.' }),
    } as Response);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument();
    });
    const backdrop = container.querySelector('.modal-backdrop');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(screen.queryByText('Escape Hatch Draft')).not.toBeInTheDocument();
  });

  test('Copy button changes to "✓ Copied!" after click', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ draft: 'Dear Professor, apology.' }),
    } as Response);
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
  });

  test('Fallback draft text appears when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByText(/Hi, I sincerely apologize for the delay/)).toBeInTheDocument();
    });
  });

  test('Modal uses modal-backdrop and modal-content classes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ draft: 'Test draft' }),
    } as Response);

    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(container.querySelector('.modal-backdrop')).toBeInTheDocument();
      expect(container.querySelector('.modal-content')).toBeInTheDocument();
    });
  });

  // RENEGOTIATION
  test('Renegotiate button exists', () => {
    render(<App />);
    expect(screen.getByText(/I can't do all of this/i)).toBeInTheDocument();
  });

  test('Clicking renegotiate shows loading "Analyzing..."', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  test('Renegotiation modal shows "Renegotiation Plan" title', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ protect: [{ title: 'A', reason: 'R' }], extend: [], drop: [] }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
  });

  test('Modal has Protect, Request Extension, Drop sections', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        protect: [{ title: 'A', reason: 'R' }],
        extend: [{ title: 'B', reason: 'R', draft: 'D' }],
        drop: [{ title: 'C', reason: 'R', draft: 'D' }],
      }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('✓ Protect these')).toBeInTheDocument();
      expect(screen.getByText('⏳ Request an extension')).toBeInTheDocument();
      expect(screen.getByText('✗ Drop or defer')).toBeInTheDocument();
    });
  });

  test('Fallback plan renders when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
  });
});
