import "construct-style-sheets-polyfill";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./core/ui/ErrorBoundary";
import "./styles/global.css";
import { fileSystem as fileService } from "./domains/workspace/infrastructure/NeutralinoFileSystem";
import { vaultService } from "./domains/vault/application/VaultService";
import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

import { telemetryRepository } from "./core/infrastructure/SqliteTelemetryRepository";
import { Observability } from "./core/infrastructure/Observability";

fileService.initApp();

// Initialize the SQLite runtime globally for the vault service and telemetry
const sqlPromise = initSqlJs({ locateFile: () => wasmUrl });

// Setup Telemetry DB
sqlPromise
  .then(async (SQL) => {
    let dbBuf;
    try {
      const stats = await window.Neutralino.filesystem.getStats(
        ".tmp/observability.db",
      );
      const arr = await window.Neutralino.filesystem.readBinaryFile(
        ".tmp/observability.db",
      );
      dbBuf = new Uint8Array(arr);
    } catch (e) {
      // New db
    }
    const db = dbBuf ? new SQL.Database(dbBuf) : new SQL.Database();
    telemetryRepository.attach(db);
    Observability.attachRepository(telemetryRepository);
    window.__TELEMETRY_REPO__ = telemetryRepository;
    window.Observability = Observability;
  })
  .catch(console.error);

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
