/**
 * Main data masking module
 * Provides role-based data masking for fraud reports
 *
 * @module masking
 */

import {
  Role,
  MaskingConfig,
  MaskingOptions,
  FraudReport,
  MaskedReport,
  AuditLog,
  DataType,
} from './types';

import {
  maskName,
  maskNamePartial,
  maskEmail,
  maskEmailPartial,
  maskPhone,
  maskPhonePartial,
  maskIBAN,
  maskIP,
  maskIPv4,
  maskIPv6,
  maskWallet,
  maskSPZ,
  maskVIN,
  maskAddress,
  maskDate,
  maskAmount,
} from './functions';

import { MaskingMappingTable } from './utils/hash';

/**
 * Main masking class that applies role-based masking to fraud reports
 */
export class DataMasker {
  private config: MaskingConfig;
  private mappingTable: MaskingMappingTable;
  private auditLogs: AuditLog[];

  constructor(config: MaskingConfig) {
    this.config = config;
    this.mappingTable = new MaskingMappingTable();
    this.auditLogs = [];
  }

  /**
   * Apply masking to a fraud report based on user role
   *
   * @param report - Original fraud report
   * @param userRole - User's role level
   * @param userId - User ID for audit logging
   * @param ipAddress - User's IP address
   * @param userAgent - User's browser/client
   * @returns Masked report appropriate for user's role
   */
  public applyMasking(
    report: FraudReport,
    userRole: Role,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): MaskedReport {
    const options: MaskingOptions = {
      role: userRole,
      deterministicHash: this.config.enableDeterministicMasking,
      salt: this.config.salt,
      preserveFormat: true,
    };

    // Create masked report
    const maskedReport: MaskedReport = {
      // Always visible fields
      reportId: report.reportId,
      fraudType: report.fraudType,
      country: report.country,
      status: report.status,

      // Date masking
      submissionDate: this.maskField(
        'submissionDate',
        report.submissionDate,
        userRole,
        (val) => maskDate(val, options)
      ),

      // Reporter information - always masked except for admin
      reporterName: this.maskField(
        'reporterName',
        report.reporterName,
        userRole,
        (val) => this.getMaskingFunctionForField('reporterName', userRole)(val, options)
      ),

      reporterEmail: this.maskField(
        'reporterEmail',
        report.reporterEmail,
        userRole,
        (val) => this.getMaskingFunctionForField('reporterEmail', userRole)(val, options)
      ),

      reporterPhone: this.maskField(
        'reporterPhone',
        report.reporterPhone,
        userRole,
        (val) => this.getMaskingFunctionForField('reporterPhone', userRole)(val, options)
      ),

      reporterAddress: this.maskField(
        'reporterAddress',
        report.reporterAddress,
        userRole,
        (val) => maskAddress(val, options)
      ),

      reporterIp: this.maskField(
        'reporterIp',
        report.reporterIp,
        userRole,
        (val) => userRole >= Role.ADMIN ? val : maskIP(val, options)
      ),

      // Scammer information - visibility based on role
      scammerName: this.maskField(
        'scammerName',
        report.scammerName,
        userRole,
        (val) => this.getMaskingFunctionForField('scammerName', userRole)(val, options)
      ),

      scammerEmail: this.maskField(
        'scammerEmail',
        report.scammerEmail,
        userRole,
        (val) => this.getMaskingFunctionForField('scammerEmail', userRole)(val, options)
      ),

      scammerPhone: this.maskField(
        'scammerPhone',
        report.scammerPhone,
        userRole,
        (val) => this.getMaskingFunctionForField('scammerPhone', userRole)(val, options)
      ),

      scammerAddress: this.maskField(
        'scammerAddress',
        report.scammerAddress,
        userRole,
        (val) => maskAddress(val, options)
      ),

      scammerWallet: this.maskField(
        'scammerWallet',
        report.scammerWallet,
        userRole,
        (val) => userRole >= Role.GOLD ? val : maskWallet(val, options)
      ),

      scammerIp: this.maskField(
        'scammerIp',
        report.scammerIp,
        userRole,
        (val) => userRole >= Role.GOLD ? val : maskIP(val, options)
      ),

      scammerSpz: this.maskField(
        'scammerSpz',
        report.scammerSpz,
        userRole,
        (val) => userRole >= Role.GOLD ? val : maskSPZ(val, options)
      ),

      scammerVin: this.maskField(
        'scammerVin',
        report.scammerVin,
        userRole,
        (val) => userRole >= Role.GOLD ? val : maskVIN(val, options)
      ),

      // Financial data
      amountLost: this.maskField(
        'amountLost',
        report.amountLost,
        userRole,
        (val) => maskAmount(val, report.currency || 'USD', options)
      ),

      currency: report.currency,

      iban: this.maskField(
        'iban',
        report.iban,
        userRole,
        (val) => userRole >= Role.GOLD ? val : maskIBAN(val, options)
      ),

      transactionId: this.maskField(
        'transactionId',
        report.transactionId,
        userRole,
        (val) => userRole >= Role.GOLD ? val : this.maskTransactionId(val, options)
      ),

      // Evidence - metadata only for lower roles
      description: this.maskField(
        'description',
        report.description,
        userRole,
        (val) => userRole >= Role.STANDARD ? val : this.summarizeText(val, 200)
      ),

      attachments: this.maskField(
        'attachments',
        report.attachments,
        userRole,
        (val) => userRole >= Role.GOLD ? val : this.maskAttachments(val, userRole)
      ),

      screenshots: this.maskField(
        'screenshots',
        report.screenshots,
        userRole,
        (val) => userRole >= Role.GOLD ? val : this.maskAttachments(val, userRole)
      ),

      chatLogs: this.maskField(
        'chatLogs',
        report.chatLogs,
        userRole,
        (val) => userRole >= Role.GOLD ? val : this.summarizeText(val, 500)
      ),
    };

    // Log data access
    if (this.config.enableAuditLogging && userId) {
      this.logAccess({
        timestamp: new Date(),
        userId,
        userRole,
        reportId: report.reportId,
        fieldsAccessed: Object.keys(maskedReport),
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        action: 'view',
      });
    }

    return maskedReport;
  }

