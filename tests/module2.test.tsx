import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Module 2: Task Cards', () => {
  test('Renders all 4 seed tasks in correct order', () => {
    render(<App />);
    const expectedTitles = [
      'Electricity bill payment',
      'Recommendation letter for Professor Sharma',
      'Submit project proposal',
      'Renew gym membership',
    ];

    const headings = screen.getAllByRole('heading', { level: 2 });
    const titles = headings.map((h) => h.textContent);

    expect(titles).toEqual(expectedTitles);
  });

  test('Each seed task shows correct pill text', () => {
    render(<App />);
    expect(screen.getByText('Due in 6 hours')).toBeInTheDocument();
    expect(screen.getByText('2 days overdue')).toBeInTheDocument();
    expect(screen.getByText('Due in 2 days')).toBeInTheDocument();
    expect(screen.getByText('Due next week')).toBeInTheDocument();
  });

  test('Each card has primary and secondary buttons', () => {
    render(<App />);
    // There are 4 tasks, so we expect 4 primary actions and 4 secondary actions (snooze)
    // Wait, the primary actions are: "Handle it now", "Draft a reply", "Break it down", "Handle it now"
    // The secondary action is "Snooze" (all 4 have Snooze)
    const snoozeButtons = screen.getAllByRole('button', { name: 'Snooze' });
    expect(snoozeButtons).toHaveLength(4);

    expect(screen.getAllByRole('button', { name: 'Handle it now' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Draft a reply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Break it down' })).toBeInTheDocument();
  });

  test('Urgency classes/cards validation', () => {
    const { container } = render(<App />);
    
    // Urgency styling checks:
    // High: bg-[rgba(178,58,46,0.12)] text-[#B23A2E]
    // Medium: bg-[rgba(200,137,59,0.14)] text-[#8A6225]
    // Low: bg-[rgba(91,107,123,0.12)] text-[#5B6B7B]
    
    const highUrgencyPills = container.querySelectorAll('.text-\\[\\#B23A2E\\]');
    const mediumUrgencyPills = container.querySelectorAll('.text-\\[\\#8A6225\\]');
    const lowUrgencyPills = container.querySelectorAll('.text-\\[\\#5B6B7B\\]');

    expect(highUrgencyPills.length).toBeGreaterThanOrEqual(2); // Electricity & Recommendation
    expect(mediumUrgencyPills.length).toBeGreaterThanOrEqual(1); // Project proposal
    expect(lowUrgencyPills.length).toBeGreaterThanOrEqual(1); // Gym membership
  });
});
