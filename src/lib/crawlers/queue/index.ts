/**
 * Crawler Job Queue System
 * Uses Bull for Redis-based job processing
 */

import Bull, { Job, Queue } from 'bull';

// Types
export interface CrawlJobData {
  type: 'sanctions' | 'news' | 'search' | 'enrichment';
  sourceId: string;
  config: ConnectorConfig;
  keywords?: string[];
  priority?: number;
}

export interface ConnectorConfig {
  id: string;
  name: string;
  type: 'rss' | 'api' | 'xml' | 'csv' | 'scrape';
  url: string;
  frequency: 'realtime' | 'hourly' | '6h' | 'daily' | 'weekly';
  priority: 1 | 2 | 3;
  rateLimit?: string;
  language?: string;
  enabled: boolean;
  apiKeyEnv?: string;
  headers?: Record<string, string>;
}

export interface CrawlResult {
  sourceId: string;
  externalId?: string;
  url?: string;
  title?: string;
  content?: string;
  publishedAt?: Date;
  language?: string;
  entities: ExtractedEntity[];
  contentHash: string;
  metadata: Record<string, unknown>;
  rawData?: unknown;
}

export interface ExtractedEntity {
  type: 'PERSON' | 'ORG' | 'LOCATION' | 'PHONE' | 'EMAIL' | 'IBAN' | 'CRYPTO' | 'LICENSE_PLATE' | 'VIN';
  value: string;
  normalizedValue?: string;
  confidence: number;
  position?: { start: number; end: number };
}

export interface SanctionEntry {
  sourceId: string;
  externalId: string;
  type: 'Individual' | 'Entity';
  names: string[];
  aliases: string[];
  dateOfBirth?: string;
  nationalities: string[];
  addresses: Array<{
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  }>;
  identifications: Array<{
    type: string;
    number: string;
    country?: string;
  }>;
  programs: string[];
  remarks?: string;
  lastUpdated: Date;
  rawData?: unknown;
}

// Redis connection config
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create queues
let crawlerQueue: Queue<CrawlJobData> | null = null;
let sanctionsQueue: Queue<CrawlJobData> | null = null;
let enrichmentQueue: Queue<{ perpetratorId: string; crawlResultId: string }> | null = null;

/**
 * Initialize crawler queue
 */
export function getCrawlerQueue(): Queue<CrawlJobData> {
  if (!crawlerQueue) {
    crawlerQueue = new Bull('crawler', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    });
  }
  return crawlerQueue;
}

/**
 * Initialize sanctions queue (higher priority)
 */
export function getSanctionsQueue(): Queue<CrawlJobData> {
  if (!sanctionsQueue) {
    sanctionsQueue = new Bull('sanctions', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: 50,
        removeOnFail: 500,
        timeout: 300000, // 5 minutes
      },
    });
  }
  return sanctionsQueue;
}

/**
 * Initialize enrichment queue
 */
export function getEnrichmentQueue(): Queue<{ perpetratorId: string; crawlResultId: string }> {
  if (!enrichmentQueue) {
    enrichmentQueue = new Bull('enrichment', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
        removeOnComplete: 200,
      },
    });
  }
  return enrichmentQueue;
}

/**
 * Convert frequency to cron expression
 */
export function frequencyToCron(frequency: string): string {
  switch (frequency) {
    case 'realtime':
      return '*/5 * * * *'; // every 5 minutes
    case 'hourly':
      return '0 * * * *'; // every hour
    case '6h':
      return '0 */6 * * *'; // every 6 hours
    case 'daily':
      return '0 6 * * *'; // daily at 6 AM
    case 'weekly':
      return '0 6 * * 1'; // Monday 6 AM
    default:
      return '0 */6 * * *'; // default: every 6 hours
  }
}

/**
 * Schedule a recurring crawl job
 */
export async function scheduleJob(
  queue: Queue<CrawlJobData>,
  jobName: string,
  data: CrawlJobData,
  cronExpression: string
): Promise<void> {
  // Remove existing job with same name
  const existingJobs = await queue.getRepeatableJobs();
  for (const job of existingJobs) {
    if (job.name === jobName) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  // Add new repeatable job
  await queue.add(jobName, data, {
    repeat: { cron: cronExpression },
    priority: data.priority || 5,
  });
}

/**
 * Add immediate job to queue
 */
export async function addJob(
  queue: Queue<CrawlJobData>,
  data: CrawlJobData
): Promise<Job<CrawlJobData>> {
  return queue.add(data.sourceId, data, {
    priority: data.priority || 5,
  });
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queue: Queue): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

/**
 * Clean up old jobs
 */
export async function cleanQueue(queue: Queue, olderThanMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  await queue.clean(olderThanMs, 'completed');
  await queue.clean(olderThanMs * 7, 'failed');
}

export type { Job, Queue };
