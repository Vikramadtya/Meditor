import React, { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../../../../core/store";
import { Trash2, MoveRight } from "lucide-react";

export default function VaultContextMenu() {
  const { menu, close, openMove, openDelete } = useStore(
    useShallow((s) => ({
      menu: s.contextMenu,
      close: s.closeContextMenu,
      openMove: s.openMoveItemModal,
      openDelete: s.openConfirmDeleteModal,
    }))
  );

  useEffect(() => {
    const handleClickOutside = () => close();
    if (menu?.isOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menu?.isOpen, close]);

  if (!menu?.isOpen || !menu.item) return null;

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: menu.y, 
        left: menu.x, 
        zIndex: 9999,
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        minWidth: "160px",
        padding: "4px",
        display: "flex",
        flexDirection: "column"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        onClick={() => { openMove(menu.item); close(); }}
        style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text-primary)", borderRadius: "4px" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-active)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <MoveRight size={14} />
        Move...
      </div>
      <div 
        onClick={() => { openDelete(menu.item); close(); }}
        style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#ef4444", borderRadius: "4px" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <Trash2 size={14} />
        Delete...
      </div>
    </div>
  );
}
