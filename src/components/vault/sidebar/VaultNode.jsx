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

/**
 * VaultNode Component
 *
 * Recursive component that renders items (collections, modules)
 * within a group in the sidebar.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.item - The vault item to render.
 * @param {number} props.level - The nesting level for indentation.
 * @returns {JSX.Element|null} The rendered VaultNode component or null for notes.
 */
export default function VaultNode({ item, level }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const {
    setActiveVaultItem,
    activeVaultItem,
    openCreateVaultItemModal,
    reloadVaultHierarchy,
  } = useStore();
  const isActive =
    (activeVaultItem &&
      activeVaultItem.id === item.id &&
      activeVaultItem.type === item.type) ||
    (activeVaultItem?.type === "note" &&
      item.type === "module" &&
      containsItem(item, activeVaultItem));

  useEffect(() => {
    if (activeVaultItem && containsItem(item, activeVaultItem)) {
      setExpanded(true);
    }
  }, [activeVaultItem, item]);

  // Do not render notes in the sidebar
  if (item.type === "note") return null;

  const nextType =
    item.type === "collection"
      ? "module"
      : item.type === "module"
        ? "note"
        : null;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        onClick={() => {
          setActiveVaultItem(item);
          setExpanded(!expanded);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px 6px " + (level * 16 + 8) + "px",
          borderRadius: "6px",
          cursor: "pointer",
          backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          fontSize: "13px",
          fontWeight: 500,
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          if (!isActive)
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "12px",
            justifyContent: "center",
          }}
        >
          {item.children && item.children.some((c) => c.type !== "note") ? (
            expanded ? (
              <ChevronDown size={12} style={{ opacity: 0.7 }} />
            ) : (
              <ChevronRight size={12} style={{ opacity: 0.7 }} />
            )
          ) : (
            <div style={{ width: "12px" }} /> // Spacing for items without children
          )}
        </div>

        {item.type === "collection" ? (
          <Circle
            size={8}
            fill={isActive ? "var(--text-primary)" : "var(--text-secondary)"}
            color="transparent"
            style={{ opacity: 0.3 }}
          />
        ) : item.type === "module" ? (
          <CircleDashed size={12} style={{ opacity: 0.3 }} />
        ) : null}

        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {item.name}
        </span>
        {item.type === "collection" && (
          <div
            onClick={async (e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  `Are you sure you want to delete the collection "${item.name}" and all its contents?`,
                )
              ) {
                await vaultService.deleteItem("collection", item.id, true);
                if (activeVaultItem?.id === item.id) setActiveVaultItem(null);
                reloadVaultHierarchy();
              }
            }}
            style={{
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.1s",
              display: "flex",
              alignItems: "center",
              padding: "2px",
              marginLeft: "4px",
              color: "var(--error, #ff5252)",
            }}
            title="Delete Collection"
          >
            <Trash2 size={12} />
          </div>
        )}

        {nextType && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
              openCreateVaultItemModal(nextType, item.id);
            }}
            style={{
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.1s",
              display: "flex",
              alignItems: "center",
            }}
            title={`Add ${nextType}`}
          >
            <Plus size={14} />
          </div>
        )}
      </div>

      {expanded && item.children && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {item.children.map((child) => (
            <VaultNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
