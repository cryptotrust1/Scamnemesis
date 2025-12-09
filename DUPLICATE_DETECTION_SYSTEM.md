# Duplicate Detection System - Scamnemesis

Kompletný ML/data engineering systém pre detekciu duplicitných fraud reportov.

---

## 1. EXACT MATCH DETECTION

### Unique Identifiers (Immediate Duplicate Flag)

Tieto polia sú považované za **primárne unikátne identifikátory**. Ak sa zhodujú, report je automaticky označený ako potenciálny duplicita.

| Field | Normalization | Case Sensitivity |
|-------|---------------|------------------|
| Phone number | Remove spaces, dashes, +/00 prefix | Case-insensitive |
| Email | Lowercase, trim whitespace | Case-insensitive |
| IBAN | Remove spaces, uppercase | Case-insensitive |
| Crypto wallet (ETH) | Checksum format | Case-sensitive |
| Crypto wallet (BTC) | Base58 decoded | Case-insensitive |
| License plate/SPZ | Remove spaces, uppercase | Case-insensitive |
| VIN | Uppercase, remove spaces | Case-insensitive |

### Normalization Functions

```typescript
// src/lib/duplicate-detection/normalizers.ts

/**
 * Normalize phone number to E.164-like format
 * Examples:
 *   "+421 911 123 456" -> "421911123456"
 *   "00421-911-123-456" -> "421911123456"
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // Remove leading zeros or + prefix
  normalized = normalized.replace(/^00/, '');

  // Return null if less than 9 digits (invalid phone)
  if (normalized.length < 9) return null;

  return normalized;
}

/**
 * Normalize email address
 * Examples:
 *   "  John.Doe@Example.COM  " -> "john.doe@example.com"
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return null;

  return trimmed;
}

/**
 * Normalize IBAN
 * Examples:
 *   "SK31 1200 0000 1987 4263 7541" -> "SK3112000000198742637541"
 */
export function normalizeIBAN(iban: string | null | undefined): string | null {
  if (!iban) return null;

  // Remove spaces and convert to uppercase
  const normalized = iban.replace(/\s/g, '').toUpperCase();

  // Basic IBAN validation (2 letters + 2 digits + up to 30 alphanumeric)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  if (!ibanRegex.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize crypto wallet address
 */
export function normalizeCryptoWallet(
  address: string | null | undefined,
  type: 'BTC' | 'ETH' | 'OTHER'
): string | null {
  if (!address) return null;

  const trimmed = address.trim();

  switch (type) {
    case 'ETH':
      // Ethereum addresses are case-sensitive (EIP-55 checksum)
      if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
      return trimmed; // Keep original case for checksum validation

    case 'BTC':
      // Bitcoin addresses - case insensitive for matching
      if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(trimmed)) {
        return null;
      }
      return trimmed.toLowerCase();

    default:
      return trimmed.toLowerCase();
  }
}

/**
 * Normalize license plate/SPZ
 * Examples:
 *   "BA 123 XY" -> "BA123XY"
 *   "ba-123-xy" -> "BA123XY"
 */
export function normalizeLicensePlate(plate: string | null | undefined): string | null {
  if (!plate) return null;

  // Remove spaces, dashes, and convert to uppercase
  const normalized = plate.replace(/[\s\-]/g, '').toUpperCase();

  // Must be 3-10 alphanumeric characters
  if (!/^[A-Z0-9]{3,10}$/.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize VIN (Vehicle Identification Number)
 * Examples:
 *   "1hgbh41jxmn109186" -> "1HGBH41JXMN109186"
 */
export function normalizeVIN(vin: string | null | undefined): string | null {
  if (!vin) return null;

  // Remove spaces and convert to uppercase
  const normalized = vin.replace(/\s/g, '').toUpperCase();

  // VIN must be exactly 17 characters, no I, O, Q
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize company registration number (IČO for Slovakia/Czech)
 */
export function normalizeCompanyID(companyId: string | null | undefined): string | null {
  if (!companyId) return null;

  // Remove spaces and leading zeros
  const normalized = companyId.replace(/\s/g, '').replace(/^0+/, '');

  // Must be digits only
  if (!/^\d+$/.test(normalized)) return null;

  return normalized;
}
```

---

## 2. FUZZY/NEAR-EXACT MATCHING

### Name Matching Algorithms

```typescript
// src/lib/duplicate-detection/fuzzy-matchers.ts

import * as natural from 'natural';

/**
 * Levenshtein distance (edit distance)
 * Returns number of single-character edits needed
 */
export function levenshteinDistance(str1: string, str2: string): number {
  return natural.LevenshteinDistance(str1, str2);
}

/**
 * Jaro-Winkler similarity
 * Returns value between 0 (completely different) and 1 (identical)
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  return natural.JaroWinklerDistance(str1, str2);
}

/**
 * N-gram (trigram) Jaccard coefficient
 * Returns value between 0 and 1
 */
export function ngramJaccardSimilarity(
  str1: string,
  str2: string,
  n: number = 3
): number {
  const ngrams1 = getNgrams(str1.toLowerCase(), n);
  const ngrams2 = getNgrams(str2.toLowerCase(), n);

  const intersection = ngrams1.filter(gram => ngrams2.includes(gram));
  const union = [...new Set([...ngrams1, ...ngrams2])];

  return union.length === 0 ? 0 : intersection.length / union.length;
}

function getNgrams(str: string, n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= str.length - n; i++) {
    ngrams.push(str.slice(i, i + n));
  }
  return ngrams;
}

/**
 * Soundex phonetic algorithm
 * Converts names to phonetic representation
 */
export function soundex(str: string): string {
  return natural.Soundex.process(str);
}

/**
 * Metaphone phonetic algorithm (better for non-English)
 */
export function metaphone(str: string): string {
  return natural.Metaphone.process(str);
}

/**
 * Combined name matching with configurable thresholds
 */
export interface NameMatchResult {
  isMatch: boolean;
  confidence: number; // 0-1
  methods: {
    levenshtein: { distance: number; threshold: number; passed: boolean };
    jaroWinkler: { similarity: number; threshold: number; passed: boolean };
    ngram: { similarity: number; threshold: number; passed: boolean };
    soundex: { match: boolean };
  };
}

export function matchNames(
  name1: string,
  name2: string,
  thresholds: DuplicateThresholds
): NameMatchResult {
  const normalized1 = name1.toLowerCase().trim();
  const normalized2 = name2.toLowerCase().trim();

  const maxLength = Math.max(normalized1.length, normalized2.length);
  const levenshteinThreshold = maxLength <= 10 ? 3 : 5;

  const levDist = levenshteinDistance(normalized1, normalized2);
  const jaroWink = jaroWinklerSimilarity(normalized1, normalized2);
  const ngramSim = ngramJaccardSimilarity(normalized1, normalized2);
  const soundex1 = soundex(normalized1);
  const soundex2 = soundex(normalized2);

  const levPassed = levDist <= levenshteinThreshold;
  const jaroPassed = jaroWink >= thresholds.jaroWinklerMin;
  const ngramPassed = ngramSim >= thresholds.ngramJaccardMin;
  const soundexPassed = soundex1 === soundex2;

  // Calculate confidence score (weighted average)
  const weights = {
    levenshtein: 0.3,
    jaroWinkler: 0.3,
    ngram: 0.3,
    soundex: 0.1
  };

  const confidence =
    (levPassed ? weights.levenshtein : 0) +
    (jaroPassed ? weights.jaroWinkler : 0) +
    (ngramPassed ? weights.ngram : 0) +
    (soundexPassed ? weights.soundex : 0);

  // Match if at least 2 methods pass
  const passedCount = [levPassed, jaroPassed, ngramPassed].filter(Boolean).length;
  const isMatch = passedCount >= 2 || soundexPassed && passedCount >= 1;

  return {
    isMatch,
    confidence,
    methods: {
      levenshtein: { distance: levDist, threshold: levenshteinThreshold, passed: levPassed },
      jaroWinkler: { similarity: jaroWink, threshold: thresholds.jaroWinklerMin, passed: jaroPassed },
      ngram: { similarity: ngramSim, threshold: thresholds.ngramJaccardMin, passed: ngramPassed },
      soundex: { match: soundexPassed }
    }
  };
}
```

### Address Matching

