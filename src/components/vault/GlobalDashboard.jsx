import { useShallow } from "zustand/react/shallow";
import { openNoteFromVault } from "../../store/actions/index";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useStore } from "../../core/store/index";
import { Folder, FileText, CalendarDays } from "lucide-react";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
export default function GlobalDashboard() {
  const { vaultHierarchy, activeVaultItem } = useStore(
    useShallow((s) => ({
      vaultHierarchy: s.vaultHierarchy,
      activeVaultItem: s.activeVaultItem,
    })),
  );
  const [agendaNotes, setAgendaNotes] = useState([]);
  useEffect(() => {
    setAgendaNotes(vaultRepository.getAgendaNotes());
  }, [vaultHierarchy]);
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
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 8px 0",
          }}
        >
          Welcome back
        </h1>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          {format(new Date(), "EEEE, MMMM do")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 2,
            minWidth: "300px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              borderBottom: "1px solid var(--glass-border)",
              paddingBottom: "12px",
              marginBottom: "16px",
            }}
          >
            Vault Root
          </h2>
          {vaultHierarchy.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              Your vault is empty. Create a container or note from the sidebar.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {vaultHierarchy.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    item.type === "note"
                      ? openNoteFromVault(item)
                      : useStore.getState().setActiveVaultItem(item)
                  }
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--bg-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color:
                        item.type === "note"
                          ? "var(--text-primary)"
                          : "var(--accent)",
                      fontWeight: 600,
                    }}
                  >
                    {item.type === "note" ? (
                      <FileText size={18} />
                    ) : (
                      <Folder size={18} />
                    )}
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agenda Column */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid var(--glass-border)",
              paddingBottom: "12px",
            }}
          >
            <CalendarDays
              size={18}
              style={{
                color: "var(--accent)",
              }}
            />
            Agenda
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {agendaNotes.length === 0 ? (
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  fontStyle: "italic",
                  padding: "12px",
                }}
              >
                Nothing scheduled for today.
              </div>
            ) : (
              agendaNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => openNoteFromVault(note)}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--bg-secondary)",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--glass-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    {note.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Due today
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
