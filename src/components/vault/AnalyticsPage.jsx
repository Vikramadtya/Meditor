import React, { useState, useEffect } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { BarChart2, Brain, FileText, Tag, Star, Zap } from "lucide-react";
import { subYears, eachDayOfInterval, format } from "date-fns";
import { useStore } from "../../store/index";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";

/**
 * AnalyticsPage Component
 *
 * Renders an analytics dashboard for the vault, displaying overall stats,
 * writing activity heatmap, notes by group, top tags, and SRS maturity.
 *
 * @returns {JSX.Element} The rendered AnalyticsPage component.
 */
export default function AnalyticsPage() {
  const { theme } = useStore();
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
          return { date: key, count, level: Math.min(count, 4) };
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
      style={{ padding: "40px 60px", height: "100%", overflowY: "auto" }}
      className="page-container"
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
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
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>
              Analytics
            </h1>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
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

        {/* Contribution Heatmap */}
        <Section title="Writing Activity">
          <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
            {heatmapData.length > 0 && (
              <ActivityCalendar
                data={heatmapData}
                theme={{
                  light: [
                    "#ebedf0",
                    "#9be9a8",
                    "#40c463",
                    "#30a14e",
                    "#216e39",
                  ],
                  dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
                }}
                colorScheme={theme}
                blockRadius={3}
                blockSize={12}
                blockMargin={4}
                labels={{
                  totalCount: "{{count}} notes created/edited in {{year}}",
                }}
              />
            )}
          </div>
        </Section>

        {/* Notes by Group */}
        {analytics.notesByGroup?.length > 0 && (
          <Section title="Notes by Group">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {analytics.notesByGroup.slice(0, 10).map((g) => (
                <div
                  key={g.name}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{
                      width: "140px",
                      fontSize: "13px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "10px",
                      background: "var(--bg-secondary)",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(g.count / maxGroupCount) * 100}%`,
                        background: "var(--accent)",
                        borderRadius: "5px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      width: "32px",
                      textAlign: "right",
                    }}
                  >
                    {g.count}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Top Tags */}
        {topTags.length > 0 && (
          <Section title="Top Tags">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "baseline",
              }}
            >
              {topTags.map(([tag, count]) => {
                const maxCount = topTags[0][1];
                const size = 12 + (count / maxCount) * 12; // 12px to 24px
                return (
                  <span
                    key={tag}
                    style={{
                      fontSize: `${size}px`,
                      fontWeight: 700,
                      color: "var(--accent)",
                      opacity: 0.5 + (count / maxCount) * 0.5,
                      padding: "4px 10px",
                      background: "var(--bg-secondary)",
                      borderRadius: "999px",
                    }}
                  >
                    #{tag}
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 400,
                        marginLeft: "4px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </Section>
        )}

        {/* SRS Interval Distribution */}
        {analytics.srsIntervals?.length > 0 && (
          <Section title="Flashcard SRS Maturity">
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              How mature your flashcards are (review interval distribution)
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "New (0–1d)", filter: (i) => i <= 1 },
                { label: "Learning (2–6d)", filter: (i) => i > 1 && i <= 6 },
                { label: "Review (1–2w)", filter: (i) => i > 6 && i <= 14 },
                { label: "Mature (2w+)", filter: (i) => i > 14 },
              ].map(({ label, filter }) => {
                const count = analytics.srsIntervals.filter(filter).length;
                return (
                  <div
                    key={label}
                    style={{
                      padding: "16px 20px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "10px",
                      minWidth: "120px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "var(--accent)",
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
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
      <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
