import { render, screen, fireEvent } from '@testing-library/react';
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
      'Blaine, me',
      'Mom',
      'Google',
      'Vercel',
      'Rahul Mehta',
      'Prof. Anjali Sharma',
      'City Power & Utilities',
    ];

    sendersToCheck.forEach((sender) => {
      expect(screen.getByText(sender)).toBeInTheDocument();
    });

    const emailRows = screen.getAllByRole('checkbox').filter(cb => cb.closest('[id^="email-row-"]'));
    expect(emailRows.length).toBe(25);
  });

  test('Unread emails show bold styling', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const blaineSender = screen.getByText('Blaine, me');
    expect(blaineSender).toHaveClass('font-bold');

    const hiltonSender = screen.getByText('Hilton Honors');
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

  test('Toolbar shows "1–25 of 299"', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    expect(screen.getByText('1–25 of 299')).toBeInTheDocument();
  });

  test('Clicking email row opens reading view, back button returns', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const blaineRow = screen.getByText('Recent project updates');
    fireEvent.click(blaineRow);

    expect(screen.getByRole('heading', { name: 'Recent project updates' })).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Back to Inbox/i });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);

    expect(screen.getByText('1–25 of 299')).toBeInTheDocument();
  });

  test('All 25 emails clickable without crash', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const subjects = [
      'Recent project updates',
      'RSVP for team lunch and bike ride!',
      'Tickets: Ticket request #610007 has been approved!',
      'Thank you for your inquiry',
      'Your Upcoming Reservation #20983746',
      'Confirmation for Flight VA2345 SFO to NYC',
      "FW: What 'the future of innovation' Looks Like",
      'Photos from my road trip',
      'Product Strategy classes',
      'Business trip',
      'Book you recommended',
      'Security alert: New sign-in on Chrome',
      'Pull request merged: feat/dashboard-v2',
      'Project sync — Thursday 4 PM',
      'Following up on the recommendation letter',
      'Your electricity bill is due soon',
      'Welcome packet and a few next steps',
      'You appeared in 14 searches this week',
      'Your order has been delivered!',
      "Long time! How've you been?",
      'This week in web development 🚀',
      'Your order has shipped',
      'Weekly digest: 3 updates in your workspace',
      'Deployment successful: polaris-app',
      "Call me when you're free ❤️",
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
      { subject: 'Welcome packet and a few next steps', expected: 'enrollment confirmation form' },
      { subject: 'This week in web development 🚀', expected: 'DevWeekly' },
      { subject: "Long time! How've you been?", expected: 'Hey stranger' },
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
});
