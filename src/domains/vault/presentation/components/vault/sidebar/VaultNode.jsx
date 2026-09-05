import { useShallow } from "zustand/react/shallow";
import {
  openNoteFromVault,
  reloadVaultHierarchy,
} from "../../../../../../core/store/actions.js";
import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import {
  Circle,
  CircleDashed,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  FilePlus,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { useStore } from "../../../../../../core/store/index";
import { vaultService } from "../../../../application/VaultService";
export default function VaultNode({ item, level }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const { activeVaultItem, setActiveVaultItem, openCreateVaultItemModal } =
    useStore(
      useShallow((s) => ({
        activeVaultItem: s.activeVaultItem,
        setActiveVaultItem: s.setActiveVaultItem,
        openCreateVaultItemModal: s.openCreateVaultItemModal,
      })),
    );
  const isActive = activeVaultItem?.id === item.id;
  const isNote = item.type === "note";

  const submitRename = async () => {
    if (editName.trim() && editName.trim() !== item.name) {
      try {
        await vaultService.renameItem(
          item.type,
          item.id,
          item.path,
          editName.trim(),
        );
        reloadVaultHierarchy();
      } catch (e) {
        alert("Rename failed: " + e.message);
      }
    }
    setIsEditing(false);
  };

  const loadChildren = async () => {
    if (isNote) return;
    const res = await vaultService.getFolderContents(item.path);
    setChildren(res);
  };
  useEffect(() => {
    if (expanded && !isNote) loadChildren();
    const unsub = vaultService.subscribe((changedPath) => {
      if (!changedPath || changedPath === item.path) {
        if (expanded && !isNote) loadChildren();
      }
    });
    return unsub;
  }, [expanded, item.path, isNote]);
  let Icon = FileText;
  if (!isNote) {
    Icon = expanded ? Circle : CircleDashed;
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onClick={() => {
          if (isNote) {
            openNoteFromVault(item);
          } else {
            setActiveVaultItem(item);
            setExpanded(!expanded);
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px 6px 12px",
          cursor: "pointer",
          borderRadius: "6px",
          backgroundColor: isActive ? "var(--bg-active)" : "transparent",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          fontSize: "13px",
        }}
      >
        {!isNote && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "-12px",
              marginRight: "2px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
        <Icon
          size={14}
          style={{
            color: isActive ? "var(--accent)" : "currentColor",
            opacity: isNote ? 0.7 : 1,
          }}
        />
        <span
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </span>

        {!isNote && hovered && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
              openCreateVaultItemModal("auto", item.path);
            }}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Plus size={14} />
          </div>
        )}
        {hovered && (
          <div
            onClick={async (e) => {
              e.stopPropagation();
              {
                try {
                  await vaultService.deleteItem(
                    item.type,
                    item.id,
                    item.path,
                    true,
                  ); // Hard delete to actually remove files
                  toast.success(`Deleted "${item.name}"`);
                  reloadVaultHierarchy();
                } catch (err) {
                  toast.error("Delete failed: " + err.message);
                  console.error("Delete failed", err);
                }
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "4px",
              color: "#ff5252",
            }}
          >
            <Trash2 size={13} />
          </div>
        )}
      </div>

      {expanded && !isNote && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: "16px",
            borderLeft: "1px solid var(--glass-border)",
            marginLeft: "12px",
            marginTop: "2px",
            gap: "2px",
          }}
        >
          {children.map((child) => (
            <VaultNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
