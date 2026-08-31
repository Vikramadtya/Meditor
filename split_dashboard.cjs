const fs = require('fs');

let code = `import React from "react";
import { format } from "date-fns";
import { useStore } from "../../store/index";
import { Folder, FileText, CalendarDays } from "lucide-react";

export default function GlobalDashboard() {
  const { vaultHierarchy, activeVaultItem, openNoteFromVault } = useStore();

  return (
    <div
      style={{
        padding: "40px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0" }}>
          Welcome back
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          {format(new Date(), "EEEE, MMMM do")}
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <h2 style={{ fontSize: "18px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px", marginBottom: "16px" }}>
            Vault Root
          </h2>
          {vaultHierarchy.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", fontStyle: "italic" }}>
              Your vault is empty. Create a container or note from the sidebar.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
              {vaultHierarchy.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.type === "note" ? openNoteFromVault(item) : useStore.getState().setActiveVaultItem(item)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--bg-secondary)",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: item.type === "note" ? "var(--text-primary)" : "var(--accent)", fontWeight: 600 }}>
                    {item.type === "note" ? <FileText size={18} /> : <Folder size={18} />}
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/vault/GlobalDashboard.jsx', code);
