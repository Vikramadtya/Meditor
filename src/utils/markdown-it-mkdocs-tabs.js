// Custom Markdown-It plugin for MkDocs Tabs
// Syntax:
// === "Tab 1"
//     Content 1
//
// === "Tab 2"
//     Content 2

function mkdocsTabs(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  const marker = state.src.slice(pos, max).trim();
  const match = marker.match(/^===\s+["“]([^"”]+)["”]\s*$/);
  if (!match) return false;

  if (silent) return true;

  const tabName = match[1];

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldIndent = state.blkIndent;

  state.parentType = "mkdocs_tab";
  // MkDocs tab content is indented by exactly 4 spaces
  state.blkIndent += 4;

  let nextLine = startLine;
  let wasEmpty = false;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) break;

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    const isEmpty = state.sCount[nextLine] < state.blkIndent;

    if (isEmpty && wasEmpty) break;
    wasEmpty = isEmpty;

    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
  }

  state.lineMax = nextLine;

  const token = state.push("mkdocs_tab_open", "div", 1);
  token.block = true;
  token.meta = { tabName };
  token.map = [startLine, nextLine];

  state.md.block.tokenize(state, startLine + 1, nextLine);

  const tokenClose = state.push("mkdocs_tab_close", "div", -1);
  tokenClose.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.blkIndent = oldIndent;
  state.line = nextLine;

  return true;
}

export default function markdownItMkDocsTabs(md) {
  md.block.ruler.before("fence", "mkdocs_tabs", mkdocsTabs, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // Now we need to group adjacent mkdocs_tab tokens into a tab group
  md.core.ruler.after("block", "mkdocs_tabs_group", (state) => {
    const tokens = state.tokens;
    let newTokens = [];
    let i = 0;

    while (i < tokens.length) {
      if (tokens[i].type === "mkdocs_tab_open") {
        let tabs = [];
        let j = i;
        while (j < tokens.length && tokens[j].type === "mkdocs_tab_open") {
          let tabOpenToken = tokens[j];
          let tabContent = [];
          let depth = 1;
          let k = j + 1;
          while (k < tokens.length) {
            if (tokens[k].type === "mkdocs_tab_open") depth++;
            if (tokens[k].type === "mkdocs_tab_close") depth--;
            if (depth === 0) {
              break;
            }
            tabContent.push(tokens[k]);
            k++;
          }
          tabs.push({
            name: tabOpenToken.meta.tabName,
            content: tabContent,
          });
          j = k + 1;
        }

        // Output grouped tabs
        const groupOpen = new state.Token("tabs_open", "div", 1);
        groupOpen.attrPush(["class", "mkdocs-tabs"]);
        newTokens.push(groupOpen);

        const navOpen = new state.Token("tabs_nav_open", "div", 1);
        navOpen.attrPush(["class", "mkdocs-tabs-nav"]);
        newTokens.push(navOpen);

        tabs.forEach((tab, index) => {
          const btnOpen = new state.Token("tabs_btn_open", "button", 1);
          btnOpen.attrPush([
            "class",
            `mkdocs-tab-btn ${index === 0 ? "active" : ""}`,
          ]);
          btnOpen.attrPush(["data-tab-idx", index.toString()]);
          newTokens.push(btnOpen);

          const btnText = new state.Token("text", "", 0);
          btnText.content = tab.name;
          newTokens.push(btnText);

          const btnClose = new state.Token("tabs_btn_close", "button", -1);
          newTokens.push(btnClose);
        });

        const navClose = new state.Token("tabs_nav_close", "div", -1);
        newTokens.push(navClose);

        const contentGroupOpen = new state.Token(
          "tabs_content_group_open",
          "div",
          1,
        );
        contentGroupOpen.attrPush(["class", "mkdocs-tabs-content-group"]);
        newTokens.push(contentGroupOpen);

        tabs.forEach((tab, index) => {
          const paneOpen = new state.Token("tabs_pane_open", "div", 1);
          paneOpen.attrPush([
            "class",
            `mkdocs-tab-pane ${index === 0 ? "active" : ""}`,
          ]);
          paneOpen.attrPush(["data-tab-idx", index.toString()]);
          newTokens.push(paneOpen);

          newTokens = newTokens.concat(tab.content);

          const paneClose = new state.Token("tabs_pane_close", "div", -1);
          newTokens.push(paneClose);
        });

        const contentGroupClose = new state.Token(
          "tabs_content_group_close",
          "div",
          -1,
        );
        newTokens.push(contentGroupClose);

        const groupClose = new state.Token("tabs_close", "div", -1);
        newTokens.push(groupClose);

        i = j;
      } else {
        newTokens.push(tokens[i]);
        i++;
      }
    }
    state.tokens = newTokens;
  });
}
