import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Module 1: App Shell', () => {
  test('App mounts without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  test('Renders "Polaris" title', () => {
    render(<App />);
    const titleElement = screen.getByText('Polaris');
    expect(titleElement).toBeInTheDocument();
  });

  test('Renders tagline "Your fixed point before the deadline."', () => {
    render(<App />);
    const taglineElement = screen.getByText('Your fixed point before the deadline.');
    expect(taglineElement).toBeInTheDocument();
  });

  test('Default tab on load is Tasks (not Inbox)', () => {
    render(<App />);
    // Tab buttons
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });

    expect(tasksTab).toHaveClass('border-polaris-primary');
    expect(inboxTab).not.toHaveClass('border-polaris-primary');

    // Make sure Tasks list is present and Inbox view is not present
    expect(screen.getByPlaceholderText('Add a new task…')).toBeInTheDocument();
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();
  });
});
