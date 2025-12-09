# Crawler & Enrichment Pipeline - Scamnemesis

## 1. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CRAWLER & ENRICHMENT PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │  Scheduler     │───▶│  Job Queue     │───▶│  Worker Pool   │             │
│  │  (Cron-based)  │    │  (Redis)       │    │  (Dockerized)  │             │
│  └────────────────┘    └────────────────┘    └───────┬────────┘             │
│                                                       │                      │
│         ┌─────────────────────────────────────────────┼───────────────────┐ │
│         │                                             │                   │ │
│         ▼                     ▼                       ▼                   ▼ │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐ │
│  │ News        │     │ PEP/        │     │ Search      │     │ Social   │ │
│  │ Connector   │     │ Sanctions   │     │ Engines     │     │ Media    │ │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └────┬─────┘ │
│         │                   │                   │                  │       │
│         └───────────────────┴───────────────────┴──────────────────┘       │
│                                      │                                     │
│                                      ▼                                     │
│                         ┌──────────────────────┐                           │
│                         │  Content Processor   │                           │
│                         │  - HTML parsing      │                           │
│                         │  - Language detect   │                           │
│                         │  - Entity extraction │                           │
│                         └──────────┬───────────┘                           │
│                                    │                                       │
│                                    ▼                                       │
│                         ┌──────────────────────┐                           │
│                         │  Translation Layer   │                           │
│                         │  (if needed)         │                           │
│                         └──────────┬───────────┘                           │
│                                    │                                       │
│                                    ▼                                       │
│                         ┌──────────────────────┐                           │
│                         │  Deduplication       │                           │
│                         │  - URL canonical     │                           │
│                         │  - Content hash      │                           │
│                         │  - Entity match      │                           │
│                         └──────────┬───────────┘                           │
│                                    │                                       │
│                                    ▼                                       │
│                         ┌──────────────────────┐                           │
│                         │  Enrichment Storage  │                           │
│                         │  (PostgreSQL)        │                           │
│                         └──────────────────────┘                           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. Connector Types & Configuration

### 2.1 News Sources Configuration

```yaml
# config/crawlers/news_sources.yaml
news_sources:
  # --- TIER 1: Major International ---
  - id: google_news
    type: rss
    url: "https://news.google.com/rss/search?q={keywords}&hl={lang}"
    languages: [en, sk, cs, de, ru, uk]
    priority: 1
    frequency: hourly
    rate_limit: 100/hour

  - id: bing_news
    type: api
    url: "https://api.bing.microsoft.com/v7.0/news/search"
    api_key_env: BING_NEWS_API_KEY
    languages: [en, sk, cs, de, ru]
    priority: 1
    frequency: hourly
    rate_limit: 1000/day

  # --- TIER 2: Regional - Slovakia/Czech ---
  - id: sme_sk
    type: rss
    url: "https://www.sme.sk/rss"
    language: sk
    priority: 2
    frequency: 6h
    categories: [krimi, ekonomika]

  - id: aktuality_sk
    type: rss
    url: "https://www.aktuality.sk/rss/"
    language: sk
    priority: 2
    frequency: 6h

  - id: pravda_sk
    type: rss
    url: "https://spravy.pravda.sk/rss/xml/"
    language: sk
    priority: 2
    frequency: 6h

  - id: idnes_cz
    type: rss
    url: "https://www.idnes.cz/rss"
    language: cs
    priority: 2
    frequency: 6h

  - id: novinky_cz
    type: rss
    url: "https://www.novinky.cz/rss"
    language: cs
    priority: 2
    frequency: 6h

  # --- TIER 2: Regional - Germany/Austria ---
  - id: spiegel_de
    type: rss
    url: "https://www.spiegel.de/schlagzeilen/tops/index.rss"
    language: de
    priority: 2
    frequency: 6h

  - id: standard_at
    type: rss
    url: "https://www.derstandard.at/rss"
    language: de
    priority: 2
    frequency: 6h

  # --- TIER 2: Regional - Russia/Ukraine ---
  - id: ria_novosti
    type: rss
    url: "https://ria.ru/export/rss2/archive/index.xml"
    language: ru
    priority: 2
    frequency: 6h
    keywords_filter: [мошенничество, fraud, scam]

  - id: ukrinform
    type: rss
    url: "https://www.ukrinform.ua/rss/block-lastnews"
    language: uk
    priority: 2
    frequency: 6h

  - id: pravda_ua
    type: rss
    url: "https://www.pravda.com.ua/rss/"
    language: uk
    priority: 2
    frequency: 6h

  # --- TIER 3: Other European ---
  - id: bbc_news
    type: rss
    url: "https://feeds.bbci.co.uk/news/rss.xml"
    language: en
    priority: 3
    frequency: daily

  - id: reuters
    type: rss
    url: "https://www.reutersagency.com/feed/"
    language: en
    priority: 3
    frequency: daily

  # ... continue to 50 sources

# Search keywords for filtering
search_keywords:
  sk: [podvod, podvodník, scam, krádež, sprenevera, finančný podvod]
  cs: [podvod, podvodník, scam, krádež, zpronevěra]
  en: [fraud, scam, scammer, theft, embezzlement, ponzi, romance scam]
  de: [betrug, betrüger, scam, diebstahl]
  ru: [мошенничество, мошенник, обман, кража, аферист]
  uk: [шахрайство, шахрай, обман, крадіжка]
```

