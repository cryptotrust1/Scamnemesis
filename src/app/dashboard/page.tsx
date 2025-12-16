'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  FileText,
  Settings,
  LogOut,
  Shield,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

interface UserReport {
  id: string;
  publicId: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fraudType: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user data - auth is handled via HttpOnly cookies
      const userResponse = await fetch('/api/v1/auth/me', {
        credentials: 'include', // Important: Include cookies in request
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          // Not authenticated - redirect to login
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch user's reports
      const reportsResponse = await fetch('/api/v1/reports?reporter=me&limit=10', {
        credentials: 'include', // Include cookies for auth
      });

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Logout - server will clear HttpOnly cookies
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies so server can clear them
      });
    } catch {
      // Ignore errors during logout
    } finally {
      toast.success('Úspešne odhlásený');
      router.push('/');
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        toast.success('Verifikačný email bol odoslaný');
      } else {
        toast.error('Nepodarilo sa odoslať verifikačný email');
      }
    } catch {
      toast.error('Chyba pri odosielaní');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Čaká na schválenie
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Schválené
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Zamietnuté
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nastala chyba</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUserData}>Skúsiť znova</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Vitajte späť, {user.name || user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Odhlásiť sa
          </Button>
        </div>

        {/* Email Verification Warning */}
        {!user.email_verified && (
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Váš email nie je overený
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Overte svoj email pre plný prístup k funkciám
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleResendVerification}>
                Odoslať verifikačný email
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Link href="/report/new" className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Nové hlásenie</h3>
                <p className="text-sm text-muted-foreground">Nahlásiť podvod</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Link href="/search" className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Vyhľadať</h3>
                <p className="text-sm text-muted-foreground">Hľadať v databáze</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Link href="/dashboard/settings" className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Nastavenia</h3>
                <p className="text-sm text-muted-foreground">Upraviť profil</p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informácie o účte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meno</p>
                <p className="font-medium">{user.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rola</p>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Členstvo od</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('sk-SK')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Moje hlásenia
              </CardTitle>
              <CardDescription>Posledných 10 hlásení</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/report/new">
                <Plus className="h-4 w-4 mr-2" />
                Nové hlásenie
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Zatiaľ nemáte žiadne hlásenia</p>
                <Button className="mt-4" asChild>
                  <Link href="/report/new">Vytvoriť prvé hlásenie</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{report.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{new Date(report.createdAt).toLocaleDateString('sk-SK')}</span>
                        <Badge variant="outline">{report.fraudType}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {getStatusBadge(report.status)}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/reports/${report.publicId || report.id}`}>
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
      </div>
    </div>
  );
}
