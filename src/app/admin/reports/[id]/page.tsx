'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  AlertTriangle,
  RefreshCw,
  User,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  Clock,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Perpetrator {
  id: string;
  full_name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

interface Evidence {
  id: string;
  type: string;
  url?: string;
  hash?: string;
}

interface Comment {
  id: string;
  content: string;
  status: string;
  user?: {
    id: string;
    display_name: string;
  };
  created_at: string;
}

interface ReportDetail {
  id: string;
  status: string;
  fraud_type: string;
  summary: string;
  description?: string;
  severity?: string;
  financial_loss?: {
    amount: number;
    currency: string;
  };
  incident_date?: string;
  location?: string;
  perpetrators: Perpetrator[];
  evidence: Evidence[];
  comments: Comment[];
  reporter?: {
    id: string;
    email: string;
    display_name?: string;
  };
  moderated_by?: {
    id: string;
    display_name: string;
  };
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  moderated_at?: string;
}

const FRAUD_TYPES = [
  { value: 'INVESTMENT_FRAUD', label: 'Investicny podvod' },
  { value: 'ROMANCE_SCAM', label: 'Romance scam' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'IDENTITY_THEFT', label: 'Kradez identity' },
  { value: 'ONLINE_SHOPPING_FRAUD', label: 'E-commerce podvod' },
  { value: 'CRYPTOCURRENCY_SCAM', label: 'Crypto podvod' },
  { value: 'EMPLOYMENT_SCAM', label: 'Pracovny podvod' },
  { value: 'RENTAL_SCAM', label: 'Prenajom' },
  { value: 'ADVANCE_FEE_FRAUD', label: 'Podvod s pozickou' },
  { value: 'TECH_SUPPORT_SCAM', label: 'Tech support' },
  { value: 'LOTTERY_PRIZE_SCAM', label: 'Loterny podvod' },
  { value: 'FAKE_CHARITY', label: 'Falosna charita' },
  { value: 'OTHER', label: 'Ostatne' },
];

const SEVERITIES = [
  { value: 'LOW', label: 'Nizka' },
  { value: 'MEDIUM', label: 'Stredna' },
  { value: 'HIGH', label: 'Vysoka' },
  { value: 'CRITICAL', label: 'Kriticka' },
];

const STATUSES = [
  { value: 'PENDING', label: 'Cakajuce' },
  { value: 'APPROVED', label: 'Schvalene' },
  { value: 'REJECTED', label: 'Zamietnute' },
  { value: 'UNDER_REVIEW', label: 'V kontrole' },
];

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fraud_type: '',
    severity: '',
    status: '',
    summary: '',
    description: '',
    admin_notes: '',
  });

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadReport = useCallback(async () => {
    if (!reportId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/v1/admin/reports/${reportId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Hlasenie nebolo najdene');
        }
        throw new Error('Nepodarilo sa nacitat hlasenie');
      }

      const data = await response.json();
      setReport(data);
      setEditForm({
        fraud_type: data.fraud_type?.toUpperCase() || '',
        severity: data.severity?.toUpperCase() || '',
        status: data.status?.toUpperCase() || '',
        summary: data.summary || '',
        description: data.description || '',
        admin_notes: data.admin_notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleApprove = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/v1/admin/reports/${reportId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa schvalit hlasenie');
      }

      await loadReport();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/v1/admin/reports/${reportId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa zamietnut hlasenie');
      }

      setRejectDialogOpen(false);
      await loadReport();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/v1/admin/reports/${reportId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fraud_type: editForm.fraud_type.toLowerCase(),
          severity: editForm.severity,
          status: editForm.status,
          summary: editForm.summary,
          description: editForm.description,
          admin_notes: editForm.admin_notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa ulozit zmeny');
      }

      setIsEditing(false);
      await loadReport();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'PENDING':
        return <Badge variant="warning">Caka</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="secondary">V kontrole</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Schvalene</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Zamietnute</Badge>;
      case 'MERGED':
        return <Badge variant="outline">Zlucene</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline" className="text-gray-500">Archivovane</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    const s = severity.toUpperCase();
    switch (s) {
      case 'LOW':
        return <Badge variant="outline" className="text-gray-600">Nizka</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="text-amber-600">Stredna</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="text-orange-600">Vysoka</Badge>;
      case 'CRITICAL':
        return <Badge variant="outline" className="text-red-600">Kriticka</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-destructive">{error}</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Spat
              </Button>
              <Button onClick={loadReport}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Skusit znova
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail hlasenia</h1>
            <p className="text-muted-foreground">ID: {reportId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.status.toUpperCase() === 'PENDING' && (
            <>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={handleApprove}
                disabled={isSaving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Schvalit
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isSaving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Zamietnut
              </Button>
            </>
          )}
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Zrusit
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Ulozit
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Upravit
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Stav:</span>
              {getStatusBadge(report.status)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Zavaznost:</span>
              {getSeverityBadge(report.severity)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Typ podvodu:</span>
              <Badge variant="outline">
                {FRAUD_TYPES.find(t => t.value === report.fraud_type?.toUpperCase())?.label || report.fraud_type}
              </Badge>
            </div>
            {report.financial_loss && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {report.financial_loss.amount.toLocaleString()} {report.financial_loss.currency}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detaily</TabsTrigger>
          <TabsTrigger value="perpetrators">Pachatelia ({report.perpetrators.length})</TabsTrigger>
          <TabsTrigger value="evidence">Dokazy ({report.evidence.length})</TabsTrigger>
          <TabsTrigger value="comments">Komentare ({report.comments.length})</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Upravit hlasenie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Typ podvodu</Label>
                    <Select
                      value={editForm.fraud_type}
                      onValueChange={(v) => setEditForm({ ...editForm, fraud_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAUD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zavaznost</Label>
                    <Select
                      value={editForm.severity}
                      onValueChange={(v) => setEditForm({ ...editForm, severity: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stav</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zhrnutie</Label>
                  <Input
                    value={editForm.summary}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Popis</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Admin poznamky (interne)</Label>
                  <Textarea
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                    rows={3}
                    placeholder="Poznamky viditelne len pre adminov..."
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Zhrnutie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{report.summary}</p>
                </CardContent>
              </Card>

              {report.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Popis incidentu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{report.description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Casove udaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vytvorene:</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aktualizovane:</span>
                      <span>{formatDate(report.updated_at)}</span>
                    </div>
                    {report.incident_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Datum incidentu:</span>
                        <span>{formatDate(report.incident_date)}</span>
                      </div>
                    )}
                    {report.published_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Publikovane:</span>
                        <span>{formatDate(report.published_at)}</span>
                      </div>
                    )}
                    {report.moderated_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Moderovane:</span>
                        <span>{formatDate(report.moderated_at)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Reporter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {report.reporter ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meno:</span>
                          <span>{report.reporter.display_name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{report.reporter.email}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Anonymne hlasenie</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {(report.admin_notes || report.rejection_reason) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin poznamky</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {report.admin_notes && (
                      <div>
                        <Label className="text-muted-foreground">Interne poznamky:</Label>
                        <p className="mt-1">{report.admin_notes}</p>
                      </div>
                    )}
                    {report.rejection_reason && (
                      <div>
                        <Label className="text-destructive">Dovod zamietnutia:</Label>
                        <p className="mt-1 text-destructive">{report.rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="perpetrators" className="space-y-4">
          {report.perpetrators.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Ziadni pachatelia nie su evidovani
              </CardContent>
            </Card>
          ) : (
            report.perpetrators.map((perp, index) => (
              <Card key={perp.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Pachatel #{index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {perp.full_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{perp.full_name}</span>
                      </div>
                    )}
                    {perp.nickname && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Prezyvka:</span>
                        <span>{perp.nickname}</span>
                      </div>
                    )}
                    {perp.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{perp.email}</span>
                      </div>
                    )}
                    {perp.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{perp.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          {report.evidence.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Ziadne dokazy nie su pripoene
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.evidence.map((ev) => (
                <Card key={ev.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="capitalize">{ev.type}</span>
                      </div>
                      {ev.url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={ev.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                    {ev.hash && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono truncate">
                        Hash: {ev.hash}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {report.comments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Ziadne komentare
              </CardContent>
            </Card>
          ) : (
            report.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{comment.user?.display_name || 'Anonymny'}</span>
                      <Badge variant="outline" className="text-xs">{comment.status}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historia zmien</CardTitle>
              <CardDescription>Audit log pre toto hlasenie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-32 text-muted-foreground">{formatDate(report.created_at)}</div>
                  <Badge>Vytvorene</Badge>
                  <span>Hlasenie bolo vytvorene</span>
                </div>
                {report.moderated_at && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-32 text-muted-foreground">{formatDate(report.moderated_at)}</div>
                    <Badge variant={report.status === 'APPROVED' ? 'success' : 'destructive'}>
                      {report.status === 'APPROVED' ? 'Schvalene' : 'Zamietnute'}
                    </Badge>
                    <span>
                      Moderoval: {report.moderated_by?.display_name || 'System'}
                    </span>
                  </div>
                )}
                {report.published_at && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-32 text-muted-foreground">{formatDate(report.published_at)}</div>
                    <Badge variant="success">Publikovane</Badge>
                    <span>Hlasenie bolo zverejnene</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zamietnut hlasenie</DialogTitle>
            <DialogDescription>
              Zadajte dovod zamietnutia hlasenia. Tato informacia bude zaznamenana v audit logu.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Dovod zamietnutia..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Zrusit
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSaving}
            >
              Zamietnut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
