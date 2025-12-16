/**
 * Duplicate Detection Service
 * Detects duplicate reports based on exact and fuzzy matching
 */

import { prisma } from '@/lib/db';
import { normalizePhone, normalizeEmail, normalizeIBAN, normalizeCryptoWallet } from './normalizers';
import { matchNames } from './fuzzy-matchers';
import { getThresholds, DuplicateThresholds } from './config';

export interface DuplicateMatch {
  reportId: string;
  similarity: number;
  matchType: 'exact_phone' | 'exact_email' | 'exact_iban' | 'exact_crypto' | 'fuzzy_name' | 'combined';
  matchDetails: Record<string, unknown>;
}

export interface DuplicateDetectionResult {
  hasDuplicates: boolean;
  clusterId: string | null;
  matches: DuplicateMatch[];
  totalMatches: number;
}

interface DetectionInput {
  reportId: string;
  perpetratorName?: string | null;
  perpetratorPhone?: string | null;
  perpetratorEmail?: string | null;
  iban?: string | null;
  cryptoWallet?: string | null;
  cryptoType?: 'BTC' | 'ETH' | 'OTHER';
}

/**
 * Detect duplicates for a new report
 */
export async function detectDuplicates(
  input: DetectionInput,
  thresholdConfig: 'default' | 'strict' | 'relaxed' = 'default'
): Promise<DuplicateDetectionResult> {
  const thresholds = getThresholds(thresholdConfig);
  const matches: DuplicateMatch[] = [];

  // Normalize input fields
  const normalizedPhone = normalizePhone(input.perpetratorPhone);
  const normalizedEmail = normalizeEmail(input.perpetratorEmail);
  const normalizedIBAN = normalizeIBAN(input.iban);
  const normalizedCrypto = normalizeCryptoWallet(input.cryptoWallet, input.cryptoType || 'OTHER');

  // Get list of report IDs to exclude
  const excludeReportIds = [input.reportId];

  // Step 1: Exact matches on phone/email
  // Optimized: Include report status in query to avoid N+1 problem
  if (normalizedPhone || normalizedEmail) {
    const orConditions = [];
    if (normalizedPhone) {
      orConditions.push({ phoneNormalized: normalizedPhone });
    }
    if (normalizedEmail) {
      orConditions.push({ emailNormalized: normalizedEmail });
    }

    const perpetratorMatches = await prisma.perpetrator.findMany({
      where: {
        OR: orConditions,
        reportId: { notIn: excludeReportIds },
        // Filter by report status in query (eliminates N+1)
        // Note: Perpetrator has many-to-many relation 'reports', use 'some' filter
        reports: {
          some: { status: { in: ['PENDING', 'APPROVED'] } },
        },
      },
      select: {
        reportId: true,
        phoneNormalized: true,
        emailNormalized: true,
      },
      take: 50,
    });

    // Process matches - report status already filtered in query
    for (const perp of perpetratorMatches) {
      let matchType: DuplicateMatch['matchType'] = 'exact_phone';
      const matchDetails: Record<string, string> = {};

      if (normalizedPhone && perp.phoneNormalized === normalizedPhone) {
        matchType = 'exact_phone';
        matchDetails.phone = perp.phoneNormalized || '';
      } else if (normalizedEmail && perp.emailNormalized === normalizedEmail) {
        matchType = 'exact_email';
        matchDetails.email = perp.emailNormalized || '';
      }

      matches.push({
        reportId: perp.reportId,
        similarity: 1.0,
        matchType,
        matchDetails,
      });
    }
  }

  // Step 2: Exact match on IBAN
  // Optimized: Include report status in query to avoid N+1 problem
  if (normalizedIBAN) {
    const ibanMatches = await prisma.financialInfo.findMany({
      where: {
        ibanNormalized: normalizedIBAN,
        reportId: { notIn: excludeReportIds },
        report: {
          status: { in: ['PENDING', 'APPROVED'] },
        },
      },
      select: {
        reportId: true,
        ibanNormalized: true,
      },
      take: 50,
    });

    for (const fi of ibanMatches) {
      matches.push({
        reportId: fi.reportId,
        similarity: 1.0,
        matchType: 'exact_iban',
        matchDetails: { iban: fi.ibanNormalized || '' },
      });
    }
  }

  // Step 3: Exact match on crypto wallet
  // Optimized: Include report status in query to avoid N+1 problem
  if (normalizedCrypto) {
    const cryptoMatches = await prisma.cryptoInfo.findMany({
      where: {
        walletNormalized: normalizedCrypto,
        reportId: { notIn: excludeReportIds },
        report: {
          status: { in: ['PENDING', 'APPROVED'] },
        },
      },
      select: {
        reportId: true,
        walletNormalized: true,
      },
      take: 50,
    });

    for (const ci of cryptoMatches) {
      matches.push({
        reportId: ci.reportId,
        similarity: 1.0,
        matchType: 'exact_crypto',
        matchDetails: { wallet: ci.walletNormalized || '' },
      });
    }
  }

  // Step 4: Fuzzy name matching
  if (input.perpetratorName && input.perpetratorName.trim().length > 2) {
    const fuzzyMatches = await findFuzzyNameMatches({
      reportId: input.reportId,
      name: input.perpetratorName,
      thresholds,
      excludeReportIds,
    });
    matches.push(...fuzzyMatches);
  }

  // Deduplicate matches by reportId
  const uniqueMatches = deduplicateMatches(matches);

  // If we have matches, create a duplicate cluster
  if (uniqueMatches.length > 0) {
    const clusterId = await createDuplicateCluster(input.reportId, uniqueMatches);
    return {
      hasDuplicates: true,
      clusterId,
      matches: uniqueMatches,
      totalMatches: uniqueMatches.length,
    };
  }

  return {
    hasDuplicates: false,
    clusterId: null,
    matches: [],
    totalMatches: 0,
  };
}

