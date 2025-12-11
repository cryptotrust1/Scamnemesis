'use client';

import { Globe } from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { useI18n } from '@/lib/i18n/context';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons';
  showFlags?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = 'dropdown',
  showFlags = true,
  showLabel = false,
  className,
}: LanguageSelectorProps) {
  const { locale, setLocale } = useI18n();

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        {locales.map((loc) => (
          <Button
            key={loc}
            variant={locale === loc ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLocale(loc)}
            className="min-w-[40px]"
          >
            {showFlags && <span className="mr-1">{localeFlags[loc]}</span>}
            {loc.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className={`w-auto min-w-[120px] ${className || ''}`}>
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {showFlags && <span className="mr-1">{localeFlags[locale]}</span>}
          {showLabel ? localeNames[locale] : locale.toUpperCase()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {showFlags && <span className="mr-2">{localeFlags[loc]}</span>}
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
