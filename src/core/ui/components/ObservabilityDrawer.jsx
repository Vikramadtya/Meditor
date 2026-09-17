import React, { useState, useEffect } from "react";
import {
  X,
  Activity,
  List,
  Clock,
  ChevronDown,
  ChevronRight,
  BarChart2,
} from "lucide-react";

export function ObservabilityDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("traces");
  const [traces, setTraces] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [spans, setSpans] = useState([]);

  const refreshData = () => {
    if (!window.__TELEMETRY_REPO__) return;
    if (activeTab === "traces") {
      setTraces(window.__TELEMETRY_REPO__.getRecentTraces(50));
    } else if (activeTab === "logs") {
      setLogs(window.__TELEMETRY_REPO__.getLogs(100));
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const interval = setInterval(refreshData, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (selectedTrace && window.__TELEMETRY_REPO__) {
      setSpans(
        window.__TELEMETRY_REPO__.getSpansForTrace(selectedTrace.trace_id),
      );
      setLogs(window.__TELEMETRY_REPO__.getLogs(50, selectedTrace.trace_id));
    }
  }, [selectedTrace]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: "var(--accent)",
          color: "#fff",
          padding: "10px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Open Observability DevTools"
      >
        <Activity size={20} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "400px",
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--glass-border)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => {
              setActiveTab("traces");
              setSelectedTrace(null);
            }}
            style={{
              background: "none",
              border: "none",
              color:
                activeTab === "traces"
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <Clock
              size={14}
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />{" "}
            Traces
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              setSelectedTrace(null);
            }}
            style={{
              background: "none",
              border: "none",
              color:
                activeTab === "logs"
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <List
              size={14}
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />{" "}
            All Logs
          </button>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {activeTab === "traces" && !selectedTrace && (
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            <table
              style={{
                width: "100%",
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <th style={{ padding: "8px" }}>Trace Name</th>
                  <th style={{ padding: "8px" }}>Time</th>
                  <th style={{ padding: "8px" }}>Duration (ms)</th>
                  <th style={{ padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTrace(t)}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid var(--glass-border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        color: "var(--accent)",
                      }}
                    >
                      {t.name}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {new Date(t.start_time).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: "8px" }}>{t.duration?.toFixed(2)}</td>
                    <td
                      style={{
                        padding: "8px",
                        color: t.status === "error" ? "red" : "green",
                      }}
                    >
                      {t.status}
                    </td>
                  </tr>
                ))}
                {traces.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: 16, textAlign: "center" }}
                    >
                      No traces recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "traces" && selectedTrace && (
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            {/* Spans Waterfall */}
            <div
              style={{
                width: "50%",
                borderRight: "1px solid var(--glass-border)",
                overflowY: "auto",
                padding: "12px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={() => setSelectedTrace(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    cursor: "pointer",
                  }}
                >
                  &larr; Back to Traces
                </button>
                <h3 style={{ margin: "8px 0" }}>{selectedTrace.name}</h3>
              </div>
              {spans.map((s) => {
                const marginLeft = s.parent_id ? "20px" : "0px";
                const widthPct = Math.max(
                  1,
                  (s.duration / selectedTrace.duration) * 100,
                );
                return (
                  <div key={s.id} style={{ marginBottom: "12px", marginLeft }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>{s.name}</strong>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {s.duration?.toFixed(2)}ms
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        background: "var(--bg-secondary)",
                        height: "4px",
                        marginTop: "4px",
                        borderRadius: "2px",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPct}%`,
                          background:
                            s.status === "error" ? "red" : "var(--accent)",
                          height: "100%",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Trace Logs */}
            <div
              style={{
                width: "50%",
                overflowY: "auto",
                padding: "12px",
                background: "var(--bg-secondary)",
              }}
            >
              <h3
                style={{ margin: "0 0 12px 0", color: "var(--text-secondary)" }}
              >
                Trace Logs
              </h3>
              {logs.map((l) => (
                <div
                  key={l.id}
                  style={{
                    marginBottom: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    paddingBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color:
                        l.level === "ERROR"
                          ? "red"
                          : l.level === "WARN"
                            ? "orange"
                            : "var(--text-secondary)",
                    }}
                  >
                    [{l.level}]{" "}
                  </span>
                  <span style={{ fontWeight: "bold" }}>[{l.context}] </span>
                  <span>{l.message}</span>
                  {l.meta && (
                    <div style={{ opacity: 0.7, marginTop: 4 }}>{l.meta}</div>
                  )}
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ color: "var(--text-secondary)" }}>
                  No logs for this trace.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {logs.map((l) => (
              <div
                key={l.id}
                style={{
                  marginBottom: "8px",
                  borderBottom: "1px solid rgba(0,0,0,0.1)",
                  paddingBottom: "8px",
                }}
              >
                <span
                  style={{
                    color:
                      l.level === "ERROR"
                        ? "red"
                        : l.level === "WARN"
                          ? "orange"
                          : "var(--text-secondary)",
                  }}
                >
                  [{l.level}]{" "}
                </span>
                <span style={{ fontWeight: "bold" }}>[{l.context}] </span>
                <span>{l.message}</span>
                {l.trace_id && (
                  <span
                    style={{
                      marginLeft: 8,
                      color: "var(--accent)",
                      fontSize: "10px",
                    }}
                  >
                    Trace: {l.trace_id.slice(0, 8)}...
                  </span>
                )}
                {l.meta && (
                  <div style={{ opacity: 0.7, marginTop: 4 }}>{l.meta}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
