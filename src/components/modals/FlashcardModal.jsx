import { useModalEscape } from "../../hooks/useModalEscape";
import React, { useState, useEffect } from "react";
import { X, Layers, Save } from "lucide-react";
import { useStore } from "../../store/index";
import { noteService } from "../../application/vault/NoteService";
import toast from "react-hot-toast";

/**
 * Modal component for creating and editing active recall flashcards associated with a note.
 * Allows users to set a question and answer for spaced repetition.
 *
 * @returns {React.ReactElement|null} The flashcard modal or null if not open.
 */
export default function FlashcardModal() {
  const {
    isFlashcardModalOpen,
    setFlashcardModalOpen,
    activeVaultItem,
    setActiveVaultItem,
  } = useStore();
  useModalEscape(isFlashcardModalOpen, () => setFlashcardModalOpen(false));

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const noteId = activeVaultItem?.type === "note" ? activeVaultItem.id : null;

  useEffect(() => {
    if (isFlashcardModalOpen && noteId) {
      const meta = noteService.getMeta(noteId);
      setQuestion(meta.flashcard_question);
      setAnswer(meta.flashcard_answer);
    }
  }, [isFlashcardModalOpen, noteId]);

  const handleDone = async () => {
    if (!noteId) return;
    const existing = noteService.getMeta(noteId);
    await noteService.updateMeta(noteId, {
      ...existing,
      flashcard_question: question,
      flashcard_answer: answer,
    });

    if (activeVaultItem) {
      setActiveVaultItem({
        ...activeVaultItem,
        flashcard_question: question,
        flashcard_answer: answer,
      });
    }

    toast.success("Flashcard saved!");
    setFlashcardModalOpen(false);
  };

  if (!isFlashcardModalOpen) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={() => setFlashcardModalOpen(false)}
    >
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
            <Layers size={18} /> Active Recall Flashcard
          </h2>
          <button
            onClick={() => setFlashcardModalOpen(false)}
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
              background: "#fffbeb",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#d97706",
                letterSpacing: "1px",
                marginBottom: "14px",
              }}
            >
              FLASHCARD (OPTIONAL)
            </div>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Question..."
              style={{
                display: "block",
                width: "100%",
                marginBottom: "10px",
                padding: "10px 14px",
                background: "#fff",
                border: "1px solid #fde68a",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#1a1a1a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer..."
              rows={3}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                background: "#fff",
                border: "1px solid #fde68a",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#1a1a1a",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
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
            onClick={() => setFlashcardModalOpen(false)}
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
