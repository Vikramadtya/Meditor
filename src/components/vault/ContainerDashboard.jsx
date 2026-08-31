import React, { useState, useEffect } from "react";
import { Folder, FileText, ChevronRight, Hash } from "lucide-react";
import { useStore } from "../../store/index";
import { vaultService } from "../../application/vault/VaultService";
import { formatDistanceToNow } from "date-fns";

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
    <div
      style={{
        padding: "40px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <Folder size={32} style={{ color: "var(--accent)" }} />
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {activeVaultItem.name}
          </h1>
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginTop: "4px",
            }}
          >
            Container with {children.length} items
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {children.map((child) => {
          const isNote = child.type === "note";
          const Icon = isNote ? FileText : Folder;
          return (
            <div
              key={child.id}
              onClick={() =>
                isNote ? openNoteFromVault(child) : setActiveVaultItem(child)
              }
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
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
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: isNote ? "var(--text-primary)" : "var(--accent)",
                }}
              >
                <Icon size={20} />
                <span style={{ fontWeight: 600, fontSize: "15px" }}>
                  {child.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {children.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginTop: "100px",
          }}
        >
          <Folder size={48} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
          <h3>This folder is empty</h3>
          <p>Create a note or subfolder from the sidebar to get started.</p>
        </div>
      )}
    </div>
  );
}
