'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PerpetratorForm } from '@/lib/validations/report';
import { User, Building2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerpetratorStepProps {
  data: Partial<PerpetratorForm>;
  errors: Partial<Record<keyof PerpetratorForm, string>>;
  onChange: (field: keyof PerpetratorForm, value: string) => void;
}

const perpetratorTypes = [
  { value: 'INDIVIDUAL', label: 'Fyzická osoba', icon: User, description: 'Jednotlivec, ktorý sa dopustil podvodu' },
  { value: 'COMPANY', label: 'Firma / Organizácia', icon: Building2, description: 'Spoločnosť alebo organizácia' },
  { value: 'UNKNOWN', label: 'Neznámy', icon: HelpCircle, description: 'Nepodarilo sa identifikovať páchateľa' },
];

export function PerpetratorStep({ data, errors, onChange }: PerpetratorStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Informácie o páchateľovi</h2>
        <p className="text-muted-foreground">
          Zadajte všetky dostupné informácie o osobe alebo firme, ktorá sa dopustila podvodu
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Perpetrator Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Typ páchateľa</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {perpetratorTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = data.perpetratorType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onChange('perpetratorType', type.value)}
                  className={cn(
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all text-center',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  <Icon className={cn('h-8 w-8 mb-2', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('font-medium text-sm', isSelected && 'text-primary')}>{type.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Personal / Company Info */}
        {data.perpetratorType !== 'UNKNOWN' && (
          <>
            {/* Name / Company Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {data.perpetratorType === 'COMPANY' ? 'Názov firmy' : 'Meno a priezvisko'}
              </label>
              <Input
                id="name"
                placeholder={data.perpetratorType === 'COMPANY' ? 'Napríklad: Scam Company s.r.o.' : 'Napríklad: Ján Podvodník'}
                value={data.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {data.perpetratorType === 'COMPANY' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Obchodné meno (ak sa líši)
                  </label>
                  <Input
                    id="companyName"
                    placeholder="Napríklad: Scam Trading"
                    value={data.companyName || ''}
                    onChange={(e) => onChange('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="companyId" className="text-sm font-medium">
                    IČO (voliteľné)
                  </label>
                  <Input
                    id="companyId"
                    placeholder="Napríklad: 12345678"
                    value={data.companyId || ''}
                    onChange={(e) => onChange('companyId', e.target.value)}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Kontaktné údaje páchateľa</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefónne číslo
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+421 900 123 456"
                value={data.phone || ''}
                onChange={(e) => onChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="podvodnik@example.com"
                value={data.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label htmlFor="website" className="text-sm font-medium">
              Webová stránka
            </label>
            <Input
              id="website"
              type="url"
              placeholder="https://podvodna-stranka.sk"
              value={data.website || ''}
              onChange={(e) => onChange('website', e.target.value)}
              className={errors.website ? 'border-destructive' : ''}
            />
            {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
          </div>

          <div className="space-y-2 mt-4">
            <label htmlFor="socialMedia" className="text-sm font-medium">
              Sociálne siete
            </label>
            <Input
              id="socialMedia"
              placeholder="Odkazy na Facebook, Instagram, Telegram..."
              value={data.socialMedia || ''}
              onChange={(e) => onChange('socialMedia', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Zadajte odkazy na profily na sociálnych sieťach oddelené čiarkou
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <label htmlFor="address" className="text-sm font-medium">
              Adresa (ak je známa)
            </label>
            <Input
              id="address"
              placeholder="Ulica, číslo, mesto, PSČ"
              value={data.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Finančné údaje</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="iban" className="text-sm font-medium">
                IBAN / Číslo účtu
              </label>
              <Input
                id="iban"
                placeholder="SK89 7500 0000 0000 1234 5678"
                value={data.iban || ''}
                onChange={(e) => onChange('iban', e.target.value)}
                className={errors.iban ? 'border-destructive' : ''}
              />
              {errors.iban && <p className="text-sm text-destructive">{errors.iban}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="bankAccount" className="text-sm font-medium">
                Názov banky / Ďalšie bankové údaje
              </label>
              <Input
                id="bankAccount"
                placeholder="Napríklad: Tatra banka"
                value={data.bankAccount || ''}
                onChange={(e) => onChange('bankAccount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cryptoWallet" className="text-sm font-medium">
                Krypto peňaženka
              </label>
              <Input
                id="cryptoWallet"
                placeholder="Bitcoin, Ethereum alebo iná adresa peňaženky"
                value={data.cryptoWallet || ''}
                onChange={(e) => onChange('cryptoWallet', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Zadajte celú adresu krypto peňaženky kam ste posielali peniaze
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Čím viac informácií poskytnete, tým lepšie budeme môcť varovať ostatných.
            Všetky citlivé údaje sú chránené a maskované podľa vašej úrovne prístupu.
          </p>
        </div>
      </div>
    </div>
  );
}
