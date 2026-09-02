const fs = require('fs');

let file = fs.readFileSync('src/components/settings/HelpTab.jsx', 'utf8');

file = file.replace(
  'import { SettingsSection, SettingItem } from "./SettingsUI";',
  'import { Section, Row } from "./SettingsUI";'
);

file = file.replace(/SettingsSection/g, 'Section');
file = file.replace(/SettingItem/g, 'Row');
file = file.replace(/title=/g, 'label=');

fs.writeFileSync('src/components/settings/HelpTab.jsx', file);
