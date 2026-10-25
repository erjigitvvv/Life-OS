// ============================================================================
// Life-OS Digital Twin — Vector Memory & Semantic Embedding Engine
// Stage 2 of the 4-Stage Continuous Learning Closed-Loop
// ============================================================================

import { ActivityLog, activityLogger } from './activity-logger';

export interface VectorMemoryEntry {
  id: string;
  sourceId: string;
  sourceType: 'activity' | 'habit' | 'task' | 'finance' | 'reflection' | 'manual';
  content: string;
  embedding: number[];
  category: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ScoredMemory {
  entry: VectorMemoryEntry;
  similarity: number; // 0.0 to 1.0 (Cosine Similarity)
}

const VECTOR_STORAGE_KEY = 'lifeos_vector_memory_v1';
const EMBEDDING_DIM = 64; // High-performance semantic hash vector dimension

/**
 * Deterministic Semantic Vectorizer
 * Converts arbitrary text into a normalized vector in continuous embedding space.
 * Words with similar n-grams and contextual categories align closely in cosine distance.
 */
function generateSemanticEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().trim();
  const vector = new Array(EMBEDDING_DIM).fill(0);

  // Categorical keyword semantic priors
  const categoryPriors: Record<string, number[]> = {
    productivity: [0.8, 0.2, -0.4, 0.6, -0.1, 0.3, 0.5, -0.2],
    finance: [-0.3, 0.9, 0.7, -0.5, 0.8, 0.1, -0.4, 0.6],
    study: [0.7, 0.4, 0.9, 0.1, -0.3, 0.8, 0.2, -0.5],
    habits: [0.5, -0.2, 0.3, 0.8, 0.4, -0.6, 0.7, 0.1],
    health: [-0.4, -0.3, 0.2, 0.7, 0.9, 0.4, -0.2, 0.8],
    night: [-0.6, 0.1, -0.5, 0.2, 0.8, -0.7, 0.3, 0.4],
    morning: [0.9, 0.3, 0.6, 0.4, -0.2, 0.5, 0.8, -0.1],
  };

  // Apply category priors
  for (const [kw, prior] of Object.entries(categoryPriors)) {
    if (normalized.includes(kw)) {
      for (let i = 0; i < prior.length; i++) {
        vector[i % EMBEDDING_DIM] += prior[i] * 1.5;
      }
    }
  }

  // N-gram hashing with positional weights
  const words = normalized.split(/\s+/);
  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const word = words[wIdx];
    for (let i = 0; i < word.length - 1; i++) {
      const charCode1 = word.charCodeAt(i);
      const charCode2 = word.charCodeAt(i + 1);
      const hash = (charCode1 * 31 + charCode2 * 17 + wIdx * 7) % EMBEDDING_DIM;
      const weight = 1.0 / Math.sqrt(wIdx + 1);
      vector[hash] += weight * (charCode1 % 2 === 0 ? 1 : -1);
    }
  }

  // L2 Normalization (unit length vector for exact Cosine Similarity)
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Cosine Similarity between two normalized unit vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  // Clamp between 0.0 and 1.0
  return Math.max(0, Math.min(1, (dotProduct + 1) / 2));
}

class VectorMemoryService {
  private memories: VectorMemoryEntry[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      const stored = localStorage.getItem(VECTOR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memories = parsed;
          this.isInitialized = true;
          return;
        }
      }
      this.rebuildFromActivities();
    } catch {
      this.rebuildFromActivities();
    }
    this.isInitialized = true;
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(VECTOR_STORAGE_KEY, JSON.stringify(this.memories.slice(0, 500)));
    } catch (e) {
      console.warn('[VectorMemory] Error saving to storage:', e);
    }
  }

  /**
   * Rebuild or sync vector embeddings from the raw activity dataset
   */
  public rebuildFromActivities(): void {
    const activities = activityLogger.getActivities();
    const existingIds = new Set(this.memories.map((m) => m.sourceId));

    const newEntries: VectorMemoryEntry[] = [];
    for (const act of activities) {
      if (!existingIds.has(act.id)) {
        const content = act.semanticText;
        const embedding = generateSemanticEmbedding(content);
        newEntries.push({
          id: `vec-${act.id}`,
          sourceId: act.id,
          sourceType: 'activity',
          content,
          embedding,
          category: act.category,
          timestamp: act.timestamp,
          metadata: act.metadata,
        });
      }
    }

    this.memories = [...newEntries, ...this.memories];
    this.save();
  }

  /**
   * Embed and add a custom memory
   */
  public addMemory(params: {
    content: string;
    category: string;
    sourceType?: 'reflection' | 'manual' | 'habit' | 'task';
    metadata?: Record<string, any>;
  }): VectorMemoryEntry {
    this.init();
    const embedding = generateSemanticEmbedding(params.content);
    const entry: VectorMemoryEntry = {
      id: `vec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: `manual-${Date.now()}`,
      sourceType: params.sourceType || 'manual',
      content: params.content,
      embedding,
      category: params.category,
      timestamp: new Date().toISOString(),
      metadata: params.metadata || {},
    };

    this.memories = [entry, ...this.memories];
    this.save();
    return entry;
  }

  /**
   * Semantic Vector Search (RAG Engine for Digital Twin)
   * Finds the most semantically relevant memories to the given query
   */
  public search(query: string, topK: number = 5, categoryFilter?: string): ScoredMemory[] {
    this.init();
    if (!query.trim() || this.memories.length === 0) return [];

    const queryEmbedding = generateSemanticEmbedding(query);

    const scored: ScoredMemory[] = this.memories
      .filter((m) => !categoryFilter || m.category === categoryFilter)
      .map((entry) => ({
        entry,
        similarity: cosineSimilarity(queryEmbedding, entry.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, topK);
  }

  public getAllMemories(): VectorMemoryEntry[] {
    this.init();
    return [...this.memories];
  }

  public getMemoriesCount(): number {
    this.init();
    return this.memories.length;
  }
}

export const vectorMemory = new VectorMemoryService();
