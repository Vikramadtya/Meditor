import React, { useState, useEffect } from "react";
import { X, Trash2, RefreshCw } from "lucide-react";
import { useStore } from "../../store/index";
import { vaultService } from "../../application/vault/VaultService";

import { iconBtnStyle } from "../Settings/SettingsStyles";

export default function TrashModal() {
  const { isTrashModalOpen, setTrashModalOpen, reloadVaultHierarchy } =
    useStore();

  const [deletedNotes, setDeletedNotes] = useState([]);

  useEffect(() => {
    if (isTrashModalOpen) {
      setDeletedNotes(vaultService.getDeletedNotes());
    }
  }, [isTrashModalOpen]);

  if (!isTrashModalOpen) return null;

  const handleRestore = async (id) => {
    await vaultService.restoreNote(id);
    setDeletedNotes(vaultService.getDeletedNotes());
    reloadVaultHierarchy();
  };

  const handleHardDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this note? This cannot be undone.",
      )
    ) {
      await vaultService.deleteItem("note", id, true);
      setDeletedNotes(vaultService.getDeletedNotes());
    }
  };

  return (
    <div
      className="modal-overlay open"
      onClick={() => setTrashModalOpen(false)}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "600px", maxWidth: "90%" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <h2>Trash Bin</h2>
          <button onClick={() => setTrashModalOpen(false)} style={iconBtnStyle}>
            <X size={18} />
          </button>
        </div>

        {deletedNotes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              padding: "40px",
            }}
          >
            Trash is empty.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {deletedNotes.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{n.name}</div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Deleted {new Date(n.updated_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleRestore(n.id)}
                    style={{ ...iconBtnStyle, color: "var(--accent)" }}
                    title="Restore"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleHardDelete(n.id)}
                    style={{ ...iconBtnStyle, color: "var(--error, #ff5252)" }}
                    title="Permanently Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
