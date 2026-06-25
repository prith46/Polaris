// @vitest-environment node
import { describe, test, expect, vi, beforeAll } from 'vitest';

// Prepare env
process.env.GEMINI_API_KEY = 'test-gemini-api-key-12345';

vi.mock('express', () => {
  const mockHandlers: Record<string, (req: any, res: any) => Promise<void>> = {};
  const mockApp = {
    use: vi.fn(),
    post: vi.fn((path, handler) => {
      mockHandlers[path] = handler;
    }),
    get: vi.fn(),
    listen: vi.fn((port, host, callback) => {
      if (callback) callback();
    })
  };

  (globalThis as any).__mockExpressApp = mockApp;
  (globalThis as any).__mockHandlers = mockHandlers;

  const expressMock = () => mockApp;
  expressMock.json = () => vi.fn();
  expressMock.urlencoded = () => vi.fn();
  expressMock.static = () => vi.fn();

  return {
    default: expressMock,
    json: expressMock.json,
    urlencoded: expressMock.urlencoded,
    static: expressMock.static
  };
});

vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn();
  (globalThis as any).__mockGenerateContent = mockGenerateContent;

  class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent
    };
  }

  return {
    GoogleGenAI: MockGoogleGenAI
  };
});

// Import server to trigger startServer and register handlers
import '../server';

