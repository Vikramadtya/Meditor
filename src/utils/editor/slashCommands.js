export const slashCommands = (context) => {
  let word = context.matchBefore(/\/.*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: "/h1", type: "text", apply: "# ", info: "Heading 1" },
      { label: "/h2", type: "text", apply: "## ", info: "Heading 2" },
      {
        label: "/table",
        type: "text",
        apply: "| Header | Header |\n|--------|--------|\n| Cell   | Cell   |",
        info: "Table",
      },
      { label: "/code", type: "text", apply: "```\n\n```", info: "Code Block" },
      {
        label: "/mermaid",
        type: "text",
        apply: "```mermaid\ngraph TD;\n    A-->B;\n```",
        info: "Mermaid Flowchart",
      },
      { label: "/quote", type: "text", apply: "> ", info: "Blockquote" },
      {
        label: "/task",
        type: "text",
        apply: "- [ ] ",
        info: "Task Checkbox",
      },
      {
        label: "/meeting",
        type: "text",
        apply:
          "# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n- \n\n## Action Items\n- [ ] \n",
        info: "Meeting Notes Template",
      },
      {
        label: "/daily",
        type: "text",
        apply:
          "# Daily Journal\n\n## Intentions\n- \n\n## Log\n- \n\n## Reflection\n- \n",
        info: "Daily Journal Template",
      },
      {
        label: "/project",
        type: "text",
        apply:
          "# Project Plan\n\n## Overview\n\n## Goals\n- \n\n## Timeline\n- **Phase 1:** \n- **Phase 2:** \n",
        info: "Project Plan Template",
      },
      {
        label: "/bug",
        type: "text",
        apply:
          "# Bug Report\n\n**Issue:** \n\n**Steps to Reproduce:**\n1. \n2. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n",
        info: "Bug Report Template",
      },
    ],
  };
};
