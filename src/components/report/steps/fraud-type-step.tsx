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
import { useTranslation } from '@/lib/i18n/context';

// Fraud type icons and colors - labels come from translations
const fraudTypeConfig: Record<string, { icon: LucideIcon; color: string; translationKey: string }> = {
  INVESTMENT_FRAUD: { icon: TrendingUp, color: 'text-red-500', translationKey: 'investment' },
  ROMANCE_SCAM: { icon: Heart, color: 'text-pink-500', translationKey: 'romance' },
  PHISHING: { icon: Mail, color: 'text-orange-500', translationKey: 'phishing' },
  IDENTITY_THEFT: { icon: User, color: 'text-purple-500', translationKey: 'identity' },
  ONLINE_SHOPPING_FRAUD: { icon: ShoppingCart, color: 'text-cyan-500', translationKey: 'ecommerce' },
  CRYPTOCURRENCY_SCAM: { icon: Coins, color: 'text-amber-500', translationKey: 'crypto' },
  EMPLOYMENT_SCAM: { icon: Briefcase, color: 'text-blue-500', translationKey: 'job' },
  RENTAL_SCAM: { icon: Home, color: 'text-green-500', translationKey: 'rental' },
  ADVANCE_FEE_FRAUD: { icon: CreditCard, color: 'text-yellow-500', translationKey: 'loan' },
  FAKE_CHARITY: { icon: HeartHandshake, color: 'text-rose-500', translationKey: 'charity' },
  TECH_SUPPORT_SCAM: { icon: Phone, color: 'text-indigo-500', translationKey: 'techSupport' },
  LOTTERY_PRIZE_SCAM: { icon: Gift, color: 'text-emerald-500', translationKey: 'lottery' },
  OTHER: { icon: HelpCircle, color: 'text-gray-500', translationKey: 'other' },
};

const fraudTypeKeys = Object.keys(fraudTypeConfig);

interface FraudTypeStepProps {
  selectedType?: string;
  onSelect: (type: string) => void;
}

export function FraudTypeStep({ selectedType, onSelect }: FraudTypeStepProps) {
  const { translations } = useTranslation();
  const fraudTypeTranslations = translations.report?.fraudTypes || {};

  // Get translated label for a fraud type
  const getLabel = (typeKey: string) => {
    const config = fraudTypeConfig[typeKey];
    if (!config) return typeKey;
    return fraudTypeTranslations[config.translationKey as keyof typeof fraudTypeTranslations] || config.translationKey;
  };

  const selectedConfig = selectedType ? fraudTypeConfig[selectedType] : null;
  const SelectedIcon = selectedConfig?.icon;
  const selectedLabel = selectedType ? getLabel(selectedType) : '';

  // UI text translations
  const selectFraudType = translations.report?.steps?.fraudType?.title || 'Select Fraud Type';
  const selectDescription = translations.report?.fields?.description || 'Select the category that best describes your incident';
  const fraudTypeLabel = translations.search?.filters?.fraudType || 'Fraud Type';
  const selectPlaceholder = translations.common?.search || 'Click to select fraud type';
  const nextButtonHint = translations.common?.next || 'Next';

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          {selectFraudType}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          {selectDescription}
        </p>
      </div>

      {/* Dropdown Select - Centered and Large */}
      <div className="max-w-xl mx-auto">
        <label
          htmlFor="fraud-type"
          className="block text-base font-semibold mb-3 text-gray-900 dark:text-white"
        >
          {fraudTypeLabel} <span className="text-red-500">*</span>
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
            <SelectValue placeholder={`-- ${selectPlaceholder} --`} />
          </SelectTrigger>
          <SelectContent className="max-h-[400px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            {fraudTypeKeys.map((typeKey) => {
              const config = fraudTypeConfig[typeKey];
              const Icon = config.icon;
              const label = getLabel(typeKey);
              return (
                <SelectItem
                  key={typeKey}
                  value={typeKey}
                  className="py-4 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {label}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Selected Type Details */}
        {selectedConfig && (
          <div className="mt-6 p-6 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                {SelectedIcon && (
                  <SelectedIcon className={cn('h-8 w-8', selectedConfig.color)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {selectedLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Helper Text when nothing selected */}
        {!selectedType && (
          <p className="text-base text-gray-500 dark:text-gray-400 text-center mt-6">
            {translations.common?.next ? `${nextButtonHint}` : 'Select a fraud type to continue'}
          </p>
        )}
      </div>
    </div>
  );
}
