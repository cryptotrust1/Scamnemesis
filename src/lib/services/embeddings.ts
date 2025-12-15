/**
 * Embeddings Service for Semantic Search
 * Uses OpenAI or local models to generate text embeddings
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 384; // Match pgvector dimension in schema

interface EmbeddingResult {
  success: boolean;
  embedding?: number[];
  error?: string;
}

/**
 * Generate text embedding using OpenAI API
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (!OPENAI_API_KEY) {
    console.warn('[Embeddings] OPENAI_API_KEY not set. Semantic search unavailable.');
    return { success: false, error: 'Embedding service not configured' };
  }

  if (!text || text.trim().length === 0) {
    return { success: false, error: 'Empty text provided' };
  }

  try {
    // Truncate text if too long (max 8192 tokens for embedding models)
    const truncatedText = text.slice(0, 8000);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: truncatedText,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[Embeddings] OpenAI API error:', error);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      return { success: false, error: 'Invalid embedding response' };
    }

    return { success: true, embedding };
  } catch (error) {
    console.error('[Embeddings] Error generating embedding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate embedding for a perpetrator name (for similarity search)
 */
export async function generateNameEmbedding(name: string): Promise<EmbeddingResult> {
  // Normalize and clean the name
  const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
  return generateEmbedding(normalizedName);
}

/**
 * Generate embedding for search query
 */
export async function generateSearchEmbedding(query: string): Promise<EmbeddingResult> {
  // Clean and prepare the search query
  const cleanedQuery = query.toLowerCase().trim();
  return generateEmbedding(cleanedQuery);
}

/**
 * Check if embedding service is available
 */
export function isEmbeddingServiceAvailable(): boolean {
  return !!OPENAI_API_KEY;
}

/**
 * Get the embedding dimensions being used
 */
export function getEmbeddingDimensions(): number {
  return EMBEDDING_DIMENSIONS;
}

export default {
  generateEmbedding,
  generateNameEmbedding,
  generateSearchEmbedding,
  isEmbeddingServiceAvailable,
  getEmbeddingDimensions,
};
