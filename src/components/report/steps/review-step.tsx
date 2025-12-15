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
} from 'lucide-react';

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

const fraudTypeLabels: Record<string, string> = {
  INVESTMENT_FRAUD: 'Investičný podvod',
  ROMANCE_SCAM: 'Romance scam',
  PHISHING: 'Phishing',
  IDENTITY_THEFT: 'Krádež identity',
  ECOMMERCE_FRAUD: 'E-commerce podvod',
  CRYPTO_SCAM: 'Crypto podvod',
  JOB_SCAM: 'Pracovný podvod',
  RENTAL_FRAUD: 'Podvod s prenájmom',
  LOAN_SCAM: 'Podvod s pôžičkou',
  FAKE_CHARITY: 'Falošná charita',
  TECH_SUPPORT_SCAM: 'Tech support scam',
  LOTTERY_SCAM: 'Loterný podvod',
  OTHER: 'Iný typ',
};

const perpetratorTypeLabels: Record<string, string> = {
  INDIVIDUAL: 'Fyzická osoba',
  COMPANY: 'Firma / Organizácia',
  UNKNOWN: 'Neznámy',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionHeader({ title, step, onEdit }: { title: string; step: number; onEdit: (step: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <Button variant="ghost" size="sm" onClick={() => onEdit(step)} className="text-primary">
        <Pencil className="h-4 w-4 mr-1" />
        Upraviť
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
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Kontrola hlásenia</h2>
        <p className="text-muted-foreground">
          Skontrolujte všetky údaje pred odoslaním. Kliknite na &quot;Upraviť&quot; pre zmenu údajov.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Fraud Type Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Typ podvodu" step={1} onEdit={onEdit} />
          <Badge variant="secondary" className="text-base py-1.5 px-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {data.fraudType ? fraudTypeLabels[data.fraudType] || data.fraudType : 'Nevybraté'}
          </Badge>
        </div>

        {/* Basic Info Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Základné informácie" step={2} onEdit={onEdit} />

          <div className="space-y-1">
            <h4 className="text-xl font-semibold">{data.title || 'Bez nadpisu'}</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {data.description || 'Bez popisu'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <DataRow
              icon={Calendar}
              label="Dátum incidentu"
              value={data.incidentDate ? new Date(data.incidentDate).toLocaleDateString('sk-SK') : null}
            />
            <DataRow
              icon={MapPin}
              label="Miesto"
              value={[data.city, data.country, data.postalCode].filter(Boolean).join(', ')}
            />
            {(data.amount && parseFloat(data.amount) > 0) && (
              <DataRow
                icon={DollarSign}
                label="Výška škody"
                value={`${parseFloat(data.amount).toLocaleString('sk-SK')} ${data.currency || 'EUR'}`}
              />
            )}
          </div>
        </div>

        {/* Perpetrator Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Informácie o páchateľovi" step={3} onEdit={onEdit} />

          <Badge variant="outline" className="mb-4">
            {data.perpetratorType ? perpetratorTypeLabels[data.perpetratorType] : 'Neznámy'}
          </Badge>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow icon={User} label="Meno / Názov" value={data.name} />
            <DataRow icon={Phone} label="Telefón" value={data.phone} />
            <DataRow icon={Mail} label="Email" value={data.email} />
            <DataRow icon={Globe} label="Webová stránka" value={data.website} />
            {data.socialMedia && (
              <DataRow label="Sociálne siete" value={data.socialMedia} />
            )}
            {data.address && (
              <DataRow icon={MapPin} label="Adresa" value={data.address} />
            )}
            <DataRow icon={CreditCard} label="IBAN / Účet" value={data.iban} />
            {data.bankAccount && (
              <DataRow label="Banka" value={data.bankAccount} />
            )}
            <DataRow icon={Wallet} label="Krypto peňaženka" value={data.cryptoWallet} />
            {data.companyName && (
              <DataRow label="Obchodné meno" value={data.companyName} />
            )}
            {data.companyId && (
              <DataRow label="IČO" value={data.companyId} />
            )}
          </div>

          {!data.name && !data.phone && !data.email && !data.website && !data.iban && !data.cryptoWallet && (
            <p className="text-muted-foreground italic">Žiadne údaje o páchateľovi neboli zadané</p>
          )}
        </div>

        {/* Evidence Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Dôkazy a prílohy" step={4} onEdit={onEdit} />

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
              Žiadne prílohy neboli pridané
            </p>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Kontaktné údaje" step={5} onEdit={onEdit} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow icon={User} label="Vaše meno" value={data.reporterName} />
            <DataRow icon={Mail} label="Váš email" value={data.reporterEmail} />
            <DataRow icon={Phone} label="Váš telefón" value={data.reporterPhone} />
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center gap-2">
              {data.wantUpdates ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              )}
              <span className="text-sm">Chcem dostávať aktualizácie</span>
            </div>
            <div className="flex items-center gap-2">
              {data.agreeToTerms ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-destructive" />
              )}
              <span className="text-sm">Súhlas s podmienkami používania</span>
            </div>
            <div className="flex items-center gap-2">
              {data.agreeToGDPR ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-destructive" />
              )}
              <span className="text-sm">Súhlas so spracovaním osobných údajov</span>
            </div>
          </div>

          {!data.reporterName && !data.reporterEmail && !data.reporterPhone && (
            <p className="text-muted-foreground italic mt-4">
              Anonymné hlásenie - žiadne kontaktné údaje
            </p>
          )}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Pred odoslaním si overte:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                <li>Všetky uvedené informácie sú pravdivé</li>
                <li>Neuviedli ste citlivé údaje tretích osôb bez ich súhlasu</li>
                <li>Máte právo zdieľať priložené dôkazy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
