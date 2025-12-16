'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  Globe,
  CreditCard,
  AlertTriangle,
  Share2,
  Flag,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CommentSection } from '@/components/report/comment-section';

interface ReportDetail {
  id: string;
  title: string;
  description: string;
  fraudType: string;
  country: string;
  city?: string;
  postalCode?: string;
  amount?: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;

  // Perpetrator info (masked based on user role)
  perpetrator: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: string[];
    iban?: string;
    bankAccount?: string;
    cryptoWallet?: string;
  };

  // Evidence
  evidence: {
    id: string;
    type: 'IMAGE' | 'DOCUMENT' | 'VIDEO';
    url: string;
    description?: string;
  }[];

  // Related reports
  similarReports?: {
    id: string;
    title: string;
    similarity: number;
  }[];

  // Statistics
  viewCount: number;
  commentCount: number;
}

// Fraud type labels matching Prisma FraudType enum
const fraudTypeLabels: Record<string, string> = {
  INVESTMENT_FRAUD: 'Investičný podvod',
  ROMANCE_SCAM: 'Romance scam',
  PHISHING: 'Phishing',
  IDENTITY_THEFT: 'Krádež identity',
  ONLINE_SHOPPING_FRAUD: 'E-commerce podvod',
  CRYPTOCURRENCY_SCAM: 'Crypto podvod',
  EMPLOYMENT_SCAM: 'Pracovný podvod',
  RENTAL_SCAM: 'Podvod s prenájmom',
  ADVANCE_FEE_FRAUD: 'Podvod s pôžičkou',
  FAKE_CHARITY: 'Falošná charita',
  TECH_SUPPORT_SCAM: 'Tech support scam',
  LOTTERY_PRIZE_SCAM: 'Loterný podvod',
  OTHER: 'Iný typ',
};

