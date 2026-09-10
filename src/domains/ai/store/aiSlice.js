export const createAiSlice = (set, get) => ({
  isAiPanelOpen: false,
  aiMessages: [],
  isAiGenerating: false,

  setAiPanelOpen: (isOpen) => set({ isAiPanelOpen: isOpen }),

  appendAiMessage: (message) =>
    set((state) => ({ aiMessages: [...state.aiMessages, message] })),

  updateLastAiMessage: (content, citations) =>
    set((state) => {
      const messages = [...state.aiMessages];
      if (messages.length > 0) {
        const lastIdx = messages.length - 1;
        messages[lastIdx] = {
          ...messages[lastIdx],
          content,
          citations,
        };
      }
      return { aiMessages: messages };
    }),

  setAiGenerating: (isGenerating) => set({ isAiGenerating: isGenerating }),

  clearAiChat: () => set({ aiMessages: [] }),
});
