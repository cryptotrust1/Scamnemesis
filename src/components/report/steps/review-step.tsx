'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteReportForm } from '@/lib/validations/report';
import {
  AlertTriangle,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Wallet,
  FileImage,
  Pencil,
  CheckCircle,
  MessageCircle,
  Network,
  Building2,
  Car,
  Bitcoin,
  Send,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';

interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  description?: string;
}

interface ReviewStepProps {
  data: Partial<CompleteReportForm> & { files?: EvidenceFile[] };
  onEdit: (step: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionHeader({ title, step, onEdit, editLabel }: { title: string; step: number; onEdit: (step: number) => void; editLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <Button variant="ghost" size="sm" onClick={() => onEdit(step)} className="text-primary">
        <Pencil className="h-4 w-4 mr-1" />
        {editLabel}
      </Button>
    </div>
  );
}

function DataRow({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
      <div className="flex-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
  const { t, locale } = useTranslation();

  const getFraudTypeLabel = (type: string) => t(`search.fraudTypes.${type}`) || type;
  const getPerpetratorTypeLabel = (type: string) => t(`search.perpetratorTypes.${type}`) || type;
  const getBlockchainLabel = (type: string) => t(`search.blockchainLabels.${type}`) || type;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('report.review.title')}</h2>
        <p className="text-muted-foreground">
          {t('report.review.subtitle')}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Fraud Type Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.fraudType')} step={1} onEdit={onEdit} editLabel={t('report.review.edit')} />
          <Badge variant="secondary" className="text-base py-1.5 px-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {data.fraudType ? getFraudTypeLabel(data.fraudType) : t('report.review.notSelected')}
          </Badge>
        </div>

        {/* Basic Info Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.basicInfo')} step={2} onEdit={onEdit} editLabel={t('report.review.edit')} />

          <div className="space-y-1">
            <h4 className="text-xl font-semibold">{data.title || t('report.review.noTitle')}</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {data.description || t('report.review.noDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <DataRow
              icon={Calendar}
              label={t('report.review.incidentDate')}
              value={data.incidentDate ? new Date(data.incidentDate).toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale === 'cs' ? 'cs-CZ' : locale === 'de' ? 'de-DE' : 'en-US') : null}
            />
            <DataRow
              icon={MapPin}
              label={t('report.review.location')}
              value={[data.city, data.country, data.postalCode].filter(Boolean).join(', ')}
            />
            {(data.amount && parseFloat(data.amount) > 0) && (
              <DataRow
                icon={DollarSign}
                label={t('report.review.damageAmount')}
                value={`${parseFloat(data.amount).toLocaleString(locale === 'sk' ? 'sk-SK' : locale === 'cs' ? 'cs-CZ' : locale === 'de' ? 'de-DE' : 'en-US')} ${data.currency || 'EUR'}`}
              />
            )}
          </div>
        </div>

        {/* Perpetrator Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.perpetratorInfo')} step={3} onEdit={onEdit} editLabel={t('report.review.edit')} />

          <Badge variant="outline" className="mb-4">
            {data.perpetratorType ? getPerpetratorTypeLabel(data.perpetratorType) : t('report.review.unknown')}
          </Badge>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow icon={User} label={t('report.review.nameTitle')} value={data.name} />
            <DataRow icon={Phone} label={t('report.review.phone')} value={data.phone} />
            <DataRow icon={Mail} label={t('report.review.email')} value={data.email} />
            {data.socialMedia && (
              <DataRow label={t('report.review.socialMedia')} value={data.socialMedia} />
            )}
            {data.address && (
              <DataRow icon={MapPin} label={t('report.review.address')} value={data.address} />
            )}
          </div>

          {!data.name && !data.phone && !data.email && (
            <p className="text-muted-foreground italic">{t('report.review.noPerpetratorData')}</p>
          )}
        </div>

        {/* Digital Footprints Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.digitalFootprints')} step={4} onEdit={onEdit} editLabel={t('report.review.edit')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow icon={Send} label="Telegram" value={data.telegram} />
            <DataRow icon={Phone} label="WhatsApp" value={data.whatsapp} />
            <DataRow icon={Phone} label="Signal" value={data.signalNumber} />
            <DataRow icon={MessageCircle} label="Instagram" value={data.instagram} />
            <DataRow icon={MessageCircle} label="Facebook" value={data.facebook} />
            <DataRow icon={MessageCircle} label="TikTok" value={data.tiktokHandle} />
            <DataRow icon={MessageCircle} label="X / Twitter" value={data.twitterHandle} />
            <DataRow icon={Globe} label={t('report.review.website')} value={data.websiteUrl} />
            <DataRow icon={Globe} label={t('report.review.domain')} value={data.domainName} />
            <DataRow icon={Network} label={t('report.review.ipAddress')} value={data.ipAddress} />
            <DataRow icon={MapPin} label={t('report.review.ipCountry')} value={data.ipCountry} />
            <DataRow label="ISP" value={data.ispProvider} />
          </div>

          {!data.telegram && !data.whatsapp && !data.instagram && !data.facebook &&
           !data.websiteUrl && !data.ipAddress && (
            <p className="text-muted-foreground italic">{t('report.review.noDigitalData')}</p>
          )}
        </div>

        {/* Financial Details Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.financialData')} step={5} onEdit={onEdit} editLabel={t('report.review.edit')} />

          <div className="space-y-4">
            {/* Banking */}
            {(data.iban || data.accountHolderName || data.bankName) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t('report.review.bankingData')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label="IBAN" value={data.iban} />
                  <DataRow label={t('report.review.accountHolder')} value={data.accountHolderName} />
                  <DataRow label={t('report.review.accountNumber')} value={data.accountNumber} />
                  <DataRow label={t('report.review.bank')} value={data.bankName} />
                  <DataRow label={t('report.review.bankCountry')} value={data.bankCountry} />
                  <DataRow label="SWIFT/BIC" value={data.swiftBic} />
                </div>
              </div>
            )}

            {/* Crypto */}
            {(data.walletAddress || data.blockchain) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Bitcoin className="h-4 w-4" />
                  {t('report.review.cryptoData')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label="Blockchain" value={data.blockchain ? getBlockchainLabel(data.blockchain) : null} />
                  <DataRow label={t('report.review.walletAddress')} value={data.walletAddress} />
                  <DataRow label={t('report.review.exchange')} value={data.exchangeName} />
                  <DataRow label={t('report.review.transactionHash')} value={data.transactionHash} />
                </div>
              </div>
            )}

            {/* PayPal */}
            {data.paypalAccount && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  PayPal
                </h4>
                <div className="pl-6">
                  <DataRow label={t('report.review.paypalAccount')} value={data.paypalAccount} />
                </div>
              </div>
            )}
          </div>