describe('Backend API Tests', () => {
  let mockHandlers: any;
  let mockGenerateContent: any;

  beforeAll(() => {
    mockHandlers = (globalThis as any).__mockHandlers;
    mockGenerateContent = (globalThis as any).__mockGenerateContent;
    // Ensure handlers are registered
    expect(Object.keys(mockHandlers).length).toBeGreaterThan(0);
  });

  async function runHandler(path: string, reqBody: any) {
    const handler = mockHandlers[path];
    if (!handler) {
      throw new Error(`Handler not found for route: ${path}`);
    }

    let statusCode = 200;
    let responseData: any = null;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    };

    const req = {
      body: reqBody
    };

    await handler(req, res);
    return { statusCode, responseData };
  }

  test('/api/scan-email returns 200 and matches actual schema { result: string }', async () => {
    const mockTasks = [
      { title: 'Task 1', deadline: 'Today', urgency: 'high' }
    ];
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockTasks)
    });

    const { statusCode, responseData } = await runHandler('/api/scan-email', { bodyText: 'Please do task 1 today' });
    
    expect(statusCode).toBe(200);
    expect(responseData).toHaveProperty('result');
    expect(typeof responseData.result).toBe('string');
    
    // Verify parsed data
    const parsed = JSON.parse(responseData.result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].title).toBe('Task 1');
    expect(parsed[0].deadline).toBe('Today');
    expect(parsed[0].urgency).toBe('high');

    // Never exposes API key
    expect(JSON.stringify(responseData)).not.toContain('test-gemini-api-key-12345');
  });

  test('/api/scan-email returns 400 when missing bodyText', async () => {
    const { statusCode, responseData } = await runHandler('/api/scan-email', {});
    expect(statusCode).toBe(400);
    expect(responseData).toHaveProperty('error');
  });

  test('/api/scan-image returns 200 and matches expected schema { tasks: array }', async () => {
    const mockTasks = [
      { title: 'Image Task', deadline: 'Tomorrow', urgency: 'medium' }
    ];
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockTasks)
    });

    const { statusCode, responseData } = await runHandler('/api/scan-image', {
      imageBase64: 'abc',
      mimeType: 'image/png'
    });

    expect(statusCode).toBe(200);
    expect(responseData).toHaveProperty('tasks');
    expect(Array.isArray(responseData.tasks)).toBe(true);
    expect(responseData.tasks[0].title).toBe('Image Task');
    expect(responseData.tasks[0].deadline).toBe('Tomorrow');
    expect(responseData.tasks[0].urgency).toBe('medium');

    // Never exposes API key
    expect(JSON.stringify(responseData)).not.toContain('test-gemini-api-key-12345');
  });

  test('/api/scan-image returns 400 when missing imageBase64 or mimeType', async () => {
    const { statusCode } = await runHandler('/api/scan-image', { imageBase64: 'abc' });
    expect(statusCode).toBe(400);
  });

  test('/api/panic returns 200 and matches expected schema { taskTitle, reason, action }', async () => {
    const mockTriage = {
      taskTitle: 'Critical Task',
      reason: 'It is overdue',
      action: 'Do it now'
    };
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockTriage)
    });

    const { statusCode, responseData } = await runHandler('/api/panic', {
      tasks: [{ title: 'Critical Task', urgency: 'high', deadline: 'Overdue' }]
    });

    expect(statusCode).toBe(200);
    expect(responseData.taskTitle).toBe('Critical Task');
    expect(responseData.reason).toBe('It is overdue');
    expect(responseData.action).toBe('Do it now');

    // Never exposes API key
    expect(JSON.stringify(responseData)).not.toContain('test-gemini-api-key-12345');
  });

  test('/api/panic returns 400 when missing tasks', async () => {
    const { statusCode } = await runHandler('/api/panic', {});
    expect(statusCode).toBe(400);
  });

  test('/api/escape-hatch returns 200 and matches expected schema { draft }', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Apology draft text'
    });

    const { statusCode, responseData } = await runHandler('/api/escape-hatch', {
      taskTitle: 'Gym',
      taskContext: 'Overdue'
    });

    expect(statusCode).toBe(200);
    expect(responseData.draft).toBe('Apology draft text');

    // Never exposes API key
    expect(JSON.stringify(responseData)).not.toContain('test-gemini-api-key-12345');
  });

  test('/api/escape-hatch returns 400 when missing taskTitle', async () => {
    const { statusCode, responseData } = await runHandler('/api/escape-hatch', {});
    expect(statusCode).toBe(400);
  });

  test('/api/decompose returns 200 and matches expected schema { subtasks }', async () => {
    const mockSubtasks = [
      { step: 'Step 1', minutes: 15 }
    ];
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockSubtasks)
    });

    const { statusCode, responseData } = await runHandler('/api/decompose', {
      taskTitle: 'Build app'
    });

    expect(statusCode).toBe(200);
    expect(responseData).toHaveProperty('subtasks');
    expect(Array.isArray(responseData.subtasks)).toBe(true);
    expect(responseData.subtasks[0].step).toBe('Step 1');
    expect(responseData.subtasks[0].minutes).toBe(15);

    // Never exposes API key
    expect(JSON.stringify(responseData)).not.toContain('test-gemini-api-key-12345');
  });

  test('/api/decompose returns 400 when missing taskTitle', async () => {
    const { statusCode } = await runHandler('/api/decompose', {});
    expect(statusCode).toBe(400);
  });

  test('/api/renegotiate returns 200 and matches expected schema { protect, extend, drop }', async () => {
    const mockPlan = {
      protect: [{ title: 'Task A', reason: 'Urgent' }],
      extend: [{ title: 'Task B', reason: 'Later', draft: 'Draft B' }],
      drop: [{ title: 'Task C', reason: 'Defer', draft: 'Draft C' }]
    };
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockPlan)
    });

    const { statusCode, responseData } = await runHandler('/api/renegotiate', {
      tasks: [{ title: 'Task A', urgency: 'high', deadline: 'Today', context: 'none' }]
    });

    expect(statusCode).toBe(200);
    expect(Array.isArray(responseData.protect)).toBe(true);
    expect(Array.isArray(responseData.extend)).toBe(true);
    expect(Array.isArray(responseData.drop)).toBe(true);
    expect(responseData.protect[0].title).toBe('Task A');

    // Never exposes API key
    expect(JSON.stringify(responseData)).not.toContain('test-gemini-api-key-12345');
  });

  test('/api/renegotiate returns 400 when missing tasks', async () => {
    const { statusCode } = await runHandler('/api/renegotiate', {});
    expect(statusCode).toBe(400);
  });
});
