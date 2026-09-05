const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx', 'utf8');

// Add imports
code = code.replace(
  'import { FolderPlus, FileText, CircleDashed, Circle, Trash2 } from "lucide-react";',
  'import { FolderPlus, FileText, CircleDashed, Circle, Trash2, Edit2 } from "lucide-react";'
);

// Add state
code = code.replace(
  'const [hovered, setHovered] = useState(false);',
  'const [hovered, setHovered] = useState(false);\n  const [isEditing, setIsEditing] = useState(false);\n  const [editName, setEditName] = useState(item.name);'
);

// Add edit submission logic
const handleRename = `
  const submitRename = async () => {
    if (editName.trim() && editName.trim() !== item.name) {
      try {
        await vaultService.renameItem(item.type, item.id, item.path, editName.trim());
        reloadVaultHierarchy();
      } catch (e) {
        alert("Rename failed: " + e.message);
      }
    }
    setIsEditing(false);
  };
`;

code = code.replace(
  'const isNote = item.type === "note";',
  'const isNote = item.type === "note";\n' + handleRename
);

// Add rename button
code = code.replace(
  'color: "#ff5252",\n          }}\n        >\n          <Trash2 size={14} />\n        </div>',
  'color: "#ff5252",\n          }}\n        >\n          <Trash2 size={14} />\n        </div>\n        <div\n          onClick={async (e) => {\n            e.stopPropagation();\n            setEditName(item.name);\n            setIsEditing(true);\n          }}\n          style={{\n            opacity: hovered ? 1 : 0,\n            display: "flex",\n            alignItems: "center",\n            marginLeft: "4px",\n            color: "var(--accent)",\n          }}\n        >\n          <Edit2 size={14} />\n        </div>'
);

// Add edit input
code = code.replace(
  '<span\n            style={{\n              whiteSpace: "nowrap",\n              overflow: "hidden",\n              textOverflow: "ellipsis",\n            }}\n          >\n            {item.name}\n          </span>',
  `{isEditing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
                if (e.key === "Escape") setIsEditing(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text)",
                outline: "none",
                width: "100%",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </span>
          )}`
);

fs.writeFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx', code);
