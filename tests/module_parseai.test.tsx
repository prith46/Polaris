import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

const openAddModal = () => {
  render(<App />);
  const addBtn = document.querySelector('#polaris-add-button') as HTMLButtonElement;
  fireEvent.click(addBtn);
};

describe('Parse with AI Button', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  // BUTTON EXISTS
  test('"+Add" button exists in toolbar', () => {
    render(<App />);
    expect(document.querySelector('#polaris-add-button')).toBeInTheDocument();
  });

  test('Clicking "+Add" opens the Add Task modal', () => {
    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  test('Modal has Parse with AI button', () => {
    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    expect(screen.getByText('✨ Parse with AI')).toBeInTheDocument();
  });

  test('Parse button disabled when task name empty', () => {
    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    const parseBtn = screen.getByText('✨ Parse with AI').closest('button');
    expect(parseBtn).toBeDisabled();
  });

  // LOADING STATE
  test('Typing name then clicking Parse shows loading', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    const nameInput = document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test task' } });
    const parseBtn = screen.getByText('✨ Parse with AI');
    fireEvent.click(parseBtn);
    await waitFor(() => {
      expect(screen.getByText('Parsing... ⏳')).toBeInTheDocument();
    });
  });

  test('Parse button disabled during API call', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));
    await waitFor(() => {
      const btn = screen.getByText('Parsing... ⏳').closest('button');
      expect(btn).toBeDisabled();
    });
  });

  // MOCK SUCCESS — simple
  test('Successful parse fills modal fields', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ title: 'Pay electricity bill', deadline: 'before friday', deadlineISO: '2026-07-03T23:59:00', urgency: 'high', description: null }),
    } as Response);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'pay bill before friday' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => {
      expect((document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement).value).toBe('Pay electricity bill');
    });
    expect((document.querySelectorAll('.modal-content input[type="text"]')[1]! as HTMLInputElement).value).toBe('before friday');
    expect(screen.getByText('✨ Parse with AI')).toBeInTheDocument();
  });

  // MOCK SUCCESS — with description
  test('Parse with description fills all fields', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ title: 'Book flight tickets', deadline: 'in 10 days', deadlineISO: '2026-07-08T23:59:00', urgency: 'medium', description: 'for Goa trip with family' }),
    } as Response);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'book flight goa in 10 days family' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => {
      expect((document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement).value).toBe('Book flight tickets');
    });
    expect((document.querySelector('.modal-content textarea')! as HTMLTextAreaElement).value).toBe('for Goa trip with family');
  });

  // MOCK SUCCESS — no deadline
  test('Parse with no deadline leaves date empty', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ title: 'Renew passport', deadline: null, deadlineISO: null, urgency: 'low', description: 'expiry approaching' }),
    } as Response);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'renew passport' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => {
      expect((document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement).value).toBe('Renew passport');
    });
    expect((document.querySelectorAll('.modal-content input[type="text"]')[1]! as HTMLInputElement).value).toBe('');
    expect((document.querySelector('.modal-content textarea')! as HTMLTextAreaElement).value).toBe('expiry approaching');
  });

  // 503 ERROR
  test('503 error shows retry button and error message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false, status: 503, text: async () => 'high demand', json: async () => ({ error: 'high demand' }),
    } as any);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'test task' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => {
      expect(screen.getByText('↺ Try again')).toBeInTheDocument();
    }, { timeout: 10000 });
    expect(document.querySelector('.modal-content')?.textContent).toContain('high demand');
    const retryBtn = screen.getByText('↺ Try again').closest('button');
    expect(retryBtn).not.toBeDisabled();
  }, 15000);

  // OTHER ERROR
  test('500 error shows try again without 503 toast', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false, status: 500, text: async () => 'server error', json: async () => ({}),
    } as any);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => {
      expect(screen.getByText('↺ Try again')).toBeInTheDocument();
    });
    expect(screen.getByText(/Couldn't parse/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gemini API is experiencing/i)).not.toBeInTheDocument();
  });

  // NETWORK FAILURE
  test('Network error shows try again, modal stays open', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => {
      expect(screen.getByText('↺ Try again')).toBeInTheDocument();
    });
    expect(screen.getByText('New Task')).toBeInTheDocument(); // modal still open
  });

  // STATE CLEANUP
  test('Closing modal clears error and resets button', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('fail'));

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'x' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));
    await waitFor(() => { expect(screen.getByText('↺ Try again')).toBeInTheDocument(); });

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('↺ Try again')).not.toBeInTheDocument();

    fireEvent.click(document.querySelector('#polaris-add-button')!);
    expect(screen.getByText('✨ Parse with AI')).toBeInTheDocument();
    expect(screen.queryByText(/Couldn't parse/i)).not.toBeInTheDocument();
  });

  test('Typing in name field clears error message', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('fail'));

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'x' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));
    await waitFor(() => { expect(screen.getByText(/Couldn't parse/i)).toBeInTheDocument(); });

    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'new text' } });
    expect(screen.queryByText(/Couldn't parse/i)).not.toBeInTheDocument();
  });

  // CONFIRM AFTER PARSE
  test('After parse, confirming creates card with parsed data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ title: 'Clean desk', deadline: 'today', deadlineISO: '2026-06-28T23:59:00', urgency: 'high', description: 'before meeting' }),
    } as Response);

    render(<App />);
    const initialCount = screen.getAllByRole('heading', { level: 2 }).length;
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'clean desk today before meeting' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => { expect((document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement).value).toBe('Clean desk'); });

    // Click modal confirm
    const modalAddBtn = screen.getAllByRole('button').find(b => b.textContent === 'Add task' && b.closest('.modal-content'));
    if (modalAddBtn) fireEvent.click(modalAddBtn);

    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(initialCount + 1);
    expect(screen.getByText('Clean desk')).toBeInTheDocument();
  });

  // EDGE CASES
  test('Long input (200 chars) works', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ title: 'Long task', deadline: null, deadlineISO: null, urgency: 'low', description: null }),
    } as Response);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'x'.repeat(200) } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => { expect((document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement).value).toBe('Long task'); });
  });

  test('Special characters in input work', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ title: 'Task & "stuff"', deadline: null, deadlineISO: null, urgency: 'low', description: null }),
    } as Response);

    render(<App />);
    fireEvent.click(document.querySelector('#polaris-add-button')!);
    fireEvent.change(document.querySelector('.modal-content input[type="text"]')!, { target: { value: 'task & "stuff" <html>' } });
    fireEvent.click(screen.getByText('✨ Parse with AI'));

    await waitFor(() => { expect((document.querySelector('.modal-content input[type="text"]')! as HTMLInputElement).value).toBe('Task & "stuff"'); });
  });

  // SOURCE CODE VERIFICATION
  test('Parse with AI retry logic exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('isParsingModalTask');
    expect(code).toContain('parseModalError');
    expect(code).toContain('parseButtonLabel');
    expect(code).toContain('attempt <= 2');
    expect(code).toContain('Retrying...');
    expect(code).toContain('↺ Try again');
    expect(code).toContain('AbortSignal.timeout');
  });

  test('Server returns 503 for Gemini errors', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../server.ts'), 'utf8');
    expect(code).toContain("res.status(503).json({ error: 'high demand' })");
  });
});
