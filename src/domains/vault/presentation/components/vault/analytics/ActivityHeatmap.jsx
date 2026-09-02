import { useShallow } from "zustand/react/shallow";
import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useStore } from "../../../../../../core/store/index";
export function ActivityHeatmap({ heatmapData }) {
  const { theme } = useStore(
    useShallow((s) => ({
      theme: s.theme,
    })),
  );
  if (heatmapData.length === 0) return null;
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
        Activity Heatmap
      </h3>
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        <ActivityCalendar
          data={heatmapData}
          theme={{
            light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
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
      </div>
    </div>
  );
}
