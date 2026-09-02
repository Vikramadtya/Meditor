const fs = require('fs');

let file = fs.readFileSync('src/components/settings/SettingsModal.jsx', 'utf8');

// Add import
if (!file.includes('HelpTab')) {
  file = file.replace(
    'import SystemTab from "./SystemTab";',
    'import SystemTab from "./SystemTab";\nimport HelpTab from "./HelpTab";'
  );
  
  // Add Sidebar nav item
  const helpNavItem = `
            <button
              className={\`settings-nav-item \${activeTab === "help" ? "active" : ""}\`}
              onClick={() => setActiveTab("help")}
            >
              Help & Guide
            </button>
          </div>
        </div>`;
        
  file = file.replace(
    '          </div>\n        </div>\n\n        <div className="settings-main">',
    helpNavItem + '\n\n        <div className="settings-main">'
  );
  
  // Add renderer
  file = file.replace(
    '{activeTab === "system" && <SystemTab />}',
    '{activeTab === "system" && <SystemTab />}\n            {activeTab === "help" && <HelpTab />}'
  );
  
  fs.writeFileSync('src/components/settings/SettingsModal.jsx', file);
}
