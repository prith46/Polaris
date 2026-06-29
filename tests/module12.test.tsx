import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 12: DOM Structure & Mobile', () => {
  beforeEach(() => {
    localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // DOM STRUCTURE
  test('Tab IDs and header IDs present', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#tab-tasks')).toBeInTheDocument();
    expect(container.querySelector('#tab-calendar')).toBeInTheDocument();
    expect(container.querySelector('#tab-dashboard')).toBeInTheDocument();
    expect(container.querySelector('#tab-inbox')).toBeInTheDocument();
    expect(container.querySelector('#polaris-header')).toBeInTheDocument();
    expect(container.querySelector('#polaris-tagline')).toBeInTheDocument();
  });

  test('Renegotiation button and add task form exist', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#renegotiate-btn')).toBeInTheDocument();
    expect(container.querySelector('#polaris-add-form')).toBeInTheDocument();
  });

  test('Panic bar text present', () => {
    render(<App />);
    expect(screen.getByText(/What do I do RIGHT NOW/i)).toBeInTheDocument();
  });

  test('Inbox IDs present when Inbox tab active', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#tab-inbox')!);
    expect(container.querySelector('#mobile-inbox-hamburger')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Your electricity bill is due soon'));
    expect(container.querySelector('#email-detail-view')).toBeInTheDocument();
    expect(container.querySelector('#scan-deadlines-btn')).toBeInTheDocument();
    expect(container.querySelector('#email-detail-sender-row')).toBeInTheDocument();
  });

  // KANBAN STRUCTURE
  test('Three columns render: To Do, In Progress, Done', () => {
    render(<App />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText(/^Done$/)).toBeInTheDocument();
  });

  test('To Do column has correct count badge', () => {
    render(<App />);
    const toDoHeader = screen.getByText('To Do').parentElement;
    expect(toDoHeader?.textContent).toContain('To Do');
  });

  test('Empty In Progress shows helper text', () => {
    render(<App />);
    expect(screen.getByText("Click 'Handle it now' on any task")).toBeInTheDocument();
  });

  // SIDEBAR BEHAVIOR
  test('Sidebar behavior: hamburger opens, backdrop and X close', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#tab-inbox')!);

    expect(container.querySelector('#mobile-sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('#mobile-inbox-hamburger')!);
    expect(container.querySelector('#mobile-sidebar-backdrop')).toBeInTheDocument();

    fireEvent.click(container.querySelector('#mobile-sidebar-backdrop')!);
    expect(container.querySelector('#mobile-sidebar-backdrop')).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('#mobile-inbox-hamburger')!);
    const xButton = screen.getByText('✕');
    fireEvent.click(xButton);
    expect(container.querySelector('#mobile-sidebar-backdrop')).not.toBeInTheDocument();
  });

  // EMAIL CLASSES
  test('Email list and category classes present', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#tab-inbox')!);
    expect(container.querySelector('.email-sender-column')).toBeInTheDocument();
    expect(container.querySelector('.email-timestamp')).toBeInTheDocument();
    expect(container.querySelector('.inbox-category-tabs')).toBeInTheDocument();
  });

  // CARD CLASSES
  test('Task cards have card-slide-in class', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.card-slide-in')).toBeInTheDocument();
  });

  // CALENDAR CLASSES
  test('Calendar grid, cell, and task title classes present', () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#tab-calendar')!);
    expect(container.querySelector('.calendar-grid')).toBeInTheDocument();
    expect(container.querySelector('.calendar-cell')).toBeInTheDocument();
    expect(container.querySelector('.calendar-task-title')).toBeInTheDocument();
  });

  // SCAN MODAL
  test('Clicking "📸 Scan" opens modal with correct structure', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
    expect(container.querySelector('#image-upload-zone')).toBeInTheDocument();
    expect(screen.getByText('Scan Image for Tasks')).toBeInTheDocument();
  });

  test('Scan modal wrong file type shows error', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /📸 Scan/i }));
    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByTestId('image-file-input'), { target: { files: [file] } });
    expect(container.querySelector('#image-scan-error')).toBeInTheDocument();
  });

  // MODAL CLASSES
  test('Modal backdrop and content classes present when open', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ protect: [{ title: 'T', reason: 'R' }], extend: [], drop: [] }),
    } as any);

    const { container } = render(<App />);
    fireEvent.click(container.querySelector('#renegotiate-btn')!);
    await waitFor(() => {
      expect(container.querySelector('.modal-backdrop')).toBeInTheDocument();
      expect(container.querySelector('.modal-content')).toBeInTheDocument();
    });
  });
});
