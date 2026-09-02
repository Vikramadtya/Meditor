const fs = require('fs');
const path = require('path');

const vaultDir = '/Users/vikramadityasingh/Repository/Notes-Vault/notes';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match ```ad-<type> \n metadata \n content ```
  // Metadata is optional and usually at the top
  const regex = /```ad-([a-zA-Z0-9_-]+)[ \t]*\n([\s\S]*?)```/g;
  
  let modified = false;
  
  const newContent = content.replace(regex, (match, type, body) => {
    modified = true;
    
    // Split body into lines
    const lines = body.split('\n');
    let title = '';
    let collapse = null;
    let contentLines = [];
    
    let parsingMeta = true;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (parsingMeta) {
        if (line.trim().startsWith('title:')) {
          title = line.substring(line.indexOf(':') + 1).trim();
          continue;
        } else if (line.trim().startsWith('collapse:')) {
          collapse = line.substring(line.indexOf(':') + 1).trim();
          continue;
        } else if (line.trim().startsWith('color:') || line.trim().startsWith('icon:')) {
          continue;
        } else if (line.trim() === '') {
          // Empty line usually separates meta from content
          if (title || collapse !== null) {
            continue;
          } else {
            parsingMeta = false;
            contentLines.push(line);
          }
        } else {
          parsingMeta = false;
          contentLines.push(line);
        }
      } else {
        contentLines.push(line);
      }
    }
    
    // Determine the marker
    let marker = '!!!';
    if (collapse === 'closed' || collapse === '') marker = '???';
    else if (collapse === 'open') marker = '???+';
    
    let header = `${marker} ${type}`;
    if (title) {
      header += ` "${title}"`;
    }
    
    // Indent content lines by 4 spaces
    // Remove trailing empty lines from contentLines
    while (contentLines.length > 0 && contentLines[contentLines.length - 1].trim() === '') {
      contentLines.pop();
    }
    
    const indentedContent = contentLines.map(line => '    ' + line).join('\n');
    
    return `${header}\n${indentedContent}\n`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

walk(vaultDir);
console.log('Migration complete!');
