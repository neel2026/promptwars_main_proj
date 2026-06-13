# MindPath — AI Mental Wellness Tracker

An AI-powered mental wellness companion for Indian students preparing for
high-stakes exams (NEET, JEE, UPSC, CAT, GATE, CUET).

## What it does
- **Daily mood check-in**: mood slider (1–10) + open journal entry
- **AI analysis**: Gemini detects stress triggers + returns empathetic coping strategies
- **Mood history**: 7-day chart showing your emotional trend
- **Pattern detection**: AI identifies recurring stress patterns across entries
- **Streak tracking**: motivates consistent check-ins

## Stack
- **Frontend**: React 18 + Vite, Recharts, PropTypes
- **Backend**: Node.js + Express + Gemini API
- **Storage**: localStorage (no accounts, no data collection)

## Running locally

### Backend
```bash
cd backend
# Add your GEMINI_API_KEY to .env
npm install
npm run dev   # http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Project structure
```
mental-wellness/
├── frontend/src/
│   ├── components/       ← Onboarding, DailyCheckIn, AIResponse, MoodChart, PatternInsight
│   ├── hooks/            ← useWellness, useMoodHistory
│   ├── utils/            ← mood.js, validation.js, api.js (all pure functions)
│   └── App.jsx
├── backend/
│   └── server.js         ← POST /api/analyze, POST /api/pattern, GET /health
└── vercel.json
```

## Security
- API key stays server-side only (never in frontend)
- Input validated + sanitized on both frontend and backend
- Rate limiting: 10 req/min per IP
- CORS: frontend origin only
- CSP meta tag on every page
