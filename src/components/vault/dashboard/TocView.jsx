import { useShallow } from "zustand/react/shallow";
import { openNoteFromVault } from "../../../store/actions/index";
import React, { useState, useEffect } from "react";
import { Folder, FileText } from "lucide-react";
import { useStore } from "../../../core/store/index";
import { vaultService } from "../../../application/vault/VaultService";
export function TocNode({ item, level = 0 }) {
  const { setActiveVaultItem } = useStore(
    useShallow((s) => ({
      setActiveVaultItem: s.setActiveVaultItem,
    })),
  );
  const [children, setChildren] = useState(null);
  const isNote = item.type === "note";
  useEffect(() => {
    if (!isNote) {
      vaultService.getFolderContents(item.path).then(setChildren);
    }
  }, [item.path, isNote]);
  return (
    <div
      style={{
        marginTop: level === 0 ? "16px" : "8px",
      }}
    >
      <div
        onClick={() =>
          isNote ? openNoteFromVault(item) : setActiveVaultItem(item)
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {isNote ? (
          <FileText
            size={18}
            style={{
              color: "var(--text-secondary)",
            }}
          />
        ) : (
          <Folder
            size={18}
            style={{
              color: "var(--accent)",
            }}
          />
        )}
        <span
          style={{
            fontWeight: isNote ? 500 : 600,
            fontSize: isNote ? "14px" : "15px",
            color: isNote ? "var(--text-secondary)" : "var(--text-primary)",
          }}
        >
          {item.name}
        </span>
      </div>

      {!isNote && children && children.length > 0 && (
        <div
          style={{
            paddingLeft: "24px",
            marginLeft: "21px",
            borderLeft: "1px dashed var(--glass-border)",
            marginTop: "4px",
          }}
        >
          {children.map((child) => (
            <TocNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
export function TocView({ children }) {
  return (
    <div
      style={{
        maxWidth: "800px",
        padding: "16px 0",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          borderBottom: "1px solid var(--glass-border)",
          paddingBottom: "16px",
          marginBottom: "8px",
        }}
      >
        Table of Contents
      </h2>
      {children.map((child) => (
        <TocNode key={child.id} item={child} level={0} />
      ))}
    </div>
  );
}
