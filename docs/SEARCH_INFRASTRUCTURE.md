# Search Infrastructure - Scamnemesis

## 1. Search Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SEARCH LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Frontend   │───▶│  API Gateway │───▶│ Search Router│                   │
│  │  Search Bar  │    │  /search     │    │              │                   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                   │
│                                                  │                           │
│                    ┌─────────────────────────────┼─────────────────────────┐ │
│                    │                             │                         │ │
│                    ▼                             ▼                         ▼ │
│         ┌──────────────────┐      ┌──────────────────┐      ┌────────────┐ │
│         │   Exact Search   │      │   Fuzzy Search   │      │  Vector    │ │
│         │   PostgreSQL     │      │   Typesense/     │      │  Search    │ │
│         │   (indexed)      │      │   OpenSearch     │      │  pgvector  │ │
│         └────────┬─────────┘      └────────┬─────────┘      └─────┬──────┘ │
│                  │                         │                      │        │
│                  └─────────────────────────┼──────────────────────┘        │
│                                            ▼                               │
│                              ┌──────────────────────┐                      │
│                              │   Result Aggregator  │                      │
│                              │   + Ranking Engine   │                      │
│                              └──────────┬───────────┘                      │
│                                         │                                  │
│                                         ▼                                  │
│                              ┌──────────────────────┐                      │
│                              │   Masking Layer      │                      │
│                              │   (role-based)       │                      │
│                              └──────────┬───────────┘                      │
│                                         │                                  │
│                                         ▼                                  │
│                              ┌──────────────────────┐                      │
│                              │   Cache Layer        │                      │
│                              │   (Redis)            │                      │
│                              └──────────────────────┘                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. Search Types & Strategies

### 2.1 Exact Search (PostgreSQL)

**Use Cases:**
- Phone number lookup
- Email lookup
- IBAN search
- Wallet address search
- License plate (SPZ)
- VIN number

**Implementation:**

```sql
-- B-tree indexes for exact match
CREATE INDEX idx_perpetrators_phone ON perpetrators USING btree (phone_normalized);
CREATE INDEX idx_perpetrators_email ON perpetrators USING btree (email_normalized);
CREATE INDEX idx_financial_iban ON financial_details USING btree (iban_normalized);
CREATE INDEX idx_crypto_wallet ON crypto_details USING btree (wallet_address_lower);
CREATE INDEX idx_vehicle_spz ON vehicle_details USING btree (license_plate_normalized);
CREATE INDEX idx_vehicle_vin ON vehicle_details USING btree (vin_normalized);

-- Composite index for multi-field exact search
CREATE INDEX idx_perpetrators_exact_combo ON perpetrators (
    phone_normalized,
    email_normalized
) WHERE status = 'approved';
```

**Query Pattern:**

```sql
-- Exact phone search
SELECT r.*, p.*
FROM reports r
JOIN perpetrators p ON r.perpetrator_id = p.id
WHERE p.phone_normalized = normalize_phone($1)
  AND r.status = 'approved';

-- Multi-field exact search
SELECT r.*, p.*
FROM reports r
JOIN perpetrators p ON r.perpetrator_id = p.id
WHERE r.status = 'approved'
  AND (
    p.phone_normalized = $1 OR
    p.email_normalized = $2 OR
    EXISTS (SELECT 1 FROM financial_details fd WHERE fd.report_id = r.id AND fd.iban_normalized = $3)
  );
```

### 2.2 Fuzzy Search (Typesense/OpenSearch)

**Use Cases:**
- Name search (typos, variations)
- Address search
- Description search
- Company name search

#### Option A: Typesense (MVP - Recommended)

**Configuration:**

```json
{
  "name": "reports",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "perpetrator_name", "type": "string", "facet": false},
    {"name": "perpetrator_nickname", "type": "string", "optional": true},
    {"name": "description", "type": "string"},
    {"name": "brief_summary", "type": "string"},
    {"name": "fraud_type", "type": "string", "facet": true},
    {"name": "country", "type": "string", "facet": true},
    {"name": "city", "type": "string", "facet": true},
    {"name": "incident_date", "type": "int64"},
    {"name": "financial_loss", "type": "float", "optional": true},
    {"name": "company_name", "type": "string", "optional": true},
    {"name": "status", "type": "string", "facet": true}
  ],
  "default_sorting_field": "incident_date",
  "token_separators": ["-", "_", "."],
  "symbols_to_index": ["@", "#", "+"]
}
```

