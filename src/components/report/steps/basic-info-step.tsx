'use client';

import { Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BasicInfoForm } from '@/lib/validations/report';
import { getCountriesWithPriority } from '@/lib/constants/countries';
import { getCurrenciesWithPriority } from '@/lib/constants/currencies';
import { useTranslation } from '@/lib/i18n/context';

interface BasicInfoStepProps {
  data: Partial<BasicInfoForm>;
  errors: Partial<Record<keyof BasicInfoForm, string>>;
  onChange: (field: keyof BasicInfoForm, value: string) => void;
}

// Get countries and currencies with priority items at top
const countries = getCountriesWithPriority();
const currencies = getCurrenciesWithPriority();

// Use a far-future date to avoid hydration mismatch (new Date() differs server/client)
// The actual validation of "not future date" should be done on form submit
const MAX_DATE = '2099-12-31';

export function BasicInfoStep({ data, errors, onChange }: BasicInfoStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('report.steps.basicInfo.title')}</h2>
        <p className="text-muted-foreground">
          {t('report.steps.basicInfo.description')}
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            {t('report.fields.title')} <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            placeholder={t('report.placeholders.title')}
            value={data.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            {t('report.fields.description')} <span className="text-destructive">*</span>
          </label>
          <textarea
            id="description"
            placeholder={t('report.placeholders.description')}
            value={data.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className={`w-full min-h-[200px] px-3 py-2 rounded-md border ${
              errors.description ? 'border-destructive' : 'border-input'
            } bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t('report.hints.descriptionCount', { count: data.description?.length || 0 })}
          </p>
        </div>

        {/* Incident Date */}
        <div className="space-y-2">
          <label htmlFor="incidentDate" className="text-sm font-medium">
            {t('report.fields.incidentDate')} <span className="text-destructive">*</span>
          </label>
          <Input
            id="incidentDate"
            type="date"
            value={data.incidentDate || ''}
            onChange={(e) => onChange('incidentDate', e.target.value)}
            max={MAX_DATE}
            className={errors.incidentDate ? 'border-destructive' : ''}
          />
          {errors.incidentDate && (
            <p className="text-sm text-destructive">{errors.incidentDate}</p>
          )}
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium">
              {t('report.fields.country')} <span className="text-destructive">*</span>
            </label>
            <Select value={data.country || ''} onValueChange={(value) => onChange('country', value)}>
              <SelectTrigger className={`h-12 ${errors.country ? 'border-destructive' : ''}`}>
                <SelectValue placeholder={t('report.placeholders.selectCountry')} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countries.map((country) => (
                  country.value === 'SEPARATOR' ? (
                    <div key="separator" className="px-2 py-1 text-xs text-muted-foreground border-t my-1">
                      {t('report.hints.allCountries')}
                    </div>
                  ) : (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              {t('report.fields.city')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="city"
              placeholder={t('report.placeholders.city')}
              value={data.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="postalCode" className="text-sm font-medium">
            {t('report.fields.postalCode')} ({t('common.optional')})
          </label>
          <Input
            id="postalCode"
            placeholder={t('report.placeholders.postalCode')}
            value={data.postalCode || ''}
            onChange={(e) => onChange('postalCode', e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="amount" className="text-sm font-medium">
              {t('report.fields.amount')} ({t('common.optional')})
            </label>
            <Input
              id="amount"
              type="number"
              placeholder={t('report.placeholders.amount')}
              min="0"
              step="0.01"
              value={data.amount || ''}
              onChange={(e) => onChange('amount', e.target.value)}
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              {t('report.fields.currency')}
            </label>
            <Select value={data.currency || 'EUR'} onValueChange={(value) => onChange('currency', value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {currencies.map((currency) => (
                  currency.value === 'SEPARATOR' ? (
                    <div key="separator" className="px-2 py-1 text-xs text-muted-foreground border-t my-1">
                      {t('report.hints.allCurrencies')}
                    </div>
                  ) : (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
