import React from "react";

/**
 * Reusable layout component for a settings section.
 *
 * @param {Object} props - The component props.
 * @param {string} props.label - The section title.
 * @param {React.ReactNode} props.children - The section content.
 * @returns {React.ReactElement} The rendered section.
 */
export function Section({ label, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section-label">{label}</div>
      {children}
    </div>
  );
}

/**
 * Reusable layout component for a settings row containing a label and a control.
 *
 * @param {Object} props - The component props.
 * @param {string} props.label - The label for the setting.
 * @param {React.ReactNode} props.children - The control element (e.g., input, select).
 * @returns {React.ReactElement} The rendered row.
 */
export function Row({ label, children }) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

/**
 * Reusable layout component for a toggle switch setting row.
 *
 * @param {Object} props - The component props.
 * @param {string} props.label - The label for the toggle setting.
 * @param {boolean} props.checked - Whether the toggle is active.
 * @param {Function} props.onChange - Callback fired when the toggle state changes.
 * @returns {React.ReactElement} The rendered toggle row.
 */
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

/**
 * Reusable button component used for selecting themes or visual options.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.active - Whether the theme button is currently selected.
 * @param {Function} props.onClick - Callback fired when the button is clicked.
 * @param {React.ReactNode} props.icon - The icon to display.
 * @param {string} props.label - The label for the button.
 * @returns {React.ReactElement} The rendered theme button.
 */
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