  /**
   * Get appropriate masking function for a field based on user role
   */
  private getMaskingFunctionForField(
    fieldName: string,
    userRole: Role
  ): (val: string, options: MaskingOptions) => string {
    const fieldConfig = this.config.fields[fieldName];

    // Admin sees everything
    if (userRole >= Role.ADMIN) {
      return (val) => val;
    }

    // Check if field config exists
    if (!fieldConfig) {
      // Default masking based on field name
      if (fieldName.includes('Name')) return maskName;
      if (fieldName.includes('Email')) return maskEmail;
      if (fieldName.includes('Phone')) return maskPhone;
      return (val) => val;
    }

    // Check role overrides
    const roleConfig = this.config.roles[userRole];
    const override = roleConfig?.fieldOverrides?.[fieldName];

    if (override && override.visible === true) {
      // Use partial masking for Gold users
      if (userRole >= Role.GOLD) {
        if (fieldName.includes('Name')) return maskNamePartial;
        if (fieldName.includes('Email')) return maskEmailPartial;
        if (fieldName.includes('Phone')) return maskPhonePartial;
      }
    }

    // Default masking based on data type
    switch (fieldConfig.dataType) {
      case DataType.NAME:
        return userRole >= Role.GOLD ? maskNamePartial : maskName;
      case DataType.EMAIL:
        return userRole >= Role.GOLD ? maskEmailPartial : maskEmail;
      case DataType.PHONE:
        return userRole >= Role.GOLD ? maskPhonePartial : maskPhone;
      case DataType.IBAN:
        return maskIBAN;
      case DataType.IP:
        return maskIP;
      case DataType.WALLET:
        return maskWallet;
      case DataType.SPZ:
        return maskSPZ;
      case DataType.VIN:
        return maskVIN;
      default:
        return maskName;
    }
  }

