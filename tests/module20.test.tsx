import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import App from '../src/App';

describe('Module 20: Pre-Deployment Checks', () => {
  beforeEach(() => {
    localStorage.clear(); localStorage.setItem('polaris-onboarded', 'true');
    vi.restoreAllMocks();
  });

  // BUILD VALIDATION
  test('.env.example exists', () => {
    expect(existsSync(resolve(__dirname, '../.env.example'))).toBe(true);
  });

  test('GEMINI_API_KEY is documented in .env.example', () => {
    const content = readFileSync(resolve(__dirname, '../.env.example'), 'utf8');
    expect(content).toContain('GEMINI_API_KEY');
  });

  test('APP_URL is documented in .env.example', () => {
    const content = readFileSync(resolve(__dirname, '../.env.example'), 'utf8');
    expect(content).toContain('APP_URL');
  });

  test('.gitignore exists and contains node_modules', () => {
    const content = readFileSync(resolve(__dirname, '../.gitignore'), 'utf8');
    expect(content).toContain('node_modules');
  });

  test('.gitignore excludes .env files', () => {
    const content = readFileSync(resolve(__dirname, '../.gitignore'), 'utf8');
    expect(content).toContain('.env');
  });

  // STATIC ASSETS
  test('Required source files exist', () => {
    expect(existsSync(resolve(__dirname, '../src/App.tsx'))).toBe(true);
    expect(existsSync(resolve(__dirname, '../src/types.ts'))).toBe(true);
    expect(existsSync(resolve(__dirname, '../server.ts'))).toBe(true);
    expect(existsSync(resolve(__dirname, '../index.html'))).toBe(true);
  });

  test('package.json has build, start, and dev scripts', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.dev).toBeDefined();
  });

  test('vite.config.ts exists with proxy configuration', () => {
    const content = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf8');
    expect(content).toContain('proxy');
    expect(content).toContain('/api');
  });

  // API ENDPOINTS — verify server.ts has routes
  test('server.ts defines all required API endpoints', () => {
    const content = readFileSync(resolve(__dirname, '../server.ts'), 'utf8');
    expect(content).toContain('/api/scan-email');
    expect(content).toContain('/api/scan-image');
    expect(content).toContain('/api/panic');
    expect(content).toContain('/api/escape-hatch');
    expect(content).toContain('/api/decompose');
    expect(content).toContain('/api/renegotiate');
  });

  test('server.ts uses GEMINI_MODEL variable', () => {
    const content = readFileSync(resolve(__dirname, '../server.ts'), 'utf8');
    expect(content).toContain('GEMINI_MODEL');
  });

  test('All server endpoints return JSON error on failure', () => {
    const content = readFileSync(resolve(__dirname, '../server.ts'), 'utf8');
    expect(content).toContain('res.status(');
    expect(content).toContain('.json({');
  });

  // DEMO MODE
  test('"▶ Demo" button exists in top bar', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: '▶ Demo' })).toBeInTheDocument();
  });

  test('Demo mode activates on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '▶ Demo' }));
    expect(screen.getByText(/Step 1 of 12/i)).toBeInTheDocument();
  });

  test('Demo shows "✕ Exit" button during demo', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '▶ Demo' }));
    const exitBtns = screen.getAllByText(/Exit/i);
    expect(exitBtns.length).toBeGreaterThanOrEqual(1);
  });

  test('Demo exits cleanly', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '▶ Demo' }));
    expect(screen.getByText(/Step 1 of 12/i)).toBeInTheDocument();

    const exitBtns = screen.getAllByRole('button', { name: /Exit/i });
    fireEvent.click(exitBtns[0]);
    expect(screen.queryByText(/Step 1 of 12/i)).not.toBeInTheDocument();
    expect(document.querySelector('#polaris-add-form input') as HTMLInputElement).toBeInTheDocument();
  });

  // APP INTEGRITY
  test('App renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#polaris-root')).toBeInTheDocument();
  });

  test('All 4 tabs render and are clickable', () => {
    render(<App />);
    const tabs = ['Tasks', 'Calendar', 'Dashboard', 'Inbox'];
    tabs.forEach(tab => {
      const btn = document.querySelector('#tab-' + tab.toLowerCase()) as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
    });
    expect(screen.getByText('Polaris')).toBeInTheDocument();
  });

  test('No uncaught errors on initial render', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('localStorage schema validation works (malformed data loads seeds)', () => {
    localStorage.setItem('polaris-tasks', '{broken[json');
    render(<App />);
    expect(screen.getByText('Electricity bill payment')).toBeInTheDocument();
  });

  test('503 toast state initialized to false (not visible on load)', () => {
    render(<App />);
    expect(screen.queryByText(/Gemini API is experiencing high demand/i)).not.toBeInTheDocument();
  });

  test('Kanban board has 3 columns on load', () => {
    render(<App />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText(/^Done$/)).toBeInTheDocument();
  });
});
