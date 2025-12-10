/**
 * Masking Service
 * Integrates the masking module with API routes and Prisma models
 */

import { createDataMasker, DataMasker, Role } from '@/masking';
import { DEFAULT_MASKING_CONFIG } from '@/masking/config/masking-config';

// User role to masking role mapping
const USER_ROLE_MAP: Record<string, Role> = {
  'BASIC': Role.BASIC,
  'STANDARD': Role.STANDARD,
  'GOLD': Role.GOLD,
  'ADMIN': Role.ADMIN,
  'SUPER_ADMIN': Role.ADMIN,
};

// Singleton instance of the data masker
let maskerInstance: DataMasker | null = null;

/**
 * Get or create the masker instance
 */
export function getMasker(): DataMasker {
  if (!maskerInstance) {
    const config = {
      ...DEFAULT_MASKING_CONFIG,
      salt: process.env.MASKING_SALT || DEFAULT_MASKING_CONFIG.salt,
      enableDeterministicMasking: process.env.ENABLE_DETERMINISTIC_MASKING === 'true',
      enableAuditLogging: process.env.NODE_ENV === 'production',
      debugMode: process.env.NODE_ENV === 'development',
    };
    maskerInstance = createDataMasker(config);
  }
  return maskerInstance;
}

/**
 * Convert user role string to Role enum
 */
export function toMaskingRole(roleString: string): Role {
  return USER_ROLE_MAP[roleString] || Role.BASIC;
}

/**
 * Mask a single field value based on field type and user role
 */
export function maskField(
  value: string | null | undefined,
  fieldType: 'email' | 'phone' | 'iban' | 'name' | 'wallet' | 'ip' | 'spz' | 'vin',
  userRole: string
): string | null {
  if (!value) return null;

  const role = toMaskingRole(userRole);

  // Admin and Super Admin see everything unmasked
  if (role === Role.ADMIN) {
    return value;
  }

  const masker = getMasker();
  const { DataType } = require('@/masking/types');

  const typeMap: Record<string, any> = {
    'email': DataType.EMAIL,
    'phone': DataType.PHONE,
    'iban': DataType.IBAN,
    'name': DataType.NAME,
    'wallet': DataType.WALLET,
    'ip': DataType.IP,
    'spz': DataType.SPZ,
    'vin': DataType.VIN,
  };

  try {
    return masker.testMasking(value, typeMap[fieldType], role);
  } catch (error) {
    console.error(`Error masking ${fieldType}:`, error);
    return '***';
  }
}

/**
 * Interface for report data from Prisma
 */
interface PrismaReport {
  id: string;
  publicId: string;
  status: string;
  severity?: string | null;
  fraudType: string;
  summary: string;
  description?: string | null;
  incidentDate?: Date | null;
  financialLossAmount?: any;
  financialLossCurrency?: string;
  location?: any;
  locationCountry?: string | null;
  locationCity?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  perpetrators?: PerpData[];
  digitalFootprint?: DigitalData | null;
  financialInfo?: FinancialData | null;
  cryptoInfo?: CryptoData | null;
  evidence?: EvidenceData[];
  comments?: CommentData[];
}

interface PerpData {
  id: string;
  fullName?: string | null;
  nickname?: string | null;
  username?: string | null;
  nationality?: string | null;
  approxAge?: number | null;
  physicalDescription?: string | null;
  email?: string | null;
  phone?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
}

interface DigitalData {
  telegram?: string | null;
  whatsapp?: string | null;
  signal?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  websiteUrl?: string | null;
  domainName?: string | null;
  ipCountry?: string | null;
}

interface FinancialData {
  iban?: string | null;
  accountHolder?: string | null;
  bankName?: string | null;
  bankCountry?: string | null;
}

interface CryptoData {
  walletAddress?: string | null;
  blockchain?: string | null;
  exchangeWalletName?: string | null;
}

interface EvidenceData {
  id: string;
  type: string;
  thumbnailUrl?: string | null;
  description?: string | null;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: Date;
  user?: { displayName?: string | null } | null;
}

/**
 * Apply masking to a Prisma report based on user role
 */
