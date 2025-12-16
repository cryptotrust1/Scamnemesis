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
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          Vyberte typ podvodu
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          Vyberte kategoriu, ktora najlepsie opisuje incident, ktory chcete nahlasit
        </p>
      </div>

      {/* Dropdown Select - Centered and Large */}
      <div className="max-w-xl mx-auto">
        <label
          htmlFor="fraud-type"
          className="block text-base font-semibold mb-3 text-gray-900 dark:text-white"
        >
          Typ podvodu <span className="text-red-500">*</span>
        </label>

        <Select value={selectedType || ''} onValueChange={onSelect}>
          <SelectTrigger
            id="fraud-type"
            className={cn(
              "w-full h-14 text-lg px-4 bg-white dark:bg-gray-800 border-2 rounded-xl",
              "text-gray-900 dark:text-white",
              "hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              selectedType
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600"
            )}
          >
            <SelectValue placeholder="-- Kliknite a vyberte typ podvodu --" />
          </SelectTrigger>
          <SelectContent className="max-h-[400px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            {fraudTypes.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="py-4 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <Icon className={cn('h-5 w-5', type.color)} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {type.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {type.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Selected Type Details */}
        {selectedFraudType && (
          <div className="mt-6 p-6 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                {SelectedIcon && (
                  <SelectedIcon className={cn('h-8 w-8', selectedFraudType.color)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {selectedFraudType.label}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedFraudType.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Helper Text when nothing selected */}
        {!selectedType && (
          <p className="text-base text-gray-500 dark:text-gray-400 text-center mt-6">
            Po vybere typu podvodu kliknite na tlacidlo <strong>&quot;Dalej&quot;</strong> pre pokracovanie
          </p>
        )}
      </div>
    </div>
  );
}
