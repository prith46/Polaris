import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Module 4: Gmail Inbox', () => {
  test('Tab navigation and rapid switching', () => {
    render(<App />);

    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });

    // Click Inbox
    fireEvent.click(inboxTab);
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Add a new task…')).not.toBeInTheDocument();

    // Click Tasks
    fireEvent.click(tasksTab);
    expect(screen.getByPlaceholderText('Add a new task…')).toBeInTheDocument();
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();

    // Switch 10 times rapidly
    for (let i = 0; i < 5; i++) {
      fireEvent.click(inboxTab);
      fireEvent.click(tasksTab);
    }
    expect(screen.getByPlaceholderText('Add a new task…')).toBeInTheDocument();
  });

  test('All 25 emails and specific senders present', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const sendersToCheck = [
      'City Power & Utilities',
      'Prof. Anjali Sharma',
      'Scholarship Office',
      'Rahul Mehta',
      'HDFC Bank',
      'Medium Daily',
      'Microsoft Azure',
      'GitHub',
    ];

    sendersToCheck.forEach((sender) => {
      expect(screen.getByText(sender)).toBeInTheDocument();
    });

    const emailRows = screen.getAllByRole('checkbox').filter(cb => cb.closest('[id^="email-row-"]'));
    expect(emailRows.length).toBe(50);
  });

  test('Unread emails show bold styling', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const blaineSender = screen.getByText('City Power & Utilities');
    expect(blaineSender).toHaveClass('font-bold');

    const hiltonSender = screen.getByText('Rahul Mehta');
    expect(hiltonSender).toHaveClass('font-normal');
  });

  test('Category tabs and Sidebar items present', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();
    expect(screen.getByText('Forums')).toBeInTheDocument();

    expect(screen.getAllByText('Inbox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Starred')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  test('Toolbar shows "1–50 of 847"', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    expect(screen.getByText('1–50 of 847')).toBeInTheDocument();
  });

  test('Clicking email row opens reading view, back button returns', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const blaineRow = screen.getByText('Your electricity bill is due soon');
    fireEvent.click(blaineRow);

    expect(screen.getByRole('heading', { name: 'Your electricity bill is due soon' })).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Back to Inbox/i });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);

    expect(screen.getByText('1–50 of 847')).toBeInTheDocument();
  });

  test('All 50 emails clickable without crash', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const subjects = [
      "Your electricity bill is due soon",
      "Following up on the recommendation letter",
      "Enrollment confirmation required",
      "Project sync — Thursday 4 PM",
      "Credit card payment due",
      "5 design principles for clean user interfaces",
      "Action Required: Subscription renewal",
      "Action Required: Update SSH keys",
      "Rent transfer reminder",
      "Verify your Aadhaar linkage",
      "Weekend trip planning",
      "Feedback on code contribution",
      "The future of autonomous flight startup raises $50M",
      "Complete your course enrollment",
      "Invoice for billing period May",
      "Relive your memories from 3 years ago",
      "Graduation certificate ready!",
      "Submit your research draft",
      "Your package has been delivered",
      "Confirm your account registration",
      "Review draft of the design spec",
      "Introducing next-generation image optimization",
      "Meeting request: Thesis progress sync",
      "Show HN: A lightweight calendar component",
      "Receipt for your ride on Monday",
      "Update your payment details",
      "Weekly algorithm challenge",
      "Your Apple Care invoice",
      "You starred a new repository!",
      "Physiotherapy appointment schedule",
      "Keep your daily streak alive!",
      "Verify your email address",
      "Hostel room allotment form",
      "Birthday gift contribution for Raj",
      "Group project assignment task list",
      "Your order has been picked up",
      "Feedback on mock interview",
      "Weekly schedule overview",
      "Review slides for client meeting",
      "New specialization in Generative AI",
      "Verify new device login",
      "Review requested: Marketing brochure",
      "Book your class slot for tomorrow",
      "Receipt for your purchase",
      "Package out for delivery",
      "Appointment slot confirmation",
      "Book tickets for music concert",
      "Dental check-up confirmation",
      "Welcome to the sponsor community",
      "Gift contribution for boss"
];

    for (const subject of subjects) {
      const emailRow = screen.getByText(subject);
      fireEvent.click(emailRow);

      expect(screen.getByRole('heading', { name: subject })).toBeInTheDocument();

      const backBtn = screen.getByRole('button', { name: /Back to Inbox/i });
      fireEvent.click(backBtn);
    }
  });

  test('6 story emails contain correct body text strings', () => {
    const { container } = render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const stories = [
      { subject: 'Your electricity bill is due soon', expected: '₹2,340' },
      { subject: 'Following up on the recommendation letter', expected: 'recommendation letter' },
      { subject: 'Project sync — Thursday 4 PM', expected: 'Thursday at 4:00 PM' },
      { subject: 'Enrollment confirmation required', expected: 'enrollment confirmation form' },
      { subject: '5 design principles for clean user interfaces', expected: 'whitespace' },
      { subject: 'The future of autonomous flight startup raises $50M', expected: 'Silicon valley' },
    ];

    for (const story of stories) {
      const emailRow = screen.getByText(story.subject);
      fireEvent.click(emailRow);

      const bodyEl = container.querySelector('#email-detail-body');
      expect(bodyEl).toBeInTheDocument();
      expect(bodyEl?.textContent).toContain(story.expected);

      const backBtn = screen.getByRole('button', { name: /Back to Inbox/i });
      fireEvent.click(backBtn);
    }
  });

  test('Inbox tab shows toggle row with "Emails" and "Scan Image" options', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    expect(screen.getByRole('button', { name: /Emails/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Image/i })).toBeInTheDocument();
  });

  test('"Emails" toggle shows email list', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    // Default should show emails
    expect(screen.getByText('Your electricity bill is due soon')).toBeInTheDocument();

    // Click Scan Image
    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));
    expect(screen.queryByText('Your electricity bill is due soon')).not.toBeInTheDocument();

    // Click Emails back
    fireEvent.click(screen.getByRole('button', { name: /Emails/i }));
    expect(screen.getByText('Your electricity bill is due soon')).toBeInTheDocument();
  });

  test('"Scan Image" toggle shows upload zone', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));
    expect(screen.getByText('Drop a screenshot here')).toBeInTheDocument();
  });

  test('Upload zone shows drag-drop text and browse button', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));
    expect(screen.getByText(/WhatsApp chats, whiteboard photos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse files' })).toBeInTheDocument();
  });

  test('"Try an example" link exists in scan image view', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));
    expect(screen.getByText('✨ Try an example →')).toBeInTheDocument();
  });

  test('Clicking "Try an example" adds exactly 4 tasks to Tasks list', async () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));
    
    const initialTasksCount = 4; // default seed tasks
    
    const tryBtn = screen.getByText('✨ Try an example →');
    fireEvent.click(tryBtn);

    // Wait for tasks to be added
    await screen.findByText(/✓ Found 4 task\(s\) — added to your Tasks\./i);

    // Check tasks list
    fireEvent.click(screen.getByRole('button', { name: 'Tasks' }));
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.length).toBe(initialTasksCount + 4);
  });

  test('Wrong file type shows error message', async () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByRole('button', { name: /Scan Image/i }));

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('image-file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Please upload a PNG, JPG, or WEBP image.')).toBeInTheDocument();
    });
  });

  test('Reading view shows "Scan for deadlines" button', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.getByRole('button', { name: /Scan for deadlines/i })).toBeInTheDocument();
  });

  test('Back button text is present in reading view', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(screen.getByText('Back to Inbox')).toBeInTheDocument();
  });
});
