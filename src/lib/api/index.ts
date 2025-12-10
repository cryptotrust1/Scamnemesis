/**
 * API module exports
 */

export { apiClient, type ApiError, type ApiResponse } from './client';
export { authApi, type User, type LoginInput, type RegisterInput, type AuthResponse } from './auth';
export {
  reportsApi,
  type Report,
  type ReportCreateInput,
  type ReportSearchParams,
  type Comment
} from './reports';
export {
  adminApi,
  type AdminStats,
  type DuplicateCluster,
  type AdminReportListParams,
  type AdminUserListParams,
  type AdminCommentListParams
} from './admin';
