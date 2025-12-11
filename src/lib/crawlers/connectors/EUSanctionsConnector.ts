/**
 * EU Sanctions Connector
 * Fetches data from EU Consolidated Financial Sanctions List
 *
 * Source:
 * - EU FSD XML: https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content
 */

import { XMLParser } from 'fast-xml-parser';
import { BaseConnector, RateLimitError } from './BaseConnector';
import { ConnectorConfig, SanctionEntry } from '../queue';

interface EUSanctionEntity {
  '@_logicalId': string;
  '@_euReferenceNumber'?: string;
  '@_designationDate'?: string;
  '@_designationDetails'?: string;
  '@_unitedNationId'?: string;
  subjectType?: {
    '@_code': string;
    '@_classificationCode': string;
  };
  regulation?: EURegulation | EURegulation[];
  nameAlias?: EUNameAlias | EUNameAlias[];
  address?: EUAddress | EUAddress[];
  birthdate?: EUBirthdate | EUBirthdate[];
  citizenship?: EUCitizenship | EUCitizenship[];
  identification?: EUIdentification | EUIdentification[];
  remark?: string | { '#text': string };
}

interface EURegulation {
  '@_regulationType': string;
  '@_publicationDate': string;
  '@_entryIntoForceDate'?: string;
  '@_numberTitle': string;
  '@_publicationUrl'?: string;
  '@_programme': string;
}

interface EUNameAlias {
  '@_wholeName'?: string;
  '@_firstName'?: string;
  '@_middleName'?: string;
  '@_lastName'?: string;
  '@_nameLanguage'?: string;
  '@_function'?: string;
  '@_gender'?: string;
  '@_title'?: string;
  '@_regulationLanguage'?: string;
  '@_strong'?: string;
}

interface EUAddress {
  '@_street'?: string;
  '@_poBox'?: string;
  '@_city'?: string;
  '@_zipCode'?: string;
  '@_region'?: string;
  '@_countryIso2Code'?: string;
  '@_countryDescription'?: string;
  '@_contactInfo'?: string;
}

interface EUBirthdate {
  '@_birthdate'?: string;
  '@_year'?: string;
  '@_monthOfYear'?: string;
  '@_dayOfMonth'?: string;
  '@_circa'?: string;
  '@_city'?: string;
  '@_zipCode'?: string;
  '@_region'?: string;
  '@_countryIso2Code'?: string;
  '@_countryDescription'?: string;
}

interface EUCitizenship {
  '@_countryIso2Code'?: string;
  '@_countryDescription'?: string;
  '@_region'?: string;
}

interface EUIdentification {
  '@_identificationTypeCode'?: string;
  '@_identificationTypeDescription'?: string;
  '@_number'?: string;
  '@_countryIso2Code'?: string;
  '@_countryDescription'?: string;
  '@_issuedBy'?: string;
  '@_issueDate'?: string;
  '@_validFrom'?: string;
  '@_validTo'?: string;
  '@_diplomatic'?: string;
  '@_knownExpired'?: string;
  '@_knownFalse'?: string;
  '@_remark'?: string;
}

export class EUSanctionsConnector extends BaseConnector {
  private parser: XMLParser;

