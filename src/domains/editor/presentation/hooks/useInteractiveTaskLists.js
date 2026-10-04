import { useEffect } from "react";
import { useStore as useDocumentStore } from "../../../../core/store/index";
import { Logger } from "../../../../core/infrastructure/Logger";
import { Observability } from "../../../../core/infrastructure/Observability";

const logger = Logger.forContext("TaskLists");

/**
 * Hook to enable interactive task lists in rendered markdown.
 * Allows users to click on checkboxes in the preview to toggle their state in the markdown source.
 *
 * @param {import("react").RefObject<HTMLElement>} ref - Reference to the container element holding the rendered markdown.
 */
export function useInteractiveTaskLists(ref) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleClick = (e) => {
      if (
        e.target.tagName === "INPUT" &&
        e.target.type === "checkbox" &&
        e.target.classList.contains("task-list-item-checkbox")
      ) {
        // Prevent default so we can manage state ourselves
        e.preventDefault();

        // 1. Find index of this checkbox among all checkboxes in the container
        const allCheckboxes = Array.from(
          container.querySelectorAll(".task-list-item-checkbox"),
        );
        const index = allCheckboxes.indexOf(e.target);
        if (index === -1) return;

        const trace = Observability.startTrace("UI: Toggle Task Checkbox");
        trace.rootSpan.setAttribute("checkbox_index", index);
        const newChecked = !e.target.checked;
        trace.rootSpan.setAttribute("new_state", newChecked ? "checked" : "unchecked");
        logger.info(`Task checkbox #${index} toggled to ${newChecked ? "checked" : "unchecked"}`);

        // 2. We need the current markdown string
        const { markdown, setMarkdown } = useDocumentStore.getState();

        // 3. Regex to match task list items: e.g. "- [ ]" or "* [x]"
        const taskRegex = /^([ \t]*[-*+]\s+)\[([ xX])\]/gm;

        let matchCount = 0;
        let newMarkdown = markdown;

        // Use replace with a function to find the N-th match and modify it
        newMarkdown = markdown.replace(taskRegex, (match, prefix, char) => {
          if (matchCount === index) {
            matchCount++;
            // Toggle the character
            const newChar = char === " " || char === "" ? "x" : " ";
            return `${prefix}[${newChar}]`;
          }
          matchCount++;
          return match;
        });

        // 4. Update state
        if (newMarkdown !== markdown) {
          setMarkdown(newMarkdown);
          trace.end("ok");
        } else {
          logger.warn(`Task checkbox #${index} toggle produced no markdown change`);
          trace.end("noop");
        }
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [ref]);
}
