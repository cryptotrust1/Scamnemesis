'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardStats, type DashboardStats } from '@/lib/admin/api';

// Fraud type labels in Slovak - matching Prisma FraudType enum
const FRAUD_TYPE_LABELS: Record<string, string> = {
  'INVESTMENT_FRAUD': 'Investičné podvody',
  'ROMANCE_SCAM': 'Romance scam',
  'PHISHING': 'Phishing',
  'IDENTITY_THEFT': 'Krádež identity',
  'ONLINE_SHOPPING_FRAUD': 'E-commerce podvody',
  'CRYPTOCURRENCY_SCAM': 'Crypto podvody',
  'TECH_SUPPORT_SCAM': 'Tech support',
  'RENTAL_SCAM': 'Prenájom',
  'EMPLOYMENT_SCAM': 'Pracovné podvody',
  'ADVANCE_FEE_FRAUD': 'Podvody s pôžičkou',
  'LOTTERY_PRIZE_SCAM': 'Loterné podvody',
  'FAKE_CHARITY': 'Falošná charita',
  'OTHER': 'Ostatné',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať štatistiky');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getStatusBadge = (status: string) => {
    // API returns lowercase status
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return <Badge variant="warning">Čaká</Badge>;
      case 'under_review':
        return <Badge variant="secondary">V procese</Badge>;
      case 'approved':
        return <Badge variant="success">Schválené</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Zamietnuté</Badge>;
      case 'merged':
        return <Badge variant="outline">Zlúčené</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-500">Archivované</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={loadStats} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Skúsiť znova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const pendingActions = [
    { type: 'Nové hlásenia na schválenie', count: stats.pendingReports, href: '/admin/reports?status=PENDING' },
    { type: 'Komentáre na moderáciu', count: stats.pendingComments, href: '/admin/comments?status=PENDING' },
    { type: 'Potenciálne duplikáty', count: stats.pendingDuplicates, href: '/admin/duplicates' },
    { type: 'Nahlásené komentáre', count: stats.reportedComments, href: '/admin/comments?reported=true' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkom hlásení</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.reportsChange}</span> tento týždeň
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čakajúce na schválenie</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Vyžaduje pozornosť
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schválené hlásenia</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedReports.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReports > 0
                ? `${((stats.approvedReports / stats.totalReports) * 100).toFixed(1)}% úspešnosť`
                : '0% úspešnosť'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrovaní používatelia</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} aktívnych tento mesiac
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Akcie vyžadujúce pozornosť
          </CardTitle>
          <CardDescription>
            Položky čakajúce na vašu akciu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pendingActions.map((action) => (
              <Link key={action.type} href={action.href}>
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{action.type}</p>
                    <p className="text-2xl font-bold text-primary">{action.count}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Najnovšie hlásenia</CardTitle>
            <CardDescription>
              Posledných 5 prijatých hlásení
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/reports">
              Zobraziť všetky
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Žiadne hlásenia
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium truncate">{report.summary || 'Bez názvu'}</h4>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(report.createdAt).toLocaleString('sk-SK')}</span>
                      {report.reporter?.email && <span>{report.reporter.email}</span>}
                      <Badge variant="outline">{report.fraudType}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/reports/${report.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hlásenia za posledných 7 dní
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{stats.reportsThisWeek}</p>
                <p className="text-sm">nových hlásení tento týždeň</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rozdelenie podľa typu podvodu</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.fraudTypeDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Žiadne dáta
              </div>
            ) : (
              <div className="space-y-3">
                {stats.fraudTypeDistribution.map((item, index) => {
                  const colors = ['bg-red-500', 'bg-pink-500', 'bg-orange-500', 'bg-amber-500', 'bg-gray-500'];
                  // Handle both uppercase (from stats API) and lowercase (from other APIs)
                  const typeKey = item.type?.toUpperCase() || item.type;
                  return (
                    <div key={item.type} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index] || colors[4]}`} />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm truncate">{FRAUD_TYPE_LABELS[typeKey] || item.type}</span>
                        <span className="text-sm font-medium flex-shrink-0">{item.count.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
