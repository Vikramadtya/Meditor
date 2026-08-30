import React from "react";

const blockStyle = {
  marginBottom: "2rem",
  padding: "16px",
  border: "1px solid var(--glass-border)",
  borderRadius: "8px",
  background: "rgba(255, 255, 255, 0.02)",
  backdropFilter: "blur(10px)",
};

const rowStyle = {
  display: "flex",
  marginBottom: "8px",
  fontSize: "14px",
};

const labelStyle = {
  width: "120px",
  color: "var(--text-secondary)",
  fontWeight: "600",
  textTransform: "uppercase",
  fontSize: "11px",
  letterSpacing: "1px",
};

const valueStyle = {
  flex: 1,
  color: "var(--text-primary)",
};

export default function FrontmatterBlock({ data }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="frontmatter-block" style={blockStyle}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={rowStyle}>
          <div style={labelStyle}>{key}</div>
          <div style={valueStyle}>
            {Array.isArray(value)
              ? value.join(", ")
              : typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
