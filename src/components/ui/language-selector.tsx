'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { i18n, type Locale } from '@/i18n/config';

const localeNames: Record<Locale, string> = {
  sk: 'Slovensky',
  en: 'English',
  cs: 'Čeština',
  de: 'Deutsch',
};

const localeFlags: Record<Locale, string> = {
  sk: '🇸🇰',
  en: '🇬🇧',
  cs: '🇨🇿',
  de: '🇩🇪',
};

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
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current locale from pathname
  const getCurrentLocale = (): Locale => {
    if (!pathname) return i18n.defaultLocale;
    const segments = pathname.split('/');
    const potentialLocale = segments[1];
    if (i18n.locales.includes(potentialLocale as Locale)) {
      return potentialLocale as Locale;
    }
    return i18n.defaultLocale;
  };

  const currentLocale = getCurrentLocale();

  // Prevent hydration mismatch by showing default until mounted
  const displayLocale = mounted ? currentLocale : i18n.defaultLocale;

  // Navigate to new locale
  const changeLocale = (newLocale: Locale) => {
    const currentPath = pathname || '/';
    const segments = currentPath.split('/');
    const currentPathLocale = segments[1];

    let newPath: string;
    if (i18n.locales.includes(currentPathLocale as Locale)) {
      // Replace existing locale in path
      segments[1] = newLocale;
      newPath = segments.join('/');
    } else {
      // Add locale prefix to path
      newPath = `/${newLocale}${currentPath}`;
    }

    // Store locale preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }

    router.push(newPath);
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        {i18n.locales.map((loc) => (
          <Button
            key={loc}
            variant={displayLocale === loc ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeLocale(loc)}
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
    <Select value={displayLocale} onValueChange={(value) => changeLocale(value as Locale)}>
      <SelectTrigger className={`w-auto min-w-[120px] ${className || ''}`}>
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {showFlags && <span className="mr-1">{localeFlags[displayLocale]}</span>}
          {showLabel ? localeNames[displayLocale] : displayLocale.toUpperCase()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {i18n.locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {showFlags && <span className="mr-2">{localeFlags[loc]}</span>}
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
