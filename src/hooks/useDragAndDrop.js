import { useMemo } from "react";
import { EditorView } from "@codemirror/view";
import toast from "react-hot-toast";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";

export function useDragAndDrop(currentFolder, imageSavePath, setMarkdown) {
  return useMemo(() => {
    return EditorView.domEventHandlers({
      drop(event, view) {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0 && files[0].type.startsWith("image/")) {
          event.preventDefault();
          const file = files[0];

          // Get the exact document position where the image was dropped
          const posObj = view.posAtCoords({
            x: event.clientX,
            y: event.clientY,
          });
          if (!posObj) return false;
          const pos = typeof posObj === "object" ? posObj.pos : posObj;

          if (!currentFolder) {
            toast.error("Please open a workspace folder first!");
            return true;
          }

          (async () => {
            try {
              // Create the directory if it doesn't exist
              const saveDirName = imageSavePath || "./images";
              const cleanSaveDirName = saveDirName.replace(/^\.\//, "");
              const destFolder = `${currentFolder}/${cleanSaveDirName}`;

              await fileService.createDirectory(destFolder);

              const destPath = `${destFolder}/${file.name}`;

              // Use FileReader to extract the ArrayBuffer and write it natively
              const reader = new FileReader();
              reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                await fileService.writeBinaryFile(destPath, arrayBuffer);

                // Insert the markdown image text
                const insertText = `![${file.name}](${saveDirName}/${file.name})`;
                view.dispatch({
                  changes: { from: pos, to: pos, insert: insertText },
                });

                // Update Zustand store so the changes persist
                setMarkdown(view.state.doc.toString());
                toast.success("Image saved and inserted!");
                logger.info(
                  `Successfully processed dropped image: ${file.name}`,
                );
              };
              reader.onerror = () => {
                toast.error("Failed to read dropped file");
              };
              reader.readAsArrayBuffer(file);
            } catch (err) {
              toast.error("Failed to save image");
              logger.error("Drop error", err);
            }
          })();
          return true; // Stop browser from opening the image full screen
        }
        return false;
      },
    });
  }, [currentFolder, imageSavePath, setMarkdown]);
}
