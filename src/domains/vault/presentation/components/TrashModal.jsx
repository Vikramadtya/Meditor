import { useShallow } from "zustand/react/shallow";
import { reloadVaultHierarchy } from "../../../../core/store/actions";
import React, { useState, useEffect } from "react";
import { X, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "../../../../core/store/index";
import { vaultService } from "../../application/VaultService";
import { iconBtnStyle } from "../../../settings/presentation/SettingsStyles";

/**
 * Modal component for managing deleted notes in the trash bin.
 * Allows users to restore notes or permanently delete them.
 *
 * @returns {React.ReactElement|null} The trash modal or null if not open.
 */
export default function TrashModal() {
  const { isTrashModalOpen, setTrashModalOpen } = useStore(
    useShallow((s) => ({
      isTrashModalOpen: s.isTrashModalOpen,
      setTrashModalOpen: s.setTrashModalOpen,
    })),
  );
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const [isEmptying, setIsEmptying] = useState(false);
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
    toast.success("Note restored");
  };
  const handleHardDelete = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    await vaultService.deleteItem("note", id, null, true);
    setDeletedNotes(vaultService.getDeletedNotes());
    setConfirmId(null);
    toast.success("Permanently deleted");
  };

  const handleEmptyTrash = async () => {
    if (confirmId !== "ALL") {
      setConfirmId("ALL");
      return;
    }
    setIsEmptying(true);
    for (const n of deletedNotes) {
      await vaultService.deleteItem("note", n.id, null, true);
    }
    setDeletedNotes(vaultService.getDeletedNotes());
    setConfirmId(null);
    setIsEmptying(false);
    toast.success("Trash emptied");
  };
  return (
    <div
      className="modal-overlay open"
      onClick={() => setTrashModalOpen(false)}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "600px",
          maxWidth: "90%",
        }}
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
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {deletedNotes.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                disabled={isEmptying}
                style={{
                  padding: "4px 10px",
                  background:
                    confirmId === "ALL" ? "#ef4444" : "var(--bg-secondary)",
                  color: confirmId === "ALL" ? "white" : "var(--text-primary)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {isEmptying
                  ? "Emptying..."
                  : confirmId === "ALL"
                    ? "Click again to confirm"
                    : "Empty Trash"}
              </button>
            )}
            <button
              onClick={() => setTrashModalOpen(false)}
              style={iconBtnStyle}
            >
              <X size={18} />
            </button>
          </div>
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
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
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
                  <div
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {n.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Deleted {new Date(n.updated_at).toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => handleRestore(n.id)}
                    style={{
                      ...iconBtnStyle,
                      color: "var(--accent)",
                    }}
                    title="Restore"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleHardDelete(n.id)}
                    style={{
                      ...iconBtnStyle,
                      color: "white",
                      background:
                        confirmId === n.id ? "#ef4444" : "transparent",
                      padding: confirmId === n.id ? "4px 8px" : "8px",
                      borderRadius: "4px",
                    }}
                    title="Permanently Delete"
                  >
                    {confirmId === n.id ? (
                      <span style={{ fontSize: "12px" }}>Confirm</span>
                    ) : (
                      <Trash2 size={16} color="var(--error, #ff5252)" />
                    )}
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
