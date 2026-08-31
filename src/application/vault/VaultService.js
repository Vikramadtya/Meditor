import { fileSystem } from "../../infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { Logger } from "../../infrastructure/Logger";

class VaultService {
  constructor() {
    this._log = Logger.forContext("VaultService");
    this.vaultPath = null;
    this._sqlPromise = null;
    this.isSyncing = false;
  }

  async init(sqlPromise) {
    this._sqlPromise = sqlPromise;
    this._log.info("Initialized with SQL instance");
  }

  async loadVault(folderPath) {
    try {
      const SQL = await this._sqlPromise;
      let buffer;
      try {
        buffer = await fileSystem.readBinaryFile(`${folderPath}/vault.db`);
      } catch (e) {
        this._log.warn("No existing vault.db found, creating new.");
        const db = new SQL.Database();
        const exported = db.export();
        await fileSystem.writeBinaryFile(`${folderPath}/vault.db`, exported);
        buffer = exported;
      }

      const db = new SQL.Database(new Uint8Array(buffer));
      vaultRepository.attach(db);
      this.vaultPath = folderPath;

      await this.saveVault();
      this._log.info(`Loaded vault from ${folderPath}`);

      // Kick off background sync
      this.syncVault().catch((e) => this._log.error("Sync failed", e));
      return true;
    } catch (error) {
      this._log.error("Failed to load vault", error);
      return false;
    }
  }

  async saveVault() {
    if (!this.vaultPath) return;
    try {
      const data = vaultRepository.export();
      await fileSystem.writeBinaryFile(`${this.vaultPath}/vault.db`, data);
    } catch (e) {
      this._log.error("Failed to save vault.db", e);
    }
  }

  /**
   * Lazily loads contents of a folder inside the vault.
   * @param {string} relPath - Path relative to vault root (e.g., 'notes' or 'notes/Books')
   */
  async getFolderContents(relPath = "notes") {
    if (!this.vaultPath) return [];
    try {
      const fullPath = `${this.vaultPath}/${relPath}`;
      const entries =
        await window.Neutralino.filesystem.readDirectory(fullPath);

      const results = [];
      for (const e of entries) {
        if (e.entry === "." || e.entry === ".." || e.entry === ".metadata")
          continue;

        const childRelPath = `${relPath}/${e.entry}`;

        if (e.type === "DIRECTORY") {
          let metadata = {};
          try {
            const metaContent = await fileSystem.readFile(
              `${fullPath}/${e.entry}/.metadata`,
            );
            metadata = JSON.parse(metaContent);
          } catch (_) {}

          results.push({
            id: metadata.id || childRelPath,
            name: e.entry,
            type: "container",
            path: childRelPath,
            metadata,
          });
        } else if (e.entry.endsWith(".md")) {
          // It's a note. Get its ID from DB cache for fast render, or parse if missing.
          const name = e.entry.replace(/\.md$/, "");
          const cached = vaultRepository.getNoteByPath(childRelPath);
          results.push({
            id: cached ? cached.id : childRelPath, // fallback to path if not synced yet
            name,
            type: "note",
            path: childRelPath,
          });
        }
      }

      // Sort by container metadata if available
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
      this._log.error(`Failed to get contents for ${relPath}`, e);
      return [];
    }
  }

