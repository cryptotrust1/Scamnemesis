'use client';

import Link from 'next/link';
import { MapPin, Calendar, DollarSign, AlertTriangle, Users, Phone, Mail, User, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
const fraudTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  INVESTMENT_FRAUD: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  ROMANCE_SCAM: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' },
  PHISHING: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  IDENTITY_THEFT: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  ONLINE_SHOPPING_FRAUD: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  CRYPTOCURRENCY_SCAM: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  EMPLOYMENT_SCAM: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  RENTAL_SCAM: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  ADVANCE_FEE_FRAUD: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  FAKE_CHARITY: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  TECH_SUPPORT_SCAM: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  LOTTERY_PRIZE_SCAM: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  OTHER: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
};

// Status configurations
const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive'; bg: string }> = {
  APPROVED: { label: 'Overené', variant: 'success', bg: 'bg-green-100 text-green-800 border-green-200' },
  PENDING: { label: 'Čaká', variant: 'warning', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  REJECTED: { label: 'Zamietnuté', variant: 'destructive', bg: 'bg-red-100 text-red-800 border-red-200' },
};

export function ReportList({ reports, isLoading }: ReportListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5">
                {/* Header skeleton */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                  <div className="h-6 w-24 bg-slate-200 rounded-full" />
                </div>
                {/* Title skeleton */}
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                {/* Description skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                </div>
                {/* Footer skeleton */}
                <div className="flex gap-4">
                  <div className="h-4 bg-slate-100 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="border-2 border-dashed border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <AlertTriangle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Žiadne výsledky</h3>
          <p className="text-sm text-slate-500 text-center max-w-md mb-6">
            Pre zadané kritériá sa nenašli žiadne reporty. Skúste zmeniť filtre alebo vyhľadávací dotaz.
          </p>
          <div className="text-sm text-slate-400">
            <p className="mb-2">Tipy pre lepšie výsledky:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Skúste menej filtrov</li>
              <li>Použite kratší vyhľadávací výraz</li>
              <li>Prepnite na fuzzy vyhľadávanie</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const fraudColors = fraudTypeColors[report.fraudType?.toUpperCase()] || fraudTypeColors.OTHER;
        const status = statusConfig[report.status?.toUpperCase()] || statusConfig.PENDING;
        const fraudLabel = fraudTypeLabels[report.fraudType?.toUpperCase()] || report.fraudType || 'Neznámy typ';

        return (
          <Link key={report.id} href={`/reports/${report.id}`} className="block group">
            <Card className="overflow-hidden border-2 border-slate-100 hover:border-[#0E74FF]/30 hover:shadow-lg transition-all duration-300 bg-white">
              <CardContent className="p-0">
                {/* Top colored bar */}
                <div className={`h-1.5 ${fraudColors.dot}`} />

                <div className="p-5">
                  {/* Header Row - Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg}`}>
                      {status.label}
                    </span>

                    {/* Fraud Type Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${fraudColors.bg} ${fraudColors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${fraudColors.dot}`} />
                      <span className="truncate max-w-[140px]">{fraudLabel}</span>
                    </span>

                    {/* Similar Reports Count */}
                    {report.similarReportsCount && report.similarReportsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <Users className="h-3 w-3" />
                        {report.similarReportsCount} podobných
                      </span>
                    )}

                    {/* Amount - Show prominently on mobile */}
                    {report.amount && report.amount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 ml-auto">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(report.amount, report.currency)}
                      </span>
                    )}
                  </div>

                  {/* Title - with proper truncation */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#0E74FF] transition-colors line-clamp-2">
                    {report.title || 'Bez názvu'}
                  </h3>

                  {/* Description - with 2 line clamp */}
                  {report.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-slate-500 min-w-0">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate">
                        {report.city ? `${report.city}, ${report.country}` : report.country || 'Neznáma lokalita'}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-slate-500 min-w-0">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{formatDate(report.createdAt)}</span>
                    </div>

                    {/* Perpetrator Name */}
                    {report.perpetratorName && (
                      <div className="flex items-center gap-2 text-slate-500 min-w-0">
                        <User className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className="truncate font-medium text-slate-700">{report.perpetratorName}</span>
                      </div>
                    )}

                    {/* Perpetrator Phone */}
                    {report.perpetratorPhone && (
                      <div className="flex items-center gap-2 text-slate-500 min-w-0">
                        <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className="truncate font-mono text-xs">{report.perpetratorPhone}</span>
                      </div>
                    )}

                    {/* Perpetrator Email */}
                    {report.perpetratorEmail && (
                      <div className="flex items-center gap-2 text-slate-500 min-w-0 sm:col-span-2">
                        <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className="truncate font-mono text-xs">{report.perpetratorEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      ID: {report.id.substring(0, 8)}...
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0E74FF] group-hover:gap-2 transition-all">
                      Zobraziť detail
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
