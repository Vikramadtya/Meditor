import { AppError } from "./AppError.js";

/** Errors originating from filesystem I/O via Neutralino. */
export class FileSystemError extends AppError {
  /** @param {string} message @param {string} path @param {Error|null} cause */
  constructor(message, path = null, cause = null) {
    super(message, "FILESYSTEM_ERROR", cause);
    this.path = path;
  }
}

export class FileNotFoundError extends FileSystemError {
  constructor(path, cause = null) {
    super(`File not found: ${path}`, path, cause);
    this.code = "FILE_NOT_FOUND";
  }
}

export class FileWriteError extends FileSystemError {
  constructor(path, cause = null) {
    super(`Failed to write file: ${path}`, path, cause);
    this.code = "FILE_WRITE_FAILED";
  }
}

export class DirectoryReadError extends FileSystemError {
  constructor(path, cause = null) {
    super(`Failed to read directory: ${path}`, path, cause);
    this.code = "DIRECTORY_READ_FAILED";
  }
}