### 2.2 Search Engine Connectors

```yaml
# config/crawlers/search_engines.yaml
search_engines:
  - id: google_cse
    type: api
    base_url: "https://www.googleapis.com/customsearch/v1"
    api_key_env: GOOGLE_CSE_API_KEY
    cx_env: GOOGLE_CSE_CX
    rate_limit: 100/day  # free tier
    priority: 1

  - id: bing_search
    type: api
    base_url: "https://api.bing.microsoft.com/v7.0/search"
    api_key_env: BING_SEARCH_API_KEY
    rate_limit: 1000/month  # free tier
    priority: 1

  - id: yandex_search
    type: api
    base_url: "https://yandex.com/search/xml"
    api_key_env: YANDEX_API_KEY
    folder_id_env: YANDEX_FOLDER_ID
    rate_limit: 1000/day
    priority: 2
    regions: [ru, ua, by, kz]

  - id: baidu_search
    type: api
    base_url: "https://www.baidu.com/s"
    proxy_url_env: BAIDU_PROXY_URL  # requires proxy outside China
    rate_limit: 500/day
    priority: 3
    enabled: false  # enable when proxy configured
```

### 2.3 PEP & Sanctions Lists

```yaml
# config/crawlers/pep_sanctions.yaml
pep_sanctions:
  # --- International ---
  - id: ofac_sdn
    name: "OFAC SDN List"
    type: xml
    url: "https://www.treasury.gov/ofac/downloads/sdn.xml"
    frequency: daily
    priority: 1
    parser: ofac_xml

  - id: ofac_consolidated
    name: "OFAC Consolidated"
    type: csv
    url: "https://www.treasury.gov/ofac/downloads/consolidated/consolidated.csv"
    frequency: daily
    priority: 1

  - id: eu_sanctions
    name: "EU Consolidated Sanctions"
    type: xml
    url: "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content"
    frequency: daily
    priority: 1
    parser: eu_sanctions_xml

  - id: un_sanctions
    name: "UN Security Council Sanctions"
    type: xml
    url: "https://scsanctions.un.org/resources/xml/en/consolidated.xml"
    frequency: daily
    priority: 1

  - id: interpol_notices
    name: "Interpol Red Notices"
    type: api
    url: "https://ws-public.interpol.int/notices/v1/red"
    frequency: daily
    priority: 1
    rate_limit: 100/day

  # --- National Lists ---
  - id: sk_pep
    name: "Slovakia PEP List"
    type: scrape
    url: "https://rpvs.gov.sk/rpvs"
    frequency: weekly
    priority: 2
    parser: sk_pep_scraper

  - id: cz_sanctions
    name: "Czech National Sanctions"
    type: api
    url: "https://www.financnianalytickyurad.cz/api/sanctions"
    frequency: daily
    priority: 2

  - id: ua_sanctions
    name: "Ukraine NSDC Sanctions"
    type: scrape
    url: "https://sanctions.nsdc.gov.ua"
    frequency: daily
    priority: 2

  - id: ru_fedlist
    name: "Russia Federal Financial Monitoring"
    type: xml
    url: "https://www.fedsfm.ru/documents/terrorists-catalog-portal-act"
    frequency: weekly
    priority: 3
```

