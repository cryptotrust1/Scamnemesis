'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Copy,
  Merge,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
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

// Mock data
const mockDuplicates = [
  {
    id: 'dup1',
    confidence: 95,
    matchType: 'PHONE_AND_IBAN',
    status: 'PENDING',
    createdAt: '2025-12-10T14:00:00',
    reports: [
      {
        id: 'r1',
        publicId: 'RPT-2024-001234',
        title: 'Investičný podvod - falošná platforma TradeCoin',
        fraudType: 'INVESTMENT_FRAUD',
        perpetratorName: 'Michael Novák',
        perpetratorPhone: '+421 905 123 456',
        perpetratorIban: 'SK12 1234 5678 9012 3456',
        amount: 15000,
        currency: 'EUR',
        createdAt: '2025-12-09',
        reporterCount: 1,
      },
      {
        id: 'r2',
        publicId: 'RPT-2024-001220',
        title: 'Krypto podvod - TradeCoin investičný program',
        fraudType: 'CRYPTO_SCAM',
        perpetratorName: 'Michal Novak',
        perpetratorPhone: '+421 905 123 456',
        perpetratorIban: 'SK12 1234 5678 9012 3456',
        amount: 8500,
        currency: 'EUR',
        createdAt: '2025-12-08',
        reporterCount: 1,
      },
      {
        id: 'r3',
        publicId: 'RPT-2024-001198',
        title: 'Bitcoin investícia - podvod na Facebooku',
        fraudType: 'INVESTMENT_FRAUD',
        perpetratorName: 'M. Novák',
        perpetratorPhone: '+421905123456',
        perpetratorIban: 'SK1212345678901234 56',
        amount: 5000,
        currency: 'EUR',
        createdAt: '2025-12-05',
        reporterCount: 1,
      },
    ],
  },
  {
    id: 'dup2',
    confidence: 87,
    matchType: 'EMAIL_SIMILARITY',
    status: 'PENDING',
    createdAt: '2025-12-10T10:30:00',
    reports: [
      {
        id: 'r4',
        publicId: 'RPT-2024-001230',
        title: 'Romance scam - Tinder zoznamka',
        fraudType: 'ROMANCE_SCAM',
        perpetratorName: 'Katarína Dvoráková',
        perpetratorEmail: 'katka.dvorakova@email.com',
        amount: 12000,
        currency: 'EUR',
        createdAt: '2025-12-07',
        reporterCount: 1,
      },
      {
        id: 'r5',
        publicId: 'RPT-2024-001215',
        title: 'Romantický podvod - žiadosť o peniaze',
        fraudType: 'ROMANCE_SCAM',
        perpetratorName: 'Katarína D.',
        perpetratorEmail: 'k.dvorakova@email.com',
        amount: 8000,
        currency: 'EUR',
        createdAt: '2025-12-04',
        reporterCount: 1,
      },
    ],
  },
  {
    id: 'dup3',
    confidence: 78,
    matchType: 'NAME_AND_LOCATION',
    status: 'MERGED',
    createdAt: '2025-12-09T15:00:00',
    mergedAt: '2025-12-09T16:30:00',
    reports: [
      {
        id: 'r6',
        publicId: 'RPT-2024-001180',
        title: 'Tech support scam - falošný Microsoft',
        fraudType: 'TECH_SUPPORT',
        perpetratorName: 'Microsoft Support Team',
        amount: 500,
        currency: 'EUR',
        createdAt: '2025-12-01',
        reporterCount: 3,
        isPrimary: true,
      },
      {
        id: 'r7',
        publicId: 'RPT-2024-001175',
        title: 'Podvod - hovory od Microsoft supportu',
        fraudType: 'TECH_SUPPORT',
        perpetratorName: 'Microsoft Technical Support',
        amount: 350,
        currency: 'EUR',
        createdAt: '2025-11-30',
        reporterCount: 1,
      },
    ],
  },
];

const STATUSES = [
  { value: 'all', label: 'Všetky' },
  { value: 'PENDING', label: 'Čakajúce' },
  { value: 'MERGED', label: 'Zlúčené' },
  { value: 'DISMISSED', label: 'Zamietnuté' },
];

export default function AdminDuplicatesPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [duplicates, setDuplicates] = useState(mockDuplicates);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...mockDuplicates];

      if (statusFilter !== 'all') {
        filtered = filtered.filter((d) => d.status === statusFilter);
      }

      setDuplicates(filtered);
      setIsLoading(false);
    }, 300);
  }, [statusFilter]);


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

  const handleMerge = (clusterId: string, _primaryId: string) => {
    setDuplicates(duplicates.map(d =>
      d.id === clusterId ? { ...d, status: 'MERGED', mergedAt: new Date().toISOString() } : d
    ));
  };

  const handleDismiss = (clusterId: string) => {
    setDuplicates(duplicates.map(d =>
      d.id === clusterId ? { ...d, status: 'DISMISSED' } : d
    ));
  };

  const pendingCount = mockDuplicates.filter(d => d.status === 'PENDING').length;
  const totalReportsInClusters = mockDuplicates.reduce((sum, d) => sum + d.reports.length, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Čakajúcich na riešenie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockDuplicates.length}</div>
            <p className="text-sm text-muted-foreground">Celkom skupín duplikátov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalReportsInClusters}</div>
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
                            'isPrimary' in report && report.isPrimary ? 'border-green-300 bg-green-50/50' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-muted-foreground">
                                  {report.publicId}
                                </span>
                                {'isPrimary' in report && report.isPrimary && (
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
                                {'perpetratorPhone' in report && report.perpetratorPhone && (
                                  <div>
                                    <span className="font-medium">Tel:</span> {report.perpetratorPhone}
                                  </div>
                                )}
                                {'perpetratorEmail' in report && report.perpetratorEmail && (
                                  <div>
                                    <span className="font-medium">Email:</span> {report.perpetratorEmail}
                                  </div>
                                )}
                                {'perpetratorIban' in report && report.perpetratorIban && (
                                  <div>
                                    <span className="font-medium">IBAN:</span> {report.perpetratorIban}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Suma:</span> {report.amount.toLocaleString()} {report.currency}
                                </div>
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
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Nie sú duplikáty
                        </Button>
                        <Button
                          onClick={() => handleMerge(cluster.id, cluster.reports[0].id)}
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
