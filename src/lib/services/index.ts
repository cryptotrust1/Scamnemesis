/**
 * Services module exports
 */

export { emailService, emailTemplates, sendEmail, type EmailOptions, type SendResult } from './email';
export {
  typesenseService,
  getTypesenseClient,
  initializeCollections,
  indexReport,
  indexReports,
  deleteReport,
  indexPerpetrator,
  searchReports,
  searchPerpetrators,
  getCollectionStats,
  resyncFromDatabase,
  COLLECTIONS,
  type ReportDocument,
  type PerpetratorDocument,
  type SearchOptions,
  type SearchResult,
} from './typesense';
