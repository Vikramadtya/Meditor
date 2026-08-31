const fs = require('fs');

let code = fs.readFileSync('src/components/vault/GlobalDashboard.jsx', 'utf8');

const searchSection = `        {/* Agenda Column */}
        <div style={{ flex: 1, minWidth: "300px" }}>
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
            <CalendarDays size={18} style={{ color: "var(--accent)" }} />
            Agenda
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {agendaNotes.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic", padding: "12px" }}>
                Nothing scheduled for today.
              </div>
            ) : (
              agendaNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => useStore.getState().openNoteFromVault(note)}
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
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                    {note.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Due for review
                  </div>
                </div>
              ))
            )}
          </div>
        </div>`;

code = code.replace(searchSection, '');

fs.writeFileSync('src/components/vault/GlobalDashboard.jsx', code);
console.log('Fixed GlobalDashboard');
