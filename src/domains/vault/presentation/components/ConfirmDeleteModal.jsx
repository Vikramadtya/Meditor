import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../../core/store";
import { X, Trash2, AlertTriangle, FileText, Folder } from "lucide-react";
import { vaultService } from "../../application/VaultService";
import { reloadVaultHierarchy } from "../../../../core/store/actions";
import toast from "react-hot-toast";

export default function ConfirmDeleteModal() {
  const { modal, close } = useStore(
    useShallow((s) => ({
      modal: s.confirmDeleteModal,
      close: s.closeConfirmDeleteModal,
    }))
  );
  
  const [children, setChildren] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (modal?.isOpen && modal.item?.type === "container") {
      vaultService.getFolderContents(modal.item.path).then((res) => {
        setChildren(res);
      });
    } else {
      setChildren([]);
    }
  }, [modal?.isOpen, modal?.item]);

  if (!modal?.isOpen || !modal.item) return null;
  const item = modal.item;
  const isContainer = item.type === "container";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await vaultService.deleteItem(item.type, item.id, item.path, true);
      toast.success(`Deleted "${item.name}"`);
      reloadVaultHierarchy();
      close();
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "var(--bg-primary)", borderRadius: "12px", width: "400px", maxWidth: "90vw", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
            <AlertTriangle size={18} style={{ color: "#ef4444" }} />
            Confirm Deletion
          </h2>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
            Are you sure you want to permanently delete <strong>{item.name}</strong>? This action cannot be undone.
          </p>

          {isContainer && children.length > 0 && (
            <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                This collection contains:
              </div>
              <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {children.slice(0, 10).map((child) => (
                  <div key={child.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-primary)" }}>
                    {child.type === "container" ? <Folder size={14} style={{ opacity: 0.7 }} /> : <FileText size={14} style={{ opacity: 0.7 }} />}
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{child.name}</span>
                  </div>
                ))}
                {children.length > 10 && (
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "4px" }}>
                    + {children.length - 10} more item{children.length - 10 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
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
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ef4444", color: "white", cursor: isDeleting ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px", opacity: isDeleting ? 0.7 : 1 }}
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
