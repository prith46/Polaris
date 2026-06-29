import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 1: App Shell', () => {
  // RENDERING
  test('App mounts without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  test('Renders "Polaris" title', () => {
    render(<App />);
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('Renders tagline "Your fixed point before the deadline."', () => {
    render(<App />);
    expect(screen.getByText('Your fixed point before the deadline.')).toBeInTheDocument();
  });

  test('Default tab on load is Tasks (not Inbox)', () => {
    render(<App />);
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    expect(tasksTab).toHaveClass('border-polaris-primary');
    expect(inboxTab).not.toHaveClass('border-polaris-primary');
    expect(document.querySelector('#polaris-add-form input') as HTMLInputElement).toBeInTheDocument();
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();
  });

  test('App renders without console errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('Tab bar renders all 4 tabs: Tasks, Calendar, Dashboard, Inbox', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inbox/i })).toBeInTheDocument();
  });

  test('Each tab has correct id', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#tab-tasks')).toBeInTheDocument();
    expect(container.querySelector('#tab-calendar')).toBeInTheDocument();
    expect(container.querySelector('#tab-dashboard')).toBeInTheDocument();
    expect(container.querySelector('#tab-inbox')).toBeInTheDocument();
  });

  test('Polaris header has id="polaris-header"', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#polaris-header')).toBeInTheDocument();
  });

  test('Tagline has id="polaris-tagline"', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#polaris-tagline')).toBeInTheDocument();
  });

  // TAB NAVIGATION
  test('Clicking Calendar tab shows calendar view', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(container.querySelector('#polaris-calendar-container')).toBeInTheDocument();
  });

  test('Clicking Dashboard tab shows dashboard view', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(container.querySelector('#polaris-dashboard-container')).toBeInTheDocument();
  });

  test('Clicking Inbox tab shows inbox view', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(container.querySelector('#polaris-inbox-container')).toBeInTheDocument();
  });

  test('Clicking Tasks tab returns to tasks view', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(container.querySelector('#polaris-tasks-container')).toBeInTheDocument();
  });

  test('Active tab has visual indicator class', () => {
    render(<App />);
    const tasksTab = screen.getByRole('button', { name: /Tasks/i });
    expect(tasksTab).toHaveClass('border-polaris-primary');

    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    const calTab = screen.getByRole('button', { name: /Calendar/i });
    expect(calTab).toHaveClass('border-polaris-primary');
    expect(tasksTab).not.toHaveClass('border-polaris-primary');
  });

  test('Switching tabs 10 times rapidly does not crash', () => {
    render(<App />);
    const tabs = [
      screen.getByRole('button', { name: /Tasks/i }),
      screen.getByRole('button', { name: /Calendar/i }),
      screen.getByRole('button', { name: /Dashboard/i }),
      screen.getByRole('button', { name: /Inbox/i }),
    ];
    for (let i = 0; i < 10; i++) {
      fireEvent.click(tabs[i % 4]);
    }
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  // VISUAL IDENTITY
  test('App background uses warm paper color', () => {
    const { container } = render(<App />);
    const root = container.querySelector('#polaris-root');
    expect(root).toBeInTheDocument();
    expect(root!.className).toContain('bg-polaris-bg');
  });

  test('Title uses serif font class', () => {
    render(<App />);
    const title = screen.getByText('Polaris');
    expect(title.className).toContain('font-serif');
  });
});
