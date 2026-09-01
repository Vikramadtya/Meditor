import React from "react";
import { useStore } from "../store/index";
import { selectShowDashboard } from "../store/selectors/index";

import Sidebar from "../components/layout/Sidebar";
import VaultApp from "../apps/VaultApp";
import EditorApp from "../apps/EditorApp";

/**
 * Handles routing between different workspace modalities (Vault vs Folder vs Editor)
 * once a folder has been loaded.
 */
export default function WorkspaceRouter() {
  const { workspaceMode } = useStore();
  const showDashboard = useStore(selectShowDashboard);

  return (
    <>
      <Sidebar />
      {workspaceMode === "vault" && showDashboard ? (
        <VaultApp />
      ) : (
        <EditorApp />
      )}
    </>
  );
}
