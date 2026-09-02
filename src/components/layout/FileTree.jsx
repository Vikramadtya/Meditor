import { useShallow } from "zustand/react/shallow";
import { openFileFromSidebar } from "../../store/actions/index";
import React from "react";
import { Folder, FileText, CornerLeftUp } from "lucide-react";
import { useStore } from "../../core/store/index";

/**
 * Renders a list of files and directories for a sidebar.
 *
 * @param {Object} props - The component props.
 * @param {Array<{entry: string, type: string}>} props.files - The list of file entries to display.
 * @returns {React.ReactElement} The rendered file tree fragment.
 */
export function FileTree({ files }) {
  const { theme } = useStore(
    useShallow((s) => ({
      theme: s.theme,
    })),
  );
  return (
    <>
      {files.map((file, i) => {
        const isDir = file.type === "DIRECTORY";
        const isBack = file.entry === "..";
        return (
          <div
            key={i}
            className="file-item"
            onClick={() => openFileFromSidebar(file)}
          >
            {isBack ? (
              <CornerLeftUp size={14} color="var(--accent)" />
            ) : isDir ? (
              <Folder
                size={14}
                color={theme === "light" ? "#ca8a04" : "#facc15"}
              />
            ) : (
              <FileText size={14} />
            )}
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: isDir && !isBack ? "var(--text-primary)" : "inherit",
                fontWeight: isDir && !isBack ? 500 : 400,
              }}
            >
              {isBack ? "Go back" : file.entry}
            </span>
          </div>
        );
      })}
    </>
  );
}
