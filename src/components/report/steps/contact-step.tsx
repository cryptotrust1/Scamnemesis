'use client';

import { Input } from '@/components/ui/input';
import { ContactInfoForm } from '@/lib/validations/report';
import { cn } from '@/lib/utils';
import { Shield, Mail, Bell, Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';

interface ContactStepProps {
  data: Partial<ContactInfoForm>;
  errors: Partial<Record<keyof ContactInfoForm, string>>;
  onChange: (field: keyof ContactInfoForm, value: string | boolean) => void;
}

export function ContactStep({ data, errors, onChange }: ContactStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('report.contact.title')}</h2>
        <p className="text-muted-foreground">
          {t('report.contact.subtitle')}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t('report.contact.contactInfo')}
          </h3>

          <div className="space-y-2">
            <label htmlFor="reporterName" className="text-sm font-medium">
              {t('report.contact.yourName')}
            </label>
            <Input
              id="reporterName"
              placeholder={t('report.contact.yourNamePlaceholder')}
              value={data.reporterName || ''}
              onChange={(e) => onChange('reporterName', e.target.value)}
              className={errors.reporterName ? 'border-destructive' : ''}
            />
            {errors.reporterName && (
              <p className="text-sm text-destructive">{errors.reporterName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('report.contact.yourNameHint')}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reporterEmail" className="text-sm font-medium">
              {t('report.contact.yourEmail')}
            </label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder={t('report.contact.yourEmailPlaceholder')}
              value={data.reporterEmail || ''}
              onChange={(e) => onChange('reporterEmail', e.target.value)}
              className={errors.reporterEmail ? 'border-destructive' : ''}
            />
            {errors.reporterEmail && (
              <p className="text-sm text-destructive">{errors.reporterEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="reporterPhone" className="text-sm font-medium">
              {t('report.contact.yourPhone')}
            </label>
            <Input
              id="reporterPhone"
              type="tel"
              placeholder={t('report.contact.yourPhonePlaceholder')}
              value={data.reporterPhone || ''}
              onChange={(e) => onChange('reporterPhone', e.target.value)}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="border-t pt-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            {t('report.contact.notifications')}
          </h3>

          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <input
              type="checkbox"
              checked={data.wantUpdates || false}
              onChange={(e) => onChange('wantUpdates', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-0 focus:ring-offset-0"
            />
            <div className="flex-1">
              <span className="font-medium">{t('report.contact.wantUpdates')}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {t('report.contact.wantUpdatesDesc')}
              </p>
            </div>
          </label>
        </div>

        {/* Required Consents */}
        <div className="border-t pt-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            {t('report.contact.consents')}
          </h3>

          <div className="space-y-3">
            <label
              className={cn(
                'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                errors.agreeToTerms ? 'border-destructive bg-destructive/5' : 'hover:bg-muted/50'
              )}
            >
              <input
                type="checkbox"
                checked={data.agreeToTerms || false}
                onChange={(e) => onChange('agreeToTerms', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-0 focus:ring-offset-0"
              />
              <div className="flex-1">
                <span className="font-medium">
                  {t('report.contact.agreeToTerms')} <span className="text-destructive">*</span>
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('report.contact.agreeToTermsDesc')}{' '}
                  <a href="/terms" className="text-primary hover:underline" target="_blank">
                    {t('report.contact.termsLink')}
                  </a>
                </p>
              </div>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive ml-7">{errors.agreeToTerms}</p>
            )}

            <label
              className={cn(
                'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                errors.agreeToGDPR ? 'border-destructive bg-destructive/5' : 'hover:bg-muted/50'
              )}
            >
              <input
                type="checkbox"
                checked={data.agreeToGDPR || false}
                onChange={(e) => onChange('agreeToGDPR', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-0 focus:ring-offset-0"
              />
              <div className="flex-1">
                <span className="font-medium">
                  {t('report.contact.agreeToGDPR')} <span className="text-destructive">*</span>
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('report.contact.agreeToGDPRDesc')}{' '}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank">
                    {t('report.contact.gdprLink')}
                  </a>
                </p>
              </div>
            </label>
            {errors.agreeToGDPR && (
              <p className="text-sm text-destructive ml-7">{errors.agreeToGDPR}</p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">{t('report.contact.infoTitle')}</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                {(t('report.contact.infoItems') as unknown as string[]).map((item, idx) => (
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
