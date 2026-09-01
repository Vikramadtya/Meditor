import { useShallow } from "zustand/react/shallow";
import React from "react";
import { useStore } from "../store/index";
const AgendaPage = lazy(() => import("../components/vault/AgendaPage"));
import { lazy, Suspense } from "react";
const GlobalDashboard = lazy(
  () => import("../components/vault/GlobalDashboard"),
);
const ContainerDashboard = lazy(
  () => import("../components/vault/ContainerDashboard"),
);
const FavoritesDashboard = lazy(
  () => import("../components/vault/FavoritesDashboard"),
);
const TodayPage = lazy(() => import("../components/vault/TodayPage"));
const AnalyticsPage = lazy(() => import("../components/vault/AnalyticsPage"));
const TagsPage = lazy(() => import("../components/vault/TagsPage"));
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
