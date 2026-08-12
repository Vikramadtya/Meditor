// markdown-it-mkdocs-tabs.js
export default function markdownItMkDocsTabs(md) {
  // Regex to match: === "Tab Title" or === “Tab Title”
  const tabRegex = /^===\s+["“]([^"”]+)["”]\s*$/;

  md.core.ruler.after("block", "mkdocs_tabs", (state) => {
    const tokens = state.tokens;
    let inTabGroup = false;
    let newTokens = [];

    // We need to group tabs together.
    let currentTabGroup = [];
    let currentTabName = null;
    let currentTabContent = [];

    const flushTabGroup = () => {
      if (currentTabGroup.length === 0) return;

      // Open Tab Group
      const groupOpen = new state.Token("tabs_open", "div", 1);
      groupOpen.attrPush(["class", "mkdocs-tabs"]);
      newTokens.push(groupOpen);

      // Render Tab Headers
      const navOpen = new state.Token("tabs_nav_open", "div", 1);
      navOpen.attrPush(["class", "mkdocs-tabs-nav"]);
      newTokens.push(navOpen);

      currentTabGroup.forEach((tab, index) => {
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

      // Render Tab Contents
      const contentGroupOpen = new state.Token(
        "tabs_content_group_open",
        "div",
        1,
      );
      contentGroupOpen.attrPush(["class", "mkdocs-tabs-content-group"]);
      newTokens.push(contentGroupOpen);

      currentTabGroup.forEach((tab, index) => {
        const paneOpen = new state.Token("tabs_pane_open", "div", 1);
        paneOpen.attrPush([
          "class",
          `mkdocs-tab-pane ${index === 0 ? "active" : ""}`,
        ]);
        paneOpen.attrPush(["data-tab-idx", index.toString()]);
        newTokens.push(paneOpen);

        // Push the inner tokens
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

      // Close Tab Group
      const groupClose = new state.Token("tabs_close", "div", -1);
      newTokens.push(groupClose);

      currentTabGroup = [];
      currentTabName = null;
      currentTabContent = [];
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Look for a paragraph containing exactly === "Title"
      if (token.type === "paragraph_open") {
        const inlineToken = tokens[i + 1];
        if (inlineToken && inlineToken.type === "inline") {
          const match = inlineToken.content.match(tabRegex);
          if (match) {
            // We found a tab!
            // Skip the paragraph_close
            i += 2;

            if (currentTabName !== null) {
              // Save the previous tab
              currentTabGroup.push({
                name: currentTabName,
                content: currentTabContent,
              });
              currentTabContent = [];
            }
            currentTabName = match[1];
            inTabGroup = true;
            continue;
          }
        }
      }

      if (inTabGroup) {
        currentTabContent.push(token);
      } else {
        newTokens.push(token);
      }
    }

    if (currentTabName !== null) {
      currentTabGroup.push({
        name: currentTabName,
        content: currentTabContent,
      });
      flushTabGroup();
    }

    state.tokens = newTokens;
  });
}
