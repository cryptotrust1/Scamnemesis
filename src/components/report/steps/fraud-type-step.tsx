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
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Fraud types matching Prisma FraudType enum
const fraudTypes = [
  {
    value: 'INVESTMENT_FRAUD',
    label: 'Investičný podvod',
    description: 'Falošné investičné ponuky, pyramídové schémy, podvody s akciami',
    icon: TrendingUp,
    color: 'text-red-500',
  },
  {
    value: 'ROMANCE_SCAM',
    label: 'Romance scam',
    description: 'Podvody na zoznamkách, falošné vzťahy, vylákanie peňazí',
    icon: Heart,
    color: 'text-pink-500',
  },
  {
    value: 'PHISHING',
    label: 'Phishing',
    description: 'Podvodné emaily, SMS, falošné webové stránky',
    icon: Mail,
    color: 'text-orange-500',
  },
  {
    value: 'IDENTITY_THEFT',
    label: 'Krádež identity',
    description: 'Zneužitie osobných údajov, dokumentov, identít',
    icon: User,
    color: 'text-purple-500',
  },
  {
    value: 'ONLINE_SHOPPING_FRAUD',
    label: 'E-commerce podvod',
    description: 'Falošné e-shopy, nedodanie tovaru, podvodné platby',
    icon: ShoppingCart,
    color: 'text-cyan-500',
  },
  {
    value: 'CRYPTOCURRENCY_SCAM',
    label: 'Crypto podvod',
    description: 'Podvody s kryptomenami, falošné burzy, rug pulls',
    icon: Coins,
    color: 'text-amber-500',
  },
  {
    value: 'EMPLOYMENT_SCAM',
    label: 'Pracovný podvod',
    description: 'Falošné pracovné ponuky, podvody pri hľadaní práce',
    icon: Briefcase,
    color: 'text-blue-500',
  },
  {
    value: 'RENTAL_SCAM',
    label: 'Podvod s prenájmom',
    description: 'Falošné inzeráty na bývanie, podvodné zálohy',
    icon: Home,
    color: 'text-green-500',
  },
  {
    value: 'ADVANCE_FEE_FRAUD',
    label: 'Podvod s pôžičkou',
    description: 'Falošné pôžičky, predražené úvery, poplatky vopred',
    icon: CreditCard,
    color: 'text-yellow-500',
  },
  {
    value: 'FAKE_CHARITY',
    label: 'Falošná charita',
    description: 'Podvodné zbierky, falošné charity, scam fundraising',
    icon: HeartHandshake,
    color: 'text-rose-500',
  },
  {
    value: 'TECH_SUPPORT_SCAM',
    label: 'Tech support scam',
    description: 'Falošná technická podpora, podvodné hovory',
    icon: Phone,
    color: 'text-indigo-500',
  },
  {
    value: 'LOTTERY_PRIZE_SCAM',
    label: 'Loterný podvod',
    description: 'Falošné výhry, podvodné lotérie a súťaže',
    icon: Gift,
    color: 'text-emerald-500',
  },
  {
    value: 'OTHER',
    label: 'Iný typ',
    description: 'Iný druh podvodu nezahrnutý vo vyššie uvedených kategóriách',
    icon: HelpCircle,
    color: 'text-gray-500',
  },
];

interface FraudTypeStepProps {
  selectedType?: string;
  onSelect: (type: string) => void;
}

export function FraudTypeStep({ selectedType, onSelect }: FraudTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Vyberte typ podvodu</h2>
        <p className="text-muted-foreground">
          Vyberte kategóriu, ktorá najlepšie opisuje incident, ktorý chcete nahlásiť
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fraudTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;

          return (
            <Card
              key={type.value}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary shadow-md'
              )}
              onClick={() => onSelect(type.value)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-muted', isSelected && 'bg-primary/10')}>
                    <Icon className={cn('h-6 w-6', type.color, isSelected && 'text-primary')} />
                  </div>
                  <CardTitle className="text-base">{type.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Vybraté:</span>{' '}
            {fraudTypes.find((t) => t.value === selectedType)?.label}
          </p>
        </div>
      )}
    </div>
  );
}
