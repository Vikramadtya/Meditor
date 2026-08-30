/**
 * @fileoverview Structured logger class.
 * Uses Factory pattern (Logger.forContext) and writes to console + disk.
 * Replaces the old src/services/logger.js plain object.
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

/**
 * Structured application logger.
 * @example
 *   const log = Logger.forContext('VaultService');
 *   log.info('Vault loaded', { path: '/foo' });
 */
export class Logger {
  /** @param {string} context - The module/class name for this logger instance */
  constructor(context) {
    this.context = context;
    this.minLevel = LOG_LEVELS.DEBUG;
  }

  /**
   * Factory method — create a logger scoped to a specific context.
   * @param {string} context
   * @returns {Logger}
   */
  static forContext(context) {
    return new Logger(context);
  }

  /** @param {string} message @param {*} data */
  info(message, data = null) {
    this._log("INFO", message, data);
  }

  /** @param {string} message @param {*} data */
  warn(message, data = null) {
    this._log("WARN", message, data);
  }

  /** @param {string} message @param {Error|*} error */
  error(message, error = null) {
    this._log("ERROR", message, error);
  }

  /** @param {string} message @param {*} data */
  debug(message, data = null) {
    this._log("DEBUG", message, data);
  }

  /**
   * @private
   * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
   * @param {string} message
   * @param {*} meta
   */
  _log(level, message, meta) {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const ts = new Date().toISOString();
    const prefix = `[${level}] [${this.context}] ${ts}`;
    const formatted = `${prefix} — ${message}`;

    if (level === "ERROR") console.error(formatted, meta ?? "");
    else if (level === "WARN") console.warn(formatted, meta ?? "");
    else if (level === "DEBUG") console.debug(formatted, meta ?? "");
    else console.info(formatted, meta ?? "");

    this._writeToDisk(level, message, meta);
  }

  /**
   * Async fire-and-forget write to Neutralino log file.
   * @private
   */
  async _writeToDisk(level, message, meta) {
    if (!window?.Neutralino?.filesystem) return;
    try {
      const dataDir = await window.Neutralino.os.getPath("data");
      const logFile = `${dataDir}/meditor.log`;
      const metaStr = meta
        ? meta instanceof Error
          ? meta.stack
          : typeof meta === "object"
            ? JSON.stringify(meta)
            : String(meta)
        : "";
      const line = `[${new Date().toISOString()}] [${level}] [${this.context}] ${message} ${metaStr}\n`;
      await window.Neutralino.filesystem.appendFile(logFile, line);
    } catch (_) {
      // Silently fail — logging must never crash the app
    }
  }
}

/**
 * Default global logger for backward-compatibility.
 * Prefer Logger.forContext() in new code.
 */
export const logger = Logger.forContext("App");
