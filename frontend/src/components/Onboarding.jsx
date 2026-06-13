import { useState } from 'react';
import PropTypes from 'prop-types';
import { validateName, validateExamType } from '../utils/validation';
import { EXAM_TYPES } from '../utils/mood';

const EXAM_LABELS = {
  NEET: 'NEET (Medical)',
  JEE:  'JEE (Engineering)',
  UPSC: 'UPSC (Civil Services)',
  CAT:  'CAT (MBA)',
  GATE: 'GATE (Tech PG)',
  CUET: 'CUET (University)',
};

/**
 * Onboarding — one-time name + exam type setup.
 */
function Onboarding({ onComplete }) {
  const [name,     setName]     = useState('');
  const [examType, setExamType] = useState('');
  const [errors,   setErrors]   = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const nameResult = validateName(name);
    const examResult = validateExamType(examType);

    const nextErrors = {};
    if (!nameResult.valid) nextErrors.name     = nameResult.error;
    if (!examResult.valid) nextErrors.examType = examResult.error;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onComplete({ name: name.trim(), examType });
  }

  return (
    <main className="onboarding" id="onboarding" aria-labelledby="onboarding-title">
      <div className="onboarding__card">
        <div className="onboarding__icon" aria-hidden="true">🧠</div>

        <h1 className="onboarding__title" id="onboarding-title">
          Welcome to <span className="accent">MindPath</span>
        </h1>
        <p className="onboarding__sub">
          Your personal AI companion for exam season. No judgement. Just support.
        </p>

        <form className="onboarding__form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="student-name">
              What should I call you?
            </label>
            <input
              id="student-name"
              type="text"
              className={`form-input${errors.name ? ' form-input--error' : ''}`}
              placeholder="Your first name"
              value={name}
              autoComplete="given-name"
              maxLength={100}
              onChange={e => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
              }}
            />
            {errors.name && (
              <p className="form-error" role="alert">{errors.name}</p>
            )}
          </div>

          <div className="form-group">
            <fieldset>
              <legend className="form-label">Which exam are you preparing for?</legend>
              <div className="exam-grid" role="group">
                {EXAM_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    id={`exam-${type.toLowerCase()}`}
                    className={`exam-chip${examType === type ? ' exam-chip--active' : ''}`}
                    aria-pressed={examType === type}
                    onClick={() => {
                      setExamType(type);
                      if (errors.examType) setErrors(prev => ({ ...prev, examType: null }));
                    }}
                  >
                    {EXAM_LABELS[type]}
                  </button>
                ))}
              </div>
              {errors.examType && (
                <p className="form-error" role="alert">{errors.examType}</p>
              )}
            </fieldset>
          </div>

          <button type="submit" className="btn-primary" id="onboarding-submit">
            Start my wellness journey
          </button>
        </form>
      </div>
    </main>
  );
}

Onboarding.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default Onboarding;