// API Response interface
interface ApiReportResponse {
  id: string;
  public_id: string;
  status: string;
  fraud_type: string;
  summary: string;
  description?: string;
  location?: {
    country?: string;
    city?: string;
  };
  financial_loss?: {
    amount: number;
    currency: string;
  };
  perpetrator?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  digital_footprint?: {
    website_url?: string;
    telegram?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  financial?: {
    iban?: string;
  };
  crypto?: {
    wallet_address?: string;
  };
  evidence: {
    id: string;
    type: string;
    thumbnail_url?: string;
    description?: string;
  }[];
  view_count: number;
  comment_count: number;
  created_at: string;
}

// Transform API response to component format
function transformApiResponse(data: ApiReportResponse): ReportDetail {
  const socialMedia: string[] = [];
  if (data.digital_footprint?.facebook) socialMedia.push(data.digital_footprint.facebook);
  if (data.digital_footprint?.instagram) socialMedia.push(data.digital_footprint.instagram);
  if (data.digital_footprint?.telegram) socialMedia.push(data.digital_footprint.telegram);
  if (data.digital_footprint?.whatsapp) socialMedia.push(data.digital_footprint.whatsapp);

  return {
    id: data.public_id || data.id,
    title: data.summary,
    description: data.description || '',
    fraudType: data.fraud_type?.toUpperCase() || 'OTHER',
    country: data.location?.country || '',
    city: data.location?.city,
    amount: data.financial_loss?.amount,
    currency: data.financial_loss?.currency || 'EUR',
    status: (data.status?.toUpperCase() || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt: data.created_at,
    updatedAt: data.created_at,
    perpetrator: {
      name: data.perpetrator?.full_name,
      phone: data.perpetrator?.phone,
      email: data.perpetrator?.email,
      website: data.digital_footprint?.website_url,
      socialMedia: socialMedia.length > 0 ? socialMedia : undefined,
      iban: data.financial?.iban,
      cryptoWallet: data.crypto?.wallet_address,
    },
    evidence: data.evidence?.map(e => ({
      id: e.id,
      type: (e.type?.toUpperCase() || 'IMAGE') as 'IMAGE' | 'DOCUMENT' | 'VIDEO',
      url: e.thumbnail_url || '',
      description: e.description,
    })) || [],
    viewCount: data.view_count || 0,
    commentCount: data.comment_count || 0,
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params?.id as string;
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!reportId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/reports/${reportId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setReport(null);
          } else {
            throw new Error('Failed to fetch report');
          }
          setIsLoading(false);
          return;
        }

        const data: ApiReportResponse = await response.json();
        setReport(transformApiResponse(data));
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link skopírovaný do schránky');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
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
            <Button asChild>
              <Link href="/search">Späť na vyhľadávanie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report nenájdený</h3>
            <p className="text-sm text-muted-foreground mb-4">Zadaný report neexistuje alebo bol odstránený.</p>
            <Button asChild>
              <Link href="/search">Späť na vyhľadávanie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/search">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na výsledky
          </Link>
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={
                      report.status === 'APPROVED' ? 'success' : report.status === 'PENDING' ? 'warning' : 'destructive'
                    }
                  >
                    {report.status === 'APPROVED'
                      ? 'Overené'
                      : report.status === 'PENDING'
                      ? 'Čaká na overenie'
                      : 'Zamietnuté'}
                  </Badge>
                  <Badge variant="outline">{fraudTypeLabels[report.fraudType]}</Badge>
                </div>
                <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {report.city}, {report.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(report.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {report.viewCount} zobrazení
                  </span>
                </CardDescription>
              </div>

              {report.amount && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Výška škody</div>
                  <div className="text-2xl font-bold text-destructive flex items-center gap-1">
                    <DollarSign className="h-6 w-6" />
                    {formatCurrency(report.amount, report.currency)}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Zdieľať
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Nahlásiť
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Popis incidentu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-line">{report.description}</div>
          </CardContent>
        </Card>

        {/* Perpetrator Info */}
        <Card>
          <CardHeader>
            <CardTitle>Údaje o páchateľovi</CardTitle>
            <CardDescription>Údaje sú maskované podľa vašej úrovne prístupu</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {report.perpetrator.name && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Meno</div>
                  <div className="font-mono">{report.perpetrator.name}</div>
                </div>
              </div>
            )}

            {report.perpetrator.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Telefón</div>
                  <div className="font-mono">{report.perpetrator.phone}</div>
                </div>
              </div>
            )}

            {report.perpetrator.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="font-mono">{report.perpetrator.email}</div>
                </div>
              </div>
            )}

            {report.perpetrator.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Website</div>
                  <div className="font-mono">{report.perpetrator.website}</div>
                </div>
              </div>
            )}

            {report.perpetrator.iban && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">IBAN</div>
                  <div className="font-mono">{report.perpetrator.iban}</div>
                </div>
              </div>
            )}

            {report.perpetrator.cryptoWallet && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Kryptopeňaženka</div>
                  <div className="font-mono text-sm break-all">{report.perpetrator.cryptoWallet}</div>
                </div>
              </div>
            )}

            {report.perpetrator.socialMedia && report.perpetrator.socialMedia.length > 0 && (
              <div className="flex items-start gap-3 md:col-span-2">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium mb-1">Sociálne siete</div>
                  {report.perpetrator.socialMedia.map((social, i) => (
                    <div key={i} className="font-mono text-sm">
                      {social}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidence */}
        {report.evidence.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dôkazy ({report.evidence.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.evidence.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center overflow-hidden">
                      {item.type === 'IMAGE' && item.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.url}
                          alt={item.description || 'Evidence'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl">
                          {item.type === 'IMAGE' ? '🖼️' : item.type === 'DOCUMENT' ? '📄' : '🎥'}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Similar Reports */}
        {report.similarReports && report.similarReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Podobné reporty ({report.similarReports.length})
              </CardTitle>
              <CardDescription>Ostatné hlásenia s podobnými charakteristikami</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.similarReports.map((similar) => (
                  <Link key={similar.id} href={`/reports/${similar.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{similar.title}</span>
                      <Badge variant="outline">{similar.similarity}% podobnosť</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Komentáre ({report.commentCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommentSection reportId={report.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
