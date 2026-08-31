import React, { useState } from "react";
import { useStore } from "../../store/index";
import {
  Book,
  GraduationCap,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Library,
  Trash2,
  Edit2,
} from "lucide-react";
import { startOfDay } from "date-fns";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { vaultService } from "../../application/vault/VaultService";

export default function GroupDashboard() {
  const { activeVaultItem, openCreateVaultItemModal } = useStore();
  // Calculate items
  const children = activeVaultItem.children || [];
  const getNextType = (current) => {
    if (current === "group") return "collection";
    if (current === "collection") return "module";
    if (current === "module") return "note";
    return null;
  };
  const nextType = getNextType(activeVaultItem.type);

  // Recursively count notes in a hierarchy
  const countNotes = (node) => {
    if (node.type === "note") return 1;
    if (!node.children) return 0;
    return node.children.reduce((acc, child) => acc + countNotes(child), 0);
  };

  const isBooks = activeVaultItem.name.toLowerCase().includes("book");

  const themeColor = isBooks ? "#3b82f6" : "var(--accent)";
  const themeGradient = isBooks
    ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    : "linear-gradient(135deg, var(--accent) 0%, rgba(168,85,247,0.4) 100%)";

  const HeaderIcon = isBooks ? Library : Book;
  const CardBannerIcon = isBooks ? Book : GraduationCap;

  const getSubtext = () => {
    if (activeVaultItem.type === "group") {
      const c = children.length;
      return `Your collection of ${c} ${isBooks ? "books and reading materials" : "items"}.`;
    }
    return "";
  };

  return (
    <div
      style={{
        padding: "40px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "0 0 10px 0",
              fontSize: "2rem",
            }}
          >
            <HeaderIcon color={themeColor} size={32} />
            {activeVaultItem.name}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
            }}
          >
            {getSubtext()}
          </p>
        </div>

        {nextType && (
          <button
            onClick={() =>
              openCreateVaultItemModal(nextType, activeVaultItem.id)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "24px",
              border: "none",
              backgroundColor: themeColor,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: isBooks
                ? "0 4px 12px rgba(59, 130, 246, 0.4)"
                : "0 4px 12px rgba(168, 85, 247, 0.4)",
            }}
          >
            <Book size={18} /> Add New{" "}
            {isBooks
              ? "Book"
              : nextType.charAt(0).toUpperCase() + nextType.slice(1)}
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        {children.map((child) => (
          <VaultCard
            key={child.id}
            child={child}
            countNotes={countNotes}
            nextType={nextType}
            themeColor={themeColor}
            themeGradient={themeGradient}
            CardBannerIcon={CardBannerIcon}
          />
        ))}

        {/* Empty State Card */}
        {children.length === 0 && (
          <div
            onClick={() =>
              openCreateVaultItemModal(nextType, activeVaultItem.id)
            }
            style={{
              borderRadius: "16px",
              border: "2px dashed var(--glass-border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              minHeight: "250px",
            }}
          >
            <Plus size={32} style={{ marginBottom: "12px" }} />
            <div style={{ fontWeight: 600 }}>
              Create First {isBooks ? "Book" : nextType}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VaultCard Component
 *
 * Renders an individual card for a vault item (collection, module, or note)
 * within the dashboard view.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.child - The vault item to display.
 * @param {function} props.countNotes - Function to calculate total notes inside the item.
 * @param {string} props.themeColor - Hex color for the theme.
 * @param {string} props.themeGradient - CSS gradient string for the card banner.
 * @param {React.ElementType} props.CardBannerIcon - Icon component to display in the banner.
 * @returns {JSX.Element} The rendered VaultCard component.
 */
function VaultCard({
  child,
  countNotes,
  themeColor,
  themeGradient,
  CardBannerIcon,
}) {
  const [hover, setHover] = useState(false);
  const notesCount = countNotes(child);
  const meta = child.metadata || {};

  const handleDelete = (e) => {
    e.stopPropagation();
    // Implementation for delete would go here, maybe a confirm dialog then vaultService.deleteItem
  };

  const { openCreateVaultItemModal, activeVaultItem } = useStore();

  const handleEdit = (e) => {
    e.stopPropagation();
    openCreateVaultItemModal(child.type, activeVaultItem?.id, child);
  };

  return (
    <div
      onClick={() => {
        if (child.type === "note") {
          useStore.getState().openNoteFromVault(child);
        } else {
          useStore.getState().setActiveVaultItem(child);
        }
      }}
      style={{
        borderRadius: "16px",
        border: hover
          ? `1px solid ${themeColor}`
          : "1px solid var(--glass-border)",
        backgroundColor: "var(--bg-primary)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        boxShadow: hover
          ? "0 12px 24px rgba(0,0,0,0.08)"
          : "0 4px 6px rgba(0,0,0,0.02)",
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Gradient Banner */}
      <div
        style={{
          height: "100px",
          background: themeGradient,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <CardBannerIcon
          size={80}
          style={{
            position: "absolute",
            bottom: "-10px",
            right: "10px",
            opacity: 0.15,
            transform: "rotate(15deg)",
          }}
          color="#fff"
        />

        {meta.url && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              window.open(meta.url, "_blank");
            }}
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              padding: "4px 10px",
              borderRadius: "12px",
              backgroundColor: "rgba(0,0,0,0.2)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backdropFilter: "blur(4px)",
            }}
          >
            <ExternalLink size={12} /> URL
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: "20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "1.05rem",
            color: hover ? themeColor : "var(--text-primary)",
            fontWeight: 700,
            transition: "color 0.2s",
          }}
        >
          {child.name}
        </h3>

        {meta.instructor && (
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {meta.instructor}
          </p>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-secondary)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {notesCount} notes
          </div>

          {hover && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleEdit}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: "4px",
                }}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: "4px",
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
