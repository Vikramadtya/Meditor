const fs = require('fs');

const code = fs.readFileSync('src/components/vault/VaultSidebar.jsx', 'utf8');
const lines = code.split('\n');

const imports = lines.slice(0, 24).join('\n');

// Find boundaries
const fns = {
  VaultSidebar: { start: 29, end: 270 }, // 0 to 28 is imports + helper functions
  SidebarLink: { start: 271, end: 314 },
  VaultGroupNode: { start: 316, end: 450 },
  VaultNode: { start: 452, end: lines.length - 1 }
};

const sidebarLinkCode = imports + '\n\n' + lines.slice(fns.SidebarLink.start - 1, fns.SidebarLink.end).join('\n').replace('function SidebarLink', 'export default function SidebarLink') + '\n';

const vaultGroupNodeCode = imports + '\nimport VaultNode from "./VaultNode";\n\n' + lines.slice(fns.VaultGroupNode.start - 1, fns.VaultGroupNode.end).join('\n').replace('function VaultGroupNode', 'export default function VaultGroupNode') + '\n';

const vaultNodeCode = imports + '\n\n' + lines.slice(fns.VaultNode.start - 1, fns.VaultNode.end).join('\n').replace('function VaultNode', 'export default function VaultNode') + '\n';

const vaultSidebarCode = imports + '\nimport SidebarLink from "./sidebar/SidebarLink";\nimport VaultGroupNode from "./sidebar/VaultGroupNode";\n\n' + 
  lines.slice(24, fns.VaultSidebar.end).join('\n') + '\n';

fs.writeFileSync('src/components/vault/sidebar/SidebarLink.jsx', sidebarLinkCode);
fs.writeFileSync('src/components/vault/sidebar/VaultGroupNode.jsx', vaultGroupNodeCode);
fs.writeFileSync('src/components/vault/sidebar/VaultNode.jsx', vaultNodeCode);
fs.writeFileSync('src/components/vault/VaultSidebar.jsx', vaultSidebarCode);

console.log('Split VaultSidebar successfully!');
