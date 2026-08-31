import React, { useState, useEffect, useCallback, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Network, Search, X } from "lucide-react";
import { useStore } from "../../store/index";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { searchService } from "../../application/editor/SearchService.js";

// Generate a stable color per group name
const GROUP_COLORS = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f59e0b",
];
/**
 * Generates a stable color for a given group name.
 *
 * @param {string} name - The group name.
 * @param {Array<string>} allGroups - All possible group names.
 * @returns {string} The HEX color string.
 */
const groupColor = (name, allGroups) =>
  GROUP_COLORS[allGroups.indexOf(name) % GROUP_COLORS.length] ?? "#6366f1";

/**
 * KnowledgeGraphPage Component
 *
 * Renders an interactive 2D force-directed graph of notes and their connections
 * based on backlinks, with filtering capabilities by tags, groups, and search query.
 *
 * @returns {JSX.Element} The rendered KnowledgeGraphPage component.
 */
export default function KnowledgeGraphPage() {
  const { theme, vaultHierarchy } = useStore();
  const graphRef = useRef();

  const [allNotes, setAllNotes] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [allTags, setAllTags] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showLabels, setShowLabels] = useState(true);

  // Helper to get group name from module_id
  const getGroupName = useCallback(
    (moduleId) => {
      for (const group of vaultHierarchy) {
        for (const coll of group.children ?? []) {
          for (const mod of coll.children ?? []) {
            if (mod.id === moduleId) return group.name;
          }
        }
      }
      return null;
    },
    [vaultHierarchy],
  );

  // Load all base data once
  useEffect(() => {
    const notes = vaultRepository.getAllNotesForGraph();
    setAllNotes(notes);

    // Extract all unique tags
    const tagSet = new Set();
    notes.forEach((n) =>
      n.tags
        ?.split(",")
        .filter(Boolean)
        .forEach((t) => tagSet.add(t.trim())),
    );
    setAllTags([...tagSet].sort());

    // Extract groups from hierarchy
    setAllGroups(vaultHierarchy.map((g) => g.name));
  }, [vaultHierarchy]);

  // Rebuild graph when filters change
  const buildGraph = useCallback(async () => {
    let notes = allNotes;

    // Apply search filter
    if (searchQuery) {
      notes = notes.filter((n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      notes = notes.filter((n) =>
        selectedTags.some((t) => n.tags?.includes(t)),
      );
    }

    // Apply group filter (look up module_id → collection → group)
    if (selectedGroups.length > 0) {
      const allowed = new Set(
        vaultRepository
          .getGraphDataFiltered(
            [],
            selectedGroups
              .map((g) => vaultHierarchy.find((h) => h.name === g)?.id)
              .filter(Boolean),
          )
          .map((n) => n.id),
      );
      notes = notes.filter((n) => allowed.has(n.id));
    }

    const nodeSet = new Set(notes.map((n) => n.name));
    const nodes = notes.map((n) => ({
      id: n.name,
      name: n.name,
      tags: n.tags,
      val: 1,
      groupName: getGroupName(n.module_id),
    }));

    const links = [];
    for (const node of nodes) {
      try {
        const bls = await (async () => {
          const state = useStore.getState();
          return searchService.getBacklinks(
            node.id,
            state.workspaceMode,
            state.workspaceRoot || state.currentFolder,
          );
        })();
        bls.forEach((bl) => {
          if (nodeSet.has(bl.name))
            links.push({ source: bl.name, target: node.id });
        });
      } catch {}
    }

    setGraphData({ nodes, links });
  }, [
    allNotes,
    searchQuery,
    selectedTags,
    selectedGroups,
    vaultHierarchy,
    getGroupName,
  ]);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  const nodeColorFn = (node) =>
    node.groupName ? groupColor(node.groupName, allGroups) : "#6366f1";
  const linkColor =
    theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        padding: 0,
      }}
      className="page-container"
    >
      {/* Filter Sidebar */}
      <div
        style={{
          width: "260px",
          flexShrink: 0,
          borderRight: "1px solid var(--glass-border)",
          padding: "24px 16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Network size={18} color="var(--accent)" />
          <span style={{ fontWeight: 800, fontSize: "16px" }}>
            Knowledge Graph
          </span>
        </div>

        {/* Search */}
        <div>
          <label style={labelStyle}>Search Notes</label>
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name..."
              style={{
                width: "100%",
                paddingLeft: "30px",
                paddingRight: "8px",
                paddingTop: "8px",
                paddingBottom: "8px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                fontSize: "13px",
                color: "var(--text-primary)",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Groups */}
        <FilterSection
          title="Groups"
          items={allGroups}
          selected={selectedGroups}
          onToggle={(g) =>
            setSelectedGroups((s) =>
              s.includes(g) ? s.filter((x) => x !== g) : [...s, g],
            )
          }
          getColor={(g) => groupColor(g, allGroups)}
        />

        {/* Tags */}
        <FilterSection
          title="Tags"
          items={allTags}
          selected={selectedTags}
          onToggle={(t) =>
            setSelectedTags((s) =>
              s.includes(t) ? s.filter((x) => x !== t) : [...s, t],
            )
          }
        />

        {/* Controls */}
        <div>
          <label style={labelStyle}>Display</label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            Show Labels
          </label>
        </div>

        {/* Reset */}
        {(selectedTags.length > 0 ||
          selectedGroups.length > 0 ||
          searchQuery) && (
          <button
            onClick={() => {
              setSelectedTags([]);
              setSelectedGroups([]);
              setSearchQuery("");
            }}
            style={{
              padding: "8px",
              background: "none",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Reset Filters
          </button>
        )}

        {/* Stats */}
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            borderTop: "1px solid var(--glass-border)",
            paddingTop: "16px",
          }}
        >
          {graphData.nodes.length} nodes · {graphData.links.length} links
        </div>
      </div>

      {/* Graph Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={nodeColorFn}
            linkColor={() => linkColor}
            nodeRelSize={5}
            onNodeClick={(node) => useStore.getState().openNoteByName(node.id)}
            nodeCanvasObject={
              showLabels
                ? (node, ctx, scale) => {
                    const label = node.id;
                    const fontSize = Math.max(10, 12 / scale);
                    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
                    ctx.fillStyle = nodeColorFn(node);
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5 / scale, 0, 2 * Math.PI);
                    ctx.fill();
                    if (scale > 0.6) {
                      ctx.fillStyle = theme === "light" ? "#111" : "#eee";
                      ctx.textAlign = "center";
                      ctx.fillText(label, node.x, node.y - 8 / scale);
                    }
                  }
                : undefined
            }
          />
        )}
        {graphData.nodes.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-secondary)",
            }}
          >
            <Network size={64} style={{ opacity: 0.1, marginBottom: "16px" }} />
            <p>No notes match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "var(--text-secondary)",
  marginBottom: "8px",
};

/**
 * FilterSection Component
 *
 * Renders a set of filter pills for tags or groups.
 *
 * @param {Object} props - Component props.
 * @param {string} props.title - The title of the filter section.
 * @param {Array<string>} props.items - Array of filter item strings.
 * @param {Array<string>} props.selected - Array of currently selected items.
 * @param {function} props.onToggle - Callback when an item is toggled.
 * @param {function} [props.getColor] - Function to get the color for a filter item.
 * @returns {JSX.Element|null} The rendered FilterSection component.
 */
function FilterSection({ title, items, selected, onToggle, getColor }) {
  if (items.length === 0) return null;
  return (
    <div>
      <label style={labelStyle}>{title}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              border: "1px solid",
              borderColor: selected.includes(item)
                ? (getColor?.(item) ?? "var(--accent)")
                : "var(--glass-border)",
              background: selected.includes(item)
                ? `${getColor?.(item) ?? "var(--accent)"}22`
                : "transparent",
              color: selected.includes(item)
                ? (getColor?.(item) ?? "var(--accent)")
                : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
