/**
 * utils/validation.js — Pure input validation functions.
 * Each returns { valid: boolean, error: string|null }.
 * No side effects — fully testable in isolation.
 */

const VALID_EXAM_TYPES = ['NEET', 'JEE', 'UPSC', 'CAT', 'GATE', 'CUET'];

export const MAX_NAME_LENGTH    = 100;
export const MIN_JOURNAL_LENGTH = 5;
export const MAX_JOURNAL_LENGTH = 1000;

/**
 * Validates a student name.
 * @param {string} name
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Please enter your name.' };
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` };
  }
  return { valid: true, error: null };
}

/**
 * Validates the exam type selection.
 * @param {string} type
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateExamType(type) {
  if (!type || !VALID_EXAM_TYPES.includes(type)) {
    return { valid: false, error: 'Please select your exam type.' };
  }
  return { valid: true, error: null };
}

/**
 * Validates a mood score (must be 1–10).
 * @param {number|string} score
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateMoodScore(score) {
  const s = Number(score);
  if (!Number.isFinite(s) || s < 1 || s > 10) {
    return { valid: false, error: 'Mood score must be between 1 and 10.' };
  }
  return { valid: true, error: null };
}

/**
 * Validates a journal entry.
 * @param {string} text
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateJournalEntry(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { valid: false, error: "What's on your mind? Write at least a few words." };
  }
  if (text.trim().length < MIN_JOURNAL_LENGTH) {
    return { valid: false, error: 'Please share a bit more — a few sentences help the AI understand.' };
  }
  if (text.trim().length > MAX_JOURNAL_LENGTH) {
    return { valid: false, error: `Journal entry must be ${MAX_JOURNAL_LENGTH} characters or fewer.` };
  }
  return { valid: true, error: null };
}

/**
 * Validates the full check-in form.
 * @param {{ name: string, examType: string, moodScore: number, journalEntry: string }} fields
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateCheckIn(fields) {
  const errors = {};
  const nameResult    = validateName(fields.name);
  const examResult    = validateExamType(fields.examType);
  const moodResult    = validateMoodScore(fields.moodScore);
  const journalResult = validateJournalEntry(fields.journalEntry);

  if (!nameResult.valid)    errors.name        = nameResult.error;
  if (!examResult.valid)    errors.examType     = examResult.error;
  if (!moodResult.valid)    errors.moodScore    = moodResult.error;
  if (!journalResult.valid) errors.journalEntry = journalResult.error;

  return { valid: Object.keys(errors).length === 0, errors };
}
