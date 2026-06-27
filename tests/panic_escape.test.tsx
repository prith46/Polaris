import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Panic Button and Escape Hatch Features', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Renders persistent Panic Button bar in Tasks view', () => {
    render(<App />);
    expect(screen.getByText(/What do I do RIGHT NOW/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Focus me/i })).toBeInTheDocument();
  });

  test('Focus me button triggers focus mode with banner and filters tasks (mocked API success)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ taskTitle: 'Electricity bill payment', reason: 'Electricity will be cut off tonight.', action: 'Pay the bill online immediately.' }),
    } as any);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));
    expect(screen.getByText('Thinking...')).toBeInTheDocument();

    await waitFor(() => { expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument(); });

    expect(screen.getByText('Electricity will be cut off tonight.')).toBeInTheDocument();
    expect(screen.getByText('→ Pay the bill online immediately.')).toBeInTheDocument();
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
    expect(screen.queryByText('Submit project proposal')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Focus mode/i).length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole('button', { name: /Show all tasks/i }));
    expect(screen.queryByText('⚡ Focus mode')).not.toBeInTheDocument();
    expect(screen.getByText('Submit project proposal')).toBeInTheDocument();
  });

  test('Panic button handles API failure gracefully by falling back locally', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network Error'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Focus me/i }));

    await waitFor(() => { expect(screen.getByText('⚡ Focus mode')).toBeInTheDocument(); });

    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('Draft a reply button triggers Escape Hatch Modal (mocked API success)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ draft: 'Dear Prof. Sharma, I apologize for the delay. I will send the letter by tomorrow.' }),
    } as any);
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));
    expect(screen.getByText('Drafting...')).toBeInTheDocument();

    await waitFor(() => { expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument(); });
    expect(screen.getByText('Dear Prof. Sharma, I apologize for the delay. I will send the letter by tomorrow.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Escape Hatch Draft')).not.toBeInTheDocument();
  });

  test('Escape Hatch handles API failure gracefully using local fallback', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API failure'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Draft a reply' }));

    await waitFor(() => { expect(screen.getByText('Escape Hatch Draft')).toBeInTheDocument(); });
    expect(screen.getByText(/Hi, I sincerely apologize for the delay/)).toBeInTheDocument();
  });
});
