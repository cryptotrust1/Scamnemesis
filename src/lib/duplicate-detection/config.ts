/**
 * Configuration and thresholds for duplicate detection
 * Allows A/B testing and tuning of detection parameters
 */

export interface DuplicateThresholds {
  // Fuzzy matching thresholds
  levenshteinMax: number;          // Max edit distance (deprecated, calculated dynamically)
  jaroWinklerMin: number;          // Min Jaro-Winkler similarity (0-1)
  ngramJaccardMin: number;         // Min n-gram Jaccard coefficient (0-1)

  // Vector similarity threshold
  vectorSimilarityMin: number;     // Min cosine similarity for embeddings (0-1)

  // Image hashing threshold
  imageHashDistanceMax: number;    // Max Hamming distance for image hashes

  // Overall confidence threshold
  overallConfidenceMin: number;    // Min confidence to flag as duplicate (0-1)
}

/**
 * Default balanced thresholds
 * Aims for ~80% precision, ~70% recall
 */
export const DEFAULT_THRESHOLDS: DuplicateThresholds = {
  levenshteinMax: 5,
  jaroWinklerMin: 0.85,
  ngramJaccardMin: 0.70,
  vectorSimilarityMin: 0.85,
  imageHashDistanceMax: 10,
  overallConfidenceMin: 0.75,
};

/**
 * Strict mode for high-confidence matches only
 * Aims for ~95% precision, ~50% recall
 * Use when false positives are very costly
 */
export const STRICT_THRESHOLDS: DuplicateThresholds = {
  levenshteinMax: 3,
  jaroWinklerMin: 0.90,
  ngramJaccardMin: 0.80,
  vectorSimilarityMin: 0.90,
  imageHashDistanceMax: 8,
  overallConfidenceMin: 0.85,
};

/**
 * Relaxed mode for catching more potential duplicates
 * Aims for ~60% precision, ~90% recall
 * Use when catching all duplicates is priority, admin will review
 */
export const RELAXED_THRESHOLDS: DuplicateThresholds = {
  levenshteinMax: 7,
  jaroWinklerMin: 0.75,
  ngramJaccardMin: 0.60,
  vectorSimilarityMin: 0.75,
  imageHashDistanceMax: 15,
  overallConfidenceMin: 0.60,
};

/**
 * Get thresholds by name
 */
export function getThresholds(
  name: 'default' | 'strict' | 'relaxed' = 'default'
): DuplicateThresholds {
  switch (name) {
    case 'strict':
      return STRICT_THRESHOLDS;
    case 'relaxed':
      return RELAXED_THRESHOLDS;
    default:
      return DEFAULT_THRESHOLDS;
  }
}

/** Database threshold record */
interface ThresholdRecord {
  levenshteinMax: number;
  jaroWinklerMin: number;
  ngramJaccardMin: number;
  vectorSimilarityMin: number;
  imageHashDistanceMax: number;
  overallConfidenceMin: number;
}

/** Database client interface for threshold loading */
interface ThresholdDbClient {
  duplicateThreshold: {
    findUnique: (args: { where: { id: string } }) => Promise<ThresholdRecord | null>;
    findFirst: (args: { where: { isDefault: boolean } }) => Promise<ThresholdRecord | null>;
  };
}

/**
 * Load thresholds from database (for A/B testing)
 */
export async function loadThresholdsFromDB(
  db: ThresholdDbClient,
  configId?: string
): Promise<DuplicateThresholds> {
  try {
    const config = configId
      ? await db.duplicateThreshold.findUnique({ where: { id: configId } })
      : await db.duplicateThreshold.findFirst({ where: { isDefault: true } });

    if (!config) {
      return DEFAULT_THRESHOLDS;
    }

    return {
      levenshteinMax: config.levenshteinMax,
      jaroWinklerMin: config.jaroWinklerMin,
      ngramJaccardMin: config.ngramJaccardMin,
      vectorSimilarityMin: config.vectorSimilarityMin,
      imageHashDistanceMax: config.imageHashDistanceMax,
      overallConfidenceMin: config.overallConfidenceMin,
    };
  } catch (error) {
    console.error('Error loading thresholds from DB:', error);
    return DEFAULT_THRESHOLDS;
  }
}

/**
 * Detection pipeline configuration
 */
export interface DetectionConfig {
  // Which detection methods to enable
  enableExactMatch: boolean;
  enableFuzzyMatch: boolean;
  enableVectorMatch: boolean;
  enableImageMatch: boolean;

  // Processing options
  syncExactMatch: boolean;        // Run exact match synchronously
  asyncFuzzyMatch: boolean;       // Run fuzzy match in background

  // Performance limits
  maxCandidates: number;          // Max candidates to check in fuzzy matching
  vectorSearchLimit: number;      // Max results from vector search
  timeoutMs: number;              // Max time for fuzzy detection

  // Thresholds
  thresholds: DuplicateThresholds;
}

export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  enableExactMatch: true,
  enableFuzzyMatch: true,
  enableVectorMatch: true,
  enableImageMatch: true,

  syncExactMatch: true,
  asyncFuzzyMatch: true,

  maxCandidates: 100,
  vectorSearchLimit: 50,
  timeoutMs: 30000, // 30 seconds

  thresholds: DEFAULT_THRESHOLDS,
};
