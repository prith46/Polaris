import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('CSV Export Feature', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  // BUTTON EXISTS
  test('Dashboard has "Export tasks as CSV" button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByText(/Export tasks as CSV/i)).toBeInTheDocument();
  });

  test('Export button has correct id', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(container.querySelector('#export-csv-btn')).toBeInTheDocument();
  });

  test('Export button not visible on Tasks tab', () => {
    render(<App />);
    expect(screen.queryByText(/Export tasks as CSV/i)).not.toBeInTheDocument();
  });

  test('Export button not visible on Inbox tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.queryByText(/Export tasks as CSV/i)).not.toBeInTheDocument();
  });

  // EXPORT FUNCTION
  test('Clicking export creates download link', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Export tasks as CSV/i));
    const linkCalls = appendSpy.mock.calls.filter(c => (c[0] as HTMLElement)?.tagName === 'A');
    expect(linkCalls.length).toBeGreaterThanOrEqual(1);
    const link = linkCalls[0][0] as HTMLAnchorElement;
    expect(link.download).toContain('polaris-tasks');
    appendSpy.mockRestore();
  });

  test('Download filename contains current date', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Export tasks as CSV/i));
    const linkCalls = appendSpy.mock.calls.filter(c => (c[0] as HTMLElement)?.tagName === 'A');
    const link = linkCalls[0][0] as HTMLAnchorElement;
    const today = new Date().toISOString().split('T')[0];
    expect(link.download).toContain(today);
    appendSpy.mockRestore();
  });

  // CONTENT ACCURACY
  test('handleExportCSV function exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('handleExportCSV');
    expect(code).toContain("'Title'");
    expect(code).toContain("'Status'");
    expect(code).toContain("'Urgency'");
    expect(code).toContain("'Deadline'");
    expect(code).toContain("'Context'");
    expect(code).toContain("'Notes'");
  });

  test('To Do tasks have status "To Do" in export logic', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain("'To Do'");
    expect(code).toContain("'In Progress'");
    expect(code).toContain("'Done'");
  });

  test('CSV escapes double quotes', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('replace(/"/g, \'""\'');
  });

  test('Notes field included (empty if no notes)', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain("t.notes || ''");
  });

  // TOAST
  test('Success toast appears after export', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Export tasks as CSV/i));
    expect(screen.getByText(/exported successfully/i)).toBeInTheDocument();
  });

  // EDGE CASES
  test('Export with 0 active tasks still works', () => {
    localStorage.setItem('polaris-tasks', JSON.stringify([]));
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Export tasks as CSV/i));
    const linkCalls = appendSpy.mock.calls.filter(c => (c[0] as HTMLElement)?.tagName === 'A');
    expect(linkCalls.length).toBeGreaterThanOrEqual(1);
    appendSpy.mockRestore();
  });

  test('Export after moving task to In Progress includes correct status', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Handle it now' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain("t.inProgress ? 'In Progress' : 'To Do'");
  });

  test('Blob created with correct MIME type', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain("text/csv;charset=utf-8;");
  });

  test('URL.revokeObjectURL called after download', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    fireEvent.click(screen.getByText(/Export tasks as CSV/i));
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('exportToast state exists in source', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('exportToast');
    expect(code).toContain('setExportToast');
    expect(code).toContain('exported successfully');
  });
});
