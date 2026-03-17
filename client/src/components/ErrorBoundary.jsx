import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--score-red)", background: "rgba(239,68,68,0.1)", borderRadius: "8px", marginTop: "20px" }}>
          <h2>Something went wrong displaying the results.</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            The AI returned an unexpected data format that crashed the page.
          </p>
          <pre style={{ textAlign: "left", background: "rgba(0,0,0,0.5)", padding: "10px", marginTop: "10px", borderRadius: "6px", fontSize: "0.75rem", overflowX: "auto" }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button 
            className="btn-primary" 
            style={{ marginTop: "16px" }}
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
