/**
 * Type definitions for the data masking module
 * @module types
 */

export enum Role {
  BASIC = 0,
  STANDARD = 1,
  GOLD = 2,
  ADMIN = 3,
}

export enum DataType {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  IBAN = 'iban',
  IP = 'ip',
  WALLET = 'wallet',
  SPZ = 'spz',
  VIN = 'vin',
  ADDRESS = 'address',
  DATE = 'date',
  AMOUNT = 'amount',
}

export enum MaskingStrategy {
  NAME_STANDARD = 'name_standard',
  NAME_PARTIAL = 'name_partial',
  EMAIL_STANDARD = 'email_standard',
  EMAIL_PARTIAL = 'email_partial',
  PHONE_STANDARD = 'phone_standard',
  PHONE_PARTIAL = 'phone_partial',
  IBAN_STANDARD = 'iban_standard',
  IP_V4 = 'ip_v4',
  IP_V6 = 'ip_v6',
  WALLET_STANDARD = 'wallet_standard',
  SPZ_STANDARD = 'spz_standard',
  VIN_STANDARD = 'vin_standard',
  ADDRESS_TIERED = 'address_tiered',
  DATE_TIERED = 'date_tiered',
  AMOUNT_TIERED = 'amount_tiered',
  CUSTOM = 'custom',
  NONE = 'none',
}

export interface MaskingConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  salt: string;
  enableDeterministicMasking: boolean;
  enableAuditLogging: boolean;
  debugMode: boolean;
  roles: {
    [key in Role]: RoleConfig;
  };
  fields: {
    [fieldName: string]: FieldConfig;
  };
  customRules: CustomRule[];
}

export interface RoleConfig {
  level: number;
  permissions: string[];
  fieldOverrides: {
    [fieldName: string]: {
      maskingStrategy?: MaskingStrategy;
      visible?: boolean;
    };
  };
}

export interface FieldConfig {
  dataType: DataType;
  maskingStrategy: MaskingStrategy;
  customMaskingFn?: string;
  minRoleLevel: Role;
  deterministicHash: boolean;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  maskingFunction: string;
  priority: number;
}

export interface MaskingOptions {
  role: Role;
  deterministicHash?: boolean;
  salt?: string;
  preserveFormat?: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface MaskedValue<T = any> {
  original: T;
  masked: T;
  strategy: MaskingStrategy;
  hash?: string;
}

export interface AuditLog {
  timestamp: Date;
  userId: string;
  userRole: Role;
  reportId: string;
  fieldsAccessed: string[];
  ipAddress: string;
  userAgent: string;
  action: 'view' | 'export' | 'edit';
}

export interface FraudReport {
  // Report Metadata
  reportId: string;
  fraudType: string;
  country: string;
  submissionDate: Date;
  status: string;

  // Reporter Information
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  reporterAddress?: Address;
  reporterIp?: string;

  // Scammer Information
  scammerName?: string;
  scammerEmail?: string;
  scammerPhone?: string;
  scammerAddress?: Address;
  scammerWallet?: string;
  scammerIp?: string;
  scammerSpz?: string;
  scammerVin?: string;

  // Financial Data
  amountLost?: number;
  currency?: string;
  iban?: string;
  transactionId?: string;

  // Evidence
  description?: string;
  attachments?: string[];
  screenshots?: string[];
  chatLogs?: string;
}

export interface MaskedReport extends Omit<FraudReport, keyof FraudReport> {
  [key: string]: any;
}

export type MaskingFunction = (
  value: string,
  options: MaskingOptions
) => string;

export type CustomMaskingFunction = (
  value: string,
  config: FieldConfig,
  options: MaskingOptions
) => string;
