import React from "react";
import { X, Moon, Sun } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore, PROSE_FONTS } from "../store/settingsStore";

export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, theme, setTheme } = useUIStore();
  const { mdConfig, setMdConfig, typography, setTypography } =
    useSettingsStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="modal-overlay open" onClick={() => setSettingsOpen(false)}>
      <div
        className="modal-content settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button onClick={() => setSettingsOpen(false)} style={iconBtnStyle}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* ── Appearance ────────────────────────────────── */}
          <Section label="Appearance">
            <Row label="Theme">
              <div style={{ display: "flex", gap: "8px" }}>
                <ThemeBtn
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                  icon={<Moon size={14} />}
                  label="Dark"
                />
                <ThemeBtn
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                  icon={<Sun size={14} />}
                  label="Light"
                />
              </div>
            </Row>
          </Section>

          {/* ── Typography ────────────────────────────────── */}
          <Section label="Typography">
            <Row label="Prose Font">
              <select
                value={typography.proseFont}
                onChange={(e) => setTypography({ proseFont: e.target.value })}
                style={selectStyle}
              >
                {PROSE_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Row>

            <Row label={`Font Size  (${typography.fontSize}px)`}>
              <input
                type="range"
                min={12}
                max={22}
                step={1}
                value={typography.fontSize}
                onChange={(e) =>
                  setTypography({ fontSize: Number(e.target.value) })
                }
                style={rangeStyle}
              />
            </Row>

            <Row label={`Line Height  (${typography.lineHeight}×)`}>
              <input
                type="range"
                min={1.2}
                max={2.2}
                step={0.05}
                value={typography.lineHeight}
                onChange={(e) =>
                  setTypography({ lineHeight: Number(e.target.value) })
                }
                style={rangeStyle}
              />
            </Row>

            <Row
              label={`Prose Width  (${typography.proseWidth === 0 ? "Full" : typography.proseWidth + "px"})`}
            >
              <input
                type="range"
                min={0}
                max={1200}
                step={40}
                value={typography.proseWidth}
                onChange={(e) =>
                  setTypography({ proseWidth: Number(e.target.value) })
                }
                style={rangeStyle}
              />
            </Row>
          </Section>

          {/* ── Heading Scales ────────────────────────────── */}
          <Section label="Heading Scale">
            {[
              { key: "h1Scale", label: "H1" },
              { key: "h2Scale", label: "H2" },
              { key: "h3Scale", label: "H3" },
              { key: "h4Scale", label: "H4" },
            ].map(({ key, label }) => (
              <Row key={key} label={`${label}  (${typography[key]}×)`}>
                <input
                  type="range"
                  min={0.9}
                  max={3.0}
                  step={0.05}
                  value={typography[key]}
                  onChange={(e) =>
                    setTypography({ [key]: Number(e.target.value) })
                  }
                  style={rangeStyle}
                />
              </Row>
            ))}
          </Section>

          {/* ── Tables ────────────────────────────────────── */}
          <Section label="Table Style">
            <Row label="Style">
              <div style={{ display: "flex", gap: "8px" }}>
                {["minimal", "bordered", "striped"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTypography({ tableStyle: s })}
                    style={{
                      ...chipStyle,
                      background:
                        typography.tableStyle === s
                          ? "var(--accent)"
                          : "rgba(255,255,255,0.05)",
                      color:
                        typography.tableStyle === s
                          ? "#fff"
                          : "var(--text-secondary)",
                    }}
                  >
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </Row>
          </Section>

          {/* ── Markdown Engine ───────────────────────────── */}
          <Section label="Markdown Engine">
            <Row label="Dialect">
              <select
                value={mdConfig.dialect}
                onChange={(e) => setMdConfig({ dialect: e.target.value })}
                style={selectStyle}
              >
                <option value="gfm">GitHub Flavored (GFM)</option>
                <option value="commonmark">CommonMark (Strict)</option>
              </select>
            </Row>
            <ToggleRow
              label="Render HTML Tags"
              checked={mdConfig.allowHtml}
              onChange={(v) => setMdConfig({ allowHtml: v })}
            />
            <ToggleRow
              label="Auto-linkify URLs"
              checked={mdConfig.linkify}
              onChange={(v) => setMdConfig({ linkify: v })}
            />
            <ToggleRow
              label="Smart Typography"
              checked={mdConfig.typographer}
              onChange={(v) => setMdConfig({ typographer: v })}
            />
            <ToggleRow
              label="Vim Keybindings"
              checked={mdConfig.vimMode}
              onChange={(v) => setMdConfig({ vimMode: v })}
            />
            <Row label="Image Save Path">
              <input
                type="text"
                value={mdConfig.imageSavePath || "./images"}
                onChange={(e) => setMdConfig({ imageSavePath: e.target.value })}
                style={{ ...selectStyle, width: "130px" }}
              />
            </Row>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function Section({ label, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section-label">{label}</div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
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

function ThemeBtn({ active, onClick, icon, label }) {
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
const iconBtnStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "6px",
  display: "flex",
};

const selectStyle = {
  background: "rgba(255,255,255,0.06)",
  color: "var(--text-primary)",
  border: "1px solid var(--glass-border)",
  padding: "5px 8px",
  borderRadius: "6px",
  outline: "none",
  fontSize: "13px",
  maxWidth: "180px",
};

const rangeStyle = {
  width: "140px",
  accentColor: "var(--accent)",
  cursor: "pointer",
};

const chipStyle = {
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
