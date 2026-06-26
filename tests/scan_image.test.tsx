import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Multimodal Image Scanning Feature', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('Scan image button opens modal with upload interface', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Scan image/i }));

    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp chats, whiteboard photos/i)).toBeInTheDocument();
    expect(screen.getByText('Browse files')).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /Scan image/i }));

    const file = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    expect(screen.getByText('screenshot.png')).toBeInTheDocument();

    const scanBtn = screen.getByRole('button', { name: 'Scan for tasks' });
    fireEvent.click(scanBtn);

    expect(screen.getByText('Scanning image...')).toBeInTheDocument();
    expect(screen.getByText('Gemini is reading your image...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('✓ Found 1 task(s) — added to your Tasks.')).toBeInTheDocument();
    });

    mockFetch.mockRestore();
  });

  test('Failed API scan call renders error message and allows retry', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('API failure'))
    );

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Scan image/i }));

    const file = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    const scanBtn = screen.getByRole('button', { name: 'Scan for tasks' });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText("Couldn't scan this image — try again.")).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();

    mockFetch.mockRestore();
  });
});
