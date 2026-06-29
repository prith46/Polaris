import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 18: Loading States, Fallbacks & Visual Consistency', () => {
  beforeEach(() => {
    localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // LOADING STATES
  test('"Scan for deadlines" shows "Scanning..." during mock scan', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    const btn = screen.getByRole('button', { name: /Scan for deadlines/i });
    fireEvent.click(btn);
    expect(screen.getByText('Scanning…')).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  test('"Focus me" shows "Thinking..." during mock panic call', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  test('"Break it down" shows "Breaking down..." during mock decompose', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    expect(screen.getByText('Breaking down...')).toBeInTheDocument();
  });

  test('"I can\'t do all of this" shows "Analyzing..." during mock renegotiate', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  test('"Roast my habits" shows "Roasting... 🔥" during roast', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Roast my habits/i));
    expect(screen.getByText('Roasting... 🔥')).toBeInTheDocument();
    vi.useRealTimers();
  });

  // GRACEFUL FALLBACKS (503)
  test('Email scan 503: shows 503 toast + "Couldn\'t scan right now"', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Scan for deadlines/i }));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
      expect(screen.getByText("Couldn't scan right now — try again.")).toBeInTheDocument();
    });
  });

  test('Panic 503: shows 503 toast + falls back to local task', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
      expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument();
    });
  });

  test('Escape hatch 503: shows 503 toast + hardcoded draft', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
      expect(screen.getByText(/Hi, I sincerely apologize for the delay/i)).toBeInTheDocument();
    });
  });

  test('Decompose 503: shows 503 toast + fallback subtasks', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Break it down' }));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
      expect(screen.getByText('Review what needs to be done')).toBeInTheDocument();
    });
  });

  test('Renegotiate 503: shows 503 toast + hardcoded plan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
  });

  // 503 TOAST
  test('Toast contains "Gemini API" and "high demand" text', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      const toast = screen.getByText(/Gemini API is experiencing high demand/i);
      expect(toast).toBeInTheDocument();
      expect(toast.textContent).toContain('temporary');
    });
  });

  test('Toast has X dismiss button that works', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'high demand' }) } as Response);
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
    });
    const toastContainer = screen.getByText(/Gemini API/i).closest('div');
    const closeBtn = toastContainer?.querySelector('button');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn!);
    expect(screen.queryByText(/Gemini API is experiencing high demand/i)).not.toBeInTheDocument();
  });

  test('Toast does NOT show on non-503 errors', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Gemini API is experiencing high demand/i)).not.toBeInTheDocument();
  });

  // EMPTY STATES
  test('In Progress column shows "Click Handle it now on any task" when empty', () => {
    render(<App />);
    expect(screen.getByText("Click 'Handle it now' on any task")).toBeInTheDocument();
  });

  test('Done column shows "No completed tasks yet" when empty', () => {
    render(<App />);
    expect(screen.getByText('No completed tasks yet')).toBeInTheDocument();
  });

  // CARD ANIMATIONS
  test('Task cards have "card-enter" class', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.card-enter')).toBeInTheDocument();
  });

  test('Task cards have "card-slide-in" class', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.card-slide-in')).toBeInTheDocument();
  });

  // VISUAL CONSISTENCY
  test('Modal backdrops use modal-backdrop class', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ draft: 'Test' }),
    } as Response);
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    await waitFor(() => {
      expect(container.querySelector('.modal-backdrop')).toBeInTheDocument();
      expect(container.querySelector('.modal-content')).toBeInTheDocument();
    });
  });

  test('Task cards have consistent border class (border-polaris-border)', () => {
    const { container } = render(<App />);
    const cards = container.querySelectorAll('.border-polaris-border');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });
});
