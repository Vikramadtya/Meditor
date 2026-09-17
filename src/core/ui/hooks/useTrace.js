import { Observability } from "../../infrastructure/Observability";
import { useCallback } from "react";

/**
 * A React hook that wraps an event handler or callback with a trace span.
 * Automatically injects the active traceId and spanId into the global window
 * so that Logger calls within this synchronous tick are correlated.
 *
 * @param {string} traceName The name of the trace/span
 * @param {Function} callback The callback to trace
 * @returns {Function} Traced callback
 */
export function useTrace(traceName, callback) {
  return useCallback(
    async (...args) => {
      const trace = Observability.startTrace(traceName);

      // Set global context for this synchronous tick
      const prevTraceId = window.__ACTIVE_TRACE_ID__;
      const prevSpanId = window.__ACTIVE_SPAN_ID__;
      window.__ACTIVE_TRACE_ID__ = trace.id;
      window.__ACTIVE_SPAN_ID__ = trace.rootSpan.id;

      try {
        const result = await callback(trace.rootSpan, ...args);
        trace.end("ok");
        return result;
      } catch (e) {
        trace.rootSpan.setAttribute("error", e.message);
        trace.end("error");
        throw e;
      } finally {
        window.__ACTIVE_TRACE_ID__ = prevTraceId;
        window.__ACTIVE_SPAN_ID__ = prevSpanId;
      }
    },
    [traceName, callback],
  );
}
