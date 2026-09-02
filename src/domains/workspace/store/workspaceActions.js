import { useStore } from "../../../core/store/index";
import { workspaceService } from "../application/WorkspaceService";
import { fileSystem } from "../infrastructure/NeutralinoFileSystem";
import { Logger } from "../../../core/infrastructure/Logger";
import toast from "react-hot-toast";

const log = Logger.forContext("WorkspaceActions");

export const loadWorkspace = async (folderPath) => {
  try {
    const result = await workspaceService.loadWorkspace(folderPath);
    useStore.setState((s) => {
      s.workspaceMode = result.mode;
      s.currentFolder = folderPath;
      s.workspaceRoot =
        s.workspaceRoot && folderPath.startsWith(s.workspaceRoot)
          ? s.workspaceRoot
          : folderPath;
      s.files = result.files;
      s.vaultHierarchy = result.hierarchy;
      s.activeVaultItem = null;
    });
    log.info(`Loaded workspace: ${folderPath} (mode: ${result.mode})`);
  } catch (err) {
    log.error(`Failed to load workspace: ${folderPath}`, err);
    toast.error("Failed to open workspace");
  }
};

export const openWorkspaceDialog = async () => {
  try {
    const folder = await workspaceService.pickFolder();
    if (folder) await loadWorkspace(folder);
  } catch (err) {
    log.error("Folder picker cancelled or failed", err);
  }
};

export const createVaultDialog = async () => {
  try {
    const folder = await workspaceService.pickFolder();
    if (folder) {
      const isExisting = await fileSystem.exists(`${folder}/.meditor`);
      if (!isExisting) {
        await fileSystem.createDirectory(`${folder}/.meditor`);
      }
      await loadWorkspace(folder);
      if (isExisting) {
        toast.success("Reading existing vault!");
      } else {
        toast.success("Initialized new Vault!");
      }
    }
  } catch (err) {
    log.error("Create vault cancelled or failed", err);
  }
};

export const createNewFolder = async (folderName) => {
  const { currentFolder, workspaceMode } = useStore.getState();
  if (!currentFolder) {
    toast.error("Open a workspace folder first.");
    return;
  }
  if (workspaceMode === "vault") {
    toast.error("Cannot create raw folders in Vault mode.");
    return;
  }
  try {
    await fileSystem.createDirectory(`${currentFolder}/${folderName}`);
    fileSystem.clearDirectoryCache(currentFolder);
    await loadWorkspace(currentFolder);
    toast.success(`Created folder ${folderName}`);
  } catch (err) {
    log.error(`Failed to create folder`, err);
    toast.error("Failed to create folder");
  }
};
