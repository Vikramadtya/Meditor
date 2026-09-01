import React from "react";

export function TagChipInput({
  tags,
  tagInput,
  setTagInput,
  handleTagKeyDown,
  removeTag,
  tagInputRef,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--glass-border)",
          borderRadius: "8px",
          padding: "8px",
          minHeight: "44px",
          alignItems: "center",
          cursor: "text",
        }}
        onClick={() => tagInputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "var(--bg-primary)",
              border: "1px solid var(--glass-border)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            #{tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 2px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={tagInputRef}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={tags.length === 0 ? "Tags (press Enter)..." : ""}
          style={{
            flex: 1,
            minWidth: "120px",
            background: "none",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "var(--text-primary)",
            padding: "2px 0",
          }}
        />
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-secondary)",
          marginTop: "6px",
          paddingLeft: "2px",
        }}
      >
        Press Enter or comma to add a tag
      </div>
    </div>
  );
}
