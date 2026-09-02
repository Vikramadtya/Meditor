import React from "react";
import { Section } from "./SettingsUI";
import {
  Info,
  BookOpen,
  Layers,
  GitBranch,
  Search,
  Keyboard,
} from "lucide-react";

function HelpItem({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h4
        style={{
          margin: "0 0 6px 0",
          fontSize: "14px",
          color: "var(--text-primary)",
          fontWeight: 600,
        }}
      >
        {label}
      </h4>
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
        }}
      >
        {children}
      </p>
    </div>
  );
}

export default function HelpTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Section label="App Capabilities" icon={<Info size={16} />}>
        <HelpItem label="Vaults & Local Storage">
          Meditor operates on local folders (Vaults). When you open a vault, it
          indexes your Markdown files into a local SQLite database for
          lightning-fast search, organization, and metadata tracking (like
          flashcards). Everything remains as standard `.md` files on your hard
          drive.
        </HelpItem>
        <HelpItem label="Collections & Notes">
          You can organize notes into nested Collections (folders). Use the{" "}
          <b>+</b> icon in the sidebar or the "Add New" button in the collection
          dashboard to create new items.
        </HelpItem>
        <HelpItem label="Git Version Control">
          Meditor has built-in Git integration. If your vault is initialized as
          a Git repository, Meditor will automatically track history. You can
          view the diff history of any note by clicking the <b>History</b>{" "}
          button in the bottom floating action bar.
        </HelpItem>
        <HelpItem label="Tags & Flashcards">
          Click the <b>Tags/Meta</b> button in the bottom floating action bar of
          any note to add custom tags and an <b>Active Recall Flashcard</b>{" "}
          (Question & Answer) to the note. These are saved into the SQLite index
          and won't clutter your raw Markdown file!
        </HelpItem>
        <HelpItem label="Global Search">
          Use the <b>Search</b> bar at the top of the sidebar (or press{" "}
          <code>Cmd+P</code> / <code>Ctrl+P</code>) to instantly search through
          all notes in your vault by name or content.
        </HelpItem>
      </Section>

      <Section label="Markdown Guide" icon={<BookOpen size={16} />}>
        <div style={{ padding: "0 12px" }}>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "16px",
              lineHeight: 1.5,
            }}
          >
            Meditor supports standard GitHub Flavored Markdown (GFM) along with
            several powerful extensions for knowledge management.
          </p>

          <div style={{ display: "grid", gap: "12px" }}>
            <GuideCard
              label="Admonitions / Callouts"
              code={`!!! info "Custom Title"\n    This is an info box.\n    Indent content by 4 spaces.\n\n??? tip "Click to expand"\n    This is a hidden collapsible block.`}
              desc="Create styled alert boxes. Supported types: note, info, tip, success, warning, danger, bug, quote, abstract."
            />

            <GuideCard
              label="Mermaid Diagrams"
              code={"```mermaid\ngraph TD;\n    A-->B;\n```"}
              desc="Render flowcharts, sequence diagrams, and more using Mermaid.js syntax."
            />

            <GuideCard
              label="Math & LaTeX (KaTeX)"
              code={`Inline math: $E=mc^2$\n\nBlock math:\n$$\n\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$`}
              desc="Render complex mathematical formulas perfectly."
            />

            <GuideCard
              label="Highlights & Formatting"
              code={`==This text is highlighted==\n~~Strikethrough~~\n**Bold** and *Italic*`}
              desc="Use standard formatting plus `==` for yellow background highlights."
            />

            <GuideCard
              label="Wikilinks"
              code={`[[Page Name]]\n[[Page Name|Custom Link Text]]`}
              desc="Easily link to other notes in your vault using double brackets."
            />

            <GuideCard
              label="Task Lists"
              code={`- [ ] Unfinished task\n- [x] Completed task`}
              desc="Interactive checkboxes that you can click right in the preview pane."
            />

            <GuideCard
              label="Tabs"
              code={`=== "Tab 1"\n    Content for Tab 1.\n=== "Tab 2"\n    Content for Tab 2.`}
              desc="Create MkDocs-style horizontal tabs to organize related content."
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

function GuideCard({ title, code, desc }) {
  return (
    <div
      style={{
        border: "1px solid var(--glass-border)",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <h4
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
        }}
      >
        {desc}
      </p>
      <pre
        style={{
          margin: 0,
          padding: "12px",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "6px",
          border: "1px solid var(--glass-border)",
          fontSize: "13px",
          fontFamily: "var(--font-mono)",
          color: "var(--text-primary)",
          overflowX: "auto",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
