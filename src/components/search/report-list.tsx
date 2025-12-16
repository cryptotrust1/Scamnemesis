import Link from 'next/link';
import { MapPin, Calendar, DollarSign, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

export interface Report {
  id: string;
  title: string;
  description: string;
  fraudType: string;
  country: string;
  city?: string;
  amount?: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  perpetratorName?: string;
  perpetratorPhone?: string;
  perpetratorEmail?: string;
  similarReportsCount?: number;
}

interface ReportListProps {
  reports: Report[];
  isLoading?: boolean;
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
  PYRAMID_MLM_SCHEME: 'Pyramídová schéma',
  PONZI_SCHEME: 'Ponziho schéma',
  WIRE_FRAUD: 'Podvod s prevodom',
  OTHER: 'Iný typ',
};

// Fraud type colors matching Prisma FraudType enum
const fraudTypeColors: Record<string, string> = {
  INVESTMENT_FRAUD: 'bg-red-500',
  ROMANCE_SCAM: 'bg-pink-500',
  PHISHING: 'bg-orange-500',
  IDENTITY_THEFT: 'bg-purple-500',
  ONLINE_SHOPPING_FRAUD: 'bg-cyan-500',
  CRYPTOCURRENCY_SCAM: 'bg-amber-500',
  EMPLOYMENT_SCAM: 'bg-blue-500',
  RENTAL_SCAM: 'bg-green-500',
  ADVANCE_FEE_FRAUD: 'bg-yellow-500',
  FAKE_CHARITY: 'bg-rose-500',
  TECH_SUPPORT_SCAM: 'bg-indigo-500',
  LOTTERY_PRIZE_SCAM: 'bg-emerald-500',
  OTHER: 'bg-gray-500',
};

export function ReportList({ reports, isLoading }: ReportListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Žiadne výsledky</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Pre zadané kritériá sa nenašli žiadne reporty. Skúste zmeniť filtre alebo vyhľadávací dotaz.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Link key={report.id} href={`/reports/${report.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {/* Status Badge */}
                    <Badge
                      variant={
                        report.status === 'APPROVED'
                          ? 'success'
                          : report.status === 'PENDING'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {report.status === 'APPROVED'
                        ? 'Overené'
                        : report.status === 'PENDING'
                        ? 'Čaká na overenie'
                        : 'Zamietnuté'}
                    </Badge>

                    {/* Fraud Type Badge */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${fraudTypeColors[report.fraudType] || 'bg-gray-500'}`} />
                      <span className="text-xs text-muted-foreground">
                        {fraudTypeLabels[report.fraudType] || report.fraudType}
                      </span>
                    </div>

                    {/* Similar Reports Count */}
                    {report.similarReportsCount && report.similarReportsCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {report.similarReportsCount} podobných
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg mb-1">{report.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{report.description}</CardDescription>
                </div>

                {/* Amount */}
                {report.amount && report.amount > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold text-destructive">
                      <DollarSign className="h-5 w-5" />
                      {formatCurrency(report.amount, report.currency)}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {/* Location */}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {report.city ? `${report.city}, ${report.country}` : report.country}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(report.createdAt)}</span>
                </div>

                {/* Perpetrator Info (masked) */}
                {report.perpetratorName && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Páchateľ:</span>
                    <span>{report.perpetratorName}</span>
                  </div>
                )}

                {report.perpetratorPhone && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Tel:</span>
                    <span className="font-mono">{report.perpetratorPhone}</span>
                  </div>
                )}

                {report.perpetratorEmail && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Email:</span>
                    <span className="font-mono">{report.perpetratorEmail}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
