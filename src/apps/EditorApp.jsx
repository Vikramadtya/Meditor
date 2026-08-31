import React from "react";
import Sidebar from "../components/layout/Sidebar";
import EditorPane from "../components/editor/EditorPane";
import FloatingActionBar from "../components/layout/FloatingActionBar";

/**
 * The main application component when in Folder mode.
 * Renders the sidebar and editor panes.
 *
 * @returns {import("react").JSX.Element} The rendered component.
 */
export default function EditorApp() {
  return (
    <>
      <Sidebar />
      <EditorPane />
      <FloatingActionBar />
    </>
  );
}
