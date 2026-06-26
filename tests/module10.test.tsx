import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

const openScanModal = () => {
  fireEvent.click(screen.getByRole('button', { name: /Scan image/i }));
};

describe('Module 10: Multimodal Image Scanning', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Scan Image button appears in Tasks tab', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Scan image/i })).toBeInTheDocument();
  });

  test('Upload zone renders with correct placeholder text', () => {
    render(<App />);
    openScanModal();
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
  });

  test('"Browse files" button exists', () => {
    render(<App />);
    openScanModal();
    expect(screen.getByRole('button', { name: 'Browse files' })).toBeInTheDocument();
  });

  test('File type validation rejects non-image files', async () => {
    render(<App />);
    openScanModal();

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Please upload a PNG, JPG, or WEBP image.')).toBeInTheDocument();
    });
  });

  test('File size validation rejects files over 10MB', async () => {
    render(<App />);
    openScanModal();

    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('File too large — please use an image under 10MB.')).toBeInTheDocument();
    });
  });

  test('Scanning state shows "Scanning image..." text', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(<App />);
    openScanModal();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    expect(screen.getByText('Scanning image...')).toBeInTheDocument();
  });

  test('Success message shows correct task count', async () => {
    const mockTasks = [
      { title: 'Task A', deadline: 'No deadline mentioned', urgency: 'low' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: mockTasks }),
    } as Response);

    render(<App />);
    openScanModal();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));

    await waitFor(() => {
      expect(screen.getByText('✓ Found 1 task(s) — added to your Tasks.')).toBeInTheDocument();
    });
  });

  test('Error state shows retry option', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));

    render(<App />);
    openScanModal();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));

    await waitFor(() => {
      expect(screen.getByText("Couldn't scan this image — try again.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });

  test('"Scan another image" button appears after success', async () => {
    const mockTasks = [
      { title: 'Task A', deadline: 'No deadline mentioned', urgency: 'low' }
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: mockTasks }),
    } as Response);

    render(<App />);
    openScanModal();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Scan another image' })).toBeInTheDocument();
    });
  });

  test('"Choose different image" link resets upload zone', async () => {
    render(<App />);
    openScanModal();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Choose different image' }));
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
  });
});
