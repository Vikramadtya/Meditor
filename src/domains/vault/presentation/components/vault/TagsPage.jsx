import { openNoteFromVault } from "../../../../../store/actions/index";
import React, { useState, useEffect, useCallback } from "react";
import { Tag, FileText, Hash } from "lucide-react";
import { useStore } from "../../../../../core/store/index";
import { vaultRepository } from "../../../infrastructure/SqliteVaultRepository";

/**
 * TagsPage Component
 *
 * Displays all tags used in the vault and the notes associated with each tag.
 *
 * @returns {JSX.Element} The rendered TagsPage component.
 */
export default function TagsPage() {
  const [tagsMap, setTagsMap] = useState(new Map());
  const [selectedTag, setSelectedTag] = useState(null);
  const loadTags = useCallback(() => {
    // Fetch all notes to build the tags map
    const notes = vaultRepository._queryAll(
      "SELECT id, name, tags FROM notes WHERE is_deleted=0 AND tags != ''",
    );
    const tMap = new Map();
    notes.forEach((note) => {
      if (note.tags) {
        const tList = note.tags
          .split(",")
          .filter(Boolean)
          .map((t) => t.trim());
        tList.forEach((t) => {
          if (!tMap.has(t)) tMap.set(t, []);
          tMap.get(t).push(note);
        });
      }
    });
    setTagsMap(tMap);

    // Select the first tag if none selected
    if (!selectedTag && tMap.size > 0) {
      const firstTag = Array.from(tMap.keys()).sort()[0];
      setSelectedTag(firstTag);
    }
  }, [selectedTag]);
  useEffect(() => {
    loadTags();
  }, [loadTags]);
  const sortedTags = Array.from(tagsMap.keys()).sort();
  const notesForSelected = selectedTag ? tagsMap.get(selectedTag) || [] : [];
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
      }}
      className="page-container"
    >
      {/* Left: Tags List Panel */}
      <div
        style={{
          width: "280px",
          flexShrink: 0,
          borderRight: "1px solid var(--glass-border)",
          padding: "32px 24px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <Tag size={22} color="var(--accent)" />
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Tags
          </h1>
        </div>

        {sortedTags.length === 0 ? (
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            No tags found in vault.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {sortedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: "none",
                  background:
                    selectedTag === tag ? "var(--accent)" : "transparent",
                  color: selectedTag === tag ? "#fff" : "var(--text-primary)",
                  fontWeight: selectedTag === tag ? 600 : 400,
                  transition: "background 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Hash size={14} opacity={selectedTag === tag ? 1 : 0.5} />
                  {tag}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "99px",
                    background:
                      selectedTag === tag
                        ? "rgba(255,255,255,0.2)"
                        : "var(--bg-secondary)",
                    color:
                      selectedTag === tag ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {tagsMap.get(tag).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Notes for Selected Tag */}
      <div
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
        }}
      >
        {selectedTag ? (
          <>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "28px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Hash size={28} color="var(--accent)" />
              {selectedTag}
            </h2>
            <p
              style={{
                margin: "0 0 28px",
                color: "var(--text-secondary)",
              }}
            >
              {notesForSelected.length} note
              {notesForSelected.length !== 1 ? "s" : ""} tagged
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {notesForSelected.map((note) => (
                <div
                  key={note.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => openNoteFromVault(note)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <FileText size={16} color="var(--accent)" />
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {note.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-secondary)",
            }}
          >
            <Tag
              size={64}
              style={{
                opacity: 0.15,
                marginBottom: "24px",
              }}
            />
            <p>Select a tag to view its notes</p>
          </div>
        )}
      </div>
    </div>
  );
}
