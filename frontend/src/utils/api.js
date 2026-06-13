/**
 * utils/api.js — Structured API layer.
 * Validates input, applies timeout, handles network errors,
 * non-200 responses, and malformed JSON.
 * Returns { data, error } — never throws.
 */

const API_BASE   = '';
const TIMEOUT_MS = 20000;

/**
 * POST with timeout and full error handling.
 * @param {string} path
 * @param {object} payload
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
async function postWithTimeout(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body:    JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = `Server error (${response.status})`;
      try {
        const errBody = await response.json();
        if (errBody?.error) message = errBody.error;
      } catch {
        // Non-JSON error body — use default message
      }
      return { data: null, error: message };
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return { data: null, error: 'Received an unexpected response. Please try again.' };
    }

    return { data, error: null };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { data: null, error: 'Request timed out. Check your connection and try again.' };
    }
    return { data: null, error: 'Network error. Please check your connection.' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Analyzes a student's mood entry.
 * @param {{ name: string, examType: string, moodScore: number, journalEntry: string, recentMoods?: number[] }} payload
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function analyzeWellness(payload) {
  if (!payload || typeof payload !== 'object') {
    return { data: null, error: 'Invalid request payload.' };
  }
  return postWithTimeout('/api/analyze', payload);
}

/**
 * Fetches AI-detected emotional pattern from last 7 entries.
 * @param {{ name: string, examType: string, last7Entries: Array }} payload
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function analyzePattern(payload) {
  if (!payload || typeof payload !== 'object') {
    return { data: null, error: 'Invalid request payload.' };
  }
  return postWithTimeout('/api/pattern', payload);
}
