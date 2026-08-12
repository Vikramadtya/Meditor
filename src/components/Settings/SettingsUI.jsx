import React from "react";

export function Section({ label, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section-label">{label}</div>
      {children}
    </div>
  );
}

export function Row({ label, children }) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

export function ToggleRow({ label, checked, onChange }) {
  return (
    <Row label={label}>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-track" />
      </label>
    </Row>
  );
}

export function ThemeBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...chipStyle,
        gap: "6px",
        padding: "6px 14px",
        background: active ? "var(--accent)" : "rgba(255,255,255,0.05)",
        color: active ? "#fff" : "var(--text-secondary)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
export const iconBtnStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "6px",
  display: "flex",
};

export const selectStyle = {
  background: "rgba(255,255,255,0.06)",
  color: "var(--text-primary)",
  border: "1px solid var(--glass-border)",
  padding: "5px 8px",
  borderRadius: "6px",
  outline: "none",
  fontSize: "13px",
  maxWidth: "180px",
};

export const inputStyle = {
  background: "rgba(0,0,0,0.2)",
  color: "var(--text-primary)",
  border: "1px solid var(--glass-border)",
  padding: "8px 10px",
  borderRadius: "6px",
  outline: "none",
  fontSize: "13px",
  width: "100%",
  boxSizing: "border-box",
};

export const tabStyle = {
  background: "transparent",
  border: "none",
  padding: "0 4px 8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

export const rangeStyle = {
  width: "140px",
  accentColor: "var(--accent)",
  cursor: "pointer",
};

export const chipStyle = {
  border: "none",
  padding: "5px 12px",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "background 0.15s ease",
};