**Fuzzy Search Query:**

```typescript
const searchParameters = {
  q: 'Vladimir Galla',  // user query with typo
  query_by: 'perpetrator_name,perpetrator_nickname,description',
  query_by_weights: '4,3,1',
  prefix: true,
  typo_tokens_threshold: 2,
  num_typos: 2,           // allow 2 typos
  min_len_1typo: 4,       // min 4 chars for 1 typo
  min_len_2typo: 7,       // min 7 chars for 2 typos
  filter_by: 'status:approved && country:Slovakia',
  sort_by: 'incident_date:desc',
  per_page: 20,
  page: 1,
  facet_by: 'fraud_type,country',
  highlight_full_fields: 'perpetrator_name,description'
};
```

**Resources (Typesense):**
- MVP: 2GB RAM, 2 vCPU, 20GB SSD
- Scale: 8GB RAM, 4 vCPU, 100GB SSD (cluster of 3)

#### Option B: OpenSearch (Scale)

**Index Mapping:**

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "name_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "name_ngram"]
        },
        "search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      },
      "filter": {
        "name_ngram": {
          "type": "ngram",
          "min_gram": 2,
          "max_gram": 4
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "perpetrator_name": {
        "type": "text",
        "analyzer": "name_analyzer",
        "search_analyzer": "search_analyzer",
        "fields": {
          "exact": {"type": "keyword"},
          "phonetic": {"type": "text", "analyzer": "phonetic"}
        }
      },
      "description": {
        "type": "text",
        "analyzer": "standard"
      },
      "fraud_type": {"type": "keyword"},
      "country": {"type": "keyword"},
      "incident_date": {"type": "date"},
      "location": {"type": "geo_point"},
      "status": {"type": "keyword"}
    }
  }
}
```

**Multi-match Query:**

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "Vladimir Galla",
            "type": "best_fields",
            "fields": ["perpetrator_name^4", "perpetrator_name.phonetic^2", "description"],
            "fuzziness": "AUTO",
            "prefix_length": 2,
            "max_expansions": 50
          }
        }
      ],
      "filter": [
        {"term": {"status": "approved"}},
        {"range": {"incident_date": {"gte": "2023-01-01"}}}
      ]
    }
  },
  "highlight": {
    "fields": {
      "perpetrator_name": {},
      "description": {"fragment_size": 150}
    }
  },
  "aggs": {
    "by_country": {"terms": {"field": "country"}},
    "by_fraud_type": {"terms": {"field": "fraud_type"}}
  }
}
```

### 2.3 N-gram & Trigram Search (PostgreSQL pg_trgm)

**For MVP without separate search engine:**

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes
CREATE INDEX idx_perpetrators_name_trgm ON perpetrators
  USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_perpetrators_nickname_trgm ON perpetrators
  USING gin (nickname gin_trgm_ops);
CREATE INDEX idx_reports_description_trgm ON reports
  USING gin (description gin_trgm_ops);

-- Similarity search query
SELECT
  p.id,
  p.full_name,
  similarity(p.full_name, 'Vladimir Galla') as sim_score
FROM perpetrators p
JOIN reports r ON p.id = r.perpetrator_id
WHERE
  r.status = 'approved'
  AND p.full_name % 'Vladimir Galla'  -- trigram similarity
ORDER BY sim_score DESC
LIMIT 20;

-- Combined Levenshtein + trigram
SELECT
  p.id,
  p.full_name,
  similarity(p.full_name, $1) as trgm_score,
  levenshtein(lower(p.full_name), lower($1)) as lev_distance
FROM perpetrators p
WHERE
  p.full_name % $1
  OR levenshtein(lower(p.full_name), lower($1)) <= 3
