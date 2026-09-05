import { useShallow } from "zustand/react/shallow";
import React from "react";
import { useStore } from "../store/index";
import CommandPalette from "../../domains/workspace/presentation/components/CommandPalette";
import SettingsModal from "../../domains/settings/presentation/SettingsModal";
import GlobalSearchModal from "../../domains/workspace/presentation/components/GlobalSearchModal";
import CreateVaultItemModal from "../../domains/vault/presentation/components/CreateVaultItemModal";
import TrashModal from "../../domains/vault/presentation/components/TrashModal";
import GitModal from "../../domains/version-control/presentation/GitModal";
import GitHistoryModal from "../../domains/version-control/presentation/GitHistoryModal";
import TagModal from "../../domains/vault/presentation/components/TagModal";
import ConfirmDeleteModal from "../../domains/vault/presentation/components/ConfirmDeleteModal";
import AuditModal from "../../domains/vault/presentation/components/AuditModal";
import MoveItemModal from "../../domains/vault/presentation/components/MoveItemModal";
import VaultContextMenu from "../../domains/vault/presentation/components/vault/sidebar/VaultContextMenu";

/**
 * Manager component that renders all global modals in the application.
 * Controls the visibility of modals based on global store state.
 *
 * @returns {React.ReactElement} A fragment containing all modal components.
 */
export default function ModalManager() {
  const { isHistoryModalOpen, setHistoryModalOpen } = useStore(
    useShallow((s) => ({
      isHistoryModalOpen: s.isHistoryModalOpen,
      setHistoryModalOpen: s.setHistoryModalOpen,
    })),
  );
  return (
    <>
      <CommandPalette />
      <SettingsModal />
      <GlobalSearchModal />
      <CreateVaultItemModal />
      <TrashModal />
      <GitModal />
      <GitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />
      <TagModal />
      <ConfirmDeleteModal />
      <AuditModal />
      <MoveItemModal />
      <VaultContextMenu />
    </>
  );
}
