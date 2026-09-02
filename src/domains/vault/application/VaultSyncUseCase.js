import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";

function extractFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?(?:\n|$)/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split("\n");
  let currentKey = null;

  for (let line of lines) {
    if (line.trim().startsWith("- ") && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(line.replace("- ", "").trim());
    } else if (line.includes(":")) {
      const [k, ...v] = line.split(":");
      currentKey = k.trim();
      const val = v.join(":").trim();
      if (val) fm[currentKey] = val;
    }
  }
  return fm;
}

export async function syncVaultCommand(vaultPath, log) {
  log.info("Starting background vault sync...");
  const activeIds = new Set();
  const activeContainers = new Set();

  const walk = async (relDir) => {
    const full = `${vaultPath}/${relDir}`;
    let entries = [];
    try {
      entries = await window.Neutralino.filesystem.readDirectory(full);
    } catch (e) {
      return;
    }

    for (const e of entries) {
      if (
        e.entry === "." ||
        e.entry === ".." ||
        e.entry === ".metadata" ||
        e.entry === ".DS_Store"
      )
        continue;

      const childRel = `${relDir}/${e.entry}`;
      if (e.type === "DIRECTORY") {
        let meta = { id: childRel, type: "container", children_order: [] };
        try {
          const metaStr = await fileSystem.readFile(
            `${full}/${e.entry}/.metadata`,
          );
          meta = JSON.parse(metaStr);
        } catch (e) {
          log.debug("Ignored expected file read exception", e);
        }

        vaultRepository.upsertContainer({
          id: meta.id,
          path: childRel,
          name: e.entry,
          metadata: meta,
        });
        activeContainers.add(meta.id);
        await walk(childRel);
      } else if (e.entry.endsWith(".md")) {
        try {
          const content = await fileSystem.readFile(`${full}/${e.entry}`);
          const fm = extractFrontmatter(content);
          if (fm && fm.id) {
            vaultRepository.upsertNote({
              id: fm.id,
              path: childRel,
              name: e.entry.replace(/\.md$/, ""),
              tags: Array.isArray(fm.tags) ? fm.tags.join(",") : fm.tags || "",
              is_favorite: fm.is_favorite ? 1 : 0,
              updated_at: Date.now(),
            });
            activeIds.add(fm.id);
          }
        } catch (err) {
          log.warn(`Failed to sync note ${childRel}`, err);
        }
      }
    }
  };

  await walk("notes");

  const allNotes = vaultRepository._queryAll("SELECT id FROM notes");
  for (const n of allNotes) {
    if (!activeIds.has(n.id)) {
      vaultRepository.deleteNoteById(n.id);
    }
  }

  log.info("Background vault sync complete.");
}
