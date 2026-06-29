import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Module 4: Gmail Inbox', () => {
  beforeEach(() => { localStorage.setItem('polaris-onboarded', 'true'); });
  // INBOX TAB
  test('Clicking Inbox tab shows inbox view', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(container.querySelector('#polaris-inbox-container')).toBeInTheDocument();
  });

  test('Inbox shows Gmail-style email list directly (no toggle)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('Your electricity bill is due soon')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Scan Image/i })).not.toBeInTheDocument();
  });

  test('Scan image button is in Tasks tab, not Inbox', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /📸 Scan/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.queryByRole('button', { name: /📸 Scan/i })).not.toBeInTheDocument();
  });

  test('Scan button opens modal with upload UI', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
  });

  // SIDEBAR
  test('Left sidebar renders with nav items', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getAllByText('Inbox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Starred')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  test('Category tabs present', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();
    expect(screen.getByText('Forums')).toBeInTheDocument();
  });

  test('Toolbar shows "1–50 of 847"', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('1–50 of 847')).toBeInTheDocument();
  });

  // EMAIL LIST
  test('Key senders are present', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    ['City Power & Utilities', 'Prof. Anjali Sharma', 'Scholarship Office', 'Rahul Mehta', 'HDFC Bank'].forEach(sender => {
      expect(screen.getByText(sender)).toBeInTheDocument();
    });
  });

  test('50 email rows render', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const emailRows = screen.getAllByRole('checkbox').filter(cb => cb.closest('[id^="email-row-"]'));
    expect(emailRows.length).toBe(50);
  });

  test('Unread emails show bold styling', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('City Power & Utilities')).toHaveClass('font-bold');
    expect(screen.getByText('Rahul Mehta')).toHaveClass('font-normal');
  });

  // READING VIEW
  test('Clicking email opens reading view with heading', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.getByRole('heading', { name: 'Your electricity bill is due soon' })).toBeInTheDocument();
  });

  test('Reading view shows sender info and body', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    const bodyEl = container.querySelector('#email-detail-body');
    expect(bodyEl).toBeInTheDocument();
    expect(bodyEl?.textContent).toContain('₹2,340');
  });

  test('Back button returns to email list', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));
    expect(screen.getByText('1–50 of 847')).toBeInTheDocument();
  });

  test('"Scan for deadlines" button exists in reading view', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.getByRole('button', { name: /Scan for deadlines/i })).toBeInTheDocument();
  });

  test('Tab navigation and rapid switching', () => {
    render(<App />);
    const tasksTab = document.querySelector('#tab-tasks') as HTMLButtonElement;
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });

    fireEvent.click(inboxTab);
    expect(screen.getByText('Primary')).toBeInTheDocument();

    fireEvent.click(tasksTab);
    expect(document.querySelector('#polaris-add-form input') as HTMLInputElement).toBeInTheDocument();

    for (let i = 0; i < 5; i++) {
      fireEvent.click(inboxTab);
      fireEvent.click(tasksTab);
    }
    expect(document.querySelector('#polaris-add-form input') as HTMLInputElement).toBeInTheDocument();
  });

  test('6 story emails contain correct body text strings', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const stories = [
      { subject: 'Your electricity bill is due soon', expected: '₹2,340' },
      { subject: 'Following up on the recommendation letter', expected: 'recommendation letter' },
      { subject: 'Project sync — Thursday 4 PM', expected: 'Thursday at 4:00 PM' },
      { subject: 'Enrollment confirmation required', expected: 'enrollment confirmation form' },
      { subject: '5 design principles for clean user interfaces', expected: 'whitespace' },
      { subject: 'The future of autonomous flight startup raises $50M', expected: 'Silicon valley' },
    ];
    for (const story of stories) {
      fireEvent.click(screen.getByText(story.subject));
      const bodyEl = container.querySelector('#email-detail-body');
      expect(bodyEl?.textContent).toContain(story.expected);
      fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));
    }
  });

  // MOBILE SIDEBAR
  test('Hamburger button exists', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(container.querySelector('#mobile-inbox-hamburger')).toBeInTheDocument();
  });

  // EDGE CASES
  test('Opening email then switching tabs and back preserves or resets state', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.getByRole('heading', { name: 'Your electricity bill is due soon' })).toBeInTheDocument();

    fireEvent.click(document.querySelector('#tab-tasks') as HTMLButtonElement);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    // Reading view persists (selectedEmailId not cleared on tab switch)
    expect(screen.getByRole('heading', { name: 'Your electricity bill is due soon' })).toBeInTheDocument();
  });

  test('Upload zone shows drag-drop text and browse button in scan modal', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
    expect(screen.getByText(/WhatsApp chats, whiteboard photos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse files' })).toBeInTheDocument();
  });

  test('Wrong file type shows error message in scan modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('Please upload a PNG, JPG, or WEBP image.')).toBeInTheDocument();
    });
  });
});
