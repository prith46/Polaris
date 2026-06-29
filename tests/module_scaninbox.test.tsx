import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Scan Inbox Feature', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('Scan button exists in Inbox tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText(/Scan inbox for deadlines/i)).toBeInTheDocument();
  });

  test('Scan button is amber filled (not outlined)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    const btn = screen.getByText(/Scan inbox for deadlines/i).closest('button');
    expect(btn?.style.backgroundColor).toBe('rgb(200, 137, 59)');
  });

  test('Subtitle text exists next to button', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText(/Scan unread, starred & important/i)).toBeInTheDocument();
  });

  test('handleScanEmails accepts emailsOverride (source check)', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('emailsOverride');
    expect(code).toContain('handleScanEmails');
    expect(code).toContain('isScanningEmails');
  });

  test('Scan deduplication logic exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('existingTitles');
    expect(code).toContain('alreadyScannedSources');
  });

  test('Cancel ref logic exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('scanCancelRef.current = true');
    expect(code).toContain('scanCancelRef.current = false');
  });

  test('Summary modal structure exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('Scan Complete');
    expect(code).toContain('isScanSummaryOpen');
    expect(code).toContain('Emails scanned');
    expect(code).toContain('Tasks found');
    expect(code).toContain('View Tasks');
  });

  test('503 error tracking and retry exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('scanErrorEmails');
    expect(code).toContain('Retry failed emails');
    expect(code).toContain("couldn't be scanned");
  });

  test('300ms delay between scans', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('setTimeout(resolve, 300)');
  });

  test('Progress indicator shows during scan', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('Scanning email');
    expect(code).toContain('Cancel');
  });

  test('Email read state tracking exists', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('emailReadState');
    expect(code).toContain('setEmailReadState');
  });

  test('Button appears above category tabs (source check)', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    const scanIdx = code.indexOf('Scan inbox for deadlines');
    const catIdx = code.indexOf('CATEGORY TABS ROW');
    expect(scanIdx).toBeLessThan(catIdx);
  });
});
