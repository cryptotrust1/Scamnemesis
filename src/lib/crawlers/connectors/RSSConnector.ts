/**
 * RSS News Connector
 * Fetches articles from RSS/Atom feeds and extracts entities
 *
 * Supports multiple regional news sources from SK, CZ, DE, RU, UK
 */

import { XMLParser } from 'fast-xml-parser';
import { BaseConnector, RateLimitError } from './BaseConnector';
import { ConnectorConfig, CrawlResult } from '../queue';

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  'content:encoded'?: string;
  pubDate?: string;
  'dc:date'?: string;
  author?: string;
  'dc:creator'?: string;
  category?: string | string[];
  guid?: string | { '#text': string };
}

interface RSSChannel {
  title?: string;
  link?: string;
  description?: string;
  language?: string;
  item?: RSSItem | RSSItem[];
}

interface AtomEntry {
  title?: string | { '#text': string };
  link?: { '@_href': string } | Array<{ '@_href': string; '@_rel'?: string }>;
  content?: string | { '#text': string };
  summary?: string | { '#text': string };
  published?: string;
  updated?: string;
  author?: { name?: string };
  category?: { '@_term': string } | Array<{ '@_term': string }>;
  id?: string;
}

// Keywords for fraud-related filtering
const FRAUD_KEYWORDS: Record<string, string[]> = {
  sk: ['podvod', 'podvodnik', 'scam', 'kradez', 'sprenevera', 'financny podvod', 'oszust', 'falzifikat'],
  cs: ['podvod', 'podvodnik', 'scam', 'kradez', 'zpronevera', 'uplatkarstvi'],
  en: ['fraud', 'scam', 'scammer', 'theft', 'embezzlement', 'ponzi', 'romance scam', 'phishing'],
  de: ['betrug', 'betruger', 'scam', 'diebstahl', 'unterschlagung', 'abzocke'],
  ru: ['мошенничество', 'мошенник', 'обман', 'кража', 'аферист', 'развод'],
  uk: ['шахрайство', 'шахрай', 'обман', 'крадіжка', 'афера'],
};

export class RSSConnector extends BaseConnector {
  private parser: XMLParser;
  private keywords: string[];

