const fs = require('fs');

const code = fs.readFileSync('src/components/vault/VaultDashboard.jsx', 'utf8');

// The imports are everything up to line 15
const lines = code.split('\n');
const imports = lines.slice(0, 16).join('\n');

const globalDashboardContent = lines.slice(42, 397).join('\n'); // Everything inside "if (!activeVaultItem) { ... }"

const groupDashboardContent = lines.slice(398, 756).join('\n'); // Everything after "if (!activeVaultItem)"

const globalDashboardCode = \`\${imports}

export default function GlobalDashboard() {
  const { activeVaultItem, openCreateVaultItemModal } = useStore();
  const [todayNotes, setTodayNotes] = React.useState([]);
  const [dashboardTab, setDashboardTab] = React.useState("overview");
  const [agendaNotes, setAgendaNotes] = React.useState([]);
  const [activeCardId, setActiveCardId] = React.useState(null);

  React.useEffect(() => {
    if (vaultRepository.db) {
      const todayStart = startOfDay(new Date()).getTime();
      try {
        setTodayNotes(vaultRepository.findNotesEditedSince(todayStart));
        setAgendaNotes(vaultRepository.getAgendaNotes());
      } catch (e) {}
    }
  }, []);

\${globalDashboardContent}
}
\`;

const groupDashboardCode = \`\${imports}

export default function GroupDashboard() {
  const { activeVaultItem, openCreateVaultItemModal } = useStore();
\${groupDashboardContent}
}
\`;

fs.writeFileSync('src/components/vault/GlobalDashboard.jsx', globalDashboardCode);
fs.writeFileSync('src/components/vault/GroupDashboard.jsx', groupDashboardCode);

// Update VaultApp.jsx
let appCode = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
appCode = appCode.replace('import VaultDashboard from "../components/vault/VaultDashboard";', 'import GlobalDashboard from "../components/vault/GlobalDashboard";\\nimport GroupDashboard from "../components/vault/GroupDashboard";');
appCode = appCode.replace('  collection: CollectionDashboard,', '  group: GroupDashboard,\\n  collection: CollectionDashboard,');
appCode = appCode.replace('<VaultDashboard />', '<GlobalDashboard />');
fs.writeFileSync('src/apps/VaultApp.jsx', appCode);

// Delete the old VaultDashboard
fs.unlinkSync('src/components/vault/VaultDashboard.jsx');

console.log('Split VaultDashboard into GlobalDashboard and GroupDashboard');
