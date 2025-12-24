'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Car } from 'lucide-react';
import { getCountriesWithPriority } from '@/lib/constants/countries';
import { CompanyVehicleForm } from '@/lib/validations/report';
import { useTranslation } from '@/lib/i18n/context';

interface CompanyVehicleStepProps {
  data: Partial<CompanyVehicleForm>;
  errors: Partial<Record<keyof CompanyVehicleForm, string>>;
  onChange: (field: keyof CompanyVehicleForm, value: string) => void;
}

// Get countries with priority items at top
const countries = getCountriesWithPriority();

export function CompanyVehicleStep({ data, errors, onChange }: CompanyVehicleStepProps) {
  const { t, tv } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('report.companyVehicle.title')}</h2>
        <p className="text-muted-foreground">
          {t('report.companyVehicle.subtitle')}
        </p>
      </div>

      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Company Information Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {t('report.companyVehicle.companySection.title')}
          </h3>

          {/* Company Name */}
          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium">
              {t('report.companyVehicle.companyName')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="companyName"
              placeholder={t('report.companyVehicle.companyNamePlaceholder')}
              value={data.companyName || ''}
              onChange={(e) => onChange('companyName', e.target.value)}
              className={errors.companyName ? 'border-destructive' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>

          {/* VAT/Tax ID */}
          <div className="space-y-2">
            <label htmlFor="vatTaxId" className="text-sm font-medium">
              {t('report.companyVehicle.vatTaxId')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="vatTaxId"
              placeholder={t('report.companyVehicle.vatTaxIdPlaceholder')}
              value={data.vatTaxId || ''}
              onChange={(e) => onChange('vatTaxId', e.target.value)}
              className={errors.vatTaxId ? 'border-destructive' : ''}
            />
            {errors.vatTaxId && (
              <p className="text-sm text-destructive">{errors.vatTaxId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('report.companyVehicle.vatTaxIdHint')}
            </p>
          </div>

          {/* Company Address */}
          <div className="space-y-4 border-l-2 border-primary/20 pl-4">
            <h4 className="text-sm font-semibold text-muted-foreground">
              {t('report.companyVehicle.companyAddress.title')}
            </h4>

            <div className="space-y-2">
              <label htmlFor="companyStreet" className="text-sm font-medium">
                {t('report.companyVehicle.street')} <span className="text-destructive">*</span>
              </label>
              <Input
                id="companyStreet"
                placeholder={t('report.companyVehicle.streetPlaceholder')}
                value={data.companyStreet || ''}
                onChange={(e) => onChange('companyStreet', e.target.value)}
                className={errors.companyStreet ? 'border-destructive' : ''}
              />
              {errors.companyStreet && (
                <p className="text-sm text-destructive">{errors.companyStreet}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyCity" className="text-sm font-medium">
                  {t('report.companyVehicle.city')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="companyCity"
                  placeholder={t('report.companyVehicle.cityPlaceholder')}
                  value={data.companyCity || ''}
                  onChange={(e) => onChange('companyCity', e.target.value)}
                  className={errors.companyCity ? 'border-destructive' : ''}
                />
                {errors.companyCity && (
                  <p className="text-sm text-destructive">{errors.companyCity}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="companyPostalCode" className="text-sm font-medium">
                  {t('report.companyVehicle.postalCode')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="companyPostalCode"
                  placeholder={t('report.companyVehicle.postalCodePlaceholder')}
                  value={data.companyPostalCode || ''}
                  onChange={(e) => onChange('companyPostalCode', e.target.value)}
                  className={errors.companyPostalCode ? 'border-destructive' : ''}
                />
                {errors.companyPostalCode && (
                  <p className="text-sm text-destructive">{errors.companyPostalCode}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="companyCountry" className="text-sm font-medium">
                {t('report.companyVehicle.country')} <span className="text-destructive">*</span>
              </label>
              <Select
                value={data.companyCountry || ''}
                onValueChange={(value) => onChange('companyCountry', value)}
              >
                <SelectTrigger className={`h-12 ${errors.companyCountry ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder={t('report.companyVehicle.countryPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    country.value === 'SEPARATOR' ? (
                      <div key="separator" className="px-2 py-1 text-xs text-muted-foreground border-t my-1">
                        {t('report.companyVehicle.allCountries')}
                      </div>
                    ) : (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
              {errors.companyCountry && (
                <p className="text-sm text-destructive">{errors.companyCountry}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Information Section */}
        <div className="border-t pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Car className="h-5 w-5 text-primary" />
              {t('report.companyVehicle.vehicleSection.title')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Make */}
              <div className="space-y-2">
                <label htmlFor="vehicleMake" className="text-sm font-medium">
                  {t('report.companyVehicle.vehicleMake')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleMake"
                  placeholder={t('report.companyVehicle.vehicleMakePlaceholder')}
                  value={data.vehicleMake || ''}
                  onChange={(e) => onChange('vehicleMake', e.target.value)}
                  className={errors.vehicleMake ? 'border-destructive' : ''}
                />
                {errors.vehicleMake && (
                  <p className="text-sm text-destructive">{errors.vehicleMake}</p>
                )}
              </div>

              {/* Vehicle Model */}
              <div className="space-y-2">
                <label htmlFor="vehicleModel" className="text-sm font-medium">
                  {t('report.companyVehicle.vehicleModel')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleModel"
                  placeholder={t('report.companyVehicle.vehicleModelPlaceholder')}
                  value={data.vehicleModel || ''}
                  onChange={(e) => onChange('vehicleModel', e.target.value)}
                  className={errors.vehicleModel ? 'border-destructive' : ''}
                />
                {errors.vehicleModel && (
                  <p className="text-sm text-destructive">{errors.vehicleModel}</p>
                )}
              </div>

              {/* Vehicle Color */}
              <div className="space-y-2">
                <label htmlFor="vehicleColor" className="text-sm font-medium">
                  {t('report.companyVehicle.vehicleColor')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleColor"
                  placeholder={t('report.companyVehicle.vehicleColorPlaceholder')}
                  value={data.vehicleColor || ''}
                  onChange={(e) => onChange('vehicleColor', e.target.value)}
                  className={errors.vehicleColor ? 'border-destructive' : ''}
                />
                {errors.vehicleColor && (
                  <p className="text-sm text-destructive">{errors.vehicleColor}</p>
                )}
              </div>

              {/* License Plate */}
              <div className="space-y-2">
                <label htmlFor="vehicleLicensePlate" className="text-sm font-medium">
                  {t('report.companyVehicle.licensePlate')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleLicensePlate"
                  placeholder={t('report.companyVehicle.licensePlatePlaceholder')}
                  value={data.vehicleLicensePlate || ''}
                  onChange={(e) => onChange('vehicleLicensePlate', e.target.value)}
                  className={errors.vehicleLicensePlate ? 'border-destructive' : ''}
                />
                {errors.vehicleLicensePlate && (
                  <p className="text-sm text-destructive">{errors.vehicleLicensePlate}</p>
                )}
              </div>
            </div>

            {/* VIN Number - Full Width */}
            <div className="space-y-2">
              <label htmlFor="vehicleVin" className="text-sm font-medium">
                {t('report.companyVehicle.vin')} <span className="text-destructive">*</span>
              </label>
              <Input
                id="vehicleVin"
                placeholder={t('report.companyVehicle.vinPlaceholder')}
                value={data.vehicleVin || ''}
                onChange={(e) => onChange('vehicleVin', e.target.value.toUpperCase())}
                maxLength={17}
                className={errors.vehicleVin ? 'border-destructive' : ''}
              />
              {errors.vehicleVin && (
                <p className="text-sm text-destructive">{errors.vehicleVin}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.companyVehicle.vinError')}
              </p>
            </div>

            {/* Registered Owner */}
            <div className="space-y-2">
              <label htmlFor="registeredOwner" className="text-sm font-medium">
                {t('report.companyVehicle.registeredOwner')} <span className="text-destructive">*</span>
              </label>
              <Input
                id="registeredOwner"
                placeholder={t('report.companyVehicle.registeredOwnerPlaceholder')}
                value={data.registeredOwner || ''}
                onChange={(e) => onChange('registeredOwner', e.target.value)}
                className={errors.registeredOwner ? 'border-destructive' : ''}
              />
              {errors.registeredOwner && (
                <p className="text-sm text-destructive">{errors.registeredOwner}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('report.companyVehicle.registeredOwnerHint')}
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">{t('report.companyVehicle.importantInfo.title')}</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              {(tv<string[]>('report.companyVehicle.importantInfo.items') || []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
