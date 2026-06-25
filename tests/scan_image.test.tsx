import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Multimodal Image Scanning Feature', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('Inbox tab shows subtab toggles and toggling displays upload interface', () => {
    render(<App />);

    // Navigate to Inbox tab
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    // Verify subtab buttons are rendered
    const emailsToggle = screen.getByRole('button', { name: /Emails/i });
    const scanToggle = screen.getByRole('button', { name: /Scan Image/i });
    expect(emailsToggle).toBeInTheDocument();
    expect(scanToggle).toBeInTheDocument();

    // Click "Scan Image"
    fireEvent.click(scanToggle);

    // Verify the upload zone is displayed
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp chats, whiteboard photos/i)).toBeInTheDocument();
    expect(screen.getByText('Browse files')).toBeInTheDocument();
    expect(screen.getByText('✨ Try an example →')).toBeInTheDocument();
  });

  test('Clicking try an example adds 4 simulated tasks', async () => {
    render(<App />);

    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const scanToggle = screen.getByRole('button', { name: /Scan Image/i });
    fireEvent.click(scanToggle);

    const tryExampleBtn = screen.getByText('✨ Try an example →');
    fireEvent.click(tryExampleBtn);

    // Wait for the mock state update
    await waitFor(() => {
      expect(screen.getByText('✓ Found 4 task(s) — added to your Tasks.')).toBeInTheDocument();
    });

    // Navigate back to Tasks tab and verify tasks exist
    const tasksTab = screen.getByRole('button', { name: 'Tasks' });
    fireEvent.click(tasksTab);

    expect(screen.getAllByText('Book hotel for trip')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pay entry fee')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Meet at train station')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Confirm headcount for dinner')[0]).toBeInTheDocument();
  });

  test('Selecting valid image file shows preview and scanning triggers API scan', async () => {
    const mockTasks = [
      { title: 'Task from photo', deadline: 'No deadline mentioned', urgency: 'low' }
    ];

    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks }),
      } as any)
    );

    render(<App />);

    // Navigate to Scan Image subtab
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));

    const file = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input', { suggest: false }) || document.getElementById('image-file-input')!;
    
    // Trigger file select
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for FileReader load and preview rendering
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    expect(screen.getByText('screenshot.png')).toBeInTheDocument();

    const scanBtn = screen.getByRole('button', { name: 'Scan for tasks' });
    fireEvent.click(scanBtn);

    // Verify it is in scanning state
    expect(screen.getByText('Scanning image...')).toBeInTheDocument();
    expect(screen.getByText('Gemini is reading your image...')).toBeInTheDocument();

    // Wait for mock response
    await waitFor(() => {
      expect(screen.getByText('✓ Found 1 task(s) — added to your Tasks.')).toBeInTheDocument();
    });

    // Check Tasks tab
    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));
    expect(screen.getAllByText('Task from photo')[0]).toBeInTheDocument();

    mockFetch.mockRestore();
  });

  test('Failed API scan call renders error message and allows retry', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('API failure'))
    );

    render(<App />);

    // Navigate to Scan Image subtab
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));

    const file = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });
    const fileInput = document.getElementById('image-file-input')!;
    
    // Select file
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    const scanBtn = screen.getByRole('button', { name: 'Scan for tasks' });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText("Couldn't scan this image — try again.")).toBeInTheDocument();
    });

    // Verify "Try again" button exists
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();

    mockFetch.mockRestore();
  });
});
