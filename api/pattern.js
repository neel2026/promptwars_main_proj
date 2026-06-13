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

  const { name, examType, last7Entries } = req.body ?? {};

  if (!name || !examType || !VALID_EXAM_TYPES.includes(examType) || !Array.isArray(last7Entries) || last7Entries.length === 0) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  const userText = JSON.stringify({
    name: sanitizeString(name),
    examType,
    last7Entries: last7Entries.slice(0, 7),
  });

  try {
    const result = await callGemini(apiKey, PATTERN_PROMPT, userText);
    if (!result.pattern) throw new Error('Unexpected AI response format.');
    return res.json({
      pattern: result.pattern,
      insight: result.insight || '',
      recommendation: result.recommendation || '',
    });
  } catch (err) {
    console.error('[/api/pattern]', err.message);
    return res.status(502).json({ error: 'Failed to detect pattern. Please try again.' });
  }
}