  constructor(config: ConnectorConfig & { keywords?: string[] }) {
    super(config);
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (tagName) => {
        return ['item', 'entry', 'category', 'link'].includes(tagName);
      },
    });

    // Set keywords based on language or custom keywords
    this.keywords = config.keywords || FRAUD_KEYWORDS[config.language || 'en'] || FRAUD_KEYWORDS.en;
  }

  /**
   * Fetch RSS feed and extract articles
   */
  async fetch(): Promise<CrawlResult[]> {
    if (!(await this.checkRateLimit())) {
      throw new RateLimitError(this.config.id);
    }

    this.log('info', 'Fetching RSS feed', { url: this.config.url });

    try {
      const response = await this.fetchWithRetry(this.config.url);
      const xml = await response.text();

      this.log('info', 'Downloaded RSS feed', { size: xml.length });

      const data = this.parser.parse(xml);
      const results: CrawlResult[] = [];

      // Handle RSS 2.0 format
      if (data.rss?.channel) {
        const channel = data.rss.channel as RSSChannel;
        const items = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];

        for (const item of items) {
          const result = this.parseRSSItem(item, channel.language);
          if (result && this.matchesKeywords(result)) {
            results.push(result);
          }
        }
      }

      // Handle Atom format
      if (data.feed?.entry) {
        const entries = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];

        for (const entry of entries) {
          const result = this.parseAtomEntry(entry);
          if (result && this.matchesKeywords(result)) {
            results.push(result);
          }
        }
      }

      // Handle RSS 1.0/RDF format
      if (data['rdf:RDF']?.item) {
        const items = Array.isArray(data['rdf:RDF'].item)
          ? data['rdf:RDF'].item
          : [data['rdf:RDF'].item];

        for (const item of items) {
          const result = this.parseRSSItem(item);
          if (result && this.matchesKeywords(result)) {
            results.push(result);
          }
        }
      }

      this.log('info', 'RSS fetch completed', {
        totalItems: results.length,
        matchedKeywords: true,
      });

      return results;
    } catch (error) {
      this.log('error', 'RSS fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Parse RSS 2.0 item
   */
  private parseRSSItem(item: RSSItem, feedLanguage?: string): CrawlResult | null {
    const title = item.title;
    const link = item.link;

    if (!title || !link) {
      return null;
    }

    // Get content
    const content = item['content:encoded'] || item.description || '';

    // Get publication date
    const pubDate = item.pubDate || item['dc:date'];
    const publishedAt = pubDate ? new Date(pubDate) : undefined;

    // Get GUID
    const guid = typeof item.guid === 'string' ? item.guid : item.guid?.['#text'] || link;

    // Compute content hash
    const contentHash = this.computeContentHash(`${title}${content}`);

    // Extract entities from content
    const fullText = `${title} ${this.stripHtml(content)}`;
    const entities = this.extractEntities(fullText);

    // Get categories
    const categories = Array.isArray(item.category)
      ? item.category
      : item.category
        ? [item.category]
        : [];

    return {
      sourceId: this.config.id,
      externalId: guid,
      url: link,
      title,
      content: this.stripHtml(content),
      publishedAt,
      language: feedLanguage || this.config.language,
      entities,
      contentHash,
      metadata: {
        author: item.author || item['dc:creator'],
        categories,
      },
    };
  }

  /**
   * Parse Atom entry
   */
  private parseAtomEntry(entry: AtomEntry): CrawlResult | null {
    // Get title
    const title = typeof entry.title === 'string' ? entry.title : entry.title?.['#text'];

    // Get link
    let link: string | undefined;
    if (Array.isArray(entry.link)) {
      const alternateLink = entry.link.find((l) => l['@_rel'] === 'alternate' || !l['@_rel']);
      link = alternateLink?.['@_href'];
    } else if (entry.link) {
      link = entry.link['@_href'];
    }

    if (!title || !link) {
      return null;
    }

    // Get content
    const content =
      typeof entry.content === 'string'
        ? entry.content
        : entry.content?.['#text'] ||
          (typeof entry.summary === 'string' ? entry.summary : entry.summary?.['#text']) ||
          '';

    // Get publication date
    const pubDate = entry.published || entry.updated;
    const publishedAt = pubDate ? new Date(pubDate) : undefined;

    // Compute content hash
    const contentHash = this.computeContentHash(`${title}${content}`);

    // Extract entities
    const fullText = `${title} ${this.stripHtml(content)}`;
    const entities = this.extractEntities(fullText);

    // Get categories
    const categories: string[] = [];
    if (entry.category) {
      const cats = Array.isArray(entry.category) ? entry.category : [entry.category];
      for (const cat of cats) {
        if (cat['@_term']) {
          categories.push(cat['@_term']);
        }
      }
    }

    return {
      sourceId: this.config.id,
      externalId: entry.id || link,
      url: link,
      title,
      content: this.stripHtml(content),
      publishedAt,
      language: this.config.language,
      entities,
      contentHash,
      metadata: {
        author: entry.author?.name,
        categories,
      },
    };
  }

  /**
   * Check if content matches fraud keywords
   */
  private matchesKeywords(result: CrawlResult): boolean {
    const searchText = `${result.title} ${result.content}`.toLowerCase();

    return this.keywords.some((keyword) => searchText.includes(keyword.toLowerCase()));
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Pre-configured news source connectors
 */
export const NEWS_SOURCE_CONFIGS: ConnectorConfig[] = [
  // Slovakia
  {
    id: 'sme_sk',
    name: 'SME.sk',
    type: 'rss',
    url: 'https://www.sme.sk/rss',
    language: 'sk',
    frequency: '6h',
    priority: 2,
    rateLimit: '10/hour',
    enabled: true,
  },
  {
    id: 'aktuality_sk',
    name: 'Aktuality.sk',
    type: 'rss',
    url: 'https://www.aktuality.sk/rss/',
    language: 'sk',
    frequency: '6h',
    priority: 2,
    rateLimit: '10/hour',
    enabled: true,
  },
  {
    id: 'pravda_sk',
    name: 'Pravda.sk',
    type: 'rss',
    url: 'https://spravy.pravda.sk/rss/xml/',
    language: 'sk',
    frequency: '6h',
    priority: 2,
    rateLimit: '10/hour',
    enabled: true,
  },

  // Czech Republic
  {
    id: 'idnes_cz',
    name: 'iDNES.cz',
    type: 'rss',
    url: 'https://www.idnes.cz/rss',
    language: 'cs',
    frequency: '6h',
    priority: 2,
    rateLimit: '10/hour',
    enabled: true,
  },
  {
    id: 'novinky_cz',
    name: 'Novinky.cz',
    type: 'rss',
    url: 'https://www.novinky.cz/rss',
    language: 'cs',
    frequency: '6h',
    priority: 2,
    rateLimit: '10/hour',
    enabled: true,
  },

  // Germany
  {
    id: 'spiegel_de',
    name: 'Spiegel.de',
    type: 'rss',
    url: 'https://www.spiegel.de/schlagzeilen/index.rss',
    language: 'de',
    frequency: '6h',
    priority: 2,
    rateLimit: '10/hour',
    enabled: true,
  },

  // International
  {
    id: 'bbc_news',
    name: 'BBC News',
    type: 'rss',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    language: 'en',
    frequency: 'daily',
    priority: 3,
    rateLimit: '10/hour',
    enabled: true,
  },
  {
    id: 'reuters',
    name: 'Reuters',
    type: 'rss',
    url: 'https://www.reutersagency.com/feed/',
    language: 'en',
    frequency: 'daily',
    priority: 3,
    rateLimit: '10/hour',
    enabled: true,
  },
];
