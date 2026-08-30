export default function wikilinksPlugin(md) {
  const wikilinkRegex = /\[\[(.*?)\]\]/;

  md.inline.ruler.push("wikilink", (state, silent) => {
    const match = wikilinkRegex.exec(state.src.slice(state.pos));
    if (!match) return false;

    // Check if the match is at the exact current position
    if (state.src.slice(state.pos).indexOf(match[0]) !== 0) return false;

    if (!silent) {
      const token = state.push("wikilink", "", 0);
      token.content = match[1];
    }

    state.pos += match[0].length;
    return true;
  });

  md.renderer.rules.wikilink = (tokens, idx) => {
    const noteName = tokens[idx].content;
    return `<a href="#" class="wikilink" data-note="${noteName}">${noteName}</a>`;
  };
}
