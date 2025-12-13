'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
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
const mockReports = [
  {
    id: '1',
    publicId: 'RPT-2024-001234',
    title: 'Investičný podvod s kryptomenami - ponuka vysokých výnosov',
    status: 'PENDING',
    fraudType: 'INVESTMENT_FRAUD',
    severity: 'HIGH',
    reporterEmail: 'jan.n***@email.com',
    perpetratorName: 'Mic***l Nov**',
    amount: 15000,
    currency: 'EUR',
    country: 'Slovensko',
    createdAt: '2025-12-10T14:32:00',
    similarCount: 12,
  },
  {
    id: '2',
    publicId: 'RPT-2024-001233',
    title: 'Romance scam - zoznamka a požiadavka o peniaze',
    status: 'PENDING',
    fraudType: 'ROMANCE_SCAM',
    severity: 'MEDIUM',
    reporterEmail: 'maria.k***@gmail.com',
    perpetratorName: 'Kat***a Dvořáková',
    amount: 8500,
    currency: 'EUR',
    country: 'Česká republika',
    createdAt: '2025-12-10T13:15:00',
    similarCount: 5,
  },
  {
    id: '3',
    publicId: 'RPT-2024-001232',
    title: 'Phishing email - podvrhnutá správa od Tatra banky',
    status: 'APPROVED',
    fraudType: 'PHISHING',
    severity: 'CRITICAL',
    reporterEmail: 'peter.h***@yahoo.com',
    perpetratorName: null,
    amount: 0,
    currency: 'EUR',
    country: 'Slovensko',
    createdAt: '2025-12-10T11:45:00',
    similarCount: 23,
  },
  {
    id: '4',
    publicId: 'RPT-2024-001231',
    title: 'Podvod s prenájmom bytu - vopred zaplatená záloha',
    status: 'PENDING',
    fraudType: 'RENTAL_FRAUD',
    severity: 'MEDIUM',
    reporterEmail: 'anna.s***@outlook.com',
    perpetratorName: 'Pet** Hor***',
    amount: 2000,
    currency: 'EUR',
    country: 'Slovensko',
    createdAt: '2025-12-10T10:20:00',
    similarCount: 3,
  },
  {
    id: '5',
    publicId: 'RPT-2024-001230',
    title: 'Falošná výherná SMS',
    status: 'REJECTED',
    fraudType: 'SMS_SCAM',
    severity: 'LOW',
    reporterEmail: 'tomas.b***@email.com',
    perpetratorName: null,
    amount: 0,
    currency: 'EUR',
    country: 'Slovensko',
    createdAt: '2025-12-10T09:55:00',
    similarCount: 0,
  },
  {
    id: '6',
    publicId: 'RPT-2024-001229',
    title: 'Tech support scam - falošný Microsoft',
    status: 'APPROVED',
    fraudType: 'TECH_SUPPORT',
    severity: 'HIGH',
    reporterEmail: 'eva.m***@gmail.com',
    perpetratorName: 'Microsoft Support',
    amount: 500,
    currency: 'EUR',
    country: 'Slovensko',
    createdAt: '2025-12-09T16:30:00',
    similarCount: 45,
  },
];

const FRAUD_TYPES = [
  { value: 'all', label: 'Všetky typy' },
  { value: 'INVESTMENT_FRAUD', label: 'Investičný podvod' },
  { value: 'ROMANCE_SCAM', label: 'Romance scam' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'RENTAL_FRAUD', label: 'Prenájom' },
  { value: 'SMS_SCAM', label: 'SMS podvod' },
  { value: 'TECH_SUPPORT', label: 'Tech support' },
];

const STATUSES = [
  { value: 'all', label: 'Všetky stavy' },
  { value: 'PENDING', label: 'Čakajúce' },
  { value: 'APPROVED', label: 'Schválené' },
  { value: 'REJECTED', label: 'Zamietnuté' },
];

const SEVERITIES = [
  { value: 'all', label: 'Všetky závažnosti' },
  { value: 'LOW', label: 'Nízka' },
  { value: 'MEDIUM', label: 'Stredná' },
  { value: 'HIGH', label: 'Vysoká' },
  { value: 'CRITICAL', label: 'Kritická' },
];

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [fraudTypeFilter, setFraudTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [reports, setReports] = useState(mockReports);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  useEffect(() => {
    filterReports();
  }, [search, statusFilter, fraudTypeFilter, severityFilter]);

  const filterReports = () => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...mockReports];

      if (search) {
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.publicId.toLowerCase().includes(search.toLowerCase()) ||
            r.reporterEmail.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }

      if (fraudTypeFilter !== 'all') {
        filtered = filtered.filter((r) => r.fraudType === fraudTypeFilter);
      }

      if (severityFilter !== 'all') {
        filtered = filtered.filter((r) => r.severity === severityFilter);
      }

      setReports(filtered);
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return <Badge variant="outline" className="text-gray-600">Nízka</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="text-amber-600">Stredná</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="text-orange-600">Vysoká</Badge>;
      case 'CRITICAL':
        return <Badge variant="outline" className="text-red-600">Kritická</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
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
    setReports(reports.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
  };

  const handleReject = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
  };

  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Hľadať podľa ID, názvu, emailu..."
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

            <Select value={fraudTypeFilter} onValueChange={setFraudTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Typ podvodu" />
              </SelectTrigger>
              <SelectContent>
                {FRAUD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Závažnosť" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((severity) => (
                  <SelectItem key={severity.value} value={severity.value}>
                    {severity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Hlásenia ({reports.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Žiadne hlásenia nenájdené
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Názov</div>
                <div className="col-span-2">Typ / Závažnosť</div>
                <div className="col-span-2">Suma</div>
                <div className="col-span-2">Stav</div>
                <div className="col-span-2">Akcie</div>
              </div>

              {/* Table Body */}
              {paginatedReports.map((report) => (
                <div
                  key={report.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-mono">
                    {report.publicId.split('-').pop()}
                  </div>

                  <div className="col-span-3">
                    <p className="font-medium truncate">{report.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">
                      {FRAUD_TYPES.find(t => t.value === report.fraudType)?.label || report.fraudType}
                    </Badge>
                    {getSeverityBadge(report.severity)}
                  </div>

                  <div className="col-span-2">
                    {report.amount > 0 ? (
                      <span className="font-semibold">
                        {report.amount.toLocaleString()} {report.currency}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                    {report.similarCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {report.similarCount} podobných
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/reports/${report.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {report.status === 'PENDING' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(report.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(report.id)}
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
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Zobrazené {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, reports.length)} z {reports.length}
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
