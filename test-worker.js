import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItKatex from "markdown-it-katex";

const mdConfig = {
  dialect: "default",
  allowHtml: true,
  linkify: true,
  typographer: true,
};
const markdown = "# Test";

try {
  let content = markdown;
  let frontmatter = null;
  const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (fmMatch) {
    content = markdown.slice(fmMatch[0].length);
  }

  const parser = new MarkdownIt(mdConfig.dialect, {
    html: mdConfig.allowHtml,
    linkify: mdConfig.linkify,
    typographer: mdConfig.typographer,
  });

  parser.use(markdownItTaskLists, { enabled: true });
  parser.use(markdownItKatex);

  const env = {};
  const htmlContent = parser.render(content, env);
  console.log("HTML:", htmlContent);
} catch (e) {
  console.error("ERROR:", e);
}
