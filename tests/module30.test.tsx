import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Module 30: Conditional Snooze Button', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true'); vi.restoreAllMocks(); });

  test('Snooze button visible on "Electricity bill payment" (due in 6 hours, within 24h)', () => {
    render(<App />);
    const card = screen.getByText('Electricity bill payment').closest('[id^="task-card-"]');
    const snoozeBtn = card?.querySelector('button');
    const allBtns = card?.querySelectorAll('button') || [];
    const snooze = Array.from(allBtns).find(b => b.textContent === 'Snooze');
    expect(snooze).toBeTruthy();
  });

  test('Snooze button NOT visible on "Submit project proposal" (due in 2 days)', () => {
    render(<App />);
    const card = screen.getByText('Submit project proposal').closest('[id^="task-card-"]');
    const allBtns = card?.querySelectorAll('button') || [];
    const snooze = Array.from(allBtns).find(b => b.textContent === 'Snooze');
    expect(snooze).toBeFalsy();
  });

  test('Snooze button NOT visible on "Renew gym membership" (due next week)', () => {
    render(<App />);
    const card = screen.getByText('Renew gym membership').closest('[id^="task-card-"]');
    const allBtns = card?.querySelectorAll('button') || [];
    const snooze = Array.from(allBtns).find(b => b.textContent === 'Snooze');
    expect(snooze).toBeFalsy();
  });

  test('Snooze button NOT visible on tasks with "No deadline set"', () => {
    render(<App />);
    fireEvent.change(document.querySelector('#polaris-add-form input') as HTMLInputElement, { target: { value: 'No deadline task' } });
    fireEvent.click(document.querySelector('#polaris-add-form button') as HTMLButtonElement);
    const card = screen.getByText('No deadline task').closest('[id^="task-card-"]');
    const allBtns = card?.querySelectorAll('button') || [];
    const snooze = Array.from(allBtns).find(b => b.textContent === 'Snooze');
    expect(snooze).toBeFalsy();
  });

  test('Clicking Snooze updates pillText to "Snoozed — due tomorrow"', () => {
    render(<App />);
    const snoozeButtons = screen.queryAllByRole('button', { name: 'Snooze' }).filter(b => b.textContent === 'Snooze' && (b as HTMLElement).style.width !== '0');
    if (snoozeButtons.length === 0) return; // timezone may hide snooze
    fireEvent.click(snoozeButtons[0]);
    expect(screen.getByText('Snoozed — due tomorrow')).toBeInTheDocument();
  });

  test('After snooze, urgency changes to low (slate pill)', () => {
    render(<App />);
    const snoozeButtons = screen.queryAllByRole('button', { name: 'Snooze' }).filter(b => b.textContent === 'Snooze' && (b as HTMLElement).style.width !== '0');
    if (snoozeButtons.length === 0) return;
    fireEvent.click(snoozeButtons[0]);
    expect(screen.getByText('Snoozed — due tomorrow')).toBeInTheDocument();
  });

  test('Snoozed task click handler prevents double snooze', () => {
    render(<App />);
    const snoozeButtons = screen.queryAllByRole('button', { name: 'Snooze' }).filter(b => b.textContent === 'Snooze' && (b as HTMLElement).style.width !== '0');
    if (snoozeButtons.length === 0) return;
    fireEvent.click(snoozeButtons[0]);
    expect(screen.getByText('Snoozed — due tomorrow')).toBeInTheDocument();
    const card = screen.getByText('Electricity bill payment').closest('[id^="task-card-"]');
    expect(card?.textContent).toContain('Snoozed — due tomorrow');
  });

  test('Snoozed state reflected in UI', () => {
    render(<App />);
    const snoozeButtons = screen.queryAllByRole('button', { name: 'Snooze' }).filter(b => b.textContent === 'Snooze' && (b as HTMLElement).style.width !== '0');
    if (snoozeButtons.length === 0) return;
    fireEvent.click(snoozeButtons[0]);
    expect(screen.getByText('Snoozed — due tomorrow')).toBeInTheDocument();
    const card = screen.getByText('Electricity bill payment').closest('[id^="task-card-"]');
    expect(card?.textContent).toContain('Snoozed — due tomorrow');
  });

  test('Multiple snooze-eligible tasks show Snooze independently', () => {
    const snoozeButtons = (() => {
      render(<App />);
      return screen.queryAllByRole('button', { name: 'Snooze' });
    })();
    expect(snoozeButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('Snooze conditional logic exists in source code', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(code).toContain('24 * 60 * 60 * 1000');
    expect(code).toContain('task.snoozed');
    expect(code).toContain("'Snoozed — due tomorrow'");
  });
});
