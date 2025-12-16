/**
 * Admin API Service
 * Centralized API calls for admin operations
 * Uses HttpOnly cookies for authentication (no localStorage)
 */

const API_BASE = '/api/v1';

// Default fetch options with credentials for HttpOnly cookies
const fetchOptions: RequestInit = {
  credentials: 'include', // Important: Include cookies in all requests
};

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Token expired or not authenticated - redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Relácia vypršala. Prihláste sa znova.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Nastala chyba');
  }

  return data;
}

// ==================== Reports ====================

export interface Report {
  id: string;
  publicId: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  fraudType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporterEmail?: string;
  perpetratorName?: string;
  perpetratorEmail?: string;
  perpetratorPhone?: string;
  perpetratorIban?: string;
  amount?: number;
  currency?: string;
  country?: string;
  createdAt: string;
  publishedAt?: string;
  similarCount?: number;
}

export interface ReportsResponse {
  reports: Report[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReportFilters {
  status?: string;
  fraudType?: string;
  severity?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchReports(filters: ReportFilters = {}): Promise<ReportsResponse> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.fraudType && filters.fraudType !== 'all') params.append('fraud_type', filters.fraudType);
  if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);
  if (filters.search) params.append('q', filters.search);
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.pageSize || 10));

  const response = await fetch(`${API_BASE}/reports?${params}`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<ReportsResponse>(response);
}

export async function fetchReport(id: string): Promise<Report> {
  const response = await fetch(`${API_BASE}/reports/${id}`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<Report>(response);
}

export async function approveReport(id: string, notes?: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/reports/${id}/approve`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ admin_notes: notes }),
  });

  return handleResponse(response);
}

export async function rejectReport(id: string, reason: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/reports/${id}/reject`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ rejection_reason: reason }),
  });

  return handleResponse(response);
}

// ==================== Users ====================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: 'BASIC' | 'STANDARD' | 'GOLD' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | 'SUSPENDED';
  isActive: boolean;
  emailVerified: boolean;
  reportsCount?: number;
  commentsCount?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (filters.role && filters.role !== 'all') params.append('role', filters.role);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('q', filters.search);
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.pageSize || 10));

  const response = await fetch(`${API_BASE}/admin/users?${params}`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<UsersResponse>(response);
}

export async function updateUserRole(userId: string, role: string): Promise<User> {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    ...fetchOptions,
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  });

  return handleResponse<User>(response);
}

export async function banUser(userId: string, reason?: string): Promise<User> {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });

  return handleResponse<User>(response);
}

export async function unbanUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/unban`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
  });

  return handleResponse<User>(response);
}

// ==================== Comments ====================

export interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reported: boolean;
  reportReason?: string;
  author: {
    id: string;
    displayName: string;
    email: string;
  };
  report: {
    id: string;
    title: string;
    publicId: string;
  };
  createdAt: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CommentFilters {
  status?: string;
  reported?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchComments(filters: CommentFilters = {}): Promise<CommentsResponse> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.reported !== undefined) params.append('reported', String(filters.reported));
  if (filters.search) params.append('q', filters.search);
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.pageSize || 10));

  const response = await fetch(`${API_BASE}/admin/comments?${params}`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<CommentsResponse>(response);
}

export async function approveComment(id: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/comments/${id}/approve`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function rejectComment(id: string, reason?: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/comments/${id}/reject`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });

  return handleResponse(response);
}

// ==================== Duplicates ====================

export interface DuplicateReport {
  id: string;
  publicId: string;
  title: string;
  fraudType: string;
  perpetratorName?: string;
  perpetratorPhone?: string;
  perpetratorEmail?: string;
  perpetratorIban?: string;
  amount?: number;
  currency?: string;
  createdAt: string;
  reporterCount?: number;
  isPrimary?: boolean;
}

export interface DuplicateCluster {
  id: string;
  confidence: number;
  matchType: string;
  status: 'PENDING' | 'MERGED' | 'DISMISSED';
  createdAt: string;
  mergedAt?: string;
  reports: DuplicateReport[];
}

export interface DuplicatesResponse {
  duplicates: DuplicateCluster[];
  total: number;
}

export async function fetchDuplicates(status?: string): Promise<DuplicatesResponse> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);

  const response = await fetch(`${API_BASE}/admin/duplicates?${params}`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<DuplicatesResponse>(response);
}

export async function mergeDuplicates(clusterId: string, primaryReportId: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/duplicates/${clusterId}/merge`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ primary_report_id: primaryReportId }),
  });

  return handleResponse(response);
}

export async function dismissDuplicates(clusterId: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/duplicates/${clusterId}/dismiss`, {
    ...fetchOptions,
    method: 'POST',
    headers: getHeaders(),
  });

  return handleResponse(response);
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
  activeUsers: number;
  reportsThisWeek: number;
  reportsChange: string;
  pendingComments: number;
  reportedComments: number;
  pendingDuplicates: number;
  fraudTypeDistribution: { type: string; count: number }[];
  recentReports: Report[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/admin/stats`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<DashboardStats>(response);
}

// ==================== Audit Log ====================

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail?: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
  const params = new URLSearchParams();
  if (filters.action && filters.action !== 'all') params.append('action', filters.action);
  if (filters.entityType && filters.entityType !== 'all') params.append('entity_type', filters.entityType);
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.pageSize || 20));

  const response = await fetch(`${API_BASE}/admin/audit?${params}`, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  return handleResponse<AuditLogResponse>(response);
}
