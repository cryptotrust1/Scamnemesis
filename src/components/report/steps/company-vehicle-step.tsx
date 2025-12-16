'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Car } from 'lucide-react';
import { getCountriesWithPriority } from '@/lib/constants/countries';
import { CompanyVehicleForm } from '@/lib/validations/report';

interface CompanyVehicleStepProps {
  data: Partial<CompanyVehicleForm>;
  errors: Partial<Record<keyof CompanyVehicleForm, string>>;
  onChange: (field: keyof CompanyVehicleForm, value: string) => void;
}

// Get countries with priority items at top
const countries = getCountriesWithPriority();

export function CompanyVehicleStep({ data, errors, onChange }: CompanyVehicleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Informácie o firme a vozidle</h2>
        <p className="text-muted-foreground">
          Zadajte údaje o firme a vozidle súvisiacich s podvodom
        </p>
      </div>

      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Company Information Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Informácie o firme
          </h3>

          {/* Company Name */}
          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium">
              Názov firmy <span className="text-destructive">*</span>
            </label>
            <Input
              id="companyName"
              placeholder="Napríklad: Example Trading s.r.o."
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
              IČO / DIČ / VAT ID <span className="text-destructive">*</span>
            </label>
            <Input
              id="vatTaxId"
              placeholder="Napríklad: SK2021234567 alebo 12345678"
              value={data.vatTaxId || ''}
              onChange={(e) => onChange('vatTaxId', e.target.value)}
              className={errors.vatTaxId ? 'border-destructive' : ''}
            />
            {errors.vatTaxId && (
              <p className="text-sm text-destructive">{errors.vatTaxId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Identifikačné číslo organizácie alebo daňové identifikačné číslo
            </p>
          </div>

          {/* Company Address */}
          <div className="space-y-4 border-l-2 border-primary/20 pl-4">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Adresa firmy
            </h4>

            <div className="space-y-2">
              <label htmlFor="companyStreet" className="text-sm font-medium">
                Ulica a číslo <span className="text-destructive">*</span>
              </label>
              <Input
                id="companyStreet"
                placeholder="Napríklad: Hlavná 123"
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
                  Mesto <span className="text-destructive">*</span>
                </label>
                <Input
                  id="companyCity"
                  placeholder="Napríklad: Bratislava"
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
                  PSČ <span className="text-destructive">*</span>
                </label>
                <Input
                  id="companyPostalCode"
                  placeholder="Napríklad: 82105"
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
                Krajina <span className="text-destructive">*</span>
              </label>
              <Select
                value={data.companyCountry || ''}
                onValueChange={(value) => onChange('companyCountry', value)}
              >
                <SelectTrigger className={`h-12 ${errors.companyCountry ? 'border-destructive' : ''}`}>
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
              Informácie o vozidle
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Make */}
              <div className="space-y-2">
                <label htmlFor="vehicleMake" className="text-sm font-medium">
                  Značka <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleMake"
                  placeholder="Napríklad: Toyota, BMW, Škoda"
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
                  Model <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleModel"
                  placeholder="Napríklad: Camry, X5, Octavia"
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
                  Farba <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleColor"
                  placeholder="Napríklad: Strieborná, Čierna, Biela"
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
                  EČV (Evidenčné číslo vozidla) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="vehicleLicensePlate"
                  placeholder="Napríklad: BA-123AB"
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
                VIN číslo (Vehicle Identification Number) <span className="text-destructive">*</span>
              </label>
              <Input
                id="vehicleVin"
                placeholder="17-znakový identifikátor vozidla"
                value={data.vehicleVin || ''}
                onChange={(e) => onChange('vehicleVin', e.target.value.toUpperCase())}
                maxLength={17}
                className={errors.vehicleVin ? 'border-destructive' : ''}
              />
              {errors.vehicleVin && (
                <p className="text-sm text-destructive">{errors.vehicleVin}</p>
              )}
              <p className="text-xs text-muted-foreground">
                VIN musí obsahovať presne 17 znakov (písmená a čísla). Napríklad: 1HGBH41JXMN109186
              </p>
            </div>

            {/* Registered Owner */}
            <div className="space-y-2">
              <label htmlFor="registeredOwner" className="text-sm font-medium">
                Registrovaný vlastník <span className="text-destructive">*</span>
              </label>
              <Input
                id="registeredOwner"
                placeholder="Meno a priezvisko alebo názov firmy"
                value={data.registeredOwner || ''}
                onChange={(e) => onChange('registeredOwner', e.target.value)}
                className={errors.registeredOwner ? 'border-destructive' : ''}
              />
              {errors.registeredOwner && (
                <p className="text-sm text-destructive">{errors.registeredOwner}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Zadajte meno vlastníka podľa technického preukazu vozidla
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Dôležité informácie:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Všetky údaje budú overené pred zverejnením</li>
              <li>VIN číslo nájdete v technickom preukaze vozidla alebo na ráme vozidla</li>
              <li>Citlivé údaje budú maskované na ochranu vášho súkromia</li>
              <li>Tieto informácie pomôžu identifikovať a varovať ostatných pred podvodom</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
