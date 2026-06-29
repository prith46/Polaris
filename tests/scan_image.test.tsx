import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Multimodal Image Scanning Feature', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks(); localStorage.setItem('polaris-onboarded', 'true');
  });

  test('Scan image button opens modal with upload interface', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp chats, whiteboard photos/i)).toBeInTheDocument();
    expect(screen.getByText('Browse files')).toBeInTheDocument();
  });

  test('Selecting valid image file shows preview and scanning triggers API scan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ tasks: [{ title: 'Task from photo', deadline: 'No deadline mentioned', urgency: 'low' }] }),
    } as any);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));

    const file = new File(['dummy'], 'screenshot.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });

    await waitFor(() => { expect(screen.getByAltText('Selected preview')).toBeInTheDocument(); });
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    expect(screen.getByText('Scanning image...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('✓ Found 1 task(s) — added to your Tasks.')).toBeInTheDocument();
    });
  });

  test('Failed API scan call renders error message and allows retry', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));

    const file = new File(['dummy'], 'screenshot.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });

    await waitFor(() => { expect(screen.getByAltText('Selected preview')).toBeInTheDocument(); });

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));

    await waitFor(() => {
      expect(screen.getByText("Couldn't scan this image — try again.")).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
