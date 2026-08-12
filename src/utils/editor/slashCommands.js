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
    ],
  };
};
