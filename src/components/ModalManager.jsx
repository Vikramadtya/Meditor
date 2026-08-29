import React from "react";
import CommandPalette from "./CommandPalette";
import SettingsModal from "./Settings/SettingsModal";
import GlobalSearchModal from "./GlobalSearchModal";

export default function ModalManager() {
  return (
    <>
      <CommandPalette />
      <SettingsModal />
      <GlobalSearchModal />
    </>
  );
}
