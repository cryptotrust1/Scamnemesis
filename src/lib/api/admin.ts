/**
 * Admin API service
 */

import apiClient, { ApiResponse } from './client';
import { Report, Comment } from './reports';
import { User } from './auth';

export interface AdminStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
  activeUsers: number;
  reportsThisWeek: number;
  reportsChange: string;
}

export interface DuplicateCluster {
  id: string;
  primaryReportId: string;
  primaryReport: Report;
  duplicateReports: Report[];
  confidence: number;
  matchType: string;
  status: 'PENDING' | 'MERGED' | 'DISMISSED';
  createdAt: string;
}

export interface AdminReportListParams {
  status?: string;
  fraudType?: string;
  severity?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface AdminUserListParams {
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminCommentListParams {
  status?: string;
  reported?: boolean;
  page?: number;
  limit?: number;
}

export const adminApi = {
  // Get admin dashboard stats
  async getStats(): Promise<ApiResponse<AdminStats>> {
    return apiClient.get<AdminStats>('/stats');
  },

  // --- Reports Management ---

  // Get reports list for admin
  async getReports(params: AdminReportListParams = {}): Promise<ApiResponse<Report[]>> {
    const queryParams: Record<string, string> = {};

    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.fraudType && params.fraudType !== 'all') queryParams.fraud_type = params.fraudType;
    if (params.severity && params.severity !== 'all') queryParams.severity = params.severity;
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.sort) queryParams.sort = params.sort;
    if (params.search) queryParams.q = params.search;

    return apiClient.get<Report[]>('/admin/reports', queryParams);
  },

  // Approve report
  async approveReport(id: string): Promise<ApiResponse<Report>> {
    return apiClient.post<Report>(`/admin/reports/${id}/approve`);
  },

  // Reject report
  async rejectReport(id: string, reason?: string): Promise<ApiResponse<Report>> {
    return apiClient.post<Report>(`/admin/reports/${id}/reject`, { reason });
  },

  // --- Users Management ---

  // Get users list
  async getUsers(params: AdminUserListParams = {}): Promise<ApiResponse<User[]>> {
    const queryParams: Record<string, string> = {};

    if (params.role && params.role !== 'all') queryParams.role = params.role;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.search) queryParams.q = params.search;

    return apiClient.get<User[]>('/admin/users', queryParams);
  },

  // Update user role
  async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`/admin/users/${userId}`, { role });
  },

  // Ban user
  async banUser(userId: string, reason?: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/admin/users/${userId}/ban`, { reason });
  },

  // Unban user
  async unbanUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/admin/users/${userId}/unban`);
  },

  // --- Comments Management ---

  // Get comments list for moderation
  async getComments(params: AdminCommentListParams = {}): Promise<ApiResponse<Comment[]>> {
    const queryParams: Record<string, string> = {};

    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.reported) queryParams.reported = 'true';
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();

    return apiClient.get<Comment[]>('/admin/comments', queryParams);
  },

  // Approve comment
  async approveComment(commentId: string): Promise<ApiResponse<Comment>> {
    return apiClient.post<Comment>(`/admin/comments/${commentId}/approve`);
  },

  // Reject comment
  async rejectComment(commentId: string, reason?: string): Promise<ApiResponse<Comment>> {
    return apiClient.post<Comment>(`/admin/comments/${commentId}/reject`, { reason });
  },

  // --- Duplicates Management ---

  // Get duplicate clusters
  async getDuplicates(status?: string): Promise<ApiResponse<DuplicateCluster[]>> {
    const params: Record<string, string> = {};
    if (status && status !== 'all') params.status = status;
    return apiClient.get<DuplicateCluster[]>('/admin/duplicates', params);
  },

  // Merge duplicates
  async mergeDuplicates(clusterId: string, primaryId: string): Promise<ApiResponse<Report>> {
    return apiClient.post<Report>(`/admin/duplicates/${clusterId}/merge`, { primaryId });
  },

  // Dismiss duplicate cluster
  async dismissDuplicate(clusterId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/admin/duplicates/${clusterId}/dismiss`);
  },
};

export default adminApi;