  /**
   * Apply masking to a single field with null/undefined handling
   */
  private maskField<T>(
    fieldName: string,
    value: T | undefined | null,
    userRole: Role,
    maskingFn: (val: T) => any
  ): any {
    if (value === undefined || value === null) {
      return undefined;
    }

    // Check if user has permission to see this field
    const fieldConfig = this.config.fields[fieldName];
    if (fieldConfig && userRole >= fieldConfig.minRoleLevel) {
      return value; // Show unmasked
    }

    try {
      return maskingFn(value);
    } catch (error) {
      console.error(`Error masking field ${fieldName}:`, error);
      return undefined;
    }
  }

  /**
   * Mask transaction ID - similar to IBAN masking
   */
  private maskTransactionId(txId: string, options: MaskingOptions): string {
    if (!txId) return '';
    if (txId.length < 8) return '****';

    const first = txId.substring(0, 4);
    const last = txId.slice(-4);
    return `${first}****${last}`;
  }

  /**
   * Summarize long text for lower privilege users
   */
  private summarizeText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '... [truncated]';
  }

  /**
   * Mask attachment information - show count only for basic users
   */
  private maskAttachments(
    attachments: string[] | undefined,
    userRole: Role
  ): any {
    if (!attachments) return undefined;

    if (userRole === Role.BASIC) {
      return { count: attachments.length };
    }

    if (userRole === Role.STANDARD) {
      return {
        count: attachments.length,
        preview: attachments.slice(0, 2).map((a) => ({
          name: 'attachment_masked.dat',
          size: 'hidden',
        })),
      };
    }

    return attachments;
  }

  /**
   * Batch mask multiple reports
   */
  public applyMaskingBatch(
    reports: FraudReport[],
    userRole: Role,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): MaskedReport[] {
    return reports.map((report) =>
      this.applyMasking(report, userRole, userId, ipAddress, userAgent)
    );
  }

  /**
   * Log data access for audit purposes
   */
  private logAccess(log: AuditLog): void {
    this.auditLogs.push(log);

    // In production, this would write to a database or logging service
    if (this.config.debugMode) {
      console.log('[AUDIT]', JSON.stringify(log));
    }
  }

  /**
   * Get audit logs
   */
  public getAuditLogs(
    filters?: Partial<AuditLog>
  ): AuditLog[] {
    if (!filters) return this.auditLogs;

    return this.auditLogs.filter((log) => {
      return Object.entries(filters).every(
        ([key, value]) => log[key as keyof AuditLog] === value
      );
    });
  }

  /**
   * Clear audit logs (use with caution)
   */
  public clearAuditLogs(): void {
    this.auditLogs = [];
  }

  /**
   * Get masking statistics
   */
  public getStats(): {
    totalReportsProcessed: number;
    mappingTableStats: any;
    auditLogCount: number;
  } {
    return {
      totalReportsProcessed: this.auditLogs.length,
      mappingTableStats: this.mappingTable.stats(),
      auditLogCount: this.auditLogs.length,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MaskingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test masking for a specific field and role
   */
  public testMasking(
    value: string,
    dataType: DataType,
    role: Role
  ): string {
    const options: MaskingOptions = {
      role,
      deterministicHash: this.config.enableDeterministicMasking,
      salt: this.config.salt,
    };

    switch (dataType) {
      case DataType.NAME:
        return role >= Role.GOLD ? maskNamePartial(value, options) : maskName(value, options);
      case DataType.EMAIL:
        return role >= Role.GOLD ? maskEmailPartial(value, options) : maskEmail(value, options);
      case DataType.PHONE:
        return role >= Role.GOLD ? maskPhonePartial(value, options) : maskPhone(value, options);
      case DataType.IBAN:
        return maskIBAN(value, options);
      case DataType.IP:
        return maskIP(value, options);
      case DataType.WALLET:
        return maskWallet(value, options);
      case DataType.SPZ:
        return maskSPZ(value, options);
      case DataType.VIN:
        return maskVIN(value, options);
      default:
        return value;
    }
  }
}

/**
 * Factory function to create a DataMasker instance
 */
export function createDataMasker(config: MaskingConfig): DataMasker {
  return new DataMasker(config);
}

// Export all types and functions
export * from './types';
export * from './functions';
export * from './utils/hash';