## 3. Connector Implementation

### 3.1 Base Connector Class

```typescript
// src/crawlers/connectors/BaseConnector.ts

interface ConnectorConfig {
  id: string;
  type: 'rss' | 'api' | 'scrape' | 'xml' | 'csv';
  url: string;
  frequency: 'realtime' | 'hourly' | '6h' | 'daily' | 'weekly';
  priority: 1 | 2 | 3;
  rateLimit?: string;
  language?: string;
  enabled: boolean;
}

interface CrawlResult {
  sourceId: string;
  url: string;
  title: string;
  content: string;
  publishedAt: Date;
  language: string;
  entities: ExtractedEntity[];
  contentHash: string;
  metadata: Record<string, any>;
}

abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected rateLimiter: RateLimiter;
  protected cache: RedisCache;

  constructor(config: ConnectorConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }

  abstract fetch(): Promise<CrawlResult[]>;

  protected async checkRateLimit(): Promise<boolean> {
    return this.rateLimiter.canProceed(this.config.id);
  }

  protected computeContentHash(content: string): string {
    return crypto.createHash('sha256')
      .update(content.toLowerCase().replace(/\s+/g, ' ').trim())
      .digest('hex');
  }

  protected async isDuplicate(hash: string): Promise<boolean> {
    const exists = await this.db.query(
      'SELECT 1 FROM crawl_results WHERE content_hash = $1',
      [hash]
    );
    return exists.length > 0;
  }
}
```

### 3.2 RSS Connector

```typescript
// src/crawlers/connectors/RSSConnector.ts

import Parser from 'rss-parser';

class RSSConnector extends BaseConnector {
  private parser: Parser;

  constructor(config: ConnectorConfig) {
    super(config);
    this.parser = new Parser({
      timeout: 30000,
      headers: {
        'User-Agent': 'ScamnemesisBot/1.0 (+https://scamnemesis.com/bot)'
      }
    });
  }

  async fetch(): Promise<CrawlResult[]> {
    if (!await this.checkRateLimit()) {
      throw new RateLimitError(this.config.id);
    }

    const feed = await this.parser.parseURL(this.config.url);
    const results: CrawlResult[] = [];

    for (const item of feed.items) {
      const contentHash = this.computeContentHash(item.content || item.title);

      if (await this.isDuplicate(contentHash)) {
        continue;
      }

      const result: CrawlResult = {
        sourceId: this.config.id,
        url: item.link,
        title: item.title,
        content: item.content || item.contentSnippet || '',
        publishedAt: new Date(item.pubDate),
        language: this.config.language || await this.detectLanguage(item.content),
        entities: await this.extractEntities(item),
        contentHash,
        metadata: {
          author: item.creator,
          categories: item.categories
        }
      };

      results.push(result);
    }

    return results;
  }

  private async extractEntities(item: any): Promise<ExtractedEntity[]> {
    // NER extraction - names, organizations, locations
    const text = `${item.title} ${item.content}`;
    return this.nerService.extract(text);
  }
}
```

### 3.3 Sanctions Connector

