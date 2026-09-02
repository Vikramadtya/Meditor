/**
 * @fileoverview Unified Zustand store using immer middleware for structural sharing.
 *
 * Architecture:
 *   - State is split into named slices (editor, vault/workspace, ui)
 *   - Slices contain ONLY synchronous state mutations
 *   - Async actions are top-level thunks here that call Application Services
 *   - Backward-compat named hooks re-export this store for existing code
 *
 * Design patterns:
 *   - Slice pattern (composable state)
 *   - Command pattern (each action is a discrete command)
 *   - Observer pattern (Zustand subscriptions)
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

import {
  createEditorSlice,
  WELCOME_MD,
} from "../../domains/editor/store/editorSlice.js";
import { createUISlice } from "../ui/store/uiSlice";
import { createVaultSlice } from "../../domains/vault/store/vaultSlice";

import { Logger } from "../infrastructure/Logger";
import { fileSystem } from "../../domains/workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../../domains/vault/infrastructure/SqliteVaultRepository";
import { vaultService } from "../../domains/vault/application/VaultService";
import { workspaceService } from "../../domains/workspace/application/WorkspaceService";
import { gitService } from "../../domains/version-control/application/GitService";

const log = Logger.forContext("Store");

// ── Store ─────────────────────────────────────────────────────────────────

/**
 * The main unified Zustand store containing editor, UI, and vault slices.
 */
export const useStore = create(
  persist(
    immer((set, get) => ({
      // ── Compose slices ──────────────────────────────────────────────────
      ...createEditorSlice(set, get),
      ...createUISlice(set, get),
      ...createVaultSlice(set, get),
    })),
    {
      name: "meditor-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        viewLayout: state.viewLayout,
        isSidebarOpen: state.isSidebarOpen,
        isTocOpen: state.isTocOpen,
      }),
    },
  ),
);

// ── Backward-compatible named hook aliases ────────────────────────────────
// These allow existing components to keep using useUIStore, useWorkspaceStore, etc.
// without any changes. They all read from the single unified store.

export const useUIStore = useStore;
export const useWorkspaceStore = useStore;
export const useDocumentStore = useStore;
