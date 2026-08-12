export default function customRulesPlugin(md, options = {}) {
  const customRules = options.customRules || [];
  if (customRules.length === 0) return;

  md.core.ruler.push("custom_rules", function (state) {
    // Compile regexes once
    const rules = customRules
      .map((rule) => {
        if (!rule.regex || !rule.htmlTemplate) return null;
        try {
          // ensure regex has global flag
          let flags = "g";
          let source = rule.regex;
          if (source.startsWith("/") && source.lastIndexOf("/") > 0) {
            const lastIdx = source.lastIndexOf("/");
            flags = source.substring(lastIdx + 1);
            if (!flags.includes("g")) flags += "g";
            source = source.substring(1, lastIdx);
          }
          return {
            regex: new RegExp(source, flags),
            htmlTemplate: rule.htmlTemplate,
            name: rule.name,
          };
        } catch (e) {
          console.warn(`Invalid regex in custom rule [${rule.name}]`, e);
          return null;
        }
      })
      .filter(Boolean);

    if (rules.length === 0) return;

    for (let i = 0; i < state.tokens.length; i++) {
      const blockToken = state.tokens[i];
      if (blockToken.type !== "inline") continue;

      let children = blockToken.children;
      let newChildren = [];

      for (let j = 0; j < children.length; j++) {
        const token = children[j];
        if (token.type !== "text") {
          newChildren.push(token);
          continue;
        }

        let currentTokens = [token];

        // Apply each rule sequentially to the text tokens
        for (const rule of rules) {
          let nextTokens = [];
          for (const t of currentTokens) {
            if (t.type !== "text") {
              nextTokens.push(t);
              continue;
            }

            let text = t.content;
            rule.regex.lastIndex = 0;
            let match;
            let lastIndex = 0;

            while ((match = rule.regex.exec(text)) !== null) {
              if (match.index > lastIndex) {
                let textToken = new state.Token("text", "", 0);
                textToken.content = text.substring(lastIndex, match.index);
                nextTokens.push(textToken);
              }

              let htmlToken = new state.Token("html_inline", "", 0);
              let html = rule.htmlTemplate;
              // Safe replacement of $1, $2, etc.
              for (let k = 1; k < match.length; k++) {
                let val = match[k] || "";
                html = html.split(`$${k}`).join(md.utils.escapeHtml(val));
              }
              htmlToken.content = html;
              nextTokens.push(htmlToken);

              lastIndex = rule.regex.lastIndex;
              if (match.index === rule.regex.lastIndex) {
                rule.regex.lastIndex++;
              }
            }

            if (lastIndex < text.length) {
              let textToken = new state.Token("text", "", 0);
              textToken.content = text.substring(lastIndex);
              nextTokens.push(textToken);
            }
          }
          currentTokens = nextTokens;
        }

        newChildren = newChildren.concat(currentTokens);
      }
      blockToken.children = newChildren;
    }
  });
}
