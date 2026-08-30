import { fileSystem as fileService } from "../infrastructure/NeutralinoFileSystem.js";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository.js";
import { useStore as useWorkspaceStore } from "../store/index.js";
import { logger } from "../infrastructure/Logger.js";

export const tagService = {
  /**
   * Scans all markdown files for frontmatter tags or inline #tags.
   * Returns a map of Tag -> Array of Notes.
   */
  async getAllTags() {
    const { workspaceMode, workspaceRoot, currentFolder } =
      useWorkspaceStore.getState();
    const searchRoot = workspaceRoot || currentFolder;
    if (!searchRoot) return {};

    try {
      let filesToScan = [];

      if (workspaceMode === "vault") {
        filesToScan = await fileService.readDirectory(`${searchRoot}/notes`);
      } else {
        const entries = await fileService.readDirectory(searchRoot);
        filesToScan = entries.filter(
          (e) => e.type === "FILE" && e.entry.endsWith(".md"),
        );
      }

      const tagsMap = {};
      const hashTagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;

      for (const file of filesToScan) {
        if (file.type !== "FILE" || !file.entry.endsWith(".md")) continue;

        let filePath;
        let logicalName;

        if (workspaceMode === "vault") {
          filePath = `${searchRoot}/notes/${file.entry}`;
          const noteId = file.entry.replace(".md", "");
          const dbRes = vaultRepository.db?.exec(
            "SELECT name FROM notes WHERE id=?",
            [noteId],
          );
          logicalName = dbRes?.[0]?.values?.[0]?.[0] || file.entry;
        } else {
          filePath = `${searchRoot}/${file.entry}`;
          logicalName = file.entry.replace(".md", "");
        }

        const content = await fileService.readFile(filePath);
        const tagsForFile = new Set();

        // 1. Parse frontmatter tags
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        if (fmMatch) {
          const yamlString = fmMatch[1];
          yamlString.split("\n").forEach((line) => {
            const idx = line.indexOf(":");
            if (idx > 0 && line.slice(0, idx).trim() === "tags") {
              const val = line.slice(idx + 1).trim();
              if (val.startsWith("[") && val.endsWith("]")) {
                const arr = val
                  .slice(1, -1)
                  .split(",")
                  .map((t) => t.trim());
                arr.forEach((t) => {
                  if (t) tagsForFile.add(t);
                });
              } else {
                tagsForFile.add(val);
              }
            }
          });
        }

        // 2. Parse inline #tags
        let match;
        while ((match = hashTagRegex.exec(content)) !== null) {
          tagsForFile.add(match[1]);
        }

        // Add to global map
        const noteRef = { id: file.entry, name: logicalName, path: filePath };
        tagsForFile.forEach((t) => {
          if (!tagsMap[t]) tagsMap[t] = [];
          tagsMap[t].push(noteRef);
        });
      }

      return tagsMap;
    } catch (err) {
      logger.error("Failed to fetch tags", err);
      return {};
    }
  },
};
