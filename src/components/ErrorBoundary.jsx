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
    console.error("Dashboard error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#0f172a',
          color: '#f8fafc',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            maxWidth: 500,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, fontWeight: 'bold' }}>
              !
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Dashboard Notice</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
              {this.state.error?.message || "There was an issue initializing the dashboard."}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Reload Dashboard
              </button>
              <button
                onClick={() => { sessionStorage.clear(); window.location.href = '/portal'; }}
                style={{
                  background: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
