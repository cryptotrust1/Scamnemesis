'use client';

import { useState, useEffect } from 'react';
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

// Mock data
const mockComments = [
  {
    id: '1',
    content: 'Môžem potvrdiť, tento podvodník mi tiež poslal rovnakú správu. Buďte opatrní!',
    author: {
      id: 'u1',
      displayName: 'Ján Novák',
      email: 'jan.n***@email.com',
    },
    report: {
      id: 'r1',
      title: 'Investičný podvod s kryptomenami',
      publicId: 'RPT-2024-001234',
    },
    status: 'PENDING',
    reported: false,
    createdAt: '2025-12-10T14:32:00',
  },
  {
    id: '2',
    content: 'SPAM SPAM SPAM odkaz na podozrivú stránku',
    author: {
      id: 'u2',
      displayName: 'Spammer123',
      email: 'spam***@email.com',
    },
    report: {
      id: 'r2',
      title: 'Romance scam - dating aplikácia',
      publicId: 'RPT-2024-001233',
    },
    status: 'PENDING',
    reported: true,
    reportReason: 'Spam obsah',
    createdAt: '2025-12-10T13:15:00',
  },
  {
    id: '3',
    content: 'Ďakujem za nahlásenie, vďaka vám som sa vyhol podobnému podvodu.',
    author: {
      id: 'u3',
      displayName: 'Mária Kováčová',
      email: 'maria.k***@gmail.com',
    },
    report: {
      id: 'r3',
      title: 'Phishing email - podvrhnutá správa od banky',
      publicId: 'RPT-2024-001232',
    },
    status: 'APPROVED',
    reported: false,
    createdAt: '2025-12-10T11:45:00',
  },
  {
    id: '4',
    content: 'Toto je falošné hlásenie, poznám túto osobu a nie je to podvodník!',
    author: {
      id: 'u4',
      displayName: 'Peter Horváth',
      email: 'peter.h***@yahoo.com',
    },
    report: {
      id: 'r4',
      title: 'Podvod s prenájmom bytu',
      publicId: 'RPT-2024-001231',
    },
    status: 'PENDING',
    reported: true,
    reportReason: 'Nepravdivé tvrdenie',
    createdAt: '2025-12-10T10:20:00',
  },
  {
    id: '5',
    content: 'Vulgárny a urážlivý obsah ktorý bol zmazaný',
    author: {
      id: 'u5',
      displayName: 'Trollmaster',
      email: 'troll***@email.com',
    },
    report: {
      id: 'r1',
      title: 'Investičný podvod s kryptomenami',
      publicId: 'RPT-2024-001234',
    },
    status: 'REJECTED',
    reported: true,
    reportReason: 'Vulgárny obsah',
    rejectionReason: 'Porušenie pravidiel komunity',
    createdAt: '2025-12-09T16:30:00',
  },
];

const STATUSES = [
  { value: 'all', label: 'Všetky stavy' },
  { value: 'PENDING', label: 'Čakajúce' },
  { value: 'APPROVED', label: 'Schválené' },
  { value: 'REJECTED', label: 'Zamietnuté' },
];

export default function AdminCommentsPage() {
  const searchParams = useSearchParams();
  const initialReported = searchParams.get('reported') === 'true';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportedOnly, setReportedOnly] = useState(initialReported);
  const [comments, setComments] = useState(mockComments);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(comments.length / itemsPerPage);

  useEffect(() => {
    filterComments();
  }, [search, statusFilter, reportedOnly]);

  const filterComments = () => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...mockComments];

      if (search) {
        filtered = filtered.filter(
          (c) =>
            c.content.toLowerCase().includes(search.toLowerCase()) ||
            c.author.displayName.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((c) => c.status === statusFilter);
      }

      if (reportedOnly) {
        filtered = filtered.filter((c) => c.reported);
      }

      setComments(filtered);
      setCurrentPage(1);
      setIsLoading(false);
    }, 300);
  };

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

  const handleApprove = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c));
  };

  const handleReject = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c));
  };

  const paginatedComments = comments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = mockComments.filter(c => c.status === 'PENDING').length;
  const reportedCount = mockComments.filter(c => c.reported).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Čakajúcich na moderáciu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{reportedCount}</div>
            <p className="text-sm text-muted-foreground">Nahlásených komentárov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockComments.length}</div>
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
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Komentáre ({comments.length})
          </CardTitle>
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
              {paginatedComments.map((comment) => (
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
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(comment.id)}
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
                Zobrazené {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, comments.length)} z {comments.length}
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
