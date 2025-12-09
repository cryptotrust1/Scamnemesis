/**
 * Default masking configuration
 * @module config/masking-config
 */

import { MaskingConfig, Role, DataType, MaskingStrategy } from '../types';
import { generateSalt, validateSalt } from '../utils/hash';

/**
 * Default production configuration
 */
export const DEFAULT_MASKING_CONFIG: MaskingConfig = {
  version: '1.0.0',
  environment: 'production',
  salt: 'a7f8d9e6c4b2a1f3e5d7c9b8a6f4e2d1c3b5a7f9e8d6c4b2a0f1e3d5c7b9a8f6', // Default - MUST be changed in production
  enableDeterministicMasking: true,
  enableAuditLogging: true,
  debugMode: false,

  roles: {
    [Role.BASIC]: {
      level: 0,
      permissions: ['view_public_reports', 'submit_reports'],
      fieldOverrides: {},
    },
    [Role.STANDARD]: {
      level: 1,
      permissions: [
        'view_detailed_reports',
        'export_limited',
        'submit_reports',
      ],
      fieldOverrides: {
        scammerName: {
          maskingStrategy: MaskingStrategy.NAME_PARTIAL,
          visible: true,
        },
      },
    },
    [Role.GOLD]: {
      level: 2,
      permissions: ['view_all_reports', 'export_full', 'api_access'],
      fieldOverrides: {
        scammerName: {
          maskingStrategy: MaskingStrategy.NAME_PARTIAL,
          visible: true,
        },
        scammerEmail: {
          maskingStrategy: MaskingStrategy.EMAIL_PARTIAL,
          visible: true,
        },
        scammerPhone: {
          maskingStrategy: MaskingStrategy.PHONE_PARTIAL,
          visible: true,
        },
      },
    },
    [Role.ADMIN]: {
      level: 3,
      permissions: ['all'],
      fieldOverrides: {},
    },
  },

  fields: {
    // Reporter Information Fields
    reporterName: {
      dataType: DataType.NAME,
      maskingStrategy: MaskingStrategy.NAME_STANDARD,
      minRoleLevel: Role.ADMIN,
      deterministicHash: true,
    },
    reporterEmail: {
      dataType: DataType.EMAIL,
      maskingStrategy: MaskingStrategy.EMAIL_STANDARD,
      minRoleLevel: Role.ADMIN,
      deterministicHash: true,
    },
    reporterPhone: {
      dataType: DataType.PHONE,
      maskingStrategy: MaskingStrategy.PHONE_STANDARD,
      minRoleLevel: Role.ADMIN,
      deterministicHash: true,
    },
    reporterIp: {
      dataType: DataType.IP,
      maskingStrategy: MaskingStrategy.IP_V4,
      minRoleLevel: Role.ADMIN,
      deterministicHash: true,
    },
    reporterAddress: {
      dataType: DataType.ADDRESS,
      maskingStrategy: MaskingStrategy.ADDRESS_TIERED,
      minRoleLevel: Role.GOLD,
      deterministicHash: false,
    },

    // Scammer Information Fields
    scammerName: {
      dataType: DataType.NAME,
      maskingStrategy: MaskingStrategy.NAME_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },
    scammerEmail: {
      dataType: DataType.EMAIL,
      maskingStrategy: MaskingStrategy.EMAIL_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },
    scammerPhone: {
      dataType: DataType.PHONE,
      maskingStrategy: MaskingStrategy.PHONE_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },
    scammerIp: {
      dataType: DataType.IP,
      maskingStrategy: MaskingStrategy.IP_V4,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },
    scammerAddress: {
      dataType: DataType.ADDRESS,
      maskingStrategy: MaskingStrategy.ADDRESS_TIERED,
      minRoleLevel: Role.GOLD,
      deterministicHash: false,
    },
    scammerWallet: {
      dataType: DataType.WALLET,
      maskingStrategy: MaskingStrategy.WALLET_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: false,
    },
    scammerSpz: {
      dataType: DataType.SPZ,
      maskingStrategy: MaskingStrategy.SPZ_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },
    scammerVin: {
      dataType: DataType.VIN,
      maskingStrategy: MaskingStrategy.VIN_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },

    // Financial Data Fields
    iban: {
      dataType: DataType.IBAN,
      maskingStrategy: MaskingStrategy.IBAN_STANDARD,
      minRoleLevel: Role.GOLD,
      deterministicHash: true,
    },
    amountLost: {
      dataType: DataType.AMOUNT,
      maskingStrategy: MaskingStrategy.AMOUNT_TIERED,
      minRoleLevel: Role.GOLD,
      deterministicHash: false,
    },
    submissionDate: {
      dataType: DataType.DATE,
      maskingStrategy: MaskingStrategy.DATE_TIERED,
      minRoleLevel: Role.STANDARD,
      deterministicHash: false,
    },
  },

  customRules: [],
};

