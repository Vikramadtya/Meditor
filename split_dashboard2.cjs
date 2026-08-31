const fs = require('fs');
const code = fs.readFileSync('src/components/vault/VaultDashboard.jsx', 'utf8');

const lines = code.split('\n');
const imports = lines.slice(0, 16).join('\n');
const globalDashboardContent = lines.slice(43, 397).join('\n'); // Everything inside "if (!activeVaultItem) { ... }"
const groupDashboardContent = lines.slice(399, 756).join('\n'); // Everything after "if (!activeVaultItem)"

const globalDashboardCode = imports + '\n\n' +
'export default function GlobalDashboard() {\n' +
'  const { activeVaultItem, openCreateVaultItemModal } = useStore();\n' +
'  const [todayNotes, setTodayNotes] = React.useState([]);\n' +
'  const [dashboardTab, setDashboardTab] = React.useState("overview");\n' +
'  const [agendaNotes, setAgendaNotes] = React.useState([]);\n' +
'  const [activeCardId, setActiveCardId] = React.useState(null);\n\n' +
'  React.useEffect(() => {\n' +
'    if (vaultRepository.db) {\n' +
'      const todayStart = startOfDay(new Date()).getTime();\n' +
'      try {\n' +
'        setTodayNotes(vaultRepository.findNotesEditedSince(todayStart));\n' +
'        setAgendaNotes(vaultRepository.getAgendaNotes());\n' +
'      } catch (e) {}\n' +
'    }\n' +
'  }, []);\n\n' +
  globalDashboardContent + '\n' +
'}\n';

const groupDashboardCode = imports + '\n\n' +
'export default function GroupDashboard() {\n' +
'  const { activeVaultItem, openCreateVaultItemModal } = useStore();\n' +
  groupDashboardContent + '\n' +
'}\n';

fs.writeFileSync('src/components/vault/GlobalDashboard.jsx', globalDashboardCode);
fs.writeFileSync('src/components/vault/GroupDashboard.jsx', groupDashboardCode);

// Update VaultApp.jsx
let appCode = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
appCode = appCode.replace('import VaultDashboard from "../components/vault/VaultDashboard";', 'import GlobalDashboard from "../components/vault/GlobalDashboard";\nimport GroupDashboard from "../components/vault/GroupDashboard";');
appCode = appCode.replace('  collection: CollectionDashboard,', '  group: GroupDashboard,\n  collection: CollectionDashboard,');
appCode = appCode.replace('<VaultDashboard />', '<GlobalDashboard />');
fs.writeFileSync('src/apps/VaultApp.jsx', appCode);

fs.unlinkSync('src/components/vault/VaultDashboard.jsx');
console.log('Split successfully!');
