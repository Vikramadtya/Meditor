import React, { useState, useEffect } from "react";
import {
  Search,
  Circle,
  CircleDashed,
  Calendar,
  Network,
  BarChart2,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  RefreshCw,
  Archive,
  Settings,
  Star,
  CalendarDays,
  BrainCircuit,
  Tag,
} from "lucide-react";
import { useStore } from "../../../store/index";
import { noteService } from "../../../application/vault/NoteService";
import { vaultService } from "../../../application/vault/VaultService";
import VaultNode from "./VaultNode";

/**
 * VaultGroupNode Component
 *
 * Renders a group node in the vault hierarchy, allowing expansion and
 * collection creation.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.group - The group data object from the vault hierarchy.
 * @returns {JSX.Element} The rendered VaultGroupNode component.
 */
export default function VaultGroupNode({ group }) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const {
    setActiveVaultItem,
    activeVaultItem,
    openCreateVaultItemModal,
    reloadVaultHierarchy,
  } = useStore();
  const isActive =
    activeVaultItem &&
    activeVaultItem.id === group.id &&
    activeVaultItem.type === "group";

  useEffect(() => {
    if (activeVaultItem && containsItem(group, activeVaultItem)) {
      setExpanded(true);
    }
  }, [activeVaultItem, group]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
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
          style={{
            display: "flex",
            alignItems: "center",
            padding: "2px",
            borderRadius: "4px",
          }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>
        <span style={{ flex: 1 }}>{group.name}</span>

        <div
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
            openCreateVaultItemModal("collection", group.id);
          }}
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.1s",
            display: "flex",
            alignItems: "center",
          }}
          title="Add Collection"
        >
          <Plus size={14} />
        </div>
        <div
          onClick={async (e) => {
            e.stopPropagation();
            if (
              window.confirm(
                `Are you sure you want to delete the group "${group.name}" and all its contents?`,
              )
            ) {
              await vaultService.deleteItem("group", group.id, true);
              if (activeVaultItem?.id === group.id) setActiveVaultItem(null);
              reloadVaultHierarchy();
            }
          }}
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.1s",
            display: "flex",
            alignItems: "center",
            marginLeft: "4px",
            color: "var(--error, #ff5252)",
          }}
          title="Delete Group"
        >
          <Trash2 size={13} />
        </div>
      </div>

      {expanded && group.children && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: "8px",
            marginTop: "4px",
            gap: "2px",
          }}
        >
          {group.children.map((child) => (
            <VaultNode key={child.id} item={child} level={1} />
          ))}
        </div>
      )}
    </div>
  );
}
