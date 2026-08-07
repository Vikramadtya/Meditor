import React from "react";
import { logger } from "../services/logger";
import { AlertOctagon, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    logger.error("React Rendering Crash:", error);
    logger.error("Component Stack:", errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            backgroundColor: "var(--bg)",
            color: "var(--text-primary)",
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid var(--glass-border)",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#ef4444",
              }}
            >
              <AlertOctagon size={32} />
              <h2 style={{ margin: 0 }}>Application Crash</h2>
            </div>

            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              An unexpected error occurred while rendering the UI. A log has
              been written to your active workspace (if one is open).
            </p>

            <div
              style={{
                background: "rgba(0,0,0,0.2)",
                padding: "1rem",
                borderRadius: "8px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                overflowX: "auto",
                border: "1px solid var(--glass-border)",
                color: "#f87171",
              }}
            >
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>

            <button
              onClick={this.handleReload}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                marginTop: "1rem",
              }}
            >
              <RefreshCw size={16} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
