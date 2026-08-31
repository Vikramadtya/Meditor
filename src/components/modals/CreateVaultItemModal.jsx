import React, { useState, useEffect } from "react";
import { Book, X, Upload, User, Link as LinkIcon } from "lucide-react";
import { useStore } from "../../store/index";

import { vaultService } from "../../application/vault/VaultService";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";

/**
 * Modal component for creating or editing vault items (groups, collections, modules, notes).
 * Handles user input for item details such as name, order index, and metadata.
 *
 * @returns {React.ReactElement|null} The create/edit vault item modal or null if not open.
 */
export default function CreateVaultItemModal() {
  const { createVaultItemModal, closeCreateVaultItemModal } = useStore();
  const { reloadVaultHierarchy } = useStore();

  const [name, setName] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [instructor, setInstructor] = useState("");
  const [url, setUrl] = useState("");
  const [localPdf, setLocalPdf] = useState("");
  const [isBooks, setIsBooks] = useState(false);

  const { isOpen, type, parentId, editItem } = createVaultItemModal;

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name || "");
        setInstructor(editItem.metadata?.instructor || "");
        setUrl(editItem.metadata?.url || "");
        setLocalPdf(editItem.metadata?.localPdf || "");
      } else {
        setName("");
        setOrderIndex("");
        setInstructor("");
        setUrl("");
        setLocalPdf("");
      }

      setIsBooks(false);
      let groupId = parentId;
      if (editItem && type === "collection")
        groupId = editItem.group_id || parentId;
      if (type === "collection" && groupId) {
        const groupName = vaultRepository.getGroupName(groupId);
        if (groupName) {
          setIsBooks(groupName.toLowerCase().includes("book"));
        }
      }
    }
  }, [isOpen, type, parentId, editItem]);

  if (!isOpen) return null;

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const typeLabel =
    type === "collection" && isBooks ? "Book" : capitalize(type);
  const instructorLabel = isBooks ? "Author" : "Instructor";
  const urlLabel = isBooks ? "Read URL" : "Course URL";
  const namePlaceholder = isBooks
    ? "e.g. The Pragmatic Programmer"
    : "e.g., Advanced React Patterns";
  const instructorPlaceholder = isBooks
    ? "e.g. David Thomas, Andrew Hunt"
    : "e.g., Kent C. Dodds";

  const themeColor = isBooks ? "#3b82f6" : "var(--accent)";

  const handleSelectPdf = async () => {
    try {
      if (window.Neutralino) {
        const entries = await window.Neutralino.os.showOpenDialog(
          "Select PDF",
          {
            filters: [{ name: "PDF files", extensions: ["pdf"] }],
          },
        );
        if (entries && entries.length > 0) {
          setLocalPdf(entries[0]);
        }
      }
    } catch (e) {
      // User cancelled
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    const metadata = {
      instructor,
      url,
      localPdf,
    };

    if (editItem) {
      await vaultService.updateItem(
        type,
        editItem.id,
        name,
        orderIndex,
        metadata,
      );
    } else {
      if (type === "group")
        await vaultService.createGroup(name, metadata, orderIndex);
      else if (type === "collection")
        await vaultService.createCollection(
          parentId,
          name,
          metadata,
          orderIndex,
        );
      else if (type === "module")
        await vaultService.createModule(parentId, name, orderIndex, metadata);
      else if (type === "note")
        await vaultService.createNote(parentId, name, orderIndex);
    }

    reloadVaultHierarchy();
    closeCreateVaultItemModal();
  };

  return (
    <div className="modal-overlay open" onClick={closeCreateVaultItemModal}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "450px",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid var(--glass-border)",
          backgroundColor: "var(--bg-primary)",
        }}
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
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Book color={themeColor} size={20} />
            {editItem ? "Edit" : "Add New"} {typeLabel}
          </h2>
          <button
            onClick={closeCreateVaultItemModal}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: type === "collection" ? "16px" : "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {typeLabel} Title <span style={{ color: "var(--error)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <Book
              size={16}
              color="var(--text-secondary)"
              style={{
                position: "absolute",
                left: "12px",
                top: "12px",
                opacity: 0.7,
              }}
            />
            <input
              autoFocus
              className="settings-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              placeholder={namePlaceholder}
              style={{
                width: "100%",
                padding: "10px 10px 10px 36px",
                borderRadius: "8px",
                border: "1px solid var(--glass-border)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Serial Number (Order Index){" "}
            <span style={{ opacity: 0.5, fontSize: "0.8rem", fontWeight: 400 }}>
              (Optional)
            </span>
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "10px",
                opacity: 0.7,
                color: "var(--text-secondary)",
              }}
            >
              #
            </span>
            <input
              type="number"
              className="settings-input"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              placeholder="e.g. 1"
              style={{
                width: "100%",
                padding: "10px 10px 10px 36px",
                borderRadius: "8px",
                border: "1px solid var(--glass-border)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {type === "collection" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {instructorLabel}{" "}
                <span
                  style={{ opacity: 0.5, fontSize: "0.8rem", fontWeight: 400 }}
                >
                  (Optional)
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  color="var(--text-secondary)"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    opacity: 0.7,
                  }}
                />
                <input
                  className="settings-input"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder={instructorPlaceholder}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 36px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {urlLabel}{" "}
                  <span
                    style={{
                      opacity: 0.5,
                      fontSize: "0.8rem",
                      fontWeight: 400,
                    }}
                  >
                    (Optional)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <LinkIcon
                    size={14}
                    color="var(--text-secondary)"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "13px",
                      opacity: 0.7,
                    }}
                  />
                  <input
                    className="settings-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: "100%",
                      padding: "10px 10px 10px 36px",
                      borderRadius: "8px",
                      border: "1px solid var(--glass-border)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  Local PDF{" "}
                  <span
                    style={{
                      opacity: 0.5,
                      fontSize: "0.8rem",
                      fontWeight: 400,
                    }}
                  >
                    (Optional)
                  </span>
                </label>
                <button
                  onClick={handleSelectPdf}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px dashed var(--text-secondary)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Upload size={14} />
                  {localPdf ? localPdf.split(/[/\\]/).pop() : "Select PDF"}
                </button>
              </div>
            </div>
          </>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "12px",
            paddingTop: "16px",
          }}
        >
          <button
            onClick={closeCreateVaultItemModal}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: themeColor,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Book size={14} />{" "}
            {editItem ? "Save Changes" : `Create ${typeLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
