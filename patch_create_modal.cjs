const fs = require('fs');

let file = fs.readFileSync('src/components/modals/CreateVaultItemModal.jsx', 'utf8');

// Replace the hook setup to allow state for "selectedType"
file = file.replace(
  '  const [name, setName] = useState("");',
  `  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("note");
  const [allowedTypes, setAllowedTypes] = useState(["note", "container"]);`
);

// Add the logic to fetch contents and lock type
file = file.replace(
  '  useEffect(() => {\n    if (isOpen) setName("");\n  }, [isOpen]);',
  `  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedType(type === "auto" || !type ? "note" : type);
      setAllowedTypes(["note", "container"]);
      
      // Enforce the rule: only one type of children per container
      if (parentId) {
        vaultService.getFolderContents(parentId).then(children => {
          const hasNotes = children.some(c => c.type === "note");
          const hasContainers = children.some(c => c.type === "container");
          if (hasNotes && !hasContainers) {
            setAllowedTypes(["note"]);
            setSelectedType("note");
          } else if (hasContainers && !hasNotes) {
            setAllowedTypes(["container"]);
            setSelectedType("container");
          }
        });
      }
    }
  }, [isOpen, type, parentId]);`
);

// Use selectedType in submit
file = file.replace(
  'if (type === "note") {',
  'if (selectedType === "note") {'
);

// Update title and icon based on selectedType
file = file.replace(
  '{type === "note" ? (',
  '{selectedType === "note" ? ('
);
file = file.replace(
  '{type === "note" ? "Create Note" : "Create Folder"}',
  '{selectedType === "note" ? "Create Note" : "Create Folder"}'
);

// Update placeholder
file = file.replace(
  'type === "note"\n                  ? "e.g., REST API Design"\n                  : "e.g., Backend Architecture"',
  'selectedType === "note" ? "e.g., REST API Design" : "e.g., Backend Architecture"'
);

// Add the switch right before the Name input (if allowedTypes.length > 1)
const switchHtml = `
          {allowedTypes.length > 1 && (
            <div style={{ marginBottom: "20px", display: "flex", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", padding: "4px" }}>
              <div 
                onClick={() => setSelectedType("container")}
                style={{
                  flex: 1, textAlign: "center", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  backgroundColor: selectedType === "container" ? "var(--bg-primary)" : "transparent",
                  color: selectedType === "container" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: selectedType === "container" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                }}
              >Folder/Collection</div>
              <div 
                onClick={() => setSelectedType("note")}
                style={{
                  flex: 1, textAlign: "center", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  backgroundColor: selectedType === "note" ? "var(--bg-primary)" : "transparent",
                  color: selectedType === "note" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: selectedType === "note" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                }}
              >Note</div>
            </div>
          )}
          <div`;

file = file.replace('<div\n            style={{\n              marginBottom: "20px",\n            }}\n          >', switchHtml);

fs.writeFileSync('src/components/modals/CreateVaultItemModal.jsx', file);
