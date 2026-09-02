import React, { useState } from "react";
import { Plus, Trash2, Edit2, Save } from "lucide-react";
import { chipStyle, inputStyle, iconBtnStyle } from "./SettingsStyles";
import { useSettingsStore } from "../application/settingsStore";

/**
 * Settings tab for managing custom markdown rendering rules using Regular Expressions.
 * Allows users to add, edit, and delete custom text replacements with HTML/CSS.
 *
 * @returns {React.ReactElement} The custom rules settings tab component.
 */
export default function CustomRulesTab() {
  const { customRules, setCustomRules } = useSettingsStore();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const handleAdd = () => {
    const newId = "rule_" + Date.now();
    setCustomRules([
      ...customRules,
      {
        id: newId,
        name: "New Rule",
        regex: "",
        htmlTemplate: "",
        css: "",
      },
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
    setCustomRules(customRules.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };
  const handleSave = () => {
    setCustomRules(customRules.map((r) => (r.id === draft.id ? draft : r)));
    setEditingId(null);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          Define custom Markdown rules using Regex.
        </span>
        <button
          onClick={handleAdd}
          style={{
            ...chipStyle,
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          <Plus size={14} /> Add Rule
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {customRules.map((rule) => (
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
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                    })
                  }
                  placeholder="Rule Name"
                  style={{
                    ...inputStyle,
                    fontWeight: 600,
                  }}
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
                      setDraft({
                        ...draft,
                        regex: e.target.value,
                      })
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
                      setDraft({
                        ...draft,
                        htmlTemplate: e.target.value,
                      })
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
                      setDraft({
                        ...draft,
                        css: e.target.value,
                      })
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
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
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
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => handleEdit(rule)}
                    style={iconBtnStyle}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    style={{
                      ...iconBtnStyle,
                      color: "var(--error, #ff5252)",
                    }}
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
