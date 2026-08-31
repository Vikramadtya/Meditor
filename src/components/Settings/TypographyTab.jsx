import React from "react";
import { Section, Row } from "./SettingsUI";
import { selectStyle, rangeStyle, chipStyle } from "./SettingsStyles";
import { useSettingsStore, PROSE_FONTS } from "../../store/settingsStore";

/**
 * Settings tab for configuring typography preferences.
 * Provides controls for prose font, sizes, line height, prose width, heading scales, and table styles.
 *
 * @returns {React.ReactElement} The typography settings tab component.
 */
export default function TypographyTab() {
  const { typography, setTypography } = useSettingsStore();

  return (
    <>
      <Section label="Typography">
        <Row label="Prose Font">
          <select
            value={typography.proseFont}
            onChange={(e) => setTypography({ proseFont: e.target.value })}
            style={selectStyle}
          >
            {PROSE_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Row>

        <Row label={`Font Size (${typography.fontSize}px)`}>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={typography.fontSize}
            onChange={(e) =>
              setTypography({ fontSize: Number(e.target.value) })
            }
            style={rangeStyle}
          />
        </Row>

        <Row label={`Line Height (${typography.lineHeight}×)`}>
          <input
            type="range"
            min={1.2}
            max={2.2}
            step={0.05}
            value={typography.lineHeight}
            onChange={(e) =>
              setTypography({ lineHeight: Number(e.target.value) })
            }
            style={rangeStyle}
          />
        </Row>

        <Row
          label={`Prose Width (${typography.proseWidth === 0 ? "Full" : typography.proseWidth + "px"})`}
        >
          <input
            type="range"
            min={0}
            max={1200}
            step={40}
            value={typography.proseWidth}
            onChange={(e) =>
              setTypography({ proseWidth: Number(e.target.value) })
            }
            style={rangeStyle}
          />
        </Row>
      </Section>

      <Section label="Heading Scale">
        {[
          { key: "h1Scale", label: "H1" },
          { key: "h2Scale", label: "H2" },
          { key: "h3Scale", label: "H3" },
          { key: "h4Scale", label: "H4" },
        ].map(({ key, label }) => (
          <Row key={key} label={`${label} (${typography[key]}×)`}>
            <input
              type="range"
              min={0.9}
              max={3.0}
              step={0.05}
              value={typography[key]}
              onChange={(e) => setTypography({ [key]: Number(e.target.value) })}
              style={rangeStyle}
            />
          </Row>
        ))}
      </Section>

      <Section label="Table Style">
        <Row label="Style">
          <div style={{ display: "flex", gap: "8px" }}>
            {["minimal", "bordered", "striped"].map((s) => (
              <button
                key={s}
                onClick={() => setTypography({ tableStyle: s })}
                style={{
                  ...chipStyle,
                  background:
                    typography.tableStyle === s
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.05)",
                  color:
                    typography.tableStyle === s
                      ? "#fff"
                      : "var(--text-secondary)",
                }}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </Row>
      </Section>
    </>
  );
}
