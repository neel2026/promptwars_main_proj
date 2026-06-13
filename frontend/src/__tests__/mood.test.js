import { describe, it, expect } from 'vitest';
import {
  getMoodLabel,
  getMoodColor,
  calculateStreak,
  formatDate,
  formatDayShort,
  detectWeakDay,
  MOOD_MIN,
  MOOD_MAX,
} from '../utils/mood';

describe('getMoodLabel', () => {
  it('returns Overwhelmed for scores 1-2', () => {
    expect(getMoodLabel(1)).toBe('Overwhelmed');
    expect(getMoodLabel(2)).toBe('Overwhelmed');
  });
  it('returns Excellent for score 10', () => {
    expect(getMoodLabel(10)).toBe('Excellent');
  });
  it('returns Okay for score 5', () => {
    expect(getMoodLabel(5)).toBe('Okay');
  });
  it('handles MOOD_MIN and MOOD_MAX boundaries', () => {
    expect(getMoodLabel(MOOD_MIN)).toBe('Overwhelmed');
    expect(getMoodLabel(MOOD_MAX)).toBe('Excellent');
  });
});

describe('getMoodColor', () => {
  it('returns red for low mood (1-3)', () => {
    expect(getMoodColor(1)).toBe('#EF4444');
    expect(getMoodColor(3)).toBe('#EF4444');
  });
  it('returns amber for mid mood (4-5)', () => {
    expect(getMoodColor(4)).toBe('#F59E0B');
    expect(getMoodColor(5)).toBe('#F59E0B');
  });
  it('returns green for high mood (8-10)', () => {
    expect(getMoodColor(8)).toBe('#10B981');
    expect(getMoodColor(10)).toBe('#10B981');
  });
  it('clamps values outside 1-10 range', () => {
    expect(getMoodColor(0)).toBe('#EF4444');
    expect(getMoodColor(11)).toBe('#10B981');
  });
});

describe('calculateStreak', () => {
  it('returns 0 for empty entries', () => {
    expect(calculateStreak([])).toBe(0);
  });
  it('returns 0 for non-array input', () => {
    expect(calculateStreak(null)).toBe(0);
  });
  it('returns 1 for a single entry today', () => {
    const entry = { timestamp: Date.now() };
    expect(calculateStreak([entry])).toBe(1);
  });
});

describe('formatDate', () => {
  it('returns empty string for invalid timestamp', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(NaN)).toBe('');
  });
  it('returns a non-empty string for a valid timestamp', () => {
    const result = formatDate(Date.now());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatDayShort', () => {
  it('returns empty string for invalid timestamp', () => {
    expect(formatDayShort(null)).toBe('');
  });
  it('returns a short day string for valid timestamp', () => {
    const result = formatDayShort(Date.now());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('detectWeakDay', () => {
  it('returns empty string for fewer than 3 entries', () => {
    expect(detectWeakDay([])).toBe('');
    expect(detectWeakDay([{ timestamp: Date.now(), moodScore: 5 }])).toBe('');
  });
  it('returns a day name for sufficient entries', () => {
    const entries = [
      { timestamp: new Date('2024-01-01').getTime(), moodScore: 2 },
      { timestamp: new Date('2024-01-02').getTime(), moodScore: 8 },
      { timestamp: new Date('2024-01-03').getTime(), moodScore: 7 },
    ];
    const result = detectWeakDay(entries);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
