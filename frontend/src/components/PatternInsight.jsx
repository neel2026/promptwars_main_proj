import PropTypes from 'prop-types';

const PatternInsightPropTypes = {
  pattern:        PropTypes.string,
  insight:        PropTypes.string,
  recommendation: PropTypes.string,
  isLoading:      PropTypes.bool,
};

/**
 * PatternInsight — displays AI-detected emotional pattern callout.
 */
function PatternInsight({ pattern, insight, recommendation, isLoading }) {
  if (isLoading) {
    return (
      <div className="pattern-insight pattern-insight--loading" aria-live="polite" aria-busy="true">
        <div className="pattern-insight__spinner" aria-hidden="true" />
        <p className="pattern-insight__loading-text">Analyzing your mood patterns…</p>
      </div>
    );
  }

  if (!pattern) return null;

  return (
    <section className="pattern-insight" aria-label="Your mood pattern">
      <div className="pattern-insight__icon" aria-hidden="true">🔍</div>
      <div className="pattern-insight__content">
        <h3 className="pattern-insight__title">Pattern detected</h3>
        <p className="pattern-insight__pattern">{pattern}</p>
        {insight && (
          <p className="pattern-insight__insight">{insight}</p>
        )}
        {recommendation && (
          <div className="pattern-insight__rec">
            <span className="pattern-insight__rec-label">What to try:</span>
            <span className="pattern-insight__rec-text">{recommendation}</span>
          </div>
        )}
      </div>
    </section>
  );
}

PatternInsight.propTypes = PatternInsightPropTypes;

PatternInsight.defaultProps = {
  pattern:        null,
  insight:        null,
  recommendation: null,
  isLoading:      false,
};

export default PatternInsight;
