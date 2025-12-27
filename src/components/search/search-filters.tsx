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
import { useTranslation } from '@/lib/i18n/context';

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
const fraudTypeValues = [
  'all',
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

const countryValues = ['all', 'SK', 'CZ', 'PL', 'HU', 'AT', 'DE', 'OTHER'];

const statusValues = ['all', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MERGED', 'ARCHIVED'];

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useTranslation();

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

  const getFraudTypeLabel = (value: string) => t(`search.fraudTypes.${value}`);
  const getCountryLabel = (value: string) => t(`search.countries.${value}`);
  const getStatusLabel = (value: string) => t(`search.statuses.${value}`);

  return (
    <Card className="shadow-lg border-slate-200 bg-white">
      <CardHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center shadow-sm">
              <Filter className="h-4 w-4 text-white" />
            </div>
            {t('search.filtersPanel.title')}
          </CardTitle>
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
              <X className="h-4 w-4 mr-1" />
              {t('search.filtersPanel.reset')} ({getActiveFilterCount()})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Main Search Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.filtersPanel.searchPlaceholder')}
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
            {t('search.filtersPanel.searchButton')}
          </Button>
        </div>

        {/* Search Mode Toggle */}
        <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
          <label className="text-sm font-semibold text-slate-700">{t('search.filtersPanel.searchMode')}</label>
          <div className="grid grid-cols-3 gap-2.5">
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
              {t('search.filtersPanel.modeAuto')}
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
              {t('search.filtersPanel.modeFuzzy')}
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
              {t('search.filtersPanel.modeExact')}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {filters.searchMode === 'auto' && t('search.filtersPanel.modeAutoDesc')}
            {filters.searchMode === 'fuzzy' && t('search.filtersPanel.modeFuzzyDesc')}
            {filters.searchMode === 'exact' && t('search.filtersPanel.modeExactDesc')}
          </p>
        </div>

        {/* Quick Filters */}
        <div className="space-y-5">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {t('search.filters.fraudType')}
            </label>
            <Select value={filters.fraudType} onValueChange={(value) => updateFilter('fraudType', value)}>
              <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white hover:bg-slate-50 transition-colors">
                <SelectValue placeholder={t('search.filtersPanel.selectFraudType')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {fraudTypeValues.map((value) => (
                  <SelectItem key={value} value={value} className="rounded-lg">
                    {getFraudTypeLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t('search.filtersPanel.countryLocation')}
            </label>
            <Select value={filters.country} onValueChange={(value) => updateFilter('country', value)}>
              <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white hover:bg-slate-50 transition-colors">
                <SelectValue placeholder={t('search.filtersPanel.selectCountry')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {countryValues.map((value) => (
                  <SelectItem key={value} value={value} className="rounded-lg">
                    {getCountryLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {t('search.filters.status')}
            </label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white hover:bg-slate-50 transition-colors">
                <SelectValue placeholder={t('search.filtersPanel.selectStatus')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {statusValues.map((value) => (
                  <SelectItem key={value} value={value} className="rounded-lg">
                    {getStatusLabel(value)}
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
          className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl py-3 border border-dashed border-slate-200"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {showAdvanced ? t('search.filtersPanel.hideAdvanced') : t('search.filtersPanel.showAdvanced')}
          {showAdvanced ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-5 p-4 bg-violet-50/30 rounded-xl border border-violet-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  {t('search.filters.dateFrom')}
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  {t('search.filters.dateTo')}
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {t('search.filtersPanel.amountFrom')}
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.amountMin}
                  onChange={(e) => updateFilter('amountMin', e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {t('search.filtersPanel.amountTo')}
                </label>
                <Input
                  type="number"
                  placeholder="100 000"
                  value={filters.amountMax}
                  onChange={(e) => updateFilter('amountMax', e.target.value)}
                  className="h-12 border-2 border-slate-200 focus:border-[#0E74FF] rounded-xl bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-slate-700">{t('search.filtersPanel.activeFilters')}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0E74FF] text-white text-xs font-medium">
                {getActiveFilterCount()}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {filters.fraudType !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-[#0E74FF]/10 text-[#0E74FF] border border-[#0E74FF]/20 hover:bg-[#0E74FF]/20 cursor-pointer transition-colors"
                  onClick={() => removeFilter('fraudType')}
                >
                  {getFraudTypeLabel(filters.fraudType)}
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
              {filters.country !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 cursor-pointer transition-colors"
                  onClick={() => removeFilter('country')}
                >
                  {getCountryLabel(filters.country)}
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 cursor-pointer transition-colors"
                  onClick={() => removeFilter('status')}
                >
                  {getStatusLabel(filters.status)}
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-200 cursor-pointer transition-colors"
                  onClick={() => removeFilter('dateFrom')}
                >
                  {t('search.filtersPanel.from')} {filters.dateFrom}
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-200 cursor-pointer transition-colors"
                  onClick={() => removeFilter('dateTo')}
                >
                  {t('search.filtersPanel.to')} {filters.dateTo}
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
              {filters.amountMin && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 cursor-pointer transition-colors"
                  onClick={() => removeFilter('amountMin')}
                >
                  {t('search.filtersPanel.min')} {filters.amountMin} €
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
              {filters.amountMax && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-1.5 py-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 cursor-pointer transition-colors"
                  onClick={() => removeFilter('amountMax')}
                >
                  {t('search.filtersPanel.max')} {filters.amountMax} €
                  <X className="h-3.5 w-3.5 ml-2" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
