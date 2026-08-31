import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../store/index";
import { useSettingsStore } from "../../store/settingsStore";
import "../../styles/Sidebar.css";

/**
 * A resizable container component for the application sidebar.
 * Handles dragging to adjust width and toggles visibility based on store state.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The content to render inside the sidebar.
 * @returns {React.ReactElement} The sidebar container.
 */
export default function SidebarContainer({ children }) {
  const { isSidebarOpen } = useStore();
  const { uiConfig, setUiConfig } = useSettingsStore();
  const sidebarWidth = uiConfig?.sidebarWidth ?? 250;

  const setSidebarWidth = (width) => setUiConfig({ sidebarWidth: width });

  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setSidebarWidth(Math.max(150, Math.min(e.clientX, 600)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!isSidebarOpen) {
    return <div className="sidebar closed">{children}</div>;
  }

  return (
    <div
      className="sidebar"
      style={{
        width: `${sidebarWidth}px`,
        flexShrink: 0,
        position: "relative",
      }}
    >
      {children}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "4px",
          height: "100%",
          cursor: "col-resize",
          zIndex: 10,
        }}
      />
    </div>
  );
}
