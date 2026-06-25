import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
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

  test('App renders without console errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('Background color is warm paper (not pure white)', () => {
    const { container } = render(<App />);
    const rootDiv = container.querySelector('#polaris-root') || container.firstChild as HTMLElement;
    expect(rootDiv).toBeInTheDocument();
    const style = window.getComputedStyle(rootDiv);
    // Let's verify that the background color contains warm paper colors/classes or style
    // The design document specifies: Warm Paper (#F9F6F0)
    // In CSS it might be a class or explicit style. Let's check class list or style
    const hasWarmColor = rootDiv.classList.contains('bg-[#F9F6F0]') || 
                         rootDiv.classList.contains('bg-polaris-bg') ||
                         style.backgroundColor === 'rgb(249, 246, 240)' ||
                         style.backgroundColor.includes('#f9f6f0') ||
                         style.backgroundColor.includes('249') ||
                         container.innerHTML.includes('#F9F6F0') ||
                         container.innerHTML.includes('bg-[#f9f6f0]') ||
                         container.innerHTML.includes('bg-[#F9F6F0]');
    expect(hasWarmColor).toBeTruthy();
  });

  test('Tab bar renders all 4 tabs: Tasks, Calendar, Dashboard, Inbox', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inbox/i })).toBeInTheDocument();
  });
});
