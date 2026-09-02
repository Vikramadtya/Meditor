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
  const [selectedType, setSelectedType] = useState("note");
  const [allowedTypes, setAllowedTypes] = useState(["note", "container"]);
  const { isOpen, type, parentId } = createVaultItemModal;
  useEffect(() => {
    if (isOpen) {
      setName("");
      // If parentId has no slash, it's a root group. Root groups can ONLY hold collections.
      const isGroup = parentId && !parentId.includes("/");

      if (isGroup) {
        setSelectedType("container");
        setAllowedTypes(["container"]);
      } else {
        setSelectedType(
          type === "auto" || !type
            ? "note"
            : type === "container"
              ? "note"
              : type,
        );
        // We default to note if they didn't explicitly restrict, but wait, type === "container" shouldn't lock it if it was passed accidentally.
        // Actually, let's always default to Note if allowed both, but if type is explicitly set to something else, we use it.
        // In VaultNode.jsx, we will pass "auto".
        setSelectedType(type === "auto" || !type ? "note" : type);
        setAllowedTypes(["note", "container"]);
      }

      // Enforce the rule: only one type of children per container
      if (parentId && !isGroup) {
        vaultService.getFolderContents(parentId).then((children) => {
          const hasNotes = children.some((c) => c.type === "note");
          const hasContainers = children.some((c) => c.type === "container");
          if (hasNotes && !hasContainers) {
            setAllowedTypes(["note"]);
            setSelectedType("note");
          } else if (hasContainers && !hasNotes) {
            setAllowedTypes(["container"]);
            setSelectedType("container");
          }
        });
      }
    }
  }, [isOpen, type, parentId]);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (selectedType === "note") {
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
            {selectedType === "note" ? (
              <FileText size={18} />
            ) : (
              <FolderPlus size={18} />
            )}
            {selectedType === "note" ? "Create Note" : "Create Folder"}
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
          {allowedTypes.length > 1 && (
            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "8px",
                padding: "4px",
              }}
            >
              <div
                onClick={() => setSelectedType("container")}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor:
                    selectedType === "container"
                      ? "var(--bg-primary)"
                      : "transparent",
                  color:
                    selectedType === "container"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  boxShadow:
                    selectedType === "container"
                      ? "0 2px 4px rgba(0,0,0,0.05)"
                      : "none",
                }}
              >
                Folder/Collection
              </div>
              <div
                onClick={() => setSelectedType("note")}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor:
                    selectedType === "note"
                      ? "var(--bg-primary)"
                      : "transparent",
                  color:
                    selectedType === "note"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  boxShadow:
                    selectedType === "note"
                      ? "0 2px 4px rgba(0,0,0,0.05)"
                      : "none",
                }}
              >
                Note
              </div>
            </div>
          )}
          <div style={{ marginBottom: "20px" }}>
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
                selectedType === "note"
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
