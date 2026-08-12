import React from "react";
import { Moon, Sun } from "lucide-react";
import { Section, Row, ThemeBtn } from "./SettingsUI";
import { useUIStore } from "../../store/uiStore";

export default function AppearanceTab() {
  const { theme, setTheme } = useUIStore();

  return (
    <Section label="Appearance">
      <Row label="Theme">
        <div style={{ display: "flex", gap: "8px" }}>
          <ThemeBtn
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
            icon={<Moon size={14} />}
            label="Dark"
          />
          <ThemeBtn
            active={theme === "light"}
            onClick={() => setTheme("light")}
            icon={<Sun size={14} />}
            label="Light"
          />
        </div>
      </Row>
    </Section>
  );
}
