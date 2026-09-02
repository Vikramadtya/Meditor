import { openNoteFromVault } from "../../store/actions/index";
import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, FileText, X } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { useStore } from "../../core/store/index";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { noteService } from "../../application/vault/NoteService";
import toast from "react-hot-toast";

/**
 * AgendaPage Component
 *
 * Displays a calendar and a list of notes scheduled for the selected date.
 * Allows viewing and removing scheduled notes.
 *
 * @returns {JSX.Element} The rendered AgendaPage component.
 */
export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notesForDay, setNotesForDay] = useState([]);
  const [agendaDays, setAgendaDays] = useState(new Set());
  const loadAgendaDays = useCallback(() => {
    const days = vaultRepository.getAgendaDays();
    setAgendaDays(
      new Set(days.map((ts) => startOfDay(new Date(ts)).getTime())),
    );
  }, []);
  const loadNotesForDate = useCallback((date) => {
    const dayStart = startOfDay(date).getTime();
    const dayEnd = endOfDay(date).getTime();
    setNotesForDay(vaultRepository.getNotesForDate(dayStart, dayEnd));
  }, []);
  useEffect(() => {
    loadAgendaDays();
    loadNotesForDate(selectedDate);
  }, [loadAgendaDays, loadNotesForDate, selectedDate]);
  const handleDateChange = (date) => {
    setSelectedDate(date);
    loadNotesForDate(date);
  };
  const handleRemoveDate = async (note) => {
    vaultRepository.setNoteAgendaDate(note.id, 0);
    // Save via direct db call then re-fetch
    const { vaultService } =
      await import("../../application/vault/VaultService");
    await vaultService.save();
    loadNotesForDate(selectedDate);
    loadAgendaDays();
    toast.success("Date removed");
  };

  // Tile content: show dot on days with notes
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dayTs = startOfDay(date).getTime();
    return agendaDays.has(dayTs) ? (
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "var(--accent)",
          margin: "2px auto 0",
        }}
      />
    ) : null;
  };
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
      }}
      className="page-container"
    >
      {/* Left: Calendar Panel */}
      <div
        style={{
          width: "320px",
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
          <CalendarDays size={22} color="var(--accent)" />
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Agenda
          </h1>
        </div>
        {/* react-calendar — styled via CSS overrides in global.css */}
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          showNeighboringMonth={false}
        />
      </div>

      {/* Right: Notes for Selected Day */}
      <div
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "22px",
            fontWeight: 800,
          }}
        >
          {format(selectedDate, "EEEE, MMMM d")}
        </h2>
        <p
          style={{
            margin: "0 0 28px",
            color: "var(--text-secondary)",
          }}
        >
          {notesForDay.length > 0
            ? `${notesForDay.length} note${notesForDay.length !== 1 ? "s" : ""} scheduled`
            : "No notes scheduled"}
        </p>

        {notesForDay.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-secondary)",
            }}
          >
            <CalendarDays
              size={48}
              style={{
                opacity: 0.15,
                marginBottom: "16px",
              }}
            />
            <p>Add a date to notes from the Tags panel to see them here.</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {notesForDay.map((note) => (
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
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => openNoteFromVault(note)}
                >
                  <FileText size={16} color="var(--accent)" />
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {note.name}
                    </div>
                    {note.tags && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "2px",
                        }}
                      >
                        {note.tags
                          .split(",")
                          .filter(Boolean)
                          .map((t) => `#${t}`)
                          .join(" ")}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDate(note)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    padding: "4px",
                  }}
                  title="Remove from agenda"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
