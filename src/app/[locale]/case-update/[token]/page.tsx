'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  FileText,
  Send,
  Loader2,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CaseStatus {
  code: string;
  label: string;
  color: string;
  description: string;
}

interface CaseReport {
  fraud_type: string;
  summary: string;
  incident_date: string | null;
  created_at: string;
  financial_loss: {
    amount: number;
    currency: string;
  } | null;
  perpetrator: {
    name: string;
    type: string;
  } | null;
}

interface CaseUpdate {
  id: string;
  message: string;
  date: string;
}

interface CaseData {
  case_number: string;
  status: CaseStatus;
  report: CaseReport;
  updates: CaseUpdate[];
  can_add_update: boolean;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-8 w-8 text-yellow-500" />,
  under_review: <Search className="h-8 w-8 text-blue-500" />,
  approved: <CheckCircle className="h-8 w-8 text-green-500" />,
  rejected: <XCircle className="h-8 w-8 text-red-500" />,
  investigating: <AlertTriangle className="h-8 w-8 text-purple-500" />,
  resolved: <CheckCircle className="h-8 w-8 text-green-500" />,
};

const statusColors: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function CaseUpdatePage() {
  const params = useParams();
  const token = params?.token as string;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showUpdates, setShowUpdates] = useState(true);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await fetch(`/api/v1/case-update/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Nepodarilo sa načítať stav prípadu');
          return;
        }

        setCaseData(data);
      } catch {
        setError('Nepodarilo sa pripojiť k serveru');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCaseData();
    }
  }, [token]);

  const handleSubmitUpdate = async () => {
    if (!updateMessage.trim() || updateMessage.length < 10) {
      toast.error('Správa musí mať aspoň 10 znakov');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/case-update/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: updateMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Nepodarilo sa odoslať aktualizáciu');
        return;
      }

      toast.success('Aktualizácia bola úspešne odoslaná');
      setUpdateMessage('');
      fetchCaseData(); // Refresh data
    } catch {
      toast.error('Nepodarilo sa odoslať aktualizáciu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Načítavam stav prípadu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-background dark:from-red-950/20 dark:to-background">
        <div className="container max-w-2xl py-16 px-4">
          <Card className="border-red-200">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Prípad nenájdený</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Uistite sa, že používate správny odkaz z emailu, ktorý ste dostali.
              </p>
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Späť na hlavnú stránku
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      <div className="container max-w-3xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Stav vášho hlásenia</h1>
          <p className="text-muted-foreground">
            Sledujte priebeh spracovania vášho hlásenia o podvode
          </p>
        </div>

        {/* Case Number & Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Číslo prípadu</p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {caseData.case_number}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {statusIcons[caseData.status.code]}
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${
                      statusColors[caseData.status.color]
                    }`}
                  >
                    {caseData.status.label}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
              {caseData.status.description}
            </p>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Zhrnutie hlásenia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Dátum hlásenia</p>
                  <p className="font-medium">{formatDate(caseData.report.created_at)}</p>
                </div>
              </div>

              {caseData.report.incident_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dátum incidentu</p>
                    <p className="font-medium">{formatDate(caseData.report.incident_date)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Typ podvodu</p>
                  <p className="font-medium capitalize">{caseData.report.fraud_type}</p>
                </div>
              </div>

              {caseData.report.financial_loss && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nahlásená strata</p>
                    <p className="font-medium">
                      {caseData.report.financial_loss.amount.toLocaleString('sk-SK')}{' '}
                      {caseData.report.financial_loss.currency}
                    </p>
                  </div>
                </div>
              )}

              {caseData.report.perpetrator && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Podozrivá osoba</p>
                    <p className="font-medium">{caseData.report.perpetrator.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-1">Popis</p>
              <p className="text-sm">{caseData.report.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Updates Section */}
        {caseData.updates.length > 0 && (
          <Card className="mb-6">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowUpdates(!showUpdates)}
            >
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Aktualizácie ({caseData.updates.length})
                </span>
                {showUpdates ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CardTitle>
            </CardHeader>
            {showUpdates && (
              <CardContent className="space-y-4">
                {caseData.updates.map((update) => (
                  <div
                    key={update.id}
                    className="border-l-2 border-primary/30 pl-4 py-2"
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {formatDate(update.date)}
                    </p>
                    <p className="text-sm">{update.message}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* Add Update Form */}
        {caseData.can_add_update && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5" />
                Pridať aktualizáciu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Máte nové informácie alebo dôkazy? Pošlite nám aktualizáciu k vášmu
                prípadu.
              </p>
              <Textarea
                placeholder="Napíšte vašu správu... (minimálne 10 znakov)"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                className="mb-4"
                rows={4}
              />
              <Button
                onClick={handleSubmitUpdate}
                disabled={submitting || updateMessage.length < 10}
                className="w-full md:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Odosielam...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Odoslať aktualizáciu
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Potrebujete pomoc?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ak máte otázky ohľadom vášho prípadu, neváhajte nás kontaktovať.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact-us">
                <Button variant="outline" size="sm">
                  Kontaktovať podporu
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Hlavná stránka
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
