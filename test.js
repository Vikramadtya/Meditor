import { createStore } from "zustand/vanilla";

const fileService = {
  readDirectory: async () => [
    { entry: "file1.md", type: "FILE" },
    { entry: "folder1", type: "DIRECTORY" },
  ],
};

const store = createStore((set, get) => ({
  currentFolder: null,
  workspaceRoot: null,
  files: [],
  loadWorkspace: async (folderPath) => {
    try {
      set({ currentFolder: folderPath });
      let entries = await fileService.readDirectory(folderPath);
      let { workspaceRoot } = get();
      if (!workspaceRoot) {
        workspaceRoot = folderPath;
        set({ workspaceRoot });
      }
      if (
        folderPath.length > workspaceRoot.length &&
        folderPath.startsWith(workspaceRoot)
      ) {
        if (!entries.some((e) => e.entry === "..")) {
          entries.unshift({ entry: "..", type: "DIRECTORY" });
        }
      }
      set({ files: entries });
    } catch (err) {
      console.log(err);
    }
  },
}));

await store.getState().loadWorkspace("/some/path");
console.log(store.getState());
