import { AppError } from "./AppError.js";

/** Errors originating from Vault operations (SQLite, hierarchy). */
export class VaultError extends AppError {
  constructor(message, code = "VAULT_ERROR", cause = null) {
    super(message, code, cause);
  }
}

export class VaultNotLoadedError extends VaultError {
  constructor() {
    super(
      "Vault database is not loaded. Open a vault first.",
      "VAULT_NOT_LOADED",
    );
  }
}

export class VaultInitError extends VaultError {
  constructor(path, cause = null) {
    super(`Failed to initialize vault at: ${path}`, "VAULT_INIT_FAILED", cause);
    this.path = path;
  }
}

export class VaultLoadError extends VaultError {
  constructor(path, cause = null) {
    super(`Failed to load vault from: ${path}`, "VAULT_LOAD_FAILED", cause);
    this.path = path;
  }
}

export class NoteNotFoundError extends VaultError {
  constructor(noteId) {
    super(`Note not found: ${noteId}`, "NOTE_NOT_FOUND");
    this.noteId = noteId;
  }
}
