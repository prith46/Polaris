import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Renegotiation Agent Feature', () => {
  beforeEach(() => {
    localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true');
    vi.restoreAllMocks();
  });

  test('Shows friendly alert if tasks list is empty', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Seed one task, remove it, then try renegotiate
    localStorage.setItem('polaris-tasks', JSON.stringify([
      { id: 'solo', title: 'Solo Task', urgency: 'low', pillText: 'Due today', context: 'C', primaryAction: 'Handle it now', secondaryAction: 'Snooze' }
    ]));
    render(<App />);

    // Move to In Progress then Mark Done
    fireEvent.click(screen.getByRole('button', { name: 'Handle it now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));

    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    expect(alertMock).toHaveBeenCalledWith("No tasks to renegotiate — you're all clear!");
    alertMock.mockRestore();
  });

  test('Successful renegotiation API response opens modal and displays sections', async () => {
    const mockPlan = {
      protect: [{ title: 'Submit project proposal', reason: 'Critical milestone' }],
      extend: [{ title: 'Prepare for weekly sync', reason: 'Can wait slightly', draft: 'Can we move sync to tomorrow?' }],
      drop: [{ title: 'Read vacation photos email', reason: 'Not work critical', draft: 'I will defer this indefinitely.' }]
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPlan) } as any);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, writable: true, configurable: true });

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    await waitFor(() => { expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument(); });

    expect(screen.getByText('✓ Protect these')).toBeInTheDocument();
    expect(screen.getByText('⏳ Request an extension')).toBeInTheDocument();
    expect(screen.getByText('✗ Drop or defer')).toBeInTheDocument();

    expect(screen.getAllByText('Submit project proposal')[0]).toBeInTheDocument();
    expect(screen.getByText('Critical milestone')).toBeInTheDocument();

    const copyBtn = screen.getAllByRole('button', { name: 'Copy draft' })[0];
    fireEvent.click(copyBtn);
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();

    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Renegotiation Plan')).not.toBeInTheDocument();
  });

  test('Failing renegotiation API falls back gracefully to hardcoded strategy', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    render(<App />);
    fireEvent.click(screen.getByText(/I can't do all of this/i));

    await waitFor(() => { expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument(); });

    expect(screen.getAllByText('Electricity bill payment')[0]).toBeInTheDocument();
    expect(screen.getByText('Highest urgency — cannot be deferred')).toBeInTheDocument();
  });
});
