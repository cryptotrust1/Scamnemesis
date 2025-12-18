'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
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

  const handleReset = () => {
    onReset();
    setShowAdvanced(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Vyhľadávanie a filtre
          </CardTitle>
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Zrušiť filtre
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Vyhľadajte meno, telefón, email, IBAN, web..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            Hľadať
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Typ podvodu</label>
            <Select value={filters.fraudType} onValueChange={(value) => updateFilter('fraudType', value)}>
              <SelectTrigger>
                <SelectValue />
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
            <label className="text-sm font-medium">Krajina</label>
            <Select value={filters.country} onValueChange={(value) => updateFilter('country', value)}>
              <SelectTrigger>
                <SelectValue />
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
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue />
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
          className="w-full"
        >
          {showAdvanced ? 'Skryť pokročilé filtre' : 'Zobraziť pokročilé filtre'}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dátum od</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dátum do</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Suma od (EUR)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.amountMin}
                  onChange={(e) => updateFilter('amountMin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Suma do (EUR)</label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.amountMax}
                  onChange={(e) => updateFilter('amountMax', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Aktívne filtre:</span>
            {filters.fraudType !== 'all' && (
              <Badge variant="secondary">
                {fraudTypes.find((t) => t.value === filters.fraudType)?.label}
              </Badge>
            )}
            {filters.country !== 'all' && (
              <Badge variant="secondary">
                {countries.find((c) => c.value === filters.country)?.label}
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge variant="secondary">
                {statuses.find((s) => s.value === filters.status)?.label}
              </Badge>
            )}
            {filters.dateFrom && <Badge variant="secondary">Od: {filters.dateFrom}</Badge>}
            {filters.dateTo && <Badge variant="secondary">Do: {filters.dateTo}</Badge>}
            {filters.amountMin && <Badge variant="secondary">Min: {filters.amountMin} EUR</Badge>}
            {filters.amountMax && <Badge variant="secondary">Max: {filters.amountMax} EUR</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