/**
 * Development configuration with less strict masking
 */
export const DEVELOPMENT_MASKING_CONFIG: MaskingConfig = {
  ...DEFAULT_MASKING_CONFIG,
  environment: 'development',
  debugMode: true,
  enableAuditLogging: false,
  salt: generateSalt(),
};

/**
 * Configuration loader with validation
 */
export class MaskingConfigLoader {
  private config: MaskingConfig;

  constructor(config?: Partial<MaskingConfig>) {
    this.config = this.mergeWithDefaults(config);
    this.validate();
  }

  /**
   * Merge provided config with defaults
   */
  private mergeWithDefaults(
    config?: Partial<MaskingConfig>
  ): MaskingConfig {
    if (!config) {
      return DEFAULT_MASKING_CONFIG;
    }

    return {
      ...DEFAULT_MASKING_CONFIG,
      ...config,
      roles: {
        ...DEFAULT_MASKING_CONFIG.roles,
        ...config.roles,
      },
      fields: {
        ...DEFAULT_MASKING_CONFIG.fields,
        ...config.fields,
      },
    };
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    // Validate salt
    const saltValidation = validateSalt(this.config.salt);
    if (!saltValidation.valid) {
      console.warn('Salt validation warnings:', saltValidation.errors);

      if (this.config.environment === 'production') {
        throw new Error(
          `Invalid salt for production environment: ${saltValidation.errors.join(', ')}`
        );
      }
    }

    // Validate role levels
    Object.entries(this.config.roles).forEach(([roleName, roleConfig]) => {
      if (roleConfig.level < 0 || roleConfig.level > 3) {
        throw new Error(
          `Invalid role level for ${roleName}: ${roleConfig.level}`
        );
      }
    });

    // Validate field configurations
    Object.entries(this.config.fields).forEach(([fieldName, fieldConfig]) => {
      if (!Object.values(DataType).includes(fieldConfig.dataType)) {
        throw new Error(
          `Invalid data type for field ${fieldName}: ${fieldConfig.dataType}`
        );
      }

      if (!Object.values(MaskingStrategy).includes(fieldConfig.maskingStrategy)) {
        throw new Error(
          `Invalid masking strategy for field ${fieldName}: ${fieldConfig.maskingStrategy}`
        );
      }

      if (fieldConfig.minRoleLevel < 0 || fieldConfig.minRoleLevel > 3) {
        throw new Error(
          `Invalid min role level for field ${fieldName}: ${fieldConfig.minRoleLevel}`
        );
      }
    });
  }

  /**
   * Get validated configuration
   */
  public getConfig(): MaskingConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<MaskingConfig>): void {
    this.config = this.mergeWithDefaults({
      ...this.config,
      ...updates,
    });
    this.validate();
  }

  /**
   * Load configuration from JSON file
   */
  public static async loadFromFile(filePath: string): Promise<MaskingConfigLoader> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      const config = JSON.parse(content) as Partial<MaskingConfig>;
      return new MaskingConfigLoader(config);
    } catch (error) {
      console.error('Error loading config from file:', error);
      throw new Error(`Failed to load masking config from ${filePath}`);
    }
  }

  /**
   * Save configuration to JSON file
   */
  public async saveToFile(filePath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const content = JSON.stringify(this.config, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      console.error('Error saving config to file:', error);
      throw new Error(`Failed to save masking config to ${filePath}`);
    }
  }

  /**
   * Export configuration as JSON
   */
  public toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Create a new configuration from environment variables
   */
  public static fromEnvironment(): MaskingConfigLoader {
    const config: Partial<MaskingConfig> = {
      environment: (process.env.NODE_ENV as any) || 'development',
      salt: process.env.MASKING_SALT || generateSalt(),
      enableDeterministicMasking:
        process.env.ENABLE_DETERMINISTIC_MASKING !== 'false',
      enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
      debugMode: process.env.DEBUG_MODE === 'true',
    };

    return new MaskingConfigLoader(config);
  }
}

/**
 * Helper function to get config based on environment
 */
export function getConfigForEnvironment(
  env: 'development' | 'staging' | 'production'
): MaskingConfig {
  switch (env) {
    case 'development':
      return DEVELOPMENT_MASKING_CONFIG;
    case 'staging':
      return {
        ...DEFAULT_MASKING_CONFIG,
        environment: 'staging',
        debugMode: true,
      };
    case 'production':
      return DEFAULT_MASKING_CONFIG;
    default:
      return DEFAULT_MASKING_CONFIG;
  }
}
