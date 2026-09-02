const fs = require('fs');
let file = fs.readFileSync('src/hooks/useMermaidRenderer.js', 'utf8');

const replacement = `
            const id = \`mermaid-svg-\${Date.now()}-\${i}-\${currentEffectId}\`;

            // Queue mermaid renders to prevent concurrent render errors
            const { svg, error } = await new Promise((resolve) => {
              mermaidRenderQueue = mermaidRenderQueue
                .then(async () => {
                  if (!isMounted || currentEffectId !== effectIdRef.current) {
                    resolve({ svg: null });
                    return;
                  }
                  try {
                    const result = await mermaid.render(id, rawText);
                    resolve({ svg: result.svg });
                  } catch (e) {
                    resolve({ error: e.message || String(e) });
                  }
                })
                .catch((err) => {
                  resolve({ error: err.message || String(err) });
                });
            });

            if (svg || error) {
              const div = document.createElement("div");
              div.className = "mermaid-diagram";
              if (svg) {
                div.innerHTML = svg;
                mermaidCache.set(rawText, svg);
              } else if (error) {
                div.innerHTML = \`<pre style="color: red; padding: 12px; border: 1px solid red; border-radius: 4px; overflow-x: auto;">Mermaid Error:\\n\${error}</pre>\`;
              }
              parent.replaceWith(div);
            }
`;

// Replace from 'const id =' up to the end of the loop
file = file.replace(/const id = \`mermaid-svg-\[\^;\]+;\n\n\s+\/\/ Queue mermaid renders[\s\S]+?parent\.replaceWith\(div\);\n\s+\}/, replacement);

fs.writeFileSync('src/hooks/useMermaidRenderer.js', file);
