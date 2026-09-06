const fs = require('fs');
let code = fs.readFileSync('src/domains/workspace/presentation/components/Titlebar.jsx', 'utf8');

code = code.replace(
  /const \{ fileName, markdown, isSidebarOpen, toggleSidebar \} = useStore\(\n    useShallow\(\(s\) => \(\{\n      fileName: s\.fileName,\n      markdown: s\.markdown,\n      isSidebarOpen: s\.isSidebarOpen,\n      toggleSidebar: s\.toggleSidebar,\n    \}\)\),\n  \);/,
  `const { fileName, markdown, isSidebarOpen, toggleSidebar, workspaceMode } = useStore(
    useShallow((s) => ({
      fileName: s.fileName,
      markdown: s.markdown,
      isSidebarOpen: s.isSidebarOpen,
      toggleSidebar: s.toggleSidebar,
      workspaceMode: s.workspaceMode,
    })),
  );`
);

code = code.replace(
  /!showDashboard/g,
  `(!showDashboard && workspaceMode !== "none")`
);

fs.writeFileSync('src/domains/workspace/presentation/components/Titlebar.jsx', code);