```typescript
// src/lib/duplicate-detection/address-matcher.ts

export interface AddressMatchResult {
  isMatch: boolean;
  confidence: number;
  details: {
    streetMatch: boolean;
    cityMatch: boolean;
    zipMatch: boolean;
  };
}

/**
 * Tokenize address for comparison
 */
function tokenizeAddress(address: string): {
  street: string[];
  city: string;
  zip: string;
} {
  const normalized = address.toLowerCase().trim();

  // Extract ZIP code (various formats)
  const zipMatch = normalized.match(/\b\d{3}\s?\d{2}\b|\b\d{5}\b/);
  const zip = zipMatch ? zipMatch[0].replace(/\s/g, '') : '';

  // Simple tokenization (in production, use proper address parser)
  const tokens = normalized.split(/[,\n]/);
  const street = tokens[0]?.split(/\s+/) || [];
  const city = tokens[1]?.trim() || '';

  return { street, city, zip };
}

/**
 * Match two addresses with fuzzy logic
 */
export function matchAddresses(
  address1: string,
  address2: string,
  thresholds: DuplicateThresholds
): AddressMatchResult {
  const addr1 = tokenizeAddress(address1);
  const addr2 = tokenizeAddress(address2);

  // ZIP exact match
  const zipMatch = addr1.zip === addr2.zip && addr1.zip.length > 0;

  // City fuzzy match
  const cityJaro = jaroWinklerSimilarity(addr1.city, addr2.city);
  const cityMatch = cityJaro >= 0.85;

  // Street fuzzy match (check if tokens overlap significantly)
  const streetTokens1 = new Set(addr1.street);
  const streetTokens2 = new Set(addr2.street);
  const intersection = [...streetTokens1].filter(t => streetTokens2.has(t));
  const union = new Set([...streetTokens1, ...streetTokens2]);
  const streetJaccard = intersection.length / union.size;
  const streetMatch = streetJaccard >= 0.5;

  // Overall confidence
  let confidence = 0;
  if (zipMatch) confidence += 0.4;
  if (cityMatch) confidence += 0.3;
  if (streetMatch) confidence += 0.3;

  const isMatch = confidence >= 0.6;

  return {
    isMatch,
    confidence,
    details: {
      streetMatch,
      cityMatch,
      zipMatch
    }
  };
}
```

### Configurable Thresholds

```typescript
// src/lib/duplicate-detection/config.ts

export interface DuplicateThresholds {
  // Fuzzy matching thresholds
  levenshteinMax: number;          // Max edit distance
  jaroWinklerMin: number;          // Min Jaro-Winkler similarity (0-1)
  ngramJaccardMin: number;         // Min n-gram Jaccard coefficient (0-1)

  // Vector similarity threshold
  vectorSimilarityMin: number;     // Min cosine similarity for embeddings (0-1)

  // Image hashing threshold
  imageHashDistanceMax: number;    // Max Hamming distance for image hashes

  // Overall confidence threshold
  overallConfidenceMin: number;    // Min confidence to flag as duplicate (0-1)
}

export const DEFAULT_THRESHOLDS: DuplicateThresholds = {
  levenshteinMax: 5,
  jaroWinklerMin: 0.85,
  ngramJaccardMin: 0.7,
  vectorSimilarityMin: 0.85,
  imageHashDistanceMax: 10,
  overallConfidenceMin: 0.75
};

// Strict mode for high-confidence matches only
export const STRICT_THRESHOLDS: DuplicateThresholds = {
  levenshteinMax: 3,
  jaroWinklerMin: 0.90,
  ngramJaccardMin: 0.80,
  vectorSimilarityMin: 0.90,
  imageHashDistanceMax: 8,
  overallConfidenceMin: 0.85
};

// Relaxed mode for catching more potential duplicates
export const RELAXED_THRESHOLDS: DuplicateThresholds = {
  levenshteinMax: 7,
  jaroWinklerMin: 0.75,
  ngramJaccardMin: 0.60,
  vectorSimilarityMin: 0.75,
  imageHashDistanceMax: 15,
  overallConfidenceMin: 0.60
};
```

---

## 3. VECTOR SIMILARITY

### Text Embeddings Setup

```python
# services/ml/embeddings.py

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict
import torch

class EmbeddingService:
    """
    Service for generating and comparing text embeddings
    Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

    Supports: 50+ languages including Slovak, Czech, English
    Embedding dimension: 384
    """

    def __init__(self, model_name: str = 'paraphrase-multilingual-MiniLM-L12-v2'):
        self.model = SentenceTransformer(model_name)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)

    def create_report_text(self, report: Dict) -> str:
        """
        Combine report fields into single text for embedding
        """
        parts = []

        if report.get('scammer_name'):
            parts.append(f"Meno: {report['scammer_name']}")

        if report.get('company_name'):
            parts.append(f"Firma: {report['company_name']}")

        if report.get('description'):
            parts.append(f"Popis: {report['description']}")

        if report.get('address'):
            parts.append(f"Adresa: {report['address']}")

        if report.get('website'):
            parts.append(f"Web: {report['website']}")

        return " | ".join(parts)

    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate 384-dimensional embedding vector
        """
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding

    def batch_generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts efficiently
        """
        embeddings = self.model.encode(texts, convert_to_numpy=True, batch_size=32)
        return embeddings

    def cosine_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        Returns value between -1 and 1 (typically 0 to 1 for similar texts)
        """
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))

    def find_similar_reports(
        self,
        query_embedding: np.ndarray,
        candidate_embeddings: List[np.ndarray],
        threshold: float = 0.85
    ) -> List[tuple[int, float]]:
        """
        Find reports with similarity above threshold
        Returns list of (index, similarity_score) tuples
        """
        similarities = []

        for idx, candidate in enumerate(candidate_embeddings):
            sim = self.cosine_similarity(query_embedding, candidate)
            if sim >= threshold:
                similarities.append((idx, sim))

        # Sort by similarity descending
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities
```

### Vector Database Integration

```sql
-- PostgreSQL with pgvector extension
-- Install: CREATE EXTENSION vector;

-- Migration: Add vector column to reports table
ALTER TABLE fraud_reports
ADD COLUMN embedding vector(384);

-- Create HNSW index for fast approximate nearest neighbor search
CREATE INDEX ON fraud_reports
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Example query: Find similar reports
SELECT
  id,
  scammer_name,
  description,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM fraud_reports
WHERE 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) > 0.85
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

```typescript
// src/lib/duplicate-detection/vector-search.ts

import { db } from '@/lib/db';

export interface VectorSearchResult {
  reportId: string;
  similarity: number;
  report: any;
}

export async function findSimilarReportsByVector(
  embedding: number[],
  threshold: number = 0.85,
  limit: number = 10,
  excludeIds: string[] = []
): Promise<VectorSearchResult[]> {
  const embeddingStr = `[${embedding.join(',')}]`;

  const results = await db.$queryRaw`
    SELECT
      id as "reportId",
      scammer_name,
      company_name,
      description,
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM fraud_reports
    WHERE
      1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
      ${excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.join(',')})` : ''}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return results as VectorSearchResult[];
}
```

### Alternative: Weaviate Vector DB

```python
# services/ml/weaviate_client.py

import weaviate
from typing import List, Dict

class WeaviateVectorDB:
    """
    Alternative to pgvector using Weaviate
    Advantages: Better scaling, built-in ML models, GraphQL API
    """

    def __init__(self, url: str = "http://localhost:8080"):
        self.client = weaviate.Client(url)
        self._init_schema()

    def _init_schema(self):
        """Create Weaviate schema for fraud reports"""
        schema = {
            "class": "FraudReport",
            "description": "Fraud report with vector embeddings",
            "vectorizer": "none",  # We provide our own embeddings
            "properties": [
                {"name": "reportId", "dataType": ["string"]},
                {"name": "scammerName", "dataType": ["text"]},
                {"name": "description", "dataType": ["text"]},
                {"name": "reportText", "dataType": ["text"]},
                {"name": "createdAt", "dataType": ["date"]},
            ]
        }

        # Create class if not exists
        if not self.client.schema.exists("FraudReport"):
            self.client.schema.create_class(schema)

    def add_report(self, report_id: str, text: str, embedding: List[float], metadata: Dict):
        """Add report with embedding to Weaviate"""
        data_object = {
            "reportId": report_id,
            "scammerName": metadata.get("scammer_name"),
            "description": metadata.get("description"),
            "reportText": text,
            "createdAt": metadata.get("created_at"),
        }

        self.client.data_object.create(
            data_object=data_object,
            class_name="FraudReport",
            vector=embedding
        )

    def search_similar(
        self,
        embedding: List[float],
        threshold: float = 0.85,
        limit: int = 10
    ) -> List[Dict]:
        """Search for similar reports using vector similarity"""
        result = (
            self.client.query
            .get("FraudReport", ["reportId", "scammerName", "description", "reportText"])
            .with_near_vector({
                "vector": embedding,
                "certainty": threshold  # Weaviate uses certainty (0-1)
            })
            .with_limit(limit)
            .do()
        )

        return result.get("data", {}).get("Get", {}).get("FraudReport", [])
```

---

## 4. IMAGE DUPLICATE DETECTION

### Perceptual Hashing Implementation

```python
# services/ml/image_hashing.py

from PIL import Image
import imagehash
from typing import Dict, Tuple, List
import io
import requests

