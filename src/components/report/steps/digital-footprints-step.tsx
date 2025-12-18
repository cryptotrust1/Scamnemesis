'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DigitalFootprintsForm } from '@/lib/validations/report';
import { getCountriesWithPriority } from '@/lib/constants/countries';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Globe,
  Network,
  Send,
  Phone,
  Instagram,
  Facebook,
  Video,
  Twitter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DigitalFootprintsStepProps {
  data: Partial<DigitalFootprintsForm>;
  errors: Partial<Record<keyof DigitalFootprintsForm, string>>;
  onChange: (field: keyof DigitalFootprintsForm, value: string) => void;
}

// Get countries with priority items at top
const countries = getCountriesWithPriority();

// Use a far-future date to avoid hydration mismatch (new Date() differs server/client)
// The actual validation of "not future date" should be done on form submit
const MAX_DATE = '2099-12-31';

interface CollapsibleSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = true
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors',
          'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t bg-muted/20">
          <div className="space-y-4 pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DigitalFootprintsStep({ data, errors, onChange }: DigitalFootprintsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Digitálne stopy</h2>
        <p className="text-muted-foreground">
          Zadajte online profily a technické informácie o páchateľovi
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Social Media Accounts Section */}
        <CollapsibleSection
          title="Účty na sociálnych sieťach"
          description="Profily páchateľa na sociálnych platformách"
          icon={MessageCircle}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram */}
            <div className="space-y-2">
              <label htmlFor="telegram" className="text-sm font-medium flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                Telegram
              </label>
              <Input
                id="telegram"
                placeholder="@username"
                value={data.telegram || ''}
                onChange={(e) => onChange('telegram', e.target.value)}
                className={errors.telegram ? 'border-destructive' : ''}
              />
              {errors.telegram && (
                <p className="text-sm text-destructive">{errors.telegram}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte používateľské meno začínajúce znakom @
              </p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                WhatsApp
              </label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+1234567890"
                value={data.whatsapp || ''}
                onChange={(e) => onChange('whatsapp', e.target.value)}
                className={errors.whatsapp ? 'border-destructive' : ''}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Telefónne číslo vrátane krajinného kódu
              </p>
            </div>

            {/* Signal */}
            <div className="space-y-2">
              <label htmlFor="signalNumber" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Signal
              </label>
              <Input
                id="signalNumber"
                type="tel"
                placeholder="+1234567890"
                value={data.signalNumber || ''}
                onChange={(e) => onChange('signalNumber', e.target.value)}
                className={errors.signalNumber ? 'border-destructive' : ''}
              />
              {errors.signalNumber && (
                <p className="text-sm text-destructive">{errors.signalNumber}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Telefónne číslo vrátane krajinného kódu
              </p>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                Instagram
              </label>
              <Input
                id="instagram"
                placeholder="@username"
                value={data.instagram || ''}
                onChange={(e) => onChange('instagram', e.target.value)}
                className={errors.instagram ? 'border-destructive' : ''}
              />
              {errors.instagram && (
                <p className="text-sm text-destructive">{errors.instagram}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte používateľské meno začínajúce znakom @
              </p>
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <label htmlFor="facebook" className="text-sm font-medium flex items-center gap-2">
                <Facebook className="h-4 w-4 text-muted-foreground" />
                Facebook
              </label>
              <Input
                id="facebook"
                placeholder="Meno profilu alebo URL"
                value={data.facebook || ''}
                onChange={(e) => onChange('facebook', e.target.value)}
                className={errors.facebook ? 'border-destructive' : ''}
              />
              {errors.facebook && (
                <p className="text-sm text-destructive">{errors.facebook}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte názov profilu alebo celú URL adresu
              </p>
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <label htmlFor="tiktokHandle" className="text-sm font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                TikTok
              </label>
              <Input
                id="tiktokHandle"
                placeholder="@username"
                value={data.tiktokHandle || ''}
                onChange={(e) => onChange('tiktokHandle', e.target.value)}
                className={errors.tiktokHandle ? 'border-destructive' : ''}
              />
              {errors.tiktokHandle && (
                <p className="text-sm text-destructive">{errors.tiktokHandle}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte používateľské meno začínajúce znakom @
              </p>
            </div>

            {/* X/Twitter */}
            <div className="space-y-2">
              <label htmlFor="twitterHandle" className="text-sm font-medium flex items-center gap-2">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                X / Twitter
              </label>
              <Input
                id="twitterHandle"
                placeholder="@username"
                value={data.twitterHandle || ''}
                onChange={(e) => onChange('twitterHandle', e.target.value)}
                className={errors.twitterHandle ? 'border-destructive' : ''}
              />
              {errors.twitterHandle && (
                <p className="text-sm text-destructive">{errors.twitterHandle}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte používateľské meno začínajúce znakom @
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Website & Domain Section */}
        <CollapsibleSection
          title="Webová stránka a doména"
          description="Informácie o webových stránkach používaných pri podvode"
          icon={Globe}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {/* Website URL */}
            <div className="space-y-2">
              <label htmlFor="websiteUrl" className="text-sm font-medium">
                URL webovej stránky
              </label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://example.com"
                value={data.websiteUrl || ''}
                onChange={(e) => onChange('websiteUrl', e.target.value)}
                className={errors.websiteUrl ? 'border-destructive' : ''}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-destructive">{errors.websiteUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte celú URL adresu vrátane https://
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Domain Name */}
              <div className="space-y-2">
                <label htmlFor="domainName" className="text-sm font-medium">
                  Názov domény
                </label>
                <Input
                  id="domainName"
                  placeholder="example.com"
                  value={data.domainName || ''}
                  onChange={(e) => onChange('domainName', e.target.value)}
                  className={errors.domainName ? 'border-destructive' : ''}
                />
                {errors.domainName && (
                  <p className="text-sm text-destructive">{errors.domainName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Len samotný názov domény bez http://
                </p>
              </div>

              {/* Domain Creation Date */}
              <div className="space-y-2">
                <label htmlFor="domainCreationDate" className="text-sm font-medium">
                  Dátum vytvorenia domény
                </label>
                <Input
                  id="domainCreationDate"
                  type="date"
                  value={data.domainCreationDate || ''}
                  onChange={(e) => onChange('domainCreationDate', e.target.value)}
                  max={MAX_DATE}
                  className={errors.domainCreationDate ? 'border-destructive' : ''}
                />
                {errors.domainCreationDate && (
                  <p className="text-sm text-destructive">{errors.domainCreationDate}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Kedy bola doména zaregistrovaná (ak je známe)
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* IP Information Section */}
        <CollapsibleSection
          title="Informácie o IP adrese"
          description="Technické detaily o pôvode podvodu"
          icon={Network}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IP Address */}
              <div className="space-y-2">
                <label htmlFor="ipAddress" className="text-sm font-medium">
                  IP adresa
                </label>
                <Input
                  id="ipAddress"
                  placeholder="192.168.1.1"
                  value={data.ipAddress || ''}
                  onChange={(e) => onChange('ipAddress', e.target.value)}
                  className={errors.ipAddress ? 'border-destructive' : ''}
                />
                {errors.ipAddress && (
                  <p className="text-sm text-destructive">{errors.ipAddress}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  IPv4 adresa vo formáte xxx.xxx.xxx.xxx
                </p>
              </div>

              {/* IP Country */}
              <div className="space-y-2">
                <label htmlFor="ipCountry" className="text-sm font-medium">
                  Krajina IP adresy
                </label>
                <Select
                  value={data.ipCountry || ''}
                  onValueChange={(value) => onChange('ipCountry', value)}
                >
                  <SelectTrigger className={`h-12 ${errors.ipCountry ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Vyberte krajinu" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      country.value === 'SEPARATOR' ? (
                        <div key="separator" className="px-2 py-1 text-xs text-muted-foreground border-t my-1">
                          Všetky krajiny
                        </div>
                      ) : (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
                {errors.ipCountry && (
                  <p className="text-sm text-destructive">{errors.ipCountry}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Z ktorej krajiny pochádzala IP adresa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ISP Provider */}
              <div className="space-y-2">
                <label htmlFor="ispProvider" className="text-sm font-medium">
                  Poskytovateľ internetu (ISP)
                </label>
                <Input
                  id="ispProvider"
                  placeholder="Napríklad: Comcast, Verizon, Deutsche Telekom..."
                  value={data.ispProvider || ''}
                  onChange={(e) => onChange('ispProvider', e.target.value)}
                  className={errors.ispProvider ? 'border-destructive' : ''}
                />
                {errors.ispProvider && (
                  <p className="text-sm text-destructive">{errors.ispProvider}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Názov internetového poskytovateľa
                </p>
              </div>

              {/* IP Abuse Score */}
              <div className="space-y-2">
                <label htmlFor="ipAbuseScore" className="text-sm font-medium">
                  IP skóre zneužitia (0-100)
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="ipAbuseScore"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={data.ipAbuseScore || ''}
                    onChange={(e) => onChange('ipAbuseScore', e.target.value)}
                    className={errors.ipAbuseScore ? 'border-destructive' : ''}
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">/ 100</span>
                </div>
                {errors.ipAbuseScore && (
                  <p className="text-sm text-destructive">{errors.ipAbuseScore}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Hodnotenie rizika IP (vyššie = nebezpečnejšie)
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Info Box */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Prečo sú digitálne stopy dôležité?
              </p>
              <p className="text-sm text-muted-foreground">
                Tieto informácie pomáhajú vytvoriť digitálny profil páchateľa a umožňujú orgánom činným
                v trestnom konaní sledovať a identifikovať podvodníkov naprieč viacerými platformami.
                Všetky citlivé údaje sú chránené a maskované podľa vašej úrovne prístupu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
