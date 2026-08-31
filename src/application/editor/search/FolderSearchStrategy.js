import { fileSystem as fileService } from "../../../infrastructure/NeutralinoFileSystem.js";

/**
 * Search strategy for standard Folder Mode.
 * Executes expensive disk-crawling operations since no DB exists.
 */
export class FolderSearchStrategy {
  /**
   * @param {string} searchRoot - The root directory of the workspace.
   */
  constructor(searchRoot) {
    this.searchRoot = searchRoot;
  }

  /**
   * Recursively reads all markdown files on disk to find backlinks.
   * @param {string} targetNoteName - The target note to look for.
   * @returns {Promise<Array<{file: string, excerpt: string}>>}
   */
  async getBacklinks(targetNoteName) {
    const backlinks = [];
    const linkRegex = /\[\[(.*?)(?:\|.*?)?\]\]/g;
    const targetLower = targetNoteName.toLowerCase();

    const entries = await fileService.readDirectory(this.searchRoot);
    const filesToScan = entries.filter(
      (e) => e.type === "FILE" && e.entry.endsWith(".md"),
    );

    for (const file of filesToScan) {
      const logicalName = file.entry.replace(".md", "");
      if (logicalName === targetNoteName) continue;

      const filePath = `${this.searchRoot}/${file.entry}`;
      try {
        const content = await fileService.readFile(filePath);
        let match;
        let found = false;
        while ((match = linkRegex.exec(content)) !== null) {
          if (match[1].toLowerCase() === targetLower) {
            found = true;
            break;
          }
        }
        if (found)
          backlinks.push({ id: file.entry, name: logicalName, path: filePath });
      } catch (err) {}
    }
    return backlinks;
  }

  /**
   * Recursively reads and parses all markdown frontmatter on disk to aggregate tags.
   * @returns {Promise<Record<string, Array<{file: string, line: string}>>>}
   */
  async getAllTags() {
    const entries = await fileService.readDirectory(this.searchRoot);
    const filesToScan = entries.filter(
      (e) => e.type === "FILE" && e.entry.endsWith(".md"),
    );

    const tagsMap = {};
    const hashTagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;

    for (const file of filesToScan) {
      const filePath = `${this.searchRoot}/${file.entry}`;
      const logicalName = file.entry.replace(".md", "");

      const content = await fileService.readFile(filePath);
      const tagsForFile = new Set();

      const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      if (fmMatch) {
        fmMatch[1].split("\n").forEach((line) => {
          const idx = line.indexOf(":");
          if (idx > 0 && line.slice(0, idx).trim() === "tags") {
            const val = line.slice(idx + 1).trim();
            if (val.startsWith("[") && val.endsWith("]")) {
              val
                .slice(1, -1)
                .split(",")
                .forEach((t) => {
                  if (t.trim()) tagsForFile.add(t.trim());
                });
            } else {
              tagsForFile.add(val);
            }
          }
        });
      }

      let match;
      while ((match = hashTagRegex.exec(content)) !== null) {
        tagsForFile.add(match[1]);
      }

      const noteRef = { id: file.entry, name: logicalName, path: filePath };
      tagsForFile.forEach((t) => {
        if (!tagsMap[t]) tagsMap[t] = [];
        tagsMap[t].push(noteRef);
      });
    }
    return tagsMap;
  }
}