class ImageDuplicateDetector:
    """
    Detect duplicate/similar images using perceptual hashing

    Hash types:
    - pHash: Robust to scaling, aspect ratio, color changes
    - aHash: Fast, good for exact duplicates
    - dHash: Good for detecting gradients/edges
    """

    def __init__(self, hash_size: int = 8):
        self.hash_size = hash_size

    def compute_image_hashes(self, image_path: str) -> Dict[str, str]:
        """
        Compute multiple perceptual hashes for an image

        Args:
            image_path: Local path or URL to image

        Returns:
            Dictionary with hash types and their hex values
        """
        try:
            # Load image
            if image_path.startswith('http'):
                response = requests.get(image_path)
                img = Image.open(io.BytesIO(response.content))
            else:
                img = Image.open(image_path)

            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')

            # Compute hashes
            p_hash = imagehash.phash(img, hash_size=self.hash_size)
            a_hash = imagehash.average_hash(img, hash_size=self.hash_size)
            d_hash = imagehash.dhash(img, hash_size=self.hash_size)
            w_hash = imagehash.whash(img, hash_size=self.hash_size)  # Wavelet hash

            return {
                'phash': str(p_hash),
                'ahash': str(a_hash),
                'dhash': str(d_hash),
                'whash': str(w_hash),
            }

        except Exception as e:
            print(f"Error computing hashes for {image_path}: {e}")
            return {}

    def hamming_distance(self, hash1: str, hash2: str) -> int:
        """
        Calculate Hamming distance between two hashes
        (Number of differing bits)
        """
        h1 = imagehash.hex_to_hash(hash1)
        h2 = imagehash.hex_to_hash(hash2)
        return h1 - h2

    def compare_images(
        self,
        hashes1: Dict[str, str],
        hashes2: Dict[str, str],
        threshold: int = 10
    ) -> Tuple[bool, Dict[str, int]]:
        """
        Compare two sets of image hashes

        Args:
            hashes1, hashes2: Hash dictionaries from compute_image_hashes()
            threshold: Max Hamming distance to consider as duplicate

        Returns:
            (is_duplicate, distances_dict)
        """
        distances = {}

        for hash_type in ['phash', 'ahash', 'dhash', 'whash']:
            if hash_type in hashes1 and hash_type in hashes2:
                dist = self.hamming_distance(hashes1[hash_type], hashes2[hash_type])
                distances[hash_type] = dist

        # Image is duplicate if ANY hash is below threshold
        # (strict), or if AVERAGE is below threshold (relaxed)
        if not distances:
            return False, {}

        min_distance = min(distances.values())
        avg_distance = sum(distances.values()) / len(distances)

        # Use weighted decision: phash is most reliable
        weighted_score = (
            distances.get('phash', 100) * 0.5 +
            distances.get('dhash', 100) * 0.3 +
            distances.get('ahash', 100) * 0.2
        )

        is_duplicate = weighted_score <= threshold

        return is_duplicate, distances

    def find_duplicate_images(
        self,
        target_hashes: Dict[str, str],
        candidate_list: List[Dict[str, any]],
        threshold: int = 10
    ) -> List[Dict]:
        """
        Find duplicate images from a list of candidates

        Args:
            target_hashes: Hashes of the image to check
            candidate_list: List of dicts with 'id' and 'hashes' keys
            threshold: Hamming distance threshold

        Returns:
            List of matching candidates with similarity scores
        """
        duplicates = []

        for candidate in candidate_list:
            is_dup, distances = self.compare_images(
                target_hashes,
                candidate['hashes'],
                threshold
            )

            if is_dup:
                duplicates.append({
                    'id': candidate['id'],
                    'distances': distances,
                    'avg_distance': sum(distances.values()) / len(distances),
                })

        # Sort by average distance (lower = more similar)
        duplicates.sort(key=lambda x: x['avg_distance'])
        return duplicates
```

### Database Schema for Image Hashes

```sql
-- Store image hashes in database
CREATE TABLE report_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50), -- 'profile', 'screenshot', 'document', etc.

  -- Perceptual hashes
  phash VARCHAR(64),
  ahash VARCHAR(64),
  dhash VARCHAR(64),
  whash VARCHAR(64),

  -- Metadata
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10), -- 'jpg', 'png', etc.

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_report_images_report_id (report_id),
  INDEX idx_report_images_phash (phash),
  INDEX idx_report_images_ahash (ahash)
);
```

### TypeScript Integration

```typescript
// src/lib/duplicate-detection/image-matcher.ts

import axios from 'axios';

export interface ImageHashes {
  phash: string;
  ahash: string;
  dhash: string;
  whash: string;
}

export interface ImageMatchResult {
  isDuplicate: boolean;
  distances: {
    phash?: number;
    ahash?: number;
    dhash?: number;
    whash?: number;
  };
  avgDistance: number;
}

/**
 * Call Python ML service to compute image hashes
 */
export async function computeImageHashes(imageUrl: string): Promise<ImageHashes> {
  const response = await axios.post('http://localhost:8000/ml/compute-image-hash', {
    image_url: imageUrl
  });

  return response.data.hashes;
}

/**
 * Compare two sets of image hashes
 */
export function compareImageHashes(
  hashes1: ImageHashes,
  hashes2: ImageHashes,
  threshold: number = 10
): ImageMatchResult {
  const distances: Record<string, number> = {};

  // Calculate Hamming distances for each hash type
  for (const hashType of ['phash', 'ahash', 'dhash', 'whash'] as const) {
    if (hashes1[hashType] && hashes2[hashType]) {
      distances[hashType] = hammingDistance(hashes1[hashType], hashes2[hashType]);
    }
  }

  const distanceValues = Object.values(distances);
  const avgDistance = distanceValues.reduce((a, b) => a + b, 0) / distanceValues.length;

  // Weighted score (phash is most reliable)
  const weightedScore =
    (distances.phash ?? 100) * 0.5 +
    (distances.dhash ?? 100) * 0.3 +
    (distances.ahash ?? 100) * 0.2;

  const isDuplicate = weightedScore <= threshold;

  return {
    isDuplicate,
    distances,
    avgDistance
  };
}

/**
 * Calculate Hamming distance between two hex hash strings
 */
function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 999;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    distance += xor.toString(2).split('1').length - 1; // Count bits
  }

  return distance;
}
```

---

## 5. DUPLICATE CLUSTERING

### Clustering Algorithm

```typescript
// src/lib/duplicate-detection/clustering.ts

import { db } from '@/lib/db';

export interface DuplicateMatch {
  reportId1: string;
  reportId2: string;
  matchType: 'exact' | 'fuzzy' | 'vector' | 'image';
  confidence: number;
  matchedFields: string[];
  details: Record<string, any>;
}

export interface DuplicateCluster {
  id: string;
  primaryReportId: string;
  reportIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Main duplicate detection and clustering service
 */
export class DuplicateClusteringService {

  /**
   * Process a new report for duplicate detection
   *
   * Flow:
   * 1. Synchronous exact match check (fast)
   * 2. Asynchronous fuzzy + vector + image check (slower)
   * 3. Create or update cluster if matches found
   */
  async processReport(reportId: string): Promise<{
    hasDuplicates: boolean;
    clusterId?: string;
    matches: DuplicateMatch[];
  }> {
    // Step 1: Synchronous exact match check
    const exactMatches = await this.findExactMatches(reportId);

    if (exactMatches.length > 0) {
      const clusterId = await this.addToCluster(reportId, exactMatches);
      return {
        hasDuplicates: true,
        clusterId,
        matches: exactMatches
      };
    }

    // Step 2: Asynchronous fuzzy/vector/image check
    // This runs in background job queue (e.g., Bull, BullMQ)
    await this.queueFuzzyDetection(reportId);

    return {
      hasDuplicates: false,
      matches: []
    };
  }

  /**
   * Find exact matches using normalized unique identifiers
   */
  private async findExactMatches(reportId: string): Promise<DuplicateMatch[]> {
    const report = await db.fraudReport.findUnique({
      where: { id: reportId },
      include: { normalizedFields: true }
    });

    if (!report) return [];

    const matches: DuplicateMatch[] = [];
    const { normalizedFields } = report;

    // Check each unique identifier
    const uniqueFields = [
      'normalizedPhone',
      'normalizedEmail',
      'normalizedIBAN',
      'normalizedCryptoWallet',
      'normalizedLicensePlate',
      'normalizedVIN',
      'normalizedCompanyID'
    ];

    for (const field of uniqueFields) {
      const value = normalizedFields[field];
      if (!value) continue;

      // Find other reports with same normalized value
      const duplicates = await db.fraudReport.findMany({
        where: {
          id: { not: reportId },
          normalizedFields: {
            [field]: value
          }
        },
        select: { id: true }
      });

      for (const dup of duplicates) {
        matches.push({
          reportId1: reportId,
          reportId2: dup.id,
          matchType: 'exact',
          confidence: 1.0,
          matchedFields: [field],
          details: { [field]: value }
        });
      }
    }

    return matches;
  }

