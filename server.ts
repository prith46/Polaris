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
  const PORT = 3000;

  app.use(express.json());

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
        model: "gemini-2.5-flash-lite",
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
          model: "gemini-2.5-flash-lite",
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
      res.status(500).json({ error: "fallback" });
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
          model: "gemini-2.5-flash-lite",
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
      res.status(500).json({ error: "fallback" });
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
