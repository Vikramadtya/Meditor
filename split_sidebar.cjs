const fs = require('fs');

const code = fs.readFileSync('src/components/vault/VaultSidebar.jsx', 'utf8');
const lines = code.split('\n');

const imports = lines.slice(0, 24).join('\n');

// Find boundaries
const fns = {
  VaultSidebar: { start: lines.findIndex(l => l.startsWith('export default function VaultSidebar')), end: -1 },
  SidebarLink: { start: lines.findIndex(l => l.startsWith('function SidebarLink')), end: -1 },
  VaultGroupNode: { start: lines.findIndex(l => l.startsWith('function VaultGroupNode')), end: -1 },
  VaultNode: { start: lines.findIndex(l => l.startsWith('function VaultNode')), end: -1 }
};

fns.VaultSidebar.end = fns.SidebarLink.start - 1;
fns.SidebarLink.end = fns.VaultGroupNode.start - 1;
fns.VaultGroupNode.end = fns.VaultNode.start - 1;
fns.VaultNode.end = lines.length - 1;

const sidebarLinkCode = imports + '\n\nexport default ' + lines.slice(fns.SidebarLink.start, fns.SidebarLink.end).join('\n') + '\n';

// VaultGroupNode depends on VaultNode, useStore, vaultService, lucide-react
const vaultGroupNodeCode = imports + '\nimport VaultNode from "./VaultNode";\n\nexport default ' + lines.slice(fns.VaultGroupNode.start, fns.VaultGroupNode.end).join('\n') + '\n';

// VaultNode depends on VaultNode (recursive), useStore, vaultService, lucide-react
const vaultNodeCode = imports + '\n\nexport default ' + lines.slice(fns.VaultNode.start, fns.VaultNode.end).join('\n') + '\n';

// VaultSidebar depends on all of them
const vaultSidebarCode = imports + '\nimport SidebarLink from "./sidebar/SidebarLink";\nimport VaultGroupNode from "./sidebar/VaultGroupNode";\n\n' + 
  lines.slice(0, fns.VaultSidebar.start).slice(24).join('\n') + // get the helper functions before VaultSidebar (like containsItem)
  lines.slice(fns.VaultSidebar.start, fns.VaultSidebar.end).join('\n') + '\n';

fs.writeFileSync('src/components/vault/sidebar/SidebarLink.jsx', sidebarLinkCode);
fs.writeFileSync('src/components/vault/sidebar/VaultGroupNode.jsx', vaultGroupNodeCode);
fs.writeFileSync('src/components/vault/sidebar/VaultNode.jsx', vaultNodeCode);
fs.writeFileSync('src/components/vault/VaultSidebar.jsx', vaultSidebarCode);

console.log('Split VaultSidebar successfully!');
