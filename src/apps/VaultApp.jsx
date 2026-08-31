import React from "react";
import { useStore } from "../store/index";

import VaultDashboard from "../components/vault/VaultDashboard";
import CollectionDashboard from "../components/vault/CollectionDashboard";
import FavoritesDashboard from "../components/vault/FavoritesDashboard";
import TodayPage from "../components/vault/TodayPage";
import AgendaPage from "../components/vault/AgendaPage";
import FlashcardReviewPage from "../components/vault/FlashcardReviewPage";
import KnowledgeGraphPage from "../components/vault/KnowledgeGraphPage";
import AnalyticsPage from "../components/vault/AnalyticsPage";
import TagsPage from "../components/vault/TagsPage";

const PAGE_MAP = {
  collection: CollectionDashboard,
  favorites: FavoritesDashboard,
  today: TodayPage,
  agenda: AgendaPage,
  flashcards: FlashcardReviewPage,
  graph: KnowledgeGraphPage,
  analytics: AnalyticsPage,
  tags: TagsPage,
};

/**
 * The main application component when in Vault mode.
 * Routes to the correct dashboard based on the active vault item.
 *
 * @returns {import("react").JSX.Element} The rendered component.
 */
export default function VaultApp() {
  const { activeVaultItem } = useStore();
  const PageComponent = activeVaultItem?.type
    ? PAGE_MAP[activeVaultItem.type]
    : null;

  return (
    <>
      <div className="pane-container" style={{ overflow: "hidden", flex: 1 }}>
        {PageComponent ? <PageComponent /> : <VaultDashboard />}
      </div>
    </>
  );
}
