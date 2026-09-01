import React from "react";
import { Trash2 } from "lucide-react";
import { Section, Row } from "./SettingsUI";
import { inputStyle, chipStyle } from "./SettingsStyles";
import { useSettingsStore } from "../../store/settingsStore";

/**
 * Settings tab for configuring system and storage preferences.
 * Provides options to set the cache directory and clear disk cache.
 *
 * @returns {React.ReactElement} The system settings tab component.
 */
export default function SystemTab() {
  const { cacheLocation, setCacheLocation } = useSettingsStore();
  return (
    <Section label="Storage & Caching">
      <Row label="Cache Directory">
        <div
          style={{
            display: "flex",
            gap: "8px",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <input
            type="text"
            value={cacheLocation}
            onChange={(e) => setCacheLocation(e.target.value)}
            style={{
              ...inputStyle,
              flex: 1,
            }}
            placeholder="/tmp/meditor_cache"
          />
          <button
            onClick={async () => {
              try {
                const entry = await window.Neutralino.os.showFolderDialog(
                  "Select Cache Folder",
                );
                if (entry) {
                  setCacheLocation(entry);
                }
              } catch (e) {
                // dialog error
              }
            }}
            style={{
              ...chipStyle,
              background: "rgba(255,255,255,0.1)",
              borderRadius: "6px",
            }}
          >
            Browse
          </button>
        </div>
      </Row>
      <Row label="Manual Actions">
        <button
          onClick={async () => {
            const { fileSystem } =
              await import("../../infrastructure/NeutralinoFileSystem");
            fileSystem.clearDirectoryCache();
            alert("Cache cleared successfully!");
          }}
          style={{
            ...chipStyle,
            background: "var(--error, #ff5252)",
            color: "#fff",
          }}
        >
          <Trash2 size={14} /> Clear Disk Cache
        </button>
      </Row>
    </Section>
  );
}
