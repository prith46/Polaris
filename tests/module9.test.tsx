import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 9: Renegotiation Agent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Renegotiation button renders in Tasks view', () => {
    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    expect(renegotiateBtn).toBeInTheDocument();
  });

  test('Button text contains "can\'t do all of this"', () => {
    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    expect(renegotiateBtn.textContent).toContain("I can't do all of this");
  });

  test('Empty task list shows friendly message instead of API call', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);
    
    // Delete seed tasks
    const doneButtons = screen.getAllByText('Done');
    doneButtons.forEach(btn => fireEvent.click(btn));

    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    expect(alertMock).toHaveBeenCalledWith("No tasks to renegotiate — you're all clear!");
    alertMock.mockRestore();
  });

  test('Renegotiation modal renders with title "Renegotiation Plan"', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });
  });

  test('Modal has three sections: Protect, Request Extension, Drop or Defer', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('✓ Protect these')).toBeInTheDocument();
      expect(screen.getByText('⏳ Request an extension')).toBeInTheDocument();
      expect(screen.getByText('✗ Drop or defer')).toBeInTheDocument();
    });
  });

  test('Each section has at least one task card', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
      expect(screen.getByText('Task C')).toBeInTheDocument();
    });
  });

  test('"Copy draft" buttons exist in extend and drop sections', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      const copyBtns = screen.getAllByRole('button', { name: 'Copy draft' });
      expect(copyBtns.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('Copy draft changes to "✓ Copied!" after click', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Copy draft' })[0]).toBeInTheDocument();
    });

    const copyBtn = screen.getAllByRole('button', { name: 'Copy draft' })[0];
    fireEvent.click(copyBtn);

    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
  });

  test('Modal closes on X button click', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Renegotiation Plan')).not.toBeInTheDocument();
  });

  test('Modal closes on backdrop click', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Reason A' }],
      extend: [{ title: 'Task B', reason: 'Reason B', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Reason C', draft: 'Draft C' }]
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    const { container } = render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });

    const backdrop = container.querySelector('.bg-black\\/50') || container.querySelector('[class*="fixed inset-0"]');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(screen.queryByText('Renegotiation Plan')).not.toBeInTheDocument();
  });

  test('Fallback plan renders correctly when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Electricity bill payment')[0]).toBeInTheDocument();
    expect(screen.getByText('Highest urgency — cannot be deferred')).toBeInTheDocument();
  });
});
