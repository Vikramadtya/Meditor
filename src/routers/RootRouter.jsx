import React from "react";
import { useStore } from "../core/store/index";

import WelcomeScreen from "../components/layout/WelcomeScreen";
import WorkspaceRouter from "./WorkspaceRouter";

/**
 * The top-level router that determines whether to show the Welcome screen
 * or route the user into an active workspace.
 */
export default function RootRouter() {
  const { currentFolder } = useStore();

  if (!currentFolder) {
    return <WelcomeScreen />;
  }

  return <WorkspaceRouter />;
}
