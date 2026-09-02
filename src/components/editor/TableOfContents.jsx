import { openNoteByName } from "../../store/actions/index.js";
import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../../store/index";
import { useTableOfContents } from "../../hooks/useTableOfContents";
import { searchService } from "../../application/editor/SearchService.js";

/**
 * Renders the table of contents sidebar, providing an outline of the markdown document
 * or document statistics and backlinks.
 *
 * @param {Object} props - The component props.
 * @param {Array<{id: string, text: string, level: number}>} props.toc - The table of contents data generated from markdown headings.
 * @returns {React.ReactElement|null} The rendered TableOfContents component, or null if it shouldn't be visible.
 */
export default function TableOfContents({ toc }) {
  const {
    isTocOpen,
    activeTab,
    setActiveTab,
    backlinks,
    stats,
    handleScroll,
    setTagModalOpen,
    workspaceMode,
    activeVaultItem,
  } = useTableOfContents();
  if (!isTocOpen) return null;
  return (
    <div className="toc-sidebar">
      {/* Tab Header */}
      <div
        style={{
          display: "flex",
          padding: "16px",
          gap: "8px",
        }}
      >
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            flex: 1,
            padding: "6px",
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "6px",
            background:
              activeTab === "stats" ? "var(--bg-secondary)" : "transparent",
            color:
              activeTab === "stats"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            border: "1px solid",
            borderColor:
              activeTab === "stats" ? "var(--glass-border)" : "transparent",
            cursor: "pointer",
          }}
        >
          STATS
        </button>
        <button
          onClick={() => setActiveTab("outline")}
          style={{
            flex: 1,
            padding: "6px",
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "6px",
            background:
              activeTab === "outline" ? "var(--bg-secondary)" : "transparent",
            color:
              activeTab === "outline"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            border: "1px solid",
            borderColor:
              activeTab === "outline" ? "var(--glass-border)" : "transparent",
            cursor: "pointer",
          }}
        >
          OUTLINE
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {activeTab === "outline" ? (
          <>
            <div className="toc-header">TABLE OF CONTENTS</div>
            {toc.length > 0 ? (
              toc.map((heading, i) => (
                <div
                  key={i}
                  onClick={() => handleScroll(heading.id)}
                  className={`toc-item level-${heading.level}`}
                  title={heading.text}
                >
                  {heading.text}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "16px",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                No headings found.
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: "0 16px",
            }}
          >
            <div
              className="toc-header"
              style={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              DOCUMENT STATS
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {stats.words}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  Words
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {stats.chars}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  Characters
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {stats.readTime}m
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  Read Time
                </div>
              </div>
            </div>

            <div
              className="toc-header"
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>TAGS ({stats.tags.length})</span>
              {workspaceMode === "vault" &&
                activeVaultItem?.type === "note" && (
                  <button
                    onClick={() => setTagModalOpen(true)}
                    style={{
                      background: "rgba(128,128,128,0.1)",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                    title="Add tags & metadata"
                  >
                    + ADD
                  </button>
                )}
            </div>

            {stats.tags.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "24px",
                }}
              >
                {stats.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "var(--text-primary)",
                      color: "var(--bg-primary)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: workspaceMode === "vault" ? "pointer" : "default",
                    }}
                    onClick={() =>
                      workspaceMode === "vault" && setTagModalOpen(true)
                    }
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontStyle: "italic",
                  marginBottom: "24px",
                }}
              >
                No tags
              </div>
            )}

            <div
              className="toc-header"
              style={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              BACKLINKS ({backlinks.length})
            </div>
            {backlinks.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {backlinks.map((link, i) => (
                  <div
                    key={i}
                    className="toc-item"
                    style={{
                      padding: "6px 8px",
                      background: "var(--bg-secondary)",
                      borderRadius: "6px",
                    }}
                    onClick={() => openNoteByName(link.name)}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {link.name}
                    </div>
                    {link.snippet && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                        }}
                      >
                        {link.snippet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                No backlinks
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
