import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItKatex from "markdown-it-katex";
import matter from "gray-matter";

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
  });

  parser.use(markdownItTaskLists, { enabled: true });
  parser.use(markdownItKatex);

  mdInstance = parser;
  currentConfigStr = configStr;

  return parser;
}

self.onmessage = function (e) {
  const { markdown, mdConfig } = e.data;

  try {
    // 1. Extract Frontmatter using gray-matter
    const parsed = matter(markdown);
    const content = parsed.content;
    const frontmatter =
      Object.keys(parsed.data).length > 0 ? parsed.data : null;

    // 2. Parse Markdown to HTML
    const md = getMarkdownInstance(mdConfig);
    const env = {};
    const htmlContent = md.render(content, env);

    // 3. Extract TOC (Basic heading extraction for the UI)
    const tokens = md.parse(content, env);
    const toc = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "heading_open") {
        const level = parseInt(tokens[i].tag.replace("h", ""), 10);
        const textToken = tokens[i + 1];
        if (textToken && textToken.type === "inline") {
          toc.push({ level, text: textToken.content });
        }
      }
    }

    self.postMessage({ htmlContent, toc, frontmatter });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
