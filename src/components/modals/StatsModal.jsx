import { useModalEscape } from "../../hooks/useModalEscape";
import React, { useEffect, useState } from "react";
import { X, BarChart2 } from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";
import { format, subYears } from "date-fns";
import { useStore } from "../../store/index";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";

export default function StatsModal() {
  const { isStatsModalOpen, setStatsModalOpen, theme } = useStore();
  useModalEscape(isStatsModalOpen, () => setStatsModalOpen(false));
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    notes: 0,
    flashcards: 0,
    books: 0,
    courses: 0,
    dueReviews: 0,
    completedReviews: 0,
  });

  useEffect(() => {
    if (!isStatsModalOpen || !vaultRepository.db) return;

    // Activity heatmap data
    const counts = vaultRepository.getActivityCounts();
    const heatmapData = [];
    const endDate = new Date();
    const startDate = subYears(endDate, 1);

    let d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = format(d, "yyyy-MM-dd");
      heatmapData.push({
        date: dateStr,
        count: counts[dateStr] || 0,
        level: Math.min(counts[dateStr] || 0, 4),
      });
      d.setDate(d.getDate() + 1);
    }

    setData(heatmapData);
    setTotals(vaultRepository.getTotals());
  }, [isStatsModalOpen]);

  if (!isStatsModalOpen) return null;

  const explicitTheme = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  };

  return (
    <div
      className="modal-overlay open"
      onClick={() => setStatsModalOpen(false)}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "800px",
          maxWidth: "90%",
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setStatsModalOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <BarChart2
            size={32}
            color="var(--accent)"
            style={{ marginTop: "4px" }}
          />
          <div>
            <h2
              style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0" }}
            >
              Your Analytics
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: 0,
                fontSize: "15px",
              }}
            >
              Track your studying, learning progress, and vault stats.
            </p>
          </div>
        </div>

        {/* Top Grid - 4 items */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <StatCard label="Total Notes" value={totals.notes} />
          <StatCard
            label="Total Flashcards"
            value={totals.flashcards}
            color="#3b82f6"
          />
          <StatCard
            label="Books Library"
            value={totals.books}
            color="#3b82f6"
          />
          <StatCard
            label="Courses Library"
            value={totals.courses}
            color="var(--accent)"
          />
        </div>

        {/* Middle Grid - 2 items */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "24px",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#3b82f6",
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Due for Review Today
              </div>
              <div style={{ color: "#60a5fa", fontSize: "12px" }}>
                Flashcards waiting for spaced repetition.
              </div>
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 800, color: "#3b82f6" }}
            >
              {totals.dueReviews}
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              background: "rgba(16, 185, 129, 0.1)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#10b981",
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Total Reviews Completed
              </div>
              <div style={{ color: "#34d399", fontSize: "12px" }}>
                Total reps across all your flashcards.
              </div>
            </div>
            <div
              style={{ fontSize: "42px", fontWeight: 800, color: "#10b981" }}
            >
              {totals.completedReviews}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div
          className="hide-scrollbar"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--glass-border)",
            padding: "24px",
            borderRadius: "12px",
            overflowX: "auto",
          }}
        >
          <h3
            style={{ margin: "0 0 24px 0", fontSize: "16px", fontWeight: 700 }}
          >
            Contribution Heatmap
          </h3>
          {data.length > 0 ? (
            <ActivityCalendar
              data={data}
              theme={explicitTheme}
              colorScheme={theme}
              labels={{ totalCount: "{{count}} contributions in {{year}}" }}
              blockRadius={2}
              blockSize={12}
              blockMargin={4}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                padding: "20px",
              }}
            >
              No activity data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "var(--text-primary)" }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "var(--bg-primary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "36px", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