ORDER BY trgm_score DESC, lev_distance ASC
LIMIT 20;
```

**Configuration:**

```sql
-- Set similarity threshold
SET pg_trgm.similarity_threshold = 0.3;
SET pg_trgm.word_similarity_threshold = 0.4;
```

### 2.4 Vector/Semantic Search (pgvector)

**Use Cases:**
- Semantic similarity in descriptions
- Face embedding search
- Finding related reports by meaning

**Setup:**

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Text embeddings column
ALTER TABLE reports ADD COLUMN description_embedding vector(384);
ALTER TABLE perpetrators ADD COLUMN name_embedding vector(384);

-- Face embeddings
ALTER TABLE evidence ADD COLUMN face_embedding vector(512);

-- HNSW indexes for fast ANN search
CREATE INDEX idx_reports_desc_embedding ON reports
  USING hnsw (description_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_evidence_face_embedding ON evidence
  USING hnsw (face_embedding vector_cosine_ops)
  WITH (m = 24, ef_construction = 100);
```

**Semantic Search Query:**

```sql
-- Find semantically similar reports
SELECT
  r.id,
  r.brief_summary,
  1 - (r.description_embedding <=> $1) as similarity
FROM reports r
WHERE
  r.status = 'approved'
  AND r.description_embedding IS NOT NULL
  AND 1 - (r.description_embedding <=> $1) > 0.7
ORDER BY r.description_embedding <=> $1
LIMIT 20;
```

**Embedding Generation (Python):**

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def generate_text_embedding(text: str) -> list[float]:
    """Generate 384-dim embedding for text."""
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

# Usage
embedding = generate_text_embedding("Romance scam targeting elderly via Facebook")
```

## 3. Transliteration & Language Handling

### 3.1 Cyrillic to Latin Transliteration

```typescript
const cyrillicToLatin: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
  'э': 'e', 'ю': 'yu', 'я': 'ya',
  // Ukrainian additions
  'і': 'i', 'ї': 'yi', 'є': 'ye', 'ґ': 'g'
};

function transliterate(text: string): string {
  return text.toLowerCase().split('').map(char =>
    cyrillicToLatin[char] || char
  ).join('');
}

// Store both original and transliterated
interface SearchableText {
  original: string;
  transliterated: string;
  normalized: string; // lowercase, no diacritics
}
```

### 3.2 Multi-language Index Strategy

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "multilang_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",
            "icu_folding"
          ]
        },
        "russian_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "russian_stemmer"]
        },
        "slovak_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "perpetrator_name": {
        "type": "text",
        "fields": {
          "ru": {"type": "text", "analyzer": "russian_analyzer"},
          "sk": {"type": "text", "analyzer": "slovak_analyzer"},
          "translit": {"type": "text", "analyzer": "multilang_analyzer"}
        }
      }
    }
  }
}
```

## 4. Search Router Implementation

