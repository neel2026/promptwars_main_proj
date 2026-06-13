import { useState, useEffect, useCallback } from 'react';
import Onboarding    from './components/Onboarding';
import DailyCheckIn  from './components/DailyCheckIn';
import AIResponse    from './components/AIResponse';
import MoodChart     from './components/MoodChart';
import PatternInsight from './components/PatternInsight';
import { useMoodHistory } from './hooks/useMoodHistory';
import { useWellness }    from './hooks/useWellness';
import { calculateStreak } from './utils/mood';

const PROFILE_KEY = 'mindpath_profile';

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch { /* silent */ }
}

/**
 * App — root component. Orchestrates: Onboarding → DailyCheckIn → AIResponse flow.
 */
export default function App() {
  const [profile, setProfile] = useState(loadProfile);
  // view: 'checkin' | 'response'
  const [view, setView] = useState('checkin');

  const { entries, addEntry, last7, recentMoodScores } = useMoodHistory();
  const {
    aiResponse, patternData, isLoading, isLoadingPattern,
    error, submitCheckIn, fetchPattern, clearError, clearResponse,
  } = useWellness({ addEntry, last7, recentMoodScores });

  const streak = calculateStreak(entries);

  // Auto-fetch pattern when we have enough data and a profile
  useEffect(() => {
    if (profile && last7.length >= 2 && view === 'checkin') {
      fetchPattern({ name: profile.name, examType: profile.examType });
    }
  }, [last7.length, profile, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnboardingComplete = useCallback((newProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const handleCheckInSubmit = useCallback(async (payload) => {
    await submitCheckIn(payload);
    setView('response');
  }, [submitCheckIn]);

  const handleNewEntry = useCallback(() => {
    clearResponse();
    setView('checkin');
  }, [clearResponse]);

  // ── Onboarding ──
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <header className="app-header" id="app-header">
        <div className="app-header__inner">
          <span className="app-wordmark">🧠 MindPath</span>
          <div className="app-header__right">
            {streak > 1 && (
              <span className="streak-badge" aria-label={`${streak} day streak`}>
                🔥 {streak} day streak
              </span>
            )}
            <span className="app-header__exam">{profile.examType}</span>
          </div>
        </div>
      </header>

      <main className="app" id="main-content">

        {/* ── Error banner ── */}
        {error && (
          <div className="error-banner" role="alert" aria-live="assertive">
            <p className="error-banner__msg">{error}</p>
            <button
              type="button"
              className="error-banner__close"
              aria-label="Dismiss error"
              onClick={clearError}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Loading overlay ── */}
        {isLoading && (
          <div
            className="loading-overlay"
            role="status"
            aria-live="polite"
            aria-label="Analyzing your journal entry"
          >
            <div className="loading-pulse" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="loading-text">Reading your thoughts…</p>
          </div>
        )}

        {/* ── Check-in view ── */}
        {view === 'checkin' && !isLoading && (
          <DailyCheckIn
            studentName={profile.name}
            examType={profile.examType}
            onSubmit={handleCheckInSubmit}
            isLoading={isLoading}
          />
        )}

        {/* ── AI Response view ── */}
        {view === 'response' && aiResponse && !isLoading && (
          <AIResponse
            response={aiResponse}
            studentName={profile.name}
            onNewEntry={handleNewEntry}
          />
        )}

        {/* ── Mood chart + pattern (always visible when data exists) ── */}
        {entries.length > 0 && (
          <div className="history-section" aria-label="Your wellness history">
            <MoodChart entries={last7} />

            {(patternData || isLoadingPattern) && (
              <PatternInsight
                pattern={patternData?.pattern}
                insight={patternData?.insight}
                recommendation={patternData?.recommendation}
                isLoading={isLoadingPattern}
              />
            )}
          </div>
        )}

      </main>

      <footer className="app-footer">
        <p className="app-footer__text">MindPath — Your exam season companion</p>
        <p className="app-footer__powered">Powered by <span>Gemini AI</span></p>
      </footer>
    </>
  );
}
