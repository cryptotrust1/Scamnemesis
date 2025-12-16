'use client';

import {
  TrendingUp,
  Heart,
  Mail,
  User,
  ShoppingCart,
  Coins,
  Briefcase,
  Home,
  CreditCard,
  HeartHandshake,
  Phone,
  Gift,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Fraud types matching Prisma FraudType enum
const fraudTypes: Array<{
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  {
    value: 'INVESTMENT_FRAUD',
    label: 'Investicny podvod',
    description: 'Falosne investicne ponuky, pyramidove schemy, podvody s akciami',
    icon: TrendingUp,
    color: 'text-red-500',
  },
  {
    value: 'ROMANCE_SCAM',
    label: 'Romance scam',
    description: 'Podvody na zoznamkach, falosne vztahy, vylakanie penazi',
    icon: Heart,
    color: 'text-pink-500',
  },
  {
    value: 'PHISHING',
    label: 'Phishing',
    description: 'Podvodne emaily, SMS, falosne webove stranky',
    icon: Mail,
    color: 'text-orange-500',
  },
  {
    value: 'IDENTITY_THEFT',
    label: 'Kradez identity',
    description: 'Zneuzitie osobnych udajov, dokumentov, identit',
    icon: User,
    color: 'text-purple-500',
  },
  {
    value: 'ONLINE_SHOPPING_FRAUD',
    label: 'E-commerce podvod',
    description: 'Falosne e-shopy, nedodanie tovaru, podvodne platby',
    icon: ShoppingCart,
    color: 'text-cyan-500',
  },
  {
    value: 'CRYPTOCURRENCY_SCAM',
    label: 'Crypto podvod',
    description: 'Podvody s kryptomenami, falosne burzy, rug pulls',
    icon: Coins,
    color: 'text-amber-500',
  },
  {
    value: 'EMPLOYMENT_SCAM',
    label: 'Pracovny podvod',
    description: 'Falosne pracovne ponuky, podvody pri hladani prace',
    icon: Briefcase,
    color: 'text-blue-500',
  },
  {
    value: 'RENTAL_SCAM',
    label: 'Podvod s prenajmom',
    description: 'Falosne inzeraty na byvanie, podvodne zalohy',
    icon: Home,
    color: 'text-green-500',
  },
  {
    value: 'ADVANCE_FEE_FRAUD',
    label: 'Podvod s pozickou',
    description: 'Falosne pozicky, predrazene uvery, poplatky vopred',
    icon: CreditCard,
    color: 'text-yellow-500',
  },
  {
    value: 'FAKE_CHARITY',
    label: 'Falosna charita',
    description: 'Podvodne zbierky, falosne charity, scam fundraising',
    icon: HeartHandshake,
    color: 'text-rose-500',
  },
  {
    value: 'TECH_SUPPORT_SCAM',
    label: 'Tech support scam',
    description: 'Falosna technicka podpora, podvodne hovory',
    icon: Phone,
    color: 'text-indigo-500',
  },
  {
    value: 'LOTTERY_PRIZE_SCAM',
    label: 'Loterny podvod',
    description: 'Falosne vyhry, podvodne loterie a sutaze',
    icon: Gift,
    color: 'text-emerald-500',
  },
  {
    value: 'OTHER',
    label: 'Iny typ',
    description: 'Iny druh podvodu nezahrnuty vo vyssie uvedenych kategoriach',
    icon: HelpCircle,
    color: 'text-gray-500',
  },
];

interface FraudTypeStepProps {
  selectedType?: string;
  onSelect: (type: string) => void;
}

export function FraudTypeStep({ selectedType, onSelect }: FraudTypeStepProps) {
  const selectedFraudType = fraudTypes.find((t) => t.value === selectedType);
  const SelectedIcon = selectedFraudType?.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Vyberte typ podvodu</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Vyberte kategoriu, ktora najlepsie opisuje incident, ktory chcete nahlasit
        </p>
      </div>

      {/* Dropdown Select */}
      <div className="max-w-md mx-auto space-y-4">
        <label htmlFor="fraud-type" className="block text-sm font-medium mb-2">
          Typ podvodu <span className="text-destructive">*</span>
        </label>

        <Select value={selectedType || ''} onValueChange={onSelect}>
          <SelectTrigger
            id="fraud-type"
            className={cn(
              "w-full h-12 text-base",
              selectedType && "border-primary"
            )}
          >
            <SelectValue placeholder="-- Vyberte typ podvodu --" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {fraudTypes.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-5 w-5 flex-shrink-0', type.color)} />
                    <span className="font-medium">{type.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Selected Type Details */}
        {selectedFraudType && (
          <div className="mt-6 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                {SelectedIcon && (
                  <SelectedIcon className={cn('h-6 w-6', selectedFraudType.color)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-foreground">
                    {selectedFraudType.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFraudType.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Helper Text */}
        {!selectedType && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Po vybere typu podvodu budete moct pokracovat na dalsi krok
          </p>
        )}
      </div>

      {/* Quick Selection Cards - Optional Visual Aid */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Alebo vyberte priamo z kategorii:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {fraudTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onSelect(type.value)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border text-left transition-all',
                  'hover:border-primary hover:bg-primary/5',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : 'border-border bg-card'
                )}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0', type.color)} />
                <span className="text-sm font-medium truncate">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
