/* Custom Markdown-It Admonitions Plugin
 * Forked/Adapted to support MkDocs !!!, ???, and ???+ syntax
 */

const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join("");

function getTag(params) {
  const [tag = "", ..._title] = params.trim().split(" ");
  if (!tag) {
    return {};
  }
  const joined = _title.join(" ");
  const title = !joined
    ? capitalize(tag)
    : joined === '""'
      ? ""
      : joined.replace(/^"(.*)"$/, "$1"); // remove surrounding quotes
  return { tag: tag.toLowerCase(), title };
}

function validate(params) {
  const [tag = ""] = params.trim().split(" ", 1);
  return !!tag;
}

function renderDefault(tokens, idx, _options, env, slf) {
  return slf.renderToken(tokens, idx, _options, env, slf);
}

const minMarkers = 3;

function admonition(state, startLine, endLine, silent) {
  let pos;
  let nextLine;
  let token;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  const charCode = state.src.charCodeAt(start);
  // Check for '!' (33) or '?' (63)
  if (charCode !== 33 && charCode !== 63) {
    return false;
  }

  const markerStr = String.fromCharCode(charCode);

  for (pos = start + 1; pos <= max; pos++) {
    if (markerStr !== state.src[pos]) {
      break;
    }
  }

  const markerCount = pos - start;
  if (markerCount < minMarkers) {
    return false;
  }

  // Check if it's ???+ (open details)
  let isOpen = false;
  let isCollapsible = charCode === 63;
  let markerPos = pos;

  if (isCollapsible && state.src[markerPos] === "+") {
    isOpen = true;
    markerPos++;
  }

  const params = state.src.slice(markerPos, max).trim();
  const markup = state.src.slice(start, markerPos);

  if (!validate(params)) {
    return false;
  }

  if (silent) {
    return true;
  }

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldIndent = state.blkIndent;

  let blkStart = markerPos;
  for (; blkStart < max; blkStart += 1) {
    if (state.src[blkStart] !== " ") {
      break;
    }
  }
  state.parentType = "admonition";
  // MkDocs admonition content is always indented by exactly 4 spaces relative to the start
  state.blkIndent += 4;

  let wasEmpty = false;

  nextLine = startLine;
  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    const isEmpty = state.sCount[nextLine] < state.blkIndent;

    if (isEmpty && wasEmpty) {
      break;
    }
    wasEmpty = isEmpty;

    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
  }

  state.lineMax = nextLine;

  const { tag, title } = getTag(params);

  let blockTag = isCollapsible ? "details" : "div";

  token = state.push("admonition_open", blockTag, 1);
  token.markup = markup;
  token.block = true;
  token.attrs = [["class", `admonition ${tag}`]];
  if (isOpen) {
    token.attrs.push(["open", ""]);
  }
  token.meta = tag;
  token.content = title;
  token.info = params;
  token.map = [startLine, nextLine];

  if (title) {
    const titleMarkup = markup + " " + tag;
    let titleTag = isCollapsible ? "summary" : "p";

    token = state.push("admonition_title_open", titleTag, 1);
    token.markup = titleMarkup;
    token.attrs = [["class", "admonition-title"]];
    token.map = [startLine, startLine + 1];

    token = state.push("inline", "", 0);
    token.content = title;
    token.map = [startLine, startLine + 1];
    token.children = [];

    token = state.push("admonition_title_close", titleTag, -1);
    token.markup = titleMarkup;
  }

  state.md.block.tokenize(state, startLine + 1, nextLine);

  token = state.push("admonition_close", blockTag, -1);
  token.markup = state.src.slice(start, markerPos);
  token.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.blkIndent = oldIndent;
  state.line = nextLine;

  return true;
}

export default function admonitionPlugin(md, options = {}) {
  const render = options.render || renderDefault;

  md.renderer.rules.admonition_open = render;
  md.renderer.rules.admonition_close = render;
  md.renderer.rules.admonition_title_open = render;
  md.renderer.rules.admonition_title_close = render;

  md.block.ruler.before("fence", "admonition", admonition, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
}
