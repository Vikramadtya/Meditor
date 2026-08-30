import React from "react";
import { useStore } from "../../store/index";
import CommandPalette from "../layout/CommandPalette";
import SettingsModal from "../Settings/SettingsModal";
import GlobalSearchModal from "./GlobalSearchModal";
import CreateVaultItemModal from "./CreateVaultItemModal";
import TrashModal from "./TrashModal";
import GraphModal from "./GraphModal";
import StatsModal from "./StatsModal";
import GitModal from "./GitModal";
import GitHistoryModal from "./GitHistoryModal";
import TagModal from "./TagModal";
import FlashcardModal from "./FlashcardModal";

export default function ModalManager() {
  const { isHistoryModalOpen, setHistoryModalOpen } = useStore();

  return (
    <>
      <CommandPalette />
      <SettingsModal />
      <GlobalSearchModal />
      <CreateVaultItemModal />
      <TrashModal />
      <GraphModal />
      <StatsModal />
      <GitModal />
      <GitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />
      <TagModal />
      <FlashcardModal />
    </>
  );
}
