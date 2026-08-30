import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import "./styles/global.css";
import { fileSystem as fileService } from "./infrastructure/NeutralinoFileSystem";

fileService.initApp();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
