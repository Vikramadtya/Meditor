import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItKatex from "markdown-it-katex";
import admonitionPlugin from "../utils/markdown-it-admonitions";
import customRulesPlugin from "../utils/markdown-it-custom-rules";
import markdownItMkDocsTabs from "../utils/markdown-it-mkdocs-tabs";

let mdInstance = null;
let currentConfigStr = "";

function getMarkdownInstance(mdConfig) {
  const configStr = JSON.stringify(mdConfig);
  if (mdInstance && currentConfigStr === configStr) {
    return mdInstance;
  }

  const preset = mdConfig.dialect === "commonmark" ? "commonmark" : "default";
  const parser = new MarkdownIt(preset, {
    html: mdConfig.allowHtml,
    linkify: mdConfig.linkify,
    typographer: mdConfig.typographer,
    breaks: true,
  });

  parser.use(markdownItTaskLists, { enabled: true });
  parser.use(markdownItKatex);
  parser.use(admonitionPlugin);
  parser.use(markdownItMkDocsTabs);
  parser.use(customRulesPlugin, { customRules: mdConfig.customRules });

  mdInstance = parser;
  currentConfigStr = configStr;

  return parser;
}

export function useMarkdown(markdown, mdConfig, debounceMs = 100) {
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setToc] = useState([]);
  const [frontmatter, setFrontmatter] = useState(null);

  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        let content = markdown;
        let parsedFm = null;

        const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
        if (fmMatch) {
          content = markdown.slice(fmMatch[0].length);
          const yamlString = fmMatch[1];
          parsedFm = {};
          yamlString.split("\n").forEach((line) => {
            const idx = line.indexOf(":");
            if (idx > 0) {
              parsedFm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
            }
          });
        }

        const md = getMarkdownInstance(mdConfig);
        const env = {};
        const rawHtml = md.render(content, env);

        const tokens = md.parse(content, env);
        const parsedToc = [];
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i].type === "heading_open") {
            const level = parseInt(tokens[i].tag.replace("h", ""), 10);
            const textToken = tokens[i + 1];
            if (textToken && textToken.type === "inline") {
              parsedToc.push({ level, text: textToken.content });
            }
          }
        }

        DOMPurify.addHook("afterSanitizeAttributes", function (node) {
          if (
            node.tagName === "INPUT" &&
            node.type === "checkbox" &&
            node.classList.contains("task-list-item-checkbox")
          ) {
            node.removeAttribute("disabled");
          }
        });

        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_ATTR: ["target", "className", "class", "data-tab-idx"],
        });

        DOMPurify.removeHook("afterSanitizeAttributes");

        setHtmlContent(cleanHtml);
        setToc(parsedToc);
        setFrontmatter(parsedFm);
      } catch (err) {
        console.error("Markdown Parse Error:", err);
      }
    }, debounceMs);

    return () => clearTimeout(debounceTimerRef.current);
  }, [markdown, mdConfig, debounceMs]);

  return { htmlContent, toc, frontmatter };
}
