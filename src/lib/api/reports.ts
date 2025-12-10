/**
 * Reports API service
 */

import apiClient, { ApiResponse } from './client';

export interface Report {
  id: string;
  publicId: string;
  title: string;
  summary: string;
  description: string;
  fraudType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'MERGED';
  country?: string;
  city?: string;
  financialLoss?: {
    amount: number;
    currency: string;
  };
  perpetrator?: {
    fullName?: string;
    nickname?: string;
    emails?: string[];
    phones?: string[];
    ibans?: string[];
    wallets?: string[];
  };
  evidence?: Array<{
    id: string;
    type: string;
    url?: string;
    description?: string;
  }>;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  similarCount?: number;
}

export interface ReportCreateInput {
  title: string;
  summary: string;
  description: string;
  fraudType: string;
  severity?: string;
  country?: string;
  city?: string;
  financialLoss?: {
    amount: number;
    currency: string;
  };
  perpetrator?: {
    fullName?: string;
    nickname?: string;
    emails?: string[];
    phones?: string[];
    ibans?: string[];
    wallets?: string[];
  };
}

export interface ReportSearchParams {
  q?: string;
  fraudType?: string;
  country?: string;
  status?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    displayName?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const reportsApi = {
  // Get all reports (with search/filter)
  async search(params: ReportSearchParams = {}): Promise<ApiResponse<Report[]>> {
    const queryParams: Record<string, string> = {};

    if (params.q) queryParams.q = params.q;
    if (params.fraudType && params.fraudType !== 'all') queryParams.fraud_type = params.fraudType;
    if (params.country && params.country !== 'all') queryParams.country = params.country;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.severity && params.severity !== 'all') queryParams.severity = params.severity;
    if (params.dateFrom) queryParams.date_from = params.dateFrom;
    if (params.dateTo) queryParams.date_to = params.dateTo;
    if (params.amountMin) queryParams.amount_min = params.amountMin.toString();
    if (params.amountMax) queryParams.amount_max = params.amountMax.toString();
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.sort) queryParams.sort = params.sort;

    return apiClient.get<Report[]>('/search', queryParams);
  },

  // Get single report by ID
  async getById(id: string): Promise<ApiResponse<Report>> {
    return apiClient.get<Report>(`/reports/${id}`);
  },

  // Create new report
  async create(data: ReportCreateInput): Promise<ApiResponse<Report>> {
    return apiClient.post<Report>('/reports', data);
  },

  // Update report
  async update(id: string, data: Partial<ReportCreateInput>): Promise<ApiResponse<Report>> {
    return apiClient.patch<Report>(`/reports/${id}`, data);
  },

  // Delete report
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reports/${id}`);
  },

  // Get comments for a report
  async getComments(reportId: string): Promise<ApiResponse<Comment[]>> {
    return apiClient.get<Comment[]>(`/reports/${reportId}/comments`);
  },

  // Add comment to report
  async addComment(reportId: string, content: string): Promise<ApiResponse<Comment>> {
    return apiClient.post<Comment>(`/reports/${reportId}/comments`, { content });
  },
};

export default reportsApi;
