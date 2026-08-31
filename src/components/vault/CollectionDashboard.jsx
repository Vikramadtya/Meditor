import React, { useState } from "react";
import LinearNotesView from "./LinearNotesView";

import { useStore } from "../../store/index";
import { BookOpen, CircleDashed, FileText, Maximize, Plus } from "lucide-react";
import MarkdownPreview from "../editor/MarkdownPreview";

/**
 * CollectionDashboard Component
 *
 * Displays the dashboard for a specific collection within the vault.
 * Supports viewing contents as a Table of Contents (modules and notes)
 * or a linear notes view.
 *
 * @returns {JSX.Element|null} The collection dashboard view, or null if no active collection.
 */
export default function CollectionDashboard() {
  const { activeVaultItem, openNoteFromVault } = useStore();
  const { openCreateVaultItemModal } = useStore();
  const [viewMode, setViewMode] = useState("toc"); // 'toc' or 'linear'

  if (!activeVaultItem || activeVaultItem.type !== "collection") return null;

  const modules = activeVaultItem.children || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Top Header Section */}
      <div
        style={{
          padding: "40px 40px 20px 40px",
          borderBottom: "1px solid var(--glass-border)",
          backgroundColor: "var(--bg-primary)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
              }}
            />
            {activeVaultItem.name}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            {activeVaultItem.name}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Toggle Switch */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "8px",
              padding: "4px",
              border: "1px solid var(--glass-border)",
            }}
          >
            <button
              onClick={() => setViewMode("toc")}
              style={{
                padding: "8px 24px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor:
                  viewMode === "toc" ? "var(--bg-primary)" : "transparent",
                color:
                  viewMode === "toc"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                boxShadow:
                  viewMode === "toc" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s",
              }}
            >
              Table of
              <br />
              Contents
            </button>
            <button
              onClick={() => setViewMode("linear")}
              style={{
                padding: "8px 24px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor:
                  viewMode === "linear" ? "var(--bg-primary)" : "transparent",
                color:
                  viewMode === "linear"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                boxShadow:
                  viewMode === "linear" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s",
              }}
            >
              Linear
              <br />
              Notes
            </button>
          </div>

          <button
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {viewMode === "toc" ? (
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "32px",
              }}
            >
              <BookOpen size={24} color="#3b82f6" />
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
                Table of Contents
              </h2>

              <button
                onClick={() =>
                  openCreateVaultItemModal("module", activeVaultItem.id)
                }
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--glass-border)",
                  backgroundColor: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <Plus size={14} /> Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-secondary)",
                }}
              >
                No modules yet. Click "Add Module" to get started.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {modules.map((module) => (
                  <div key={module.id} style={{ position: "relative" }}>
                    {/* Module Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <CircleDashed
                        size={20}
                        color="#3b82f6"
                        style={{ flexShrink: 0 }}
                      />
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.1rem",
                          fontWeight: 700,
                        }}
                      >
                        {module.name}
                      </h3>
                      <button
                        onClick={() =>
                          openCreateVaultItemModal("note", module.id)
                        }
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                        title="Add Note to this Module"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Notes List */}
                    <div
                      style={{
                        paddingLeft: "10px",
                        marginLeft: "9px",
                        borderLeft: "2px solid var(--glass-border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {(module.children || []).length === 0 ? (
                        <div
                          style={{
                            paddingLeft: "16px",
                            color: "var(--text-secondary)",
                            fontSize: "13px",
                            fontStyle: "italic",
                          }}
                        >
                          No notes in this module.
                        </div>
                      ) : (
                        (module.children || []).map((note, index) => (
                          <div
                            key={note.id}
                            onClick={() => openNoteFromVault(note)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              paddingLeft: "16px",
                              cursor: "pointer",
                              color: "var(--text-secondary)",
                              fontSize: "14px",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color =
                                "var(--text-primary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--text-secondary)")
                            }
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                opacity: 0.6,
                                width: "16px",
                                textAlign: "right",
                              }}
                            >
                              {index + 1}.
                            </span>
                            <span style={{ fontWeight: 500 }}>{note.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <LinearNotesView collection={activeVaultItem} />
        )}
      </div>
    </div>
  );
}
