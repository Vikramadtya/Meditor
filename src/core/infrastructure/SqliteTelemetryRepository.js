import { Logger } from "./Logger";

export class SqliteTelemetryRepository {
  constructor() {
    this.db = null;
    this._log = Logger.forContext("SqliteTelemetryRepository");
    this.buffer = { spans: [], logs: [], metrics: [] };
    this.flushInterval = null;
  }

  attach(dbInstance) {
    this.db = dbInstance;
    this.init();

    // Flush buffered telemetry every 2 seconds to avoid locking DB too often
    this.flushInterval = setInterval(() => this.flush(), 2000);
  }

  init() {
    if (!this.db) return;
    this.db.run(`
      CREATE TABLE IF NOT EXISTS spans (
        id TEXT PRIMARY KEY,
        trace_id TEXT,
        parent_id TEXT,
        name TEXT,
        start_time REAL,
        end_time REAL,
        duration REAL,
        status TEXT,
        attributes TEXT
      );
      
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trace_id TEXT,
        span_id TEXT,
        timestamp TEXT,
        level TEXT,
        context TEXT,
        message TEXT,
        meta TEXT
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        value REAL,
        unit TEXT,
        timestamp TEXT,
        tags TEXT
      );
    `);
  }

  async insertSpan(span) {
    this.buffer.spans.push(span);
  }

  async insertLog(logData) {
    this.buffer.logs.push(logData);
  }

  async insertMetric(name, value, unit, tags) {
    this.buffer.metrics.push({
      name,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString(),
    });
  }

  flush() {
    if (!this.db) return;

    const spans = this.buffer.spans.splice(0, this.buffer.spans.length);
    const logs = this.buffer.logs.splice(0, this.buffer.logs.length);
    const metrics = this.buffer.metrics.splice(0, this.buffer.metrics.length);

    if (spans.length === 0 && logs.length === 0 && metrics.length === 0) return;

    try {
      this.db.run("BEGIN TRANSACTION;");

      const insertSpanStmt = this.db.prepare(
        "INSERT INTO spans (id, trace_id, parent_id, name, start_time, end_time, duration, status, attributes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      );
      for (const s of spans) {
        insertSpanStmt.run([
          s.id,
          s.traceId,
          s.parentId || "",
          s.name,
          s.startTime,
          s.endTime,
          s.endTime - s.startTime,
          s.status,
          JSON.stringify(s.attributes),
        ]);
      }
      insertSpanStmt.free();

      const insertLogStmt = this.db.prepare(
        "INSERT INTO logs (trace_id, span_id, timestamp, level, context, message, meta) VALUES (?, ?, ?, ?, ?, ?, ?)",
      );
      for (const l of logs) {
        insertLogStmt.run([
          l.traceId || "",
          l.spanId || "",
          l.timestamp,
          l.level,
          l.context,
          l.message,
          l.meta,
        ]);
      }
      insertLogStmt.free();

      const insertMetricStmt = this.db.prepare(
        "INSERT INTO metrics (name, value, unit, timestamp, tags) VALUES (?, ?, ?, ?, ?)",
      );
      for (const m of metrics) {
        insertMetricStmt.run([
          m.name,
          m.value,
          m.unit,
          m.timestamp,
          JSON.stringify(m.tags),
        ]);
      }
      insertMetricStmt.free();

      this.db.run("COMMIT;");
      this.saveToDisk();
    } catch (e) {
      this._log.error("Failed to flush telemetry", e);
      this.db.run("ROLLBACK;");
    }
  }

  saveToDisk() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = data.buffer;
      // We will write it to .tmp/observability.db
      if (window?.Neutralino?.filesystem) {
        window.Neutralino.filesystem
          .writeBinaryFile(".tmp/observability.db", buffer)
          .catch(() => {});
      }
    } catch (e) {
      this._log.error("Error saving observability DB", e);
    }
  }

  // --- QUERY METHODS ---
  getRecentTraces(limit = 100) {
    if (!this.db) return [];
    try {
      const res = this.db.exec(
        `SELECT * FROM spans WHERE parent_id = '' ORDER BY start_time DESC LIMIT ${limit}`,
      );
      if (!res[0]) return [];
      const cols = res[0].columns;
      return res[0].values.map((row) => {
        let obj = {};
        cols.forEach((c, i) => (obj[c] = row[i]));
        return obj;
      });
    } catch (e) {
      return [];
    }
  }

  getSpansForTrace(traceId) {
    if (!this.db) return [];
    try {
      const res = this.db.exec(
        `SELECT * FROM spans WHERE trace_id = ? ORDER BY start_time ASC`,
        [traceId],
      );
      if (!res[0]) return [];
      const cols = res[0].columns;
      return res[0].values.map((row) => {
        let obj = {};
        cols.forEach((c, i) => (obj[c] = row[i]));
        return obj;
      });
    } catch (e) {
      return [];
    }
  }

  getLogs(limit = 100, traceId = null) {
    if (!this.db) return [];
    try {
      let q = `SELECT * FROM logs`;
      let params = [];
      if (traceId) {
        q += ` WHERE trace_id = ?`;
        params.push(traceId);
      }
      q += ` ORDER BY timestamp DESC LIMIT ${limit}`;

      const res = this.db.exec(q, params);
      if (!res[0]) return [];
      const cols = res[0].columns;
      return res[0].values.map((row) => {
        let obj = {};
        cols.forEach((c, i) => (obj[c] = row[i]));
        return obj;
      });
    } catch (e) {
      return [];
    }
  }
}

export const telemetryRepository = new SqliteTelemetryRepository();
