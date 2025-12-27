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
import { useTranslation } from '@/lib/i18n/context';

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
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('report.digitalFootprints.title')}</h2>
        <p className="text-muted-foreground">
          {t('report.digitalFootprints.subtitle')}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Social Media Accounts Section */}
        <CollapsibleSection
          title={t('report.digitalFootprints.socialMedia.title')}
          description={t('report.digitalFootprints.socialMedia.description')}
          icon={MessageCircle}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram */}
            <div className="space-y-2">
              <label htmlFor="telegram" className="text-sm font-medium flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.telegram')}
              </label>
              <Input
                id="telegram"
                placeholder={t('report.digitalFootprints.usernamePlaceholder')}
                value={data.telegram || ''}
                onChange={(e) => onChange('telegram', e.target.value)}
                className={errors.telegram ? 'border-destructive' : ''}
              />
              {errors.telegram && (
                <p className="text-sm text-destructive">{errors.telegram}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.telegramHint')}
              </p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.whatsapp')}
              </label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder={t('report.digitalFootprints.phonePlaceholder')}
                value={data.whatsapp || ''}
                onChange={(e) => onChange('whatsapp', e.target.value)}
                className={errors.whatsapp ? 'border-destructive' : ''}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.whatsappHint')}
              </p>
            </div>

            {/* Signal */}
            <div className="space-y-2">
              <label htmlFor="signalNumber" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.signal')}
              </label>
              <Input
                id="signalNumber"
                type="tel"
                placeholder={t('report.digitalFootprints.phonePlaceholder')}
                value={data.signalNumber || ''}
                onChange={(e) => onChange('signalNumber', e.target.value)}
                className={errors.signalNumber ? 'border-destructive' : ''}
              />
              {errors.signalNumber && (
                <p className="text-sm text-destructive">{errors.signalNumber}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.signalHint')}
              </p>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.instagram')}
              </label>
              <Input
                id="instagram"
                placeholder={t('report.digitalFootprints.usernamePlaceholder')}
                value={data.instagram || ''}
                onChange={(e) => onChange('instagram', e.target.value)}
                className={errors.instagram ? 'border-destructive' : ''}
              />
              {errors.instagram && (
                <p className="text-sm text-destructive">{errors.instagram}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.instagramHint')}
              </p>
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <label htmlFor="facebook" className="text-sm font-medium flex items-center gap-2">
                <Facebook className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.facebook')}
              </label>
              <Input
                id="facebook"
                placeholder={t('report.digitalFootprints.facebookPlaceholder')}
                value={data.facebook || ''}
                onChange={(e) => onChange('facebook', e.target.value)}
                className={errors.facebook ? 'border-destructive' : ''}
              />
              {errors.facebook && (
                <p className="text-sm text-destructive">{errors.facebook}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.facebookHint')}
              </p>
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <label htmlFor="tiktokHandle" className="text-sm font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.tiktok')}
              </label>
              <Input
                id="tiktokHandle"
                placeholder={t('report.digitalFootprints.usernamePlaceholder')}
                value={data.tiktokHandle || ''}
                onChange={(e) => onChange('tiktokHandle', e.target.value)}
                className={errors.tiktokHandle ? 'border-destructive' : ''}
              />
              {errors.tiktokHandle && (
                <p className="text-sm text-destructive">{errors.tiktokHandle}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.tiktokHint')}
              </p>
            </div>

            {/* X/Twitter */}
            <div className="space-y-2">
              <label htmlFor="twitterHandle" className="text-sm font-medium flex items-center gap-2">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                {t('report.digitalFootprints.twitter')}
              </label>
              <Input
                id="twitterHandle"
                placeholder={t('report.digitalFootprints.usernamePlaceholder')}
                value={data.twitterHandle || ''}
                onChange={(e) => onChange('twitterHandle', e.target.value)}
                className={errors.twitterHandle ? 'border-destructive' : ''}
              />
              {errors.twitterHandle && (
                <p className="text-sm text-destructive">{errors.twitterHandle}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.twitterHint')}
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Website & Domain Section */}
        <CollapsibleSection
          title={t('report.digitalFootprints.website.title')}
          description={t('report.digitalFootprints.website.description')}
          icon={Globe}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {/* Website URL */}
            <div className="space-y-2">
              <label htmlFor="websiteUrl" className="text-sm font-medium">
                {t('report.digitalFootprints.websiteUrl')}
              </label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder={t('report.digitalFootprints.websiteUrlPlaceholder')}
                value={data.websiteUrl || ''}
                onChange={(e) => onChange('websiteUrl', e.target.value)}
                className={errors.websiteUrl ? 'border-destructive' : ''}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-destructive">{errors.websiteUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.digitalFootprints.websiteUrlHint')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Domain Name */}
              <div className="space-y-2">
                <label htmlFor="domainName" className="text-sm font-medium">
                  {t('report.digitalFootprints.domainName')}
                </label>
                <Input
                  id="domainName"
                  placeholder={t('report.digitalFootprints.domainNamePlaceholder')}
                  value={data.domainName || ''}
                  onChange={(e) => onChange('domainName', e.target.value)}
                  className={errors.domainName ? 'border-destructive' : ''}
                />
                {errors.domainName && (
                  <p className="text-sm text-destructive">{errors.domainName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('report.digitalFootprints.domainNameHint')}
                </p>
              </div>

              {/* Domain Creation Date */}
              <div className="space-y-2">
                <label htmlFor="domainCreationDate" className="text-sm font-medium">
                  {t('report.digitalFootprints.domainCreationDate')}
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
                  {t('report.digitalFootprints.domainCreationDateHint')}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* IP Information Section */}
        <CollapsibleSection
          title={t('report.digitalFootprints.ip.title')}
          description={t('report.digitalFootprints.ip.description')}
          icon={Network}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IP Address */}
              <div className="space-y-2">
                <label htmlFor="ipAddress" className="text-sm font-medium">
                  {t('report.digitalFootprints.ipAddress')}
                </label>
                <Input
                  id="ipAddress"
                  placeholder={t('report.digitalFootprints.ipAddressPlaceholder')}
                  value={data.ipAddress || ''}
                  onChange={(e) => onChange('ipAddress', e.target.value)}
                  className={errors.ipAddress ? 'border-destructive' : ''}
                />
                {errors.ipAddress && (
                  <p className="text-sm text-destructive">{errors.ipAddress}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('report.digitalFootprints.ipAddressHint')}
                </p>
              </div>

              {/* IP Country */}
              <div className="space-y-2">
                <label htmlFor="ipCountry" className="text-sm font-medium">
                  {t('report.digitalFootprints.ipCountry')}
                </label>
                <Select
                  value={data.ipCountry || ''}
                  onValueChange={(value) => onChange('ipCountry', value)}
                >
                  <SelectTrigger className={`h-12 ${errors.ipCountry ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder={t('report.digitalFootprints.ipCountryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      country.value === 'SEPARATOR' ? (
                        <div key="separator" className="px-2 py-1 text-xs text-muted-foreground border-t my-1">
                          {t('report.digitalFootprints.allCountries')}
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
                  {t('report.digitalFootprints.ipCountryHint')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ISP Provider */}
              <div className="space-y-2">
                <label htmlFor="ispProvider" className="text-sm font-medium">
                  {t('report.digitalFootprints.ispProvider')}
                </label>
                <Input
                  id="ispProvider"
                  placeholder={t('report.digitalFootprints.ispProviderPlaceholder')}
                  value={data.ispProvider || ''}
                  onChange={(e) => onChange('ispProvider', e.target.value)}
                  className={errors.ispProvider ? 'border-destructive' : ''}
                />
                {errors.ispProvider && (
                  <p className="text-sm text-destructive">{errors.ispProvider}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('report.digitalFootprints.ispProviderHint')}
                </p>
              </div>

              {/* IP Abuse Score */}
              <div className="space-y-2">
                <label htmlFor="ipAbuseScore" className="text-sm font-medium">
                  {t('report.digitalFootprints.ipAbuseScore')}
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="ipAbuseScore"
                    type="number"
                    min="0"
                    max="100"
                    placeholder={t('report.digitalFootprints.ipAbuseScorePlaceholder')}
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
                  {t('report.digitalFootprints.ipAbuseScoreHint')}
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
                {t('report.digitalFootprints.infoTitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('report.digitalFootprints.infoText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
