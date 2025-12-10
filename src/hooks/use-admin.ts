'use client';

import { useState, useCallback } from 'react';
import {
  adminApi,
  AdminStats,
  DuplicateCluster,
  AdminReportListParams,
  AdminUserListParams,
  AdminCommentListParams,
  Report,
  Comment,
  User
} from '@/lib/api';

// Stats hook
interface UseAdminStatsResult {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsResult {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getStats();
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, error, fetch };
}

// Admin Reports hook
interface UseAdminReportsResult {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  total: number;
  fetch: (params?: AdminReportListParams) => Promise<void>;
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason?: string) => Promise<void>;
}

export function useAdminReports(): UseAdminReportsResult {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async (params: AdminReportListParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getReports(params);
      setReports(response.data);
      setTotal(response.meta?.total || response.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (id: string) => {
    try {
      await adminApi.approveReport(id);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const } : r))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const reject = useCallback(async (id: string, reason?: string) => {
    try {
      await adminApi.rejectReport(id, reason);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  return { reports, isLoading, error, total, fetch, approve, reject };
}

// Admin Users hook
interface UseAdminUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  total: number;
  fetch: (params?: AdminUserListParams) => Promise<void>;
  updateRole: (userId: string, role: string) => Promise<void>;
  ban: (userId: string, reason?: string) => Promise<void>;
  unban: (userId: string) => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async (params: AdminUserListParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getUsers(params);
      setUsers(response.data);
      setTotal(response.meta?.total || response.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (userId: string, role: string) => {
    try {
      await adminApi.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: role as User['role'] } : u))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const ban = useCallback(async (userId: string, reason?: string) => {
    try {
      await adminApi.banUser(userId, reason);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'BANNED' } : u)) as User[]
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const unban = useCallback(async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'ACTIVE' } : u)) as User[]
      );
    } catch (err) {
      throw err;
    }
  }, []);

  return { users, isLoading, error, total, fetch, updateRole, ban, unban };
}

// Admin Comments hook
interface UseAdminCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetch: (params?: AdminCommentListParams) => Promise<void>;
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason?: string) => Promise<void>;
}

export function useAdminComments(): UseAdminCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (params: AdminCommentListParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getComments(params);
      setComments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (id: string) => {
    try {
      await adminApi.approveComment(id);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'APPROVED' as const } : c))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const reject = useCallback(async (id: string, reason?: string) => {
    try {
      await adminApi.rejectComment(id, reason);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'REJECTED' as const } : c))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  return { comments, isLoading, error, fetch, approve, reject };
}

// Admin Duplicates hook
interface UseAdminDuplicatesResult {
  duplicates: DuplicateCluster[];
  isLoading: boolean;
  error: string | null;
  fetch: (status?: string) => Promise<void>;
  merge: (clusterId: string, primaryId: string) => Promise<void>;
  dismiss: (clusterId: string) => Promise<void>;
}

export function useAdminDuplicates(): UseAdminDuplicatesResult {
  const [duplicates, setDuplicates] = useState<DuplicateCluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getDuplicates(status);
      setDuplicates(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch duplicates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const merge = useCallback(async (clusterId: string, primaryId: string) => {
    try {
      await adminApi.mergeDuplicates(clusterId, primaryId);
      setDuplicates((prev) =>
        prev.map((d) => (d.id === clusterId ? { ...d, status: 'MERGED' as const } : d))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const dismiss = useCallback(async (clusterId: string) => {
    try {
      await adminApi.dismissDuplicate(clusterId);
      setDuplicates((prev) =>
        prev.map((d) => (d.id === clusterId ? { ...d, status: 'DISMISSED' as const } : d))
      );
    } catch (err) {
      throw err;
    }
  }, []);

  return { duplicates, isLoading, error, fetch, merge, dismiss };
}
