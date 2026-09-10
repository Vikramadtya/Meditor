import { useSettingsStore } from "../../settings/application/settingsStore";

class LlmClient {
  async *stream(messages) {
    const { aiConfig } = useSettingsStore.getState();
    if (!aiConfig.llmUrl) throw new Error("LLM URL is not configured");

    const headers = {
      "Content-Type": "application/json",
    };
    if (aiConfig.apiKey) {
      headers["Authorization"] = `Bearer ${aiConfig.apiKey}`;
    }

    const body = JSON.stringify({
      model: aiConfig.modelName || "llama3",
      messages,
      stream: true,
    });

    const response = await fetch(aiConfig.llmUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`LLM Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content || "";
              if (content) yield content;
            } catch (e) {
              console.warn("Failed to parse LLM stream chunk", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const llmClient = new LlmClient();
