import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./core/ui/ErrorBoundary";
import "./styles/global.css";
import { fileSystem as fileService } from "./domains/workspace/infrastructure/NeutralinoFileSystem";

fileService.initApp();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
