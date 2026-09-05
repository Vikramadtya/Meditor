import { useStore } from "../../../core/store/index";
import { openFile } from "../../editor/store/editorActions";
import { vaultService } from "../application/VaultService";
import { Logger } from "../../../core/infrastructure/Logger";
import toast from "react-hot-toast";

const log = Logger.forContext("VaultActions");

export const reloadVaultHierarchy = async () => {
  const { workspaceMode, currentFolder } = useStore.getState();
  if (workspaceMode !== "vault" || !currentFolder) return;
  try {
    const hierarchy = await vaultService.getFolderContents("notes");
    useStore.setState({ vaultHierarchy: hierarchy });
    log.info("Vault hierarchy reloaded");
  } catch (err) {
    log.error("Failed to reload vault hierarchy", err);
  }
};

export const openNoteFromVault = async (note) => {
  const { workspaceRoot } = useStore.getState();
  if (!workspaceRoot) return;
  const fullPath = vaultService.getNotePath(note.id);
  if (!fullPath) {
    log.error(`Could not resolve path for note: ${note.id}`);
    toast.error("Could not open note — path not found");
    return;
  }
  await openFile(fullPath, note.name, note);
  useStore.setState({ activeVaultItem: note });
};

export const openNoteByName = async (noteName) => {
  const { workspaceMode, workspaceRoot, currentFolder } = useStore.getState();
  if (workspaceMode === "vault") {
    const dbRes = vaultService.db?.exec(
      "SELECT id, name FROM notes WHERE name = ? AND is_deleted = 0",
      [noteName],
    );
    if (dbRes && dbRes[0] && dbRes[0].values.length > 0) {
      const row = dbRes[0].values[0];
      await openNoteFromVault({ id: row[0], name: row[1] });
    } else {
      log.warn("Note not found in vault: " + noteName);
    }
  } else {
    const searchRoot = workspaceRoot || currentFolder;
    const fullPath = `${searchRoot}/${noteName}.md`;
    await openFile(fullPath);
  }
};