  /**
   * Queue fuzzy detection job (runs asynchronously)
   */
  private async queueFuzzyDetection(reportId: string): Promise<void> {
    // Add to job queue (e.g., Bull/BullMQ, Celery, etc.)
    await queue.add('fuzzy-duplicate-detection', {
      reportId,
      timestamp: new Date()
    });
  }

  /**
   * Perform comprehensive fuzzy matching
   * This is CPU-intensive, runs in background worker
   */
  async performFuzzyDetection(reportId: string): Promise<DuplicateMatch[]> {
    const report = await db.fraudReport.findUnique({
      where: { id: reportId },
      include: { images: true }
    });

    if (!report) return [];

    const matches: DuplicateMatch[] = [];

    // 1. Name matching
    const nameMatches = await this.findNameMatches(report);
    matches.push(...nameMatches);

    // 2. Address matching
    const addressMatches = await this.findAddressMatches(report);
    matches.push(...addressMatches);

    // 3. Vector similarity
    const vectorMatches = await this.findVectorMatches(report);
    matches.push(...vectorMatches);

    // 4. Image similarity
    const imageMatches = await this.findImageMatches(report);
    matches.push(...imageMatches);

    // If high-confidence matches found, create/update cluster
    const highConfidenceMatches = matches.filter(m => m.confidence >= 0.75);
    if (highConfidenceMatches.length > 0) {
      await this.addToCluster(reportId, highConfidenceMatches);
    }

    return matches;
  }

