import PropTypes from 'prop-types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getMoodColor, getMoodLabel, formatDayShort } from '../utils/mood';

/** Custom tooltip for the recharts line chart */
function MoodTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const score = payload[0].value;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip__score" style={{ color: getMoodColor(score) }}>
        {score}
      </span>
      <span className="chart-tooltip__label">{getMoodLabel(score)}</span>
    </div>
  );
}

MoodTooltip.propTypes = {
  active:  PropTypes.bool,
  payload: PropTypes.array,
};

MoodTooltip.defaultProps = {
  active:  false,
  payload: [],
};

/**
 * Fallback: pure CSS bar chart in case recharts fails.
 */
function CSSFallbackChart({ entries }) {
  return (
    <div className="chart-css-fallback" role="img" aria-label="7-day mood chart">
      {entries.map((entry, i) => (
        <div key={i} className="chart-css-fallback__col">
          <div
            className="chart-css-fallback__bar"
            style={{
              height:     `${(entry.moodScore / 10) * 100}%`,
              background: getMoodColor(entry.moodScore),
            }}
            aria-label={`${formatDayShort(entry.timestamp)}: mood ${entry.moodScore}`}
          />
          <span className="chart-css-fallback__label">{formatDayShort(entry.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}

CSSFallbackChart.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    timestamp: PropTypes.number.isRequired,
    moodScore: PropTypes.number.isRequired,
  })).isRequired,
};

/**
 * MoodChart — 7-day mood history line chart using recharts.
 */
function MoodChart({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="chart-empty">
        <p>Your mood chart will appear here after a few check-ins.</p>
      </div>
    );
  }

  const chartData = [...entries]
    .slice(0, 7)
    .reverse()
    .map(e => ({
      day:       formatDayShort(e.timestamp),
      moodScore: e.moodScore,
      timestamp: e.timestamp,
    }));

  try {
    return (
      <section className="mood-chart" aria-label="7-day mood history">
        <h3 className="mood-chart__title">Your mood this week</h3>
        <div className="mood-chart__container">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                tickLine={false}
              />
              <YAxis
                domain={[1, 10]}
                ticks={[1, 3, 5, 7, 10]}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<MoodTooltip />} />
              <ReferenceLine y={5} stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="moodScore"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{ fill: '#6366F1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#6366F1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    );
  } catch {
    return <CSSFallbackChart entries={chartData} />;
  }
}

MoodChart.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    timestamp: PropTypes.number.isRequired,
    moodScore: PropTypes.number.isRequired,
  })).isRequired,
};

export default MoodChart;
