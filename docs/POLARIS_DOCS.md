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

---

## 11. Modules 6–11 Technical Reference

### Module 6 — Time-to-Disaster Countdown + Calendar + Dashboard
**What it does:** Calculates and displays a time-to-disaster countdown bar on each task card indicating the start-by time rather than the due date. It also provides a monthly calendar tab to plot tasks with urgency indicators and a dashboard tab displaying five key performance metric cards.
**Files changed:**
- [src/App.tsx](file:///e:/polaris/src/App.tsx)
**Key components/functions:**
- `parseDeadline()`: Pure frontend helper function that extracts due dates and times from a text deadline.
- Countdown Bar: A visual bar rendered on each task card that calculates and shows the point-of-no-return remaining.
- Calendar Tab: Renders a monthly calendar grid plotting tasks on their respective due dates with color-coded urgency dots.
- Dashboard Tab: Features five overview panels (Task Overview, Urgency Breakdown, Deadlines This Week, Polaris Impact, and Point-of-No-Return Alerts).
**API endpoints used:** None
**State variables added:**
- `currentCalendarMonth` (Date object representing the currently viewed calendar month)
- `animateDashboard` (boolean flag to trigger dashboard intro animations)
**Edge cases handled:**
- Countdown auto-updates every 60 seconds using a React-level `setInterval` timer.
- Title keywords mapped to estimated task durations (pay/bill = 20min, email/draft = 45min, letter/write = 120min, meeting = 60min, default = 30min).
**Known limitations:**
- Calculations are strictly frontend-based and rely on client system time.

### Module 7 — Panic Button + Escape Hatch
**What it does:** Introduces a "Panic Button" banner in the tasks view that triggers focus mode on the single most critical task. It also adds an "Escape Hatch" modal for overdue tasks to quickly copy a pre-written professional apology or draft recovery message.
**Files changed:**
- [src/App.tsx](file:///e:/polaris/src/App.tsx)
- [server.ts](file:///e:/polaris/server.ts)
**Key components/functions:**
- Panic Button: Header banner element that filters list view down to a single urgent task.
- Escape Hatch Modal: Interactive dialog popup displaying an automated recovery reply draft.
- Clipboard copy: Trigger action to copy the generated response template.
**API endpoints used:**
- `POST /api/panic`
  - Request schema:
    ```json
    {
      "tasks": "Array of active task objects"
    }
    ```
  - Response schema:
    ```json
    {
      "taskTitle": "string",
      "reason": "string",
      "action": "string"
    }
    ```
- `POST /api/escape-hatch`
  - Request schema:
    ```json
    {
      "taskTitle": "string",
      "context": "string"
    }
    ```
  - Response schema:
    ```json
    {
      "draft": "string"
    }
    ```
**State variables added:**
- `isFocusMode` (boolean to toggle the filtered view state)
- `focusTask` (Task | null representing the prioritized focus task)
- `focusBannerData` (custom banner message data object or null)
- `isEscapeModalOpen` (boolean visibility state for the escape modal)
- `escapeDraft` (string containing the active copyable text draft)
- `escapeLoadingTaskId` (string | null holding the task ID while request loads)
**Edge cases handled:**
- Panic falls back to the first high-urgency task if API request fails.
- Escape hatch falls back to a hardcoded draft recovery message upon connection issues.
**Known limitations:**
- Requires manual click triggers; focus view operates purely in client-side memory.

### Module 8 — Task Decomposition Engine
**What it does:** Allows users to decompose complex tasks into 3 to 6 ordered subtasks with estimated completion times using Gemini. These subtasks are rendered as an interactive checklist directly inside the task card.
**Files changed:**
- [src/App.tsx](file:///e:/polaris/src/App.tsx)
- [src/types.ts](file:///e:/polaris/src/types.ts)
- [server.ts](file:///e:/polaris/server.ts)
**Key components/functions:**
- "Break it down" trigger: Button on individual task cards initiating decomposition.
- Subtask checklist: Collapsible list component showing progress checklist items.
- Green completion banner: Visual alert rendering once all subtasks are checked.
**API endpoints used:**
- `POST /api/decompose`
  - Request schema:
    ```json
    {
      "taskTitle": "string",
      "taskContext": "string"
    }
    ```
  - Response schema:
    ```json
    {
      "subtasks": [
        {
          "step": "string",
          "minutes": "number"
        }
      ]
    }
    ```
**State variables added:**
- `subtasks` (list of checklist items added directly to the Task model schema)
- `decomposing` (boolean loading state per task)
- `decomposed` (boolean status flag per task)
- `subtasksCollapsed` (boolean display toggle per task)
**Edge cases handled:**
- Expand/collapse chevron behavior checks.
- Aggregate minutes calculation for total subtask times.
- Fallback to 5 generic subtasks (Review, Gather, Complete, Review errors, Submit) on service failure.
**Known limitations:**
- Subtasks do not convert into top-level cards or sync to external calendar utilities.

### Module 9 — Renegotiation Agent
**What it does:** Evaluates the active workload and generates a renegotiation plan that separates tasks into protect, extend, or drop lists. It displays this layout in a color-coded modal and includes copyable templates for extension or dropping.
**Files changed:**
- [src/App.tsx](file:///e:/polaris/src/App.tsx)
- [server.ts](file:///e:/polaris/server.ts)
**Key components/functions:**
- "I can't do all of this": Global renegotiation action trigger button.
- Renegotiation Modal: Three-column layout displaying the prioritized action list (Protect, Extend, Drop).
- Copy draft control: Secondary click action targeting extend/drop items.
**API endpoints used:**
- `POST /api/renegotiate`
  - Request schema:
    ```json
    {
      "tasks": "Array of active task objects"
    }
    ```
  - Response schema:
    ```json
    {
      "protect": "Array of task titles",
      "extend": "Array of objects with taskTitle and draft response text",
      "drop": "Array of objects with taskTitle and draft response text"
    }
    ```
**State variables added:**
- `isRenegotiateLoading` (boolean renegotiation request state flag)
- `isRenegotiateModalOpen` (boolean modal display visibility status)
- `renegotiatePlan` (data object containing the protect/extend/drop recommendations)
- `copiedDraftTaskId` (string or null representing the recently copied task ID)
**Edge cases handled:**
- Local fallback logic: protects the first high-urgency task, extends the first medium-urgency task, and drops all others.
- Copy confirmation state updates with visual indicators.
**Known limitations:**
- Does not automatically remove or update tasks on the board; actions are copy-only.

### Module 10 — Multimodal Image Scanner
**What it does:** Embeds an image uploader workspace in the Inbox sub-tab for scanning PNG, JPG, and WEBP formats. The server parses the base64-encoded image with Gemini to detect tasks and deadlines and adds them to the list.
**Files changed:**
- [src/App.tsx](file:///e:/polaris/src/App.tsx)
- [server.ts](file:///e:/polaris/server.ts)
**Key components/functions:**
- Uploader dropzone: Area supporting drag-and-drop or click-to-upload workflows.
- Base64 parser: Client-side file reader converting image selections into binary-to-text strings.
**API endpoints used:**
- `POST /api/scan-image`
  - Request schema:
    ```json
    {
      "imageBase64": "string",
      "mimeType": "string"
    }
    ```
  - Response schema:
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
**State variables added:**
- `inboxSubTab` (string routing tab selector for emails/scan)
- `imageFile` (File metadata tracker or null)
- `imagePreviewUrl` (preview string of selected file or null)
- `imageScanError` (error feedback string or null)
- `isImageScanning` (boolean scan state indicator)
- `imageScanResultState` (state tracker representing the scan status)
**Edge cases handled:**
- Graceful UI failure message displays: "Couldn't scan this image — try again." on all processing exceptions.
- Rejecting input files larger than 10MB limit.
**Known limitations:**
- Requires clean image text structure; "Try an example" shortcut is removed.

### Module 11 — localStorage Persistence
**What it does:** Saves tasks and metrics counts across sessions, verifying schema properties upon application load. It also provides a hidden "Reset demo" button to refresh storage and initialize default seed data.
**Files changed:**
- [src/App.tsx](file:///e:/polaris/src/App.tsx)
- [tests/setup.ts](file:///e:/polaris/tests/setup.ts)
**Key components/functions:**
- Schema validator: Verifier routine ensuring stored JSON maps correctly to required properties.
- "Reset demo" trigger: Invisible bottom-right corner control that registers on cursor hover.
**API endpoints used:** None
**State variables added:** None (binds existing react-state values to localStorage keys)
**Edge cases handled:**
- `try/catch` wrappers protecting storage read/write calls against Private Browsing limits.
- Validation checks returning user data back to `INITIAL_TASKS` if malformed JSON is found.
- Test-suite wrapper clearing localStorage via `afterEach` hook to avoid side effects.
**Known limitations:**
- Operations are limited to local browser sandbox limits; data is not synchronized with a cloud backend.

