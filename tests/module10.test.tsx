import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

const openScanModal = () => {
  fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
};

describe('Module 10: Multimodal Image Scanning', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // SCAN IMAGE IN TASKS
  test('"📸 Scan" button exists in Tasks view', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /📸 Scan/i })).toBeInTheDocument();
  });

  test('Scan button and Add button are in the toolbar', () => {
    const { container } = render(<App />);
    const scanBtn = container.querySelector('#scan-image-tasks-btn');
    const addBtn = container.querySelector('#polaris-add-button');
    expect(scanBtn).toBeInTheDocument();
    expect(addBtn).toBeInTheDocument();
    expect(scanBtn?.parentElement).toBe(addBtn?.parentElement);
  });

  test('Clicking Scan opens a modal overlay', () => {
    render(<App />);
    openScanModal();
    expect(screen.getByText('Scan Image for Tasks')).toBeInTheDocument();
  });

  test('Modal has upload zone with drag-drop text', () => {
    render(<App />);
    openScanModal();
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp chats, whiteboard photos/i)).toBeInTheDocument();
  });

  test('Modal has "Browse files" button', () => {
    render(<App />);
    openScanModal();
    expect(screen.getByRole('button', { name: 'Browse files' })).toBeInTheDocument();
  });

  test('Wrong file type shows error message', async () => {
    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('Please upload a PNG, JPG, or WEBP image.')).toBeInTheDocument();
    });
  });

  test('File over 10MB shows size error', async () => {
    render(<App />);
    openScanModal();
    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('File too large — please use an image under 10MB.')).toBeInTheDocument();
    });
  });

  test('X button closes scan modal', () => {
    render(<App />);
    openScanModal();
    expect(screen.getByText('Scan Image for Tasks')).toBeInTheDocument();
    const closeButtons = screen.getAllByText('✕');
    const modalClose = closeButtons.find(el => el.closest('.modal-content'));
    if (modalClose) fireEvent.click(modalClose);
    expect(screen.queryByText('Scan Image for Tasks')).not.toBeInTheDocument();
  });

  // SCAN FUNCTIONALITY
  test('Scanning state shows "Scanning image..." text', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    expect(screen.getByText('Scanning image...')).toBeInTheDocument();
  });

  test('Mock successful scan shows correct task count', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [{ title: 'Task A', deadline: 'No deadline mentioned', urgency: 'low' }] }),
    } as Response);

    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    await waitFor(() => {
      expect(screen.getByText('✓ Found 1 task(s) — added to your Tasks.')).toBeInTheDocument();
    });
  });

  test('"Scan another image" appears after success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [{ title: 'Task A', deadline: 'Tomorrow', urgency: 'low' }] }),
    } as Response);

    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Scan another image' })).toBeInTheDocument();
    });
  });

  test('Mock API failure shows error and retry', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    await waitFor(() => {
      expect(screen.getByText("Couldn't scan this image — try again.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });

  test('"Choose different image" link resets upload zone', async () => {
    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Choose different image' }));
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
  });

  test('Mock 503 shows Gemini toast notification', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'high demand' }),
    } as Response);

    render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    await waitFor(() => {
      expect(screen.getByText(/Gemini API is experiencing high demand/i)).toBeInTheDocument();
    });
  });

  // EXTRACTION LEDGER (on Dashboard)
  test('Dashboard shows AI Extraction Ledger section', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(container.querySelector('#dashboard-extraction-ledger')).toBeInTheDocument();
  });

  test('Dashboard ledger shows "No extractions yet" when empty', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    expect(ledger?.textContent).toContain('No extractions yet');
  });

  test('After image scan, Dashboard ledger shows entries with task count', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: [{ title: 'Ledger Task', deadline: 'Tomorrow', urgency: 'high' }] }),
    } as Response);

    const { container } = render(<App />);
    openScanModal();
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByAltText('Selected preview')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Scan for tasks' }));
    await waitFor(() => {
      expect(screen.getByText(/✓ Found 1 task\(s\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const ledger = container.querySelector('#dashboard-extraction-ledger');
    expect(ledger?.textContent).toContain('1 tasks found');
  });
});
