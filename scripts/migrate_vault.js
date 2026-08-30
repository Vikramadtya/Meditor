import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import crypto from "crypto";

const uuid = () => crypto.randomUUID();
const source = "/Users/vikramadityasingh/Repository/StudyNote";
const target = "/Users/vikramadityasingh/Repository/Notes-Vault";
const dbPath = path.join(target, "vault.db");

if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
if (!fs.existsSync(path.join(target, "notes")))
  fs.mkdirSync(path.join(target, "notes"), { recursive: true });

const dbExec = (sql) => {
  fs.writeFileSync("temp.sql", sql);
  execSync(`sqlite3 "${dbPath}" < temp.sql`);
  fs.unlinkSync("temp.sql");
};

const sanitize = (s) => s.replace(/[/\\:*?"<>|]/g, "_");

dbExec(`
CREATE TABLE groups (id TEXT PRIMARY KEY, name TEXT, order_index INTEGER, metadata TEXT DEFAULT '{}');
CREATE TABLE collections (id TEXT PRIMARY KEY, group_id TEXT, name TEXT, order_index INTEGER, metadata TEXT DEFAULT '{}');
CREATE TABLE modules (id TEXT PRIMARY KEY, collection_id TEXT, name TEXT, order_index INTEGER, metadata TEXT DEFAULT '{}');
CREATE TABLE notes (
  id TEXT PRIMARY KEY, 
  module_id TEXT, 
  name TEXT, 
  order_index INTEGER, 
  created_at INTEGER, 
  updated_at INTEGER, 
  is_deleted INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  tags TEXT DEFAULT '',
  flashcard_question TEXT DEFAULT '',
  flashcard_answer TEXT DEFAULT '',
  srs_ease REAL DEFAULT 2.5,
  srs_interval INTEGER DEFAULT 0,
  srs_next_review INTEGER DEFAULT 0
);
CREATE TABLE images (id TEXT PRIMARY KEY, note_id TEXT, file_name TEXT, created_at INTEGER);
`);

const groups = fs
  .readdirSync(source, { withFileTypes: true })
  .filter(
    (d) =>
      d.isDirectory() &&
      !d.name.startsWith(".") &&
      d.name !== "node_modules" &&
      d.name !== "assets",
  )
  .map((d) => d.name);

let sqlStatements = [];

groups.forEach((group, gIdx) => {
  const gId = uuid();
  sqlStatements.push(
    `INSERT INTO groups (id, name, order_index) VALUES ('${gId}', '${group.replace(/'/g, "''")}', ${gIdx});`,
  );

  const gPath = path.join(source, group);
  const collections = fs
    .readdirSync(gPath, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  collections.forEach((collection, cIdx) => {
    const cId = uuid();
    sqlStatements.push(
      `INSERT INTO collections (id, group_id, name, order_index) VALUES ('${cId}', '${gId}', '${collection.replace(/'/g, "''")}', ${cIdx});`,
    );

    const cPath = path.join(gPath, collection);
    const modules = fs
      .readdirSync(cPath, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => d.name);

    modules.forEach((module, mIdx) => {
      const mId = uuid();
      sqlStatements.push(
        `INSERT INTO modules (id, collection_id, name, order_index) VALUES ('${mId}', '${cId}', '${module.replace(/'/g, "''")}', ${mIdx});`,
      );

      const mPath = path.join(cPath, module);
      const notes = fs
        .readdirSync(mPath, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith(".md"))
        .map((d) => d.name);

      notes.forEach((note, nIdx) => {
        const nId = uuid();
        const noteName = note.replace(/\.md$/, "");

        // Get git dates
        const absPath = path.join(mPath, note);
        let createdAt = Date.now();
        let updatedAt = Date.now();

        try {
          const relPath = path.relative(source, absPath);
          const gitLog = execSync(`git log --format="%at" -- "${relPath}"`, {
            cwd: source,
          })
            .toString()
            .trim()
            .split("\n");
          if (gitLog.length > 0 && gitLog[0]) {
            updatedAt = parseInt(gitLog[0], 10) * 1000;
            createdAt = parseInt(gitLog[gitLog.length - 1], 10) * 1000;
          }
        } catch (e) {}

        sqlStatements.push(
          `INSERT INTO notes (id, module_id, name, order_index, created_at, updated_at) VALUES ('${nId}', '${mId}', '${noteName.replace(/'/g, "''")}', ${nIdx}, ${createdAt}, ${updatedAt});`,
        );

        // Copy file content
        const content = fs.readFileSync(absPath, "utf8");
        const targetNoteDir = path.join(
          target,
          "notes",
          sanitize(group),
          sanitize(collection),
          sanitize(module),
        );
        fs.mkdirSync(targetNoteDir, { recursive: true });
        const targetNotePath = path.join(
          targetNoteDir,
          sanitize(noteName) + ".md",
        );
        fs.writeFileSync(targetNotePath, content);
      });
    });
  });
});

if (sqlStatements.length > 0) {
  // chunk it to avoid giant sql command
  const chunkSize = 100;
  for (let i = 0; i < sqlStatements.length; i += chunkSize) {
    dbExec(sqlStatements.slice(i, i + chunkSize).join("\n"));
  }
}

// Copy assets directory if it exists
if (fs.existsSync(path.join(source, "assets"))) {
  execSync(`cp -r "${path.join(source, "assets")}" "${target}/"`);
}

console.log("Migration complete!");
