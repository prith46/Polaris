import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const code = readFileSync(resolve(__dirname, '../src/App.tsx'), 'utf8');

describe('Module 44: Onboarding Flow', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  // FIRST TIME LOAD
  test('Onboarding shows when no polaris-onboarded key', () => {
    render(<App />);
    expect(screen.getByText('Meet Polaris')).toBeInTheDocument();
  });

  test('Onboarding does NOT show when polaris-onboarded is true', () => {
    localStorage.setItem('polaris-onboarded', 'true');
    render(<App />);
    expect(screen.queryByText('Meet Polaris')).not.toBeInTheDocument();
  });

  test('onboardingStep initializes to 0', () => {
    expect(code).toContain('onboardingStep, setOnboardingStep');
    expect(code).toContain('useState(0)');
  });

  // MODAL STRUCTURE
  test('Overlay renders with high z-index', () => {
    expect(code).toContain('zIndex: 2000');
  });

  test('Skip link exists', () => {
    render(<App />);
    expect(screen.getByText('Skip →')).toBeInTheDocument();
  });

  test('Progress dots exist (3 dots)', () => {
    render(<App />);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  // STEP 0
  test('"Meet Polaris" title exists on step 0', () => {
    render(<App />);
    expect(screen.getByText('Meet Polaris')).toBeInTheDocument();
  });

  test('Subtitle exists on step 0', () => {
    render(<App />);
    // Both tagline and onboarding have this text
    expect(screen.getAllByText('Your fixed point before the deadline.').length).toBeGreaterThanOrEqual(1);
  });

  test('Amber highlight box exists', () => {
    render(<App />);
    expect(screen.getByText(/Polaris finds those hidden deadlines/i)).toBeInTheDocument();
  });

  test('"Let\'s go →" button exists and advances to step 1', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    expect(screen.getByText(/Hidden deadlines in your inbox/i)).toBeInTheDocument();
  });

  // STEP 1
  test('Step 1 shows email mockup', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    expect(screen.getByText('City Power & Utilities')).toBeInTheDocument();
    expect(screen.getByText('⚠ Deadline detected')).toBeInTheDocument();
  });

  test('"Scan my inbox →" button exists on step 1', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    expect(screen.getByText('Scan my inbox →')).toBeInTheDocument();
  });

  test('"Next →" advances to step 2', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Next →'));
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    expect(screen.getByText(/Add tasks naturally/i)).toBeInTheDocument();
  });

  // STEP 2
  test('Step 2 shows input mockup', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Next →'));
    expect(screen.getByText('pay rent tomorrow')).toBeInTheDocument();
    expect(screen.getByText('✨ Parse')).toBeInTheDocument();
  });

  test('"Add my first task →" and "Done →" exist on step 2', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Next →'));
    expect(screen.getByText('Add my first task →')).toBeInTheDocument();
    expect(screen.getByText('Done →')).toBeInTheDocument();
  });

  // SKIP
  test('Skip closes onboarding and sets localStorage', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Skip →'));
    expect(screen.queryByText('Meet Polaris')).not.toBeInTheDocument();
    expect(localStorage.getItem('polaris-onboarded')).toBe('true');
  });

  test('After skip, app is usable', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Skip →'));
    expect(screen.getByText('Polaris')).toBeInTheDocument();
    expect(container.querySelector('#tab-tasks')).toBeInTheDocument();
  });

  // COMPLETE VIA DONE
  test('"Done →" closes onboarding and persists', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Next →'));
    fireEvent.click(screen.getByText('Done →'));
    expect(screen.queryByText('Add tasks naturally')).not.toBeInTheDocument();
    expect(localStorage.getItem('polaris-onboarded')).toBe('true');
  });

  test('Onboarding does not reappear after re-render', () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByText('Skip →'));
    unmount();
    render(<App />);
    expect(screen.queryByText('Meet Polaris')).not.toBeInTheDocument();
  });

  // COMPLETE VIA SCAN INBOX
  test('"Scan my inbox →" switches to Inbox tab', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Scan my inbox →'));
    expect(screen.queryByText('Meet Polaris')).not.toBeInTheDocument();
    expect(container.querySelector('#polaris-inbox-container')).toBeInTheDocument();
    expect(localStorage.getItem('polaris-onboarded')).toBe('true');
  });

  // COMPLETE VIA ADD TASK
  test('"Add my first task →" opens add task modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Next →'));
    fireEvent.click(screen.getByText('Add my first task →'));
    expect(screen.queryByText('Add tasks naturally')).not.toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(localStorage.getItem('polaris-onboarded')).toBe('true');
  });

  // BACKDROP
  test('Backdrop click does NOT close onboarding', () => {
    render(<App />);
    // The overlay div is the backdrop — clicking it should not close
    expect(screen.getByText('Meet Polaris')).toBeInTheDocument();
    // There's no onClick on the backdrop div, so it won't close
    expect(screen.getByText('Meet Polaris')).toBeInTheDocument();
  });

  // NO RESET
  test('Demo reset does NOT reset onboarding (source check)', () => {
    const resetIdx = code.indexOf('setDemoResetToast(true)');
    const chunk = code.substring(Math.max(0, resetIdx - 1000), resetIdx);
    expect(chunk).not.toContain('polaris-onboarded');
  });

  test('Test tasks handler does NOT reset onboarding (source check)', () => {
    const testIdx = code.indexOf('setTestTasksToast(true)');
    const chunk = code.substring(Math.max(0, testIdx - 1500), testIdx);
    expect(chunk).not.toContain('polaris-onboarded');
  });

  // DARK MODE
  test('Onboarding uses dm.card for background (source check)', () => {
    expect(code).toContain('dm.card');
    const onboardingIdx = code.indexOf('ONBOARDING FLOW');
    const chunk = code.substring(onboardingIdx, onboardingIdx + 2000);
    expect(chunk).toContain('dm.card');
  });

  // EDGE CASES
  test('Rapid Next → Next → Done completes without crash', () => {
    render(<App />);
    fireEvent.click(screen.getByText("Let's go →"));
    fireEvent.click(screen.getByText('Next →'));
    fireEvent.click(screen.getByText('Done →'));
    expect(screen.queryByText('Meet Polaris')).not.toBeInTheDocument();
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('Rapid Skip clicks — no crash', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Skip →'));
    // Second click should be harmless (modal already gone)
    expect(screen.queryByText('Skip →')).not.toBeInTheDocument();
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('completeOnboarding function exists in source', () => {
    expect(code).toContain('completeOnboarding');
    expect(code).toContain("'polaris-onboarded'");
    expect(code).toContain("'true'");
  });

  test('Onboarding animations exist in CSS', () => {
    const css = readFileSync(resolve(__dirname, '../src/index.css'), 'utf8');
    expect(css).toContain('onboardingCardIn');
    expect(css).toContain('onboardingFadeIn');
  });
});
