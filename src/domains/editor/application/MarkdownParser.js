import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItKatex from "markdown-it-katex";
import admonitionPlugin from "../infrastructure/plugins/markdown-it-admonitions";
import customRulesPlugin from "../infrastructure/plugins/markdown-it-custom-rules";
import markdownItMkDocsTabs from "../infrastructure/plugins/markdown-it-mkdocs-tabs";
import markdownItMark from "markdown-it-mark";
import wikilinksPlugin from "../infrastructure/plugins/markdown-it-wikilinks";

let mdInstance = null;
let currentConfigStr = "";

export function getMarkdownInstance(mdConfig) {
  const configStr = JSON.stringify(mdConfig);
  if (mdInstance && currentConfigStr === configStr) {
    return mdInstance;
  }

  const options = {
    html: mdConfig.allowHtml ?? true,
    linkify: mdConfig.linkify ?? true,
    typographer: mdConfig.typographer ?? true,
    breaks: true,
  };

  const md = new MarkdownIt(mdConfig.dialect || "commonmark", options);

  md.use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true });
  md.use(markdownItKatex);
  md.use(admonitionPlugin);
  md.use(markdownItMkDocsTabs);
  md.use(markdownItMark);
  md.use(wikilinksPlugin);

  if (mdConfig.customRules && Array.isArray(mdConfig.customRules)) {
    md.use(customRulesPlugin, { rules: mdConfig.customRules });
  }

  mdInstance = md;
  currentConfigStr = configStr;
  return mdInstance;
}
