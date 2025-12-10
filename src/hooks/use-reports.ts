'use client';

import { useState, useCallback } from 'react';
import { reportsApi, Report, ReportCreateInput, ReportSearchParams, Comment } from '@/lib/api';

interface UseReportsResult {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  total: number;
  search: (params?: ReportSearchParams) => Promise<void>;
  reset: () => void;
}

export function useReports(): UseReportsResult {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (params: ReportSearchParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reportsApi.search(params);
      setReports(response.data);
      setTotal(response.meta?.total || response.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setReports([]);
    setError(null);
    setTotal(0);
  }, []);

  return { reports, isLoading, error, total, search, reset };
}

interface UseReportResult {
  report: Report | null;
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetch: (id: string) => Promise<void>;
  addComment: (content: string) => Promise<void>;
}

export function useReport(): UseReportResult {
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [reportResponse, commentsResponse] = await Promise.all([
        reportsApi.getById(id),
        reportsApi.getComments(id),
      ]);
      setReport(reportResponse.data);
      setComments(commentsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
      setReport(null);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(async (content: string) => {
    if (!report) return;

    try {
      const response = await reportsApi.addComment(report.id, content);
      setComments((prev) => [...prev, response.data]);
    } catch (err) {
      throw err;
    }
  }, [report]);

  return { report, comments, isLoading, error, fetch, addComment };
}

interface UseCreateReportResult {
  isLoading: boolean;
  error: string | null;
  create: (data: ReportCreateInput) => Promise<Report>;
}

export function useCreateReport(): UseCreateReportResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: ReportCreateInput): Promise<Report> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reportsApi.create(data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create report';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, create };
}

export default useReports;
