import React from "react";
import { Tag } from "lucide-react";

/**
 * Component that displays the frontmatter metadata (like tags and key-value pairs)
 * at the top of the markdown document preview.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.data - The parsed frontmatter data.
 * @returns {React.ReactElement|null} The rendered FrontmatterBlock component, or null if no data is provided.
 */
export default function FrontmatterBlock({ data }) {
  if (!data || Object.keys(data).length === 0) return null;

  const { tags, ...rest } = data;
  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim())
      : [];

  return (
    <div className="frontmatter-container" style={{ marginBottom: "2rem" }}>
      {tagList.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <Tag
            size={16}
            color="var(--text-secondary)"
            style={{ marginRight: "4px" }}
          />
          {tagList.map((tag, i) => (
            <span
              key={i}
              style={{
                backgroundColor: "#1f2937",
                color: "#f3f4f6",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600",
                display: "inline-block",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {Object.keys(rest).length > 0 && (
        <div
          style={{
            padding: "16px",
            border: "1px solid var(--glass-border)",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(10px)",
          }}
        >
          {Object.entries(rest).map(([key, value]) => (
            <div
              key={key}
              style={{ display: "flex", marginBottom: "8px", fontSize: "14px" }}
            >
              <div
                style={{
                  width: "120px",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "11px",
                  letterSpacing: "1px",
                }}
              >
                {key}
              </div>
              <div style={{ flex: 1, color: "var(--text-primary)" }}>
                {Array.isArray(value)
                  ? value.join(", ")
                  : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
