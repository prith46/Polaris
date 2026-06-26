import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 12: Mobile Responsiveness', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('DOM STRUCTURE checks', () => {
    const { container } = render(<App />);

    const tabTasks = container.querySelector('#tab-tasks');
    const tabCalendar = container.querySelector('#tab-calendar');
    const tabDashboard = container.querySelector('#tab-dashboard');
    const tabInbox = container.querySelector('#tab-inbox');

    expect(tabTasks).toBeInTheDocument();
    expect(tabCalendar).toBeInTheDocument();
    expect(tabDashboard).toBeInTheDocument();
    expect(tabInbox).toBeInTheDocument();

    expect(tabTasks?.textContent).toContain('Tasks');
    expect(tabCalendar?.textContent).toContain('Calendar');
    expect(tabDashboard?.textContent).toContain('Dashboard');
    expect(tabInbox?.textContent).toContain('Inbox');

    expect(container.querySelector('#polaris-header')).toBeInTheDocument();
    expect(container.querySelector('#polaris-tagline')).toBeInTheDocument();

    const panicBar = screen.getByText(/I'm overwhelmed/i);
    expect(panicBar).toBeInTheDocument();

    expect(container.querySelector('#renegotiate-btn')).toBeInTheDocument();
    expect(container.querySelector('#polaris-add-form')).toBeInTheDocument();

    fireEvent.click(tabInbox!);
    expect(container.querySelector('#mobile-inbox-hamburger')).toBeInTheDocument();

    const emailRow = screen.getByText('Dear Customer, this is a reminder that your electricity bill...');
    fireEvent.click(emailRow);
    expect(container.querySelector('#email-detail-view')).toBeInTheDocument();
    expect(container.querySelector('#scan-deadlines-btn')).toBeInTheDocument();
    expect(container.querySelector('#email-detail-sender-row')).toBeInTheDocument();
  });

  test('Sidebar behavior', () => {
    const { container } = render(<App />);
    const tabInbox = container.querySelector('#tab-inbox');
    fireEvent.click(tabInbox!);

    expect(container.querySelector('#mobile-sidebar-backdrop')).not.toBeInTheDocument();

    const hamburger = container.querySelector('#mobile-inbox-hamburger');
    fireEvent.click(hamburger!);
    expect(container.querySelector('#mobile-sidebar-backdrop')).toBeInTheDocument();

    const backdrop = container.querySelector('#mobile-sidebar-backdrop');
    fireEvent.click(backdrop!);
    expect(container.querySelector('#mobile-sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(hamburger!);
    expect(container.querySelector('#mobile-sidebar-backdrop')).toBeInTheDocument();
    const xButton = screen.getByText('✕');
    fireEvent.click(xButton);
    expect(container.querySelector('#mobile-sidebar-backdrop')).not.toBeInTheDocument();
  });

  test('Email list and category classes', () => {
    const { container } = render(<App />);
    const tabInbox = container.querySelector('#tab-inbox');
    fireEvent.click(tabInbox!);

    expect(container.querySelector('.email-sender-column')).toBeInTheDocument();
    expect(container.querySelector('.email-timestamp')).toBeInTheDocument();
    expect(container.querySelector('.inbox-category-tabs')).toBeInTheDocument();
  });

  test('Task card classes', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.task-card')).toBeInTheDocument();
    expect(container.querySelector('.task-card-top-row')).toBeInTheDocument();
    expect(container.querySelector('.task-card-buttons-row')).toBeInTheDocument();
  });

  test('Calendar classes', () => {
    const { container } = render(<App />);
    const tabCalendar = container.querySelector('#tab-calendar');
    fireEvent.click(tabCalendar!);

    expect(container.querySelector('.calendar-grid')).toBeInTheDocument();
    expect(container.querySelector('.calendar-cell')).toBeInTheDocument();
    expect(container.querySelector('.calendar-task-title')).toBeInTheDocument();
  });

  test('Image scanner classes/IDs', () => {
    const { container } = render(<App />);
    const tabInbox = container.querySelector('#tab-inbox');
    fireEvent.click(tabInbox!);

    const scanToggle = screen.getByRole('button', { name: /Scan Image/i });
    fireEvent.click(scanToggle);

    expect(container.querySelector('#image-upload-zone')).toBeInTheDocument();

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('image-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(container.querySelector('#image-scan-error')).toBeInTheDocument();
  });

  test('Modal classes when open', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          protect: [{ title: 'Task 1', reason: 'Critical' }],
          extend: [],
          drop: []
        }),
      } as any)
    );

    const { container } = render(<App />);
    const renegotiateBtn = container.querySelector('#renegotiate-btn');
    fireEvent.click(renegotiateBtn!);

    await waitFor(() => {
      expect(container.querySelector('.modal-backdrop')).toBeInTheDocument();
      expect(container.querySelector('.modal-content')).toBeInTheDocument();
    });
  });
});
