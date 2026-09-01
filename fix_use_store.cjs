const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/components');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to match: const { a, b, c } = useStore();
  // It could span multiple lines.
  const regex = /const\s+\{([\s\S]*?)\}\s*=\s*useStore\(\s*\)\s*;/g;
  
  code = code.replace(regex, (match, props) => {
    changed = true;
    const cleanProps = props.split(',').map(p => p.trim().split(':')[0].trim()).filter(Boolean);
    const objectReturn = cleanProps.map(p => `${p}: s.${p}`).join(', ');
    return `const { ${props.trim()} } = useStore(useShallow((s) => ({ ${objectReturn} })));`;
  });

  if (changed) {
    if (!code.includes("import { useShallow } from 'zustand/react/shallow'")) {
        // Insert after first import
        const firstImportEnd = code.indexOf('\n', code.indexOf('import '));
        if (firstImportEnd > -1) {
            code = code.substring(0, firstImportEnd + 1) + "import { useShallow } from 'zustand/react/shallow';\n" + code.substring(firstImportEnd + 1);
        } else {
            code = "import { useShallow } from 'zustand/react/shallow';\n" + code;
        }
    }
    fs.writeFileSync(file, code);
    console.log("Updated", file);
  }
});
