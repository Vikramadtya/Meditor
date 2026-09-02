import React from "react";
import { useStore } from "../core/store/index";
import { selectShowDashboard } from "../store/selectors/index";

import Sidebar from "../domains/workspace/presentation/components/Sidebar";
import VaultApp from "../apps/VaultApp";
import { lazy, Suspense } from "react";
const EditorApp = lazy(() => import("../apps/EditorApp"));

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
        <Suspense
          fallback={<div style={{ padding: 40 }}>Loading Editor...</div>}
        >
          <EditorApp />
        </Suspense>
      )}
    </>
  );
}
