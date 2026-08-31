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
import { useStore } from "../../store/index";
import { noteService } from "../../application/vault/NoteService";

/**
 * VaultSidebar Component
 *
 * Renders the main sidebar for the vault navigation, including global search,
 * quick links (Today, Agenda, Tags, etc.), group and collection hierarchy,
 * and bottom fixed actions.
 *
 * @returns {JSX.Element} The rendered VaultSidebar component.
 */

function containsItem(node, targetItem) {
  if (!node.children) return false;
  return node.children.some(
    (child) =>
      (child.id === targetItem.id && child.type === targetItem.type) ||
      containsItem(child, targetItem),
  );
}

export default function VaultSidebar() {
  const {
    setCommandPaletteOpen,
    setGraphModalOpen,
    setStatsModalOpen,
    setSettingsOpen,
    setGitModalOpen,
    openCreateVaultItemModal,
  } = useStore();
  const {
    vaultHierarchy,
    setActiveVaultItem,
    activeVaultItem,
    openNoteFromVault,
  } = useStore();

  const handleExport = async () => {
    try {
      if (window.Neutralino) {
        await window.Neutralino.os.showMessageBox(
          "Export",
          "Export functionality would zip the vault folder here.",
        );
      }
    } catch (e) {}
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Scrollable Top Section */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        {/* Search */}
        <div
          onClick={() => setCommandPaletteOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "16px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
            cursor: "text",
            marginBottom: "16px",
            fontSize: "13px",
          }}
        >
          <Search size={14} />
          <span>Search projects...</span>
        </div>

        {/* Top Links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            marginBottom: "24px",
          }}
        >
          <SidebarLink
            icon={<Calendar size={14} />}
            label="Today"
            isActive={!activeVaultItem}
            onClick={() =>
              setActiveVaultItem({ type: "today", id: "today", name: "Today" })
            }
          />
          <SidebarLink
            icon={<CalendarDays size={14} />}
            label="Agenda"
            isActive={activeVaultItem?.type === "agenda"}
            onClick={() =>
              setActiveVaultItem({
                type: "agenda",
                id: "agenda",
                name: "Agenda",
              })
            }
          />
          <SidebarLink
            icon={<Tag size={14} />}
            label="Tags"
            isActive={activeVaultItem?.type === "tags"}
            onClick={() =>
              setActiveVaultItem({ type: "tags", id: "tags", name: "Tags" })
            }
          />
          <SidebarLink
            icon={<BrainCircuit size={14} />}
            label="Flashcard Review"
            isActive={activeVaultItem?.type === "flashcards"}
            onClick={() =>
              setActiveVaultItem({
                type: "flashcards",
                id: "flashcards",
                name: "Flashcard Review",
              })
            }
          />
          <SidebarLink
            icon={<Network size={14} />}
            label="Knowledge Graph"
            isActive={activeVaultItem?.type === "graph"}
            onClick={() =>
              setActiveVaultItem({
                type: "graph",
                id: "graph",
                name: "Knowledge Graph",
              })
            }
          />
          <SidebarLink
            icon={<BarChart2 size={14} />}
            label="Analytics"
            isActive={activeVaultItem?.type === "analytics"}
            onClick={() =>
              setActiveVaultItem({
                type: "analytics",
                id: "analytics",
                name: "Analytics",
              })
            }
          />
          <SidebarLink
            icon={<Star size={14} />}
            label="Favorites"
            isActive={activeVaultItem?.type === "favorites"}
            onClick={() =>
              setActiveVaultItem({
                type: "favorites",
                id: "favorites",
                name: "Favorites",
              })
            }
          />
        </div>

        {/* Groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Groups
            </span>
            <button
              onClick={() => openCreateVaultItemModal("group", null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "2px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
              title="Add Group"
            >
              <Plus size={14} />
            </button>
          </div>
          {vaultHierarchy.map((g) => (
            <VaultGroupNode key={g.id} group={g} />
          ))}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid var(--glass-border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <SidebarLink
          icon={<RefreshCw size={14} />}
          label="Sync Vault"
          onClick={() => setGitModalOpen(true)}
        />
        <SidebarLink
          icon={<Archive size={14} />}
          label="Export as ZIP"
          onClick={handleExport}
        />
        <SidebarLink
          icon={<Settings size={14} />}
          label="Settings"
          onClick={() => setSettingsOpen(true)}
        />
      </div>
    </div>
  );
}

/**
 * SidebarLink Component
 *
 * Renders a single navigation link in the vault sidebar.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.icon - The Lucide icon to display.
 * @param {string} props.label - The text label for the link.
 * @param {boolean} [props.isActive] - Whether the link is currently active.
 * @param {function} props.onClick - The click handler for the link.
 * @returns {JSX.Element} The rendered SidebarLink component.
 */
function SidebarLink({ icon, label, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
        transition: "all 0.1s ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive)
          e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {icon}
      {label}
    </div>
  );
}

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
function VaultGroupNode({ group }) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const { setActiveVaultItem, activeVaultItem, openCreateVaultItemModal } =
    useStore();
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
function VaultNode({ item, level }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { setActiveVaultItem, activeVaultItem, openCreateVaultItemModal } =
    useStore();
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
