import React from "react";
export function AgendaForm({ agendaDate, setAgendaDate }) {
  return (
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
          color: "var(--text-secondary)",
        }}
      >
        Add to Agenda (Optional)
      </div>
      <input
        type="date"
        value={agendaDate}
        onChange={(e) => setAgendaDate(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--glass-border)",
          borderRadius: "8px",
          color: "var(--text-primary)",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </div>
  );
}
