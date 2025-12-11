/**
 * OFAC Sanctions Connector
 * Fetches data from US Treasury OFAC SDN (Specially Designated Nationals) List
 *
 * Sources:
 * - SDN List (XML): https://www.treasury.gov/ofac/downloads/sdn.xml
 * - Consolidated (CSV): https://www.treasury.gov/ofac/downloads/consolidated/consolidated.csv
 */

import { XMLParser } from 'fast-xml-parser';
import { BaseConnector, RateLimitError } from './BaseConnector';
import { ConnectorConfig, SanctionEntry } from '../queue';

interface OFACSDNEntry {
  uid: string;
  sdnType: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  remarks?: string;
  programList?: {
    program: string | string[];
  };
  akaList?: {
    aka: OFACAka | OFACAka[];
  };
  addressList?: {
    address: OFACAddress | OFACAddress[];
  };
  idList?: {
    id: OFACId | OFACId[];
  };
  nationalityList?: {
    nationality: OFACNationality | OFACNationality[];
  };
  dateOfBirthList?: {
    dateOfBirthItem: OFACDateOfBirth | OFACDateOfBirth[];
  };
  placeOfBirthList?: {
    placeOfBirthItem: OFACPlaceOfBirth | OFACPlaceOfBirth[];
  };
}

interface OFACAka {
  uid: string;
  type: string;
  category: string;
  firstName?: string;
  lastName?: string;
}

interface OFACAddress {
  uid: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
}

interface OFACId {
  uid: string;
  idType: string;
  idNumber: string;
  idCountry?: string;
  issueDate?: string;
  expirationDate?: string;
}

interface OFACNationality {
  uid: string;
  country: string;
  mainEntry: boolean;
}

interface OFACDateOfBirth {
  uid: string;
  dateOfBirth: string;
  mainEntry: boolean;
}

interface OFACPlaceOfBirth {
  uid: string;
  placeOfBirth: string;
  mainEntry: boolean;
}

export class OFACConnector extends BaseConnector {
  private parser: XMLParser;

  constructor(config: ConnectorConfig) {
    super(config);
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (tagName) => {
        // These tags should always be arrays
        const arrayTags = ['sdnEntry', 'program', 'aka', 'address', 'id', 'nationality', 'dateOfBirthItem', 'placeOfBirthItem'];
        return arrayTags.includes(tagName);
      },
    });
  }

  /**
   * Fetch OFAC SDN list
   */
  async fetch(): Promise<SanctionEntry[]> {
    if (!(await this.checkRateLimit())) {
      throw new RateLimitError(this.config.id);
    }

    this.log('info', 'Fetching OFAC SDN list');

    try {
      const response = await this.fetchWithRetry(this.config.url);
      const xml = await response.text();

      this.log('info', 'Downloaded OFAC XML', { size: xml.length });

      const data = this.parser.parse(xml);
      const entries: SanctionEntry[] = [];

      const sdnList = data.sdnList?.sdnEntry || [];

      for (const entry of sdnList) {
        try {
          const sanctionEntry = this.parseEntry(entry);
          if (sanctionEntry) {
            entries.push(sanctionEntry);
          }
        } catch (error) {
          this.log('warn', 'Failed to parse OFAC entry', {
            uid: entry.uid,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      this.log('info', 'OFAC fetch completed', { totalEntries: entries.length });

      return entries;
    } catch (error) {
      this.log('error', 'OFAC fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Parse single SDN entry
   */
  private parseEntry(entry: OFACSDNEntry): SanctionEntry | null {
    // Build primary name
    const names: string[] = [];
    if (entry.firstName && entry.lastName) {
      names.push(`${entry.firstName} ${entry.lastName}`.trim());
    } else if (entry.lastName) {
      names.push(entry.lastName);
    } else if (entry.firstName) {
      names.push(entry.firstName);
    }

    if (names.length === 0) {
      return null;
    }

    // Parse aliases
    const aliases = this.parseAliases(entry.akaList?.aka);

    // Parse addresses
    const addresses = this.parseAddresses(entry.addressList?.address);

    // Parse IDs
    const identifications = this.parseIds(entry.idList?.id);

    // Parse nationalities
    const nationalities = this.parseNationalities(entry.nationalityList?.nationality);

    // Parse date of birth
    const dateOfBirth = this.parseDateOfBirth(entry.dateOfBirthList?.dateOfBirthItem);

    // Parse programs
    const programs = this.parsePrograms(entry.programList?.program);

    return {
      sourceId: this.config.id,
      externalId: entry.uid,
      type: entry.sdnType === 'Individual' ? 'Individual' : 'Entity',
      names,
      aliases,
      dateOfBirth,
      nationalities,
      addresses,
      identifications,
      programs,
      remarks: entry.remarks,
      lastUpdated: new Date(),
      rawData: entry,
    };
  }

  /**
   * Parse aliases from aka list
   */
  private parseAliases(akaList: OFACAka | OFACAka[] | undefined): string[] {
    if (!akaList) return [];

    const akas = Array.isArray(akaList) ? akaList : [akaList];
    const aliases: string[] = [];

    for (const aka of akas) {
      const name = [aka.firstName, aka.lastName].filter(Boolean).join(' ').trim();
      if (name) {
        aliases.push(name);
      }
    }

    return aliases;
  }

  /**
   * Parse addresses
   */
  private parseAddresses(addressList: OFACAddress | OFACAddress[] | undefined): SanctionEntry['addresses'] {
    if (!addressList) return [];

    const addresses = Array.isArray(addressList) ? addressList : [addressList];

    return addresses.map((addr) => ({
      street: [addr.address1, addr.address2, addr.address3].filter(Boolean).join(', '),
      city: addr.city,
      country: addr.country,
      postalCode: addr.postalCode,
    }));
  }

  /**
   * Parse identifications
   */
  private parseIds(idList: OFACId | OFACId[] | undefined): SanctionEntry['identifications'] {
    if (!idList) return [];

    const ids = Array.isArray(idList) ? idList : [idList];

    return ids.map((id) => ({
      type: id.idType,
      number: id.idNumber,
      country: id.idCountry,
    }));
  }

  /**
   * Parse nationalities
   */
  private parseNationalities(nationalityList: OFACNationality | OFACNationality[] | undefined): string[] {
    if (!nationalityList) return [];

    const nationalities = Array.isArray(nationalityList) ? nationalityList : [nationalityList];

    return nationalities.map((n) => n.country);
  }

  /**
   * Parse date of birth
   */
  private parseDateOfBirth(dobList: OFACDateOfBirth | OFACDateOfBirth[] | undefined): string | undefined {
    if (!dobList) return undefined;

    const dobs = Array.isArray(dobList) ? dobList : [dobList];
    const mainDob = dobs.find((d) => d.mainEntry) || dobs[0];

    return mainDob?.dateOfBirth;
  }

  /**
   * Parse programs
   */
  private parsePrograms(programList: string | string[] | undefined): string[] {
    if (!programList) return [];
    return Array.isArray(programList) ? programList : [programList];
  }
}

/**
 * Default OFAC configuration
 */
export const OFAC_DEFAULT_CONFIG: ConnectorConfig = {
  id: 'ofac_sdn',
  name: 'OFAC SDN List',
  type: 'xml',
  url: 'https://www.treasury.gov/ofac/downloads/sdn.xml',
  frequency: 'daily',
  priority: 1,
  rateLimit: '10/hour',
  enabled: true,
};
