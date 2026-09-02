import React from "react";
import { Toaster } from "react-hot-toast";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSystemEffects } from "./hooks/useSystemEffects";
import Titlebar from "./domains/workspace/presentation/components/Titlebar";
import ModalManager from "./components/modals/ModalManager";
import RootRouter from "./routers/RootRouter";
import "./styles/Modals.css";
function App() {
  // Bind global side effects
  useKeyboardShortcuts();
  useSystemEffects();
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--bg-glass)",
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(16px)",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}
      />

      <Titlebar />
      <div className="app-container">
        <RootRouter />
      </div>

      <ModalManager />
    </>
  );
}
export default App;
