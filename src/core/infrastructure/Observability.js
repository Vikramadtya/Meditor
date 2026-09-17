import { Logger } from "./Logger";

function generateId() {
  return crypto.randomUUID();
}

export class Span {
  constructor(name, traceId, parentId = null) {
    this.id = generateId();
    this.traceId = traceId;
    this.parentId = parentId;
    this.name = name;
    this.startTime = performance.now();
    this.endTime = null;
    this.status = "ok";
    this.attributes = {};
  }

  end(status = "ok") {
    this.endTime = performance.now();
    this.status = status;
    Observability.recordSpan(this);
  }

  setAttribute(key, value) {
    this.attributes[key] = value;
  }
}

export class Trace {
  constructor(name) {
    this.id = generateId();
    this.rootSpan = new Span(name, this.id);
  }

  end(status = "ok") {
    this.rootSpan.end(status);
  }

  createSpan(name) {
    return new Span(name, this.id, this.rootSpan.id);
  }
}

export class Observability {
  static repository = null;
  static _log = Logger.forContext("Observability");

  static attachRepository(repo) {
    this.repository = repo;
  }

  static startTrace(name) {
    return new Trace(name);
  }

  static recordSpan(span) {
    if (this.repository) {
      this.repository
        .insertSpan(span)
        .catch((e) => this._log.error("Failed to insert span", e));
    }
  }

  static recordMetric(name, value, unit = "ms", tags = {}) {
    if (this.repository) {
      this.repository
        .insertMetric(name, value, unit, tags)
        .catch((e) => this._log.error("Failed to insert metric", e));
    }
  }
}
