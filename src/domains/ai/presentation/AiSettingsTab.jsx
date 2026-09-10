import React from "react";
import { useSettingsStore } from "../../settings/application/settingsStore";
import {
  Section,
  Row,
  ToggleRow,
} from "../../settings/presentation/SettingsUI";
import { inputStyle } from "../../settings/presentation/SettingsStyles";

export default function AiSettingsTab() {
  const { aiConfig, setAiConfig } = useSettingsStore();

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <Section label="AI & Search Configuration">
        <ToggleRow
          label="Enable AI Features (Chat & Indexing)"
          checked={aiConfig.enabled}
          onChange={(checked) => setAiConfig({ enabled: checked })}
        />

        <Row label="LLM Endpoint URL">
          <input
            type="text"
            style={{ ...inputStyle, width: "300px" }}
            value={aiConfig.llmUrl}
            onChange={(e) => setAiConfig({ llmUrl: e.target.value })}
            placeholder="http://localhost:11434/v1/chat/completions"
            disabled={!aiConfig.enabled}
          />
        </Row>

        <Row label="Model Name">
          <input
            type="text"
            style={{ ...inputStyle, width: "300px" }}
            value={aiConfig.modelName}
            onChange={(e) => setAiConfig({ modelName: e.target.value })}
            placeholder="llama3"
            disabled={!aiConfig.enabled}
          />
        </Row>

        <Row label="API Key (Optional)">
          <input
            type="password"
            style={{ ...inputStyle, width: "300px" }}
            value={aiConfig.apiKey}
            onChange={(e) => setAiConfig({ apiKey: e.target.value })}
            placeholder="sk-..."
            disabled={!aiConfig.enabled}
          />
        </Row>

        <div
          className="settings-row"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginTop: "16px",
          }}
        >
          <span className="settings-row-label" style={{ marginBottom: "8px" }}>
            System Prompt
          </span>
          <textarea
            style={{
              ...inputStyle,
              width: "100%",
              minHeight: "100px",
              resize: "vertical",
            }}
            value={aiConfig.systemPrompt}
            onChange={(e) => setAiConfig({ systemPrompt: e.target.value })}
            disabled={!aiConfig.enabled}
          />
        </div>

        <Row label="Embedding Model">
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Xenova/all-MiniLM-L6-v2 (Local WebAssembly)
          </span>
        </Row>
      </Section>
    </div>
  );
}