export function maskReport(report: PrismaReport, userRole: string): any {
  const role = toMaskingRole(userRole);
  const perpetrator = report.perpetrators?.[0];

  return {
    id: report.id,
    public_id: report.publicId,
    status: report.status.toLowerCase(),
    fraud_type: report.fraudType?.toLowerCase(),
    severity: report.severity?.toLowerCase(),
    summary: report.summary,
    description: role >= Role.STANDARD ? report.description : truncateText(report.description, 200),
    incident_date: report.incidentDate?.toISOString(),
    location: report.location || {
      country: report.locationCountry,
      city: report.locationCity,
    },
    financial_loss: report.financialLossAmount ? {
      amount: role >= Role.GOLD
        ? Number(report.financialLossAmount)
        : roundToRange(Number(report.financialLossAmount)),
      currency: report.financialLossCurrency,
    } : null,

    // Perpetrator data with masking
    perpetrator: perpetrator ? {
      full_name: maskField(perpetrator.fullName, 'name', userRole),
      nickname: perpetrator.nickname,
      username: perpetrator.username,
      nationality: perpetrator.nationality,
      approx_age: perpetrator.approxAge,
      physical_description: role >= Role.STANDARD ? perpetrator.physicalDescription : null,
      email: maskField(perpetrator.email, 'email', userRole),
      phone: maskField(perpetrator.phone, 'phone', userRole),
      address: {
        city: role >= Role.STANDARD ? perpetrator.addressCity : null,
        country: perpetrator.addressCountry,
      },
    } : null,

    // Digital footprint
    digital_footprint: report.digitalFootprint ? {
      telegram: role >= Role.GOLD ? report.digitalFootprint.telegram : maskUsername(report.digitalFootprint.telegram),
      whatsapp: role >= Role.GOLD ? report.digitalFootprint.whatsapp : maskUsername(report.digitalFootprint.whatsapp),
      signal: role >= Role.GOLD ? report.digitalFootprint.signal : maskUsername(report.digitalFootprint.signal),
      instagram: report.digitalFootprint.instagram,
      facebook: report.digitalFootprint.facebook,
      tiktok: report.digitalFootprint.tiktok,
      twitter: report.digitalFootprint.twitter,
      website_url: role >= Role.GOLD ? report.digitalFootprint.websiteUrl : maskDomain(report.digitalFootprint.websiteUrl),
      domain_name: role >= Role.GOLD ? report.digitalFootprint.domainName : maskDomain(report.digitalFootprint.domainName),
      ip_country: report.digitalFootprint.ipCountry,
    } : null,

    // Financial info with masking
    financial: report.financialInfo ? {
      iban: maskField(report.financialInfo.iban, 'iban', userRole),
      account_holder: maskField(report.financialInfo.accountHolder, 'name', userRole),
      bank_name: report.financialInfo.bankName,
      bank_country: report.financialInfo.bankCountry,
    } : null,

    // Crypto info with masking
    crypto: report.cryptoInfo ? {
      wallet_address: maskField(report.cryptoInfo.walletAddress, 'wallet', userRole),
      blockchain: report.cryptoInfo.blockchain?.toLowerCase(),
      exchange: report.cryptoInfo.exchangeWalletName,
    } : null,

    // Evidence
    evidence: report.evidence?.map(e => ({
      id: e.id,
      type: e.type.toLowerCase(),
      thumbnail_url: role >= Role.STANDARD ? e.thumbnailUrl : null,
      description: e.description,
    })) || [],

    // Comments
    comments: report.comments?.map(c => ({
      id: c.id,
      content: c.content,
      author: c.user?.displayName || 'Anonymous',
      created_at: c.createdAt.toISOString(),
    })) || [],

    // Metadata
    published_at: report.publishedAt?.toISOString(),
    created_at: report.createdAt.toISOString(),
    comment_count: report.comments?.length || 0,
  };
}

/**
 * Apply masking to multiple reports
 */
export function maskReports(reports: PrismaReport[], userRole: string): any[] {
  return reports.map(report => maskReport(report, userRole));
}

// Helper functions

function truncateText(text: string | null | undefined, maxLength: number): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function roundToRange(amount: number): string {
  if (amount < 100) return '<100';
  if (amount < 500) return '100-500';
  if (amount < 1000) return '500-1000';
  if (amount < 5000) return '1000-5000';
  if (amount < 10000) return '5000-10000';
  if (amount < 50000) return '10000-50000';
  return '>50000';
}

function maskUsername(username: string | null | undefined): string | null {
  if (!username) return null;
  if (username.length <= 3) return '***';
  return username[0] + '***' + username.slice(-1);
}

function maskDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const parts = parsed.hostname.split('.');
    if (parts.length >= 2) {
      return `***.${parts.slice(-2).join('.')}`;
    }
    return '***';
  } catch {
    return '***';
  }
}

export { Role };