  /**
   * Background task: scans the `notes/` directory for any changes and updates the SQLite index.
   */
  async syncVault() {
    if (!this.vaultPath || this.isSyncing) return;
    this.isSyncing = true;
    this._log.info("Starting background vault sync...");

    try {
      const activeIds = new Set();
      const activeContainers = new Set();

      const walk = async (relDir) => {
        const full = `${this.vaultPath}/${relDir}`;
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
            // Container
            let meta = { id: childRel, type: "container", children_order: [] };
            try {
              const metaStr = await fileSystem.readFile(
                `${full}/${e.entry}/.metadata`,
              );
              meta = JSON.parse(metaStr);
            } catch (_) {} // fine, we'll just use path as ID

            vaultRepository.upsertContainer({
              id: meta.id,
              path: childRel,
              name: e.entry,
              metadata: meta,
            });
            activeContainers.add(meta.id);
            await walk(childRel);
          } else if (e.entry.endsWith(".md")) {
            // Note
            try {
              const content = await fileSystem.readFile(`${full}/${e.entry}`);
              const fm = this.extractFrontmatter(content);
              if (fm && fm.id) {
                vaultRepository.upsertNote({
                  id: fm.id,
                  path: childRel,
                  name: e.entry.replace(/\.md$/, ""),
                  tags: Array.isArray(fm.tags)
                    ? fm.tags.join(",")
                    : fm.tags || "",
                  is_favorite: fm.is_favorite ? 1 : 0,
                  updated_at: Date.now(), // Ideally use OS stat, but fine for now
                });
                activeIds.add(fm.id);
              }
            } catch (err) {
              this._log.warn(`Failed to sync note ${childRel}`, err);
            }
          }
        }
      };

      await walk("notes");

      // Cleanup deleted notes
      const allNotes = vaultRepository._queryAll("SELECT id FROM notes");
      for (const n of allNotes) {
        if (!activeIds.has(n.id)) {
          vaultRepository.deleteNoteById(n.id);
        }
      }

      await this.saveVault();
      this._log.info("Background vault sync complete.");
    } catch (e) {
      this._log.error("Error during syncVault", e);
    } finally {
      this.isSyncing = false;
    }
  }

  extractFrontmatter(content) {
    if (!content.startsWith("---")) return null;
    const match = content.match(/^---\n([\s\S]*?)\n---/);
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

  // Create Operations
  async createContainer(parentRelPath, name) {
    const newRel = `${parentRelPath}/${name}`;
    const full = `${this.vaultPath}/${newRel}`;
    await window.Neutralino.filesystem.createDirectory(full);

    const id = crypto.randomUUID();
    const meta = { id, type: "container", children_order: [] };
    await fileSystem.writeFile(
      `${full}/.metadata`,
      JSON.stringify(meta, null, 2),
    );

    vaultRepository.upsertContainer({
      id,
      path: newRel,
      name,
      metadata: meta,
    });
    await this.saveVault();
    return meta;
  }

  async createNote(parentRelPath, name) {
    const id = crypto.randomUUID();
    const newRel = `${parentRelPath}/${name}.md`;
    const full = `${this.vaultPath}/${newRel}`;

    const fm = `---\nid: ${id}\ntags:\n---\n\n# ${name}\n`;
    await fileSystem.writeFile(full, fm);

    vaultRepository.upsertNote({
      id,
      path: newRel,
      name,
      tags: "",
      updated_at: Date.now(),
    });
    await this.saveVault();
    return { id, name, path: newRel, type: "note" };
  }

  async deleteItem(type, id, relPath, hard = true) {
    if (hard && relPath) {
      const full = `${this.vaultPath}/${relPath}`;
      if (type === "note") {
        await fileSystem.removeFile(full);
        vaultRepository.deleteNoteById(id);
      } else {
        await fileSystem.removeDirectory(full);
        vaultRepository.deleteContainerById(id);
      }
      await this.saveVault();
    }
  }

  getNotePath(noteId) {
    const n = vaultRepository.getNoteById(noteId);
    if (n && n.path && this.vaultPath) {
      return `${this.vaultPath}/${n.path}`;
    }
    return null;
  }

  async updateNoteSRS(noteId, ease, interval, nextReview) {
    const n = vaultRepository.getNoteById(noteId);
    if (!n) return;
    vaultRepository._run(
      "UPDATE notes SET srs_ease=?, srs_interval=?, srs_next_review=? WHERE id=?",
      [ease, interval, nextReview, noteId],
    );
    await this.saveVault();
  }
}

export const vaultService = new VaultService();
