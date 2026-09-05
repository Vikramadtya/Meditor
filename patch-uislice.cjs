const fs = require('fs');
let code = fs.readFileSync('src/core/ui/store/uiSlice.js', 'utf8');

code = code.replace(
  /isSettingsOpen: false,/,
  `confirmDeleteModal: { isOpen: false, item: null },
  openConfirmDeleteModal: (item) => set((s) => { s.confirmDeleteModal = { isOpen: true, item }; }),
  closeConfirmDeleteModal: () => set((s) => { s.confirmDeleteModal = { isOpen: false, item: null }; }),
  
  isSettingsOpen: false,`
);

fs.writeFileSync('src/core/ui/store/uiSlice.js', code);
