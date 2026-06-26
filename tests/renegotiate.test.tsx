import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Renegotiation Agent Feature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Shows friendly alert if tasks list is empty', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<App />);

    // Delete seed tasks first to empty the list
    const doneButtons = screen.getAllByText('Done');
    doneButtons.forEach(btn => fireEvent.click(btn));

    // Get the renegotiate button
    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    expect(renegotiateBtn).toBeInTheDocument();

    fireEvent.click(renegotiateBtn);

    expect(alertMock).toHaveBeenCalledWith("No tasks to renegotiate — you're all clear!");
    alertMock.mockRestore();
  });

  test('Successful renegotiation API response opens modal and displays sections', async () => {
    const mockPlan = {
      protect: [
        { title: 'Submit project proposal', reason: 'Critical milestone' }
      ],
      extend: [
        { title: 'Prepare for weekly sync', reason: 'Can wait slightly', draft: 'Can we move sync to tomorrow?' }
      ],
      drop: [
        { title: 'Read vacation photos email', reason: 'Not work critical', draft: 'I will defer this indefinitely.' }
      ]
    };

    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPlan),
      } as any)
    );

    const writeTextMock = vi.fn().mockImplementation(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock
      },
      writable: true,
      configurable: true
    });

    render(<App />);

    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    // Verify it transitions to loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });

    // Check headers
    expect(screen.getByText('✓ Protect these')).toBeInTheDocument();
    expect(screen.getByText('⏳ Request an extension')).toBeInTheDocument();
    expect(screen.getByText('✗ Drop or defer')).toBeInTheDocument();

    // Check contents
    expect(screen.getAllByText('Submit project proposal')[0]).toBeInTheDocument();
    expect(screen.getByText('Critical milestone')).toBeInTheDocument();
    expect(screen.getByText('Can we move sync to tomorrow?')).toBeInTheDocument();

    // Copy draft button
    const copyBtn = screen.getAllByRole('button', { name: 'Copy draft' })[0];
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith('Can we move sync to tomorrow?');
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Renegotiation Plan')).not.toBeInTheDocument();

    mockFetch.mockRestore();
  });

  test('Failing renegotiation API falls back gracefully to hardcoded strategy', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<App />);

    const renegotiateBtn = screen.getByText(/I can't do all of this/i);
    fireEvent.click(renegotiateBtn);

    await waitFor(() => {
      expect(screen.getByText('Renegotiation Plan')).toBeInTheDocument();
    });

    // Fallback logic check:
    // protect: first high urgency task (in seed: "Electricity bill payment" is high urgency)
    expect(screen.getAllByText('Electricity bill payment')[0]).toBeInTheDocument();
    expect(screen.getByText('Highest urgency — cannot be deferred')).toBeInTheDocument();

    // extend: first medium urgency task (in seed: "Submit project proposal" is medium urgency)
    expect(screen.getAllByText('Submit project proposal')[0]).toBeInTheDocument();
    expect(screen.getByText('Important but has some flexibility')).toBeInTheDocument();
    expect(screen.getByText(/Would it be possible to get a short extension/i).textContent).toContain('Submit project proposal');

    mockFetch.mockRestore();
  });
});
