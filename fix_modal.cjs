const fs = require('fs');
let code = fs.readFileSync('src/components/modals/CreateVaultItemModal.jsx', 'utf8');

const search = `  const handleSubmit = async (e) => {`;
const replace = `  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (type === "note") {
        await vaultService.createNote(parentId, name);
      } else {
        await vaultService.createContainer(parentId, name);
      }
      
      closeCreateVaultItemModal();
      reloadVaultHierarchy(); // Top level reload
      useStore.getState().openFileFromSidebar(); // Just a dummy to trigger React refresh? actually reloadVaultHierarchy will trigger it
    } catch (err) {
      console.error(err);
      alert("Failed to create item.");
    }
  };
  
  /*`;

code = code.replace(search, replace);
code = code.replace(`  return (
    <div`, `  */\n\n  return (\n    <div`);

fs.writeFileSync('src/components/modals/CreateVaultItemModal.jsx', code);
console.log('Fixed CreateVaultItemModal');
