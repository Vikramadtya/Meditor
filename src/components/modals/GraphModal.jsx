import { useModalEscape } from "../../hooks/useModalEscape";
import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";
import { useStore } from "../../store/index";
import { linkService } from "../../services/linkService";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { iconBtnStyle } from "../Settings/SettingsStyles";

export default function GraphModal() {
  const { isGraphModalOpen, setGraphModalOpen, theme } = useStore();
  useModalEscape(isGraphModalOpen, () => setGraphModalOpen(false));
  const { vaultHierarchy } = useStore();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef();

  useEffect(() => {
    if (isGraphModalOpen) {
      buildGraphData();
    }
  }, [isGraphModalOpen, vaultHierarchy]);

  const buildGraphData = async () => {
    const notes = vaultRepository.getAllNotesForGraph();
    if (!notes.length) return;

    const nodes = notes.map((n) => ({ id: n.name, val: 1, name: n.name }));
    const links = [];

    for (const node of nodes) {
      const backlinks = await linkService.getBacklinksForNote(node.id);
      backlinks.forEach((bl) => {
        links.push({ source: bl.name, target: node.id });
      });
    }

    setGraphData({ nodes, links });
  };

  if (!isGraphModalOpen) return null;

  const nodeColor = theme === "light" ? "#f97316" : "#fb923c";
  const linkColor =
    theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const textColor = theme === "light" ? "#000" : "#fff";

  return (
    <div
      className="modal-overlay open"
      onClick={() => setGraphModalOpen(false)}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90vw",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setGraphModalOpen(false)}
            style={{ ...iconBtnStyle, background: "var(--bg-secondary)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          {graphData.nodes.length > 0 && (
            <ForceGraph2D
              ref={graphRef}
              width={window.innerWidth * 0.9}
              height={window.innerHeight * 0.9}
              graphData={graphData}
              nodeLabel="name"
              nodeColor={() => nodeColor}
              linkColor={() => linkColor}
              onNodeClick={(node) => {
                linkService.openNoteByName(node.id);
                setGraphModalOpen(false);
              }}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(
                  (n) => n + fontSize * 0.2,
                );

                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y - bckgDimensions[1] / 2,
                  ...bckgDimensions,
                );

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = nodeColor;
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
              }}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                bckgDimensions &&
                  ctx.fillRect(
                    node.x - bckgDimensions[0] / 2,
                    node.y - bckgDimensions[1] / 2,
                    ...bckgDimensions,
                  );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
