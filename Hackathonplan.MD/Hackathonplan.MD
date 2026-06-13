# HACKATHON_PLAN.md — Mental Wellness Tracker

## Challenge (read every word)
Build a Generative AI-powered solution that helps students monitor and
improve their mental well-being during high-stakes board exams and
competitive entrance tests (NEET, JEE, CUET, CAT, GATE, UPSC).

Students face severe stress, burnout, and self-doubt. Use GenAI to:
- Analyze open-ended daily journaling and mood logs
- Uncover hidden stress triggers and emotional patterns standard trackers miss
- Provide conversational AI with hyper-personalized, contextual wellness support
- Deliver real-time tailored coping strategies, adaptive mindfulness exercises,
  and motivational encouragement
- Act as an empathetic, always-available digital companion

---

## What LAST time got us: 85.24 / #16
- Security: 98 ✅
- Problem Statement Alignment: 99 ✅
- Accessibility: 96 ✅
- Code Quality: 86 — room to improve
- Efficiency: 80 — needs work
- Testing: 0 ❌ — CRITICAL FIX, this alone cost ~5+ points on final score

## Target this time: 92+ / Top 5

---

## User
Indian student, 17–25, preparing for NEET/JEE/UPSC. Studying 10–14 hrs/day.
Feels isolated, anxious, burnt out. Won't talk to parents. Needs something
that listens, understands exam pressure specifically, and gives real help —
not generic "drink water and sleep" advice.

---

## Core User Journey (must work end-to-end)
1. Student opens app → greeted by name (simple onboarding: name + exam type)
2. Daily check-in: mood slider (1–10) + open journal text ("how are you feeling?")
3. AI analyzes entry → identifies stress triggers + emotional pattern
4. AI responds conversationally: empathetic acknowledgment + 1 coping strategy
   tailored to their exam type and stress level
5. Student sees their mood history as a simple chart (last 7 days)
6. Patterns surfaced: "You feel most stressed on Sundays before the week starts"

---

## Tech Stack (full functional app)

```
mental-wellness/
├── frontend/                   ← React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Onboarding.jsx        ← name + exam type (one-time)
│   │   │   ├── DailyCheckIn.jsx      ← mood slider + journal textarea
│   │   │   ├── AIResponse.jsx        ← empathetic reply + coping strategy
│   │   │   ├── MoodChart.jsx         ← 7-day mood history (recharts)
│   │   │   └── PatternInsight.jsx    ← AI-detected pattern callout
│   │   ├── hooks/
│   │   │   ├── useWellness.js        ← API calls + state
│   │   │   └── useMoodHistory.js     ← localStorage mood log
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    ← Node.js + Express
│   ├── server.js               ← POST /api/analyze, POST /api/pattern
│   ├── .env                    ← ANTHROPIC_API_KEY (never in frontend)
│   └── package.json
│
└── README.md
```

---

## Feature Priority

### P0 — Must ship (non-negotiable)
- Onboarding: student name + exam type selection (NEET/JEE/UPSC/CAT/GATE/CUET)
- Daily check-in: mood slider 1–10 + open journal textarea
- POST /api/analyze → Claude → empathetic response + coping strategy
- AI response rendered clearly: acknowledgment section + action section
- Mood saved to localStorage with timestamp
- 7-day mood chart (recharts line chart)
- Loading state during AI call
- Error handling if API fails

### P1 — Add if time allows
- Pattern insight: AI analyzes last 7 entries to surface stress trigger
- Coping strategy is exam-specific (NEET student gets different tip than UPSC)
- Streak counter: "You've checked in 4 days in a row"
- Motivational quote tailored to exam type on load
- Breathing exercise: simple animated 4-7-8 timer

### P2 — Skip
- Auth / user accounts
- Push notifications
- Backend mood storage (localStorage is fine for demo)
- Social features

---

## Backend Routes

### POST /api/analyze
Input: { name, examType, moodScore, journalEntry, recentMoods[] }
Output: { acknowledgment, copingStrategy, detectedTriggers[] }

### POST /api/pattern (P1)
Input: { name, examType, last7Entries[] }
Output: { pattern, insight, recommendation }

Security on every route:
- Input validation (reject empty, >1000 char journal)
- Rate limit: 10 req/min per IP
- CORS: frontend origin only
- Sanitize all inputs before sending to Claude
- Never return raw Claude errors to frontend

---

## Claude System Prompt — /api/analyze

```
You are an empathetic mental wellness companion for Indian students
preparing for high-stakes exams (NEET, JEE, UPSC, CAT, GATE, CUET).

You deeply understand Indian exam culture: parental pressure, peer competition,
the fear of wasting a year, coaching center stress, and the stigma around
admitting struggle. Never give generic advice.

Given a student's mood score and journal entry, return ONLY valid JSON:
{
  "acknowledgment": "2-3 sentences. Reflect what they're feeling. Be warm, specific, non-judgmental. Use their name.",
  "trigger": "1 phrase — the core stress trigger you detected",
  "copingStrategy": {
    "title": "Name of the technique",
    "steps": ["step 1", "step 2", "step 3"],
    "whyItWorks": "1 sentence tailored to their exam pressure"
  },
  "encouragement": "1 sentence. Specific to their exam. Not generic."
}

Rules:
- Never say "I understand" as an opener — show it instead
- Never suggest "talk to someone" as the only option
- Coping strategies must be doable in under 10 minutes
- Be honest, not artificially positive
- If moodScore is 3 or below, prioritize calm grounding over motivation
Return ONLY valid JSON. No markdown. No preamble.
```

