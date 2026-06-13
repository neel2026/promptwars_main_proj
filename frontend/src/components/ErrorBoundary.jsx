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
        <main className="onboarding">
          <div className="onboarding__card">
            <p className="onboarding__icon">🧠</p>
            <h1 className="onboarding__title">Something went wrong</h1>
            <p className="onboarding__sub">
              MindPath ran into an unexpected error. Refresh the page to continue.
            </p>
            <div className="form-group">
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </button>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = ErrorBoundaryPropTypes;

export default ErrorBoundary;