  /**
   * Add report to existing cluster or create new cluster
   */
  private async addToCluster(
    reportId: string,
    matches: DuplicateMatch[]
  ): Promise<string> {
    // Find existing clusters for matched reports
    const matchedReportIds = matches.map(m => m.reportId2);

    const existingCluster = await db.duplicateCluster.findFirst({
      where: {
        reportIds: {
          hasSome: matchedReportIds
        }
      }
    });

    if (existingCluster) {
      // Add to existing cluster
      await db.duplicateCluster.update({
        where: { id: existingCluster.id },
        data: {
          reportIds: {
            push: reportId
          },
          updatedAt: new Date()
        }
      });

      // Save match records
      await this.saveMatches(existingCluster.id, matches);

      return existingCluster.id;
    } else {
      // Create new cluster
      const newCluster = await db.duplicateCluster.create({
        data: {
          primaryReportId: reportId,
          reportIds: [reportId, ...matchedReportIds],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      await this.saveMatches(newCluster.id, matches);

      return newCluster.id;
    }
  }

  /**
   * Save individual match records
   */
  private async saveMatches(clusterId: string, matches: DuplicateMatch[]): Promise<void> {
    await db.duplicateMatch.createMany({
      data: matches.map(m => ({
        clusterId,
        reportId1: m.reportId1,
        reportId2: m.reportId2,
        matchType: m.matchType,
        confidence: m.confidence,
        matchedFields: m.matchedFields,
        details: m.details,
        createdAt: new Date()
      }))
    });
  }

  // Placeholder methods (implement with actual matching logic)
  private async findNameMatches(report: any): Promise<DuplicateMatch[]> {
    // Use matchNames() from fuzzy-matchers.ts
    return [];
  }

  private async findAddressMatches(report: any): Promise<DuplicateMatch[]> {
    // Use matchAddresses() from address-matcher.ts
    return [];
  }

  private async findVectorMatches(report: any): Promise<DuplicateMatch[]> {
    // Use findSimilarReportsByVector() from vector-search.ts
    return [];
  }

  private async findImageMatches(report: any): Promise<DuplicateMatch[]> {
    // Use compareImageHashes() from image-matcher.ts
    return [];
  }
}
```

### Background Job Worker

```typescript
// workers/duplicate-detection-worker.ts

import { Queue, Worker } from 'bullmq';
import { DuplicateClusteringService } from '@/lib/duplicate-detection/clustering';

const duplicateQueue = new Queue('duplicate-detection', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

const worker = new Worker(
  'duplicate-detection',
  async (job) => {
    const { reportId } = job.data;

    const service = new DuplicateClusteringService();
    const matches = await service.performFuzzyDetection(reportId);

    console.log(`Found ${matches.length} potential duplicates for report ${reportId}`);

    return { matches };
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    },
    concurrency: 5 // Process 5 reports in parallel
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export { duplicateQueue, worker };
```

---

## 6. ADMIN UI FOR DUPLICATES

### Wireframe Design

```
┌─────────────────────────────────────────────────────────────────────┐
│  DUPLICATE CLUSTERS                                    [Settings ⚙] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Filters: [All] [High Confidence] [Needs Review]  🔍 Search...      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⚠ Cluster #47  (4 reports)              Confidence: 92%    │  │
│  │                                                    [Expand ▼] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⚠ Cluster #46  (2 reports)              Confidence: 78%    │  │
│  │                                                    [Expand ▶] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

EXPANDED VIEW:
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠ Cluster #47  (4 reports)                Confidence: 92%       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PRIMARY REPORT  ⭐                                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Report #1234                                                  │  │
│  │ Name: Ján Novák                                              │  │
│  │ Phone: +421911123456 ✓ MATCH                                │  │
│  │ Email: jan.novak@example.com ✓ MATCH                        │  │
│  │ Description: "Falošná investícia..."                         │  │
│  │ Submitted: 2025-12-01 14:23                                  │  │
│  │                                            [View Full Report] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  LINKED REPORTS (3)                                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Report #1235                            Match: 95% ████████  │  │
│  │ Name: Jan Novak (fuzzy match)          ⚡ Auto-detected     │  │
│  │ Phone: +421911123456 ✓                                       │  │
│  │ Email: jan.novak@example.com ✓                              │  │
│  │ Matched fields: phone, email, name (Jaro-Winkler: 0.92)     │  │
│  │ Submitted: 2025-12-01 16:45                                  │  │
│  │                                [View] [Unlink] [Same Person] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Report #1240                            Match: 88% ███████   │  │
│  │ Name: Ján Nováček                       🖼 Image similar     │  │
│  │ Phone: +421911999888                                         │  │
│  │ Email: different@example.com                                 │  │
│  │ Matched: name (soundex), description (vector: 0.89), image  │  │
│  │ Submitted: 2025-12-02 09:12                                  │  │
│  │                                [View] [Unlink] [Different]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Report #1248                            Match: 81% ██████    │  │
│  │ Name: J. Novák                          👤 Manual review     │  │
│  │ Phone: +421911123456 ✓                                       │  │
│  │ Matched: phone, name (partial)                               │  │
│  │ Submitted: 2025-12-03 11:30                                  │  │
│  │                                [View] [Unlink] [Same Person] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  CLUSTER ACTIONS:                                                    │
│  [Merge All into Primary] [Unmerge Cluster] [Mark as Reviewed]     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### React Component Implementation

```typescript
// src/components/admin/DuplicateClusters.tsx

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ChevronDown, ChevronRight, Check, X } from 'lucide-react';

interface DuplicateClusterProps {
  clusters: DuplicateClusterData[];
}

export function DuplicateClusters({ clusters }: DuplicateClusterProps) {
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'review'>('all');

  const filteredClusters = clusters.filter(cluster => {
    if (filter === 'high') return cluster.confidence >= 0.85;
    if (filter === 'review') return !cluster.reviewed;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Duplicate Clusters</h2>
        <Button variant="outline">Settings</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'high' ? 'default' : 'outline'}
          onClick={() => setFilter('high')}
        >
          High Confidence
        </Button>
        <Button
          variant={filter === 'review' ? 'default' : 'outline'}
          onClick={() => setFilter('review')}
        >
          Needs Review
        </Button>
      </div>

      {/* Cluster List */}
      <div className="space-y-3">
        {filteredClusters.map(cluster => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            isExpanded={expandedClusterId === cluster.id}
            onToggle={() => setExpandedClusterId(
              expandedClusterId === cluster.id ? null : cluster.id
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ClusterCard({ cluster, isExpanded, onToggle }: {
  cluster: DuplicateClusterData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const confidenceColor =
    cluster.confidence >= 0.9 ? 'text-red-600' :
    cluster.confidence >= 0.75 ? 'text-orange-600' :
    'text-yellow-600';

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className={confidenceColor} size={20} />
            <CardTitle>
              Cluster #{cluster.id} ({cluster.reportIds.length} reports)
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              Confidence: {(cluster.confidence * 100).toFixed(0)}%
            </Badge>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Primary Report */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">PRIMARY REPORT</span>
              <Badge>⭐</Badge>
            </div>
            <ReportSummary report={cluster.primaryReport} isPrimary />
          </div>

          {/* Linked Reports */}
          <div>
            <h4 className="font-semibold mb-2">
              LINKED REPORTS ({cluster.linkedReports.length})
            </h4>
            <div className="space-y-2">
              {cluster.linkedReports.map(linkedReport => (
                <LinkedReportCard
                  key={linkedReport.reportId}
                  linkedReport={linkedReport}
                  clusterId={cluster.id}
                />
              ))}
            </div>
          </div>

          {/* Cluster Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="default">Merge All into Primary</Button>
            <Button variant="outline">Unmerge Cluster</Button>
            <Button variant="ghost">Mark as Reviewed</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function LinkedReportCard({ linkedReport, clusterId }: {
  linkedReport: LinkedReport;
  clusterId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleUnlink = async () => {
    setLoading(true);
    await fetch(`/api/admin/duplicates/${clusterId}/unlink`, {
      method: 'POST',
      body: JSON.stringify({ reportId: linkedReport.reportId })
    });
    setLoading(false);
    // Refresh data
  };

  const handleMarkSamePerson = async () => {
    setLoading(true);
    await fetch(`/api/admin/duplicates/${clusterId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ reportId: linkedReport.reportId })
    });
    setLoading(false);
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-semibold">Report #{linkedReport.reportId}</div>
            <div className="text-sm text-gray-600">
              {linkedReport.detectionMethod === 'auto' && '⚡ Auto-detected'}
              {linkedReport.hasImageMatch && ' 🖼 Image similar'}
              {linkedReport.needsReview && ' 👤 Manual review'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">
              Match: {(linkedReport.confidence * 100).toFixed(0)}%
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${linkedReport.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>

        <ReportSummary report={linkedReport.report} />

        {/* Matched Fields */}
        <div className="mt-2 text-sm text-gray-600">
          <strong>Matched:</strong> {linkedReport.matchedFields.join(', ')}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline">View</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnlink}
            disabled={loading}
          >
            Unlink
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleMarkSamePerson}
            disabled={loading}
          >
            <Check size={16} className="mr-1" />
            Same Person
          </Button>
          <Button size="sm" variant="ghost">
            <X size={16} className="mr-1" />
            Different
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportSummary({ report, isPrimary = false }: {
  report: any;
  isPrimary?: boolean;
}) {
  return (
    <div className="space-y-1 text-sm">
      <div>
        <strong>Name:</strong> {report.scammerName}
      </div>
      {report.phone && (
        <div>
          <strong>Phone:</strong> {report.phone}
          {report.phoneMatched && <Check className="inline ml-1 text-green-600" size={16} />}
        </div>
      )}
      {report.email && (
        <div>
          <strong>Email:</strong> {report.email}
          {report.emailMatched && <Check className="inline ml-1 text-green-600" size={16} />}
        </div>
      )}
      <div className="text-gray-600 italic">
        "{report.description?.substring(0, 100)}..."
      </div>
      <div className="text-xs text-gray-500">
        Submitted: {new Date(report.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
```

---

## 7. DETECTION PIPELINE (Flowchart)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       NEW REPORT SUBMITTED                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: NORMALIZATION                                               │
│  ────────────────────────                                            │
│  • Normalize phone number                                            │
│  • Normalize email                                                   │
│  • Normalize IBAN, crypto wallet, SPZ, VIN, etc.                    │
│  • Store in normalized_fields table                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: EXACT MATCH CHECK (SYNCHRONOUS - <100ms)                   │
│  ─────────────────────────────────────────────                       │
│  Query DB for exact matches on:                                      │
│    • normalized_phone                                                │
│    • normalized_email                                                │
│    • normalized_iban                                                 │
│    • normalized_crypto_wallet                                        │
│    • normalized_license_plate                                        │
│    • normalized_vin                                                  │
│    • normalized_company_id                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼ MATCH FOUND             ▼ NO MATCH
┌──────────────────────────────┐    ┌───────────────────────────────┐
│  IMMEDIATE DUPLICATE FLAG     │    │  Continue to fuzzy detection  │
│  ────────────────────────     │    │  (async background job)       │
│  • Confidence: 100%           │    └───────────┬───────────────────┘
│  • Create/update cluster      │                │
│  • Link reports               │                │
│  • Notify admin (optional)    │                │
└───────────────────────────────┘                │
                                                 ▼
                           ┌─────────────────────────────────────────┐
                           │  STEP 3: GENERATE EMBEDDINGS (ASYNC)    │
                           │  ───────────────────────────────────     │
                           │  • Combine: name + description + address │
                           │  • Call ML service for embedding         │
                           │  • Store 384-dim vector in DB            │
                           └─────────────┬───────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────────────────┐
                           │  STEP 4: VECTOR SIMILARITY SEARCH       │
                           │  ────────────────────────────────────    │
                           │  Query pgvector/Weaviate:                │
                           │    • Cosine similarity > 0.85            │
                           │    • Exclude reports in same cluster    │
                           │    • Limit: 50 candidates                │
                           └─────────────┬───────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────────────────┐
                           │  STEP 5: FUZZY MATCHING                 │
                           │  ──────────────────────                  │
                           │  For each candidate:                     │
                           │    • Name matching (Levenshtein,         │
                           │      Jaro-Winkler, n-gram, soundex)     │
                           │    • Address matching (tokenized)        │
                           │    • Calculate confidence score          │
                           └─────────────┬───────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────────────────┐
                           │  STEP 6: IMAGE HASHING                  │
                           │  ─────────────────────                   │
                           │  If report has images:                   │
                           │    • Compute pHash, aHash, dHash, wHash │
                           │    • Compare with candidates' images     │
                           │    • Hamming distance < 10 = match      │
                           └─────────────┬───────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────────────────┐
                           │  STEP 7: AGGREGATE RESULTS              │
                           │  ─────────────────────────                │
                           │  Combine scores:                         │
                           │    • Vector similarity: 40%              │
                           │    • Name fuzzy match: 30%               │
                           │    • Address match: 15%                  │
                           │    • Image similarity: 15%               │
                           └─────────────┬───────────────────────────┘
                                         │
                                         ▼
                      ┌──────────────────┴──────────────────┐
                      │ Overall confidence >= 0.75?          │
                      └──────────────────┬──────────────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          │ YES                         │ NO
                          ▼                             ▼
         ┌─────────────────────────────────┐    ┌──────────────────┐
         │  CREATE/UPDATE CLUSTER           │    │  No action       │
         │  ─────────────────────────       │    │  (log results)   │
         │  • Add to existing cluster OR    │    └──────────────────┘
         │  • Create new cluster            │
         │  • Save match records            │
         │  • Notify admin if high conf.    │
         └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN REVIEW                                                        │
│  ────────────                                                         │
│  • View clusters in admin UI                                         │
│  • Confirm/reject matches                                            │
│  • Merge or unmerge reports                                          │
│  • Mark false positives                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CONTINUOUS LEARNING (Optional)                                      │
│  ──────────────────────────                                          │
│  • Track admin decisions                                             │
│  • Retrain thresholds based on feedback                             │
│  • A/B test different threshold configs                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. DATABASE SCHEMA

```sql
-- ============================================================================
-- DUPLICATE DETECTION DATABASE SCHEMA
-- ============================================================================

-- Extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Fraud reports table (existing, extended with vector column)
CREATE TABLE fraud_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Original report data
  scammer_name VARCHAR(255),
  company_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  iban VARCHAR(50),
  crypto_wallet VARCHAR(255),
  crypto_type VARCHAR(20), -- 'BTC', 'ETH', 'OTHER'
  license_plate VARCHAR(20),
  vin VARCHAR(17),
  company_id VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  description TEXT,

  -- Vector embedding for similarity search (384 dimensions)
  embedding vector(384),

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  has_duplicates BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID, -- User who submitted

  -- Indexes
  INDEX idx_fraud_reports_status (status),
  INDEX idx_fraud_reports_created_at (created_at),
  INDEX idx_fraud_reports_has_duplicates (has_duplicates)
);

-- Create HNSW index for vector similarity search
CREATE INDEX idx_fraud_reports_embedding ON fraud_reports
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- NORMALIZED FIELDS TABLE
-- ============================================================================

CREATE TABLE normalized_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Normalized unique identifiers
  normalized_phone VARCHAR(50),
  normalized_email VARCHAR(255),
  normalized_iban VARCHAR(50),
  normalized_crypto_wallet VARCHAR(255),
  normalized_license_plate VARCHAR(20),
  normalized_vin VARCHAR(17),
  normalized_company_id VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint: one normalized record per report
  UNIQUE(report_id),

  -- Indexes for fast exact matching
  INDEX idx_normalized_phone (normalized_phone),
  INDEX idx_normalized_email (normalized_email),
  INDEX idx_normalized_iban (normalized_iban),
  INDEX idx_normalized_crypto (normalized_crypto_wallet),
  INDEX idx_normalized_plate (normalized_license_plate),
  INDEX idx_normalized_vin (normalized_vin),
  INDEX idx_normalized_company (normalized_company_id)
);

-- ============================================================================
-- DUPLICATE CLUSTERS
-- ============================================================================

CREATE TABLE duplicate_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Primary report (the "canonical" one)
  primary_report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- All report IDs in cluster (including primary)
  -- Using JSONB array for flexibility
  report_ids UUID[] NOT NULL,

  -- Cluster metadata
  total_reports INTEGER NOT NULL DEFAULT 1,
  avg_confidence DECIMAL(3, 2), -- Average confidence across all matches

  -- Status
  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID, -- Admin who reviewed
  reviewed_at TIMESTAMP,
  merge_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'merged', 'rejected'

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_clusters_primary (primary_report_id),
  INDEX idx_clusters_reviewed (is_reviewed),
  INDEX idx_clusters_status (merge_status),
  INDEX idx_clusters_created (created_at)
);

-- GIN index for array containment queries
CREATE INDEX idx_clusters_report_ids ON duplicate_clusters USING GIN(report_ids);

-- ============================================================================
-- DUPLICATE MATCHES (Individual pairwise matches)
-- ============================================================================

CREATE TABLE duplicate_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Cluster this match belongs to
  cluster_id UUID NOT NULL REFERENCES duplicate_clusters(id) ON DELETE CASCADE,

  -- The two reports being matched
  report_id_1 UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,
  report_id_2 UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Match type and confidence
  match_type VARCHAR(50) NOT NULL, -- 'exact', 'fuzzy', 'vector', 'image'
  confidence DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00

  -- Which fields matched
  matched_fields TEXT[], -- e.g., ['phone', 'email', 'name']

  -- Detailed match information (JSONB for flexibility)
  details JSONB, -- E.g., {"levenshtein": 2, "jaro_winkler": 0.92, ...}

  -- Detection method
  detection_method VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual'
  detected_by UUID, -- NULL for auto, admin user ID for manual

  -- Status
  is_confirmed BOOLEAN DEFAULT NULL, -- NULL = pending, TRUE = confirmed, FALSE = rejected
  confirmed_by UUID,
  confirmed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (report_id_1 <> report_id_2),
  CHECK (confidence >= 0 AND confidence <= 1),

  -- Indexes
  INDEX idx_matches_cluster (cluster_id),
  INDEX idx_matches_report1 (report_id_1),
  INDEX idx_matches_report2 (report_id_2),
  INDEX idx_matches_type (match_type),
  INDEX idx_matches_confidence (confidence),
  INDEX idx_matches_confirmed (is_confirmed)
);

-- Unique constraint: no duplicate pairwise matches
CREATE UNIQUE INDEX idx_matches_unique_pair ON duplicate_matches(
  LEAST(report_id_1, report_id_2),
  GREATEST(report_id_1, report_id_2)
);

-- ============================================================================
-- IMAGE HASHES
-- ============================================================================

CREATE TABLE report_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Image info
  image_url TEXT NOT NULL,
  image_type VARCHAR(50), -- 'profile', 'screenshot', 'document', 'other'

  -- Perceptual hashes
  phash VARCHAR(64), -- Perceptual hash
  ahash VARCHAR(64), -- Average hash
  dhash VARCHAR(64), -- Difference hash
  whash VARCHAR(64), -- Wavelet hash

  -- Image metadata
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10), -- 'jpg', 'png', 'gif', etc.

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_images_report (report_id),
  INDEX idx_images_phash (phash),
  INDEX idx_images_ahash (ahash),
  INDEX idx_images_dhash (dhash),
  INDEX idx_images_type (image_type)
);

-- ============================================================================
-- DETECTION JOB QUEUE (for tracking async jobs)
-- ============================================================================

CREATE TABLE duplicate_detection_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Job status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  job_type VARCHAR(50) NOT NULL, -- 'fuzzy', 'vector', 'image', 'all'

