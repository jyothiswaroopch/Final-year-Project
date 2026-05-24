import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Automatically reload the page if a Vite dynamic import fails due to a new deployment
    if (error && error.message && error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload();
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#020617', color: '#f87171', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            <summary>Click for error details</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
