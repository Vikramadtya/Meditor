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
    if (hard && relPath) {
      const full = `${vaultPath}/${relPath}`;
      await fileSystem.removeFile(full);
      vaultRepository.deleteNoteById(id);
    } else {
      // Soft delete
      vaultRepository._run("UPDATE notes SET is_deleted=1 WHERE id=?", [id]);
    }
  } else {
    // Containers are always hard deleted
    if (relPath) {
      const full = `${vaultPath}/${relPath}`;
      await fileSystem.removeDirectory(full);
      vaultRepository.deleteContainerById(id);
    }
  }
}
