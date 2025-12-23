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

// Labels must match Prisma FraudType enum values exactly
const fraudTypeLabels: Record<string, string> = {
  ROMANCE_SCAM: 'Romance scam',
  INVESTMENT_FRAUD: 'Investičný podvod',
  PHISHING: 'Phishing',
  IDENTITY_THEFT: 'Krádež identity',
  ONLINE_SHOPPING_FRAUD: 'E-commerce podvod',
  TECH_SUPPORT_SCAM: 'Tech support scam',
  LOTTERY_PRIZE_SCAM: 'Loterný podvod',
  EMPLOYMENT_SCAM: 'Pracovný podvod',
  RENTAL_SCAM: 'Podvod s prenájmom',
  CRYPTOCURRENCY_SCAM: 'Crypto podvod',
  PYRAMID_MLM_SCHEME: 'Pyramídová/MLM schéma',
  INSURANCE_FRAUD: 'Poistný podvod',
  CREDIT_CARD_FRAUD: 'Podvod s platobnou kartou',
  WIRE_FRAUD: 'Telegrafický podvod',
  MONEY_MULE: 'Peňažný mulica',
  ADVANCE_FEE_FRAUD: 'Podvod s pôžičkou',
  BUSINESS_EMAIL_COMPROMISE: 'Kompromitácia firemného emailu',
  SOCIAL_ENGINEERING: 'Sociálne inžinierstvo',
  FAKE_CHARITY: 'Falošná charita',
  GOVERNMENT_IMPERSONATION: 'Napodobenie úradu',
  UTILITY_SCAM: 'Podvod s energiami',
  GRANDPARENT_SCAM: 'Podvod na starých rodičov',
  SEXTORTION: 'Sexuálne vydieranie',
  RANSOMWARE: 'Ransomware',
  ACCOUNT_TAKEOVER: 'Prevzatie účtu',
  SIM_SWAPPING: 'SIM swapping',
  CATFISHING: 'Catfishing',
  PONZI_SCHEME: 'Ponziho schéma',
  OTHER: 'Iný typ',
};

const perpetratorTypeLabels: Record<string, string> = {
  INDIVIDUAL: 'Fyzická osoba',
  COMPANY: 'Firma / Organizácia',
  UNKNOWN: 'Neznámy',
};