  -- Results
  matches_found INTEGER DEFAULT 0,
  highest_confidence DECIMAL(3, 2),
  error_message TEXT,

  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Worker info
  worker_id VARCHAR(100),

  -- Indexes
  INDEX idx_jobs_report (report_id),
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_created (created_at)
);

-- ============================================================================
-- ADMIN ACTION LOG
-- ============================================================================

CREATE TABLE duplicate_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was acted upon
  cluster_id UUID REFERENCES duplicate_clusters(id) ON DELETE SET NULL,
  match_id UUID REFERENCES duplicate_matches(id) ON DELETE SET NULL,
  report_id UUID REFERENCES fraud_reports(id) ON DELETE SET NULL,

  -- Action details
  action_type VARCHAR(50) NOT NULL, -- 'merge', 'unmerge', 'confirm', 'reject', 'update_primary'
  action_data JSONB, -- Additional action-specific data

  -- Who performed the action
  admin_user_id UUID NOT NULL,
  admin_username VARCHAR(255),

  -- When
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_actions_cluster (cluster_id),
  INDEX idx_actions_admin (admin_user_id),
  INDEX idx_actions_type (action_type),
  INDEX idx_actions_created (created_at)
);

-- ============================================================================
-- THRESHOLD CONFIGURATIONS (for A/B testing and tuning)
-- ============================================================================

CREATE TABLE duplicate_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Config name
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,

  -- Threshold values
  levenshtein_max INTEGER DEFAULT 5,
  jaro_winkler_min DECIMAL(3, 2) DEFAULT 0.85,
  ngram_jaccard_min DECIMAL(3, 2) DEFAULT 0.70,
  vector_similarity_min DECIMAL(3, 2) DEFAULT 0.85,
  image_hash_distance_max INTEGER DEFAULT 10,
  overall_confidence_min DECIMAL(3, 2) DEFAULT 0.75,

  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,

  -- Performance tracking
  matches_found INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  false_negatives INTEGER DEFAULT 0,
  precision DECIMAL(5, 4), -- TP / (TP + FP)
  recall DECIMAL(5, 4),    -- TP / (TP + FN)

  INDEX idx_thresholds_active (is_active),
  INDEX idx_thresholds_default (is_default)
);

-- Insert default thresholds
INSERT INTO duplicate_thresholds (name, description, is_active, is_default) VALUES
  ('default', 'Default balanced thresholds', TRUE, TRUE),
  ('strict', 'Strict thresholds for high precision', FALSE, FALSE),
  ('relaxed', 'Relaxed thresholds for high recall', FALSE, FALSE);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Cluster summary with statistics
CREATE VIEW v_cluster_summary AS
SELECT
  c.id,
  c.primary_report_id,
  c.total_reports,
  c.avg_confidence,
  c.is_reviewed,
  c.merge_status,
  c.created_at,
  c.updated_at,
  pr.scammer_name AS primary_scammer_name,
  pr.phone AS primary_phone,
  pr.email AS primary_email,
  COUNT(DISTINCT m.id) AS total_matches,
  MAX(m.confidence) AS max_confidence,
  MIN(m.confidence) AS min_confidence
FROM duplicate_clusters c
JOIN fraud_reports pr ON c.primary_report_id = pr.id
LEFT JOIN duplicate_matches m ON c.id = m.cluster_id
GROUP BY c.id, pr.scammer_name, pr.phone, pr.email;

-- View: High-confidence pending clusters
CREATE VIEW v_pending_high_confidence_clusters AS
SELECT *
FROM v_cluster_summary
WHERE is_reviewed = FALSE
  AND avg_confidence >= 0.85
ORDER BY avg_confidence DESC, created_at ASC;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function: Update cluster statistics
CREATE OR REPLACE FUNCTION update_cluster_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE duplicate_clusters
  SET
    total_reports = array_length(report_ids, 1),
    avg_confidence = (
      SELECT AVG(confidence)
      FROM duplicate_matches
      WHERE cluster_id = NEW.cluster_id
    ),
    updated_at = NOW()
  WHERE id = NEW.cluster_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update cluster stats when match is added
CREATE TRIGGER trg_update_cluster_stats
AFTER INSERT OR UPDATE OR DELETE ON duplicate_matches
FOR EACH ROW
EXECUTE FUNCTION update_cluster_stats();

-- Function: Mark report as having duplicates
CREATE OR REPLACE FUNCTION mark_report_duplicates()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fraud_reports
  SET has_duplicates = TRUE
  WHERE id = ANY(NEW.report_ids);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Mark reports when cluster is created/updated
CREATE TRIGGER trg_mark_duplicates
AFTER INSERT OR UPDATE ON duplicate_clusters
FOR EACH ROW
EXECUTE FUNCTION mark_report_duplicates();

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_reports_status_has_dups ON fraud_reports(status, has_duplicates);
CREATE INDEX idx_matches_cluster_confidence ON duplicate_matches(cluster_id, confidence DESC);
CREATE INDEX idx_clusters_reviewed_confidence ON duplicate_clusters(is_reviewed, avg_confidence DESC);

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Find all exact matches for a phone number
/*
SELECT r.*
FROM fraud_reports r
JOIN normalized_fields nf ON r.id = nf.report_id
WHERE nf.normalized_phone = '421911123456';
*/

-- Find similar reports using vector search
/*
SELECT
  id,
  scammer_name,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM fraud_reports
WHERE 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) > 0.85
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
*/

