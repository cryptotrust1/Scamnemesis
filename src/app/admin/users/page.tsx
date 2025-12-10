'use client';

import { useState, useEffect } from 'react';
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
const mockUsers = [
  {
    id: '1',
    email: 'jan.novak@email.com',
    displayName: 'Ján Novák',
    role: 'ADMIN',
    status: 'ACTIVE',
    reportsCount: 45,
    commentsCount: 123,
    registeredAt: '2024-03-15T10:30:00',
    lastLoginAt: '2025-12-10T09:15:00',
    verified: true,
  },
  {
    id: '2',
    email: 'maria.kovacova@gmail.com',
    displayName: 'Mária Kováčová',
    role: 'GOLD',
    status: 'ACTIVE',
    reportsCount: 28,
    commentsCount: 67,
    registeredAt: '2024-06-20T14:45:00',
    lastLoginAt: '2025-12-09T18:30:00',
    verified: true,
  },
  {
    id: '3',
    email: 'peter.horvat@yahoo.com',
    displayName: 'Peter Horváth',
    role: 'STANDARD',
    status: 'ACTIVE',
    reportsCount: 12,
    commentsCount: 34,
    registeredAt: '2024-08-10T09:00:00',
    lastLoginAt: '2025-12-08T11:20:00',
    verified: true,
  },
  {
    id: '4',
    email: 'anna.svobodova@outlook.com',
    displayName: 'Anna Svobodová',
    role: 'BASIC',
    status: 'ACTIVE',
    reportsCount: 5,
    commentsCount: 15,
    registeredAt: '2024-10-05T16:20:00',
    lastLoginAt: '2025-12-07T14:45:00',
    verified: true,
  },
  {
    id: '5',
    email: 'tomas.benes@email.com',
    displayName: 'Tomáš Beneš',
    role: 'BASIC',
    status: 'BANNED',
    reportsCount: 2,
    commentsCount: 8,
    registeredAt: '2024-11-15T11:30:00',
    lastLoginAt: '2025-11-20T08:00:00',
    verified: false,
  },
  {
    id: '6',
    email: 'eva.majerova@gmail.com',
    displayName: 'Eva Majerová',
    role: 'STANDARD',
    status: 'ACTIVE',
    reportsCount: 18,
    commentsCount: 42,
    registeredAt: '2024-07-25T13:15:00',
    lastLoginAt: '2025-12-10T07:30:00',
    verified: true,
  },
  {
    id: '7',
    email: 'michal.kralik@email.com',
    displayName: null,
    role: 'BASIC',
    status: 'PENDING',
    reportsCount: 0,
    commentsCount: 0,
    registeredAt: '2025-12-09T20:45:00',
    lastLoginAt: null,
    verified: false,
  },
];

const ROLES = [
  { value: 'all', label: 'Všetky role' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
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
  const [users, setUsers] = useState(mockUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);

  useEffect(() => {
    filterUsers();
  }, [search, roleFilter, statusFilter]);

  const filterUsers = () => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...mockUsers];

      if (search) {
        filtered = filtered.filter(
          (u) =>
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.displayName?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        filtered = filtered.filter((u) => u.role === roleFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((u) => u.status === statusFilter);
      }

      setUsers(filtered);
      setCurrentPage(1);
      setIsLoading(false);
    }, 300);
  };

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

  const handleChangeRole = (userId: string, newRole: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleBanUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'BANNED' } : u));
  };

  const handleUnbanUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
  };

  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-sm text-muted-foreground">Celkom používateľov</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {mockUsers.filter(u => u.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-muted-foreground">Aktívnych</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {mockUsers.filter(u => u.status === 'PENDING').length}
            </div>
            <p className="text-sm text-muted-foreground">Čakajúcich na overenie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {mockUsers.filter(u => u.status === 'BANNED').length}
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
          <CardTitle>Používatelia ({users.length})</CardTitle>
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
              {paginatedUsers.map((user) => (
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
                          {user.verified && (
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
                        Registrácia: {formatDate(user.registeredAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {user.reportsCount} hlásení, {user.commentsCount} komentárov
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
                        >
                          Odblokovať
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600"
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
                Zobrazené {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, users.length)} z {users.length}
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
