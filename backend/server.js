/**
 * MindPath — Express Backend
 * POST /api/analyze  → Gemini → { acknowledgment, trigger, copingStrategy, encouragement }
 * POST /api/pattern  → Gemini → { pattern, insight, recommendation }
 * GET  /health       → { status: 'ok', timestamp }
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── System prompts ──────────────────────────────────────────────

const ANALYZE_PROMPT = `You are an empathetic mental wellness companion for Indian students
preparing for high-stakes exams (NEET, JEE, UPSC, CAT, GATE, CUET).

You deeply understand Indian exam culture: parental pressure, peer competition,
the fear of wasting a year, coaching center stress, and the stigma around
admitting struggle. Never give generic advice.

Given a student's name, exam type, mood score (1-10), and journal entry, return ONLY valid JSON:
{
  "acknowledgment": "2-3 sentences. Reflect what they are feeling. Be warm, specific, non-judgmental. Use their name.",
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
- Adapt the coping strategy to the specific exam type
Return ONLY valid JSON. No markdown. No preamble.`;

const PATTERN_PROMPT = `You are an empathetic mental wellness analyst for Indian exam students.

Given a student's last 7 mood journal entries (each with date, moodScore, journalEntry),
identify the dominant emotional pattern and most likely recurring stress trigger.

Return ONLY valid JSON:
{
  "pattern": "1 sentence describing the emotional pattern you detected",
  "insight": "1-2 sentences explaining what this pattern reveals about their stress cycle",
  "recommendation": "1 actionable recommendation tailored to break this pattern"
}

Return ONLY valid JSON. No markdown. No preamble.`;

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a minute and try again.' },
});

app.use('/api', limiter);

// ── Validation & sanitization ───────────────────────────────────
const VALID_EXAM_TYPES = ['NEET', 'JEE', 'UPSC', 'CAT', 'GATE', 'CUET'];

function sanitizeString(str) {
  return String(str).trim().replace(/[<>]/g, '');
}

function validateAnalyzeInput(body) {
  const { name, examType, moodScore, journalEntry } = body ?? {};

  if (!name || typeof name !== 'string' || sanitizeString(name).length === 0) {
    return { valid: false, error: 'name is required.' };
  }
  if (sanitizeString(name).length > 100) {
    return { valid: false, error: 'name must be 100 characters or fewer.' };
  }
  if (!examType || !VALID_EXAM_TYPES.includes(examType)) {
    return { valid: false, error: `examType must be one of: ${VALID_EXAM_TYPES.join(', ')}.` };
  }
  const score = Number(moodScore);
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    return { valid: false, error: 'moodScore must be a number between 1 and 10.' };
  }
  if (!journalEntry || typeof journalEntry !== 'string' || sanitizeString(journalEntry).length === 0) {
    return { valid: false, error: 'journalEntry is required.' };
  }
  if (sanitizeString(journalEntry).length > 1000) {
    return { valid: false, error: 'journalEntry must be 1000 characters or fewer.' };
  }
  return { valid: true };
}

function validatePatternInput(body) {
  const { name, examType, last7Entries } = body ?? {};
  if (!name || typeof name !== 'string' || sanitizeString(name).length === 0) {
    return { valid: false, error: 'name is required.' };
  }
  if (!examType || !VALID_EXAM_TYPES.includes(examType)) {
    return { valid: false, error: `examType must be one of: ${VALID_EXAM_TYPES.join(', ')}.` };
  }
  if (!Array.isArray(last7Entries) || last7Entries.length === 0) {
    return { valid: false, error: 'last7Entries must be a non-empty array.' };
  }
  return { valid: true };
}

// ── Gemini API call ─────────────────────────────────────────────
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

async function callGemini(apiKey, systemPrompt, userText) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const url = `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        generationConfig: {
          temperature:      0.3,
          maxOutputTokens:  1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody?.error?.message || `AI service error: HTTP ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = raw
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeout);
  }
}

// ── POST /api/analyze ───────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const validation = validateAnalyzeInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  const { name, examType, moodScore, journalEntry, recentMoods } = req.body;

  const userText = JSON.stringify({
    name:         sanitizeString(name),
    examType,
    moodScore:    Number(moodScore),
    journalEntry: sanitizeString(journalEntry),
    recentMoods:  Array.isArray(recentMoods) ? recentMoods.slice(0, 7) : [],
  });

  try {
    const result = await callGemini(apiKey, ANALYZE_PROMPT, userText);
    if (!result.acknowledgment || !result.copingStrategy) {
      throw new Error('Unexpected response format from AI.');
    }
    return res.json({
      acknowledgment: result.acknowledgment,
      trigger:        result.trigger || '',
      copingStrategy: result.copingStrategy,
      encouragement:  result.encouragement || '',
    });
  } catch (err) {
    console.error('[/api/analyze]', err.message);
    return res.status(502).json({ error: 'Failed to analyze your entry. Please try again.' });
  }
});

// ── POST /api/pattern ───────────────────────────────────────────
app.post('/api/pattern', async (req, res) => {
  const validation = validatePatternInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  const { name, examType, last7Entries } = req.body;

  const userText = JSON.stringify({
    name:        sanitizeString(name),
    examType,
    last7Entries: last7Entries.slice(0, 7),
  });

  try {
    const result = await callGemini(apiKey, PATTERN_PROMPT, userText);
    if (!result.pattern) {
      throw new Error('Unexpected response format from AI.');
    }
    return res.json({
      pattern:        result.pattern,
      insight:        result.insight || '',
      recommendation: result.recommendation || '',
    });
  } catch (err) {
    console.error('[/api/pattern]', err.message);
    return res.status(502).json({ error: 'Failed to detect pattern. Please try again.' });
  }
});

// ── GET /health ─────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[MindPath] Backend running on http://localhost:${PORT}`);
});
