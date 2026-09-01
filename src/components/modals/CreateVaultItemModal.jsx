import { useShallow } from "zustand/react/shallow";
import { reloadVaultHierarchy } from "../../store/actions/index.js";
import React, { useState, useEffect } from "react";
import { FolderPlus, FileText, X } from "lucide-react";
import { useStore } from "../../store/index";
import { vaultService } from "../../application/vault/VaultService";
export default function CreateVaultItemModal() {
  const {
    createVaultItemModal,
    closeCreateVaultItemModal,
    setActiveVaultItem,
  } = useStore(
    useShallow((s) => ({
      createVaultItemModal: s.createVaultItemModal,
      closeCreateVaultItemModal: s.closeCreateVaultItemModal,
      setActiveVaultItem: s.setActiveVaultItem,
    })),
  );
  const [name, setName] = useState("");
  const { isOpen, type, parentId } = createVaultItemModal;
  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (type === "note") {
        const n = await vaultService.createNote(parentId, name.trim());
        useStore.getState().openNoteFromVault(n);
      } else {
        const c = await vaultService.createContainer(parentId, name.trim());
        setActiveVaultItem(c);
      }
      closeCreateVaultItemModal();
      reloadVaultHierarchy();
    } catch (err) {
      log.error("Failed to create vault item", err);
      alert("Failed to create item.");
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={closeCreateVaultItemModal}
    >
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          width: "400px",
          borderRadius: "12px",
          border: "1px solid var(--glass-border)",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {type === "note" ? (
              <FileText size={18} />
            ) : (
              <FolderPlus size={18} />
            )}
            {type === "note" ? "Create Note" : "Create Folder"}
          </h2>
          <div
            onClick={closeCreateVaultItemModal}
            style={{
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={18} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "note"
                  ? "e.g., REST API Design"
                  : "e.g., Backend Architecture"
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--glass-border)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={closeCreateVaultItemModal}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: "var(--accent)",
                border: "none",
                color: "white",
                cursor: "pointer",
                opacity: name.trim() ? 1 : 0.5,
              }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
