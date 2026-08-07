/**
 * @fileoverview Centralized logging service for tracking application state,
 * warnings, and errors. Can be easily extended to write logs to disk via Neutralino.
 */

const writeToDisk = async (level, message, meta) => {
  if (window.Neutralino && window.Neutralino.filesystem) {
    try {
      const dataDir = await window.Neutralino.os.getPath("data");
      const logFile = `${dataDir}/meditor.log`;

      const ts = new Date().toISOString();
      const metaString = meta
        ? meta instanceof Error
          ? meta.stack
          : JSON.stringify(meta)
        : "";
      const logLine = `[${ts}] [${level}] ${message} ${metaString}\n`;

      await window.Neutralino.filesystem.appendFile(logFile, logLine);
    } catch (e) {
      // Silently fail if log can't be written so we don't crash the logger
      console.warn("Could not write log to disk", e);
    }
  }
};

export const logger = {
  info: (message, data = null) => {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
    writeToDisk("INFO", message, data);
  },

  warn: (message, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || "");
    writeToDisk("WARN", message, data);
  },

  error: (message, error = null) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || "",
    );
    writeToDisk("ERROR", message, error);
  },
};