const blockchainLabels: Record<string, string> = {
  BITCOIN: 'Bitcoin (BTC)',
  ETHEREUM: 'Ethereum (ETH)',
  TRON: 'Tron (TRX)',
  SOLANA: 'Solana (SOL)',
  BINANCE_SMART_CHAIN: 'Binance Smart Chain (BSC)',
  POLYGON: 'Polygon (MATIC)',
  CARDANO: 'Cardano (ADA)',
  RIPPLE: 'Ripple (XRP)',
  LITECOIN: 'Litecoin (LTC)',
  POLKADOT: 'Polkadot (DOT)',
  OTHER: 'Iný blockchain',
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
            {data.socialMedia && (
              <DataRow label="Sociálne siete" value={data.socialMedia} />
            )}
            {data.address && (
              <DataRow icon={MapPin} label="Adresa" value={data.address} />
            )}
          </div>

          {!data.name && !data.phone && !data.email && (
            <p className="text-muted-foreground italic">Žiadne údaje o páchateľovi neboli zadané</p>
          )}
        </div>

        {/* Digital Footprints Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Digitálne stopy" step={4} onEdit={onEdit} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataRow icon={Send} label="Telegram" value={data.telegram} />
            <DataRow icon={Phone} label="WhatsApp" value={data.whatsapp} />
            <DataRow icon={Phone} label="Signal" value={data.signalNumber} />
            <DataRow icon={MessageCircle} label="Instagram" value={data.instagram} />
            <DataRow icon={MessageCircle} label="Facebook" value={data.facebook} />
            <DataRow icon={MessageCircle} label="TikTok" value={data.tiktokHandle} />
            <DataRow icon={MessageCircle} label="X / Twitter" value={data.twitterHandle} />
            <DataRow icon={Globe} label="Webová stránka" value={data.websiteUrl} />
            <DataRow icon={Globe} label="Doména" value={data.domainName} />
            <DataRow icon={Network} label="IP adresa" value={data.ipAddress} />
            <DataRow icon={MapPin} label="Krajina IP" value={data.ipCountry} />
            <DataRow label="ISP" value={data.ispProvider} />
          </div>

          {!data.telegram && !data.whatsapp && !data.instagram && !data.facebook &&
           !data.websiteUrl && !data.ipAddress && (
            <p className="text-muted-foreground italic">Žiadne digitálne stopy neboli zadané</p>
          )}
        </div>

        {/* Financial Details Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Finančné údaje" step={5} onEdit={onEdit} />

          <div className="space-y-4">
            {/* Banking */}
            {(data.iban || data.accountHolderName || data.bankName) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Bankové údaje
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label="IBAN" value={data.iban} />
                  <DataRow label="Majiteľ účtu" value={data.accountHolderName} />
                  <DataRow label="Číslo účtu" value={data.accountNumber} />
                  <DataRow label="Banka" value={data.bankName} />
                  <DataRow label="Krajina banky" value={data.bankCountry} />
                  <DataRow label="SWIFT/BIC" value={data.swiftBic} />
                </div>
              </div>
            )}

            {/* Crypto */}
            {(data.walletAddress || data.blockchain) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Bitcoin className="h-4 w-4" />
                  Kryptomenové údaje
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label="Blockchain" value={data.blockchain ? blockchainLabels[data.blockchain] : null} />
                  <DataRow label="Adresa peňaženky" value={data.walletAddress} />
                  <DataRow label="Burza" value={data.exchangeName} />
                  <DataRow label="Hash transakcie" value={data.transactionHash} />
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
                  <DataRow label="PayPal účet" value={data.paypalAccount} />
                </div>
              </div>
            )}
          </div>

          {!data.iban && !data.walletAddress && !data.paypalAccount && (
            <p className="text-muted-foreground italic">Žiadne finančné údaje neboli zadané</p>
          )}
        </div>

        {/* Company & Vehicle Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Firma a vozidlo" step={6} onEdit={onEdit} />

          <div className="space-y-4">
            {/* Company */}
            {(data.companyName || data.vatTaxId) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informácie o firme
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label="Názov firmy" value={data.companyName} />
                  <DataRow label="IČO / DIČ" value={data.vatTaxId} />
                  <DataRow label="Ulica" value={data.companyStreet} />
                  <DataRow label="Mesto" value={data.companyCity} />
                  <DataRow label="PSČ" value={data.companyPostalCode} />
                  <DataRow label="Krajina" value={data.companyCountry} />
                </div>
              </div>
            )}

            {/* Vehicle */}
            {(data.vehicleMake || data.vehicleLicensePlate || data.vehicleVin) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Informácie o vozidle
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <DataRow label="Značka" value={data.vehicleMake} />
                  <DataRow label="Model" value={data.vehicleModel} />
                  <DataRow label="Farba" value={data.vehicleColor} />
                  <DataRow label="EČV" value={data.vehicleLicensePlate} />
                  <DataRow label="VIN" value={data.vehicleVin} />
                  <DataRow label="Registrovaný vlastník" value={data.registeredOwner} />
                </div>
              </div>
            )}
          </div>

          {!data.companyName && !data.vatTaxId && !data.vehicleMake && !data.vehicleLicensePlate && (
            <p className="text-muted-foreground italic">Žiadne údaje o firme alebo vozidle neboli zadané</p>
          )}
        </div>

        {/* Evidence Section */}
        <div className="bg-card border rounded-lg p-5">
          <SectionHeader title="Dôkazy a prílohy" step={7} onEdit={onEdit} />

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
          <SectionHeader title="Kontaktné údaje" step={8} onEdit={onEdit} />

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
