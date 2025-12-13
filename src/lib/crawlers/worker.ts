/**
 * Crawler Worker Service
 * Processes crawler jobs from the queue
 */

import { Job } from 'bull';
import { prisma } from '@/lib/db';
import {
  getCrawlerQueue,
  getSanctionsQueue,
  getEnrichmentQueue,
  CrawlJobData,
  CrawlResult,
  SanctionEntry,
  frequencyToCron,
  scheduleJob,
} from './queue';
import {
  registerConnectors,
  OFACConnector,
  EUSanctionsConnector,
  InterpolConnector,
  RSSConnector,
  OFAC_DEFAULT_CONFIG,
  EU_SANCTIONS_DEFAULT_CONFIG,
  INTERPOL_DEFAULT_CONFIG,
  NEWS_SOURCE_CONFIGS,
} from './connectors';

// Initialize connectors
registerConnectors();

/**
 * Start the crawler worker
 */
export async function startCrawlerWorker(): Promise<void> {
  const crawlerQueue = getCrawlerQueue();
  const sanctionsQueue = getSanctionsQueue();
  const enrichmentQueue = getEnrichmentQueue();

  console.log('[Crawler Worker] Starting...');

  // Process crawler jobs (news, search)
  crawlerQueue.process('crawl', 2, async (job: Job<CrawlJobData>) => {
    return processCrawlJob(job);
  });

  // Process sanctions jobs (OFAC, EU, Interpol)
  sanctionsQueue.process('sanctions', 1, async (job: Job<CrawlJobData>) => {
    return processSanctionsJob(job);
  });

  // Process enrichment matching
  enrichmentQueue.process('match', 3, async (job: Job<{ perpetratorId: string; crawlResultId: string }>) => {
    return processEnrichmentMatch(job);
  });

  // Set up event handlers
  crawlerQueue.on('completed', (job, result) => {
    console.log(`[Crawler] Job ${job.id} completed:`, result);
  });

  crawlerQueue.on('failed', (job, error) => {
    console.error(`[Crawler] Job ${job.id} failed:`, error.message);
  });

  sanctionsQueue.on('completed', (job, result) => {
    console.log(`[Sanctions] Job ${job.id} completed:`, result);
  });

  sanctionsQueue.on('failed', (job, error) => {
    console.error(`[Sanctions] Job ${job.id} failed:`, error.message);
  });

  console.log('[Crawler Worker] Ready to process jobs');
}

/**
 * Process a crawl job (news/search)
 */
async function processCrawlJob(job: Job<CrawlJobData>): Promise<{ processed: number; sourceId: string }> {
  const { sourceId, config } = job.data;

  console.log(`[Crawler] Processing job for source: ${sourceId}`);

  try {
    const connector = new RSSConnector(config);
    const results = (await connector.fetch()) as CrawlResult[];

    let stored = 0;
    for (const result of results) {
      // Check if already exists
      const existing = await prisma.$queryRaw`
        SELECT id FROM crawl_results WHERE content_hash = ${result.contentHash} LIMIT 1
      ` as { id: string }[];

      if (existing.length === 0) {
        // Store crawl result
        await storeCrawlResult(result);
        stored++;

        // Queue enrichment matching for entities
        if (result.entities.length > 0) {
          await queueEnrichmentMatching(result);
        }
      }

      // Update job progress
      job.progress(Math.round((stored / results.length) * 100));
    }

    return { processed: stored, sourceId };
  } catch (error) {
    console.error(`[Crawler] Error processing ${sourceId}:`, error);
    throw error;
  }
}

/**
 * Process a sanctions job (OFAC, EU, Interpol)
 */
async function processSanctionsJob(job: Job<CrawlJobData>): Promise<{ processed: number; sourceId: string }> {
  const { sourceId, config } = job.data;

  console.log(`[Sanctions] Processing job for source: ${sourceId}`);

  try {
    let connector;
    switch (sourceId) {
      case 'ofac_sdn':
        connector = new OFACConnector(config);
        break;
      case 'eu_sanctions':
        connector = new EUSanctionsConnector(config);
        break;
      case 'interpol_red':
        connector = new InterpolConnector(config);
        break;
      default:
        throw new Error(`Unknown sanctions source: ${sourceId}`);
    }

    const entries = (await connector.fetch()) as SanctionEntry[];

    let stored = 0;
    for (const entry of entries) {
      await storeSanctionEntry(entry);
      stored++;

      // Update job progress
      job.progress(Math.round((stored / entries.length) * 100));
    }

    return { processed: stored, sourceId };
  } catch (error) {
    console.error(`[Sanctions] Error processing ${sourceId}:`, error);
    throw error;
  }
}

/**
 * Store crawl result in database
 */
