const fs = require('fs');

let file = fs.readFileSync('src/components/modals/git/GitCommitPreview.jsx', 'utf8');

if (!file.includes('const { theme } = useStore();')) {
  file = file.replace(
    'import ReactDiffViewer from "react-diff-viewer-continued";',
    'import ReactDiffViewer from "react-diff-viewer-continued";\nimport { useStore } from "../../../store/index";'
  );
  
  file = file.replace(
    'export function GitCommitPreview({',
    'export function GitCommitPreview({\n  theme,'
  );
  
  file = file.replace(
    'useDarkTheme={true}',
    'useDarkTheme={theme === "dark"}'
  );
  
  fs.writeFileSync('src/components/modals/git/GitCommitPreview.jsx', file);
}

let historyFile = fs.readFileSync('src/components/modals/GitHistoryModal.jsx', 'utf8');
if (!historyFile.includes('theme: s.theme')) {
  historyFile = historyFile.replace(
    'markdown: s.markdown,',
    'markdown: s.markdown,\n      theme: s.theme,'
  );
  historyFile = historyFile.replace(
    'const { currentFilePath, fileName, markdown, setMarkdown } = useStore(',
    'const { currentFilePath, fileName, markdown, setMarkdown, theme } = useStore('
  );
  historyFile = historyFile.replace(
    '          <GitCommitPreview',
    '          <GitCommitPreview\n            theme={theme}'
  );
  fs.writeFileSync('src/components/modals/GitHistoryModal.jsx', historyFile);
}

