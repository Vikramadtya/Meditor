import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";

export async function createContainerCommand(vaultPath, parentRelPath, name) {
  const newRel = `${parentRelPath}/${name}`;
  const full = `${vaultPath}/${newRel}`;
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
  vaultRepository.logAuditAction(
    "CREATE_COLLECTION",
    `Created collection "${name}"`,
  );
  return meta;
}

export async function createNoteCommand(vaultPath, parentRelPath, name) {
  const id = crypto.randomUUID();
  const newRel = `${parentRelPath}/${name}.md`;
  const full = `${vaultPath}/${newRel}`;

  const fm = `---\nid: ${id}\ntags:\n---\n\n# ${name}\n`;
  await fileSystem.writeFile(full, fm);

  vaultRepository.upsertNote({
    id,
    path: newRel,
    name,
    tags: "",
    updated_at: Date.now(),
  });
  vaultRepository.logAuditAction("CREATE_NOTE", `Created note "${name}"`);
  return { id, name, path: newRel, type: "note" };
}

export async function deleteItemCommand(
  vaultPath,
  type,
  id,
  relPath,
  hard = false,
) {
  if (type === "note") {
    if (!hard && relPath) {
      // Soft delete (move to .trash folder)
      try {
        const originalFull = `${vaultPath}/${relPath}`;
        const trashDir = `${vaultPath}/.trash`;
        await fileSystem.createDirectory(trashDir).catch(() => {});
        const trashFull = `${trashDir}/${id}.md`;
        await window.Neutralino.filesystem.move(originalFull, trashFull);
      } catch (err) {
        log.error("Could not move file to trash physically", err);
      }
      vaultRepository._run("UPDATE notes SET is_deleted=1 WHERE id=?", [id]);
      vaultRepository.logAuditAction(
        "SOFT_DELETE_NOTE",
        `Moved note to trash: ${relPath}`,
      );
    } else if (hard) {
      // Hard delete
      let contentToDelete = null;
      if (relPath) {
        const full = `${vaultPath}/${relPath}`;
        try {
          contentToDelete = await fileSystem.readFile(full);
          await fileSystem.removeFile(full);
        } catch (e) {}
      } else {
        // Deleting from trash where relPath is unknown/irrelevant
        const trashFull = `${vaultPath}/.trash/${id}.md`;
        try {
          contentToDelete = await fileSystem.readFile(trashFull);
          await fileSystem.removeFile(trashFull);
        } catch (e) {}
      }

      // Cleanup assets if any
      if (contentToDelete) {
        const assetRegex = /\]\((?:\.\/)?\.meditor\/assets\/([^)]+)\)/g;
        let match;
        while ((match = assetRegex.exec(contentToDelete)) !== null) {
          const assetName = match[1];
          const assetPath = `${vaultPath}/.meditor/assets/${assetName}`;
          await fileSystem.removeFile(assetPath).catch(() => {});
        }
      }

      vaultRepository.deleteNoteById(id);
      vaultRepository.logAuditAction("DELETE_NOTE", `Hard deleted note ${id}`);
    }
  } else {
    // Containers are always hard deleted
    if (relPath) {
      const full = `${vaultPath}/${relPath}`;
      await fileSystem.removeDirectory(full);
      vaultRepository.deleteContainerById(id);
      vaultRepository.logAuditAction(
        "DELETE_COLLECTION",
        `Deleted collection at ${relPath}`,
      );
    }
  }
}

export async function renameItemCommand(
  vaultPath,
  type,
  id,
  oldRelPath,
  newName,
) {
  if (!oldRelPath) throw new Error("oldRelPath is required");
  const oldFull = `${vaultPath}/${oldRelPath}`;

  const parentRel = oldRelPath.substring(0, oldRelPath.lastIndexOf("/"));
  let newRel = parentRel ? `${parentRel}/${newName}` : newName;
  if (type === "note" && !newRel.endsWith(".md")) {
    newRel += ".md";
  }

  const newFull = `${vaultPath}/${newRel}`;

  await window.Neutralino.filesystem.move(oldFull, newFull);

  if (type === "note") {
    // If we rename a note, we just update the 'name' and 'path' in SQLite
    const nameWithoutExt = newName.replace(/\.md$/, "");
    vaultRepository._run("UPDATE notes SET name=?, path=? WHERE id=?", [
      nameWithoutExt,
      newRel,
      id,
    ]);
    vaultRepository.logAuditAction(
      "RENAME_NOTE",
      `Renamed note to "${newName}"`,
    );
  } else {
    // If we rename a container, we update its name and path
    vaultRepository._run("UPDATE containers SET name=?, path=? WHERE id=?", [
      newName,
      newRel,
      id,
    ]);
    vaultRepository.logAuditAction(
      "RENAME_COLLECTION",
      `Renamed collection to "${newName}"`,
    );
    // WARNING: SQLite does not easily cascade paths for nested items in a tree unless we query them.
    // However, since we read the filesystem for hierarchy, the next refresh will fix the paths.
    // BUT we should update nested paths in SQLite too!
    // Since we don't have a simple cascading update, we will just syncVault to clean up DB state!
  }
}

export async function moveItemCommand(
  vaultPath,
  type,
  id,
  oldRelPath,
  newParentRelPath,
) {
  if (!oldRelPath) throw new Error("oldRelPath is required");
  const oldFull = `${vaultPath}/${oldRelPath}`;

  const fileName = oldRelPath.split("/").pop();
  const newRel =
    newParentRelPath === "notes" ? fileName : `${newParentRelPath}/${fileName}`;
  const newFull = `${vaultPath}/${newRel}`;

  await window.Neutralino.filesystem.move(oldFull, newFull);

  if (type === "note") {
    vaultRepository._run("UPDATE notes SET path=? WHERE id=?", [newRel, id]);
    vaultRepository.logAuditAction(
      "MOVE_NOTE",
      `Moved note "${fileName}" to ${newParentRelPath}`,
    );
  } else {
    vaultRepository._run("UPDATE containers SET path=? WHERE id=?", [
      newRel,
      id,
    ]);
    vaultRepository.logAuditAction(
      "MOVE_COLLECTION",
      `Moved collection "${fileName}" to ${newParentRelPath}`,
    );
  }
}
