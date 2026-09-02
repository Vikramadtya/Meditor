const fs = require('fs');
let file = fs.readFileSync('src/components/modals/git/GitStatusView.jsx', 'utf8');

file = file.replace(
  'handleCommitAll,\n  handleReviewSync,',
  'handleReviewCommit,\n  handleSyncVault,'
);

file = file.replace(
  'onClick={handleCommitAll}',
  'onClick={handleReviewCommit}'
);

file = file.replace(
  'onClick={handleReviewSync}',
  'onClick={handleSyncVault}'
);

fs.writeFileSync('src/components/modals/git/GitStatusView.jsx', file);
