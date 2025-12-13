'use client';

import { Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BasicInfoForm } from '@/lib/validations/report';

interface BasicInfoStepProps {
  data: Partial<BasicInfoForm>;
  errors: Partial<Record<keyof BasicInfoForm, string>>;
  onChange: (field: keyof BasicInfoForm, value: string) => void;
}

const countries = [
  'Slovensko',
  'Česká republika',
  'Poľsko',
  'Maďarsko',
  'Rakúsko',
  'Nemecko',
  'Veľká Británia',
  'Francúzsko',
  'Taliansko',
  'Španielsko',
  'Iné',
];

const currencies = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CZK', label: 'CZK (Kč)' },
  { value: 'PLN', label: 'PLN (zł)' },
];

export function BasicInfoStep({ data, errors, onChange }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Základné informácie</h2>
        <p className="text-muted-foreground">
          Zadajte základné údaje o incidente
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Nadpis hlásenia <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            placeholder="Stručný a výstižný nadpis (napr. 'Investičný podvod s Bitcoinom')"
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
            Podrobný popis <span className="text-destructive">*</span>
          </label>
          <textarea
            id="description"
            placeholder="Popíšte čo sa stalo, ako vás kontaktovali, aké sumy boli zahrnuté, atď..."
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
            {data.description?.length || 0} / 10,000 znakov (minimum 50)
          </p>
        </div>

        {/* Incident Date */}
        <div className="space-y-2">
          <label htmlFor="incidentDate" className="text-sm font-medium">
            Dátum incidentu <span className="text-destructive">*</span>
          </label>
          <Input
            id="incidentDate"
            type="date"
            value={data.incidentDate || ''}
            onChange={(e) => onChange('incidentDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
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
              Krajina <span className="text-destructive">*</span>
            </label>
            <Select value={data.country || ''} onValueChange={(value) => onChange('country', value)}>
              <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                <SelectValue placeholder="Vyberte krajinu" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              Mesto <span className="text-destructive">*</span>
            </label>
            <Input
              id="city"
              placeholder="Napríklad Bratislava"
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
            PSČ (voliteľné)
          </label>
          <Input
            id="postalCode"
            placeholder="Napríklad 82105"
            value={data.postalCode || ''}
            onChange={(e) => onChange('postalCode', e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Výška škody (voliteľné)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
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
              Mena
            </label>
            <Select value={data.currency || 'EUR'} onValueChange={(value) => onChange('currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
