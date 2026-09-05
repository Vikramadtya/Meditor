import { useShallow } from "zustand/react/shallow";
import { reloadVaultHierarchy } from "../../../../../../core/store/actions";
import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FilePlus,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { useStore } from "../../../../../../core/store/index";
import { vaultService } from "../../../../application/VaultService";
import VaultNode from "./VaultNode";
export default function VaultGroupNode({ group }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const { setActiveVaultItem, activeVaultItem, openCreateVaultItemModal } =
    useStore(
      useShallow((s) => ({
        setActiveVaultItem: s.setActiveVaultItem,
        activeVaultItem: s.activeVaultItem,
        openCreateVaultItemModal: s.openCreateVaultItemModal,
        openConfirmDeleteModal: s.openConfirmDeleteModal,
      })),
    );
  const isActive = activeVaultItem && activeVaultItem.id === group.id;
  const loadChildren = async () => {
    const res = await vaultService.getFolderContents(group.path);
    setChildren(res);
  };
  useEffect(() => {
    if (expanded) loadChildren();
    const unsub = vaultService.subscribe((changedPath) => {
      if (!changedPath || changedPath === group.path) {
        if (expanded) loadChildren();
      }
    });
    return unsub;
  }, [expanded, group.path]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onClick={() => {
          setActiveVaultItem(group);
          setExpanded(true);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px",
          cursor: "pointer",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          fontWeight: 700,
          fontSize: "11px",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
          setHovered(true);
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
          setHovered(false);
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>
        <span
          style={{
            flex: 1,
          }}
        >
          {group.name}
        </span>

        <div
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
            openCreateVaultItemModal("auto", group.path);
          }}
          style={{
            opacity: hovered ? 1 : 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Plus size={14} />
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openConfirmDeleteModal(group);
          }}
          style={{
            opacity: hovered ? 1 : 0,
            display: "flex",
            alignItems: "center",
            marginLeft: "4px",
            color: "#ff5252",
          }}
        >
          <Trash2 size={13} />
        </div>
      </div>

      {expanded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: "8px",
            marginTop: "4px",
            gap: "2px",
          }}
        >
          {children.map((child) => (
            <VaultNode key={child.id} item={child} level={1} />
          ))}
        </div>
      )}
    </div>
  );
}
