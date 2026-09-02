const fs = require('fs');

let file = fs.readFileSync('src/components/modals/git/GitCommitPreview.jsx', 'utf8');

file = file.replace(
  'dark: {',
  'light: {\n                  diffViewerBackground: "transparent",\n                  diffViewerTitleBackground: "var(--bg-secondary)",\n                  addedBackground: "rgba(34, 197, 94, 0.15)",\n                  addedColor: "#166534",\n                  removedBackground: "rgba(239, 68, 68, 0.15)",\n                  removedColor: "#991b1b",\n                  wordAddedBackground: "rgba(34, 197, 94, 0.3)",\n                  wordRemovedBackground: "rgba(239, 68, 68, 0.3)",\n                },\n                dark: {'
);

fs.writeFileSync('src/components/modals/git/GitCommitPreview.jsx', file);
