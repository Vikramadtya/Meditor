const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const initSqlJs = require('sql.js');

async function run() {
  const vaultPath = '/Users/vikramadityasingh/Repository/Notes-Vault';
  const dbPath = path.join(vaultPath, 'vault.db');
  
  const SQL = await initSqlJs();
  const dbBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(new Uint8Array(dbBuffer));

  // Helper to query
  const query = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  const sanitize = (s) => s.replace(/[/\\:*?"<>|]/g, "_");

  // 1. Process Containers (Groups, Collections, Modules)
  const containers = [];

  const groups = query("SELECT * FROM groups");
  for (const g of groups) {
    const folderPath = path.join(vaultPath, 'notes', g.name); // Spaces are NOT sanitized on disk in the root group name typically, wait, getGroupFsPath did sanitize. Let's check sanitize
    const sanitizedName = sanitize(g.name);
    const fsPath = path.join(vaultPath, 'notes', sanitizedName);
    const id = crypto.randomUUID();
    containers.push({ oldType: 'group', oldId: g.id, id, fsPath, name: g.name, parentFsPath: path.join(vaultPath, 'notes') });
  }

  const collections = query("SELECT c.*, g.name as group_name FROM collections c JOIN groups g ON c.group_id = g.id");
  for (const c of collections) {
    const fsPath = path.join(vaultPath, 'notes', sanitize(c.group_name), sanitize(c.name));
    const id = crypto.randomUUID();
    containers.push({ oldType: 'collection', oldId: c.id, id, fsPath, name: c.name, parentFsPath: path.join(vaultPath, 'notes', sanitize(c.group_name)) });
  }

  const modules = query("SELECT m.*, c.name as col_name, g.name as group_name FROM modules m JOIN collections c ON m.collection_id = c.id JOIN groups g ON c.group_id = g.id");
  for (const m of modules) {
    const fsPath = path.join(vaultPath, 'notes', sanitize(m.group_name), sanitize(m.col_name), sanitize(m.name));
    const id = crypto.randomUUID();
    containers.push({ oldType: 'module', oldId: m.id, id, fsPath, name: m.name, parentFsPath: path.join(vaultPath, 'notes', sanitize(m.group_name), sanitize(m.col_name)) });
  }

  for (const container of containers) {
    if (!fs.existsSync(container.fsPath)) {
      console.warn(`Container path not found: ${container.fsPath}`);
      continue;
    }
    const metaPath = path.join(container.fsPath, '.metadata');
    const metadata = {
      id: container.id,
      type: 'container',
      children_order: []
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  }

  // 2. Process Notes
  const notes = query("SELECT n.*, m.name as mod_name, c.name as col_name, g.name as group_name FROM notes n JOIN modules m ON n.module_id = m.id JOIN collections c ON m.collection_id = c.id JOIN groups g ON c.group_id = g.id");
  
  const migratedNotes = [];

  for (const n of notes) {
    const fsPath = path.join(vaultPath, 'notes', sanitize(n.group_name), sanitize(n.col_name), sanitize(n.mod_name), `${sanitize(n.name)}.md`);
    if (!fs.existsSync(fsPath)) {
      console.warn(`Note path not found: ${fsPath}`);
      continue;
    }

    const id = crypto.randomUUID();
    let content = fs.readFileSync(fsPath, 'utf8');
    
    // Parse existing frontmatter or create new
    let newFrontmatter = `id: ${id}\n`;
    if (n.tags) {
      newFrontmatter += `tags:\n${n.tags.split(',').map(t => `  - ${t}`).join('\n')}\n`;
    }

    if (content.startsWith('---\n')) {
      // Inject into existing frontmatter
      content = content.replace('---\n', `---\n${newFrontmatter}`);
    } else {
      // Add frontmatter block
      content = `---\n${newFrontmatter}---\n\n${content}`;
    }

    fs.writeFileSync(fsPath, content);

    migratedNotes.push({
      ...n,
      newId: id,
      relPath: path.relative(vaultPath, fsPath)
    });
  }

  // 3. Update Database Schema
  db.run("DROP TABLE groups");
  db.run("DROP TABLE collections");
  db.run("DROP TABLE modules");
  
  db.run(`
    CREATE TABLE containers (
      id TEXT PRIMARY KEY,
      path TEXT,
      name TEXT,
      metadata TEXT
    )
  `);

  db.run("ALTER TABLE notes RENAME TO notes_old");
  db.run(`
    CREATE TABLE notes (
      id TEXT PRIMARY KEY,
      path TEXT,
      name TEXT,
      tags TEXT,
      is_favorite INTEGER DEFAULT 0,
      flashcard_question TEXT,
      flashcard_answer TEXT,
      srs_ease REAL DEFAULT 2.5,
      srs_interval INTEGER DEFAULT 0,
      srs_next_review INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER,
      is_deleted INTEGER DEFAULT 0
    )
  `);

  // Insert Containers
  for (const c of containers) {
    if (!fs.existsSync(c.fsPath)) continue;
    db.run(
      "INSERT INTO containers (id, path, name, metadata) VALUES (?, ?, ?, ?)",
      [c.id, path.relative(vaultPath, c.fsPath), c.name, JSON.stringify({ children_order: [] })]
    );
  }

  // Insert Notes
  for (const n of migratedNotes) {
    db.run(
      "INSERT INTO notes (id, path, name, tags, is_favorite, flashcard_question, flashcard_answer, srs_ease, srs_interval, srs_next_review, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [n.newId, n.relPath, n.name, n.tags || "", n.is_favorite || 0, n.flashcard_question || "", n.flashcard_answer || "", n.srs_ease || 2.5, n.srs_interval || 0, n.srs_next_review || 0, n.created_at, n.updated_at, n.is_deleted || 0]
    );
  }

  db.run("DROP TABLE notes_old");

  const exportedData = db.export();
  fs.writeFileSync(dbPath, Buffer.from(exportedData));

  console.log('Migration to v2 completed successfully!');
}

run().catch(console.error);
