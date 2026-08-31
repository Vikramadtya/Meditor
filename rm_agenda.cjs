const fs = require('fs');

let sidebar = fs.readFileSync('src/components/vault/VaultSidebar.jsx', 'utf8');
const agendaLink = `          <SidebarLink
            icon={<CalendarDays size={14} />}
            label="Agenda"
            isActive={activeVaultItem?.type === "agenda"}
            onClick={() =>
              setActiveVaultItem({ type: "agenda", id: "agenda", name: "Agenda" })
            }
          />`;
sidebar = sidebar.replace(agendaLink, '');
fs.writeFileSync('src/components/vault/VaultSidebar.jsx', sidebar);

let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace('import AgendaPage from "../components/vault/AgendaPage";\\n', '');
app = app.replace('  agenda: AgendaPage,\\n', '');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

if (fs.existsSync('src/components/vault/AgendaPage.jsx')) fs.unlinkSync('src/components/vault/AgendaPage.jsx');
