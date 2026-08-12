import MarkdownItRegexp from "markdown-it-regexp";

export default function customRulesPlugin(md, options = {}) {
  const customRules = options.customRules || [];

  customRules.forEach((rule) => {
    if (!rule.regex || !rule.htmlTemplate) return;

    try {
      // Safely parse regex. Example user input: "\\$\\$de\\$\\$(.*?)\\$\\$de\\$\\$"
      // Note: user doesn't wrap in /.../
      const regex = new RegExp(rule.regex);

      // Create a specific plugin for this rule
      const rulePlugin = MarkdownItRegexp(regex, function (match, utils) {
        // match[0] is the full match, match[1...n] are capture groups
        let html = rule.htmlTemplate;

        // Perform safe replacements of capture groups like $1, $2, etc.
        // And escape the contents to prevent XSS (since we emit raw HTML tokens)
        for (let i = 1; i < match.length; i++) {
          const groupVal = match[i] || "";
          html = html.split(`$${i}`).join(utils.escape(groupVal));
        }

        return html;
      });

      // Register the generated plugin with the parser
      md.use(rulePlugin);
    } catch (err) {
      console.warn(`Failed to compile custom rule [${rule.name}]:`, err);
    }
  });
}
