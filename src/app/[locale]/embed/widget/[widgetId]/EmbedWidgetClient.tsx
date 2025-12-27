'use client';

/**
 * Embed Widget Client Component
 *
 * Handles:
 * - Widget theming via CSS variables
 * - Search functionality
 * - Height synchronization with parent window via postMessage
 * - Report button linking to main site
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WidgetConfig {
  id: string;
  name: string;
  locale: string;
  theme: 'LIGHT' | 'DARK';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  showReportButton: boolean;
  showAdvancedByDefault: boolean;
  defaultSearchMode: 'auto' | 'fuzzy' | 'exact';
}

interface EmbedWidgetClientProps {
  widget: WidgetConfig;
  locale: string;
}

interface SearchResult {
  id: string;
  title: string;
  fraudType: string;
  country: string;
  amount?: number;
  currency: string;
  status: string;
  createdAt: string;
  perpetratorName?: string;
}

// Translations for widget
const translations: Record<string, Record<string, string>> = {
  en: {
    searchPlaceholder: 'Search for scams, phone, email, IBAN, website...',
    searchButton: 'Search',
    noResults: 'No results found',
    noResultsDesc: 'Try different search terms or filters',
    loading: 'Searching...',
    reportScam: 'Report a Scam',
    viewDetails: 'View Details',
    poweredBy: 'Powered by ScamNemesis',
    showAdvanced: 'Advanced filters',
    hideAdvanced: 'Hide filters',
    fraudType: 'Fraud Type',
    allTypes: 'All Types',
    country: 'Country',
    allCountries: 'All Countries',
    searchMode: 'Search Mode',
    modeAuto: 'Auto',
    modeFuzzy: 'Fuzzy',
    modeExact: 'Exact',
    found: 'Found',
    results: 'results',
  },
  sk: {
    searchPlaceholder: 'Hľadať podvody, telefón, e-mail, IBAN, web...',
    searchButton: 'Hľadať',
    noResults: 'Nenašli sa žiadne výsledky',
    noResultsDesc: 'Skúste iné vyhľadávacie výrazy alebo filtre',
    loading: 'Vyhľadávam...',
    reportScam: 'Nahlásiť podvod',
    viewDetails: 'Zobraziť detail',
    poweredBy: 'Powered by ScamNemesis',
    showAdvanced: 'Rozšírené filtre',
    hideAdvanced: 'Skryť filtre',
    fraudType: 'Typ podvodu',
    allTypes: 'Všetky typy',
    country: 'Krajina',
    allCountries: 'Všetky krajiny',
    searchMode: 'Režim vyhľadávania',
    modeAuto: 'Auto',
    modeFuzzy: 'Podobné',
    modeExact: 'Presné',
    found: 'Nájdených',
    results: 'výsledkov',
  },
  cs: {
    searchPlaceholder: 'Hledat podvody, telefon, e-mail, IBAN, web...',
    searchButton: 'Hledat',
    noResults: 'Nenalezeny žádné výsledky',
    noResultsDesc: 'Zkuste jiné vyhledávací výrazy nebo filtry',
    loading: 'Vyhledávám...',
    reportScam: 'Nahlásit podvod',
    viewDetails: 'Zobrazit detail',
    poweredBy: 'Powered by ScamNemesis',
    showAdvanced: 'Rozšířené filtry',
    hideAdvanced: 'Skrýt filtry',
    fraudType: 'Typ podvodu',
    allTypes: 'Všechny typy',
    country: 'Země',
    allCountries: 'Všechny země',
    searchMode: 'Režim vyhledávání',
    modeAuto: 'Auto',
    modeFuzzy: 'Podobné',
    modeExact: 'Přesné',
    found: 'Nalezeno',
    results: 'výsledků',
  },
  de: {
    searchPlaceholder: 'Betrug, Telefon, E-Mail, IBAN, Website suchen...',
    searchButton: 'Suchen',
    noResults: 'Keine Ergebnisse gefunden',
    noResultsDesc: 'Versuchen Sie andere Suchbegriffe oder Filter',
    loading: 'Suche läuft...',
    reportScam: 'Betrug melden',
    viewDetails: 'Details anzeigen',
    poweredBy: 'Powered by ScamNemesis',
    showAdvanced: 'Erweiterte Filter',
    hideAdvanced: 'Filter ausblenden',
    fraudType: 'Betrugsart',
    allTypes: 'Alle Arten',
    country: 'Land',
    allCountries: 'Alle Länder',
    searchMode: 'Suchmodus',
    modeAuto: 'Auto',
    modeFuzzy: 'Ähnlich',
    modeExact: 'Exakt',
    found: 'Gefunden',
    results: 'Ergebnisse',
  },
};

// Fraud types
const fraudTypes = [
  'INVESTMENT_FRAUD',
  'ROMANCE_SCAM',
  'PHISHING',
  'IDENTITY_THEFT',
  'ONLINE_SHOPPING_FRAUD',
  'CRYPTOCURRENCY_SCAM',
  'EMPLOYMENT_SCAM',
  'RENTAL_SCAM',
  'ADVANCE_FEE_FRAUD',
  'FAKE_CHARITY',
  'TECH_SUPPORT_SCAM',
  'LOTTERY_PRIZE_SCAM',
];

const fraudTypeLabels: Record<string, Record<string, string>> = {
  en: {
    INVESTMENT_FRAUD: 'Investment Fraud',
    ROMANCE_SCAM: 'Romance Scam',
    PHISHING: 'Phishing',
    IDENTITY_THEFT: 'Identity Theft',
    ONLINE_SHOPPING_FRAUD: 'Online Shopping Fraud',
    CRYPTOCURRENCY_SCAM: 'Cryptocurrency Scam',
    EMPLOYMENT_SCAM: 'Employment Scam',
    RENTAL_SCAM: 'Rental Scam',
    ADVANCE_FEE_FRAUD: 'Advance Fee Fraud',
    FAKE_CHARITY: 'Fake Charity',
    TECH_SUPPORT_SCAM: 'Tech Support Scam',
    LOTTERY_PRIZE_SCAM: 'Lottery Prize Scam',
  },
  sk: {
    INVESTMENT_FRAUD: 'Investičný podvod',
    ROMANCE_SCAM: 'Romantický podvod',
    PHISHING: 'Phishing',
    IDENTITY_THEFT: 'Krádež identity',
    ONLINE_SHOPPING_FRAUD: 'E-shop podvod',
    CRYPTOCURRENCY_SCAM: 'Krypto podvod',
    EMPLOYMENT_SCAM: 'Pracovný podvod',
    RENTAL_SCAM: 'Podvod s prenájmom',
    ADVANCE_FEE_FRAUD: 'Záloha podvod',
    FAKE_CHARITY: 'Falošná charita',
    TECH_SUPPORT_SCAM: 'Tech support podvod',
    LOTTERY_PRIZE_SCAM: 'Lotériový podvod',
  },
  cs: {
    INVESTMENT_FRAUD: 'Investiční podvod',
    ROMANCE_SCAM: 'Romantický podvod',
    PHISHING: 'Phishing',
    IDENTITY_THEFT: 'Krádež identity',
    ONLINE_SHOPPING_FRAUD: 'E-shop podvod',
    CRYPTOCURRENCY_SCAM: 'Krypto podvod',
    EMPLOYMENT_SCAM: 'Pracovní podvod',
    RENTAL_SCAM: 'Podvod s pronájmem',
    ADVANCE_FEE_FRAUD: 'Záloha podvod',
    FAKE_CHARITY: 'Falešná charita',
    TECH_SUPPORT_SCAM: 'Tech support podvod',
    LOTTERY_PRIZE_SCAM: 'Loteriový podvod',
  },
  de: {
    INVESTMENT_FRAUD: 'Investitionsbetrug',
    ROMANCE_SCAM: 'Romance Scam',
    PHISHING: 'Phishing',
    IDENTITY_THEFT: 'Identitätsdiebstahl',
    ONLINE_SHOPPING_FRAUD: 'Online-Shopping-Betrug',
    CRYPTOCURRENCY_SCAM: 'Kryptowährungsbetrug',
    EMPLOYMENT_SCAM: 'Jobbetrug',
    RENTAL_SCAM: 'Mietbetrug',
    ADVANCE_FEE_FRAUD: 'Vorschussbetrug',
    FAKE_CHARITY: 'Falsche Wohltätigkeit',
    TECH_SUPPORT_SCAM: 'Tech-Support-Betrug',
    LOTTERY_PRIZE_SCAM: 'Lotteriegewinnbetrug',
  },
};

const countries = ['SK', 'CZ', 'PL', 'HU', 'AT', 'DE'];

export function EmbedWidgetClient({ widget, locale }: EmbedWidgetClientProps) {
  const t = translations[locale] || translations.en;
  const fraudLabels = fraudTypeLabels[locale] || fraudTypeLabels.en;

  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'auto' | 'fuzzy' | 'exact'>(widget.defaultSearchMode);
  const [fraudType, setFraudType] = useState('all');
  const [country, setCountry] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(widget.showAdvancedByDefault);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);

  // Send height to parent window
  const sendHeight = useCallback(() => {
    if (containerRef.current) {
      const height = containerRef.current.scrollHeight;
      window.parent.postMessage(
        { type: 'scamnemesis-widget-resize', height, widgetId: widget.id },
        '*'
      );
    }
  }, [widget.id]);

  // Observe height changes
  useEffect(() => {
    sendHeight();

    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [sendHeight, results, showAdvanced]);

  // Also send height on content changes
  useEffect(() => {
    sendHeight();
  }, [results, isLoading, hasSearched, showAdvanced, sendHeight]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: query,
        mode: searchMode,
        limit: '10',
      });

      if (fraudType !== 'all') {
        params.set('fraud_type', fraudType);
      }
      if (country !== 'all') {
        params.set('country', country);
      }

      const response = await fetch(`/api/v1/search?${params}`);
      const data = await response.json();

      if (data.results) {
        setResults(data.results.map((r: {
          id: string;
          title: string;
          fraudType: string;
          locationCountry: string;
          financialLossAmount?: number;
          currency: string;
          status: string;
          createdAt: string;
          perpetrators?: { fullName?: string }[];
        }) => ({
          id: r.id,
          title: r.title,
          fraudType: r.fraudType,
          country: r.locationCountry,
          amount: r.financialLossAmount,
          currency: r.currency || 'EUR',
          status: r.status,
          createdAt: r.createdAt,
          perpetratorName: r.perpetrators?.[0]?.fullName,
        })));
        setTotal(data.pagination?.total || data.results.length);
      } else {
        setResults([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // CSS variables for theming
  const themeStyles = {
    '--widget-primary': widget.primaryColor,
    '--widget-bg': widget.backgroundColor,
    '--widget-text': widget.textColor,
    '--widget-radius': `${widget.borderRadius}px`,
  } as React.CSSProperties;

  const isDark = widget.theme === 'DARK';

  return (
    <div
      ref={containerRef}
      style={themeStyles}
      className={`p-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
    >
      {/* Search Box */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            />
            <Input
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 h-12"
              style={{
                borderRadius: `var(--widget-radius)`,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#1f2937',
                borderColor: isDark ? '#334155' : '#e2e8f0',
              }}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="h-12 px-6"
            style={{
              borderRadius: `var(--widget-radius)`,
              backgroundColor: widget.primaryColor,
              color: '#ffffff',
            }}
          >
            {isLoading ? t.loading : t.searchButton}
          </Button>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-medium"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {t.searchMode}:
          </span>
          <div className="flex gap-1">
            {(['auto', 'fuzzy', 'exact'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSearchMode(mode)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-all ${
                  searchMode === mode
                    ? 'ring-2'
                    : ''
                }`}
                style={{
                  borderRadius: `var(--widget-radius)`,
                  backgroundColor: searchMode === mode
                    ? (mode === 'auto' ? `${widget.primaryColor}20` : mode === 'fuzzy' ? '#fef3c720' : '#dcfce720')
                    : (isDark ? '#1e293b' : '#f1f5f9'),
                  color: searchMode === mode
                    ? (mode === 'auto' ? widget.primaryColor : mode === 'fuzzy' ? '#d97706' : '#16a34a')
                    : (isDark ? '#94a3b8' : '#64748b'),
                  borderColor: searchMode === mode
                    ? (mode === 'auto' ? widget.primaryColor : mode === 'fuzzy' ? '#f59e0b' : '#22c55e')
                    : 'transparent',
                }}
              >
                {mode === 'auto' || mode === 'fuzzy' ? (
                  <Sparkles className="h-3.5 w-3.5" />
                ) : (
                  <Target className="h-3.5 w-3.5" />
                )}
                {t[`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}` as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: isDark ? '#94a3b8' : '#64748b' }}
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showAdvanced ? t.hideAdvanced : t.showAdvanced}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
            <div>
              <label
                className="text-xs font-medium mb-1 block"
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
              >
                {t.fraudType}
              </label>
              <Select value={fraudType} onValueChange={setFraudType}>
                <SelectTrigger
                  style={{
                    borderRadius: `var(--widget-radius)`,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1f2937',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  <SelectValue placeholder={t.allTypes} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allTypes}</SelectItem>
                  {fraudTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {fraudLabels[type] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="text-xs font-medium mb-1 block"
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
              >
                {t.country}
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger
                  style={{
                    borderRadius: `var(--widget-radius)`,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1f2937',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  <SelectValue placeholder={t.allCountries} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCountries}</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse p-4 rounded-lg"
                  style={{
                    borderRadius: `var(--widget-radius)`,
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  }}
                >
                  <div className="h-4 bg-slate-300 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card
              style={{
                borderRadius: `var(--widget-radius)`,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
              }}
            >
              <CardContent className="flex flex-col items-center py-8">
                <AlertTriangle
                  className="h-10 w-10 mb-3"
                  style={{ color: isDark ? '#475569' : '#cbd5e1' }}
                />
                <p
                  className="font-medium"
                  style={{ color: isDark ? '#f1f5f9' : '#1f2937' }}
                >
                  {t.noResults}
                </p>
                <p
                  className="text-sm"
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  {t.noResultsDesc}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p
                className="text-sm"
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
              >
                {t.found} <strong>{total}</strong> {t.results}
              </p>
              {results.map((result) => (
                <a
                  key={result.id}
                  href={`https://scamnemesis.com/${locale}/reports/${result.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card
                    className="overflow-hidden transition-all hover:shadow-md"
                    style={{
                      borderRadius: `var(--widget-radius)`,
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium truncate group-hover:underline"
                            style={{ color: isDark ? '#f1f5f9' : '#1f2937' }}
                          >
                            {result.title || result.perpetratorName || 'Report'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${widget.primaryColor}20`,
                                color: widget.primaryColor,
                              }}
                            >
                              {fraudLabels[result.fraudType] || result.fraudType}
                            </span>
                            {result.country && (
                              <span
                                className="text-xs"
                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                              >
                                {result.country}
                              </span>
                            )}
                            {result.amount && result.amount > 0 && (
                              <span
                                className="text-xs font-bold"
                                style={{ color: '#ef4444' }}
                              >
                                {new Intl.NumberFormat(locale, {
                                  style: 'currency',
                                  currency: result.currency,
                                }).format(result.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: widget.primaryColor }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-4 pt-3 border-t flex items-center justify-between"
        style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
      >
        {widget.showReportButton && (
          <a
            href={`https://scamnemesis.com/${locale}/report/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
            style={{ color: widget.primaryColor }}
          >
            {t.reportScam}
          </a>
        )}
        <a
          href="https://scamnemesis.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs"
          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
        >
          {t.poweredBy}
        </a>
      </div>
    </div>
  );
}
