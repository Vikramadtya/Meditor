import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";

/**
 * A custom hook that delegates Markdown parsing to a Web Worker for maximum performance.
 *
 * @param {string} markdown - The raw markdown text to compile.
 * @param {Object} mdConfig - Settings for the markdown-it parser.
 * @param {number} debounceMs - Delay in ms before parsing (default: 100).
 * @returns {{ htmlContent: string, toc: Array<{level: number, text: string}>, frontmatter: object | null }}
 */
export function useMarkdown(markdown, mdConfig, debounceMs = 100) {
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setToc] = useState([]);
  const [frontmatter, setFrontmatter] = useState(null);

  const workerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/markdownWorker.js", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (e) => {
      const {
        htmlContent: rawHtml,
        toc: parsedToc,
        frontmatter: parsedFm,
        error,
      } = e.data;

      if (error) {
        console.error("Markdown Worker Error:", error);
        return;
      }

      // DOMPurify must run on the main thread because it relies on the DOM
      const cleanHtml = DOMPurify.sanitize(rawHtml);

      setHtmlContent(cleanHtml);
      setToc(parsedToc || []);
      setFrontmatter(parsedFm || null);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Send data to worker when markdown or config changes (debounced)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({ markdown, mdConfig });
      }
    }, debounceMs);

    return () => clearTimeout(debounceTimerRef.current);
  }, [markdown, mdConfig, debounceMs]);

  return { htmlContent, toc, frontmatter };
}
