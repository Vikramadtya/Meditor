import { useShallow } from "zustand/react/shallow";
import {
  openNoteFromVault,
  reloadVaultHierarchy,
} from "../../../../../../core/store/actions.js";
import toast from "react-hot-toast";
import React, { useState, useEffect, useRef } from "react";
import {
  Circle,
  CircleDashed,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useStore } from "../../../../../../core/store/index";
import { vaultService } from "../../../../application/VaultService";
export default function VaultNode({ item, level }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const {
    activeVaultItem,
    setActiveVaultItem,
    openCreateVaultItemModal,
    openConfirmDeleteModal,
    openContextMenu,
  } = useStore(
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
        toast.success("Renamed!");
      } catch (e) {
        toast.error("Rename failed: " + e.message);
      }
    }
    setIsEditing(false);
  };

  const itemPathRef = useRef(item.path);
  useEffect(() => {
    itemPathRef.current = item.path;
  }, [item.path]);

  const renameItemId = useStore((s) => s.renameItemId);
  useEffect(() => {
    if (renameItemId === item.id) {
      setIsEditing(true);
      setEditName(item.name);
      useStore.setState({ renameItemId: null });
    }
  }, [renameItemId, item.id, item.name]);

  const loadChildren = async () => {
    if (isNote) return;
    const res = await vaultService.getFolderContents(itemPathRef.current);
    setChildren(res);
  };

  useEffect(() => {
    if (expanded && !isNote) loadChildren();
    const unsub = vaultService.subscribe((changedPath) => {
      if (!changedPath || changedPath === itemPathRef.current) {
        if (expanded && !isNote) loadChildren();
      }
    });
    return () => unsub();
  }, [expanded, isNote]);
  let Icon = FileText;
  if (!isNote) {
    Icon = expanded ? Circle : CircleDashed;
  }
  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData(
          "application/meditor-item",
          JSON.stringify(item),
        );
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isNote) {
          e.currentTarget.style.borderTop = "2px solid var(--accent)";
        } else {
          e.currentTarget.style.backgroundColor = "var(--bg-active)";
        }
      }}
      onDragLeave={(e) => {
        if (isNote) {
          e.currentTarget.style.borderTop = "none";
        } else {
          e.currentTarget.style.backgroundColor = isActive
            ? "var(--bg-active)"
            : "transparent";
        }
      }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isNote) {
          e.currentTarget.style.borderTop = "none";
        } else {
          e.currentTarget.style.backgroundColor = isActive
            ? "var(--bg-active)"
            : "transparent";
        }

        try {
          const data = JSON.parse(
            e.dataTransfer.getData("application/meditor-item"),
          );
          if (
            !data ||
            data.path === item.path ||
            data.path.startsWith(item.path + "/")
          )
            return;

          const getParentPath = (p) => {
            const parts = p.split("/");
            parts.pop();
            return parts.join("/");
          };

          if (!isNote) {
            // Drop onto container: Move INTO container
            await vaultService.moveItem(
              data.type,
              data.id,
              data.path,
              item.path,
            );
            toast.success(`Moved "${data.name}"`);
            reloadVaultHierarchy();
            return;
          }

          // Drop onto Note: Reorder BEFORE this note
          const targetParent = getParentPath(item.path);
          const sourceParent = getParentPath(data.path);

          if (sourceParent !== targetParent) {
            // Move to target parent first
            await vaultService.moveItem(
              data.type,
              data.id,
              data.path,
              targetParent,
            );
          }

          // Fetch children and reorder
          const children = await vaultService.getFolderContents(targetParent);
          // Current order of IDs
          let currentOrder = children.map((c) => c.id);

          // Remove source ID from wherever it is
          currentOrder = currentOrder.filter((id) => id !== data.id);

          // Find target index and insert before it
          const targetIndex = currentOrder.indexOf(item.id);
          if (targetIndex !== -1) {
            currentOrder.splice(targetIndex, 0, data.id);
          } else {
            currentOrder.push(data.id);
          }

          await vaultService.updateChildrenOrder(targetParent, currentOrder);
          reloadVaultHierarchy();
        } catch (err) {
          toast.error("Action failed");
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
        onMouseLeave={() => setHovered(false)}
        onContextMenu={(e) => {
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
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              background: "var(--bg-secondary)",
              border: "1px solid var(--accent)",
              color: "var(--text-primary)",
              borderRadius: "4px",
              padding: "2px 4px",
              fontSize: "13px",
              outline: "none",
            }}
          />
        ) : (
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
        )}

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
