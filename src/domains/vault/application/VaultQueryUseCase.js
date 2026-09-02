import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";

export async function getFolderContentsCommand(vaultPath, relPath, log) {
  if (!vaultPath) return [];
  const fullPath = `${vaultPath}/${relPath}`;
  try {
    const entries = await window.Neutralino.filesystem.readDirectory(fullPath);
    const results = [];

    for (const e of entries) {
      if (
        e.entry === "." ||
        e.entry === ".." ||
        e.entry === ".metadata" ||
        e.entry === ".DS_Store"
      )
        continue;

      const childRelPath = `${relPath}/${e.entry}`;
      if (e.type === "DIRECTORY") {
        let metadata = {};
        let itemCount = 0;
        try {
          const metaStr = await fileSystem.readFile(
            `${fullPath}/${e.entry}/.metadata`,
          );
          metadata = JSON.parse(metaStr);
        } catch (e) {
          log.debug("Ignored expected file read exception", e);
        }

        try {
          const subEntries = await window.Neutralino.filesystem.readDirectory(
            `${fullPath}/${e.entry}`,
          );
          itemCount = subEntries.filter(
            (se) =>
              se.entry !== "." && se.entry !== ".." && se.entry !== ".metadata",
          ).length;
        } catch (e) {
          log.debug("Ignored expected file read exception", e);
        }

        results.push({
          id: metadata.id || childRelPath,
          name: e.entry,
          type: "container",
          path: childRelPath,
          metadata,
          itemCount,
        });
      } else if (e.entry.endsWith(".md")) {
        const name = e.entry.replace(/\.md$/, "");
        const cached = vaultRepository.getNoteByPath(childRelPath);
        results.push({
          id: cached ? cached.id : childRelPath,
          name,
          type: "note",
          path: childRelPath,
        });
      }
    }

    try {
      const parentMeta = await fileSystem.readFile(`${fullPath}/.metadata`);
      const { children_order } = JSON.parse(parentMeta);
      if (children_order && Array.isArray(children_order)) {
        results.sort((a, b) => {
          const idxA = children_order.indexOf(a.id);
          const idxB = children_order.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
      } else {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (_) {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  } catch (e) {
    log.error(`Failed to get contents for ${relPath}`, e);
    return [];
  }
}