```typescript
// src/crawlers/connectors/SanctionsConnector.ts

class OFACSanctionsConnector extends BaseConnector {
  async fetch(): Promise<SanctionEntry[]> {
    const response = await fetch(this.config.url);
    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    const data = parser.parse(xml);

    const entries: SanctionEntry[] = [];

    for (const entry of data.sdnList.sdnEntry) {
      const sanctionEntry: SanctionEntry = {
        sourceId: this.config.id,
        externalId: entry.uid,
        type: entry.sdnType, // 'Individual' | 'Entity'
        names: this.parseNames(entry),
        aliases: this.parseAliases(entry.akaList?.aka),
        dateOfBirth: entry.dateOfBirthList?.dateOfBirthItem,
        nationalities: this.parseNationalities(entry),
        addresses: this.parseAddresses(entry.addressList?.address),
        identifications: this.parseIds(entry.idList?.id),
        programs: entry.programList?.program,
        remarks: entry.remarks,
        lastUpdated: new Date()
      };

      entries.push(sanctionEntry);
    }

    return entries;
  }

  private parseNames(entry: any): string[] {
    const names = [];
    if (entry.firstName) names.push(`${entry.firstName} ${entry.lastName}`);
    if (entry.lastName) names.push(entry.lastName);
    return names;
  }

  private parseAliases(akaList: any[]): string[] {
    if (!akaList) return [];
    return akaList.map(aka =>
      [aka.firstName, aka.lastName].filter(Boolean).join(' ')
    );
  }
}
```

## 4. Job Queue & Scheduling

### 4.1 Job Queue Configuration

```typescript
// src/crawlers/queue/CrawlerQueue.ts

import Bull from 'bull';

const crawlerQueue = new Bull('crawler', {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 1000
  }
});

// Job types
interface CrawlJob {
  type: 'news' | 'sanctions' | 'search' | 'enrichment';
  sourceId: string;
  config: ConnectorConfig;
  keywords?: string[];
}

// Schedule jobs based on frequency
function scheduleJobs(sources: ConnectorConfig[]): void {
  sources.forEach(source => {
    const cronExpression = frequencyToCron(source.frequency);

    crawlerQueue.add(
      'crawl',
      { type: source.type, sourceId: source.id, config: source },
      {
        repeat: { cron: cronExpression },
        priority: source.priority
      }
    );
  });
}

function frequencyToCron(frequency: string): string {
  switch (frequency) {
    case 'realtime': return '*/5 * * * *';   // every 5 min
    case 'hourly': return '0 * * * *';       // every hour
    case '6h': return '0 */6 * * *';         // every 6 hours
    case 'daily': return '0 6 * * *';        // daily at 6 AM
    case 'weekly': return '0 6 * * 1';       // Monday 6 AM
    default: return '0 */6 * * *';
  }
}
```

### 4.2 Worker Implementation

```typescript
// src/crawlers/workers/CrawlerWorker.ts

crawlerQueue.process('crawl', async (job) => {
  const { sourceId, config, type } = job.data;

  const connector = ConnectorFactory.create(config);
  const logger = createLogger({ sourceId, jobId: job.id });

  try {
    logger.info('Starting crawl job');

    const results = await connector.fetch();
    logger.info(`Fetched ${results.length} items`);

    // Process each result
    for (const result of results) {
      // Language detection if not set
      if (!result.language) {
        result.language = await detectLanguage(result.content);
      }

      // Translation if needed
      if (result.language !== 'en' && config.translateToEn) {
        result.translatedContent = await translateToEnglish(result.content);
      }

      // Entity extraction
      result.entities = await extractEntities(result);

      // Store result
      await storeCrawlResult(result);

      // Queue enrichment job for matching perpetrators
      await queueEnrichmentMatching(result);
    }

    logger.info('Crawl job completed');
    return { processed: results.length };

  } catch (error) {
    logger.error('Crawl job failed', { error });
    throw error;
  }
});
```

## 5. Content Processing Pipeline

### 5.1 Language Detection

