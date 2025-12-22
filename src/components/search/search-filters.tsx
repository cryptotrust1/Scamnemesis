'use client';

import { useState } from 'react';
import { Search, Filter, X, Sparkles, Target, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SearchFilters {
  query: string;
  fraudType: string;
  country: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  searchMode: 'auto' | 'fuzzy' | 'exact';
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
}

// Fraud types matching Prisma FraudType enum
const fraudTypes = [
  { value: 'all', label: 'Všetky typy' },
  { value: 'INVESTMENT_FRAUD', label: 'Investičný podvod' },
  { value: 'ROMANCE_SCAM', label: 'Romance scam' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'IDENTITY_THEFT', label: 'Krádež identity' },
  { value: 'ONLINE_SHOPPING_FRAUD', label: 'E-commerce podvod' },
  { value: 'CRYPTOCURRENCY_SCAM', label: 'Crypto podvod' },
  { value: 'EMPLOYMENT_SCAM', label: 'Pracovný podvod' },
  { value: 'RENTAL_SCAM', label: 'Podvod s prenájmom' },
  { value: 'ADVANCE_FEE_FRAUD', label: 'Podvod s pôžičkou' },
  { value: 'FAKE_CHARITY', label: 'Falošná charita' },
  { value: 'TECH_SUPPORT_SCAM', label: 'Tech support scam' },
  { value: 'LOTTERY_PRIZE_SCAM', label: 'Loterný podvod' },
];

const countries = [
  { value: 'all', label: 'Všetky krajiny' },
  { value: 'SK', label: 'Slovensko' },
  { value: 'CZ', label: 'Česká republika' },
  { value: 'PL', label: 'Poľsko' },
  { value: 'HU', label: 'Maďarsko' },
  { value: 'AT', label: 'Rakúsko' },
  { value: 'DE', label: 'Nemecko' },
  { value: 'OTHER', label: 'Iné' },
];

const statuses = [
  { value: 'all', label: 'Všetky stavy' },
  { value: 'PENDING', label: 'Čaká na schválenie' },
  { value: 'UNDER_REVIEW', label: 'V procese schvaľovania' },
  { value: 'APPROVED', label: 'Schválené' },
  { value: 'REJECTED', label: 'Zamietnuté' },
  { value: 'MERGED', label: 'Zlúčené' },
  { value: 'ARCHIVED', label: 'Archivované' },
];

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = () => {
    return (
      filters.fraudType !== 'all' ||
      filters.country !== 'all' ||
      filters.status !== 'all' ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.amountMin ||
      filters.amountMax
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.fraudType !== 'all') count++;
    if (filters.country !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    return count;
  };

  const handleReset = () => {
    onReset();
    setShowAdvanced(false);
  };

  const removeFilter = (key: keyof SearchFilters) => {
    const defaultValues: Record<string, string> = {
      fraudType: 'all',
      country: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    };
    updateFilter(key, defaultValues[key] || '');
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-[#0E74FF]" />
            Vyhľadávanie a filtre
          </CardTitle>
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <X className="h-4 w-4 mr-1" />
              Zrušiť ({getActiveFilterCount()})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Main Search Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Meno, telefón, email, IBAN, web..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="pl-10 h-12 text-base border-2 focus:border-[#0E74FF] transition-colors"
              />
            </div>
          </div>

          {/* Search Button - Full Width */}
          <Button
            onClick={onSearch}
            className="w-full h-12 bg-[#0E74FF] hover:bg-[#0a5ed4] text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Search className="h-5 w-5 mr-2" />
            Vyhľadať
          </Button>
        </div>

        {/* Search Mode Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Režim vyhľadávania</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateFilter('searchMode', 'auto')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                filters.searchMode === 'auto'
                  ? 'border-[#0E74FF] bg-[#0E74FF]/10 text-[#0E74FF]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Auto
            </button>
            <button
              type="button"
              onClick={() => updateFilter('searchMode', 'fuzzy')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                filters.searchMode === 'fuzzy'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Fuzzy
            </button>
            <button
              type="button"
              onClick={() => updateFilter('searchMode', 'exact')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                filters.searchMode === 'exact'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Target className="h-4 w-4" />
              Presné
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {filters.searchMode === 'auto' && 'Automaticky zvolí najlepší režim pre váš dotaz'}
            {filters.searchMode === 'fuzzy' && 'Toleruje preklepy a podobné výrazy'}
            {filters.searchMode === 'exact' && 'Hľadá presné zhody'}
          </p>
        </div>

        {/* Quick Filters */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Typ podvodu</label>
            <Select value={filters.fraudType} onValueChange={(value) => updateFilter('fraudType', value)}>
              <SelectTrigger className="h-11 border-2 focus:border-[#0E74FF]">
                <SelectValue placeholder="Vyberte typ" />
              </SelectTrigger>
              <SelectContent>
                {fraudTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Krajina / Lokalita</label>
            <Select value={filters.country} onValueChange={(value) => updateFilter('country', value)}>
              <SelectTrigger className="h-11 border-2 focus:border-[#0E74FF]">
                <SelectValue placeholder="Vyberte krajinu" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger className="h-11 border-2 focus:border-[#0E74FF]">
                <SelectValue placeholder="Vyberte status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {showAdvanced ? 'Skryť pokročilé filtre' : 'Dátum a suma'}
          {showAdvanced ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dátum od</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="h-11 border-2 focus:border-[#0E74FF]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dátum do</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="h-11 border-2 focus:border-[#0E74FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Suma od (EUR)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.amountMin}
                  onChange={(e) => updateFilter('amountMin', e.target.value)}
                  className="h-11 border-2 focus:border-[#0E74FF]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Suma do (EUR)</label>
                <Input
                  type="number"
                  placeholder="100 000"
                  value={filters.amountMax}
                  onChange={(e) => updateFilter('amountMax', e.target.value)}
                  className="h-11 border-2 focus:border-[#0E74FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-slate-700">Aktívne filtre:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.fraudType !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-[#0E74FF]/10 text-[#0E74FF] border border-[#0E74FF]/20 hover:bg-[#0E74FF]/20 cursor-pointer"
                  onClick={() => removeFilter('fraudType')}
                >
                  {fraudTypes.find((t) => t.value === filters.fraudType)?.label}
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.country !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 cursor-pointer"
                  onClick={() => removeFilter('country')}
                >
                  {countries.find((c) => c.value === filters.country)?.label}
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 cursor-pointer"
                  onClick={() => removeFilter('status')}
                >
                  {statuses.find((s) => s.value === filters.status)?.label}
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 cursor-pointer"
                  onClick={() => removeFilter('dateFrom')}
                >
                  Od: {filters.dateFrom}
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 cursor-pointer"
                  onClick={() => removeFilter('dateTo')}
                >
                  Do: {filters.dateTo}
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.amountMin && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 cursor-pointer"
                  onClick={() => removeFilter('amountMin')}
                >
                  Min: {filters.amountMin} €
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
              {filters.amountMax && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1.5 bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 cursor-pointer"
                  onClick={() => removeFilter('amountMax')}
                >
                  Max: {filters.amountMax} €
                  <X className="h-3.5 w-3.5 ml-1.5" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
