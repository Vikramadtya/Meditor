import React, { useState, useEffect } from "react";
import { Search, Circle, CircleDashed, Calendar } from "lucide-react";

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
export default function SidebarLink({ icon, label, isActive, onClick }) {
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
