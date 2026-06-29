import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 9: Renegotiation Agent', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); localStorage.setItem('polaris-onboarded', 'true');
  });

  test('Renegotiation button renders in Tasks view', () => {
    render(<App />);
    expect(screen.getByText(/I can't do all of this/i)).toBeInTheDocument();
  });

  test('Button text contains "can\'t do all of this"', () => {
    render(<App />);
    const btn = screen.getByText(/I can't do all of this/i);
    expect(btn.textContent).toContain("I can't do all of this");
  });

  test('Renegotiation modal renders with title "Renegotiation Plan"', async () => {
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

  test('Modal has three sections: Protect, Request Extension, Drop', async () => {
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

  test('Each section has task cards with reasons', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        protect: [{ title: 'Task A', reason: 'Reason A' }],
        extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
        drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }],
      }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
      expect(screen.getByText('Task C')).toBeInTheDocument();
      expect(screen.getByText('Reason A')).toBeInTheDocument();
    });
  });

  test('"Copy draft" buttons exist in extend and drop sections', async () => {
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
      const copyBtns = screen.getAllByRole('button', { name: 'Copy draft' });
      expect(copyBtns.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('Copy draft changes to "✓ Copied!" after click', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        protect: [],
        extend: [{ title: 'B', reason: 'R', draft: 'D' }],
        drop: [],
      }),
    } as Response);
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy draft' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Copy draft' }));
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
  });

  test('X button closes modal', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ protect: [{ title: 'A', reason: 'R' }], extend: [], drop: [] }),
    } as Response);

    const { container } = render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
    const closeBtn = container.querySelector('#close-renegotiate-modal');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn!);
    expect(screen.queryByText('Renegotiation Plan')).not.toBeInTheDocument();
  });

  test('Backdrop closes modal', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ protect: [{ title: 'A', reason: 'R' }], extend: [], drop: [] }),
    } as Response);

    const { container } = render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
    const backdrop = container.querySelector('#renegotiate-modal-backdrop');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(screen.queryByText('Renegotiation Plan')).not.toBeInTheDocument();
  });

  test('Fallback renders when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Electricity bill payment')[0]).toBeInTheDocument();
  });

  test('Mock 503: shows Gemini toast notification', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'high demand' }),
    } as Response);

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
    });
  });
});
