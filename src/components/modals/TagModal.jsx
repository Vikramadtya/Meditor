import { useModalEscape } from "../../hooks/useModalEscape";
import React, { useState, useEffect, useRef } from "react";
import { X, Tag, Save } from "lucide-react";
import { useStore } from "../../store/index";
import { noteService } from "../../application/vault/NoteService";
import toast from "react-hot-toast";

export default function TagModal() {
  const {
    isTagModalOpen,
    setTagModalOpen,
    activeVaultItem,
    setActiveVaultItem,
  } = useStore();
  useModalEscape(isTagModalOpen, () => setTagModalOpen(false));

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [agendaDate, setAgendaDate] = useState("");
  const tagInputRef = useRef(null);

  const noteId = activeVaultItem?.type === "note" ? activeVaultItem.id : null;

  useEffect(() => {
    if (isTagModalOpen && noteId) {
      const meta = noteService.getMeta(noteId);
      setTags(meta.tags);
      setTagInput("");
      if (meta.agenda_date) {
        setAgendaDate(new Date(meta.agenda_date).toISOString().slice(0, 10));
      } else {
        setAgendaDate("");
      }
    }
  }, [isTagModalOpen, noteId]);

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, "");
      if (newTag && !tags.includes(newTag))
        setTags((prev) => [...prev, newTag]);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleDone = async () => {
    if (!noteId) return;
    const existing = noteService.getMeta(noteId);
    const agendaTs = agendaDate ? new Date(agendaDate).getTime() : 0;
    await noteService.updateMeta(noteId, {
      ...existing,
      tags,
      agenda_date: agendaTs,
    });

    // Update activeVaultItem in store so right sidebar updates instantly
    if (activeVaultItem) {
      setActiveVaultItem({ ...activeVaultItem, tags: tags.join(",") });
    }

    toast.success("Saved!");
    setTagModalOpen(false);
  };

  if (!isTagModalOpen) return null;

  return (
    <div className="modal-overlay open" onClick={() => setTagModalOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "600px",
          maxWidth: "92%",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Tag size={18} /> Manage Tags
          </h2>
          <button
            onClick={() => setTagModalOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              cursor: "text",
              minHeight: "46px",
            }}
            onClick={() => tagInputRef.current?.focus()}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--glass-border)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                #{tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 2px",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "Tags (press Enter)..." : ""}
              style={{
                flex: 1,
                minWidth: "120px",
                background: "none",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "var(--text-primary)",
                padding: "2px 0",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              marginTop: "6px",
              paddingLeft: "2px",
            }}
          >
            Press Enter or comma to add a tag
          </div>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--glass-border)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📅 Schedule for Agenda
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="date"
                value={agendaDate}
                onChange={(e) => setAgendaDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              {agendaDate && (
                <button
                  onClick={() => setAgendaDate("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={() => setTagModalOpen(false)}
            style={{
              padding: "8px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Close
          </button>
          <button
            onClick={handleDone}
            style={{
              padding: "8px 22px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Save size={14} /> Done
          </button>
        </div>
      </div>
    </div>
  );
}