---

## ❌ Testing = 0 Fix (CRITICAL — this cost us last time)

The platform scores Testing based on testable, structured code.
These are non-negotiable this time:

### 1. Pure utility functions (testable by design)
```js
// utils/mood.js
export const getMoodLabel = (score) => { ... }
export const getMoodColor = (score) => { ... }
export const formatDate = (timestamp) => { ... }
export const calculateStreak = (entries) => { ... }
export const detectWeakDay = (entries) => { ... }
```

### 2. Input validation functions (pure, testable)
```js
// utils/validation.js
export const validateJournalEntry = (text) => { ... }  // returns { valid, error }
export const validateMoodScore = (score) => { ... }
export const validateExamType = (type) => { ... }
```

### 3. API error handling (structured, not random try/catch)
```js
// utils/api.js
export const analyzeWellness = async (payload) => {
  // validate input
  // fetch with timeout
  // handle network error
  // handle non-200
  // handle malformed JSON
  // return { data, error }
}
```

### 4. Add a /health endpoint to backend
```js
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }))
```

### 5. PropTypes on all React components
```js
import PropTypes from 'prop-types'
DailyCheckIn.propTypes = {
  studentName: PropTypes.string.isRequired,
  examType: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired
}
```

---

## Design Direction

This is a wellness app for stressed students — NOT a clinical tool.
Feel: calm, warm, trustworthy. Like a senior student who gets it.

Palette:
- Background: #0F172A (deep navy — calm, focused, night study session)
- Card: #1E293B (slate — slightly lighter surface)
- Accent: #6366F1 (indigo — focused, not aggressive)
- Positive/calm: #10B981 (emerald green)
- Warning/stress: #F59E0B (amber — for low mood states)
- Text: #F1F5F9 (near white)
- Muted: #94A3B8

Mood slider: color-shifts from red (#EF4444) at 1 → amber → green (#10B981) at 10

Typography:
- Headings: system sans, medium weight — approachable not clinical
- Journal textarea: slightly larger, generous line height — feels like a diary
- AI response: slightly indented, different background — clearly "from the AI"

Signature detail:
AI response fades in word by word (typewriter effect) — feels like someone
is actually responding to you, not a JSON dump appearing instantly.

UI rules:
- Empty journal state: "What's on your mind today? No one is judging."
- Mood 1–3: UI shifts warmer, AI skips motivation and goes straight to grounding
- Fully mobile responsive (students use phones, not laptops)
- No placeholder text in final build
- All interactive elements keyboard accessible

---

## Build Phases

| Phase | What | Target |
|---|---|---|
| 1 | Scaffold: Vite+React frontend + Express backend + .env wired | 0:00–0:15 |
| 2 | Backend: /api/analyze route + Claude call + validation | 0:15–0:40 |
| 3 | Frontend: Onboarding + DailyCheckIn + AIResponse rendering | 0:40–1:10 |
| 4 | MoodChart (recharts) + localStorage history + Testing utils | 1:10–1:35 |
| 5 | Polish: animations, mobile layout, accessibility, PropTypes | 1:35–1:55 |
| 6 | Deploy Vercel + test live URL + PITCH.md | 1:55–2:20 |

Checkpoint after each phase:
git add . && git commit -m "checkpoint: [phase name]"

---

## Failure Recovery
- recharts not rendering: replace with a pure CSS bar chart (10 divs with height%)
- Claude returns bad JSON: add try/catch, show fallback message in UI
- Vercel deploy fails: check vercel.json, ensure /api/* routes to backend
- Agent drifts: STOP. Re-read this file. Re-prompt: "Phase [X], build only [Y]"
- Demo crashes live: show localhost + explain the concept — judges are human

---

## Submission Strategy (you have 3 attempts)
- Attempt 1: submit at ~70% done to see baseline score
- Attempt 2: after fixing Testing (utils + PropTypes) and polishing
- Attempt 3 (FINAL): only after full end-to-end test on LIVE Vercel URL
  — remember: LAST submission = final score

---

## Done Means
- App runs on Vercel (live URL works, not just localhost)
- Onboarding → check-in → AI response → mood chart all work
- Testing utils exist in /utils folder with pure functions
- PropTypes on all components
- No console errors on happy path
- PITCH.md complete

---

## PITCH.md Template

# MindPath / [Your App Name] — 60-Second Pitch

## The problem (10 sec)
Over 2 million Indian students preparing for NEET and JEE experience
clinical levels of anxiety — and most suffer in silence because no tool
understands exam culture.

## The solution (10 sec)
[App Name] is an AI companion that reads your daily journal, detects your
hidden stress patterns, and gives you coping strategies built for exam pressure
— not generic wellness advice.

## Demo flow (30 sec)
1. Show onboarding: "Hi, I'm a JEE aspirant"
2. Type a stressed journal entry → submit
3. Show AI response: empathetic + specific coping technique
4. Show mood chart: 7-day trend with pattern insight

## Why it matters (10 sec)
Students won't call a helpline. But they will open an app at 2am when
they're panicking before an exam. This is that app.