```typescript
// src/crawlers/processing/LanguageDetector.ts

import { franc } from 'franc';
import LanguageDetect from 'languagedetect';

class LanguageDetector {
  private detector = new LanguageDetect();

  async detect(text: string): Promise<string> {
    // Primary detection with franc
    const francResult = franc(text, { minLength: 10 });

    if (francResult !== 'und') {
      return this.mapToISO(francResult);
    }

    // Fallback to languagedetect
    const results = this.detector.detect(text, 1);
    if (results.length > 0) {
      return this.mapLanguageName(results[0][0]);
    }

    return 'unknown';
  }

  private mapToISO(code: string): string {
    const mapping: Record<string, string> = {
      'slk': 'sk', 'ces': 'cs', 'deu': 'de',
      'rus': 'ru', 'ukr': 'uk', 'eng': 'en',
      'pol': 'pl', 'hun': 'hu'
    };
    return mapping[code] || code;
  }
}
```

### 5.2 Entity Extraction (NER)

```typescript
// src/crawlers/processing/EntityExtractor.ts

interface ExtractedEntity {
  type: 'PERSON' | 'ORG' | 'LOCATION' | 'PHONE' | 'EMAIL' | 'IBAN' | 'CRYPTO';
  value: string;
  confidence: number;
  position: { start: number; end: number };
}

class EntityExtractor {
  // Regex patterns for structured data
  private patterns = {
    phone: /(?:\+|00)?[1-9]\d{0,2}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    iban: /[A-Z]{2}\d{2}[A-Z0-9]{4,30}/gi,
    btcWallet: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
    ethWallet: /\b0x[a-fA-F0-9]{40}\b/g
  };

  async extract(text: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    // Extract structured entities via regex
    for (const [type, pattern] of Object.entries(this.patterns)) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        entities.push({
          type: this.mapType(type),
          value: match[0],
          confidence: 0.95,
          position: { start: match.index!, end: match.index! + match[0].length }
        });
      }
    }

    // NER for names, organizations, locations
    // Using compromise.js for lightweight NER
    const doc = nlp(text);

    doc.people().forEach((p: any) => {
      entities.push({
        type: 'PERSON',
        value: p.text(),
        confidence: 0.7,
        position: { start: 0, end: 0 }
      });
    });

    doc.organizations().forEach((o: any) => {
      entities.push({
        type: 'ORG',
        value: o.text(),
        confidence: 0.7,
        position: { start: 0, end: 0 }
      });
    });

    return entities;
  }
}
```

### 5.3 Translation Pipeline

```typescript
// src/crawlers/processing/TranslationService.ts

interface TranslationConfig {
  provider: 'deepl' | 'google' | 'libretranslate';
  apiKey?: string;
  selfHostedUrl?: string;
}

class TranslationService {
  constructor(private config: TranslationConfig) {}

  async translate(text: string, from: string, to: string = 'en'): Promise<string> {
    if (from === to) return text;

    switch (this.config.provider) {
      case 'deepl':
        return this.translateDeepL(text, from, to);
      case 'libretranslate':
        return this.translateLibre(text, from, to);
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  private async translateDeepL(text: string, from: string, to: string): Promise<string> {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [text],
        source_lang: from.toUpperCase(),
        target_lang: to.toUpperCase()
      })
    });

    const data = await response.json();
    return data.translations[0].text;
  }

  // Self-hosted LibreTranslate for cost savings
  private async translateLibre(text: string, from: string, to: string): Promise<string> {
    const response = await fetch(`${this.config.selfHostedUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to
      })
    });

    const data = await response.json();
    return data.translatedText;
  }
}
```

## 6. Deduplication & Canonicalization

```typescript
// src/crawlers/processing/Deduplicator.ts

class ContentDeduplicator {
  async isDuplicate(result: CrawlResult): Promise<{
    isDuplicate: boolean;
    duplicateOf?: string;
    similarity?: number;
  }> {
    // 1. Exact URL match
    const urlMatch = await this.checkUrlDuplicate(result.url);
    if (urlMatch) {
      return { isDuplicate: true, duplicateOf: urlMatch.id };
    }

    // 2. Content hash match
    const hashMatch = await this.checkHashDuplicate(result.contentHash);
    if (hashMatch) {
      return { isDuplicate: true, duplicateOf: hashMatch.id };
    }

    // 3. Semantic similarity (for near-duplicates)
    const similarMatch = await this.checkSemanticSimilarity(result);
    if (similarMatch && similarMatch.similarity > 0.9) {
      return {
        isDuplicate: true,
        duplicateOf: similarMatch.id,
        similarity: similarMatch.similarity
      };
    }

    return { isDuplicate: false };
  }

