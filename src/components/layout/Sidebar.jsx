import { useShallow } from "zustand/react/shallow";
import React from "react";
import { useStore } from "../../core/store/index";
import SidebarContainer from "../shared/SidebarContainer";
import VaultSidebar from "../vault/VaultSidebar";
import FolderSidebar from "./FolderSidebar";

/**
 * Main sidebar layout component that renders either a VaultSidebar or a FolderSidebar
 * depending on the current workspace mode.
 *
 * @returns {React.ReactElement} The rendered Sidebar component.
 */
export default function Sidebar() {
  const { workspaceMode } = useStore(
    useShallow((s) => ({
      workspaceMode: s.workspaceMode,
    })),
  );
  return (
    <SidebarContainer>
      {workspaceMode === "vault" ? <VaultSidebar /> : <FolderSidebar />}
    </SidebarContainer>
  );
}
