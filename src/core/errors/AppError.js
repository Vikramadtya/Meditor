/**
 * @fileoverview Base application error class providing structured error hierarchy.
 * All domain errors in Meditor extend this class.
 */

/**
 * Base class for all application-specific errors.
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {string} code - Machine-readable error code (e.g. 'VAULT_LOAD_FAILED')
   * @param {Error|null} cause - Original underlying error
   */
  constructor(message, code = "UNKNOWN_ERROR", cause = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a structured representation for logging.
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      cause: this.cause?.message ?? null,
    };
  }
}