/**
 * Find fuzzy name matches
 * Optimized: Include report status in query to avoid N+1 problem
 */
async function findFuzzyNameMatches(input: {
  reportId: string;
  name: string;
  thresholds: DuplicateThresholds;
  excludeReportIds: string[];
}): Promise<DuplicateMatch[]> {
  const matches: DuplicateMatch[] = [];
  const normalizedInputName = input.name.toLowerCase().trim();

  // Get perpetrators with names - filter by report status in single query
  const candidates = await prisma.perpetrator.findMany({
    where: {
      fullName: { not: null },
      reportId: { notIn: input.excludeReportIds },
      // Filter by report status in query (eliminates N+1)
      // Note: Perpetrator has many-to-many relation 'reports', use 'some' filter
      reports: {
        some: { status: { in: ['PENDING', 'APPROVED'] } },
      },
    },
    select: {
      fullName: true,
      reportId: true,
    },
    take: 100,
  });

  for (const candidate of candidates) {
    if (!candidate.fullName) continue;

    const matchResult = matchNames(
      normalizedInputName,
      candidate.fullName,
      input.thresholds
    );

    if (matchResult.isMatch && matchResult.confidence >= input.thresholds.overallConfidenceMin) {
      matches.push({
        reportId: candidate.reportId,
        similarity: matchResult.confidence,
        matchType: 'fuzzy_name',
        matchDetails: {
          inputName: input.name,
          matchedName: candidate.fullName,
          jaroWinkler: matchResult.methods.jaroWinkler.similarity,
          ngram: matchResult.methods.ngram.similarity,
          soundexMatch: matchResult.methods.soundex.match,
        },
      });
    }
  }

  return matches;
}

/**
 * Deduplicate matches by reportId
 */
function deduplicateMatches(matches: DuplicateMatch[]): DuplicateMatch[] {
  const byReportId = new Map<string, DuplicateMatch>();

  for (const match of matches) {
    const existing = byReportId.get(match.reportId);
    if (!existing || match.similarity > existing.similarity) {
      if (existing && match.similarity === existing.similarity) {
        byReportId.set(match.reportId, {
          ...match,
          matchType: 'combined',
          matchDetails: { ...existing.matchDetails, ...match.matchDetails },
        });
      } else {
        byReportId.set(match.reportId, match);
      }
    }
  }

  return Array.from(byReportId.values()).sort((a, b) => b.similarity - a.similarity);
}

/**
 * Create a duplicate cluster in the database
 */
async function createDuplicateCluster(
  newReportId: string,
  matches: DuplicateMatch[]
): Promise<string> {
  // Check if any matched reports are in existing cluster
  const existingClusterReport = await prisma.duplicateClusterReport.findFirst({
    where: {
      reportId: { in: matches.map((m) => m.reportId) },
      cluster: {
        status: 'PENDING',
      },
    },
    include: {
      cluster: true,
    },
  });

  const avgSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;

  if (existingClusterReport) {
    // Add to existing cluster
    await prisma.duplicateClusterReport.create({
      data: {
        clusterId: existingClusterReport.clusterId,
        reportId: newReportId,
        similarity: avgSimilarity,
        isPrimary: false,
      },
    });

    const newConfidence = Math.max(existingClusterReport.cluster.confidence, avgSimilarity);
    await prisma.duplicateCluster.update({
      where: { id: existingClusterReport.clusterId },
      data: { confidence: newConfidence },
    });

    return existingClusterReport.clusterId;
  }

  // Create new cluster
  const primaryMatchType = matches[0].matchType;
  const matchingCriteria = {
    matches: matches.map((m) => ({
      reportId: m.reportId,
      matchType: m.matchType,
      similarity: m.similarity,
    })),
  };

  const cluster = await prisma.duplicateCluster.create({
    data: {
      confidence: avgSimilarity,
      matchType: primaryMatchType,
      matchingCriteria: matchingCriteria,
      reports: {
        create: [
          {
            reportId: newReportId,
            similarity: avgSimilarity,
            isPrimary: false,
          },
          ...matches.map((m, index) => ({
            reportId: m.reportId,
            similarity: m.similarity,
            isPrimary: index === 0,
          })),
        ],
      },
    },
  });

  return cluster.id;
}

/**
 * Run duplicate detection for a report
 */
export async function runDuplicateDetection(reportId: string): Promise<DuplicateDetectionResult> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      perpetrators: {
        take: 1,
      },
      financialInfo: true,
      cryptoInfo: true,
    },
  });

  if (!report) {
    return {
      hasDuplicates: false,
      clusterId: null,
      matches: [],
      totalMatches: 0,
    };
  }

  const perpetrator = report.perpetrators[0];
  const financial = report.financialInfo;
  const crypto = report.cryptoInfo;

  return detectDuplicates({
    reportId,
    perpetratorName: perpetrator?.fullName,
    perpetratorPhone: perpetrator?.phone,
    perpetratorEmail: perpetrator?.email,
    iban: financial?.iban,
    cryptoWallet: crypto?.walletAddress,
    cryptoType: crypto?.blockchain as 'BTC' | 'ETH' | 'OTHER' | undefined,
  });
}

const duplicateDetector = {
  detectDuplicates,
  runDuplicateDetection,
};

export default duplicateDetector;