```typescript
// src/services/search/searchRouter.ts

interface SearchQuery {
  q: string;
  type: 'exact' | 'fuzzy' | 'semantic' | 'auto';
  filters: {
    country?: string;
    fraudType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  limit: number;
  offset: number;
}

interface SearchResult {
  id: string;
  score: number;
  source: 'exact' | 'fuzzy' | 'semantic';
  highlights?: Record<string, string[]>;
  data: MaskedReport;
}

class SearchRouter {
  constructor(
    private exactSearch: ExactSearchService,
    private fuzzySearch: FuzzySearchService,
    private semanticSearch: SemanticSearchService,
    private cache: RedisCache,
    private masking: MaskingService
  ) {}

  async search(query: SearchQuery, userRole: UserRole): Promise<SearchResult[]> {
    // 1. Check cache
    const cacheKey = this.buildCacheKey(query, userRole);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // 2. Detect search type if auto
    const searchType = query.type === 'auto'
      ? this.detectSearchType(query.q)
      : query.type;

    // 3. Execute appropriate search
    let results: SearchResult[];

    switch (searchType) {
      case 'exact':
        results = await this.exactSearch.search(query);
        break;
      case 'fuzzy':
        results = await this.fuzzySearch.search(query);
        break;
      case 'semantic':
        results = await this.semanticSearch.search(query);
        break;
      default:
        // Parallel search for auto - merge results
        const [exact, fuzzy] = await Promise.all([
          this.exactSearch.search(query),
          this.fuzzySearch.search(query)
        ]);
        results = this.mergeAndRank(exact, fuzzy);
    }

    // 4. Apply masking based on role
    const masked = results.map(r => ({
      ...r,
      data: this.masking.applyMask(r.data, userRole)
    }));

    // 5. Cache results
    await this.cache.set(cacheKey, masked, { ttl: 300 }); // 5 min TTL

    return masked;
  }

  private detectSearchType(query: string): 'exact' | 'fuzzy' | 'semantic' {
    // Phone pattern
    if (/^\+?[\d\s\-]{8,}$/.test(query.replace(/\s/g, ''))) {
      return 'exact';
    }
    // Email pattern
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) {
      return 'exact';
    }
    // IBAN pattern
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/i.test(query.replace(/\s/g, ''))) {
      return 'exact';
    }
    // Crypto wallet pattern
    if (/^(0x)?[a-fA-F0-9]{40,}$/.test(query) || /^[13][a-km-zA-HJ-NP-Z1-9]{25,}$/.test(query)) {
      return 'exact';
    }
    // Long text - use semantic
    if (query.split(/\s+/).length > 5) {
      return 'semantic';
    }
    // Default to fuzzy for names
    return 'fuzzy';
  }

  private mergeAndRank(exact: SearchResult[], fuzzy: SearchResult[]): SearchResult[] {
    const merged = new Map<string, SearchResult>();

    // Exact matches get priority
    exact.forEach(r => {
      merged.set(r.id, { ...r, score: r.score * 1.5 });
    });

    // Add fuzzy results, boost if also exact match
    fuzzy.forEach(r => {
      if (merged.has(r.id)) {
        const existing = merged.get(r.id)!;
        existing.score += r.score;
      } else {
        merged.set(r.id, r);
      }
    });

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score);
  }

  private buildCacheKey(query: SearchQuery, role: UserRole): string {
    return `search:${role}:${JSON.stringify(query)}`;
  }
}
```

## 5. Caching Strategy

### 5.1 Redis Cache Configuration

```typescript
// config/cache.ts
export const cacheConfig = {
  search: {
    ttl: 300,           // 5 minutes for search results
    maxSize: 10000,     // max cached queries
    keyPrefix: 'search:'
  },
  report: {
    ttl: 600,           // 10 minutes for individual reports
    keyPrefix: 'report:'
  },
  aggregations: {
    ttl: 3600,          // 1 hour for facets/aggregations
    keyPrefix: 'agg:'
  },
  searchSuggestions: {
    ttl: 86400,         // 24 hours for autocomplete
    keyPrefix: 'suggest:'
  }
};
```

### 5.2 Cache Invalidation

```typescript
class CacheInvalidator {
  async onReportApproved(reportId: string): Promise<void> {
    // Invalidate specific report cache
    await this.redis.del(`report:${reportId}`);

    // Invalidate search caches that might include this report
    const pattern = 'search:*';
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    // Invalidate aggregations
    await this.redis.del('agg:*');
  }

  async onReportUpdated(reportId: string): Promise<void> {
    await this.onReportApproved(reportId);
  }
}
```

## 6. Index Synchronization

