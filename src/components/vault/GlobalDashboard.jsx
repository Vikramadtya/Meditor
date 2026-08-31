import React, { useState } from "react";
import { useStore } from "../../store/index";
import {
  Book,
  GraduationCap,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Library,
  Trash2,
  Edit2,
} from "lucide-react";
import { startOfDay } from "date-fns";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { vaultService } from "../../application/vault/VaultService";

export default function GlobalDashboard() {
  const { activeVaultItem, openCreateVaultItemModal } = useStore();
  const [todayNotes, setTodayNotes] = React.useState([]);
  const [dashboardTab, setDashboardTab] = React.useState("overview");
  const [agendaNotes, setAgendaNotes] = React.useState([]);
  const [activeCardId, setActiveCardId] = React.useState(null);

  React.useEffect(() => {
    if (vaultRepository.db) {
      const todayStart = startOfDay(new Date()).getTime();
      try {
        setTodayNotes(vaultRepository.findNotesEditedSince(todayStart));
        setAgendaNotes(vaultRepository.getAgendaNotes());
      } catch (e) {}
    }
  }, []);

  const handleSrsAction = async (noteId, quality) => {
    const note = agendaNotes.find((n) => n.id === noteId);
    if (!note) return;

    const { srsService } = await import("../../domain/srs");
    const { ease, interval, nextReview } = srsService.calculateNextReview(
      quality,
      note.srs_ease || 2.5,
      note.srs_interval || 0,
    );

    await vaultService.updateNoteSRS(noteId, ease, interval, nextReview);
    setAgendaNotes(agendaNotes.filter((n) => n.id !== noteId));
    setActiveCardId(null);
  };

  return (
    <div
      style={{
        padding: "40px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
          borderBottom: "1px solid var(--glass-border)",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setDashboardTab("overview")}
          style={{
            background: "none",
            border: "none",
            padding: "10px",
            fontSize: "1.5rem",
            fontWeight: 700,
            color:
              dashboardTab === "overview"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          Today
        </button>
        <button
          onClick={() => setDashboardTab("agenda")}
          style={{
            background: "none",
            border: "none",
            padding: "10px",
            fontSize: "1.5rem",
            fontWeight: 700,
            color:
              dashboardTab === "agenda"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Agenda
          {agendaNotes.length > 0 && (
            <span
              style={{
                fontSize: "12px",
                background: "var(--error, #ff5252)",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              {agendaNotes.length}
            </span>
          )}
        </button>
      </div>

      {dashboardTab === "agenda" ? (
        <div>
          {agendaNotes.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "var(--text-secondary)",
              }}
            >
              <h3>All caught up! 🎉</h3>
              <p>No flashcards are due for review.</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              {agendaNotes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    border: "2px solid var(--glass-border)",
                    borderRadius: "16px",
                    padding: "24px",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--accent)",
                      marginBottom: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {note.name}
                  </div>
                  <h3
                    style={{
                      margin: "0 0 24px 0",
                      fontSize: "1.2rem",
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {note.flashcard_question}
                  </h3>
                  {activeCardId === note.id ? (
                    <div>
                      <div
                        style={{
                          padding: "16px",
                          background: "rgba(0,0,0,0.05)",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          borderLeft: "4px solid var(--accent)",
                          fontSize: "1.1rem",
                        }}
                      >
                        {note.flashcard_answer}
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={() => handleSrsAction(note.id, 3)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--error, #ff5252)",
                            color: "var(--error, #ff5252)",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Hard (Soon)
                        </button>
                        <button
                          onClick={() => handleSrsAction(note.id, 4)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #10b981",
                            color: "#10b981",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Good
                        </button>
                        <button
                          onClick={() => handleSrsAction(note.id, 5)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "var(--accent)",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Easy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCardId(note.id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "var(--accent)",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                      }}
                    >
                      Show Answer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {todayNotes.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: "var(--text-secondary)",
                textAlign: "center",
                gap: "16px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "12px",
                border: "1px dashed var(--glass-border)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: "1px solid var(--glass-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                #
              </div>
              <h3
                style={{
                  margin: "0",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                It's quiet here...
              </h3>
              <p style={{ margin: 0, maxWidth: "400px" }}>
                This project doesn't have any notes edited today yet. Use the
                sidebar to create your first note.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {todayNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => useStore.getState().openNoteFromVault(note)}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--bg-secondary)",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(168,85,247,0.1)",
                        color: "var(--accent)",
                      }}
                    >
                      <Book size={20} />
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.1rem",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {note.name}
                    </h3>
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                    }}
                  >
                    Created at{" "}
                    {new Date(note.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
