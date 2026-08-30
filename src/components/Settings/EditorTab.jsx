import React from "react";
import { Section, Row, ToggleRow } from "./SettingsUI";
import { selectStyle } from "./SettingsStyles";
import { useSettingsStore } from "../../store/settingsStore";

export default function EditorTab() {
  const { editorConfig, setEditorConfig } = useSettingsStore();

  return (
    <>
      <Section label="Saving & Formatting">
        <Row
          label="Auto-Save Strategy"
          description="When should Meditor automatically save your files?"
        >
          <select
            style={{ ...selectStyle, maxWidth: "200px" }}
            value={editorConfig.autoSaveMode}
            onChange={(e) => setEditorConfig({ autoSaveMode: e.target.value })}
          >
            <option value="delay">On typing delay (2 seconds)</option>
            <option value="blur">On blur (clicking away)</option>
            <option value="manual">Manual only (Cmd+S)</option>
          </select>
        </Row>

        <ToggleRow
          label="Auto-Format on Save (Prettier)"
          checked={editorConfig.autoFormatOnSave}
          onChange={(checked) => setEditorConfig({ autoFormatOnSave: checked })}
        />
      </Section>
    </>
  );
}
