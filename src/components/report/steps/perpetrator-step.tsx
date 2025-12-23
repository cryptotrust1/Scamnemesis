'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PerpetratorForm } from '@/lib/validations/report';
import { User, Building2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

interface PerpetratorStepProps {
  data: Partial<PerpetratorForm>;
  errors: Partial<Record<keyof PerpetratorForm, string>>;
  onChange: (field: keyof PerpetratorForm, value: string) => void;
}

export function PerpetratorStep({ data, errors, onChange }: PerpetratorStepProps) {
  const { t } = useTranslation();

  const perpetratorTypes = [
    { value: 'INDIVIDUAL', label: t('report.perpetrator.types.individual'), icon: User, description: t('report.perpetrator.types.individualDesc') },
    { value: 'COMPANY', label: t('report.perpetrator.types.company'), icon: Building2, description: t('report.perpetrator.types.companyDesc') },
    { value: 'UNKNOWN', label: t('report.perpetrator.types.unknown'), icon: HelpCircle, description: t('report.perpetrator.types.unknownDesc') },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('report.perpetrator.title')}</h2>
        <p className="text-muted-foreground">
          {t('report.perpetrator.subtitle')}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Perpetrator Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('report.perpetrator.typeLabel')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {perpetratorTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = data.perpetratorType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onChange('perpetratorType', type.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all text-center',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  <Icon className={cn('h-8 w-8 mb-2 flex-shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('font-medium text-sm break-words', isSelected && 'text-primary')}>{type.label}</span>
                  <span className="text-xs text-muted-foreground mt-1 break-words leading-relaxed">{type.description}</span>
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
                {data.perpetratorType === 'COMPANY' ? t('report.perpetrator.companyNameLabel') : t('report.perpetrator.nameLabel')}
              </label>
              <Input
                id="name"
                placeholder={data.perpetratorType === 'COMPANY' ? t('report.perpetrator.companyNamePlaceholder') : t('report.perpetrator.namePlaceholder')}
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
                    {t('report.perpetrator.businessName')}
                  </label>
                  <Input
                    id="companyName"
                    placeholder={t('report.perpetrator.businessNamePlaceholder')}
                    value={data.companyName || ''}
                    onChange={(e) => onChange('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="companyId" className="text-sm font-medium">
                    {t('report.perpetrator.companyId')}
                  </label>
                  <Input
                    id="companyId"
                    placeholder={t('report.perpetrator.companyIdPlaceholder')}
                    value={data.companyId || ''}
                    onChange={(e) => onChange('companyId', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Additional Individual Info */}
            {data.perpetratorType === 'INDIVIDUAL' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nickname" className="text-sm font-medium">
                      {t('report.perpetrator.nickname')}
                    </label>
                    <Input
                      id="nickname"
                      placeholder={t('report.perpetrator.nicknamePlaceholder')}
                      value={data.nickname || ''}
                      onChange={(e) => onChange('nickname', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      {t('report.perpetrator.username')}
                    </label>
                    <Input
                      id="username"
                      placeholder={t('report.perpetrator.usernamePlaceholder')}
                      value={data.username || ''}
                      onChange={(e) => onChange('username', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="approxAge" className="text-sm font-medium">
                      {t('report.perpetrator.approxAge')}
                    </label>
                    <Input
                      id="approxAge"
                      type="number"
                      min="0"
                      max="120"
                      placeholder={t('report.perpetrator.approxAgePlaceholder')}
                      value={data.approxAge || ''}
                      onChange={(e) => onChange('approxAge', e.target.value)}
                      className={errors.approxAge ? 'border-destructive' : ''}
                    />
                    {errors.approxAge && <p className="text-sm text-destructive">{errors.approxAge}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="nationality" className="text-sm font-medium">
                      {t('report.perpetrator.nationality')}
                    </label>
                    <Input
                      id="nationality"
                      placeholder={t('report.perpetrator.nationalityPlaceholder')}
                      value={data.nationality || ''}
                      onChange={(e) => onChange('nationality', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="physicalDescription" className="text-sm font-medium">
                    {t('report.perpetrator.physicalDescription')}
                  </label>
                  <Textarea
                    id="physicalDescription"
                    placeholder={t('report.perpetrator.physicalDescriptionPlaceholder')}
                    value={data.physicalDescription || ''}
                    onChange={(e) => onChange('physicalDescription', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('report.perpetrator.physicalDescriptionHint')}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">{t('report.perpetrator.contactInfo')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                {t('report.perpetrator.phone')}
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('report.perpetrator.phonePlaceholder')}
                value={data.phone || ''}
                onChange={(e) => onChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('report.perpetrator.email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t('report.perpetrator.emailPlaceholder')}
                value={data.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label htmlFor="socialMedia" className="text-sm font-medium">
              {t('report.perpetrator.socialMedia')}
            </label>
            <Input
              id="socialMedia"
              placeholder={t('report.perpetrator.socialMediaPlaceholder')}
              value={data.socialMedia || ''}
              onChange={(e) => onChange('socialMedia', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('report.perpetrator.socialMediaHint')}
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <label htmlFor="address" className="text-sm font-medium">
              {t('report.perpetrator.address')}
            </label>
            <Input
              id="address"
              placeholder={t('report.perpetrator.addressPlaceholder')}
              value={data.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
            />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> {t('report.perpetrator.tip')}
          </p>
        </div>
      </div>
    </div>
  );
}
