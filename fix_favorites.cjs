const fs = require('fs');

let repo = fs.readFileSync('src/infrastructure/SqliteVaultRepository.js', 'utf8');

const classEnd = `\n}\n\nexport const vaultRepository`;
const favoriteMethod = `
  findFavoriteNotes() {
    this._assertDb();
    return this._queryAll("SELECT * FROM notes WHERE is_deleted=0 AND is_favorite=1");
  }
`;

repo = repo.replace(classEnd, favoriteMethod + classEnd);
fs.writeFileSync('src/infrastructure/SqliteVaultRepository.js', repo);

console.log('Fixed Favorites');