async function storeCrawlResult(result: CrawlResult): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO crawl_results (
      id, source_id, url, url_canonical, title, content,
      language, published_at, content_hash, entities, metadata, created_at
    ) VALUES (
      gen_random_uuid(),
      ${result.sourceId},
      ${result.url},
      ${result.url?.toLowerCase().replace(/\?.*$/, '').replace(/\/$/, '')},
      ${result.title},
      ${result.content},
      ${result.language},
      ${result.publishedAt},
      ${result.contentHash},
      ${JSON.stringify(result.entities)}::jsonb,
      ${JSON.stringify(result.metadata)}::jsonb,
      NOW()
    )
    ON CONFLICT (content_hash) DO NOTHING
  `;
}

/**
 * Store sanction entry in database
 */
async function storeSanctionEntry(entry: SanctionEntry): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO sanctions_entries (
      id, source_id, external_id, entry_type, names, aliases,
      date_of_birth, nationalities, addresses, identifications,
      programs, remarks, raw_data, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      ${entry.sourceId},
      ${entry.externalId},
      ${entry.type},
      ${entry.names}::text[],
      ${entry.aliases}::text[],
      ${entry.dateOfBirth}::date,
      ${entry.nationalities}::text[],
      ${JSON.stringify(entry.addresses)}::jsonb,
      ${JSON.stringify(entry.identifications)}::jsonb,
      ${entry.programs}::text[],
      ${entry.remarks},
      ${JSON.stringify(entry.rawData)}::jsonb,
      NOW(),
      NOW()
    )
    ON CONFLICT (source_id, external_id)
    DO UPDATE SET
      names = EXCLUDED.names,
      aliases = EXCLUDED.aliases,
      nationalities = EXCLUDED.nationalities,
      addresses = EXCLUDED.addresses,
      identifications = EXCLUDED.identifications,
      programs = EXCLUDED.programs,
      remarks = EXCLUDED.remarks,
      raw_data = EXCLUDED.raw_data,
      updated_at = NOW()
  `;
}

/**
 * Queue enrichment matching for a crawl result
 */
async function queueEnrichmentMatching(result: CrawlResult): Promise<void> {
  const enrichmentQueue = getEnrichmentQueue();

  // For each entity found, try to match with perpetrators
  for (const entity of result.entities) {
    if (['PHONE', 'EMAIL', 'IBAN', 'CRYPTO'].includes(entity.type)) {
      await enrichmentQueue.add('match', {
        perpetratorId: '', // Will be matched in processor
        crawlResultId: result.contentHash, // Use content hash as reference
      });
    }
  }
}

/**
 * Process enrichment matching job
 */
async function processEnrichmentMatch(
  _job: Job<{ perpetratorId: string; crawlResultId: string }>
): Promise<{ matches: number }> {
  // This would match crawl result entities with existing perpetrators
  // For now, this is a placeholder
  return { matches: 0 };
}

/**
 * Schedule all crawler jobs
 */
export async function scheduleAllJobs(): Promise<void> {
  const crawlerQueue = getCrawlerQueue();
  const sanctionsQueue = getSanctionsQueue();

  console.log('[Crawler] Scheduling all jobs...');

  // Schedule sanctions crawlers
  const sanctionsConfigs = [OFAC_DEFAULT_CONFIG, EU_SANCTIONS_DEFAULT_CONFIG, INTERPOL_DEFAULT_CONFIG];

  for (const config of sanctionsConfigs) {
    if (config.enabled) {
      await scheduleJob(
        sanctionsQueue,
        `sanctions:${config.id}`,
        {
          type: 'sanctions',
          sourceId: config.id,
          config,
        },
        frequencyToCron(config.frequency)
      );
      console.log(`[Crawler] Scheduled ${config.id} (${config.frequency})`);
    }
  }

  // Schedule news crawlers
  for (const config of NEWS_SOURCE_CONFIGS) {
    if (config.enabled) {
      await scheduleJob(
        crawlerQueue,
        `news:${config.id}`,
        {
          type: 'news',
          sourceId: config.id,
          config,
        },
        frequencyToCron(config.frequency)
      );
      console.log(`[Crawler] Scheduled ${config.id} (${config.frequency})`);
    }
  }

  console.log('[Crawler] All jobs scheduled');
}

/**
 * Run a specific crawler immediately
 */
export async function runCrawlerNow(sourceId: string): Promise<void> {
  const sanctionsQueue = getSanctionsQueue();
  const crawlerQueue = getCrawlerQueue();

  // Find config
  const sanctionsConfig = [OFAC_DEFAULT_CONFIG, EU_SANCTIONS_DEFAULT_CONFIG, INTERPOL_DEFAULT_CONFIG].find(
    (c) => c.id === sourceId
  );

  if (sanctionsConfig) {
    await sanctionsQueue.add(
      sourceId,
      {
        type: 'sanctions',
        sourceId,
        config: sanctionsConfig,
      },
      { priority: 1 }
    );
    console.log(`[Crawler] Queued immediate job for ${sourceId}`);
    return;
  }

  const newsConfig = NEWS_SOURCE_CONFIGS.find((c) => c.id === sourceId);
  if (newsConfig) {
    await crawlerQueue.add(
      sourceId,
      {
        type: 'news',
        sourceId,
        config: newsConfig,
      },
      { priority: 1 }
    );
    console.log(`[Crawler] Queued immediate job for ${sourceId}`);
    return;
  }

  throw new Error(`Unknown source: ${sourceId}`);
}

/**
 * Get crawler status
 */
export async function getCrawlerStatus(): Promise<{
  sanctions: { waiting: number; active: number; completed: number; failed: number };
  news: { waiting: number; active: number; completed: number; failed: number };
}> {
  const sanctionsQueue = getSanctionsQueue();
  const crawlerQueue = getCrawlerQueue();

  const [sanctionsStats, newsStats] = await Promise.all([
    Promise.all([
      sanctionsQueue.getWaitingCount(),
      sanctionsQueue.getActiveCount(),
      sanctionsQueue.getCompletedCount(),
      sanctionsQueue.getFailedCount(),
    ]),
    Promise.all([
      crawlerQueue.getWaitingCount(),
      crawlerQueue.getActiveCount(),
      crawlerQueue.getCompletedCount(),
      crawlerQueue.getFailedCount(),
    ]),
  ]);

  return {
    sanctions: {
      waiting: sanctionsStats[0],
      active: sanctionsStats[1],
      completed: sanctionsStats[2],
      failed: sanctionsStats[3],
    },
    news: {
      waiting: newsStats[0],
      active: newsStats[1],
      completed: newsStats[2],
      failed: newsStats[3],
    },
  };
}
