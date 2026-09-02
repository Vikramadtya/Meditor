import { useShallow } from "zustand/react/shallow";
import { openNoteFromVault } from "../../../../../core/store/actions";
import React, { useState, useEffect } from "react";
import { Sun, FileText, Clock, Plus } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { useStore } from "../../../../../core/store/index";
import { vaultRepository } from "../../../infrastructure/SqliteVaultRepository";

/**
 * TodayPage Component
 *
 * Displays the notes created or edited today.
 * Shows an empty state if no activity has occurred today.
 *
 * @returns {JSX.Element} The rendered TodayPage component.
 */
export default function TodayPage() {
  const { openCreateVaultItemModal } = useStore(
    useShallow((s) => ({
      openCreateVaultItemModal: s.openCreateVaultItemModal,
    })),
  );
  const [created, setCreated] = useState([]);
  const [edited, setEdited] = useState([]);
  useEffect(() => {
    const todayStart = startOfDay(new Date()).getTime();
    // Created today
    const createdNotes = vaultRepository._queryAll(
      "SELECT * FROM notes WHERE is_deleted=0 AND created_at >= ? ORDER BY created_at DESC",
      [todayStart],
    );
    // Edited today (but not created today)
    const editedNotes = vaultRepository._queryAll(
      "SELECT * FROM notes WHERE is_deleted=0 AND updated_at >= ? AND created_at < ? ORDER BY updated_at DESC",
      [todayStart, todayStart],
    );
    setCreated(createdNotes);
    setEdited(editedNotes);
  }, []);
  const isEmpty = created.length === 0 && edited.length === 0;
  return (
    <div
      style={{
        padding: "40px 60px",
        height: "100%",
        overflowY: "auto",
      }}
      className="page-container"
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Sun size={36} color="#f59e0b" fill="#fde68a" />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800,
                }}
              >
                Today
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "15px",
                }}
              >
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {isEmpty /* Empty state */ ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
              color: "var(--text-secondary)",
            }}
          >
            <Sun
              size={64}
              style={{
                opacity: 0.15,
                marginBottom: "24px",
              }}
            />
            <h2
              style={{
                fontWeight: 700,
                fontSize: "20px",
              }}
            >
              Nothing yet today
            </h2>
            <p>Notes you create or edit today will appear here.</p>
          </div>
        ) : (
          <>
            {/* Created Today Section */}
            {created.length > 0 && (
              <NoteSection
                title="✨ Created Today"
                notes={created}
                onOpen={openNoteFromVault}
                timeKey="created_at"
              />
            )}
            {/* Edited Today Section */}
            {edited.length > 0 && (
              <NoteSection
                title="✏️ Edited Today"
                notes={edited}
                onOpen={openNoteFromVault}
                timeKey="updated_at"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * NoteSection Component
 *
 * Renders a list of notes with a given title.
 *
 * @param {Object} props - Component props.
 * @param {string} props.title - The section title.
 * @param {Array<Object>} props.notes - The array of note objects.
 * @param {function} props.onOpen - Callback when a note is clicked.
 * @param {string} props.timeKey - The key to extract timestamp ('created_at' or 'updated_at').
 * @returns {JSX.Element} The rendered NoteSection.
 */
function NoteSection({ title, notes, onOpen, timeKey }) {
  return (
    <div
      style={{
        marginBottom: "40px",
      }}
    >
      <h2
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "16px",
        }}
      >
        {title} — {notes.length}
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onOpen(note)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FileText size={16} color="var(--accent)" />
              <span
                style={{
                  fontWeight: 600,
                }}
              >
                {note.name}
              </span>
              {note.tags && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {note.tags
                    .split(",")
                    .filter(Boolean)
                    .map((t) => `#${t}`)
                    .join(" ")}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-secondary)",
                fontSize: "12px",
              }}
            >
              <Clock size={12} />
              {format(new Date(note[timeKey]), "h:mm a")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
