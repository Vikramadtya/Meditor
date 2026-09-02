const fs = require('fs');
let file = fs.readFileSync('src/components/vault/ContainerDashboard.jsx', 'utf8');

if (!file.includes('openCreateVaultItemModal')) {
  file = file.replace(
    '  const { activeVaultItem, setActiveVaultItem } = useStore(',
    '  const { activeVaultItem, setActiveVaultItem, openCreateVaultItemModal } = useStore('
  );
  
  file = file.replace(
    '      setActiveVaultItem: s.setActiveVaultItem,',
    '      setActiveVaultItem: s.setActiveVaultItem,\n      openCreateVaultItemModal: s.openCreateVaultItemModal,'
  );

  const buttonHtml = `
          {/* Add New Button */}
          <div
            onClick={() => openCreateVaultItemModal("auto", activeVaultItem.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--accent)",
              color: "white",
              padding: "10px 16px",
              borderRadius: "24px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              marginRight: "16px",
              transition: "transform 0.1s ease-in-out",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Book size={18} /> Add New
          </div>
          
          <div`;

  file = file.replace(
    '          <div\n            onClick={() => setViewMode("grid")}',
    buttonHtml + '\n            onClick={() => setViewMode("grid")}'
  );
  
  fs.writeFileSync('src/components/vault/ContainerDashboard.jsx', file);
}
