import { useShallow } from "zustand/react/shallow";
import {
  createVaultDialog,
  openWorkspaceDialog,
} from "../../store/actions/index.js";
import React from "react";
import { Folder, FolderOpen } from "lucide-react";
import { useStore } from "../../store/index";

/**
 * A welcome screen shown to the user when no workspace or vault is currently open.
 * Prompts the user to create a vault or open a regular folder.
 *
 * @returns {React.ReactElement} The rendered WelcomeScreen component.
 */
export default function WelcomeScreen() {
  const { theme } = useStore(
    useShallow((s) => ({
      theme: s.theme,
    })),
  );
  const isLight = theme === "light";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          border: "1px solid var(--glass-border)",
          maxWidth: "480px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Welcome to Meditor
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          To get started, please select a folder on your computer where your
          markdown notes and images will be stored.
        </p>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={createVaultDialog}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#E4785C",
              // Coral color from screenshot
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Folder size={16} />
            Select Vault Folder
          </button>

          <button
            onClick={openWorkspaceDialog}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--glass-bg)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <FolderOpen size={16} />
            Open Regular Folder
          </button>
        </div>
      </div>
    </div>
  );
}
