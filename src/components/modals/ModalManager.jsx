import React from "react";
import { useStore } from "../../store/index";
import CommandPalette from "../layout/CommandPalette";
import SettingsModal from "../Settings/SettingsModal";
import GlobalSearchModal from "./GlobalSearchModal";
import CreateVaultItemModal from "./CreateVaultItemModal";
import TrashModal from "./TrashModal";
import GitModal from "./GitModal";
import GitHistoryModal from "./GitHistoryModal";
import TagModal from "./TagModal";

/**
 * Manager component that renders all global modals in the application.
 * Controls the visibility of modals based on global store state.
 *
 * @returns {React.ReactElement} A fragment containing all modal components.
 */
export default function ModalManager() {
  const { isHistoryModalOpen, setHistoryModalOpen } = useStore();

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
    </>
  );
}
