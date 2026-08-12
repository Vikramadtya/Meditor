import React from "react";
import { Section, Row, ToggleRow, selectStyle } from "./SettingsUI";
import { useSettingsStore } from "../../store/settingsStore";

export default function MarkdownTab() {
  const { mdConfig, setMdConfig } = useSettingsStore();

  return (
    <Section label="Markdown Engine">
      <Row label="Dialect">
        <select
          value={mdConfig.dialect}
          onChange={(e) => setMdConfig({ dialect: e.target.value })}
          style={selectStyle}
        >
          <option value="gfm">GitHub Flavored (GFM)</option>
          <option value="commonmark">CommonMark (Strict)</option>
        </select>
      </Row>
      <ToggleRow
        label="Render HTML Tags"
        checked={mdConfig.allowHtml}
        onChange={(v) => setMdConfig({ allowHtml: v })}
      />
      <ToggleRow
        label="Auto-linkify URLs"
        checked={mdConfig.linkify}
        onChange={(v) => setMdConfig({ linkify: v })}
      />
      <ToggleRow
        label="Smart Typography"
        checked={mdConfig.typographer}
        onChange={(v) => setMdConfig({ typographer: v })}
      />
      <ToggleRow
        label="Vim Keybindings"
        checked={mdConfig.vimMode}
        onChange={(v) => setMdConfig({ vimMode: v })}
      />
      <Row label="Image Save Path">
        <input
          type="text"
          value={mdConfig.imageSavePath || "./images"}
          onChange={(e) => setMdConfig({ imageSavePath: e.target.value })}
          style={{ ...selectStyle, width: "130px" }}
        />
      </Row>
    </Section>
  );
}
