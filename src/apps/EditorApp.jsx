import React from "react";
import EditorPane from "../domains/editor/presentation/components/EditorPane";
import FloatingActionBar from "../domains/workspace/presentation/components/FloatingActionBar";

/**
 * The main application component when in Folder mode.
 * Renders the sidebar and editor panes.
 *
 * @returns {import("react").JSX.Element} The rendered component.
 */
export default function EditorApp() {
  return (
    <>
      <EditorPane />
      <FloatingActionBar />
    </>
  );
}
