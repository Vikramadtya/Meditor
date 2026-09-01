import React from "react";
export function TopTagsChart({ topTags }) {
  if (!topTags || topTags.length === 0) return null;
  const maxCount = topTags[0][1];
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
        Top Tags
      </h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "baseline",
        }}
      >
        {topTags.map(([tag, count]) => {
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
    </div>
  );
}
