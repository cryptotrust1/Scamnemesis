/**
 * Crawler Connectors Index
 * Export all connectors and configurations
 */

// Base classes
export { BaseConnector, ConnectorFactory, RateLimitError } from './BaseConnector';

// Sanctions Connectors
export { OFACConnector, OFAC_DEFAULT_CONFIG } from './OFACConnector';
export { EUSanctionsConnector, EU_SANCTIONS_DEFAULT_CONFIG } from './EUSanctionsConnector';
export { InterpolConnector, INTERPOL_DEFAULT_CONFIG } from './InterpolConnector';

// News Connectors
export { RSSConnector, NEWS_SOURCE_CONFIGS } from './RSSConnector';

// Register connectors with factory
import { ConnectorFactory } from './BaseConnector';
import { OFACConnector } from './OFACConnector';
import { EUSanctionsConnector } from './EUSanctionsConnector';
import { InterpolConnector } from './InterpolConnector';
import { RSSConnector } from './RSSConnector';

// Register all connector types
ConnectorFactory.register('xml', OFACConnector);
ConnectorFactory.register('api', InterpolConnector);
ConnectorFactory.register('rss', RSSConnector);

// Custom registration for specific sources
export function registerConnectors(): void {
  // XML-based connectors (OFAC, EU)
  ConnectorFactory.register('xml', OFACConnector);

  // API-based connectors (Interpol)
  ConnectorFactory.register('api', InterpolConnector);

  // RSS-based connectors
  ConnectorFactory.register('rss', RSSConnector);
}

// All default configurations
export const ALL_CONNECTOR_CONFIGS = {
  sanctions: [
    { ...require('./OFACConnector').OFAC_DEFAULT_CONFIG },
    { ...require('./EUSanctionsConnector').EU_SANCTIONS_DEFAULT_CONFIG },
    { ...require('./InterpolConnector').INTERPOL_DEFAULT_CONFIG },
  ],
  news: require('./RSSConnector').NEWS_SOURCE_CONFIGS,
};