```typescript
// src/services/search/indexSync.ts

class SearchIndexSynchronizer {
  private lastSyncTimestamp: Date;

  async fullReindex(): Promise<void> {
    const batchSize = 1000;
    let offset = 0;

    while (true) {
      const reports = await this.db.query(`
        SELECT r.*, p.*, fd.*, cd.*
        FROM reports r
        LEFT JOIN perpetrators p ON r.perpetrator_id = p.id
        LEFT JOIN financial_details fd ON r.id = fd.report_id
        LEFT JOIN crypto_details cd ON r.id = cd.report_id
        WHERE r.status = 'approved'
        ORDER BY r.id
        LIMIT $1 OFFSET $2
      `, [batchSize, offset]);

      if (reports.length === 0) break;

      await this.indexBatch(reports);
      offset += batchSize;

      // Progress tracking
      await this.updateSyncProgress(offset);
    }

    this.lastSyncTimestamp = new Date();
  }

  async incrementalSync(): Promise<void> {
    const reports = await this.db.query(`
      SELECT r.*, p.*
      FROM reports r
      LEFT JOIN perpetrators p ON r.perpetrator_id = p.id
      WHERE r.updated_at > $1
        AND r.status = 'approved'
    `, [this.lastSyncTimestamp]);

    if (reports.length > 0) {
      await this.indexBatch(reports);
    }

    this.lastSyncTimestamp = new Date();
  }

  // Run every 5 minutes
  @Cron('*/5 * * * *')
  async scheduledSync(): Promise<void> {
    await this.incrementalSync();
  }
}
```

## 7. Search Filters UI Mapping

```typescript
// Available filters for search UI
const searchFilters = {
  country: {
    type: 'select',
    options: 'dynamic', // populated from aggregations
    index_field: 'country'
  },
  fraudType: {
    type: 'multi-select',
    options: FRAUD_TYPES, // enum
    index_field: 'fraud_type'
  },
  dateRange: {
    type: 'date-range',
    fields: ['dateFrom', 'dateTo'],
    index_field: 'incident_date'
  },
  financialLoss: {
    type: 'range',
    min: 0,
    max: null,
    index_field: 'financial_loss'
  },
  searchMode: {
    type: 'toggle',
    options: ['exact', 'fuzzy'],
    default: 'fuzzy'
  },
  // Unique identifiers (exact search only)
  phone: { type: 'text', exact: true },
  email: { type: 'text', exact: true },
  iban: { type: 'text', exact: true },
  wallet: { type: 'text', exact: true },
  licensePlate: { type: 'text', exact: true },
  vin: { type: 'text', exact: true }
};
```

## 8. Performance Targets & Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Search latency (p50) | < 100ms | > 200ms |
| Search latency (p95) | < 300ms | > 500ms |
| Search latency (p99) | < 500ms | > 1000ms |
| Cache hit ratio | > 60% | < 40% |
| Index lag | < 5 min | > 15 min |
| Queries/second (MVP) | 10 QPS | - |
| Queries/second (Scale) | 100 QPS | - |

## 9. Resource Estimates

### MVP (Typesense + pg_trgm)
- Typesense: 2GB RAM, 2 vCPU, 20GB SSD
- PostgreSQL: 4GB RAM, 2 vCPU (shared with main DB)
- Redis: 512MB RAM (shared cache)
- Index size: ~1GB per 100K reports

### Scale (OpenSearch cluster)
- OpenSearch: 3 nodes x 8GB RAM, 4 vCPU, 100GB SSD each
- PostgreSQL: 16GB RAM, 8 vCPU
- Redis: 4GB RAM cluster
- Index size: ~5GB per 100K reports (with vectors)

## 10. External Search Integration (Future)

### Yandex Search API

```typescript
interface YandexSearchConfig {
  apiKey: string;
  folderId: string;
  baseUrl: 'https://yandex.com/search/xml';
  rateLimit: 1000; // queries per day
}

async function searchYandex(query: string): Promise<ExternalResult[]> {
  const params = new URLSearchParams({
    folderid: config.folderId,
    apikey: config.apiKey,
    query: query,
    lr: '187', // region: Ukraine
    l10n: 'ru'
  });

  const response = await fetch(`${config.baseUrl}?${params}`);
  return parseYandexResponse(response);
}
```

### Google Custom Search

```typescript
interface GoogleCSEConfig {
  apiKey: string;
  cx: string; // Custom Search Engine ID
  baseUrl: 'https://www.googleapis.com/customsearch/v1';
  rateLimit: 100; // queries per day (free tier)
}
```

### Baidu Search (CN) - Preparation

```typescript
// Requires special handling due to China firewall
// Consider using proxy server in HK/Singapore
interface BaiduConfig {
  proxyUrl: string;
  rateLimit: 500;
  language: 'zh-CN';
}
```
