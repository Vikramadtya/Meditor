import React from "react";

export function ContainerDistribution({ notesByGroup }) {
  if (!notesByGroup || notesByGroup.length === 0) return null;

  const maxGroupCount = Math.max(...notesByGroup.map((g) => g.count), 1);

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
        Notes by Group
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {notesByGroup.slice(0, 10).map((g) => (
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
    </div>
  );
}
