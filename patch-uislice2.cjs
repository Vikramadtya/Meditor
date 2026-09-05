const fs = require('fs');
let code = fs.readFileSync('src/core/ui/store/uiSlice.js', 'utf8');

const newModals = `
  isAuditModalOpen: false,
  setAuditModalOpen: (v) => set((s) => { s.isAuditModalOpen = v; }),

  moveItemModal: { isOpen: false, item: null },
  openMoveItemModal: (item) => set((s) => { s.moveItemModal = { isOpen: true, item }; }),
  closeMoveItemModal: () => set((s) => { s.moveItemModal = { isOpen: false, item: null }; }),

  contextMenu: { isOpen: false, x: 0, y: 0, item: null },
  openContextMenu: (item, x, y) => set((s) => { s.contextMenu = { isOpen: true, item, x, y }; }),
  closeContextMenu: () => set((s) => { s.contextMenu = { isOpen: false, item: null, x: 0, y: 0 }; }),

  confirmDeleteModal:`;

code = code.replace(/confirmDeleteModal:/, newModals);
fs.writeFileSync('src/core/ui/store/uiSlice.js', code);
