'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  User,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { fetchAuditLog, type AuditLogEntry } from '@/lib/admin/api';

const actionTypes = [
  { value: 'all', label: 'Vsetky akcie' },
  { value: 'REPORT_APPROVED', label: 'Schvalenie hlasenia' },
  { value: 'REPORT_REJECTED', label: 'Zamietnutie hlasenia' },
  { value: 'REPORT_EDITED', label: 'Uprava hlasenia' },
  { value: 'USER_ROLE_CHANGED', label: 'Zmena role' },
  { value: 'USER_BANNED', label: 'Zablokovanie uzivatela' },
  { value: 'COMMENT_DELETED', label: 'Zmazanie komentara' },
  { value: 'DUPLICATE_MERGED', label: 'Zlucenie duplikatov' },
  { value: 'SETTINGS_UPDATED', label: 'Zmena nastaveni' },
  { value: 'LOGIN_SUCCESS', label: 'Uspesne prihlasenie' },
  { value: 'LOGIN_FAILED', label: 'Neuspesne prihlasenie' },
];

const entityTypes = [
  { value: 'all', label: 'Vsetky entity' },
  { value: 'Report', label: 'Hlasenia' },
  { value: 'User', label: 'Pouzivatelia' },
  { value: 'Comment', label: 'Komentare' },
  { value: 'Duplicate', label: 'Duplikaty' },
  { value: 'Settings', label: 'Nastavenia' },
  { value: 'Auth', label: 'Autentifikacia' },
];

function getActionIcon(action: string) {
  if (action.includes('APPROVED') || action.includes('SUCCESS')) return CheckCircle;
  if (action.includes('REJECTED') || action.includes('BANNED') || action.includes('FAILED')) return XCircle;
  if (action.includes('DELETED')) return Trash2;
  if (action.includes('EDITED') || action.includes('UPDATED') || action.includes('CHANGED')) return Edit;
  if (action.includes('MERGED')) return RefreshCw;
  if (action.includes('LOGIN')) return User;
  return History;
}

function getActionColor(action: string): string {
  if (action.includes('APPROVED') || action.includes('SUCCESS')) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
  if (action.includes('REJECTED') || action.includes('BANNED') || action.includes('FAILED')) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  if (action.includes('DELETED')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
  if (action.includes('WARNING')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
  return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
}

function formatAction(action: string): string {
  const actionLabels: Record<string, string> = {
    REPORT_APPROVED: 'Schvalil hlasenie',
    REPORT_REJECTED: 'Zamietol hlasenie',
    REPORT_EDITED: 'Upravil hlasenie',
    USER_ROLE_CHANGED: 'Zmenil rolu',
    USER_BANNED: 'Zablokoval uzivatela',
    COMMENT_DELETED: 'Zmazal komentar',
    DUPLICATE_MERGED: 'Zlucil duplikaty',
    SETTINGS_UPDATED: 'Zmenil nastavenia',
    LOGIN_SUCCESS: 'Prihlasil sa',
    LOGIN_FAILED: 'Neuspesne prihlasenie',
  };
  return actionLabels[action] || action;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Prave teraz';
  if (diffMins < 60) return `Pred ${diffMins} min`;
  if (diffHours < 24) return `Pred ${diffHours} hod`;
  if (diffDays < 7) return `Pred ${diffDays} dnami`;
  return formatDate(dateString);
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // API state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 20;

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAuditLog({
        action: actionFilter,
        entityType: entityFilter,
        page: currentPage,
        pageSize: itemsPerPage,
      });
      setAuditLogs(data.entries);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať audit log');
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityFilter, currentPage]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, entityFilter]);

  // Filter logs locally by search query
  const filteredLogs = auditLogs.filter((log: AuditLogEntry) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.userEmail?.toLowerCase().includes(query) ||
        log.entityId.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        JSON.stringify(log.changes).toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Stats - calculated from all logs on current page
  const stats = {
    total: totalCount,
    today: auditLogs.filter((l: AuditLogEntry) => {
      const date = new Date(l.createdAt);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length,
    approvals: auditLogs.filter((l: AuditLogEntry) => l.action.includes('APPROVED')).length,
    rejections: auditLogs.filter((l: AuditLogEntry) => l.action.includes('REJECTED') || l.action.includes('BANNED')).length,
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={loadAuditLogs} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Skusit znova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <p className="text-muted-foreground">Historia vsetkych administrativnych akcii</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAuditLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Obnovit
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportovat
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Celkom zaznamov</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <AlertTriangle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">Dnes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approvals}</p>
                <p className="text-sm text-muted-foreground">Schvalenia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejections}</p>
                <p className="text-sm text-muted-foreground">Zamietnutia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hladat v logoch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Typ akcie" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Typ entity" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Obdobie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Posledny den</SelectItem>
                <SelectItem value="7d">Poslednych 7 dni</SelectItem>
                <SelectItem value="30d">Poslednych 30 dni</SelectItem>
                <SelectItem value="90d">Poslednych 90 dni</SelectItem>
                <SelectItem value="all">Vsetko</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Zaznamy ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ziadne zaznamy zodpovedajuce filtrom</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const colorClass = getActionColor(log.action);

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  >
                    <div className={cn('p-2 rounded-lg', colorClass)}>
                      <ActionIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.userEmail || 'System'}</span>
                        <span className="text-muted-foreground">{formatAction(log.action)}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{log.entityType}:</span>
                        <code className="bg-muted px-1 rounded text-xs">{log.entityId}</code>
                      </div>

                      {/* Expanded details */}
                      {selectedLog?.id === log.id && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">IP adresa:</span>
                              <span className="ml-2 font-mono">{log.ipAddress || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cas:</span>
                              <span className="ml-2">{formatDate(log.createdAt)}</span>
                            </div>
                          </div>
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Zmeny:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">User ID:</span>
                            <span className="ml-2 text-xs break-all font-mono">{log.userId}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Zobrazene {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} z {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
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
                  disabled={currentPage === totalPages || isLoading}
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
