import { useShallow } from "zustand/react/shallow";
import React from "react";
import { useStore } from "../store/index";
import AgendaPage from "../components/vault/AgendaPage";
import GlobalDashboard from "../components/vault/GlobalDashboard";
import ContainerDashboard from "../components/vault/ContainerDashboard";
import FavoritesDashboard from "../components/vault/FavoritesDashboard";
import TodayPage from "../components/vault/TodayPage";
import AnalyticsPage from "../components/vault/AnalyticsPage";
import TagsPage from "../components/vault/TagsPage";
const PAGE_MAP = {
  agenda: AgendaPage,
  container: ContainerDashboard,
  favorites: FavoritesDashboard,
  today: TodayPage,
  analytics: AnalyticsPage,
  tags: TagsPage,
};
export default function VaultApp() {
  const { activeVaultItem } = useStore(
    useShallow((s) => ({
      activeVaultItem: s.activeVaultItem,
    })),
  );
  const PageComponent = activeVaultItem?.type
    ? PAGE_MAP[activeVaultItem.type]
    : null;
  return (
    <>
      <div
        className="pane-container"
        style={{
          overflow: "hidden",
          flex: 1,
        }}
      >
        {PageComponent ? <PageComponent /> : <GlobalDashboard />}
      </div>
    </>
  );
}
