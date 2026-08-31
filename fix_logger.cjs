const fs = require('fs');
let code = fs.readFileSync('src/infrastructure/Logger.js', 'utf8');

code = code.replace(
  'meta instanceof Error\n          ? meta.stack',
  'meta instanceof Error\n          ? meta.message + "\\n" + meta.stack'
);
fs.writeFileSync('src/infrastructure/Logger.js', code);
