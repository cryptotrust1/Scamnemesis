/**
 * Hooks module exports
 *
 * Note: useAuth/AuthProvider were removed as they duplicated functionality
 * from @/lib/auth/user-context.tsx. Use useUser from there instead.
 */

export { useReports, useReport, useCreateReport } from './use-reports';
export {
  useAdminStats,
  useAdminReports,
  useAdminUsers,
  useAdminComments,
  useAdminDuplicates
} from './use-admin';
