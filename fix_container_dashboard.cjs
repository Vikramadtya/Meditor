const fs = require('fs');
const code = `import React, { useState, useEffect } from "react";
import { Folder, FileText, Book } from "lucide-react";
import { useStore } from "../../store/index";
import { vaultService } from "../../application/vault/VaultService";

export default function ContainerDashboard() {
  const { activeVaultItem, setActiveVaultItem, openNoteFromVault } = useStore();
  const [children, setChildren] = useState([]);

  useEffect(() => {
    if (activeVaultItem && activeVaultItem.type === "container") {
      vaultService.getFolderContents(activeVaultItem.path).then(setChildren);
    }
  }, [activeVaultItem]);

  if (!activeVaultItem) return null;

  return (
    <div style={{ padding: "40px", height: "100%", overflowY: "auto", backgroundColor: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Book size={32} style={{ color: "var(--accent)" }} />
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            {activeVaultItem.name}
          </h1>
          <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Your collection of {children.length} items.
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
        {children.map(child => {
          const isNote = child.type === "note";
          const childCount = child.metadata?.children_order?.length || 0;
          return (
            <div
              key={child.id}
              onClick={() => isNote ? openNoteFromVault(child) : setActiveVaultItem(child)}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--glass-border)",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 15px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
              }}
            >
              {/* Blue Header Section */}
              <div
                style={{
                  height: "120px",
                  backgroundColor: "#3b82f6", // Blue color matching the image
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Book
                  size={90}
                  style={{
                    position: "absolute",
                    bottom: "-15px",
                    right: "10px",
                    color: "rgba(255,255,255,0.2)",
                    transform: "rotate(15deg)"
                  }}
                />
              </div>

              {/* White Body Section */}
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  flex: 1,
                  minHeight: "130px",
                  backgroundColor: "var(--bg-primary)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", lineHeight: "1.4" }}>
                  {child.name}
                </div>
                
                <div style={{ marginTop: "16px" }}>
                  <span
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--text-secondary)"
                    }}
                  >
                    {isNote ? "1 note" : \`\${childCount} items\`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {children.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "100px" }}>
          <Folder size={48} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
          <h3>This folder is empty</h3>
          <p>Create a note or subfolder from the sidebar to get started.</p>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/vault/ContainerDashboard.jsx', code);
