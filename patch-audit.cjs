const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', 'utf8');

// Add audit_log table to _migrate
code = code.replace(
  /CREATE TABLE IF NOT EXISTS containers/,
  `CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        details TEXT,
        timestamp INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS containers`
);

// Add logAuditAction and getAuditLogs methods
const newMethods = `
  // ─── Audit Log ───────────────────────────────────────────────────────────

  logAuditAction(action, details = "") {
    if (!this.db) return;
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    try {
      this._run(
        "INSERT INTO audit_log (id, action, details, timestamp) VALUES (?, ?, ?, ?)",
        [id, action, details, timestamp]
      );
    } catch (e) {
      this._log.warn("Failed to log audit action", e);
    }
  }

  getAuditLogs(limit = 100) {
    if (!this.db) return [];
    try {
      return this._queryAll(
        "SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT ?",
        [limit]
      );
    } catch (e) {
      return [];
    }
  }

  // ─── Analytics`;

code = code.replace(/\/\/ ─── Analytics/, newMethods);

fs.writeFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', code);
