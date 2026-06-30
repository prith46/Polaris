# Polaris
### Your fixed point before the deadline.

> **Hackathon:** The Last-Minute Life Saver — Coding Ninjas Developer Community  
> **Challenge:** Challenge 1  
> **Developer:** Prithiviraj M  
> **Live Demo:** [polaris-765683893963.asia-south1.run.app](https://polaris-765683893963.asia-south1.run.app)

---

## What is Polaris?

Most people don't miss deadlines because they're disorganized. They miss them because the deadline was never on their radar — buried in an email, mentioned in passing, or tucked into the third paragraph of what looked like a routine notification.

Polaris finds what you missed before it's too late.

It reads your emails and images, pulls out every commitment and deadline hidden inside them, and adds them to your task board automatically. Beyond finding tasks, it helps you act on them — drafting recovery messages, triaging what to do next, and helping you renegotiate what you genuinely can't finish.

---

## Key Features

- **AI Email Scanner** — Scans inbox emails and extracts every hidden deadline using Gemini
- **Multimodal Image Scanner** — Upload any screenshot (WhatsApp, whiteboard, notes) and Gemini extracts tasks from it visually
- **Kanban Task Board** — Three-column board (To Do / In Progress / Done) with smart auto-prioritization
- **Panic Button** — Gemini picks the single highest-leverage task to focus on right now
- **Escape Hatch** — Drafts a human-sounding recovery message for any overdue commitment
- **Renegotiation Agent** — Decides what to protect, extend, or drop when you're overcommitted
- **Task Decomposition** — Breaks any task into 3–6 ordered subtasks with time estimates
- **Natural Language Input** — Type "pay rent tomorrow" and Gemini parses title, deadline, and urgency
- **Commitment Density Chart** — 7-day bar chart showing load per day before it becomes a crisis
- **Judge Demo Mode** — 12-step cinematic walkthrough built for evaluators

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Frontend |
| Vite 6 | Build tool + dev server |
| Node.js + Express | Backend API server |
| Gemini API (`gemini-3.1-flash-lite`) | All AI features |
| Tailwind CSS 4 | Styling |
| localStorage | Client-side persistence |
| Google Cloud Run | Deployment |
| Google Cloud Build | CI/CD |

---

## Architecture

```
User Browser
└── React 19 + TypeScript + Vite (port 5173)
    └── /api/* requests (Vite proxy)
        └── Node.js + Express (port 3000)
            └── Gemini API (gemini-3.1-flash-lite)
                └── API key server-side only, never exposed to browser
```

All AI calls go through Express endpoints. The Gemini API key never touches the client bundle.

---

## Local Setup

**Prerequisites:** Node.js 20+

```bash
git clone https://github.com/prith46/Polaris.git
cd Polaris
npm install
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

Run locally:

```bash
npm run dev
```

This starts Vite on port 5173 and Express on port 3000. Vite proxies all `/api/*` requests to Express automatically.

---

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/scan-email` | POST | Extract deadlines from email body |
| `/api/scan-image` | POST | Extract tasks from image (multimodal) |
| `/api/panic` | POST | Pick highest-leverage task to act on now |
| `/api/escape-hatch` | POST | Draft recovery message for overdue task |
| `/api/decompose` | POST | Break task into ordered subtasks |
| `/api/renegotiate` | POST | Triage tasks into protect / extend / drop |
| `/api/parse-task` | POST | Parse natural language task input |
| `/api/roast` | POST | Generate productivity roast from session stats |

---

## Deployment

Deployed on **Google Cloud Run** via **Google Cloud Build** with continuous deployment from this repository.

Every push to `main` automatically triggers a build and deploys to:  
`https://polaris-765683893963.asia-south1.run.app`

---

*Built by Prithiviraj M for the Coding Ninjas Developer Community Hackathon.*
