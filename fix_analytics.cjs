const fs = require('fs');

// 1. Add getAnalytics to SqliteVaultRepository
let repo = fs.readFileSync('src/infrastructure/SqliteVaultRepository.js', 'utf8');

const classEnd = `\n}\n\nexport const vaultRepository`;
const analyticsMethod = `
  // ─── Analytics ───────────────────────────────────────────────────────────

  getAnalytics() {
    this._assertDb();
    const result = {
      notes: 0,
      groups: 0,
      favorites: 0,
      editCounts: {},
      tagCounts: {},
      notesByGroup: []
    };

    try {
      const notes = this._queryAll("SELECT * FROM notes WHERE is_deleted=0");
      const containers = this._queryAll("SELECT * FROM containers");
      
      result.notes = notes.length;
      result.groups = containers.length;
      result.favorites = notes.filter(n => n.is_favorite === 1).length;

      const containerCounts = {};

      for (const note of notes) {
        if (note.tags) {
          const tags = note.tags.split(",").map(t => t.trim()).filter(Boolean);
          for (const t of tags) {
            result.tagCounts[t] = (result.tagCounts[t] || 0) + 1;
          }
        }
        
        const ts = Math.max(note.created_at || 0, note.updated_at || 0);
        if (ts > 0) {
          const dateStr = new Date(ts).toISOString().slice(0, 10);
          result.editCounts[dateStr] = (result.editCounts[dateStr] || 0) + 1;
        }

        const parts = note.path.split('/');
        if (parts.length > 1) {
          const topLevel = parts[1];
          containerCounts[topLevel] = (containerCounts[topLevel] || 0) + 1;
        }
      }

      result.notesByGroup = Object.entries(containerCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
    } catch (e) {}
    return result;
  }
`;

repo = repo.replace(classEnd, analyticsMethod + classEnd);
fs.writeFileSync('src/infrastructure/SqliteVaultRepository.js', repo);

// 2. Remove Flashcards from AnalyticsPage
let page = fs.readFileSync('src/components/vault/AnalyticsPage.jsx', 'utf8');

// Strip out flashcards and due today
page = page.replace(/<HeroCard[\s\S]*?label="Flashcards"[\s\S]*?\/>/, '');
page = page.replace(/<HeroCard[\s\S]*?label="Due Today"[\s\S]*?\/>/, '');

// Strip out SRS Intervals section
page = page.replace(/{\/\* SRS Interval Distribution \*\/}[\s\S]*?<\/Section>\n\s*}/, '');

fs.writeFileSync('src/components/vault/AnalyticsPage.jsx', page);

console.log('Fixed Analytics');
