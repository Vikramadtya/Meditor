const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/vault/VaultSidebar.jsx', 'utf8');

// Add Activity icon
code = code.replace(/Tag,/, "Tag,\n  Activity,");

// Add setAuditModalOpen to store
code = code.replace(/setGitModalOpen: s\.setGitModalOpen,/, "setGitModalOpen: s.setGitModalOpen,\n      setAuditModalOpen: s.setAuditModalOpen,");
code = code.replace(/setGitModalOpen,\n    openCreateVaultItemModal,/, "setGitModalOpen,\n    setAuditModalOpen,\n    openCreateVaultItemModal,");

// Add SidebarLink
const auditLink = `
          <SidebarLink
            icon={<Activity size={14} />}
            label="Audit Log"
            isActive={false}
            onClick={() => setAuditModalOpen(true)}
          />
`;
code = code.replace(/<SidebarLink\n            icon=\{<Star size=\{14\} \/>\}\n            label="Favorites"[\s\S]*?\/>/, 
  (match) => match + auditLink);

fs.writeFileSync('src/domains/vault/presentation/components/vault/VaultSidebar.jsx', code);
