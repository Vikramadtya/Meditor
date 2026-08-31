const fs = require('fs');

let code = fs.readFileSync('src/components/vault/VaultSidebar.jsx', 'utf8');

const mapLogic = `            <VaultGroupNode key={g.id} group={g} />
          ))}
        </div>`;

const newMapLogic = `            {g.type === "note" ? (
              <VaultNode key={g.id} item={g} level={0} />
            ) : (
              <VaultGroupNode key={g.id} group={g} />
            )}
          </React.Fragment>
          ))}
        </div>`;

code = code.replace(
  `{vaultHierarchy.map((g) => (
            <VaultGroupNode key={g.id} group={g} />
          ))}`, 
  `{vaultHierarchy.map((g) => (
            <React.Fragment key={g.id}>
              {g.type === "note" ? <VaultNode item={g} level={0} /> : <VaultGroupNode group={g} />}
            </React.Fragment>
          ))}`
);

code = code.replace('import VaultGroupNode from "./sidebar/VaultGroupNode";', 'import VaultGroupNode from "./sidebar/VaultGroupNode";\nimport VaultNode from "./sidebar/VaultNode";');

fs.writeFileSync('src/components/vault/VaultSidebar.jsx', code);
console.log('Fixed VaultSidebar.jsx');
