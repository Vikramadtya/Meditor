import { useStore } from "../../../core/store/index";
import { openFile } from "../../editor/store/editorActions";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";
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
  let trace = null;
  if (window.Observability)
    trace = window.Observability.startTrace("UI: Open Note");

  const prevTraceId = window.__ACTIVE_TRACE_ID__;
  const prevSpanId = window.__ACTIVE_SPAN_ID__;
  if (trace) {
    window.__ACTIVE_TRACE_ID__ = trace.id;
    window.__ACTIVE_SPAN_ID__ = trace.rootSpan.id;
  }

  try {
    const { workspaceRoot } = useStore.getState();
    if (!workspaceRoot) {
      if (trace) trace.end("error");
      return;
    }
    const fullPath = vaultService.getNotePath(note.id);
    if (!fullPath) {
      log.error(`Could not resolve path for note: ${note.id}`);
      toast.error("Could not open note — path not found");
      if (trace) trace.end("error");
      return;
    }

    let span = null;
    if (trace) span = trace.createSpan("Core: openFile");
    await openFile(fullPath, note.name, note);
    if (span) span.end();

    vaultRepository.logAuditAction("OPEN_NOTE", `Opened note "${note.name}"`);
    useStore.setState({ activeVaultItem: note });
    if (trace) trace.end("ok");
  } finally {
    window.__ACTIVE_TRACE_ID__ = prevTraceId;
    window.__ACTIVE_SPAN_ID__ = prevSpanId;
  }
};

export const openNoteByName = async (noteName) => {
  const { workspaceMode, workspaceRoot, currentFolder } = useStore.getState();
  if (workspaceMode === "vault") {
    const note = vaultService.getNoteByName(noteName);
    if (note) {
      await openNoteFromVault(note);
    } else {
      log.warn("Note not found in vault: " + noteName);
    }
  } else {
    const searchRoot = workspaceRoot || currentFolder;
    const fullPath = `${searchRoot}/${noteName}.md`;
    await openFile(fullPath);
  }
};
