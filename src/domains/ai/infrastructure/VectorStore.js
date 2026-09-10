import { vaultRepository } from "../../vault/infrastructure/SqliteVaultRepository";

class VectorStore {
  constructor() {
    this.vectors = [];
  }

  loadVectors() {
    if (!vaultRepository.db) return;
    try {
      const rows = vaultRepository._queryAll(
        "SELECT id, note_id, chunk_index, content, embedding FROM note_chunks",
      );
      this.vectors = rows
        .map((row) => {
          try {
            return {
              id: row.id,
              noteId: row.note_id,
              chunkIndex: row.chunk_index,
              content: row.content,
              embedding: JSON.parse(row.embedding),
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    } catch (e) {
      console.error("Failed to load vectors", e);
    }
  }

  addChunks(noteId, chunks) {
    if (!vaultRepository.db) return;
    try {
      // Delete old chunks for this note
      vaultRepository._run("DELETE FROM note_chunks WHERE note_id = ?", [
        noteId,
      ]);

      // Insert new chunks
      for (const chunk of chunks) {
        vaultRepository._run(
          "INSERT INTO note_chunks (id, note_id, chunk_index, content, embedding) VALUES (?, ?, ?, ?, ?)",
          [
            chunk.id,
            noteId,
            chunk.chunkIndex,
            chunk.content,
            JSON.stringify(chunk.embedding),
          ],
        );
      }

      // Reload into memory
      this.loadVectors();
    } catch (e) {
      console.error("Failed to add chunks", e);
    }
  }

  search(queryEmbedding, topK = 5) {
    if (this.vectors.length === 0) this.loadVectors();
    if (
      this.vectors.length === 0 ||
      !queryEmbedding ||
      queryEmbedding.length === 0
    )
      return [];

    const similarities = this.vectors.map((vec) => {
      return {
        ...vec,
        score: this.cosineSimilarity(queryEmbedding, vec.embedding),
      };
    });

    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, topK);
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const vectorStore = new VectorStore();
