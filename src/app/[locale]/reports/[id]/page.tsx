'use client';

import { useState, useEffect, useRef } from 'react';
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
  Building2,
  Car,
  Wallet,
  Landmark,
  Download,
  Eye,
  FileText,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  perpetrator: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: string[];
    iban?: string;
    bankAccount?: string;
    bankName?: string;
    bankCountry?: string;
    cryptoWallet?: string;
    cryptoBlockchain?: string;
    cryptoExchange?: string;
  };
  company?: {
    name?: string;
    vatTaxId?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  };
  vehicle?: {
    make?: string;
    model?: string;
    color?: string;
    licensePlate?: string;
    vin?: string;
    registeredOwner?: string;
  };
  evidence: {
    id: string;
    type: 'IMAGE' | 'DOCUMENT' | 'VIDEO';
    url: string;
    thumbnailUrl?: string;
    description?: string;
  }[];
  similarReports?: {
    id: string;
    title: string;
    similarity: number;
  }[];
  viewCount: number;
  commentCount: number;
}

// Fraud type configuration with soft colors
const fraudTypeConfig: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  INVESTMENT_FRAUD: { label: 'Investičný podvod', bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  ROMANCE_SCAM: { label: 'Romance scam', bgColor: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'border-pink-200' },
  PHISHING: { label: 'Phishing', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  IDENTITY_THEFT: { label: 'Krádež identity', bgColor: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'border-violet-200' },
  ONLINE_SHOPPING_FRAUD: { label: 'E-commerce podvod', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  CRYPTOCURRENCY_SCAM: { label: 'Crypto podvod', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  EMPLOYMENT_SCAM: { label: 'Pracovný podvod', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  RENTAL_SCAM: { label: 'Podvod s prenájmom', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  ADVANCE_FEE_FRAUD: { label: 'Podvod s pôžičkou', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
  FAKE_CHARITY: { label: 'Falošná charita', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  TECH_SUPPORT_SCAM: { label: 'Tech support scam', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  LOTTERY_PRIZE_SCAM: { label: 'Loterný podvod', bgColor: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'border-teal-200' },
  OTHER: { label: 'Iný typ', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
};

// Status configuration
const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  APPROVED: { label: 'Overené', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  PENDING: { label: 'Čaká na overenie', bgColor: 'bg-amber-50', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
  REJECTED: { label: 'Zamietnuté', bgColor: 'bg-red-50', textColor: 'text-red-700', dotColor: 'bg-red-500' },
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
    tiktok?: string;
    twitter?: string;
  };
  financial?: {
    iban?: string;
    account_holder?: string;
    bank_name?: string;
    bank_country?: string;
  };
  crypto?: {
    wallet_address?: string;
    blockchain?: string;
    exchange?: string;
  };
  company?: {
    name?: string;
    vat_tax_id?: string;
    address?: {
      street?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  };
  vehicle?: {
    make?: string;
    model?: string;
    color?: string;
    license_plate?: string;
    vin?: string;
    registered_owner?: string;
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

function transformApiResponse(data: ApiReportResponse): ReportDetail {
  const socialMedia: string[] = [];
  if (data.digital_footprint?.facebook) socialMedia.push(data.digital_footprint.facebook);
  if (data.digital_footprint?.instagram) socialMedia.push(data.digital_footprint.instagram);
  if (data.digital_footprint?.telegram) socialMedia.push(data.digital_footprint.telegram);
  if (data.digital_footprint?.whatsapp) socialMedia.push(data.digital_footprint.whatsapp);
  if (data.digital_footprint?.tiktok) socialMedia.push(data.digital_footprint.tiktok);
  if (data.digital_footprint?.twitter) socialMedia.push(data.digital_footprint.twitter);

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
      bankAccount: data.financial?.account_holder,
      bankName: data.financial?.bank_name,
      bankCountry: data.financial?.bank_country,
      cryptoWallet: data.crypto?.wallet_address,
      cryptoBlockchain: data.crypto?.blockchain,
      cryptoExchange: data.crypto?.exchange,
    },
    company: data.company ? {
      name: data.company.name,
      vatTaxId: data.company.vat_tax_id,
      address: data.company.address ? {
        street: data.company.address.street,
        city: data.company.address.city,
        postalCode: data.company.address.postal_code,
        country: data.company.address.country,
      } : undefined,
    } : undefined,
    vehicle: data.vehicle ? {
      make: data.vehicle.make,
      model: data.vehicle.model,
      color: data.vehicle.color,
      licensePlate: data.vehicle.license_plate,
      vin: data.vehicle.vin,
      registeredOwner: data.vehicle.registered_owner,
    } : undefined,
    evidence: data.evidence?.map(e => ({
      id: e.id,
      type: (e.type?.toUpperCase() || 'IMAGE') as 'IMAGE' | 'DOCUMENT' | 'VIDEO',
      url: e.file_url || e.thumbnail_url || '',
      thumbnailUrl: e.thumbnail_url || e.file_url || '',
      description: e.description,
    })) || [],
    viewCount: data.view_count || 0,
    commentCount: data.comment_count || 0,
  };
}

// Info Item Component for consistent styling
function InfoItem({
  icon: Icon,
  label,
  value,
  mono = true,
  copyable = false,
  className = ''
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all duration-200 ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
        <div className={`text-slate-900 ${mono ? 'font-mono text-sm' : 'text-base'} break-all leading-relaxed`}>
          {value}
        </div>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          title="Kopírovať"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

// Section Card Component
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accentColor = 'blue'
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
}) {
  const accentColors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColors[accentColor]} flex items-center justify-center shadow-lg shadow-${accentColor}-500/20`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const locale = params?.locale as string || 'sk';
  const reportId = params?.id as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return; // Prevent double-clicks
    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: report?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link skopírovaný do schránky');
      }
    } catch (error) {
      // User cancelled share or error occurred - ignore AbortError
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;

    setIsDownloading(true);
    try {
      // Open export in new window for PDF download
      window.open(`/api/v1/reports/${reportId}/export?format=pdf`, '_blank');
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  // Loading state with elegant skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-200 rounded-xl w-48"></div>
              <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                  <div className="h-6 bg-slate-200 rounded-full w-32"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <div className="h-6 bg-slate-200 rounded-xl w-40"></div>
                <div className="h-24 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Nastala chyba</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button asChild className="w-full">
              <Link href={`/${locale}/search`}>Späť na vyhľadávanie</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Report nenájdený</h3>
            <p className="text-slate-500 mb-6">Zadaný report neexistuje alebo bol odstránený.</p>
            <Button asChild className="w-full">
              <Link href={`/${locale}/search`}>Späť na vyhľadávanie</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fraudConfig = fraudTypeConfig[report.fraudType] || fraudTypeConfig.OTHER;
  const statusCfg = statusConfig[report.status] || statusConfig.PENDING;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" ref={reportRef}>
      <div className="container py-8 lg:py-12">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="hover:bg-slate-100 -ml-3">
              <Link href={`/${locale}/search`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Späť na výsledky
              </Link>
            </Button>
            <div className="text-sm text-slate-500">
              ID: <span className="font-mono">{report.id}</span>
            </div>
          </div>

          {/* Hero Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
            {/* Top accent bar based on fraud type */}
            <div className={`h-1.5 ${fraudConfig.bgColor.replace('50', '400')}`}></div>

            <div className="p-6 lg:p-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bgColor} ${statusCfg.textColor}`}>
                  <span className={`w-2 h-2 rounded-full ${statusCfg.dotColor}`}></span>
                  {statusCfg.label}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${fraudConfig.bgColor} ${fraudConfig.textColor} ${fraudConfig.borderColor}`}>
                  {fraudConfig.label}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-tight break-words">
                {report.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                {(report.city || report.country) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {[report.city, report.country].filter(Boolean).join(', ')}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(report.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {report.viewCount} zobrazení
                </span>
              </div>

              {/* Financial loss highlight */}
              {report.amount && report.amount > 0 && (
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/60 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-rose-600 uppercase tracking-wide">Výška škody</div>
                    <div className="text-xl font-bold text-rose-700">
                      {formatCurrency(report.amount, report.currency)}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? 'Generujem...' : 'Stiahnuť PDF'}
                </Button>
                <Button variant="outline" onClick={handleShare} disabled={isSharing} className="border-slate-200 hover:bg-slate-50">
                  <Share2 className="h-4 w-4 mr-2" />
                  Zdieľať
                </Button>
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-rose-600 hover:text-rose-700 hover:border-rose-200">
                  <Flag className="h-4 w-4 mr-2" />
                  Nahlásiť
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <SectionCard icon={FileText} title="Popis incidentu" accentColor="blue">
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line break-words">
                  {report.description}
                </p>
              </div>
            </SectionCard>
          )}

          {/* Perpetrator Info */}
          {(report.perpetrator.name || report.perpetrator.phone || report.perpetrator.email || report.perpetrator.website) && (
            <SectionCard
              icon={User}
              title="Údaje o páchateľovi"
              description="Identifikačné údaje osoby alebo entity"
              accentColor="rose"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {report.perpetrator.name && (
                  <InfoItem icon={User} label="Meno / Prezývka" value={report.perpetrator.name} copyable />
                )}
                {report.perpetrator.phone && (
                  <InfoItem icon={Phone} label="Telefónne číslo" value={report.perpetrator.phone} copyable />
                )}
                {report.perpetrator.email && (
                  <InfoItem icon={Mail} label="E-mailová adresa" value={report.perpetrator.email} copyable />
                )}
                {report.perpetrator.website && (
                  <InfoItem icon={Globe} label="Webstránka" value={report.perpetrator.website} copyable />
                )}
              </div>

              {/* Social Media */}
              {report.perpetrator.socialMedia && report.perpetrator.socialMedia.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Sociálne siete</div>
                  <div className="flex flex-wrap gap-2">
                    {report.perpetrator.socialMedia.map((social, i) => (
                      <a
                        key={i}
                        href={social.startsWith('http') ? social : `https://${social}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-mono text-slate-700 transition-colors break-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{social}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* Bank Account Info */}
          {(report.perpetrator.iban || report.perpetrator.bankName || report.perpetrator.bankAccount) && (
            <SectionCard
              icon={Landmark}
              title="Bankové údaje"
              description="Bankové účty spojené s podvodom"
              accentColor="emerald"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {report.perpetrator.iban && (
                  <InfoItem
                    icon={CreditCard}
                    label="IBAN"
                    value={report.perpetrator.iban}
                    copyable
                    className="sm:col-span-2"
                  />
                )}
                {report.perpetrator.bankAccount && (
                  <InfoItem icon={User} label="Majiteľ účtu" value={report.perpetrator.bankAccount} copyable />
                )}
                {report.perpetrator.bankName && (
                  <InfoItem icon={Landmark} label="Názov banky" value={report.perpetrator.bankName} />
                )}
                {report.perpetrator.bankCountry && (
                  <InfoItem icon={MapPin} label="Krajina banky" value={report.perpetrator.bankCountry} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Crypto Info */}
          {(report.perpetrator.cryptoWallet || report.perpetrator.cryptoBlockchain || report.perpetrator.cryptoExchange) && (
            <SectionCard
              icon={Wallet}
              title="Kryptomenové údaje"
              description="Krypto peňaženky a burzy spojené s podvodom"
              accentColor="amber"
            >
              <div className="grid gap-3">
                {report.perpetrator.cryptoWallet && (
                  <InfoItem
                    icon={Wallet}
                    label="Adresa peňaženky"
                    value={report.perpetrator.cryptoWallet}
                    copyable
                  />
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {report.perpetrator.cryptoBlockchain && (
                    <InfoItem icon={Globe} label="Blockchain" value={report.perpetrator.cryptoBlockchain} mono={false} />
                  )}
                  {report.perpetrator.cryptoExchange && (
                    <InfoItem icon={Building2} label="Krypto burza" value={report.perpetrator.cryptoExchange} mono={false} />
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Company Info */}
          {report.company && (report.company.name || report.company.vatTaxId) && (
            <SectionCard
              icon={Building2}
              title="Firemné údaje"
              description="Informácie o firme spojenej s podvodom"
              accentColor="violet"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {report.company.name && (
                  <InfoItem icon={Building2} label="Názov firmy" value={report.company.name} copyable />
                )}
                {report.company.vatTaxId && (
                  <InfoItem icon={CreditCard} label="IČO / DIČ" value={report.company.vatTaxId} copyable />
                )}
                {report.company.address && (report.company.address.street || report.company.address.city) && (
                  <InfoItem
                    icon={MapPin}
                    label="Adresa"
                    value={[
                      report.company.address.street,
                      report.company.address.postalCode,
                      report.company.address.city,
                      report.company.address.country,
                    ].filter(Boolean).join(', ')}
                    className="sm:col-span-2"
                    mono={false}
                  />
                )}
              </div>
            </SectionCard>
          )}

          {/* Vehicle Info */}
          {report.vehicle && (report.vehicle.make || report.vehicle.licensePlate || report.vehicle.vin) && (
            <SectionCard
              icon={Car}
              title="Údaje o vozidle"
              description="Informácie o vozidle spojenom s podvodom"
              accentColor="blue"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {(report.vehicle.make || report.vehicle.model) && (
                  <InfoItem
                    icon={Car}
                    label="Značka / Model"
                    value={[report.vehicle.make, report.vehicle.model].filter(Boolean).join(' ')}
                    mono={false}
                  />
                )}
                {report.vehicle.color && (
                  <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all duration-200">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg shadow-sm border border-slate-200"
                      style={{ backgroundColor: report.vehicle.color.toLowerCase() }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Farba</div>
                      <div className="text-slate-900">{report.vehicle.color}</div>
                    </div>
                  </div>
                )}
                {report.vehicle.licensePlate && (
                  <InfoItem icon={CreditCard} label="ŠPZ" value={report.vehicle.licensePlate} copyable />
                )}
                {report.vehicle.vin && (
                  <InfoItem icon={CreditCard} label="VIN" value={report.vehicle.vin} copyable />
                )}
                {report.vehicle.registeredOwner && (
                  <InfoItem
                    icon={User}
                    label="Registrovaný majiteľ"
                    value={report.vehicle.registeredOwner}
                    className="sm:col-span-2"
                  />
                )}
              </div>
            </SectionCard>
          )}

          {/* Evidence */}
          {report.evidence.length > 0 && (
            <SectionCard icon={FileText} title={`Evidence (${report.evidence.length})`} accentColor="blue">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {report.evidence.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer block"
                  >
                    <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                      {item.url && item.type === 'IMAGE' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.description || 'Evidence image'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<span class="text-4xl">🖼️</span>';
                          }}
                        />
                      ) : item.url && item.type === 'VIDEO' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-800">
                          <span className="text-4xl">🎥</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-4xl">
                          {item.type === 'DOCUMENT' ? '📄' : item.type === 'VIDEO' ? '🎥' : '🖼️'}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="p-3 border-t border-slate-100">
                        <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors pointer-events-none"></div>
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Similar Reports */}
          {report.similarReports && report.similarReports.length > 0 && (
            <SectionCard
              icon={Users}
              title={`Podobné reporty (${report.similarReports.length})`}
              description="Ostatné hlásenia s podobnými charakteristikami"
              accentColor="violet"
            >
              <div className="space-y-3">
                {report.similarReports.map((similar) => (
                  <Link key={similar.id} href={`/${locale}/reports/${similar.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 group">
                      <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate mr-4">
                        {similar.title}
                      </span>
                      <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                        {similar.similarity}% podobnosť
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Comments */}
          <SectionCard
            icon={MessageSquare}
            title={`Komentáre (${report.commentCount})`}
            accentColor="blue"
          >
            <CommentSection reportId={report.id} />
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