  private canonicalizeUrl(url: string): string {
    const parsed = new URL(url);

    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
    trackingParams.forEach(p => parsed.searchParams.delete(p));

    // Normalize
    parsed.hostname = parsed.hostname.replace(/^www\./, '');
    parsed.pathname = parsed.pathname.replace(/\/$/, '');

    return parsed.toString().toLowerCase();
  }
}
```

## 7. Enrichment Matching

```typescript
// src/crawlers/enrichment/EnrichmentMatcher.ts

class EnrichmentMatcher {
  async matchWithReports(crawlResult: CrawlResult): Promise<EnrichmentMatch[]> {
    const matches: EnrichmentMatch[] = [];

    // Extract entities from crawl result
    const entities = crawlResult.entities;

    for (const entity of entities) {
      // Match names with perpetrators
      if (entity.type === 'PERSON') {
        const perpetratorMatches = await this.findSimilarPerpetrators(entity.value);

        for (const match of perpetratorMatches) {
          matches.push({
            perpetratorId: match.id,
            sourceType: 'crawl',
            sourceId: crawlResult.sourceId,
            matchType: 'name',
            matchValue: entity.value,
            similarity: match.similarity,
            crawlResultId: crawlResult.id
          });
        }
      }

      // Match unique identifiers
      if (['PHONE', 'EMAIL', 'IBAN', 'CRYPTO'].includes(entity.type)) {
        const exactMatches = await this.findExactMatches(entity);

        for (const match of exactMatches) {
          matches.push({
            perpetratorId: match.perpetratorId,
            sourceType: 'crawl',
            sourceId: crawlResult.sourceId,
            matchType: entity.type.toLowerCase(),
            matchValue: entity.value,
            similarity: 1.0,
            crawlResultId: crawlResult.id
          });
        }
      }
    }

    // Store matches and notify
    if (matches.length > 0) {
      await this.storeMatches(matches);
      await this.notifyAdmins(matches);
    }

    return matches;
  }

  private async findSimilarPerpetrators(name: string): Promise<Array<{id: string; similarity: number}>> {
    // Use trigram + Levenshtein for fuzzy matching
    const results = await this.db.query(`
      SELECT
        id,
        full_name,
        similarity(full_name, $1) as sim_score
      FROM perpetrators
      WHERE full_name % $1
        OR levenshtein(lower(full_name), lower($1)) <= 3
      ORDER BY sim_score DESC
      LIMIT 10
    `, [name]);

    return results.map(r => ({
      id: r.id,
      similarity: r.sim_score
    }));
  }
}
```

## 8. Database Schema for Crawling

```sql
-- Crawl sources configuration
CREATE TABLE crawl_sources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- rss, api, scrape, xml, csv
    url TEXT NOT NULL,
    language VARCHAR(5),
    frequency VARCHAR(20) NOT NULL,
    priority SMALLINT DEFAULT 2,
    config JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    last_crawl_at TIMESTAMPTZ,
    next_crawl_at TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crawl results storage
CREATE TABLE crawl_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(50) REFERENCES crawl_sources(id),
    url TEXT NOT NULL,
    url_canonical TEXT,
    title TEXT,
    content TEXT,
    content_translated TEXT,
    language VARCHAR(5),
    published_at TIMESTAMPTZ,
    content_hash VARCHAR(64) NOT NULL,
    entities JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_content_hash UNIQUE (content_hash)
);

CREATE INDEX idx_crawl_results_source ON crawl_results(source_id);
CREATE INDEX idx_crawl_results_published ON crawl_results(published_at DESC);
CREATE INDEX idx_crawl_results_url ON crawl_results(url_canonical);

