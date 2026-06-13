import { Component } from 'react';
import PropTypes from 'prop-types';

const ErrorBoundaryPropTypes = {
  children: PropTypes.node.isRequired,
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧠</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
              MindPath ran into an unexpected error. Refresh the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ padding: '0.75rem 1.5rem', background: '#6366F1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Refresh page
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = ErrorBoundaryPropTypes;

export default ErrorBoundary;
