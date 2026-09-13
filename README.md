# SkillBridge — Smart Campus Freelancing Hub

SkillBridge is a campus-only freelancing marketplace for students, built around three ideas: work should be **verified** (posted and taken by real students at real colleges), **matched** (AI-ranked against your actual skills, not just sorted by date), and **safe for your GPA** (your academic schedule automatically caps how much work you take on). It also includes an **AI Learning Gap Detector** — a diagnostic-quiz engine that finds exactly which concepts you're weak on and builds an adaptive study plan around them.

This document is both a project overview and a user manual — it explains what the app does screen by screen, and how to get it running locally. For the exact shell commands (install, run, database, git), see **[COMMANDS.md](COMMANDS.md)**.

---

## Table of contents

- [What's in this repo](#whats-in-this-repo)
- [Feature tour](#feature-tour)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Known limitations / roadmap](#known-limitations--roadmap)
- [Troubleshooting](#troubleshooting)

---

## What's in this repo

| Path | What it is |
|---|---|
| [`backend/`](backend) | Node.js + Express + PostgreSQL (Sequelize) REST API, JWT auth, Socket.IO |
| [`smarthub-fresh/`](smarthub-fresh) | The app itself — React Native + Expo Router, runs on iOS, Android, and web |
| [`scripts/`](scripts) | A one-time setup helper (`dev-setup.sh`) |

There's no separate "frontend" folder — the Expo project lives in `smarthub-fresh/` (the original project codename; the product itself is now branded SkillBridge).

---

## Feature tour

### Sign up & campus verification
New accounts register with an email and are auto-verified if the email's domain matches a known college in the `College` table (seeded on first boot with a handful of real IITs/NITs/etc. plus a demo domain, `skillbridge.edu`, for testing). Verified accounts can post projects; unverified accounts can still browse and apply.

### Home
A snapshot of the week: your current safe freelance-hours cap (see **Schedule & Workload** below) and quick links into Projects and For You.

### Projects
Browse all open campus projects. Search by keyword, filter by category, sort by latest or budget. Each project shows its budget, category, posting college (if any), and estimated weekly time commitment. Tapping a project opens its full details with an **Apply** button — applying checks your current workload and warns you (without blocking) if the project would push you past what your schedule says is safe that week.

### For You (AI recommendations)
Every open project is scored against your profile: **skill overlap** (do your listed skills appear in the project's required skills — 70% of the score) plus **budget fit** relative to your experience (30%). Only projects scoring above a relevance threshold are shown, ranked highest-match-first. This is computed live from your `Profile → Skills` list and the current Projects board — there's no separate data to seed, add more skills to your profile or more projects to change what shows up here.

### AI Learning Gap Detector (Learn tab)
A rule-based (no external AI API required) engine that turns a short quiz into a personalized study plan:
1. Pick a subject and take a diagnostic quiz — a handful of multiple-choice questions spread across every concept in that subject.
2. The backend scores your accuracy **per concept** (not just an overall score) and flags anything below 60% as a gap.
3. You get a study plan: weak concepts ranked worst-first, each with a short study tip and 2–3 targeted practice questions (answers and explanations included, since this is self-study, not a graded test).
4. Retake the quiz any time — the plan is **fully regenerated** from your latest attempt, so it adapts automatically as you improve.

Seeded out of the box with one subject, **Data Structures & Algorithms** (6 concepts, 24 questions) — see [`backend/services/learningSeedService.js`](backend/services/learningSeedService.js) if you want to add more subjects/concepts/questions.

### Schedule & Workload Manager
Log your recurring classes, upcoming exams, and assignment deadlines. The workload engine (see [`backend/services/workloadService.js`](backend/services/workloadService.js)) turns that into a single number — how many freelance hours you can safely take on *this week* — and throttles it further as exams or deadlines get close. This number is what powers the Home screen and the apply-time workload warning.

### Profile
Edit your name, bio, university/course/year, avatar, and skills. Your skills list is what the AI recommendation engine matches against, so keeping it current directly changes what shows up under For You.

---

## Tech stack

**Backend** — Node.js, Express, PostgreSQL via Sequelize, JWT (`jsonwebtoken` + `bcryptjs`) auth, Socket.IO, Helmet + `express-rate-limit` for basic hardening, Multer for avatar uploads.

**Frontend** (`smarthub-fresh/`) — React Native + Expo (SDK 54), Expo Router (file-based navigation, runs the same codebase on iOS/Android/web), React Native Reanimated for animation (including scroll-linked reveal transitions on the landing page), React Native Paper for a few form primitives, Axios for API calls, Firebase (client SDK, analytics only — auth is JWT-based, not Firebase Auth).

---

## Project structure

```
lenovo/
├── backend/
│   ├── server.js                  # Express app entry point, route wiring, seed calls on boot
│   ├── config/                    # DB connection, Firebase (client analytics only, unused server-side)
│   ├── models/                    # Sequelize models (User, Project, Application, College,
│   │                               #   ScheduleItem, Concept, Question, QuizAttempt, StudyPlan, ...)
│   ├── controllers/                # Route handlers
│   ├── routes/                     # Express routers, mounted under /api/v1/*
│   ├── services/                   # Business logic: workload calc, AI matching, gap detector,
│   │                               #   seed data (colleges, learning content, demo projects)
│   └── middleware/authMiddleware.js
│
├── smarthub-fresh/                 # The Expo app
│   ├── app/                        # Expo Router screens (file-based routing)
│   │   ├── index.js                # Pre-login landing page
│   │   ├── auth/                   # Login / register
│   │   ├── (tabs)/                 # Home, Projects, For You, Learn, Schedule, Profile
│   │   ├── project/[id].js         # Project details
│   │   └── learning/quiz.js        # Diagnostic quiz + results
│   ├── components/ui/              # Shared design-system components (buttons, progress bars, etc.)
│   ├── constants/appTheme.js       # Colors, spacing, typography — the app's single design system
│   └── services/api.js             # Axios client + one API namespace per backend resource
│
└── scripts/
    └── dev-setup.sh                 # Installs deps + copies .env.example → .env in both projects
```

---

## Getting started

Full command reference: **[COMMANDS.md](COMMANDS.md)**. Short version:

1. **Prerequisites**: Node.js 18+, npm, PostgreSQL running locally, Git. (Expo CLI is not a separate global install — `npx expo` handles it.)
2. **Backend**: copy `backend/.env.example` → `backend/.env`, fill in your Postgres credentials and a `JWT_SECRET`, create the database, `npm install`, `npm run dev`.
3. **Frontend**: copy `smarthub-fresh/.env.example` → `smarthub-fresh/.env` (the default already points at `http://localhost:5000/api/v1`), `npm install`, `npm start`.
4. Open the app in Expo Go, an iOS/Android simulator, or a browser (`w` in the Expo CLI, or `npm run web`).
5. Register an account. Use an email at a seeded college domain (see [`backend/services/verificationService.js`](backend/services/verificationService.js) — e.g. anything `@skillbridge.edu`) to get instantly verified and able to post projects.

The backend seeds itself on first boot: a college list, a Learning Gap Detector question bank, and ~13 demo campus projects (so Projects and For You aren't empty on a fresh clone). All seeds are no-ops if data already exists, so they're safe to leave running on every restart.

---

## Environment variables

### `backend/.env`

| Variable | Required | Notes |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Yes (unless `DATABASE_URL` set) | Local Postgres connection |
| `DATABASE_URL` | Alternative to the above | A single `postgresql://user:pass@host:port/db` URL |
| `JWT_SECRET` | Yes | Any long random string for signing auth tokens |
| `JWT_EXPIRES_IN` | No | Defaults sanely if unset |
| `PORT` | No | Defaults to `5000` |
| `NODE_ENV` | No | Set to `development` to get verbose Sequelize logging + `sync({ alter: true })` |

Everything else in `backend/.env.example` (AWS S3, Stripe, Razorpay, OpenAI, SMTP, Firebase Admin, LinkedIn) is a placeholder for features that aren't wired up yet — **not required to run the app locally.**

### `smarthub-fresh/.env`

| Variable | Required | Notes |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Backend base URL. `http://localhost:5000/api/v1` for local web/simulator. On a physical phone via Expo Go, use your computer's LAN IP instead of `localhost`. |

---

## API overview

All routes are mounted under `/api/v1`. Everything except `/auth/*` and `/colleges` requires `Authorization: Bearer <token>`.

| Base path | Purpose |
|---|---|
| `/auth` | register, login |
| `/profile` | get/update profile, upload avatar |
| `/projects` | list/search/filter, get by id, create, apply, my-projects, my-applications |
| `/recommendations` | AI-ranked project matches for the current user |
| `/schedule` | classes/exams/assignments CRUD + computed workload |
| `/learning` | subjects, diagnostic quiz, submit attempt, study plan, attempt history |
| `/colleges` | list of verification-eligible colleges |
| `/messages`, `/milestones`, `/payments` | backend routes exist; no frontend UI yet (see below) |

`GET /api` (no `/v1`) returns a JSON index of every mounted route. `GET /health` is a plain liveness check.

---

## Known limitations / roadmap

- **Messaging, milestones, and payments** have backend models/routes but no app screens yet — the project board and applications flow work end-to-end, but there's no in-app chat or payment UI.
- **Firebase** is initialized client-side (`smarthub-fresh/config/firebase.js`) for analytics only; it's tied to a real Firebase project and shouldn't be repointed casually.
- **AI matching and the Gap Detector are both rule-based**, not calls to an external LLM — no API key required, and both are easy to extend (see `backend/services/aiMatchingService.js` and `backend/services/gapDetectorService.js`).

---

## Troubleshooting

**`SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`** — `backend/.env` is missing or `DB_PASSWORD` isn't set. Copy `.env.example` and fill it in.

**CORS errors in the browser console** — the backend only allows `localhost`/`127.0.0.1` origins (any port) in dev. If you're hitting it from somewhere else, check `backend/server.js`'s CORS config.

**Projects / For You look empty** — the demo-data seed only runs once (it's a no-op if the `Project` table already has rows). If you cleared your database, restart the backend to reseed.

**"Port already in use"** — something else is already running on `5000` (backend) or `8081` (Expo). See [COMMANDS.md](COMMANDS.md) for how to find and stop it, or just let Expo pick a different port when it asks.
