'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Ban,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  FileText,
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
import { fetchUsers, updateUserRole, banUser, unbanUser, type User } from '@/lib/admin/api';

const ROLES = [
  { value: 'all', label: 'Všetky role' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'BASIC', label: 'Basic' },
];

const STATUSES = [
  { value: 'all', label: 'Všetky stavy' },
  { value: 'ACTIVE', label: 'Aktívny' },
  { value: 'PENDING', label: 'Čakajúci' },
  { value: 'BANNED', label: 'Zablokovaný' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    banned: 0,
  });

  const itemsPerPage = 10;

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchUsers({
        role: roleFilter,
        status: statusFilter,
        search: search || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      });
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setTotalCount(data.total);

      // Update stats on first load or when filters are reset
      if (roleFilter === 'all' && statusFilter === 'all' && !search) {
        const activeCount = data.users.filter((u: User) => u.status === 'ACTIVE').length;
        const pendingCount = data.users.filter((u: User) => u.status === 'PENDING').length;
        const bannedCount = data.users.filter((u: User) => u.status === 'BANNED').length;
        setStats({
          total: data.total,
          active: activeCount,
          pending: pendingCount,
          banned: bannedCount,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať používateľov');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, search, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, search]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'GOLD':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Shield className="h-3 w-3 mr-1" />
            Gold
          </Badge>
        );
      case 'STANDARD':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            Standard
          </Badge>
        );
      case 'BASIC':
        return (
          <Badge variant="secondary">
            Basic
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Aktívny</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Čakajúci</Badge>;
      case 'BANNED':
        return <Badge variant="destructive">Zablokovaný</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      setIsSubmitting(true);
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as User['role'] } : u));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa zmeniť rolu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Naozaj chcete zablokovať tohto používateľa?')) return;

    try {
      setIsSubmitting(true);
      await banUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'BANNED' as const, isActive: false } : u));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa zablokovať používateľa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      setIsSubmitting(true);
      await unbanUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' as const, isActive: true } : u));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nepodarilo sa odblokovať používateľa');
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
              <Button onClick={loadUsers} variant="outline">
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total || totalCount}</div>
            <p className="text-sm text-muted-foreground">Celkom používateľov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-sm text-muted-foreground">Aktívnych</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {stats.pending}
            </div>
            <p className="text-sm text-muted-foreground">Čakajúcich na overenie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {stats.banned}
            </div>
            <p className="text-sm text-muted-foreground">Zablokovaných</p>
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
                  placeholder="Hľadať podľa emailu alebo mena..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Používatelia ({totalCount})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadUsers}>
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
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Žiadni používatelia nenájdení
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.displayName || 'Bez mena'}
                          {user.emailVerified && (
                            <ShieldCheck className="inline h-4 w-4 ml-1 text-green-600" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Registrácia: {formatDate(user.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {user.reportsCount || 0} hlásení, {user.commentsCount || 0} komentárov
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}

                    <div className="flex items-center gap-1">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleChangeRole(user.id, value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <UserCog className="h-4 w-4 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.filter(r => r.value !== 'all').map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {user.status === 'BANNED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanUser(user.id)}
                          className="text-green-600"
                          disabled={isSubmitting}
                        >
                          Odblokovať
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600"
                          disabled={isSubmitting}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
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
