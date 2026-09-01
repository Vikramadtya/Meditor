const fs = require('fs');
let code = fs.readFileSync('src/components/vault/TagsPage.jsx', 'utf8');

const search = `    // We can use getGraphDataFiltered with no filters to just get all notes and tags
    const notes = vaultRepository.getGraphDataFiltered([], []);`;

const replacement = `    // Fetch all notes to build the tags map
    const notes = vaultRepository._queryAll("SELECT id, name, tags FROM notes WHERE is_deleted=0 AND tags != ''");`;

code = code.replace(search, replacement);

fs.writeFileSync('src/components/vault/TagsPage.jsx', code);
console.log('Fixed TagsPage');
