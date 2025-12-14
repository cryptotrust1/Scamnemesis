'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Copy,
  Merge,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchDuplicates, mergeDuplicates, dismissDuplicates, type DuplicateCluster } from '@/lib/admin/api';

const STATUSES = [
  { value: 'all', label: 'Všetky' },
  { value: 'PENDING', label: 'Čakajúce' },
  { value: 'MERGED', label: 'Zlúčené' },
  { value: 'DISMISSED', label: 'Zamietnuté' },
];

export default function AdminDuplicatesPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [duplicates, setDuplicates] = useState<DuplicateCluster[]>([]);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    total: 0,
    reportsInClusters: 0,
  });

  const loadDuplicates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchDuplicates(statusFilter);
      setDuplicates(data.duplicates);

      // Update stats
      const pendingCount = data.duplicates.filter((d: DuplicateCluster) => d.status === 'PENDING').length;
      const reportsCount = data.duplicates.reduce((sum: number, d: DuplicateCluster) => sum + d.reports.length, 0);
      setStats({
        pending: pendingCount,
        total: data.total,
        reportsInClusters: reportsCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať duplikáty');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadDuplicates();
  }, [loadDuplicates]);


  const toggleExpanded = (id: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Čaká na riešenie</Badge>;
      case 'MERGED':
        return <Badge variant="success">Zlúčené</Badge>;
      case 'DISMISSED':
        return <Badge variant="secondary">Zamietnuté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-red-600">Vysoká zhoda ({confidence}%)</Badge>;
    } else if (confidence >= 75) {
      return <Badge className="bg-orange-500">Stredná zhoda ({confidence}%)</Badge>;
    } else {
      return <Badge className="bg-yellow-500">Nízka zhoda ({confidence}%)</Badge>;
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    const labels: Record<string, string> = {
      'PHONE_AND_IBAN': 'Telefón + IBAN',
      'EMAIL_SIMILARITY': 'Podobný email',
      'NAME_AND_LOCATION': 'Meno + lokalita',
      'IBAN_EXACT': 'Rovnaký IBAN',
      'PHONE_EXACT': 'Rovnaký telefón',
      'EMAIL_EXACT': 'Rovnaký email',
    };
    return labels[matchType] || matchType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleMerge = async (clusterId: string, primaryId: string) => {
    try {
      setIsSubmitting(true);
      await mergeDuplicates(clusterId, primaryId);
      setDuplicates(duplicates.map(d =>
        d.id === clusterId ? { ...d, status: 'MERGED' as const, mergedAt: new Date().toISOString() } : d
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa zlúčiť duplikáty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async (clusterId: string) => {
    try {
      setIsSubmitting(true);
      await dismissDuplicates(clusterId);
      setDuplicates(duplicates.map(d =>
        d.id === clusterId ? { ...d, status: 'DISMISSED' as const } : d
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa zamietnuť duplikáty');
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
              <Button onClick={loadDuplicates} variant="outline">
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
            <p className="text-sm text-muted-foreground">Čakajúcich na riešenie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Celkom skupín duplikátov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.reportsInClusters}</div>
            <p className="text-sm text-muted-foreground">Hlásení v skupinách</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Copy className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Potenciálne duplikáty</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadDuplicates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Obnoviť
          </Button>
        </div>
      </div>

      {/* Duplicates List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : duplicates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Žiadne duplikáty nenájdené</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {duplicates.map((cluster) => {
            const isExpanded = expandedClusters.has(cluster.id);

            return (
              <Card key={cluster.id} className={cluster.status === 'PENDING' ? 'border-amber-200' : ''}>
                <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(cluster.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {cluster.status === 'PENDING' && (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {cluster.reports.length} možných duplikátov
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Typ zhody: {getMatchTypeLabel(cluster.matchType)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getConfidenceBadge(cluster.confidence)}
                      {getStatusBadge(cluster.status)}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {cluster.reports.map((report) => (
                        <div
                          key={report.id}
                          className={`p-4 rounded-lg border ${
                            report.isPrimary ? 'border-green-300 bg-green-50/50' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-muted-foreground">
                                  {report.publicId}
                                </span>
                                {report.isPrimary && (
                                  <Badge variant="success" className="text-xs">Primárne</Badge>
                                )}
                                <Badge variant="outline">{report.fraudType}</Badge>
                              </div>
                              <h4 className="font-medium mb-2">{report.title}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                {report.perpetratorName && (
                                  <div>
                                    <span className="font-medium">Meno:</span> {report.perpetratorName}
                                  </div>
                                )}
                                {report.perpetratorPhone && (
                                  <div>
                                    <span className="font-medium">Tel:</span> {report.perpetratorPhone}
                                  </div>
                                )}
                                {report.perpetratorEmail && (
                                  <div>
                                    <span className="font-medium">Email:</span> {report.perpetratorEmail}
                                  </div>
                                )}
                                {report.perpetratorIban && (
                                  <div>
                                    <span className="font-medium">IBAN:</span> {report.perpetratorIban}
                                  </div>
                                )}
                                {report.amount !== undefined && (
                                  <div>
                                    <span className="font-medium">Suma:</span> {report.amount.toLocaleString()} {report.currency || 'EUR'}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Dátum:</span> {formatDate(report.createdAt)}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/reports/${report.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {cluster.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleDismiss(cluster.id)}
                          disabled={isSubmitting}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Nie sú duplikáty
                        </Button>
                        <Button
                          onClick={() => handleMerge(cluster.id, cluster.reports[0].id)}
                          disabled={isSubmitting}
                        >
                          <Merge className="h-4 w-4 mr-2" />
                          Zlúčiť hlásenia
                        </Button>
                      </div>
                    )}

                    {cluster.status === 'MERGED' && cluster.mergedAt && (
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        Zlúčené {formatDate(cluster.mergedAt)}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