-- Sanctions/PEP entries
CREATE TABLE sanctions_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(50) REFERENCES crawl_sources(id),
    external_id VARCHAR(100),
    entry_type VARCHAR(20), -- Individual, Entity
    names TEXT[] NOT NULL,
    aliases TEXT[],
    date_of_birth DATE,
    nationalities TEXT[],
    addresses JSONB DEFAULT '[]',
    identifications JSONB DEFAULT '[]',
    programs TEXT[],
    remarks TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_sanctions_source_external UNIQUE (source_id, external_id)
);

CREATE INDEX idx_sanctions_names ON sanctions_entries USING gin (names);
CREATE INDEX idx_sanctions_aliases ON sanctions_entries USING gin (aliases);

-- Enrichment matches (crawler results matched to perpetrators)
CREATE TABLE enrichment_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perpetrator_id UUID REFERENCES perpetrators(id),
    source_type VARCHAR(20) NOT NULL, -- crawl, sanctions, manual
    source_id VARCHAR(50),
    crawl_result_id UUID REFERENCES crawl_results(id),
    sanctions_entry_id UUID REFERENCES sanctions_entries(id),
    match_type VARCHAR(20) NOT NULL, -- name, phone, email, iban, crypto
    match_value TEXT NOT NULL,
    similarity DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, rejected
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrichment_perpetrator ON enrichment_matches(perpetrator_id);
CREATE INDEX idx_enrichment_status ON enrichment_matches(status);
```

## 9. Configuration & Scheduling

### 9.1 Environment Variables

```bash
# Crawler Configuration
CRAWLER_WORKERS=3
CRAWLER_RETRY_ATTEMPTS=3
CRAWLER_RETRY_BACKOFF=5000

# API Keys
GOOGLE_CSE_API_KEY=xxx
GOOGLE_CSE_CX=xxx
BING_SEARCH_API_KEY=xxx
YANDEX_API_KEY=xxx
YANDEX_FOLDER_ID=xxx
DEEPL_API_KEY=xxx

# Rate Limits
RATE_LIMIT_GOOGLE=100/day
RATE_LIMIT_BING=1000/month
RATE_LIMIT_YANDEX=1000/day

# LibreTranslate (self-hosted)
LIBRETRANSLATE_URL=http://libretranslate:5000
```

### 9.2 Scheduling Configuration

```yaml
# config/crawler_schedule.yaml
schedules:
  # High priority - hourly
  tier1:
    sources: [google_news, bing_news, ofac_sdn]
    cron: "0 * * * *"  # every hour
    max_concurrent: 2

  # Medium priority - every 6 hours
  tier2:
    sources: [regional_news, eu_sanctions, interpol]
    cron: "0 */6 * * *"
    max_concurrent: 3

  # Low priority - daily
  tier3:
    sources: [other_news, national_pep]
    cron: "0 4 * * *"  # 4 AM
    max_concurrent: 5

  # Weekly - national registries
  tier4:
    sources: [national_registries]
    cron: "0 3 * * 0"  # Sunday 3 AM
    max_concurrent: 2
```

## 10. Monitoring & Alerts

```typescript
// Prometheus metrics for crawler
const crawlerMetrics = {
  jobsProcessed: new Counter({
    name: 'crawler_jobs_processed_total',
    help: 'Total crawler jobs processed',
    labelNames: ['source_id', 'status']
  }),

  jobDuration: new Histogram({
    name: 'crawler_job_duration_seconds',
    help: 'Crawler job duration',
    labelNames: ['source_id'],
    buckets: [1, 5, 10, 30, 60, 120]
  }),

  itemsFetched: new Counter({
    name: 'crawler_items_fetched_total',
    help: 'Total items fetched',
    labelNames: ['source_id']
  }),

  enrichmentMatches: new Counter({
    name: 'crawler_enrichment_matches_total',
    help: 'Enrichment matches found',
    labelNames: ['match_type']
  }),

  queueSize: new Gauge({
    name: 'crawler_queue_size',
    help: 'Current crawler queue size'
  }),

  errorRate: new Counter({
    name: 'crawler_errors_total',
    help: 'Crawler errors',
    labelNames: ['source_id', 'error_type']
  })
};
```
