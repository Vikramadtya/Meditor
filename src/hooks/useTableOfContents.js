import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/index";
import { searchService } from "../application/editor/SearchService.js";

export function useTableOfContents() {
  const {
    isTocOpen,
    markdown,
    currentFilePath,
    fileName,
    activeVaultItem,
    workspaceMode,
    setTagModalOpen,
  } = useStore();

  const [activeTab, setActiveTab] = useState("outline"); // "outline" or "stats"
  const [backlinks, setBacklinks] = useState([]);

  useEffect(() => {
    if (isTocOpen && activeTab === "stats" && fileName) {
      (async () => {
        const state = useStore.getState();
        return searchService.getBacklinks(
          fileName,
          state.workspaceMode,
          state.workspaceRoot || state.currentFolder,
        );
      })().then((links) => {
        setBacklinks(links);
      });
    }
  }, [isTocOpen, activeTab, fileName]);

  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200);

    const tags = [];
    if (workspaceMode === "vault" && activeVaultItem && activeVaultItem.tags) {
      activeVaultItem.tags
        .split(",")
        .filter(Boolean)
        .forEach((t) => {
          if (!tags.includes(t)) tags.push(t);
        });
    }

    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      if (!tags.includes(match[1])) tags.push(match[1]);
    }

    return { words, chars, readTime, tags };
  }, [markdown, workspaceMode, activeVaultItem]);

  const handleScroll = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return {
    isTocOpen,
    activeTab,
    setActiveTab,
    backlinks,
    stats,
    handleScroll,
    setTagModalOpen,
    workspaceMode,
  };
}
