import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../../store/index";

import { tagService } from "../../services/tagService";
import { linkService } from "../../services/linkService";

export default function TableOfContents({ toc }) {
  const {
    isTocOpen,
    markdown,
    currentFilePath,
    fileName,
    activeVaultItem,
    workspaceMode,
    setTagModalOpen,
  } = useStore();

  const [activeTab, setActiveTab] = useState("outline"); // "outline" or "stats"
  const [backlinks, setBacklinks] = useState([]);

  useEffect(() => {
    if (isTocOpen && activeTab === "stats" && fileName) {
      // The filename might have .md, getBacklinksForNote handles it or we pass it
      linkService.getBacklinksForNote(fileName).then((links) => {
        setBacklinks(links);
      });
    }
  }, [isTocOpen, activeTab, fileName]);

  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200);

    // Extract tags
    const tags = [];
    if (workspaceMode === "vault" && activeVaultItem && activeVaultItem.tags) {
      activeVaultItem.tags
        .split(",")
        .filter(Boolean)
        .forEach((t) => {
          if (!tags.includes(t)) tags.push(t);
        });
    }

    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      if (!tags.includes(match[1])) tags.push(match[1]);
    }

    return { words, chars, readTime, tags };
  }, [markdown, workspaceMode, activeVaultItem]);

  if (!isTocOpen) return null;

  const handleScroll = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="toc-sidebar">
      {/* Tab Header */}
      <div style={{ display: "flex", padding: "16px", gap: "8px" }}>
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

      <div style={{ flex: 1, overflowY: "auto" }}>
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
          <div style={{ padding: "0 16px" }}>
            <div
              className="toc-header"
              style={{ paddingLeft: 0, paddingRight: 0 }}
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
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              BACKLINKS ({backlinks.length})
            </div>
            {backlinks.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
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
                    onClick={() => linkService.openNoteByName(link.name)}
                  >
                    <div
                      style={{ fontWeight: 600, color: "var(--text-primary)" }}
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
