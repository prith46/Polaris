import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const code = readFileSync(resolve(__dirname, '../src/App.tsx'), 'utf8');

describe('Module 43: Browser Notifications', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  // PERMISSION REQUEST
  test('Notification API checked before requesting (source)', () => {
    expect(code).toContain("'Notification' in window");
  });

  test('Permission request delayed 3 seconds (source)', () => {
    expect(code).toContain('setTimeout');
    expect(code).toContain('3000');
    expect(code).toContain('requestPermission');
  });

  test('notificationPermission state exists', () => {
    expect(code).toContain('notificationPermission');
    expect(code).toContain('setNotificationPermission');
  });

  test('notifiedTaskIds state initializes as empty object', () => {
    expect(code).toContain('notifiedTaskIds');
    expect(code).toContain('setNotifiedTaskIds');
    expect(code).toContain('Record<string, string[]>');
  });

  // DASHBOARD INDICATOR
  test('Dashboard renders without crash', () => {
    localStorage.setItem('polaris-onboarded', 'true');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  test('Green banner text exists in source for granted permission', () => {
    expect(code).toContain('Notifications active');
    expect(code).toContain("notificationPermission === 'granted'");
  });

  test('Amber banner text exists in source for denied permission', () => {
    expect(code).toContain('Notifications blocked');
    expect(code).toContain("notificationPermission === 'denied'");
  });

  // NOTIFICATION HELPER
  test('sendNotification function exists', () => {
    expect(code).toContain('const sendNotification');
  });

  test('sendNotification checks window and permission', () => {
    expect(code).toContain("'Notification' in window");
    expect(code).toContain("Notification.permission !== 'granted'");
  });

  test('sendNotification uses tag property', () => {
    expect(code).toContain('tag: title');
  });

  test('sendNotification auto-closes after 8 seconds', () => {
    expect(code).toContain('8000');
    expect(code).toContain('n.close()');
  });

  test('sendNotification wrapped in try/catch', () => {
    const fnStart = code.indexOf('const sendNotification');
    const fnChunk = code.substring(fnStart, fnStart + 500);
    expect(fnChunk).toContain('try');
    expect(fnChunk).toContain('catch');
  });

  // NOTIFICATION TRIGGERS
  test('Overdue notification trigger exists', () => {
    expect(code).toContain("'overdue'");
    expect(code).toContain('💀 Overdue');
  });

  test('Point of no return notification trigger exists', () => {
    expect(code).toContain("'ponr'");
    expect(code).toContain('⚠ Act now');
  });

  test('1 hour threshold notification exists', () => {
    expect(code).toContain("'1hour'");
    expect(code).toContain('🔴 1 hour left');
  });

  test('24 hour threshold notification exists', () => {
    expect(code).toContain("'24hour'");
    expect(code).toContain('📅 Due tomorrow');
  });

  test('Triggers check notifiedTaskIds before firing', () => {
    expect(code).toContain("sent.includes('overdue')");
    expect(code).toContain("sent.includes('ponr')");
    expect(code).toContain("sent.includes('1hour')");
    expect(code).toContain("sent.includes('24hour')");
  });

  test('Triggers only fire for To Do tasks (not In Progress)', () => {
    expect(code).toContain('!t.inProgress');
  });

  // DEDUPLICATION
  test('notifiedTaskIds resets in demo reset handler', () => {
    const resetIdx = code.indexOf('setDemoResetToast(true)');
    const chunk = code.substring(Math.max(0, resetIdx - 500), resetIdx);
    expect(chunk).toContain('setNotifiedTaskIds');
  });

  test('notifiedTaskIds resets in test tasks handler', () => {
    const fnStart = code.indexOf('handleLoadTestTasks');
    const fnEnd = code.indexOf('setTestTasksToast(true)');
    const chunk = code.substring(fnStart, fnEnd);
    expect(chunk).toContain('setNotifiedTaskIds');
  });

  // THRESHOLDS
  test('24h check uses 23.5 to 24.5 hour window', () => {
    expect(code).toContain('23.5');
    expect(code).toContain('24.5');
  });

  test('1h check uses ~55-65 minute window', () => {
    expect(code).toContain('0.92');
    expect(code).toContain('1.08');
  });

  test('PONR check uses pointOfNoReturnPassed', () => {
    expect(code).toContain('pointOfNoReturnPassed');
  });

  test('Overdue check uses isTaskOverdue', () => {
    expect(code).toContain('isTaskOverdue(t)');
  });
});
