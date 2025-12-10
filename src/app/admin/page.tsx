'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with actual API calls
const stats = {
  totalReports: 12543,
  pendingReports: 234,
  approvedReports: 11892,
  rejectedReports: 417,
  totalUsers: 3241,
  activeUsers: 1876,
  reportsThisWeek: 156,
  reportsChange: '+12.5%',
};

const recentReports = [
  {
    id: '1',
    title: 'Investičný podvod s kryptomenami',
    status: 'PENDING',
    submittedAt: '2025-12-10 14:32',
    reporterEmail: 'jan.n***@email.com',
    fraudType: 'INVESTMENT_FRAUD',
  },
  {
    id: '2',
    title: 'Romance scam - dating aplikácia',
    status: 'PENDING',
    submittedAt: '2025-12-10 13:15',
    reporterEmail: 'maria.k***@gmail.com',
    fraudType: 'ROMANCE_SCAM',
  },
  {
    id: '3',
    title: 'Phishing útok - falošná banka',
    status: 'APPROVED',
    submittedAt: '2025-12-10 11:45',
    reporterEmail: 'peter.h***@yahoo.com',
    fraudType: 'PHISHING',
  },
  {
    id: '4',
    title: 'Podvod s prenájmom bytu',
    status: 'PENDING',
    submittedAt: '2025-12-10 10:20',
    reporterEmail: 'anna.s***@outlook.com',
    fraudType: 'RENTAL_FRAUD',
  },
  {
    id: '5',
    title: 'Falošná výherná SMS',
    status: 'REJECTED',
    submittedAt: '2025-12-10 09:55',
    reporterEmail: 'tomas.b***@email.com',
    fraudType: 'SMS_SCAM',
  },
];

const pendingActions = [
  { type: 'Nové hlásenia na schválenie', count: 234, href: '/admin/reports?status=pending' },
  { type: 'Komentáre na moderáciu', count: 45, href: '/admin/comments?status=pending' },
  { type: 'Potenciálne duplikáty', count: 12, href: '/admin/duplicates' },
  { type: 'Nahlásené komentáre', count: 8, href: '/admin/comments?reported=true' },
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
              {((stats.approvedReports / stats.totalReports) * 100).toFixed(1)}% úspešnosť
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
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium truncate">{report.title}</h4>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{report.submittedAt}</span>
                    <span>{report.reporterEmail}</span>
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
        </CardContent>
      </Card>

      {/* Quick Stats Chart Placeholder */}
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
              {/* Chart placeholder */}
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
            <div className="space-y-3">
              {[
                { type: 'Investičné podvody', count: 3421, color: 'bg-red-500' },
                { type: 'Romance scam', count: 2156, color: 'bg-pink-500' },
                { type: 'Phishing', count: 1987, color: 'bg-orange-500' },
                { type: 'Krypto podvody', count: 1893, color: 'bg-amber-500' },
                { type: 'Ostatné', count: 3086, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">{item.type}</span>
                    <span className="text-sm font-medium">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
