/**
 * @deprecated Use `vaultService` from `../application/vault/VaultService.js`
 * and `vaultRepository` from `../infrastructure/SqliteVaultRepository.js`.
 * Kept for backward compatibility — re-exports from new layers.
 */
export { vaultRepository as vaultDb } from "../infrastructure/SqliteVaultRepository.js";

// Provide db shim for legacy code that reads vaultService.db
import { vaultRepository } from "../infrastructure/SqliteVaultRepository.js";
import { vaultService as _vs } from "../application/vault/VaultService.js";

// Proxy that satisfies legacy patterns like vaultService.db.exec(...)
const vaultServiceCompat = new Proxy(_vs, {
  get(target, prop) {
    if (prop === "db") return vaultRepository.db;
    if (prop === "getFavoriteNotes")
      return () => vaultRepository.findFavoriteNotes();
    if (prop === "getNoteMeta") return (id) => vaultRepository.getNoteMeta(id);
    if (prop === "updateNoteMeta")
      return async (id, meta) => {
        vaultRepository.updateNoteMeta(id, meta);
        await target.save();
      };
    if (prop === "toggleFavorite")
      return async (id) => {
        vaultRepository.toggleFavorite(id);
        await target.save();
      };
    if (prop === "getHierarchy") return () => vaultRepository.getHierarchy();
    if (prop === "getDeletedNotes")
      return () => vaultRepository.findDeletedNotes();
    if (prop === "getAgendaNotes")
      return () => vaultRepository.getAgendaNotes();
    if (prop === "updateNoteSRS")
      return async (id, ease, interval, nextReview) => {
        vaultRepository.updateNoteSRS(id, ease, interval, nextReview);
        await target.save();
      };
    if (prop === "getLogicalPath")
      return (id) => vaultRepository.getLogicalPath(id);
    return typeof target[prop] === "function"
      ? target[prop].bind(target)
      : target[prop];
  },
});

export { vaultServiceCompat as vaultService };
