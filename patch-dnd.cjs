const fs = require('fs');

function applyDnD(file, isGroup) {
  let code = fs.readFileSync(file, 'utf8');

  // Destructure openContextMenu
  code = code.replace(
    /openConfirmDeleteModal: s\.openConfirmDeleteModal,/,
    `openConfirmDeleteModal: s.openConfirmDeleteModal,
        openContextMenu: s.openContextMenu,`
  );
  code = code.replace(
    /openConfirmDeleteModal \} =/,
    `openConfirmDeleteModal, openContextMenu } =`
  );

  // Add onContextMenu
  const onContextMenu = `onContextMenu={(e) => {
          e.preventDefault();
          openContextMenu(${isGroup ? 'group' : 'item'}, e.clientX, e.clientY);
        }}`;

  code = code.replace(/onMouseLeave=\{\(\) => setHovered\(false\)\}/, `onMouseLeave={() => setHovered(false)} ${onContextMenu}`);
  code = code.replace(/onMouseLeave=\{\(e\) => \{\s*e\.currentTarget\.style\.color = "var\(--text-secondary\)";\s*setHovered\(false\);\s*\}\}/, 
    `onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; setHovered(false); }} ${onContextMenu}`);

  // DnD logic
  const dndProps = `
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData("application/meditor-item", JSON.stringify(${isGroup ? 'group' : 'item'}));
        }}
        onDragOver={(e) => {
          if (!${isGroup ? 'true' : '!isNote'}) return; // only containers can be dropped into
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.backgroundColor = "var(--bg-active)";
        }}
        onDragLeave={(e) => {
          if (!${isGroup ? 'true' : '!isNote'}) return;
          e.currentTarget.style.backgroundColor = isActive ? "var(--bg-active)" : "transparent";
        }}
        onDrop={async (e) => {
          if (!${isGroup ? 'true' : '!isNote'}) return;
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.backgroundColor = isActive ? "var(--bg-active)" : "transparent";
          try {
            const data = JSON.parse(e.dataTransfer.getData("application/meditor-item"));
            if (data && data.path !== ${isGroup ? 'group' : 'item'}.path && !data.path.startsWith(${isGroup ? 'group' : 'item'}.path + "/")) {
              await vaultService.moveItem(data.type, data.id, data.path, ${isGroup ? 'group' : 'item'}.path);
              toast.success(\`Moved "\${data.name}"\`);
              reloadVaultHierarchy();
            }
          } catch (err) {
            toast.error("Move failed");
          }
        }}`;

  code = code.replace(/style=\{\{/, `${dndProps}\n        style={{`);
  
  // Remove Trash icon (we will leave Plus, but remove Trash)
  code = code.replace(/<Trash2 size=\{13\} \/>\s*<\/div>\s*\)\}/g, ')}');
  code = code.replace(/\{hovered && \(\s*<div\s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*openConfirmDeleteModal\([\s\S]*?\)\s*\}\s*\)\}/, ''); // Remove whole Trash div
  
  fs.writeFileSync(file, code);
}

applyDnD('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx', false);
applyDnD('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx', true);
