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
import { vaultService } from "../../application/vault/VaultService";
import SidebarLink from "./sidebar/SidebarLink";
import VaultGroupNode from "./sidebar/VaultGroupNode";
import VaultNode from "./sidebar/VaultNode";

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
            <React.Fragment key={g.id}>
              {g.type === "note" ? (
                <VaultNode item={g} level={0} />
              ) : (
                <VaultGroupNode group={g} />
              )}
            </React.Fragment>
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
