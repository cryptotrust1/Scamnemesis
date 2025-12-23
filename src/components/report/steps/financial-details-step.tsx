'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialDetailsForm } from '@/lib/validations/report';
import { getCountriesWithPriority } from '@/lib/constants/countries';
import {
  Wallet,
  Building2,
  ChevronDown,
  ChevronUp,
  Info,
  Bitcoin,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialDetailsStepProps {
  data: Partial<FinancialDetailsForm>;
  errors: Partial<Record<keyof FinancialDetailsForm, string>>;
  onChange: (field: keyof FinancialDetailsForm, value: string) => void;
}

const countries = getCountriesWithPriority();

const blockchainOptions = [
  { value: 'BITCOIN', label: 'Bitcoin (BTC)' },
  { value: 'ETHEREUM', label: 'Ethereum (ETH)' },
  { value: 'TRON', label: 'Tron (TRX)' },
  { value: 'SOLANA', label: 'Solana (SOL)' },
  { value: 'BINANCE_SMART_CHAIN', label: 'Binance Smart Chain (BSC)' },
  { value: 'POLYGON', label: 'Polygon (MATIC)' },
  { value: 'CARDANO', label: 'Cardano (ADA)' },
  { value: 'RIPPLE', label: 'Ripple (XRP)' },
  { value: 'LITECOIN', label: 'Litecoin (LTC)' },
  { value: 'POLKADOT', label: 'Polkadot (DOT)' },
  { value: 'OTHER', label: 'Iný blockchain' },
];

const IBAN_PATTERNS = {
  SK: 'SK__ ____ ____ ____ ____ ____',
  CZ: 'CZ__ ____ ____ ____ ____ ____',
  PL: 'PL__ ____ ____ ____ ____ ____ ____',
  DE: 'DE__ ____ ____ ____ ____ __',
  AT: 'AT__ ____ ____ ____ ____',
  HU: 'HU__ ____ ____ ____ ____ ____ ____',
};

const WALLET_ADDRESS_HINTS = {
  BITCOIN: '1A1zP1... alebo bc1q... (26-35 znakov)',
  ETHEREUM: '0x... (42 znakov)',
  TRON: 'T... (34 znakov)',
  SOLANA: 'Base58 formát (32-44 znakov)',
  BINANCE_SMART_CHAIN: '0x... (42 znakov)',
  POLYGON: '0x... (42 znakov)',
};

export function FinancialDetailsStep({ data, errors, onChange }: FinancialDetailsStepProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    banking: true,
    crypto: false,
    paypal: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getIBANPlaceholder = (countryCode?: string) => {
    if (!countryCode) return 'SK89 7500 0000 0000 1234 5678';
    return IBAN_PATTERNS[countryCode as keyof typeof IBAN_PATTERNS] ||
           `${countryCode}__ ____ ____ ____ ____`;
  };

  const getWalletAddressHint = (blockchain?: string) => {
    if (!blockchain) return 'Adresa bude závislá od zvoleného blockchainu';
    return WALLET_ADDRESS_HINTS[blockchain as keyof typeof WALLET_ADDRESS_HINTS] ||
           'Zadajte platnú adresu peňaženky';
  };

  const hasBankingData = data.iban || data.accountHolderName || data.accountNumber ||
                          data.bankName || data.bankCountry || data.swiftBic;

  const hasCryptoData = data.walletAddress || data.blockchain || data.exchangeName ||
                        data.transactionHash;

  const hasPaypalData = data.paypalAccount;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Finančné údaje</h2>
        <p className="text-muted-foreground">
          Zadajte podrobnosti o finančných účtoch, kam ste posielali peniaze
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Dôležité informácie</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Vyplňte aspoň jednu sekciu (bankovú, krypto, alebo PayPal)</li>
                <li>Tieto údaje pomôžu identifikovať podvodníkov</li>
                <li>Všetky citlivé informácie sú šifrované a maskované</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Banking Information Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('banking')}
            aria-expanded={expandedSections.banking}
            className={cn(
              'w-full flex items-center justify-between p-4 transition-colors',
              'hover:bg-muted/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              hasBankingData && 'bg-primary/5 border-l-4 border-l-primary'
            )}
          >
            <div className="flex items-center gap-3">
              <Building2 className={cn(
                'h-5 w-5',
                hasBankingData ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="text-left">
                <h3 className="font-semibold">Bankové informácie</h3>
                <p className="text-sm text-muted-foreground">
                  IBAN, číslo účtu, SWIFT/BIC kód a ďalšie bankové údaje
                </p>
              </div>
            </div>
            {expandedSections.banking ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.banking && (
            <div className="p-4 border-t space-y-4">
              {/* IBAN */}
              <div className="space-y-2">
                <label htmlFor="iban" className="text-sm font-medium">
                  IBAN (International Bank Account Number)
                </label>
                <Input
                  id="iban"
                  placeholder={getIBANPlaceholder(data.bankCountry)}
                  value={data.iban || ''}
                  onChange={(e) => onChange('iban', e.target.value)}
                  className={errors.iban ? 'border-destructive' : ''}
                />
                {errors.iban && (
                  <p className="text-sm text-destructive">{errors.iban}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  IBAN začína kódom krajiny (napr. SK, CZ, PL) a obsahuje 15-34 znakov
                </p>
              </div>

              {/* Account Holder Name */}
              <div className="space-y-2">
                <label htmlFor="accountHolderName" className="text-sm font-medium">
                  Meno majiteľa účtu
                </label>
                <Input
                  id="accountHolderName"
                  placeholder="Napríklad: Ján Podvodník"
                  value={data.accountHolderName || ''}
                  onChange={(e) => onChange('accountHolderName', e.target.value)}
                  className={errors.accountHolderName ? 'border-destructive' : ''}
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-destructive">{errors.accountHolderName}</p>
                )}
              </div>

              {/* Account Number & Bank Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="accountNumber" className="text-sm font-medium">
                    Číslo účtu
                  </label>
                  <Input
                    id="accountNumber"
                    placeholder="Napríklad: 1234567890/1100"
                    value={data.accountNumber || ''}
                    onChange={(e) => onChange('accountNumber', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pre slovenské účty: číslo/kód banky
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bankName" className="text-sm font-medium">
                    Názov banky
                  </label>
                  <Input
                    id="bankName"
                    placeholder="Napríklad: Tatra banka"
                    value={data.bankName || ''}
                    onChange={(e) => onChange('bankName', e.target.value)}
                  />
                </div>
              </div>

              {/* Bank Country */}
              <div className="space-y-2">
                <label htmlFor="bankCountry" className="text-sm font-medium">
                  Krajina banky
                </label>
                <Select
                  value={data.bankCountry || ''}
                  onValueChange={(value) => onChange('bankCountry', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Vyberte krajinu banky" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      country.value === 'SEPARATOR' ? (
                        <div key="separator" className="px-2 py-1 text-xs text-muted-foreground border-t my-1">
                          Všetky krajiny
                        </div>
                      ) : (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SWIFT/BIC Code */}
              <div className="space-y-2">
                <label htmlFor="swiftBic" className="text-sm font-medium">
                  SWIFT/BIC kód
                </label>
                <Input
                  id="swiftBic"
                  placeholder="Napríklad: TATRSKBX"
                  value={data.swiftBic || ''}
                  onChange={(e) => onChange('swiftBic', e.target.value)}
                  maxLength={11}
                  className={errors.swiftBic ? 'border-destructive' : ''}
                />
                {errors.swiftBic && (
                  <p className="text-sm text-destructive">{errors.swiftBic}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  8 alebo 11 znakov (napr. TATRSKBX alebo TATRSKBXXXX)
                </p>
              </div>

              {/* Region-Specific Banking Codes */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-sm mb-3">Regionálne bankové kódy (voliteľné)</h4>

                <div className="space-y-4">
                  {/* USA - Routing Number */}
                  <div className="space-y-2">
                    <label htmlFor="routingNumber" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">USA</span>
                      Routing Number (ABA)
                    </label>
                    <Input
                      id="routingNumber"
                      placeholder="9-miestne číslo (napr. 021000021)"
                      value={data.routingNumber || ''}
                      onChange={(e) => onChange('routingNumber', e.target.value)}
                      maxLength={9}
                    />
                  </div>

                  {/* Australia - BSB Code */}
                  <div className="space-y-2">
                    <label htmlFor="bsbCode" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">AUS</span>
                      BSB Code
                    </label>
                    <Input
                      id="bsbCode"
                      placeholder="6-miestny kód (napr. 123-456)"
                      value={data.bsbCode || ''}
                      onChange={(e) => onChange('bsbCode', e.target.value)}
                      maxLength={7}
                    />
                  </div>

                  {/* UK - Sort Code */}
                  <div className="space-y-2">
                    <label htmlFor="sortCode" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">UK</span>
                      Sort Code
                    </label>
                    <Input
                      id="sortCode"
                      placeholder="6-miestny kód (napr. 12-34-56)"
                      value={data.sortCode || ''}
                      onChange={(e) => onChange('sortCode', e.target.value)}
                      maxLength={8}
                    />
                  </div>

                  {/* India - IFSC Code */}
                  <div className="space-y-2">
                    <label htmlFor="ifscCode" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">IND</span>
                      IFSC Code
                    </label>
                    <Input
                      id="ifscCode"
                      placeholder="11-miestny kód (napr. SBIN0001234)"
                      value={data.ifscCode || ''}
                      onChange={(e) => onChange('ifscCode', e.target.value)}
                      maxLength={11}
                    />
                  </div>

                  {/* China - CNAPS Code */}
                  <div className="space-y-2">
                    <label htmlFor="cnapsCode" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">CHN</span>
                      CNAPS Code
                    </label>
                    <Input
                      id="cnapsCode"
                      placeholder="12-miestny kód čínskej centrálnej banky"
                      value={data.cnapsCode || ''}
                      onChange={(e) => onChange('cnapsCode', e.target.value)}
                      maxLength={12}
                    />
                  </div>
                </div>
              </div>

              {/* Other Banking Details */}
              <div className="space-y-2">
                <label htmlFor="otherBankingDetails" className="text-sm font-medium">
                  Ďalšie bankové údaje
                </label>
                <Textarea
                  id="otherBankingDetails"
                  placeholder="Ďalšie poznámky alebo bankové informácie, ktoré môžu byť užitočné..."
                  value={data.otherBankingDetails || ''}
                  onChange={(e) => onChange('otherBankingDetails', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cryptocurrency Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('crypto')}
            aria-expanded={expandedSections.crypto}
            className={cn(
              'w-full flex items-center justify-between p-4 transition-colors',
              'hover:bg-muted/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              hasCryptoData && 'bg-primary/5 border-l-4 border-l-primary'
            )}
          >
            <div className="flex items-center gap-3">
              <Bitcoin className={cn(
                'h-5 w-5',
                hasCryptoData ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="text-left">
                <h3 className="font-semibold">Kryptomenové údaje</h3>
                <p className="text-sm text-muted-foreground">
                  Adresy peňaženiek, blockchain, burzy a transakcie
                </p>
              </div>
            </div>
            {expandedSections.crypto ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.crypto && (
            <div className="p-4 border-t space-y-4">
              {/* Blockchain Selection */}
              <div className="space-y-2">
                <label htmlFor="blockchain" className="text-sm font-medium">
                  Blockchain / Kryptomena
                </label>
                <Select
                  value={data.blockchain || ''}
                  onValueChange={(value) => onChange('blockchain', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Vyberte blockchain" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {blockchainOptions.map((blockchain) => (
                      <SelectItem key={blockchain.value} value={blockchain.value}>
                        {blockchain.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Vyberte blockchain, na ktorom sa nachádza peňaženka
                </p>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <label htmlFor="walletAddress" className="text-sm font-medium">
                  Adresa peňaženky <span className="text-destructive">*</span>
                </label>
                <Input
                  id="walletAddress"
                  placeholder={
                    data.blockchain === 'BITCOIN' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' :
                    data.blockchain === 'ETHEREUM' ? '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' :
                    'Adresa peňaženky'
                  }
                  value={data.walletAddress || ''}
                  onChange={(e) => onChange('walletAddress', e.target.value)}
                  className={errors.walletAddress ? 'border-destructive' : ''}
                />
                {errors.walletAddress && (
                  <p className="text-sm text-destructive">{errors.walletAddress}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {getWalletAddressHint(data.blockchain)}
                </p>
              </div>

              {/* Exchange/Wallet Name */}
              <div className="space-y-2">
                <label htmlFor="exchangeName" className="text-sm font-medium">
                  Burza / Názov peňaženky
                </label>
                <Input
                  id="exchangeName"
                  placeholder="Napríklad: Binance, Coinbase, Trust Wallet, MetaMask"
                  value={data.exchangeName || ''}
                  onChange={(e) => onChange('exchangeName', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ak bola použitá burza alebo známa peňaženka
                </p>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <label htmlFor="transactionHash" className="text-sm font-medium">
                  Hash transakcie (TX ID)
                </label>
                <Input
                  id="transactionHash"
                  placeholder="0x1234567890abcdef..."
                  value={data.transactionHash || ''}
                  onChange={(e) => onChange('transactionHash', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Jedinečný identifikátor transakcie v blockchaine (ak je k dispozícii)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PayPal Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('paypal')}
            aria-expanded={expandedSections.paypal}
            className={cn(
              'w-full flex items-center justify-between p-4 transition-colors',
              'hover:bg-muted/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              hasPaypalData && 'bg-primary/5 border-l-4 border-l-primary'
            )}
          >
            <div className="flex items-center gap-3">
              <Wallet className={cn(
                'h-5 w-5',
                hasPaypalData ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="text-left">
                <h3 className="font-semibold">PayPal</h3>
                <p className="text-sm text-muted-foreground">
                  PayPal účet alebo email
                </p>
              </div>
            </div>
            {expandedSections.paypal ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.paypal && (
            <div className="p-4 border-t space-y-4">
              <div className="space-y-2">
                <label htmlFor="paypalAccount" className="text-sm font-medium">
                  PayPal účet / Email
                </label>
                <Input
                  id="paypalAccount"
                  type="email"
                  placeholder="podvodnik@example.com"
                  value={data.paypalAccount || ''}
                  onChange={(e) => onChange('paypalAccount', e.target.value)}
                  className={errors.paypalAccount ? 'border-destructive' : ''}
                />
                {errors.paypalAccount && (
                  <p className="text-sm text-destructive">{errors.paypalAccount}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Email adresa alebo užívateľské meno PayPal účtu
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Help Box */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex gap-3">
            <Banknote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Tip: Ako získať tieto údaje?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Skontrolujte históriu transakcií vo vašej banke alebo peňaženke</li>
                <li>Pre krypto transakcie použite block explorer (napr. etherscan.io)</li>
                <li>Pozrite sa do emailov s potvrdeniami platieb</li>
                <li>Každý detail môže pomôcť identifikovať podvodníka</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
