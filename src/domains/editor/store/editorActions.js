import { useStore } from "../../../core/store/index";
import { loadWorkspace } from "../../workspace/store/workspaceActions";
import { vaultService } from "../../vault/application/VaultService";
import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { Logger } from "../../../core/infrastructure/Logger";
import toast from "react-hot-toast";

const log = Logger.forContext("EditorActions");

function splitFrontmatter(text) {
  if (text.startsWith("---")) {
    const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?(?:\n|$)/);
    if (match) {
      return { fm: match[0], content: text.slice(match[0].length) };
    }
  }
  return { fm: "", content: text };
}

async function formatMarkdown(text) {
  try {
    const prettier = (await import("prettier/standalone.js")).default;
    const markdownPlugin = (await import("prettier/plugins/markdown.js"))
      .default;
    return await prettier.format(text, {
      parser: "markdown",
      plugins: [markdownPlugin],
    });
  } catch (err) {
    log.warn("Prettier formatting failed", err);
    return text;
  }
}

export const openFile = async (
  fullPath,
  logicalName = null,
  vaultItem = null,
) => {
  try {
    const state = useStore.getState();
    const existing = state.tabs.find(
      (t) => t.id === fullPath || t.currentFilePath === fullPath,
    );
    if (existing) {
      if (vaultItem) {
        useStore.setState((s) => {
          const t = s.tabs.find((x) => x.id === existing.id);
          if (t) t.vaultItem = vaultItem;
        });
      }
      state.setActiveTab(existing.id);
      useStore.setState({ isEditMode: false });
      return;
    }
    const rawContent = await fileSystem.readFile(fullPath);
    const { fm, content } = splitFrontmatter(rawContent);
    const fileName = logicalName ?? fullPath.split(/[\\/]/).pop();
    state.openTab({
      id: fullPath,
      fileName,
      currentFilePath: fullPath,
      markdown: content,
      savedMarkdown: content,
      frontmatterRaw: fm,
      isDirty: false,
      vaultItem,
    });
    useStore.setState({ isEditMode: false });
    log.info(`Opened file: ${fullPath}`);
  } catch (err) {
    log.error(`Error reading file: ${fullPath}`, err);
    toast.error(`Could not read file.\nReason: ${err?.message || "Unknown"}`);
  }
};

export const saveActiveFile = async () => {
  try {
    const {
      currentFilePath,
      markdown,
      workspaceMode,
      currentFolder,
      markSaved,
    } = useStore.getState();
    const { useSettingsStore } =
      await import("../../settings/application/settingsStore");
    const { editorConfig } = useSettingsStore.getState();

    const state = useStore.getState();
    const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
    const fm = activeTab?.frontmatterRaw || "";
    let content = markdown;
    let savePath = currentFilePath;
    if (editorConfig?.autoFormatOnSave) content = await formatMarkdown(content);
    if (!savePath) savePath = await fileSystem.showSaveDialog();
    if (!savePath) return;

    await fileSystem.writeFile(savePath, fm + content);
    markSaved(savePath, content);

    if (workspaceMode === "folder" && currentFolder) {
      fileSystem.clearDirectoryCache(currentFolder);
      await loadWorkspace(currentFolder);
    }
    log.info(`Saved file: ${savePath}`);
    toast.success("File saved!", { icon: "💾" });
  } catch (err) {
    log.error("Save failed", err);
    toast.error("Failed to save file");
  }
};

export const autoSaveFile = async () => {
  const { currentFilePath, markdown, markSaved } = useStore.getState();
  if (!currentFilePath) return;
  try {
    const { useSettingsStore } =
      await import("../../settings/application/settingsStore");
    const { editorConfig } = useSettingsStore.getState();
    const activeTab = useStore
      .getState()
      .tabs.find((t) => t.id === useStore.getState().activeTabId);
    const fm = activeTab?.frontmatterRaw || "";
    let content = editorConfig?.autoFormatOnSave
      ? await formatMarkdown(markdown)
      : markdown;
    await fileSystem.writeFile(currentFilePath, fm + content);
    markSaved(currentFilePath, content);
    log.info(`Auto-saved: ${currentFilePath}`);
  } catch (err) {
    log.error("Auto-save failed", err);
  }
};

export const createNewFile = async (rawName) => {
  const { currentFolder, workspaceMode } = useStore.getState();
  if (!currentFolder) {
    toast.error("Open a workspace folder first.");
    return;
  }
  if (workspaceMode === "vault") {
    toast.error(
      "Cannot create raw files in Vault mode. Use the sidebar + button.",
    );
    return;
  }
  const fileName = rawName.endsWith(".md") ? rawName : `${rawName}.md`;
  const filePath = `${currentFolder}/${fileName}`;
  try {
    await fileSystem.writeFile(filePath, `# ${rawName.replace(/\.md$/, "")}\n`);
    fileSystem.clearDirectoryCache(currentFolder);
    await openFile(filePath);
    await loadWorkspace(currentFolder);
    toast.success(`Created ${fileName}`);
  } catch (err) {
    log.error(`Failed to create file: ${filePath}`, err);
    toast.error("Failed to create file");
  }
};

export const openFileFromSidebar = async (file) => {
  const { currentFolder } = useStore.getState();
  if (!currentFolder) return;
  if (file.type === "DIRECTORY") {
    let newFolder = currentFolder;
    if (file.entry === "..") {
      const parts = currentFolder.split(/[/[\s\S]]/);
      if (parts.length > 1) {
        parts.pop();
        newFolder = parts.join("/") || "/";
      }
    } else {
      const sep = currentFolder.endsWith("/") ? "" : "/";
      newFolder = `${currentFolder}${sep}${file.entry}`;
    }
    await loadWorkspace(newFolder);
    return;
  }
  const sep = currentFolder.endsWith("/") ? "" : "/";
  await openFile(`${currentFolder}${sep}${file.entry}`);
};
