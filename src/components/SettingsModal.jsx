import React from "react";
import { X, Moon, Sun } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";

export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, theme, setTheme } = useUIStore();
  const { mdConfig, setMdConfig } = useSettingsStore();

  return (
    <div
      className={`modal-overlay ${isSettingsOpen ? "open" : ""}`}
      onClick={() => setSettingsOpen(false)}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            style={actionButtonStyle}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={settingLabelStyle}>Theme Preference</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setTheme("dark")}
              style={{
                ...themeButtonStyle,
                background:
                  theme === "dark" ? "var(--accent)" : "rgba(255,255,255,0.05)",
                color: theme === "dark" ? "#fff" : "var(--text-primary)",
              }}
            >
              <Moon size={16} /> Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              style={{
                ...themeButtonStyle,
                background:
                  theme === "light"
                    ? "var(--accent)"
                    : "rgba(255,255,255,0.05)",
                color: theme === "light" ? "#fff" : "var(--text-primary)",
              }}
            >
              <Sun size={16} /> Light
            </button>
          </div>
        </div>

        <div>
          <label style={settingLabelStyle}>Markdown Engine</label>
          <div style={settingRowStyle}>
            <span>Dialect</span>
            <select
              value={mdConfig.dialect}
              onChange={(e) => setMdConfig({ dialect: e.target.value })}
              style={selectStyle}
            >
              <option value="gfm">GitHub Flavored (GFM)</option>
              <option value="commonmark">CommonMark (Strict)</option>
            </select>
          </div>
          <div style={settingRowStyle}>
            <span>Render HTML Tags</span>
            <input
              type="checkbox"
              checked={mdConfig.allowHtml}
              onChange={(e) => setMdConfig({ allowHtml: e.target.checked })}
            />
          </div>
          <div style={settingRowStyle}>
            <span>Auto-linkify URLs</span>
            <input
              type="checkbox"
              checked={mdConfig.linkify}
              onChange={(e) => setMdConfig({ linkify: e.target.checked })}
            />
          </div>
          <div style={settingRowStyle}>
            <span>Smart Typography</span>
            <input
              type="checkbox"
              checked={mdConfig.typographer}
              onChange={(e) => setMdConfig({ typographer: e.target.checked })}
            />
          </div>
          <div style={settingRowStyle}>
            <span>Vim Keybindings</span>
            <input
              type="checkbox"
              checked={mdConfig.vimMode}
              onChange={(e) => setMdConfig({ vimMode: e.target.checked })}
            />
          </div>
          <div style={settingRowStyle}>
            <span>Image Save Path (Drop)</span>
            <input
              type="text"
              value={mdConfig.imageSavePath || "./images"}
              onChange={(e) => setMdConfig({ imageSavePath: e.target.value })}
              style={{ ...selectStyle, width: "120px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const actionButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-primary)",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "8px",
};
const themeButtonStyle = {
  border: "none",
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 500,
};
const settingLabelStyle = {
  display: "block",
  marginBottom: "12px",
  fontSize: "14px",
  color: "var(--text-secondary)",
};
const settingRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid var(--glass-border)",
  fontSize: "14px",
};
const selectStyle = {
  background: "rgba(255,255,255,0.05)",
  color: "var(--text-primary)",
  border: "1px solid var(--glass-border)",
  padding: "4px 8px",
  borderRadius: "4px",
  outline: "none",
};
