/**
 * hooks/useMoodHistory.js
 * Manages mood entries in localStorage.
 * Each entry: { id, timestamp, moodScore, journalEntry, examType, aiResponse }
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mindpath_mood_history';
const MAX_ENTRIES = 30;

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage quota exceeded — fail silently
  }
}

/**
 * @returns {{
 *   entries: Array,
 *   addEntry: (entry: object) => void,
 *   clearHistory: () => void,
 *   last7: Array,
 *   recentMoodScores: number[],
 * }}
 */
export function useMoodHistory() {
  const [entries, setEntries] = useState(loadEntries);

  const addEntry = useCallback((entry) => {
    setEntries(prev => {
      const next = [
        { id: Date.now(), timestamp: Date.now(), ...entry },
        ...prev,
      ].slice(0, MAX_ENTRIES);
      saveEntries(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    saveEntries([]);
  }, []);

  const last7           = entries.slice(0, 7);
  const recentMoodScores = last7.map(e => e.moodScore);

  return { entries, addEntry, clearHistory, last7, recentMoodScores };
}
