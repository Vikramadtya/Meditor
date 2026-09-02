const fs = require('fs');

let file = fs.readFileSync('src/store/actions/editorActions.js', 'utf8');

// Helper to extract frontmatter
const extractHelper = `
function splitFrontmatter(text) {
  if (text.startsWith("---")) {
    const match = text.match(/^---\n[\\s\\S]*?\\n---\\n/);
    if (match) {
      return { fm: match[0], content: text.slice(match[0].length) };
    }
  }
  return { fm: "", content: text };
}
`;

file = file.replace('const log = Logger.forContext("EditorActions");', 'const log = Logger.forContext("EditorActions");\n' + extractHelper);

// In openFile:
file = file.replace(
  'const content = await fileSystem.readFile(fullPath);',
  'const rawContent = await fileSystem.readFile(fullPath);\n    const { fm, content } = splitFrontmatter(rawContent);'
);

file = file.replace(
  '      markdown: content,\n      savedMarkdown: content,',
  '      markdown: content,\n      savedMarkdown: content,\n      frontmatterRaw: fm,'
);

// In saveActiveFile:
file = file.replace(
  '    let content = markdown;',
  '    const state = useStore.getState();\n    const activeTab = state.tabs.find(t => t.id === state.activeTabId);\n    const fm = activeTab?.frontmatterRaw || "";\n    let content = markdown;'
);

file = file.replace(
  '    await fileSystem.writeFile(savePath, content);',
  '    await fileSystem.writeFile(savePath, fm + content);'
);

// In autoSaveFile:
file = file.replace(
  '    let content = editorConfig?.autoFormatOnSave',
  '    const activeTab = useStore.getState().tabs.find(t => t.id === useStore.getState().activeTabId);\n    const fm = activeTab?.frontmatterRaw || "";\n    let content = editorConfig?.autoFormatOnSave'
);

file = file.replace(
  '    await fileSystem.writeFile(currentFilePath, content);',
  '    await fileSystem.writeFile(currentFilePath, fm + content);'
);

fs.writeFileSync('src/store/actions/editorActions.js', file);
