import dotenv from 'dotenv';
dotenv.config();

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
        model: "gemini-2.0-flash",
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
