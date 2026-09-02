import { useShallow } from "zustand/react/shallow";
import React, { useState, useEffect } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { BarChart2, Brain, FileText, Tag, Star, Zap } from "lucide-react";
import { subYears, eachDayOfInterval, format } from "date-fns";
import { useStore } from "../../core/store/index";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { ActivityHeatmap } from "./analytics/ActivityHeatmap";
import { ContainerDistribution } from "./analytics/ContainerDistribution";
import { TopTagsChart } from "./analytics/TopTagsChart";

/**
 * AnalyticsPage Component
 *
 * Renders an analytics dashboard for the vault, displaying overall stats,
 * writing activity heatmap, notes by group, top tags, and SRS maturity.
 *
 * @returns {JSX.Element} The rendered AnalyticsPage component.
 */
export default function AnalyticsPage() {
  const { theme } = useStore(
    useShallow((s) => ({
      theme: s.theme,
    })),
  );
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  useEffect(() => {
    const data = vaultRepository.getAnalytics();
    setAnalytics(data);
    if (data?.editCounts) {
      const days = eachDayOfInterval({
        start: subYears(new Date(), 1),
        end: new Date(),
      });
      setHeatmapData(
        days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const count = data.editCounts[key] ?? 0;
          return {
            date: key,
            count,
            level: Math.min(count, 4),
          };
        }),
      );
    }
  }, []);
  if (!analytics)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        Loading...
      </div>
    );
  const topTags = Object.entries(analytics.tagCounts ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);
  const maxGroupCount = Math.max(
    ...(analytics.notesByGroup?.map((g) => g.count) ?? [1]),
    1,
  );
  return (
    <div
      style={{
        padding: "40px 60px",
        height: "100%",
        overflowY: "auto",
      }}
      className="page-container"
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <BarChart2 size={36} color="var(--accent)" />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              Analytics
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
              }}
            >
              Your knowledge base at a glance
            </p>
          </div>
        </div>

        {/* Hero Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <HeroCard
            icon={<BarChart2 size={20} />}
            label="Groups"
            value={analytics.groups}
            color="#10b981"
          />
          <HeroCard
            icon={<Star size={20} />}
            label="Favorites"
            value={analytics.favorites}
            color="#f97316"
          />
          <HeroCard
            icon={<Tag size={20} />}
            label="Tags Used"
            value={Object.keys(analytics.tagCounts ?? {}).length}
            color="#ec4899"
          />
        </div>

        <ActivityHeatmap heatmapData={heatmapData} />
        <ContainerDistribution notesByGroup={analytics.notesByGroup} />
        <TopTagsChart topTags={topTags} />
      </div>
    </div>
  );
}

/**
 * HeroCard Component
 *
 * Renders a high-level summary metric with an icon.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.icon - The lucide-react icon component.
 * @param {string} props.label - Metric label.
 * @param {number|string} props.value - Metric value.
 * @param {string} props.color - Hex color string.
 * @returns {JSX.Element} The rendered HeroCard.
 */
function HeroCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "var(--bg-primary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color,
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 800,
          color,
          marginBottom: "4px",
        }}
      >
        {value ?? 0}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * Section Component
 *
 * Container component for a logical section of the analytics page.
 *
 * @param {Object} props - Component props.
 * @param {string} props.title - Section title.
 * @param {React.ReactNode} props.children - Section content.
 * @returns {JSX.Element} The rendered Section.
 */
function Section({ title, children }) {
  return (
    <div
      style={{
        marginBottom: "36px",
        background: "var(--bg-primary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "16px",
        padding: "28px",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px",
          fontSize: "16px",
          fontWeight: 700,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
