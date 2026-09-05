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
  const { activeVaultItem, setActiveVaultItem, openCreateVaultItemModal, openConfirmDeleteModal, openContextMenu } =
    useStore(
      useShallow((s) => ({
        activeVaultItem: s.activeVaultItem,
        setActiveVaultItem: s.setActiveVaultItem,
        openCreateVaultItemModal: s.openCreateVaultItemModal,
        openConfirmDeleteModal: s.openConfirmDeleteModal,
        openContextMenu: s.openContextMenu,
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
      
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData("application/meditor-item", JSON.stringify(item));
        }}
        onDragOver={(e) => {
          if (!!isNote) return; // only containers can be dropped into
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.backgroundColor = "var(--bg-active)";
        }}
        onDragLeave={(e) => {
          if (!!isNote) return;
          e.currentTarget.style.backgroundColor = isActive ? "var(--bg-active)" : "transparent";
        }}
        onDrop={async (e) => {
          if (!!isNote) return;
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.backgroundColor = isActive ? "var(--bg-active)" : "transparent";
          try {
            const data = JSON.parse(e.dataTransfer.getData("application/meditor-item"));
            if (data && data.path !== item.path && !data.path.startsWith(item.path + "/")) {
              await vaultService.moveItem(data.type, data.id, data.path, item.path);
              toast.success(`Moved "${data.name}"`);
              reloadVaultHierarchy();
            }
          } catch (err) {
            toast.error("Move failed");
          }
        }}
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
        onMouseLeave={() => setHovered(false)} onContextMenu={(e) => {
          e.preventDefault();
          openContextMenu(item, e.clientX, e.clientY);
        }}
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
