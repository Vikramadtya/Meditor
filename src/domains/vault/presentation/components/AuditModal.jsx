import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../../core/store";
import { X, Activity } from "lucide-react";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";

export default function AuditModal() {
  const { isOpen, close } = useStore(
    useShallow((s) => ({
      isOpen: s.isAuditModalOpen,
      close: () => s.setAuditModalOpen(false),
    }))
  );

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLogs(vaultRepository.getAuditLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "var(--bg-primary)", borderRadius: "12px", width: "500px", maxWidth: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
            <Activity size={18} style={{ color: "var(--accent)" }} />
            Audit Log
          </h2>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {logs.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "13px", marginTop: "40px" }}>No audit logs available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {logs.map((log) => (
                <div key={log.id} style={{ display: "flex", flexDirection: "column", padding: "12px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent)" }}>{log.action}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{log.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
