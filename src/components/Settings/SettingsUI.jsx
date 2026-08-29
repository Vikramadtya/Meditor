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

import { chipStyle } from "./SettingsStyles";

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
