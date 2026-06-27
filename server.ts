import dotenv from 'dotenv';
dotenv.config();

async function retryWithDelay<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastErr;
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });
  const PORT = 3000;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  // Server-side API route for scanning emails using Gemini
  app.post("/api/scan-email", async (req, res) => {
    try {
      const { bodyText } = req.body;
      if (!bodyText) {
        return res.status(400).json({ error: "No email body text provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = "You are a deadline extraction engine. Your ONLY job is to read the email text provided and extract every commitment, task, or deadline mentioned. You must return ONLY a valid JSON array with no explanation, no preamble, no markdown, no code fences — just the raw JSON array. Each item in the array must have exactly these three fields: title (string: a short clear task name, max 8 words), deadline (string: the deadline phrase exactly as mentioned in the email, or 'No deadline mentioned' if none), urgency (string: must be exactly one of 'high', 'medium', or 'low' — high means due within 48 hours or overdue, medium means due within a week, low means due later or no clear deadline). If you find no tasks or deadlines, return an empty array: []. Never return anything except the JSON array.";

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Extract all deadlines and tasks from this email:\n\n${bodyText}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "[]";
      res.json({ result: rawText });
    } catch (err: any) {
      console.error("Error in /api/scan-email:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Panic Button Triage Endpoint
  app.post("/api/panic", async (req, res) => {
    try {
      const { tasks } = req.body;
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: "No tasks list provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = "You are a productivity triage engine. You will be given a list of tasks with their urgency levels and deadlines. Your ONLY job is to pick the single most important task the user should work on RIGHT NOW for the next 20 minutes. Consider urgency first, then point-of-no-return proximity, then impact. Return ONLY a JSON object with exactly these fields: { taskTitle: string, reason: string (max 20 words explaining why this task is most critical), action: string (a single specific action to take in the next 20 minutes, max 15 words) }. Never return anything except this JSON object.";

      const taskListStr = tasks.map((t: any) => `${t.title} | ${t.urgency} | ${t.deadline}`).join("\n");
      const contents = `Here are my current tasks:\n${taskListStr}\n\nPick the single most important one.`;

      const response = await retryWithDelay(async () => {
        return await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });
      });

      const rawText = response.text || "{}";
      const result = JSON.parse(rawText);
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/panic:", err);
      const errMsg = err?.message || err?.toString?.() || '';
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded') || err?.status === 503;
      res.status(is503 ? 503 : 500).json({ error: is503 ? 'high demand' : 'fallback' });
    }
  });

  // Escape Hatch Endpoint
  app.post("/api/escape-hatch", async (req, res) => {
    try {
      const { taskTitle, taskContext } = req.body;
      if (!taskTitle) {
        return res.status(400).json({ error: "No taskTitle provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = "You are a professional communication assistant. You will be given a task description and context about a missed or overdue commitment. Write a short, sincere, human-sounding message the user can send to recover from this situation. It should apologize briefly, explain without over-excusing, and either request a short extension or confirm the user will deliver very soon. Keep it under 100 words. Sound like a real person, not a corporate template. Return ONLY the message text — no subject line, no greeting label, no JSON, just the message body.";

      const contents = `Task: ${taskTitle}. Context: ${taskContext}. This commitment is overdue. Write a recovery message.`;

      const response = await retryWithDelay(async () => {
        return await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
          },
        });
      });

      const draftText = response.text || "";
      res.json({ draft: draftText.trim() });
    } catch (err: any) {
      console.error("Error in /api/escape-hatch:", err);
      const errMsg = err?.message || err?.toString?.() || '';
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded') || err?.status === 503;
      res.status(is503 ? 503 : 500).json({ error: is503 ? 'high demand' : 'fallback' });
    }
  });

  // Decompose task endpoint
  app.post("/api/decompose", async (req, res) => {
    try {
      const { taskTitle, taskContext } = req.body;
      if (!taskTitle) {
        return res.status(400).json({ error: "No taskTitle provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = "You are a task decomposition engine. Your ONLY job is to break a given task into 3 to 6 clear, ordered, actionable subtasks. Each subtask must be something a person can physically do. Return ONLY a valid JSON array with no explanation, no preamble, no markdown, no code fences. Each item must have exactly two fields: step (string: the subtask description, max 10 words) and minutes (number: realistic time estimate in minutes, between 5 and 120). Example: [{\"step\":\"Write the outline\",\"minutes\":20},{\"step\":\"Draft the main content\",\"minutes\":45}]. Never return anything except the JSON array.";

      const contents = `Break this task into subtasks: ${taskTitle}. Context: ${taskContext}`;

      const response = await retryWithDelay(async () => {
        return await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });
      });

      const rawText = response.text || "[]";
      let parsed = JSON.parse(rawText.trim());
      res.json({ subtasks: parsed });
    } catch (err: any) {
      console.error("Error in /api/decompose:", err);
      const errMsg = err?.message || err?.toString?.() || '';
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded') || err?.status === 503;
      res.status(is503 ? 503 : 500).json({ error: is503 ? 'high demand' : 'fallback' });
    }
  });

  // Renegotiate tasks endpoint
  app.post("/api/renegotiate", async (req, res) => {
    try {
      const { tasks } = req.body;
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: "No tasks list provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = "You are a ruthless but compassionate productivity advisor. You will be given a list of tasks. Your job is to help the user decide what to protect, what to request an extension on, and what to drop or defer. Be direct and honest. Return ONLY a valid JSON object with exactly this structure: { protect: Array<{title: string, reason: string (max 15 words)}>, extend: Array<{title: string, reason: string (max 15 words), draft: string (a short human-sounding message requesting an extension, under 80 words)}>, drop: Array<{title: string, reason: string (max 15 words), draft: string (a short human-sounding message declining or deferring, under 80 words)}) }. Rules: protect array should have 1-2 tasks maximum. extend array should have 0-2 tasks. drop array gets everything else. Never return anything except this JSON object.";

      const taskListStr = tasks.map((t: any) => `${t.title} | ${t.urgency} | ${t.deadline} | ${t.context}`).join("\n");
      const contents = `Here are my tasks:\n${taskListStr}\n\nHelp me decide what to protect, extend, and drop.`;

      const response = await retryWithDelay(async () => {
        return await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });
      });

      const rawText = response.text || "{}";
      const result = JSON.parse(rawText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/renegotiate:", err);
      const errMsg = err?.message || err?.toString?.() || '';
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded') || err?.status === 503;
      res.status(is503 ? 503 : 500).json({ error: is503 ? 'high demand' : 'fallback' });
    }
  });

  // Scan image endpoint (multimodal)
  app.post("/api/scan-image", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing imageBase64 or mimeType" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await retryWithDelay(async () => {
        return await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64
                  }
                },
                {
                  text: "Look carefully at every part of this image and extract ALL tasks, commitments, plans, meetups, and deadlines visible in the text. This includes: explicit deadlines (pay by Friday), scheduled meetings (meet Saturday at 5 PM), plans that were agreed upon (we're meeting at X place on Y date), things someone needs to do or remember (book hotel, pay fee, confirm headcount). Be thorough — read every message carefully. Return ONLY a valid JSON array with no explanation, no preamble, no markdown, no code fences. Each item must have exactly these three fields: title (string: a short clear task name, max 8 words), deadline (string: the specific date/time mentioned, or 'No deadline mentioned' if none), urgency (string: must be exactly 'high', 'medium', or 'low' — high means due within 48 hours, medium means due within a week, low means due later or no clear deadline). If you genuinely find nothing actionable, return []. Never return anything except the JSON array."
                }
              ]
            }
          ]
        });
      });

      const rawText = response.text || "[]";
      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();
      
      let parsed = JSON.parse(cleanText);
      res.json({ tasks: parsed });
    } catch (err: any) {
      console.error("Error in /api/scan-image:", err);
      const errMsg = err?.message || err?.toString?.() || '';
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded') || err?.status === 503;
      res.status(is503 ? 503 : 500).json({ error: is503 ? 'high demand' : 'fallback' });
    }
  });

  // Parse natural language task endpoint
  app.post("/api/parse-task", async (req, res) => {
    try {
      const { input, currentDate } = req.body;
      if (!input) return res.json({ title: input || '', deadline: null, deadlineISO: null, urgency: 'low', description: null });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.json({ title: input, deadline: null, deadlineISO: null, urgency: 'low', description: null });

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: `Current date: ${currentDate || new Date().toISOString()}. Parse this task: ${input}` }] }],
        config: {
          systemInstruction: "You are a task parser. The user will type a natural language task description that may include a task name, a deadline, and extra context. Extract each part. Return ONLY a valid JSON object with exactly these fields: { title: string (the core task name, max 8 words, no deadline info in here), deadline: string | null (the deadline phrase as typed by user, e.g. 'day after tomorrow at 5pm', or null if none mentioned), deadlineISO: string | null (the deadline as ISO 8601 datetime, or null if none), urgency: 'high' | 'medium' | 'low', description: string | null (any extra context beyond the task name and deadline, or null if none) }. If the input contains apostrophes, commas, or special characters, handle them correctly in the JSON. The description field should capture any context after the main task and deadline. For example: 'buy birthday gift for friend in 2 days, it's a surprise party' → title: 'Buy birthday gift for friend', deadline: 'in 2 days', description: 'it is a surprise party'. If the input contains words like 'ASAP', 'urgent', 'immediately', 'right now', 'as soon as possible' — treat the deadline as 'today' and set deadlineISO to today at 11:59 PM. Set urgency to 'high'. Urgency must be calculated from deadlineISO relative to currentDate: if deadlineISO is within 48 hours of currentDate → high, if within 7 days → medium, if beyond 7 days or no deadline → low. Always calculate from the actual ISO date, not from the deadline phrase. Never return anything except this JSON object.",
        },
      });

      let rawText = (response.text || '').trim();
      if (rawText.startsWith('```json')) rawText = rawText.substring(7);
      else if (rawText.startsWith('```')) rawText = rawText.substring(3);
      if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);
      rawText = rawText.trim();

      const parsed = JSON.parse(rawText);
      res.json({
        title: parsed.title || input,
        deadline: parsed.deadline || null,
        deadlineISO: parsed.deadlineISO || null,
        urgency: ['high', 'medium', 'low'].includes(parsed.urgency) ? parsed.urgency : 'low',
        description: parsed.description || null,
      });
    } catch (err: any) {
      console.error("Error in /api/parse-task:", err?.message || err);
      res.json({ title: req.body?.input || '', deadline: null, deadlineISO: null, urgency: 'low', description: null });
    }
  });

  // Parse natural language date endpoint
  app.post("/api/parse-date", async (req, res) => {
    try {
      const { input, currentDate } = req.body;
      if (!input || !currentDate) {
        return res.status(400).json({ date: null, readable: null, confidence: 'low' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ date: null, readable: null, confidence: 'low' });
      }

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: `Current date and time: ${currentDate}. Parse this deadline: ${input}` }] }],
        config: {
          systemInstruction: "You are a date parser. The user will give you a natural language date or deadline description. Your ONLY job is to convert it to an exact date and time. Return ONLY a valid JSON object with exactly these fields: { date: string (ISO 8601 format like '2026-06-29T23:59:00'), readable: string (human friendly like 'Friday, Jun 27 at 11:59 PM'), confidence: 'high' | 'low' }. Use the provided current date as reference for relative dates like 'tomorrow' or 'next week'. If the input is completely unparseable or nonsensical, return { date: null, readable: null, confidence: 'low' }. Never return anything except this JSON object.",
        },
      });

      let rawText = (response.text || '').trim();
      if (rawText.startsWith('```json')) rawText = rawText.substring(7);
      else if (rawText.startsWith('```')) rawText = rawText.substring(3);
      if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);
      rawText = rawText.trim();

      const parsed = JSON.parse(rawText);
      res.json({
        date: parsed.date || null,
        readable: parsed.readable || null,
        confidence: parsed.confidence === 'high' ? 'high' : 'low',
      });
    } catch (err: any) {
      console.error("Error in /api/parse-date:", err?.message || err);
      res.json({ date: null, readable: null, confidence: 'low' });
    }
  });

  // Vite middleware for development or serving built static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
