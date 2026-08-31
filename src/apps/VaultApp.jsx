import React from "react";
import { useStore } from "../store/index";

import GlobalDashboard from "../components/vault/GlobalDashboard";
import ContainerDashboard from "../components/vault/ContainerDashboard";
import FavoritesDashboard from "../components/vault/FavoritesDashboard";
import TodayPage from "../components/vault/TodayPage";
import AnalyticsPage from "../components/vault/AnalyticsPage";
import TagsPage from "../components/vault/TagsPage";

const PAGE_MAP = {
  container: ContainerDashboard,
  favorites: FavoritesDashboard,
  today: TodayPage,
  agenda: AgendaPage,
  analytics: AnalyticsPage,
  tags: TagsPage,
};

export default function VaultApp() {
  const { activeVaultItem } = useStore();
  const PageComponent = activeVaultItem?.type
    ? PAGE_MAP[activeVaultItem.type]
    : null;

  return (
    <>
      <div className="pane-container" style={{ overflow: "hidden", flex: 1 }}>
        {PageComponent ? <PageComponent /> : <GlobalDashboard />}
      </div>
    </>
  );
}
