import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import crypto from "crypto";

const uuid = () => crypto.randomUUID();
const source = "/Users/vikramadityasingh/Repository/StudyNote";
const target = "/Users/vikramadityasingh/Repository/Notes-Vault";
const dbPath = path.join(target, "vault.db");

if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
if (fs.existsSync(path.join(target, "notes")))
  fs.rmSync(path.join(target, "notes"), { recursive: true, force: true });
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
  id TEXT PRIMARY KEY, module_id TEXT, name TEXT, order_index INTEGER, created_at INTEGER, updated_at INTEGER, 
  is_deleted INTEGER DEFAULT 0, is_favorite INTEGER DEFAULT 0, tags TEXT DEFAULT '', flashcard_question TEXT DEFAULT '', 
  flashcard_answer TEXT DEFAULT '', srs_ease REAL DEFAULT 2.5, srs_interval INTEGER DEFAULT 0, srs_next_review INTEGER DEFAULT 0
);
CREATE TABLE images (id TEXT PRIMARY KEY, note_id TEXT, file_name TEXT, created_at INTEGER);
`);

let sqlStatements = [];
let noteOrderIndex = 0;

function processNote(
  absPath,
  mId,
  groupName,
  collectionName,
  moduleName,
  fileName,
) {
  const nId = uuid();
  const noteName = fileName.replace(/\.md$/, "");

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
    `INSERT INTO notes (id, module_id, name, order_index, created_at, updated_at) VALUES ('${nId}', '${mId}', '${noteName.replace(/'/g, "''")}', ${noteOrderIndex++}, ${createdAt}, ${updatedAt});`,
  );

  const content = fs.readFileSync(absPath, "utf8");
  const targetNoteDir = path.join(
    target,
    "notes",
    sanitize(groupName),
    sanitize(collectionName),
    sanitize(moduleName),
  );
  fs.mkdirSync(targetNoteDir, { recursive: true });
  fs.writeFileSync(
    path.join(targetNoteDir, sanitize(noteName) + ".md"),
    content,
  );
}

// Get groups
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

groups.forEach((group, gIdx) => {
  const gId = uuid();
  sqlStatements.push(
    `INSERT INTO groups (id, name, order_index) VALUES ('${gId}', '${group.replace(/'/g, "''")}', ${gIdx});`,
  );

  const gPath = path.join(source, group);
  const collectionsAndNotes = fs
    .readdirSync(gPath, { withFileTypes: true })
    .filter((d) => !d.name.startsWith("."));

  // Create a default collection if there are files directly in group
  let defaultCId = null;
  let cIdx = 0;

  collectionsAndNotes.forEach((item) => {
    if (item.isFile() && item.name.endsWith(".md")) {
      if (!defaultCId) {
        defaultCId = uuid();
        sqlStatements.push(
          `INSERT INTO collections (id, group_id, name, order_index) VALUES ('${defaultCId}', '${gId}', 'General', -1);`,
        );
      }
      processNote(
        path.join(gPath, item.name),
        defaultCId,
        group,
        "General",
        "General",
        item.name,
      );
    } else if (item.isDirectory()) {
      const collection = item.name;
      const cId = uuid();
      sqlStatements.push(
        `INSERT INTO collections (id, group_id, name, order_index) VALUES ('${cId}', '${gId}', '${collection.replace(/'/g, "''")}', ${cIdx++});`,
      );

      const cPath = path.join(gPath, collection);
      const modulesAndNotes = fs
        .readdirSync(cPath, { withFileTypes: true })
        .filter((d) => !d.name.startsWith("."));

      let defaultMId = null;
      let mIdx = 0;

      modulesAndNotes.forEach((mItem) => {
        if (mItem.isFile() && mItem.name.endsWith(".md")) {
          if (!defaultMId) {
            defaultMId = uuid();
            sqlStatements.push(
              `INSERT INTO modules (id, collection_id, name, order_index) VALUES ('${defaultMId}', '${cId}', 'General', -1);`,
            );
          }
          processNote(
            path.join(cPath, mItem.name),
            defaultMId,
            group,
            collection,
            "General",
            mItem.name,
          );
        } else if (mItem.isDirectory()) {
          const module = mItem.name;
          const mId = uuid();
          sqlStatements.push(
            `INSERT INTO modules (id, collection_id, name, order_index) VALUES ('${mId}', '${cId}', '${module.replace(/'/g, "''")}', ${mIdx++});`,
          );

          const mPath = path.join(cPath, module);
          const notes = fs
            .readdirSync(mPath, { withFileTypes: true })
            .filter((d) => d.isFile() && d.name.endsWith(".md"))
            .map((d) => d.name);

          notes.forEach((note) => {
            processNote(
              path.join(mPath, note),
              mId,
              group,
              collection,
              module,
              note,
            );
          });
        }
      });
    }
  });
});

if (sqlStatements.length > 0) {
  const chunkSize = 50;
  for (let i = 0; i < sqlStatements.length; i += chunkSize) {
    dbExec(sqlStatements.slice(i, i + chunkSize).join("\n"));
  }
}

// Copy assets
if (fs.existsSync(path.join(source, "assets"))) {
  execSync(`cp -r "${path.join(source, "assets")}" "${target}/"`);
}

console.log("Migration complete!");
