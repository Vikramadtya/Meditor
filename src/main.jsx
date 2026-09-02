import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./core/ui/ErrorBoundary";
import "./styles/global.css";
import { fileSystem as fileService } from "./domains/workspace/infrastructure/NeutralinoFileSystem";
import { vaultService } from "./domains/vault/application/VaultService";
import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

fileService.initApp();

// Initialize the SQLite runtime globally for the vault service
const sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
vaultService.init(sqlPromise).catch((err) => {
  console.error("Failed to initialize Vault SQLite runtime:", err);
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
