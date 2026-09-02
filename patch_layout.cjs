const fs = require('fs');
let file = fs.readFileSync('src/components/vault/ContainerDashboard.jsx', 'utf8');

const regex = /\{\/\* View Toggle \*\/\}\s*<div\s*style=\{\{\s*display: "flex",\s*backgroundColor: "var\(--bg-secondary\)",\s*borderRadius: "8px",\s*border: "1px solid var\(--glass-border\)",\s*padding: "4px",\s*\}\}\s*>\s*\{\/\* Add New Button \*\/\}\s*<div\s*onClick=\{([^}]+)\}\s*style=\{\{\s*display: "flex",\s*alignItems: "center",\s*gap: "8px",\s*backgroundColor: "var\(--accent\)",\s*color: "white",\s*padding: "10px 16px",\s*borderRadius: "24px",\s*cursor: "pointer",\s*fontWeight: 600,\s*fontSize: "14px",\s*boxShadow: "0 4px 12px rgba\(0, 0, 0, 0\.15\)",\s*marginRight: "16px",\s*transition: "transform 0\.1s ease-in-out",\s*\}\}\s*onMouseDown=\{([^}]+)\}\s*onMouseUp=\{([^}]+)\}\s*onMouseLeave=\{([^}]+)\}\s*>\s*<Book size=\{18\} \/> Add New\s*<\/div>/;

const replacement = `
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Add New Button */}
          <div
            onClick={$1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--accent)",
              color: "white",
              padding: "10px 16px",
              borderRadius: "24px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "transform 0.1s ease-in-out",
            }}
            onMouseDown={$2}
            onMouseUp={$3}
            onMouseLeave={$4}
          >
            <Book size={18} /> Add New
          </div>

          {/* View Toggle */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "8px",
              border: "1px solid var(--glass-border)",
              padding: "4px",
            }}
          >
`;

file = file.replace(regex, replacement);

// Since I opened a new wrapper `<div style={{ display: "flex", gap: "16px" }}>`, I need to close it after the View Toggle block!
// The View Toggle block ends right before `{viewMode === "grid" ? (`
file = file.replace(
  '        </div>\n      </div>\n\n      {viewMode === "grid"',
  '        </div>\n        </div>\n      </div>\n\n      {viewMode === "grid"'
);

fs.writeFileSync('src/components/vault/ContainerDashboard.jsx', file);
