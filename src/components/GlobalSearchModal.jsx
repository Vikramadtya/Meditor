import React, { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useDocumentStore } from "../store/documentStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { fileService } from "../services/fileService";

export default function GlobalSearchModal() {
  const { isGlobalSearchOpen, setGlobalSearchOpen } = useUIStore();
  const { openFile } = useDocumentStore();
  const { currentFolder } = useWorkspaceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isGlobalSearchOpen) {
      setSearchQuery("");
      setResults([]);
      return;
    }
  }, [isGlobalSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim() || !currentFolder) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Debounce search
    const timer = setTimeout(async () => {
      try {
        const matches = await fileService.searchInFiles(
          currentFolder,
          searchQuery,
        );
        setResults(matches);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentFolder]);

  const handleResultClick = (filePath) => {
    openFile(filePath);
    setGlobalSearchOpen(false);
  };

  return (
    <div
      className={`modal-overlay cmd-palette ${isGlobalSearchOpen ? "open" : ""}`}
      onClick={() => setGlobalSearchOpen(false)}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <Search size={18} color="var(--text-secondary)" />
          <input
            autoFocus={isGlobalSearchOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in all files..."
            className="cmd-palette-input"
          />
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto", padding: "8px" }}>
          {isSearching && (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Searching...
            </div>
          )}
          {!isSearching && searchQuery && results.length === 0 && (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              No results found
            </div>
          )}
          {!isSearching &&
            results.map((res, i) => {
              const relativePath = res.filePath.replace(
                currentFolder + "/",
                "",
              );
              return (
                <div
                  key={i}
                  className="cmd-palette-item"
                  onClick={() => handleResultClick(res.filePath)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      color: "var(--accent)",
                    }}
                  >
                    <FileText size={14} /> {relativePath}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                      lineHeight: "1.4",
                    }}
                  >
                    {res.snippet}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
