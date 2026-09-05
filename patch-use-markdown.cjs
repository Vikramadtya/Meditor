const fs = require('fs');
let code = fs.readFileSync('src/domains/editor/presentation/hooks/useMarkdown.js', 'utf8');

code = code.replace(
  'const [html, setHtml] = useState("");',
  'const [htmlContent, setHtmlContent] = useState("");\n  const [toc, setToc] = useState([]);\n  const [frontmatter, setFrontmatter] = useState(null);'
);

const renderBlock = `
        let contentToRender = markdown;
        let parsedFm = null;

        // Strip frontmatter if present
        const fmMatch = markdown.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---\\r?(?:\\n|$)/);
        if (fmMatch) {
          contentToRender = markdown.slice(fmMatch[0].length);
          const yamlString = fmMatch[1];
          parsedFm = {};
          const lines = yamlString.split("\\n");
          let currentKey = null;
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (trimmed.startsWith("- ") && currentKey) {
              if (!Array.isArray(parsedFm[currentKey])) {
                parsedFm[currentKey] = parsedFm[currentKey] ? [parsedFm[currentKey]] : [];
              }
              parsedFm[currentKey].push(trimmed.slice(2).trim());
            } else {
              const idx = line.indexOf(":");
              if (idx > 0) {
                currentKey = line.slice(0, idx).trim();
                const val = line.slice(idx + 1).trim();
                if (val) {
                  parsedFm[currentKey] = val;
                } else {
                  parsedFm[currentKey] = [];
                }
              }
            }
          });
        }
        
        // Extract TOC
        const newToc = [];
        const headingRegex = /^(#{1,6})\\s+(.+)$/gm;
        let match;
        while ((match = headingRegex.exec(contentToRender)) !== null) {
          newToc.push({
            level: match[1].length,
            text: match[2].replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, "$1").replace(/[*_~\`]/g, ""),
          });
        }

        let rawHtml = md.render(contentToRender || "");
`;

code = code.replace(
  `        // Strip frontmatter if present (simplified regex for frontmatter)
        const frontmatterRegex = /^---\\r?\\n([\\s\\S]*?)\\r?\\n---\\r?(?:\\n|$)/;
        const markdownWithoutFrontmatter = markdown.replace(
          frontmatterRegex,
          "",
        );

        let rawHtml = md.render(markdownWithoutFrontmatter || "");`,
  renderBlock
);

code = code.replace('setHtml(safeHtml);', 'setHtmlContent(safeHtml);\n          setToc(newToc);\n          setFrontmatter(parsedFm);');

code = code.replace(
  'setHtml(\n            `<div class="markdown-error">Failed to render markdown: ${err.message}</div>`,\n          );',
  'setHtmlContent(\n            `<div class="markdown-error">Failed to render markdown: ${err.message}</div>`,\n          );'
);

code = code.replace('return { html, isRendering };', 'return { htmlContent, toc, frontmatter, isRendering };');

fs.writeFileSync('src/domains/editor/presentation/hooks/useMarkdown.js', code);
