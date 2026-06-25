# Polaris — Technical Documentation
## Modules 1–5 | Built by Prithiviraj M

---

## 1. Project Overview
Polaris is a minimalist, premium personal productivity and deadline tracking application designed to help users regain control over their commitments. The application works as a buffer between the user's overwhelming inbox and their actual checklist, parsing incoming messages to uncover critical deadlines that often get buried in the noise of daily correspondence. By combining a deliberate, clutter-free user interface with local intelligence, it transforms raw communications into actionable steps.

At its core, the application addresses the cognitive overload of managing tasks across disconnected channels. Sifting through emails, identifying due dates, and estimating the urgency of multiple tasks is a source of friction. Polaris integrates these steps into a single cohesive experience, helping users categorize their workload visually and react to incoming tasks dynamically without needing external organizers.

**The one-sentence pitch:** "The app that finds the deadline buried in your inbox and writes your way out of it."

**Target user:** High-friction professionals, students, and freelancers who receive dozens of requests, follow-ups, and notifications daily and need a centralized, intelligent dashboard to track deadlines and generate professional replies when timelines slip.

---

## 2. Architecture Overview
Polaris is structured as a full-stack JavaScript/TypeScript application with a clean separation of concerns.

- **Frontend:** React 19 + TypeScript + Vite (port 5173)
- **Backend:** Node.js + Express + TypeScript (port 3000)
- **AI:** Gemini API (gemini-2.5-flash-lite) via @google/genai SDK
- **Communication:** REST API, Vite proxies /api/* to Express
- **Security:** API key server-side only, never in client bundle

### Data Flow Diagram
```
User ──> React Frontend (5173) ──> Express Server (3000) ──> Gemini API (gemini-2.5-flash-lite) ──> back
```

---

## 3. Design System
- **Color palette:** #0E1B2A (Midnight Ink), #F7F5F0 (Warm Paper), #C8893B (Amber Signal), #5B6B7B (Slate), #B23A2E (Alert Rust)
- **Typography:** Fraunces serif weight 500 for headings, Inter sans-serif 400/500 for everything else
- **Design principles:** deliberate restraint, generous whitespace, no AI-app tells, one accent color
- **Component patterns:** urgency pills (rust/amber/slate), task cards, action buttons (navy primary, outlined secondary)

---

## 4. Module Documentation

### Module 1 — App Shell
**What it does:** Builds the empty premium frame of Polaris — top bar, warm paper background, serif title "Polaris," tagline, and centered placeholder. No functionality, just the visual foundation every other module inherits.
- **Files changed:** App.tsx, index.css
- **Key components:** Top bar, main content area placeholder
- **API endpoints:** None
- **State variables added:** activeTab (default 'tasks')
- **Edge cases handled:** None — shell only
- **Known limitations:** No content yet

### Module 2 — Task Cards
**What it does:** Renders 4 hardcoded seed tasks as premium cards with urgency-coded pills, Fraunces serif titles, context lines, and two action buttons. Pure display — no interaction.
- **Files changed:** App.tsx, types.ts
- **Key components:** TaskCard component, urgency pill color mapping
- **API endpoints:** None
- **State variables added:** tasks array (4 seed tasks with title, pillText, urgency, context, primaryButton, secondaryButton)
- **Urgency color mapping:** high → #B23A2E rust, medium → #C8893B amber, low → #5B6B7B slate
- **Edge cases handled:** Urgency values outside high/medium/low default to low
- **Known limitations:** Static data only, no interaction

### Module 3 — Add & Manage Tasks
**What it does:** Adds a text input to create new tasks and a "Done" control to remove them. All state is in-memory — refresh resets to the 4 seed tasks.
- **Files changed:** App.tsx
- **Key components:** AddTaskInput, Done control per card
- **API endpoints:** None
- **State variables added:** addTaskInput string
- **Behavior:** Empty/whitespace input rejected. New tasks get pill "No deadline set," urgency low, context "Newly added. Details can be set later."
- **Edge cases handled:** Empty input, whitespace-only input, identical task titles (Done removes correct one by index), rapid adds
- **Known limitations:** No persistence — resets on refresh

### Module 4 — Gmail-Style Inbox
**What it does:** A convincing fake email client inside Polaris with 25 seeded emails, Gmail-style left sidebar, category tabs (Primary/Promotions/Updates/Forums), reading view, and unread indicators with red dots.
- **Files changed:** App.tsx
- **Key components:** InboxView, EmailList, EmailRow, EmailReadingView, sidebar nav
- **API endpoints:** None
- **State variables added:** inboxView ('list' | 'reading'), selectedEmail, inboxSubTab ('emails' | 'scan')
- **Email structure:** { id, from, subject, preview, body, timestamp, unread, starred, important, avatarColor, categoryPill }
- **Unread behavior:** Bold sender/subject, red dot indicator. Opening marks as read.
- **Known limitations:** Static emails, no real Gmail OAuth, no compose/reply/delete

### Module 5 — Email Scanner
**What it does:** Adds a "Scan for deadlines" button in the email reading view that calls Gemini to extract commitments from the email body and adds them as task cards automatically.
- **Files changed:** App.tsx, server.ts
- **Key components:** ScanButton, scan result message
- **API endpoint:** POST /api/scan-email

Request body:
```json
{
  "emailBody": "string — the full email body text",
  "senderName": "string — the sender's name for context line"
}
```

Response:
```json
{
  "tasks": [
    {
      "title": "string — max 8 words",
      "deadline": "string — deadline phrase or 'No deadline mentioned'",
      "urgency": "high" | "medium" | "low"
    }
  ]
}
```

Error response: `{ "error": "fallback" }` with status 500

- **Gemini system instruction:** Strict extraction engine — returns only JSON array, no prose, no markdown. Urgency rules: high = within 48hrs or overdue, medium = within a week, low = later.
- **State variables added:** scanningEmailId, scanResultMessage
- **Fallback behavior:** On any API failure → shows "Couldn't scan right now — try again." in rust red. App never crashes.
- **Edge cases handled:** Empty array (no tasks found) → "No deadlines found in this email.", malformed JSON → graceful error, timeout after 10s → error message
- **Story emails expected results:**
  - City Power & Utilities → "Pay electricity bill" high urgency
  - Prof. Anjali Sharma → "Send recommendation letter" high urgency
  - Rahul Mehta → "Attend project sync meeting" medium urgency
  - Scholarship Office → "Submit enrollment confirmation form" medium urgency
  - DevWeekly → empty array (noise email)
  - Aman Gupta → empty array (noise email)

---

## 5. API Reference (Modules 1-5)

### POST /api/scan-email
**Purpose:** Extract tasks and deadlines from an email body using Gemini
**Method:** POST
**Path:** /api/scan-email
**Auth:** None (key is server-side)

Request:
```json
{
  "emailBody": "string (required)",
  "senderName": "string (required)"
}
```

Response 200:
```json
{
  "tasks": [
    {
      "title": "string",
      "deadline": "string",
      "urgency": "high" | "medium" | "low"
    }
  ]
}
```

Response 500:
```json
{ "error": "fallback" }
```

**Example request:**
```json
{
  "emailBody": "Your electricity bill of ₹2,340 is due on Friday the 27th.",
  "senderName": "City Power & Utilities"
}
```

**Example response:**
```json
{
  "tasks": [
    {
      "title": "Pay electricity bill",
      "deadline": "Friday the 27th",
      "urgency": "high"
    }
  ]
}
```

---

## 6. Gemini Integration (Modules 1-5)
- Model: gemini-2.5-flash-lite — cheapest available, fast, sufficient for text extraction
- Retry logic: 3 attempts with 2 second delay between attempts
- Retry conditions: 503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED, "high demand" errors
- No retry on: 404 NOT_FOUND, 400 BAD_REQUEST
- Token estimate per scan-email call: ~630 tokens (400 system + 150 email + 80 response)
- Structured output: responseMimeType not used — instead strict system instruction forces JSON
- Fallback: every endpoint has a hardcoded fallback so app never breaks

---

## 7. Testing (Modules 1-5)
- Framework: Vitest 4.x + React Testing Library + jsdom
- Setup file: tests/setup.ts imports @testing-library/jest-dom
- Config: vitest.config.ts with jsdom environment and globals: true
- Test files: module1-5.test.tsx, stress.test.tsx
- Total tests at Module 5 completion: 43 passing
- Run: npm run test
- Watch mode: npm run test:watch

---

## 8. Known Issues at Module 5
- Gemini returning 503 transiently — retry logic handles it, graceful fallback always shown
- No persistent storage — all tasks reset on page refresh
- Image scanning not yet available (added in Module 10)
- Tasks added via scan use "No deadline set" pill if deadline string is unparseable

---

## 9. Development Setup
Prerequisites: Node.js 18+, npm

Installation:
```bash
npm install
```

Environment variables — create .env in project root:
```env
GEMINI_API_KEY=your_key_here
APP_URL=http://localhost:3000
```

Run locally:
```bash
npm run dev
```
(starts both Vite on :5173 and Express on :3000 concurrently)

Run tests:
```bash
npm run test
```

Build for production:
```bash
npm run build
```

---

## 10. Roadmap
- Module 6: Time-to-Disaster countdown + Calendar + Dashboard ✅
- Module 7: Panic Button + Escape Hatch ✅
- Module 8: Task Decomposition Engine ✅
- Module 9: Renegotiation Agent ✅
- Module 10: Multimodal Image Scanner ✅
- Module 11: Persistent Storage (localStorage)
- Module 12: Mobile Responsiveness
- Module 13: Polish + Graceful Degradation
- Module 14: Overdue Task Lifecycle + Recovery Score
- Module 15: AI Extraction Ledger
- Module 16: Commitment Density Score + Proactive Warning
- Module 17: Future You timeline
- Module 18: Roast My Habits
- Module 19: Judge Demo Mode
- Module 20: Deploy to GCP
- Module 21: Google Doc finalize
- Module 22: README update
- Module 23: Final testing + submission
