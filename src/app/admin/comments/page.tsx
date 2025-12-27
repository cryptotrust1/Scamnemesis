'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  MessageSquare,
  Flag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchComments, approveComment, rejectComment, type Comment } from '@/lib/admin/api';

const STATUSES = [
  { value: 'all', label: 'Všetky stavy' },
  { value: 'PENDING', label: 'Čakajúce' },
  { value: 'APPROVED', label: 'Schválené' },
  { value: 'REJECTED', label: 'Zamietnuté' },
];

export default function AdminCommentsPage() {
  const searchParams = useSearchParams();
  const initialReported = searchParams?.get('reported') === 'true';
  const initialStatus = searchParams?.get('status') || 'all';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [reportedOnly, setReportedOnly] = useState(initialReported);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    reported: 0,
    total: 0,
  });

  const itemsPerPage = 10;

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchComments({
        status: statusFilter,
        reported: reportedOnly || undefined,
        search: search || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      });
      setComments(data.comments);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setTotalCount(data.total);

      // Update stats from API response (always accurate counts)
      if (data.stats) {
        setStats({
          pending: data.stats.pending,
          reported: data.stats.reported,
          total: data.stats.total,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať komentáre');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, reportedOnly, search, currentPage]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, reportedOnly, search]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Čaká</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Schválené</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Zamietnuté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async (id: string) => {
    try {
      setIsSubmitting(true);
      await approveComment(id);
      setComments(comments.map(c => c.id === id ? { ...c, status: 'APPROVED' as const } : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa schváliť komentár');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsSubmitting(true);
      await rejectComment(id);
      setComments(comments.map(c => c.id === id ? { ...c, status: 'REJECTED' as const } : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa zamietnuť komentár');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={loadComments} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Skúsiť znova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Čakajúcich na moderáciu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.reported}</div>
            <p className="text-sm text-muted-foreground">Nahlásených komentárov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total || totalCount}</div>
            <p className="text-sm text-muted-foreground">Celkom komentárov</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Hľadať v obsahu alebo podľa autora..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stav" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={reportedOnly ? 'default' : 'outline'}
              onClick={() => setReportedOnly(!reportedOnly)}
              className="flex items-center gap-2"
            >
              <Flag className="h-4 w-4" />
              Len nahlásené
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Komentáre ({totalCount})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadComments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Obnoviť
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Žiadne komentáre nenájdené
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${
                    comment.reported ? 'border-red-200 bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {comment.author.displayName[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{comment.author.displayName}</p>
                          <p className="text-xs text-muted-foreground">{comment.author.email}</p>
                        </div>
                        {getStatusBadge(comment.status)}
                        {comment.reported && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            Nahlásené
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-2">
                        <p className="text-sm">{comment.content}</p>
                      </div>

                      {/* Report reason */}
                      {comment.reported && comment.reportReason && (
                        <p className="text-xs text-red-600 mb-2">
                          Dôvod nahlásenia: {comment.reportReason}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(comment.createdAt)}</span>
                        <a
                          href={`/admin/reports/${comment.report.id}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {comment.report.publicId}
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {comment.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(comment.id)}
                            disabled={isSubmitting}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(comment.id)}
                            disabled={isSubmitting}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Zobrazené {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} z {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
