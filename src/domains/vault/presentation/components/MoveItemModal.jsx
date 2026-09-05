import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../../core/store";
import { X, Folder, MoveRight } from "lucide-react";
import { vaultService } from "../../application/VaultService";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { reloadVaultHierarchy } from "../../../../core/store/actions";
import toast from "react-hot-toast";

export default function MoveItemModal() {
  const { modal, close } = useStore(
    useShallow((s) => ({
      modal: s.moveItemModal,
      close: s.closeMoveItemModal,
    }))
  );

  const [containers, setContainers] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (modal?.isOpen) {
      const all = vaultRepository._queryAll("SELECT path, name FROM containers ORDER BY path ASC");
      setContainers([{ path: "notes", name: "Root" }, ...all]);
    }
  }, [modal?.isOpen]);

  if (!modal?.isOpen || !modal.item) return null;
  const item = modal.item;

  const handleMove = async () => {
    if (!selectedDest) return;
    setIsMoving(true);
    try {
      await vaultService.moveItem(item.type, item.id, item.path, selectedDest);
      toast.success(`Moved "${item.name}"`);
      reloadVaultHierarchy();
      close();
    } catch (err) {
      toast.error("Move failed: " + err.message);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "var(--bg-primary)", borderRadius: "12px", width: "450px", maxWidth: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
            <MoveRight size={18} style={{ color: "var(--accent)" }} />
            Move {item.name}
          </h2>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>
            Select destination collection:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {containers.map((c) => {
              // Prevent moving a container into itself or its own descendants
              if (item.type === "container" && (c.path === item.path || c.path.startsWith(item.path + "/"))) return null;
              
              const isSelected = selectedDest === c.path;
              return (
                <div 
                  key={c.path}
                  onClick={() => setSelectedDest(c.path)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "6px", cursor: "pointer", backgroundColor: isSelected ? "var(--accent)" : "transparent", color: isSelected ? "white" : "var(--text-primary)", border: isSelected ? "1px solid var(--accent)" : "1px solid var(--glass-border)" }}
                >
                  <Folder size={14} style={{ opacity: 0.8 }} />
                  <span style={{ fontSize: "13px" }}>{c.path === "notes" ? "Vault Root" : c.path.replace("notes/", "")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 20px", backgroundColor: "var(--bg-secondary)", borderTop: "1px solid var(--glass-border)" }}>
          <button 
            onClick={close}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "var(--bg-primary)", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
          >
            Cancel
          </button>
          <button 
            onClick={handleMove}
            disabled={!selectedDest || isMoving}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "var(--accent)", color: "white", cursor: (!selectedDest || isMoving) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px", opacity: (!selectedDest || isMoving) ? 0.5 : 1 }}
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}
