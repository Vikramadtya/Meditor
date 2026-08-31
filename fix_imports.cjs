const fs = require('fs');

const files = [
  'src/components/vault/sidebar/SidebarLink.jsx',
  'src/components/vault/sidebar/VaultGroupNode.jsx',
  'src/components/vault/sidebar/VaultNode.jsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\"\.\.\/\.\.\/store/g, '"../../../store');
  code = code.replace(/\"\.\.\/\.\.\/application/g, '"../../../application');
  fs.writeFileSync(file, code);
}
console.log('Fixed imports!');
