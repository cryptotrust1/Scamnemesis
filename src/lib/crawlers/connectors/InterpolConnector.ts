/**
 * Interpol Red Notices Connector
 * Fetches data from Interpol's public Red Notices API
 *
 * Source:
 * - Red Notices API: https://ws-public.interpol.int/notices/v1/red
 *
 * Note: This is a public API with rate limiting. Returns wanted persons.
 */

import { BaseConnector, RateLimitError } from './BaseConnector';
import { ConnectorConfig, SanctionEntry } from '../queue';

interface InterpolNotice {
  entity_id: string;
  un_reference?: string;
  forename?: string;
  name: string;
  date_of_birth?: string;
  distinguishing_marks?: string;
  weight?: number;
  height?: number;
  sex_id?: string;
  country_of_birth_id?: string;
  place_of_birth?: string;
  nationalities?: string[];
  languages_spoken_ids?: string[];
  eyes_colors_id?: string[];
  hairs_id?: string[];
  arrest_warrants?: InterpolWarrant[];
  _links?: {
    self?: { href: string };
    images?: { href: string };
    thumbnail?: { href: string };
  };
}

interface InterpolWarrant {
  issuing_country_id?: string;
  charge?: string;
  charge_translation?: string;
}

interface InterpolResponse {
  total: number;
  query: {
    page: number;
    resultPerPage: number;
  };
  _embedded?: {
    notices: InterpolNotice[];
  };
  _links?: {
    self?: { href: string };
    first?: { href: string };
    last?: { href: string };
    next?: { href: string };
  };
}

export class InterpolConnector extends BaseConnector {
  private baseUrl = 'https://ws-public.interpol.int/notices/v1/red';

  constructor(config: ConnectorConfig) {
    super(config);
  }

  /**
   * Fetch Interpol Red Notices
   * Paginates through all results
   */
  async fetch(): Promise<SanctionEntry[]> {
    if (!(await this.checkRateLimit())) {
      throw new RateLimitError(this.config.id);
    }

    this.log('info', 'Fetching Interpol Red Notices');

    try {
      const entries: SanctionEntry[] = [];
      let page = 1;
      const resultsPerPage = 160; // Max allowed by Interpol API
      let hasMore = true;

      while (hasMore) {
        const url = `${this.baseUrl}?page=${page}&resultPerPage=${resultsPerPage}`;

        this.log('info', `Fetching Interpol page ${page}`);

        const response = await this.fetchWithRetry(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        const data: InterpolResponse = await response.json();

        if (data._embedded?.notices) {
          for (const notice of data._embedded.notices) {
            try {
              const entry = this.parseNotice(notice);
              if (entry) {
                entries.push(entry);
              }
            } catch (error) {
              this.log('warn', 'Failed to parse Interpol notice', {
                entityId: notice.entity_id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }

        // Check if there are more pages
        hasMore = !!data._links?.next;
        page++;

        // Rate limiting: wait between pages
        if (hasMore) {
          await this.sleep(500);
        }

        // Safety limit to prevent infinite loops
        if (page > 100) {
          this.log('warn', 'Reached page limit, stopping pagination');
          break;
        }
      }

      this.log('info', 'Interpol fetch completed', { totalEntries: entries.length });

      return entries;
    } catch (error) {
      this.log('error', 'Interpol fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Parse single Interpol notice
   */
  private parseNotice(notice: InterpolNotice): SanctionEntry | null {
    // Build name
    const names: string[] = [];
    const fullName = [notice.forename, notice.name].filter(Boolean).join(' ').trim();

    if (fullName) {
      names.push(fullName);
    }

    if (names.length === 0) {
      return null;
    }

    // Parse nationalities
    const nationalities = notice.nationalities || [];

    // Parse identifications from warrants
    const identifications: SanctionEntry['identifications'] = [];

    // Add warrants as identification info
    if (notice.arrest_warrants) {
      for (const warrant of notice.arrest_warrants) {
        if (warrant.charge) {
          identifications.push({
            type: 'Arrest Warrant',
            number: warrant.charge,
            country: warrant.issuing_country_id,
          });
        }
      }
    }

    // Build programs/charges
    const programs: string[] = [];
    if (notice.arrest_warrants) {
      for (const warrant of notice.arrest_warrants) {
        const charge = warrant.charge_translation || warrant.charge;
        if (charge && !programs.includes(charge)) {
          programs.push(charge);
        }
      }
    }

    // Build remarks with physical description
    const remarks = this.buildRemarks(notice);

    // Addresses (Interpol doesn't provide addresses in Red Notices)
    const addresses: SanctionEntry['addresses'] = [];

    // If place of birth is available
    if (notice.place_of_birth || notice.country_of_birth_id) {
      addresses.push({
        city: notice.place_of_birth,
        country: notice.country_of_birth_id,
      });
    }

    return {
      sourceId: this.config.id,
      externalId: notice.entity_id,
      type: 'Individual',
      names,
      aliases: [],
      dateOfBirth: notice.date_of_birth,
      nationalities,
      addresses,
      identifications,
      programs,
      remarks,
      lastUpdated: new Date(),
      rawData: {
        thumbnailUrl: notice._links?.thumbnail?.href,
        imagesUrl: notice._links?.images?.href,
        sex: notice.sex_id,
        height: notice.height,
        weight: notice.weight,
      },
    };
  }

  /**
   * Build remarks from physical description
   */
  private buildRemarks(notice: InterpolNotice): string {
    const parts: string[] = [];

    if (notice.sex_id) {
      parts.push(`Sex: ${notice.sex_id === 'M' ? 'Male' : notice.sex_id === 'F' ? 'Female' : notice.sex_id}`);
    }

    if (notice.height) {
      parts.push(`Height: ${notice.height} cm`);
    }

    if (notice.weight) {
      parts.push(`Weight: ${notice.weight} kg`);
    }

    if (notice.eyes_colors_id?.length) {
      parts.push(`Eyes: ${notice.eyes_colors_id.join(', ')}`);
    }

    if (notice.hairs_id?.length) {
      parts.push(`Hair: ${notice.hairs_id.join(', ')}`);
    }

    if (notice.distinguishing_marks) {
      parts.push(`Distinguishing marks: ${notice.distinguishing_marks}`);
    }

    if (notice.languages_spoken_ids?.length) {
      parts.push(`Languages: ${notice.languages_spoken_ids.join(', ')}`);
    }

    return parts.join('; ');
  }

  /**
   * Search for specific person
   */
  async searchByName(forename?: string, name?: string, nationality?: string): Promise<SanctionEntry[]> {
    if (!(await this.checkRateLimit())) {
      throw new RateLimitError(this.config.id);
    }

    const params = new URLSearchParams();
    if (forename) params.append('forename', forename);
    if (name) params.append('name', name);
    if (nationality) params.append('nationality', nationality);
    params.append('resultPerPage', '20');

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      const data: InterpolResponse = await response.json();
      const entries: SanctionEntry[] = [];

      if (data._embedded?.notices) {
        for (const notice of data._embedded.notices) {
          const entry = this.parseNotice(notice);
          if (entry) {
            entries.push(entry);
          }
        }
      }

      return entries;
    } catch (error) {
      this.log('error', 'Interpol search failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

/**
 * Default Interpol configuration
 */
export const INTERPOL_DEFAULT_CONFIG: ConnectorConfig = {
  id: 'interpol_red',
  name: 'Interpol Red Notices',
  type: 'api',
  url: 'https://ws-public.interpol.int/notices/v1/red',
  frequency: 'daily',
  priority: 1,
  rateLimit: '100/hour',
  enabled: true,
};
