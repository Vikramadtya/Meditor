const fs = require('fs');

let code = fs.readFileSync('src/application/vault/VaultService.js', 'utf8');

const importSearch = `import { Logger } from "../../infrastructure/Logger";`;
const importReplace = `import { Logger } from "../../infrastructure/Logger";\nimport initSqlJs from "sql.js";\nimport wasmUrl from "sql.js/dist/sql-wasm.wasm?url";`;

const constrSearch = `  constructor() {
    this._log = Logger.forContext("VaultService");
    this.vaultPath = null;
    this._sqlPromise = null;
    this.isSyncing = false;
  }`;
const constrReplace = `  constructor() {
    this._log = Logger.forContext("VaultService");
    this.vaultPath = null;
    this._sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
    this.isSyncing = false;
  }`;

code = code.replace(importSearch, importReplace);
code = code.replace(constrSearch, constrReplace);

fs.writeFileSync('src/application/vault/VaultService.js', code);
console.log('Fixed VaultService SQL init');
