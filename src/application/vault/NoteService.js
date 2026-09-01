/**
 * @fileoverview Application Service for note-level operations:
 * favorites, tags, flashcards, metadata.
 * Single Responsibility: only concerned with note metadata and state.
 */

import { Logger } from "../../infrastructure/Logger.js";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository.js";
import { vaultService } from "./VaultService.js";

class NoteService {
  constructor() {
    this._log = Logger.forContext("NoteService");
  }

  /** @param {string} noteId @returns {Promise<void>} */
  async toggleFavorite(noteId) {
    vaultRepository.toggleFavorite(noteId);
    await vaultService.save();
    this._log.debug(`Toggled favorite for note ${noteId}`);
  }

  /** @param {string} noteId @returns {boolean} */
  isFavorite(noteId) {
    return vaultRepository.isFavorite(noteId);
  }

  /** @returns {Array} */
  getFavoriteNotes() {
    return vaultRepository.findFavoriteNotes();
  }

  /**
   * @param {string} noteId
   * @param {{ tags: string[], flashcard_question: string, flashcard_answer: string }} meta
   */
  async updateMeta(noteId, meta) {
    vaultRepository.updateNoteMeta(noteId, meta);
    await vaultService.save();
    this._log.info(`Updated metadata for note ${noteId}`);
  }

  /** @param {string} noteId */
  getMeta(noteId) {
    return vaultRepository.getNoteMeta(noteId);
  }

  /** @returns {Array} */
  getNotesCreatedToday() {
    return vaultRepository.findNotesCreatedToday();
  }

  /** @returns {Array} */
  getAllNotes() {
    return vaultRepository.findAllNotes();
  }
}

export const noteService = new NoteService();
