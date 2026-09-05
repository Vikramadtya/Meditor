// Read database file directly or print the logic flow
console.log("If a note is deleted softly:");
console.log("1. UPDATE notes SET is_deleted=1 WHERE id=?");
console.log("2. saveVault is called.");
console.log("3. parent is notified.");
console.log("4. UI reloads children, reads filesystem, gets cached note.");
console.log("5. cached.is_deleted is 1, so it skips the note.");
console.log("UI updates successfully.");
