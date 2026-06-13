import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Splits text into words and streams them in with a typewriter effect.
 * @param {string} text
 * @param {number} delayPerWord - ms between words
 * @returns {string} visible portion so far
 */
function useTypewriter(text, delayPerWord = 55) {
  const [visible, setVisible] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) { setVisible(''); return; }

    setVisible('');
    const words = text.split(' ');
    let idx = 0;

    function step() {
      idx++;
      setVisible(words.slice(0, idx).join(' '));
      if (idx < words.length) {
        timerRef.current = setTimeout(step, delayPerWord);
      }
    }

    timerRef.current = setTimeout(step, delayPerWord);
    return () => clearTimeout(timerRef.current);
  }, [text, delayPerWord]);

  return visible;
}

/**
 * AIResponse — displays the AI's empathetic response with typewriter effect.
 */
function AIResponse({ response, studentName, onNewEntry }) {
  const acknowledgment = useTypewriter(response.acknowledgment, 45);

  const {
    trigger,
    copingStrategy,
    encouragement,
  } = response;

  return (
    <section
      className="ai-response"
      aria-label="Your wellness insight"
      aria-live="polite"
    >
      {/* ── Acknowledgment ── */}
      <div className="ai-response__header">
        <span className="ai-badge" aria-label="AI companion">✨ MindPath</span>
      </div>

      <div className="ai-response__acknowledgment">
        <p className="ai-response__text">{acknowledgment}</p>
      </div>

      {/* ── Trigger ── */}
      {trigger && (
        <div className="ai-response__trigger">
          <span className="ai-response__trigger-label">What I noticed:</span>
          <span className="ai-response__trigger-value">{trigger}</span>
        </div>
      )}

      {/* ── Coping strategy ── */}
      {copingStrategy && (
        <div className="ai-response__strategy">
          <h3 className="ai-response__strategy-title">
            <span aria-hidden="true">🧘 </span>
            {copingStrategy.title}
          </h3>

          {Array.isArray(copingStrategy.steps) && copingStrategy.steps.length > 0 && (
            <ol className="ai-response__steps">
              {copingStrategy.steps.map((step, i) => (
                <li key={i} className="ai-response__step">{step}</li>
              ))}
            </ol>
          )}

          {copingStrategy.whyItWorks && (
            <p className="ai-response__why">
              <strong>Why this works for {studentName}:</strong>{' '}
              {copingStrategy.whyItWorks}
            </p>
          )}
        </div>
      )}

      {/* ── Encouragement ── */}
      {encouragement && (
        <p className="ai-response__encouragement">
          <span aria-hidden="true">💪 </span>
          {encouragement}
        </p>
      )}

      {/* ── New entry CTA ── */}
      <button
        type="button"
        id="new-entry-btn"
        className="btn-secondary"
        onClick={onNewEntry}
      >
        Log another entry
      </button>
    </section>
  );
}

AIResponse.propTypes = {
  response: PropTypes.shape({
    acknowledgment: PropTypes.string.isRequired,
    trigger:        PropTypes.string,
    copingStrategy: PropTypes.shape({
      title:       PropTypes.string.isRequired,
      steps:       PropTypes.arrayOf(PropTypes.string),
      whyItWorks:  PropTypes.string,
    }),
    encouragement: PropTypes.string,
  }).isRequired,
  studentName: PropTypes.string.isRequired,
  onNewEntry:  PropTypes.func.isRequired,
};

export default AIResponse;
