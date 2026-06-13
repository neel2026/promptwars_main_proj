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

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const VALID_EXAM_TYPES = ['NEET', 'JEE', 'UPSC', 'CAT', 'GATE', 'CUET'];

function sanitizeString(str) {
  return String(str).trim().replace(/[<>]/g, '');
}

async function callGemini(apiKey, systemPrompt, userText) {
  const url = `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `AI error: HTTP ${response.status}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, examType, moodScore, journalEntry, recentMoods } = req.body ?? {};

  if (!name || !examType || !VALID_EXAM_TYPES.includes(examType) || !journalEntry) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const score = Number(moodScore);
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    return res.status(400).json({ error: 'moodScore must be 1-10.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  const userText = JSON.stringify({
    name: sanitizeString(name),
    examType,
    moodScore: score,
    journalEntry: sanitizeString(journalEntry),
    recentMoods: Array.isArray(recentMoods) ? recentMoods.slice(0, 7) : [],
  });

  try {
    const result = await callGemini(apiKey, ANALYZE_PROMPT, userText);
    if (!result.acknowledgment || !result.copingStrategy) {
      throw new Error('Unexpected AI response format.');
    }
    return res.json({
      acknowledgment: result.acknowledgment,
      trigger: result.trigger || '',
      copingStrategy: result.copingStrategy,
      encouragement: result.encouragement || '',
    });
  } catch (err) {
    console.error('[/api/analyze]', err.message);
    return res.status(502).json({ error: 'Failed to analyze. Please try again.' });
  }
}
