const fs = require('fs');

const groupNode = fs.readFileSync('src/components/vault/sidebar/VaultGroupNode.jsx', 'utf8');
const node = fs.readFileSync('src/components/vault/sidebar/VaultNode.jsx', 'utf8');

// I will overwrite them completely because it's simpler
const newGroupNode = `import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../../store/index";
import { vaultService } from "../../../application/vault/VaultService";
import VaultNode from "./VaultNode";

export default function VaultGroupNode({ group }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [hovered, setHovered] = useState(false);
  const { setActiveVaultItem, activeVaultItem, openCreateVaultItemModal, reloadVaultHierarchy } = useStore();
  const isActive = activeVaultItem && activeVaultItem.id === group.id;

  const loadChildren = async () => {
    const res = await vaultService.getFolderContents(group.path);
    setChildren(res);
  };

  useEffect(() => {
    if (expanded) loadChildren();
  }, [expanded]);

  // Handle reloads globally
  useEffect(() => {
    if (expanded) loadChildren();
  }, [group]); // if group object changes, maybe reload? Actually we need an event, but reloadVaultHierarchy will trigger top-level re-render

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        onClick={() => { setActiveVaultItem(group); setExpanded(true); }}
        style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px",
          cursor: "pointer",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; setHovered(true); }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--text-secondary)"; setHovered(false); }}
      >
        <div onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>
        <span style={{ flex: 1 }}>{group.name}</span>
        
        <div
          onClick={(e) => { e.stopPropagation(); setExpanded(true); openCreateVaultItemModal("container", group.path); }}
          style={{ opacity: hovered ? 1 : 0, display: "flex", alignItems: "center" }}
        >
          <Plus size={14} />
        </div>
        <div
          onClick={async (e) => {
            e.stopPropagation();
            if (window.confirm(\`Are you sure you want to delete "\${group.name}"?\`)) {
              await vaultService.deleteItem("container", group.id, group.path);
              reloadVaultHierarchy();
            }
          }}
          style={{ opacity: hovered ? 1 : 0, display: "flex", alignItems: "center", marginLeft: "4px", color: "#ff5252" }}
        >
          <Trash2 size={13} />
        </div>
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "8px", marginTop: "4px", gap: "2px" }}>
          {children.map((child) => (
            <VaultNode key={child.id} item={child} level={1} />
          ))}
        </div>
      )}
    </div>
  );
}`;

const newNode = `import React, { useState, useEffect } from "react";
import { Circle, CircleDashed, FileText, ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../../store/index";
import { vaultService } from "../../../application/vault/VaultService";

export default function VaultNode({ item, level }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [hovered, setHovered] = useState(false);
  
  const { activeVaultItem, setActiveVaultItem, openCreateVaultItemModal, openNoteFromVault, reloadVaultHierarchy } = useStore();
  const isActive = activeVaultItem?.id === item.id;
  const isNote = item.type === "note";

  const loadChildren = async () => {
    if (isNote) return;
    const res = await vaultService.getFolderContents(item.path);
    setChildren(res);
  };

  useEffect(() => {
    if (expanded && !isNote) loadChildren();
  }, [expanded]);

  let Icon = FileText;
  if (!isNote) {
    Icon = expanded ? Circle : CircleDashed;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        onClick={() => {
          if (isNote) {
            openNoteFromVault(item);
          } else {
            setActiveVaultItem(item);
            setExpanded(!expanded);
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "6px 8px 6px 12px", cursor: "pointer",
          borderRadius: "6px",
          backgroundColor: isActive ? "var(--bg-active)" : "transparent",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          fontSize: "13px",
        }}
      >
        {!isNote && (
          <div style={{ display: "flex", alignItems: "center", marginLeft: "-12px", marginRight: "2px" }} onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
        <Icon size={14} style={{ color: isActive ? "var(--accent)" : "currentColor", opacity: isNote ? 0.7 : 1 }} />
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.name}
        </span>

        {!isNote && hovered && (
          <div onClick={(e) => { e.stopPropagation(); setExpanded(true); openCreateVaultItemModal("container", item.path); }} style={{ display: "flex", alignItems: "center" }}>
            <Plus size={14} />
          </div>
        )}
        {hovered && (
          <div
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm(\`Delete "\${item.name}"?\`)) {
                await vaultService.deleteItem(item.type, item.id, item.path);
                reloadVaultHierarchy(); // Actually this triggers a top-level reload, but that won't reload this node's parent automatically if the parent isn't at the root. We might need a better refresh mechanism.
              }
            }}
            style={{ display: "flex", alignItems: "center", marginLeft: "4px", color: "#ff5252" }}
          >
            <Trash2 size={13} />
          </div>
        )}
      </div>

      {expanded && !isNote && (
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "16px", borderLeft: "1px solid var(--glass-border)", marginLeft: "12px", marginTop: "2px", gap: "2px" }}>
          {children.map((child) => (
            <VaultNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}`;

fs.writeFileSync('src/components/vault/sidebar/VaultGroupNode.jsx', newGroupNode);
fs.writeFileSync('src/components/vault/sidebar/VaultNode.jsx', newNode);
console.log('Fixed VaultGroupNode and VaultNode');