-- Get cluster with all matches
/*
SELECT
  c.*,
  m.report_id_2,
  m.match_type,
  m.confidence,
  m.matched_fields,
  r.scammer_name,
  r.phone,
  r.email
FROM duplicate_clusters c
JOIN duplicate_matches m ON c.id = m.cluster_id
JOIN fraud_reports r ON m.report_id_2 = r.id
WHERE c.id = 'some-cluster-id'
ORDER BY m.confidence DESC;
*/
```

---

## 9. API ENDPOINTS

```typescript
// src/app/api/reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DuplicateClusteringService } from '@/lib/duplicate-detection/clustering';
import {
  normalizePhone,
  normalizeEmail,
  normalizeIBAN,
  // ... other normalizers
} from '@/lib/duplicate-detection/normalizers';

/**
 * POST /api/reports
 * Submit a new fraud report and trigger duplicate detection
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Create fraud report
    const report = await db.fraudReport.create({
      data: {
        scammerName: body.scammer_name,
        companyName: body.company_name,
        phone: body.phone,
        email: body.email,
        iban: body.iban,
        cryptoWallet: body.crypto_wallet,
        cryptoType: body.crypto_type,
        licensePlate: body.license_plate,
        vin: body.vin,
        companyId: body.company_id,
        address: body.address,
        website: body.website,
        description: body.description,
        status: 'pending',
        createdBy: body.user_id,
      }
    });

    // 2. Create normalized fields
    await db.normalizedFields.create({
      data: {
        reportId: report.id,
        normalizedPhone: normalizePhone(body.phone),
        normalizedEmail: normalizeEmail(body.email),
        normalizedIBAN: normalizeIBAN(body.iban),
        normalizedCryptoWallet: normalizeCryptoWallet(body.crypto_wallet, body.crypto_type),
        normalizedLicensePlate: normalizeLicensePlate(body.license_plate),
        normalizedVIN: normalizeVIN(body.vin),
        normalizedCompanyID: normalizeCompanyID(body.company_id),
      }
    });

    // 3. Trigger duplicate detection
    const clusteringService = new DuplicateClusteringService();
    const duplicateResult = await clusteringService.processReport(report.id);

    return NextResponse.json({
      success: true,
      report_id: report.id,
      duplicates: {
        found: duplicateResult.hasDuplicates,
        cluster_id: duplicateResult.clusterId,
        match_count: duplicateResult.matches.length,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create report'
    }, { status: 500 });
  }
}
```

```typescript
// src/app/api/admin/duplicates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/duplicates
 * List all duplicate clusters with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const filter = searchParams.get('filter') || 'all'; // 'all', 'high', 'review'
    const minConfidence = filter === 'high' ? 0.85 : 0;
    const isReviewed = filter === 'review' ? false : undefined;

    // Build query
    const where: any = {};
    if (minConfidence > 0) {
      where.avgConfidence = { gte: minConfidence };
    }
    if (isReviewed !== undefined) {
      where.isReviewed = isReviewed;
    }

    // Fetch clusters
    const [clusters, total] = await Promise.all([
      db.duplicateCluster.findMany({
        where,
        include: {
          primaryReport: {
            select: {
              id: true,
              scammerName: true,
              phone: true,
              email: true,
              description: true,
              createdAt: true,
            }
          },
          matches: {
            include: {
              report2: {
                select: {
                  id: true,
                  scammerName: true,
                  phone: true,
                  email: true,
                  description: true,
                  createdAt: true,
                }
              }
            },
            orderBy: { confidence: 'desc' }
          }
        },
        orderBy: [
          { avgConfidence: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit,
      }),
      db.duplicateCluster.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: clusters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching duplicates:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch duplicates'
    }, { status: 500 });
  }
}
```

```typescript
// src/app/api/admin/duplicates/[clusterId]/merge/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/duplicates/{clusterId}/merge
 * Merge all reports in cluster into primary report
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { clusterId: string } }
) {
  try {
    const { clusterId } = params;
    const body = await req.json();
    const { admin_user_id } = body;

    // Get cluster
    const cluster = await db.duplicateCluster.findUnique({
      where: { id: clusterId },
      include: { matches: true }
    });

    if (!cluster) {
      return NextResponse.json({
        success: false,
        error: 'Cluster not found'
      }, { status: 404 });
    }

    // Start transaction
    await db.$transaction(async (tx) => {
      // 1. Mark cluster as merged
      await tx.duplicateCluster.update({
        where: { id: clusterId },
        data: {
          mergeStatus: 'merged',
          isReviewed: true,
          reviewedBy: admin_user_id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // 2. Update all non-primary reports status
      const nonPrimaryIds = cluster.reportIds.filter(id => id !== cluster.primaryReportId);
      await tx.fraudReport.updateMany({
        where: { id: { in: nonPrimaryIds } },
        data: {
          status: 'merged',
          updatedAt: new Date(),
        }
      });

      // 3. Confirm all matches
      await tx.duplicateMatch.updateMany({
        where: { clusterId },
        data: {
          isConfirmed: true,
          confirmedBy: admin_user_id,
          confirmedAt: new Date(),
        }
      });

      // 4. Log action
      await tx.duplicateAdminAction.create({
        data: {
          clusterId,
          actionType: 'merge',
          adminUserId: admin_user_id,
          actionData: {
            primary_report_id: cluster.primaryReportId,
            merged_count: nonPrimaryIds.length,
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Cluster merged successfully',
      cluster_id: clusterId
    });

  } catch (error) {
    console.error('Error merging cluster:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to merge cluster'
    }, { status: 500 });
  }
}
```

```typescript
// src/app/api/admin/duplicates/[clusterId]/unmerge/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/duplicates/{clusterId}/unmerge
 * Unmerge/dissolve a cluster
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { clusterId: string } }
) {
  try {
    const { clusterId } = params;
    const body = await req.json();
    const { admin_user_id } = body;

    await db.$transaction(async (tx) => {
      // Get cluster before deleting
      const cluster = await tx.duplicateCluster.findUnique({
        where: { id: clusterId }
      });

      if (!cluster) {
        throw new Error('Cluster not found');
      }

      // 1. Delete all matches in cluster
      await tx.duplicateMatch.deleteMany({
        where: { clusterId }
      });

      // 2. Update reports to remove duplicate flag
      await tx.fraudReport.updateMany({
        where: { id: { in: cluster.reportIds } },
        data: {
          hasDuplicates: false,
          status: 'pending',
          updatedAt: new Date(),
        }
      });

      // 3. Delete cluster
      await tx.duplicateCluster.delete({
        where: { id: clusterId }
      });

      // 4. Log action
      await tx.duplicateAdminAction.create({
        data: {
          actionType: 'unmerge',
          adminUserId: admin_user_id,
          actionData: {
            cluster_id: clusterId,
            report_ids: cluster.reportIds,
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Cluster unmerged successfully'
    });

  } catch (error) {
    console.error('Error unmerging cluster:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to unmerge cluster'
    }, { status: 500 });
  }
}
```

```typescript
// src/app/api/admin/duplicates/[clusterId]/unlink/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/duplicates/{clusterId}/unlink
 * Remove a specific report from a cluster
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { clusterId: string } }
) {
  try {
    const { clusterId } = params;
    const body = await req.json();
    const { report_id, admin_user_id } = body;

    await db.$transaction(async (tx) => {
      // Get cluster
      const cluster = await tx.duplicateCluster.findUnique({
        where: { id: clusterId }
      });

      if (!cluster) {
        throw new Error('Cluster not found');
      }

      // Can't unlink primary report
      if (cluster.primaryReportId === report_id) {
        throw new Error('Cannot unlink primary report. Choose a different primary first.');
      }

      // 1. Remove report from cluster's report_ids array
      const updatedReportIds = cluster.reportIds.filter(id => id !== report_id);

      await tx.duplicateCluster.update({
        where: { id: clusterId },
        data: {
          reportIds: updatedReportIds,
          totalReports: updatedReportIds.length,
          updatedAt: new Date(),
        }
      });

      // 2. Delete matches involving this report
      await tx.duplicateMatch.deleteMany({
        where: {
          clusterId,
          OR: [
            { reportId1: report_id },
            { reportId2: report_id }
          ]
        }
      });

      // 3. Update report status
      await tx.fraudReport.update({
        where: { id: report_id },
        data: {
          hasDuplicates: false,
          status: 'pending',
          updatedAt: new Date(),
        }
      });

      // 4. Log action
      await tx.duplicateAdminAction.create({
        data: {
          clusterId,
          reportId: report_id,
          actionType: 'unlink',
          adminUserId: admin_user_id,
        }
      });

      // 5. If cluster only has 1 report left, delete it
      if (updatedReportIds.length <= 1) {
        await tx.duplicateCluster.delete({
          where: { id: clusterId }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Report unlinked successfully'
    });

  } catch (error) {
    console.error('Error unlinking report:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unlink report'
    }, { status: 500 });
  }
}
```

```typescript
// src/app/api/admin/duplicates/[clusterId]/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/duplicates/{clusterId}/confirm
 * Confirm a match as same person/entity
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { clusterId: string } }
) {
  try {
    const { clusterId } = params;
    const body = await req.json();
    const { report_id, admin_user_id } = body;

    // Update all matches involving this report in this cluster
    await db.$transaction(async (tx) => {
      await tx.duplicateMatch.updateMany({
        where: {
          clusterId,
          OR: [
            { reportId1: report_id },
            { reportId2: report_id }
          ]
        },
        data: {
          isConfirmed: true,
          confirmedBy: admin_user_id,
          confirmedAt: new Date(),
        }
      });

      // Log action
      await tx.duplicateAdminAction.create({
        data: {
          clusterId,
          reportId: report_id,
          actionType: 'confirm',
          adminUserId: admin_user_id,
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Match confirmed'
    });

  } catch (error) {
    console.error('Error confirming match:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to confirm match'
    }, { status: 500 });
  }
}
```

### API Documentation

```markdown
# Duplicate Detection API

## Endpoints

### 1. Submit Report
**POST** `/api/reports`

Submit a new fraud report and trigger duplicate detection.

**Request Body:**
```json
{
  "scammer_name": "Ján Novák",
  "company_name": "Fake Investment Ltd.",
  "phone": "+421 911 123 456",
  "email": "jan.novak@example.com",
  "iban": "SK31 1200 0000 1987 4263 7541",
  "crypto_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "crypto_type": "ETH",
  "license_plate": "BA 123 XY",
  "vin": "1HGBH41JXMN109186",
  "company_id": "12345678",
  "address": "Hlavná 123, 841 01 Bratislava",
  "website": "https://fake-investment.com",
  "description": "Sľubovali 20% mesačný výnos...",
  "user_id": "uuid-of-submitter"
}
```

**Response:**
```json
{
  "success": true,
  "report_id": "uuid",
  "duplicates": {
    "found": true,
    "cluster_id": "uuid",
    "match_count": 3
  }
}
```

---

### 2. List Duplicate Clusters
**GET** `/api/admin/duplicates`

List all duplicate clusters with pagination and filtering.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `filter`: 'all' | 'high' | 'review'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cluster-uuid",
      "primary_report_id": "report-uuid",
      "total_reports": 4,
      "avg_confidence": 0.92,
      "is_reviewed": false,
      "merge_status": "pending",
      "created_at": "2025-12-01T10:00:00Z",
      "primary_report": {...},
      "matches": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 3. Merge Cluster
**POST** `/api/admin/duplicates/{clusterId}/merge`

Merge all reports in cluster into primary report.

**Request Body:**
```json
{
  "admin_user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cluster merged successfully",
  "cluster_id": "uuid"
}
```

---

### 4. Unmerge Cluster
**POST** `/api/admin/duplicates/{clusterId}/unmerge`

Dissolve a cluster and mark all reports as independent.

**Request Body:**
```json
{
  "admin_user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cluster unmerged successfully"
}
```

---

### 5. Unlink Report
**POST** `/api/admin/duplicates/{clusterId}/unlink`

Remove a specific report from a cluster.

**Request Body:**
```json
{
  "report_id": "uuid",
  "admin_user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report unlinked successfully"
}
```

---

### 6. Confirm Match
**POST** `/api/admin/duplicates/{clusterId}/confirm`

Confirm a match as same person/entity.

**Request Body:**
```json
{
  "report_id": "uuid",
  "admin_user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Match confirmed"
}
```
```

---

## DEPLOYMENT & INFRASTRUCTURE

### Docker Compose Setup

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL with pgvector
  postgres:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_DB: scamnemesis
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis for job queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # ML Service (Python)
  ml-service:
    build: ./services/ml
    environment:
      - POSTGRES_URL=postgresql://postgres:secret@postgres:5432/scamnemesis
      - REDIS_URL=redis://redis:6379
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./services/ml:/app
      - ml_models:/models

  # Background worker for duplicate detection
  worker:
    build: .
    command: npm run worker:duplicate-detection
    environment:
      - DATABASE_URL=postgresql://postgres:secret@postgres:5432/scamnemesis
      - REDIS_URL=redis://redis:6379
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - postgres
      - redis
      - ml-service

  # Weaviate (optional alternative to pgvector)
  # weaviate:
  #   image: semitechnologies/weaviate:latest
  #   ports:
  #     - "8080:8080"
  #   environment:
  #     QUERY_DEFAULTS_LIMIT: 25
  #     AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
  #     PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
  #   volumes:
  #     - weaviate_data:/var/lib/weaviate

volumes:
  postgres_data:
  redis_data:
  ml_models:
  # weaviate_data:
```

---

## TESTING & EVALUATION

### Test Dataset

Create a labeled test dataset for evaluating duplicate detection:

```typescript
// tests/duplicate-detection/test-cases.ts

export const TEST_CASES = [
  {
    name: "Exact phone match",
    reports: [
      { phone: "+421 911 123 456", name: "Ján Novák" },
      { phone: "00421911123456", name: "Jan Novak" }
    ],
    expected: { isDuplicate: true, confidence: 1.0 }
  },
  {
    name: "Fuzzy name match with typo",
    reports: [
      { name: "Peter Kovács", description: "Falošná investícia..." },
      { name: "Peter Kovacs", description: "Falošná investícia do zlata..." }
    ],
    expected: { isDuplicate: true, confidence: 0.85 }
  },
  {
    name: "Different person with similar name",
    reports: [
      { name: "Ján Novák", phone: "+421 911 111 111" },
      { name: "Ján Nový", phone: "+421 922 222 222" }
    ],
    expected: { isDuplicate: false }
  },
  // ... more test cases
];
```

### Performance Metrics

```typescript
// tests/duplicate-detection/evaluation.ts

interface EvaluationMetrics {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export function calculateMetrics(
  predictions: boolean[],
  groundTruth: boolean[]
): EvaluationMetrics {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i] && groundTruth[i]) tp++;
    else if (predictions[i] && !groundTruth[i]) fp++;
    else if (!predictions[i] && !groundTruth[i]) tn++;
    else if (!predictions[i] && groundTruth[i]) fn++;
  }

  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const f1Score = 2 * (precision * recall) / (precision + recall);

  return {
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn,
    precision,
    recall,
    f1Score
  };
}
```

---

## MONITORING & ANALYTICS

### Key Metrics to Track

1. **Detection Performance**
   - Total reports processed
   - Duplicates detected (exact vs fuzzy)
   - Average confidence scores
   - False positive rate (from admin feedback)

2. **Processing Time**
   - Exact match detection time (should be <100ms)
   - Fuzzy detection time (can be minutes)
   - Vector search latency
   - Image hashing time

3. **Cluster Statistics**
   - Total clusters
   - Average cluster size
   - High-confidence clusters pending review
   - Merge/unmerge actions

4. **Admin Actions**
   - Review rate
   - Confirmation vs rejection ratio
   - Most common match types

### Monitoring Dashboard

```sql
-- Query: Daily duplicate detection stats
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_reports,
  SUM(CASE WHEN has_duplicates THEN 1 ELSE 0 END) as reports_with_duplicates,
  SUM(CASE WHEN has_duplicates THEN 1 ELSE 0 END)::float / COUNT(*) as duplicate_rate
FROM fraud_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Query: Cluster confidence distribution
SELECT
  CASE
    WHEN avg_confidence >= 0.95 THEN '95-100%'
    WHEN avg_confidence >= 0.90 THEN '90-95%'
    WHEN avg_confidence >= 0.85 THEN '85-90%'
    WHEN avg_confidence >= 0.75 THEN '75-85%'
    ELSE '<75%'
  END as confidence_bucket,
  COUNT(*) as cluster_count
FROM duplicate_clusters
GROUP BY confidence_bucket
ORDER BY confidence_bucket DESC;
```

---

## FUTURE ENHANCEMENTS

1. **Active Learning**
   - Use admin feedback to retrain thresholds
   - Implement confidence calibration

2. **Cross-lingual Support**
   - Detect duplicates across languages (SK, CZ, EN)
   - Use multilingual embeddings

3. **Network Analysis**
   - Detect fraud networks (connected scammers)
   - Graph-based clustering

4. **Real-time Alerts**
   - Notify admins of high-confidence duplicates
   - Auto-merge based on rules

5. **Advanced Image Detection**
   - Face recognition for profile pictures
   - OCR for text in images (invoices, screenshots)

---

## SUMMARY

This comprehensive duplicate detection system provides:

- **Multi-layered detection**: Exact, fuzzy, vector, and image-based
- **High performance**: Synchronous exact match (<100ms), async fuzzy detection
- **Scalability**: pgvector/Weaviate for millions of reports
- **Admin control**: Full UI for reviewing and managing duplicates
- **Extensibility**: Configurable thresholds, A/B testing, continuous learning

The system balances **precision** (avoiding false positives) with **recall** (catching all duplicates) through configurable thresholds and multi-algorithm voting.
