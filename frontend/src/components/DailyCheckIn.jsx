import { useState, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
import { getMoodColor, getMoodLabel } from '../utils/mood';
import { validateJournalEntry } from '../utils/validation';

const MAX_CHARS = 1000;

/**
 * DailyCheckIn — mood slider + journal textarea + submit.
 */
function DailyCheckIn({ studentName, examType, onSubmit, isLoading }) {
  const [moodScore,    setMoodScore]    = useState(6);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalError, setJournalError] = useState(null);

  const sliderId  = useId();
  const journalId = useId();

  const charsLeft      = MAX_CHARS - journalEntry.length;
  const moodColor      = getMoodColor(moodScore);
  const moodLabel      = getMoodLabel(moodScore);
  const isLowMood      = moodScore <= 3;

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const result = validateJournalEntry(journalEntry);
    if (!result.valid) {
      setJournalError(result.error);
      return;
    }
    setJournalError(null);
    onSubmit({ name: studentName, examType, moodScore, journalEntry });
  }, [journalEntry, moodScore, studentName, examType, onSubmit]);

  return (
    <section className={`checkin${isLowMood ? ' checkin--low-mood' : ''}`} aria-label="Daily check-in">
      <header className="checkin__header">
        <h2 className="checkin__greeting">
          Hey <span className="accent">{studentName}</span> 👋
        </h2>
        <p className="checkin__sub">How are you doing today? Be honest — no one is watching.</p>
      </header>

      <form className="checkin__form" onSubmit={handleSubmit} noValidate>
        {/* ── Mood slider ── */}
        <div className="form-group">
          <label className="form-label" htmlFor={sliderId}>
            How are you feeling right now?
          </label>

          <div className="mood-display">
            <span
              className="mood-score"
              style={{ color: moodColor }}
              aria-hidden="true"
            >
              {moodScore}
            </span>
            <span className="mood-label" style={{ color: moodColor }}>
              {moodLabel}
            </span>
          </div>

          <input
            id={sliderId}
            type="range"
            className="mood-slider"
            min="1"
            max="10"
            step="1"
            value={moodScore}
            style={{ '--thumb-color': moodColor, '--fill-color': moodColor }}
            aria-label={`Mood score: ${moodScore} out of 10 — ${moodLabel}`}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={moodScore}
            onChange={e => setMoodScore(Number(e.target.value))}
          />

          <div className="mood-scale-labels" aria-hidden="true">
            <span>😔 1</span>
            <span>😐 5</span>
            <span>😊 10</span>
          </div>
        </div>

        {/* ── Journal textarea ── */}
        <div className="form-group">
          <label className="form-label" htmlFor={journalId}>
            {isLowMood
              ? "That sounds tough. What's been weighing on you?"
              : "What's on your mind today?"}
          </label>

          <div className="textarea-wrap">
            <textarea
              id={journalId}
              className={`journal-textarea${journalError ? ' journal-textarea--error' : ''}`}
              placeholder="What's on your mind today? No one is judging."
              value={journalEntry}
              maxLength={MAX_CHARS}
              rows={5}
              onChange={e => {
                setJournalEntry(e.target.value);
                if (journalError) setJournalError(null);
              }}
              aria-describedby={journalError ? `${journalId}-error` : undefined}
            />
            <span
              className={`char-count${charsLeft < 100 ? ' char-count--warn' : ''}`}
              aria-live="polite"
              aria-label={`${charsLeft} characters remaining`}
            >
              {charsLeft}
            </span>
          </div>

          {journalError && (
            <p
              id={`${journalId}-error`}
              className="form-error"
              role="alert"
            >
              {journalError}
            </p>
          )}
        </div>

        <button
          type="submit"
          id="checkin-submit"
          className="btn-primary"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            <>
              <span aria-hidden="true">✨</span>
              Get my wellness insight
            </>
          )}
        </button>
      </form>
    </section>
  );
}

DailyCheckIn.propTypes = {
  studentName:  PropTypes.string.isRequired,
  examType:     PropTypes.string.isRequired,
  onSubmit:     PropTypes.func.isRequired,
  isLoading:    PropTypes.bool.isRequired,
};

export default DailyCheckIn;
