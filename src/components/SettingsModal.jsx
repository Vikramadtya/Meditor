import React, { useState } from "react";
import { X, Moon, Sun, Plus, Trash2, Edit2, Save } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore, PROSE_FONTS } from "../store/settingsStore";

export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, theme, setTheme } = useUIStore();
  const {
    mdConfig,
    setMdConfig,
    typography,
    setTypography,
    customRules,
    setCustomRules,
    cacheLocation,
    setCacheLocation,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState("general");

  if (!isSettingsOpen) return null;

  return (
    <div className="modal-overlay open" onClick={() => setSettingsOpen(false)}>
      <div
        className="modal-content settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-sidebar">
          <div className="settings-sidebar-header">
            <h2 className="settings-title">Settings</h2>
          </div>
          <div className="settings-sidebar-nav">
            <button
              className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              Appearance
            </button>
            <button
              className={`settings-nav-item ${activeTab === "typography" ? "active" : ""}`}
              onClick={() => setActiveTab("typography")}
            >
              Typography
            </button>
            <button
              className={`settings-nav-item ${activeTab === "markdown" ? "active" : ""}`}
              onClick={() => setActiveTab("markdown")}
            >
              Markdown Engine
            </button>
            <button
              className={`settings-nav-item ${activeTab === "rules" ? "active" : ""}`}
              onClick={() => setActiveTab("rules")}
            >
              Custom Rules
            </button>
            <button
              className={`settings-nav-item ${activeTab === "system" ? "active" : ""}`}
              onClick={() => setActiveTab("system")}
            >
              System / Storage
            </button>
          </div>
        </div>

        <div className="settings-main">
          <div className="settings-header">
            <button onClick={() => setSettingsOpen(false)} style={iconBtnStyle}>
              <X size={18} />
            </button>
          </div>
          <div className="settings-body">
            {activeTab === "general" && (
              <>
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
              </>
            )}

            {activeTab === "typography" && (
              <>
                <Section label="Typography">
                  <Row label="Prose Font">
                    <select
                      value={typography.proseFont}
                      onChange={(e) =>
                        setTypography({ proseFont: e.target.value })
                      }
                      style={selectStyle}
                    >
                      {PROSE_FONTS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </Row>

                  <Row label={`Font Size (${typography.fontSize}px)`}>
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

                  <Row label={`Line Height (${typography.lineHeight}×)`}>
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
                    label={`Prose Width (${typography.proseWidth === 0 ? "Full" : typography.proseWidth + "px"})`}
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

                <Section label="Heading Scale">
                  {[
                    { key: "h1Scale", label: "H1" },
                    { key: "h2Scale", label: "H2" },
                    { key: "h3Scale", label: "H3" },
                    { key: "h4Scale", label: "H4" },
                  ].map(({ key, label }) => (
                    <Row key={key} label={`${label} (${typography[key]}×)`}>
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
              </>
            )}

            {activeTab === "markdown" && (
              <>
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
                      onChange={(e) =>
                        setMdConfig({ imageSavePath: e.target.value })
                      }
                      style={{ ...selectStyle, width: "130px" }}
                    />
                  </Row>
                </Section>
              </>
            )}

            {activeTab === "rules" && (
              <CustomRulesTab rules={customRules} setRules={setCustomRules} />
            )}

            {activeTab === "system" && (
              <>
                <Section label="Storage & Caching">
                  <Row label="Cache Directory">
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        width: "100%",
                        maxWidth: "300px",
                      }}
                    >
                      <input
                        type="text"
                        value={cacheLocation}
                        onChange={(e) => setCacheLocation(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="/tmp/meditor_cache"
                      />
                      <button
                        onClick={async () => {
                          try {
                            const entry =
                              await window.Neutralino.os.showFolderDialog(
                                "Select Cache Folder",
                              );
                            if (entry) {
                              setCacheLocation(entry);
                            }
                          } catch (e) {
                            // dialog error
                          }
                        }}
                        style={{
                          ...chipStyle,
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                        }}
                      >
                        Browse
                      </button>
                    </div>
                  </Row>
                  <Row label="Manual Actions">
                    <button
                      onClick={async () => {
                        const { fileService } =
                          await import("../services/fileService");
                        fileService.clearDirectoryCache();
                        alert("Cache cleared successfully!");
                      }}
                      style={{
                        ...chipStyle,
                        background: "var(--error, #ff5252)",
                        color: "#fff",
                      }}
                    >
                      <Trash2 size={14} /> Clear Disk Cache
                    </button>
                  </Row>
                </Section>
              </>
            )}
          </div>
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

function CustomRulesTab({ rules, setRules }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  const handleAdd = () => {
    const newId = "rule_" + Date.now();
    setRules([
      ...rules,
      { id: newId, name: "New Rule", regex: "", htmlTemplate: "", css: "" },
    ]);
    handleEdit({
      id: newId,
      name: "New Rule",
      regex: "",
      htmlTemplate: "",
      css: "",
    });
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setDraft(rule);
  };

  const handleDelete = (id) => {
    setRules(rules.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = () => {
    setRules(rules.map((r) => (r.id === draft.id ? draft : r)));
    setEditingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Define custom Markdown rules using Regex.
        </span>
        <button
          onClick={handleAdd}
          style={{ ...chipStyle, background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={14} /> Add Rule
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {rules.map((rule) => (
          <div
            key={rule.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            {editingId === rule.id ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Rule Name"
                  style={{ ...inputStyle, fontWeight: 600 }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Match Regex
                  </label>
                  <input
                    value={draft.regex}
                    onChange={(e) =>
                      setDraft({ ...draft, regex: e.target.value })
                    }
                    placeholder="\$\$de\$\$(.*?)\$\$de\$\$"
                    style={inputStyle}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    HTML Template
                  </label>
                  <input
                    value={draft.htmlTemplate}
                    onChange={(e) =>
                      setDraft({ ...draft, htmlTemplate: e.target.value })
                    }
                    placeholder="<span class='custom'>$1</span>"
                    style={inputStyle}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Custom CSS
                  </label>
                  <textarea
                    value={draft.css}
                    onChange={(e) =>
                      setDraft({ ...draft, css: e.target.value })
                    }
                    placeholder=".custom { color: red; }"
                    style={{
                      ...inputStyle,
                      minHeight: "80px",
                      fontFamily: "monospace",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      ...chipStyle,
                      background: "rgba(255,255,255,0.1)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      ...chipStyle,
                      background: "var(--accent)",
                      color: "#fff",
                    }}
                  >
                    <Save size={14} /> Save Rule
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>
                    {rule.name}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {rule.regex}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEdit(rule)}
                    style={iconBtnStyle}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    style={{ ...iconBtnStyle, color: "var(--error, #ff5252)" }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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

const inputStyle = {
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

const tabStyle = {
  background: "transparent",
  border: "none",
  padding: "0 4px 8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
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
