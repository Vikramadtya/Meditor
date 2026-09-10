import { pipeline, env } from "@xenova/transformers";

// Disable local model checks to avoid accessing local fs directly via Node fs module in Neutralino
env.allowLocalModels = false;

class EmbeddingService {
  constructor() {
    this.modelName = "Xenova/all-MiniLM-L6-v2";
    this.pipelinePromise = null;
  }

  async getPipeline() {
    if (!this.pipelinePromise) {
      this.pipelinePromise = pipeline("feature-extraction", this.modelName);
    }
    return this.pipelinePromise;
  }

  async embed(text) {
    if (!text || !text.trim()) return [];
    try {
      const extractor = await this.getPipeline();
      const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
      });
      return Array.from(output.data);
    } catch (err) {
      console.error("EmbeddingService error:", err);
      return [];
    }
  }
}

export const embeddingService = new EmbeddingService();
