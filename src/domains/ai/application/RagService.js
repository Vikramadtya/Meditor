import { embeddingService } from "../infrastructure/EmbeddingService";
import { vectorStore } from "../infrastructure/VectorStore";
import { llmClient } from "../infrastructure/LlmClient";
import { vaultRepository } from "../../vault/infrastructure/SqliteVaultRepository";
import { useSettingsStore } from "../../settings/application/settingsStore";

class RagService {
  /**
   * Splits markdown text into manageable chunks.
   * Simple logic: splits by double newline, grouping small paragraphs.
   */
  _chunkText(text, maxChars = 1000) {
    const paragraphs = text.split(/\n\n+/);
    const chunks = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if ((currentChunk + p).length > maxChars && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      currentChunk += p + "\n\n";
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }

  async indexNote(noteId, markdownContent) {
    if (!markdownContent || !markdownContent.trim()) return;

    const rawChunks = this._chunkText(markdownContent);
    const chunks = [];

    for (let i = 0; i < rawChunks.length; i++) {
      const content = rawChunks[i];
      const embedding = await embeddingService.embed(content);
      if (embedding.length > 0) {
        chunks.push({
          id: `${noteId}-chunk-${i}`,
          chunkIndex: i,
          content,
          embedding,
        });
      }
    }

    if (chunks.length > 0) {
      vectorStore.addChunks(noteId, chunks);
    }
  }

  async *ask(userQuery, chatHistory = []) {
    const queryEmbedding = await embeddingService.embed(userQuery);

    // Retrieve context
    const topChunks = vectorStore.search(queryEmbedding, 5);

    // Gather citations
    const citationsMap = new Map();
    let contextText = "";

    for (let i = 0; i < topChunks.length; i++) {
      const chunk = topChunks[i];
      const note = vaultRepository.getNoteById(chunk.noteId);
      if (note) {
        citationsMap.set(note.id, note);
        contextText += `--- Document: ${note.name} ---\n${chunk.content}\n\n`;
      }
    }

    const citations = Array.from(citationsMap.values());
    const { aiConfig } = useSettingsStore.getState();

    const systemPrompt = `${aiConfig.systemPrompt}\n\nUse the following retrieved context to answer the query:\n${contextText}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: userQuery },
    ];

    let fullResponse = "";
    for await (const chunk of llmClient.stream(messages)) {
      fullResponse += chunk;
      yield { chunk, citations, fullResponse };
    }
  }
}

export const ragService = new RagService();
