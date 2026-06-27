import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('Module 19: Email Content & Inbox Quality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Inbox shows at least 50 email rows', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const emailRows = screen.getAllByRole('checkbox').filter(cb => cb.closest('[id^="email-row-"]'));
    expect(emailRows.length).toBe(50);
  });

  test('First 5 emails are from correct senders', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('City Power & Utilities')).toBeInTheDocument();
    expect(screen.getByText('Prof. Anjali Sharma')).toBeInTheDocument();
    expect(screen.getByText('Scholarship Office')).toBeInTheDocument();
    expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
  });

  test('Unread emails show bold styling', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('City Power & Utilities')).toHaveClass('font-bold');
    expect(screen.getByText('Prof. Anjali Sharma')).toHaveClass('font-bold');
    expect(screen.getByText('Scholarship Office')).toHaveClass('font-bold');
  });

  test('Read emails show normal styling', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('Rahul Mehta')).toHaveClass('font-normal');
  });

  // EMAIL CONTENT QUALITY
  test('Email 1 body contains "₹2,340" (specific bill amount)', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    const body = container.querySelector('#email-detail-body');
    expect(body?.textContent).toContain('₹2,340');
  });

  test('Email 2 body contains "recommendation"', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Following up on the recommendation letter'));
    const body = container.querySelector('#email-detail-body');
    expect(body?.textContent).toContain('recommendation');
  });

  test('Email 3 body contains "enrollment" or "confirmation"', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Enrollment confirmation required'));
    const body = container.querySelector('#email-detail-body');
    const text = body?.textContent || '';
    expect(text.includes('enrollment') || text.includes('confirmation')).toBe(true);
  });

  test('Email 4 body contains "Thursday" and "4"', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Project sync — Thursday 4 PM'));
    const body = container.querySelector('#email-detail-body');
    const text = body?.textContent || '';
    expect(text).toContain('Thursday');
    expect(text).toContain('4');
  });

  test('Email 5 body contains "₹8,450" (credit card amount)', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByText('Credit card payment due'));
    const body = container.querySelector('#email-detail-body');
    expect(body?.textContent).toContain('₹8,450');
  });

  test('Email bodies have substantial content (>100 chars)', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const subjects = ['Your electricity bill is due soon', 'Following up on the recommendation letter', 'Enrollment confirmation required'];
    for (const subject of subjects) {
      fireEvent.click(screen.getByText(subject));
      const body = container.querySelector('#email-detail-body');
      expect((body?.textContent || '').length).toBeGreaterThan(100);
      fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));
    }
  });

  test('No email body is empty', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const subjects = ['Your electricity bill is due soon', 'Following up on the recommendation letter'];
    for (const subject of subjects) {
      fireEvent.click(screen.getByText(subject));
      const body = container.querySelector('#email-detail-body');
      expect(body?.textContent?.trim().length).toBeGreaterThan(0);
      fireEvent.click(screen.getByRole('button', { name: /Back to Inbox/i }));
    }
  });

  // TOOLBAR
  test('Toolbar shows "1–50 of 847"', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('1–50 of 847')).toBeInTheDocument();
  });

  test('Category tabs render (Primary, Promotions, Updates, Forums)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();
    expect(screen.getByText('Forums')).toBeInTheDocument();
  });

  // TIMESTAMPS
  test('Email rows have timestamp column', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(container.querySelector('.email-timestamp')).toBeInTheDocument();
  });
});