          {!data.iban && !data.walletAddress && !data.paypalAccount && (
            <p className="text-muted-foreground italic">{t('report.review.noFinancialData')}</p>
          )}
        </div>

        {/* Company & Vehicle Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.companyVehicle')} step={6} onEdit={onEdit} editLabel={t('report.review.edit')} />

          <div className="space-y-4">
            {/* Company */}
            {(data.companyName || data.vatTaxId) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t('report.review.companyInfo')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label={t('report.review.companyName')} value={data.companyName} />
                  <DataRow label={t('report.review.vatTaxId')} value={data.vatTaxId} />
                  <DataRow label={t('report.review.street')} value={data.companyStreet} />
                  <DataRow label={t('report.review.city')} value={data.companyCity} />
                  <DataRow label={t('report.review.postalCode')} value={data.companyPostalCode} />
                  <DataRow label={t('report.review.country')} value={data.companyCountry} />
                </div>
              </div>
            )}

            {/* Vehicle */}
            {(data.vehicleMake || data.vehicleLicensePlate || data.vehicleVin) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {t('report.review.vehicleInfo')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label={t('report.review.vehicleMake')} value={data.vehicleMake} />
                  <DataRow label={t('report.review.vehicleModel')} value={data.vehicleModel} />
                  <DataRow label={t('report.review.vehicleColor')} value={data.vehicleColor} />
                  <DataRow label={t('report.review.licensePlate')} value={data.vehicleLicensePlate} />
                  <DataRow label={t('report.review.vin')} value={data.vehicleVin} />
                  <DataRow label={t('report.review.registeredOwner')} value={data.registeredOwner} />
                </div>
              </div>
            )}
          </div>

          {!data.companyName && !data.vatTaxId && !data.vehicleMake && !data.vehicleLicensePlate && (
            <p className="text-muted-foreground italic">{t('report.review.noCompanyVehicleData')}</p>
          )}
        </div>

        {/* Evidence Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.evidence')} step={7} onEdit={onEdit} editLabel={t('report.review.edit')} />

          {data.files && data.files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.files.map((file) => (
                <div key={file.id} className="relative">
                  {file.type.startsWith('image/') && file.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded-lg border flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs mt-1 truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              {t('report.review.noEvidence')}
            </p>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title={t('report.review.contactData')} step={8} onEdit={onEdit} editLabel={t('report.review.edit')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow icon={User} label={t('report.review.yourName')} value={data.reporterName} />
            <DataRow icon={Mail} label={t('report.review.yourEmail')} value={data.reporterEmail} />
            <DataRow icon={Phone} label={t('report.review.yourPhone')} value={data.reporterPhone} />
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center gap-2">
              {data.wantUpdates ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              )}
              <span className="text-sm">{t('report.review.wantUpdates')}</span>
            </div>
            <div className="flex items-center gap-2">
              {data.agreeToTerms ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-destructive" />
              )}
              <span className="text-sm">{t('report.review.agreeToTerms')}</span>
            </div>
            <div className="flex items-center gap-2">
              {data.agreeToGDPR ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-destructive" />
              )}
              <span className="text-sm">{t('report.review.agreeToGDPR')}</span>
            </div>
          </div>

          {!data.reporterName && !data.reporterEmail && !data.reporterPhone && (
            <p className="text-muted-foreground italic mt-4">
              {t('report.review.anonymousReport')}
            </p>
          )}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">{t('report.review.warningTitle')}</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                {(t('report.review.warningItems') as unknown as string[]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