  constructor(config: ConnectorConfig) {
    super(config);
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (tagName) => {
        const arrayTags = ['sanctionEntity', 'regulation', 'nameAlias', 'address', 'birthdate', 'citizenship', 'identification'];
        return arrayTags.includes(tagName);
      },
    });
  }

  /**
   * Fetch EU Sanctions list
   */
  async fetch(): Promise<SanctionEntry[]> {
    if (!(await this.checkRateLimit())) {
      throw new RateLimitError(this.config.id);
    }

    this.log('info', 'Fetching EU Sanctions list');

    try {
      const response = await this.fetchWithRetry(this.config.url);
      const xml = await response.text();

      this.log('info', 'Downloaded EU Sanctions XML', { size: xml.length });

      const data = this.parser.parse(xml);
      const entries: SanctionEntry[] = [];

      // EU sanctions structure: export > sanctionEntity[]
      const sanctionEntities = data.export?.sanctionEntity || [];

      for (const entity of sanctionEntities) {
        try {
          const sanctionEntry = this.parseEntity(entity);
          if (sanctionEntry) {
            entries.push(sanctionEntry);
          }
        } catch (error) {
          this.log('warn', 'Failed to parse EU Sanctions entry', {
            logicalId: entity['@_logicalId'],
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      this.log('info', 'EU Sanctions fetch completed', { totalEntries: entries.length });

      return entries;
    } catch (error) {
      this.log('error', 'EU Sanctions fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Parse single EU sanction entity
   */
  private parseEntity(entity: EUSanctionEntity): SanctionEntry | null {
    const logicalId = entity['@_logicalId'];
    const euReferenceNumber = entity['@_euReferenceNumber'];

    // Determine entity type
    const subjectTypeCode = entity.subjectType?.['@_code'];
    const type: 'Individual' | 'Entity' = subjectTypeCode === 'person' ? 'Individual' : 'Entity';

    // Parse names
    const { names, aliases } = this.parseNames(entity.nameAlias);

    if (names.length === 0) {
      return null;
    }

    // Parse addresses
    const addresses = this.parseAddresses(entity.address);

    // Parse identifications
    const identifications = this.parseIdentifications(entity.identification);

    // Parse citizenships/nationalities
    const nationalities = this.parseCitizenships(entity.citizenship);

    // Parse date of birth
    const dateOfBirth = this.parseBirthdate(entity.birthdate);

    // Parse programs from regulations
    const programs = this.parsePrograms(entity.regulation);

    // Parse remarks
    const remarks = typeof entity.remark === 'string'
      ? entity.remark
      : entity.remark?.['#text'];

    return {
      sourceId: this.config.id,
      externalId: logicalId,
      type,
      names,
      aliases,
      dateOfBirth,
      nationalities,
      addresses,
      identifications,
      programs,
      remarks,
      lastUpdated: new Date(),
      rawData: {
        euReferenceNumber,
        designationDate: entity['@_designationDate'],
        unitedNationId: entity['@_unitedNationId'],
      },
    };
  }

  /**
   * Parse names and aliases
   */
  private parseNames(nameAliasList: EUNameAlias | EUNameAlias[] | undefined): { names: string[]; aliases: string[] } {
    if (!nameAliasList) return { names: [], aliases: [] };

    const nameAliases = Array.isArray(nameAliasList) ? nameAliasList : [nameAliasList];
    const names: string[] = [];
    const aliases: string[] = [];

    for (const alias of nameAliases) {
      let fullName = '';

      if (alias['@_wholeName']) {
        fullName = alias['@_wholeName'];
      } else {
        fullName = [alias['@_firstName'], alias['@_middleName'], alias['@_lastName']]
          .filter(Boolean)
          .join(' ')
          .trim();
      }

      if (fullName) {
        // Strong names are primary, weak names are aliases
        if (alias['@_strong'] === 'true' || alias['@_strong'] === undefined) {
          if (!names.includes(fullName)) {
            names.push(fullName);
          }
        } else {
          if (!aliases.includes(fullName)) {
            aliases.push(fullName);
          }
        }
      }
    }

    return { names, aliases };
  }

  /**
   * Parse addresses
   */
  private parseAddresses(addressList: EUAddress | EUAddress[] | undefined): SanctionEntry['addresses'] {
    if (!addressList) return [];

    const addresses = Array.isArray(addressList) ? addressList : [addressList];

    return addresses.map((addr) => ({
      street: [addr['@_street'], addr['@_poBox']].filter(Boolean).join(', '),
      city: addr['@_city'],
      country: addr['@_countryDescription'] || addr['@_countryIso2Code'],
      postalCode: addr['@_zipCode'],
    }));
  }

  /**
   * Parse identifications
   */
  private parseIdentifications(idList: EUIdentification | EUIdentification[] | undefined): SanctionEntry['identifications'] {
    if (!idList) return [];

    const ids = Array.isArray(idList) ? idList : [idList];

    return ids
      .filter((id) => id['@_number'])
      .map((id) => ({
        type: id['@_identificationTypeDescription'] || id['@_identificationTypeCode'] || 'Unknown',
        number: id['@_number']!,
        country: id['@_countryDescription'] || id['@_countryIso2Code'],
      }));
  }

  /**
   * Parse citizenships to nationalities
   */
  private parseCitizenships(citizenshipList: EUCitizenship | EUCitizenship[] | undefined): string[] {
    if (!citizenshipList) return [];

    const citizenships = Array.isArray(citizenshipList) ? citizenshipList : [citizenshipList];

    return citizenships
      .map((c) => c['@_countryDescription'] || c['@_countryIso2Code'])
      .filter((c): c is string => !!c);
  }

  /**
   * Parse birthdate
   */
  private parseBirthdate(birthdateList: EUBirthdate | EUBirthdate[] | undefined): string | undefined {
    if (!birthdateList) return undefined;

    const birthdates = Array.isArray(birthdateList) ? birthdateList : [birthdateList];
    const birthdate = birthdates[0];

    if (birthdate['@_birthdate']) {
      return birthdate['@_birthdate'];
    }

    // Construct date from components
    const year = birthdate['@_year'];
    const month = birthdate['@_monthOfYear'];
    const day = birthdate['@_dayOfMonth'];

    if (year) {
      if (month && day) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else if (month) {
        return `${year}-${month.padStart(2, '0')}`;
      }
      return year;
    }

    return undefined;
  }

  /**
   * Parse programs from regulations
   */
  private parsePrograms(regulationList: EURegulation | EURegulation[] | undefined): string[] {
    if (!regulationList) return [];

    const regulations = Array.isArray(regulationList) ? regulationList : [regulationList];

    return [...new Set(regulations.map((r) => r['@_programme']).filter((p): p is string => !!p))];
  }
}

/**
 * Default EU Sanctions configuration
 */
export const EU_SANCTIONS_DEFAULT_CONFIG: ConnectorConfig = {
  id: 'eu_sanctions',
  name: 'EU Consolidated Financial Sanctions',
  type: 'xml',
  url: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content',
  frequency: 'daily',
  priority: 1,
  rateLimit: '10/hour',
  enabled: true,
};
