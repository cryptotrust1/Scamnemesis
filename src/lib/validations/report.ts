/**
 * Report Form Validation Schemas
 *
 * Zod schemas for validating report submission forms
 */

import { z } from 'zod';

// Fraud Type Schema
// Must match Prisma FraudType enum exactly
export const fraudTypeSchema = z.object({
  fraudType: z.enum([
    'ROMANCE_SCAM',
    'INVESTMENT_FRAUD',
    'PHISHING',
    'IDENTITY_THEFT',
    'ONLINE_SHOPPING_FRAUD',
    'TECH_SUPPORT_SCAM',
    'LOTTERY_PRIZE_SCAM',
    'EMPLOYMENT_SCAM',
    'RENTAL_SCAM',
    'CRYPTOCURRENCY_SCAM',
    'PYRAMID_MLM_SCHEME',
    'INSURANCE_FRAUD',
    'CREDIT_CARD_FRAUD',
    'WIRE_FRAUD',
    'MONEY_MULE',
    'ADVANCE_FEE_FRAUD',
    'BUSINESS_EMAIL_COMPROMISE',
    'SOCIAL_ENGINEERING',
    'FAKE_CHARITY',
    'GOVERNMENT_IMPERSONATION',
    'UTILITY_SCAM',
    'GRANDPARENT_SCAM',
    'SEXTORTION',
    'RANSOMWARE',
    'ACCOUNT_TAKEOVER',
    'SIM_SWAPPING',
    'CATFISHING',
    'PONZI_SCHEME',
    'OTHER',
  ], {
    required_error: 'Prosím vyberte typ podvodu',
  }),
});

// Basic Information Schema
export const basicInfoSchema = z.object({
  title: z.string()
    .min(10, 'Nadpis musí obsahovať aspoň 10 znakov')
    .max(200, 'Nadpis môže mať maximálne 200 znakov'),

  description: z.string()
    .min(50, 'Popis musí obsahovať aspoň 50 znakov')
    .max(10000, 'Popis môže mať maximálne 10,000 znakov'),

  incidentDate: z.string()
    .min(1, 'Dátum incidentu je povinný'),

  country: z.string()
    .min(1, 'Krajina je povinná'),

  city: z.string()
    .min(1, 'Mesto je povinné'),

  postalCode: z.string()
    .optional(),

  amount: z.string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: 'Suma musí byť číslo',
    })
    .refine((val) => !val || parseFloat(val) >= 0, {
      message: 'Suma nemôže byť záporná',
    }),

  currency: z.string()
    .default('EUR'),
});

// Perpetrator Schema
export const perpetratorSchema = z.object({
  perpetratorType: z.enum(['INDIVIDUAL', 'COMPANY', 'UNKNOWN'])
    .default('INDIVIDUAL'),

  name: z.string()
    .min(2, 'Meno musí mať aspoň 2 znaky')
    .max(200, 'Meno môže mať maximálne 200 znakov')
    .optional(),

  // Additional perpetrator details
  nickname: z.string()
    .max(100, 'Prezývka môže mať maximálne 100 znakov')
    .optional(),

  username: z.string()
    .max(100, 'Užívateľské meno môže mať maximálne 100 znakov')
    .optional(),

  approxAge: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 120), {
      message: 'Vek musí byť číslo medzi 0 a 120',
    }),

  nationality: z.string()
    .max(100, 'Národnosť môže mať maximálne 100 znakov')
    .optional(),

  physicalDescription: z.string()
    .max(2000, 'Fyzický popis môže mať maximálne 2000 znakov')
    .optional(),

  phone: z.string()
    .optional()
    .refine((val) => !val || /^[+\d\s()-]+$/.test(val), {
      message: 'Neplatný formát telefónneho čísla',
    }),

  email: z.string()
    .email('Neplatný email')
    .optional()
    .or(z.literal('')),

  website: z.string()
    .url('Neplatná URL adresa')
    .optional()
    .or(z.literal('')),

  socialMedia: z.string()
    .optional(),

  // Additional social media platforms
  signal: z.string()
    .optional(),

  tiktok: z.string()
    .optional(),

  twitter: z.string()
    .optional(),

  iban: z.string()
    .optional()
    .refine((val) => !val || val.length >= 15, {
      message: 'IBAN musí mať aspoň 15 znakov',
    }),

  bankAccount: z.string()
    .optional(),

  cryptoWallet: z.string()
    .optional(),

  companyName: z.string()
    .optional(),

  companyId: z.string()
    .optional(),

  address: z.string()
    .optional(),
});

// Company & Vehicle Schema (for dedicated company/vehicle fraud cases)
export const companyVehicleSchema = z.object({
  // Company Information
  companyName: z.string()
    .min(2, 'Názov firmy musí mať aspoň 2 znaky')
    .max(200, 'Názov firmy môže mať maximálne 200 znakov'),

  vatTaxId: z.string()
    .min(2, 'IČO/DIČ je povinné')
    .max(50, 'IČO/DIČ môže mať maximálne 50 znakov'),

  companyStreet: z.string()
    .min(2, 'Ulica je povinná')
    .max(200, 'Ulica môže mať maximálne 200 znakov'),

  companyCity: z.string()
    .min(2, 'Mesto je povinné')
    .max(100, 'Mesto môže mať maximálne 100 znakov'),

  companyPostalCode: z.string()
    .min(2, 'PSČ je povinné')
    .max(20, 'PSČ môže mať maximálne 20 znakov'),

  companyCountry: z.string()
    .min(1, 'Krajina je povinná'),

  // Vehicle Information
  vehicleMake: z.string()
    .min(2, 'Značka vozidla je povinná')
    .max(100, 'Značka môže mať maximálne 100 znakov'),

  vehicleModel: z.string()
    .min(1, 'Model vozidla je povinný')
    .max(100, 'Model môže mať maximálne 100 znakov'),

  vehicleColor: z.string()
    .min(2, 'Farba vozidla je povinná')
    .max(50, 'Farba môže mať maximálne 50 znakov'),

  vehicleLicensePlate: z.string()
    .min(2, 'EČV je povinné')
    .max(20, 'EČV môže mať maximálne 20 znakov'),

  vehicleVin: z.string()
    .length(17, 'VIN musí obsahovať presne 17 znakov')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN môže obsahovať len písmená (okrem I, O, Q) a čísla'),

  registeredOwner: z.string()
    .min(2, 'Meno vlastníka je povinné')
    .max(200, 'Meno vlastníka môže mať maximálne 200 znakov'),
});

// Financial Details Schema
export const financialDetailsSchema = z.object({
  // Banking Information
  iban: z.string()
    .optional()
    .refine((val) => !val || val.length >= 15, {
      message: 'IBAN musí mať aspoň 15 znakov',
    })
    .refine((val) => !val || /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(val.replace(/\s/g, '')), {
      message: 'Neplatný formát IBAN (musí začínať dvoma písmenami a dvoma číslicami)',
    }),

  accountHolderName: z.string()
    .max(200, 'Meno majiteľa účtu môže mať maximálne 200 znakov')
    .optional(),

  accountNumber: z.string()
    .max(50, 'Číslo účtu môže mať maximálne 50 znakov')
    .optional(),

  bankName: z.string()
    .max(200, 'Názov banky môže mať maximálne 200 znakov')
    .optional(),

  bankCountry: z.string()
    .optional(),

  swiftBic: z.string()
    .optional()
    .refine((val) => !val || (val.length === 8 || val.length === 11), {
      message: 'SWIFT/BIC kód musí mať 8 alebo 11 znakov',
    })
    .refine((val) => !val || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(val), {
      message: 'Neplatný formát SWIFT/BIC kódu',
    }),

  // Region-specific banking codes
  routingNumber: z.string()
    .optional()
    .refine((val) => !val || /^\d{9}$/.test(val), {
      message: 'Routing Number musí mať presne 9 číslic',
    }),

  bsbCode: z.string()
    .optional()
    .refine((val) => !val || /^\d{3}-?\d{3}$/.test(val), {
      message: 'BSB Code musí mať formát XXX-XXX alebo XXXXXX',
    }),

  sortCode: z.string()
    .optional()
    .refine((val) => !val || /^\d{2}-?\d{2}-?\d{2}$/.test(val), {
      message: 'Sort Code musí mať formát XX-XX-XX alebo XXXXXX',
    }),

  ifscCode: z.string()
    .optional()
    .refine((val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val), {
      message: 'Neplatný formát IFSC kódu',
    }),

  cnapsCode: z.string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: 'CNAPS Code musí mať presne 12 číslic',
    }),

  otherBankingDetails: z.string()
    .max(1000, 'Ďalšie bankové údaje môžu mať maximálne 1000 znakov')
    .optional(),

  // Cryptocurrency Details
  walletAddress: z.string()
    .max(200, 'Adresa peňaženky môže mať maximálne 200 znakov')
    .optional(),

  blockchain: z.enum([
    'BITCOIN',
    'ETHEREUM',
    'TRON',
    'SOLANA',
    'BINANCE_SMART_CHAIN',
    'POLYGON',
    'CARDANO',
    'RIPPLE',
    'LITECOIN',
    'POLKADOT',
    'OTHER',
  ])
    .optional(),

  exchangeName: z.string()
    .max(200, 'Názov burzy môže mať maximálne 200 znakov')
    .optional(),

  transactionHash: z.string()
    .max(200, 'Hash transakcie môže mať maximálne 200 znakov')
    .optional(),

  // PayPal
  paypalAccount: z.string()
    .email('Neplatný email')
    .optional()
    .or(z.literal('')),
})
  .refine(
    (data) => {
      // At least one section must be filled
      const hasBanking = data.iban || data.accountHolderName || data.accountNumber ||
                        data.bankName || data.bankCountry || data.swiftBic;
      const hasCrypto = data.walletAddress || data.blockchain || data.exchangeName ||
                       data.transactionHash;
      const hasPaypal = data.paypalAccount;

      return hasBanking || hasCrypto || hasPaypal;
    },
    {
      message: 'Vyplňte aspoň jednu sekciu (bankovú, krypto, alebo PayPal)',
      path: ['iban'], // Show error on first field
    }
  );

// Evidence Schema
export const evidenceSchema = z.object({
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    url: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
});

// Contact Information Schema
export const contactInfoSchema = z.object({
  reporterName: z.string()
    .min(2, 'Meno musí mať aspoň 2 znaky')
    .max(100, 'Meno môže mať maximálne 100 znakov')
    .optional(),

  reporterEmail: z.string()
    .email('Neplatný email')
    .optional()
    .or(z.literal('')),

  reporterPhone: z.string()
    .optional(),

  wantUpdates: z.boolean()
    .default(false),

  agreeToTerms: z.boolean()
    .refine((val) => val === true, {
      message: 'Musíte súhlasiť s podmienkami používania',
    }),

  agreeToGDPR: z.boolean()
    .refine((val) => val === true, {
      message: 'Musíte súhlasiť so spracovaním osobných údajov',
    }),
});

// Digital Footprints Schema
export const digitalFootprintsSchema = z.object({
  // Social Media Accounts
  telegram: z.string()
    .optional()
    .refine((val) => !val || val.startsWith('@') || val.length === 0, {
      message: 'Telegram by mal začínať znakom @',
    }),

  whatsapp: z.string()
    .optional()
    .refine((val) => !val || /^[+\d\s()-]+$/.test(val), {
      message: 'Neplatný formát telefónneho čísla pre WhatsApp',
    }),

  signalNumber: z.string()
    .optional()
    .refine((val) => !val || /^[+\d\s()-]+$/.test(val), {
      message: 'Neplatný formát telefónneho čísla pre Signal',
    }),

  instagram: z.string()
    .optional()
    .refine((val) => !val || val.startsWith('@') || val.length === 0, {
      message: 'Instagram by mal začínať znakom @',
    }),

  facebook: z.string()
    .optional(),

  tiktokHandle: z.string()
    .optional()
    .refine((val) => !val || val.startsWith('@') || val.length === 0, {
      message: 'TikTok by mal začínať znakom @',
    }),

  twitterHandle: z.string()
    .optional()
    .refine((val) => !val || val.startsWith('@') || val.length === 0, {
      message: 'X/Twitter by mal začínať znakom @',
    }),

  // Website & Domain
  websiteUrl: z.string()
    .optional()
    .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.length === 0, {
      message: 'URL musí začínať http:// alebo https://',
    }),

  domainName: z.string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Neplatný formát domény (napr. example.com)',
    }),

  domainCreationDate: z.string()
    .optional(),

  // IP Information
  ipAddress: z.string()
    .optional()
    .refine((val) => !val || /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val), {
      message: 'Neplatný formát IP adresy (napr. 192.168.1.1)',
    }),

  ipCountry: z.string()
    .optional(),

  ispProvider: z.string()
    .optional(),

  ipAbuseScore: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100), {
      message: 'IP skóre zneužitia musí byť medzi 0 a 100',
    }),
});

// Complete Report Schema - includes all form fields
export const completeReportSchema = z.object({
  ...fraudTypeSchema.shape,
  ...basicInfoSchema.shape,
  ...perpetratorSchema.shape,
  ...digitalFootprintsSchema.shape,
  // Financial details (optional, flat fields to avoid nested validation)
  iban: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankCountry: z.string().optional(),
  swiftBic: z.string().optional(),
  routingNumber: z.string().optional(),
  bsbCode: z.string().optional(),
  sortCode: z.string().optional(),
  ifscCode: z.string().optional(),
  cnapsCode: z.string().optional(),
  otherBankingDetails: z.string().optional(),
  walletAddress: z.string().optional(),
  blockchain: z.string().optional(),
  exchangeName: z.string().optional(),
  transactionHash: z.string().optional(),
  paypalAccount: z.string().optional(),
  // Company & Vehicle fields (optional, flat)
  vatTaxId: z.string().optional(),
  companyStreet: z.string().optional(),
  companyCity: z.string().optional(),
  companyPostalCode: z.string().optional(),
  companyCountry: z.string().optional(),
  // Vehicle fields
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleColor: z.string().optional(),
  vehicleLicensePlate: z.string().optional(),
  vehicleVin: z.string().optional(),
  registeredOwner: z.string().optional(),
  ...evidenceSchema.shape,
  ...contactInfoSchema.shape,
});

export type FraudTypeForm = z.infer<typeof fraudTypeSchema>;
export type BasicInfoForm = z.infer<typeof basicInfoSchema>;
export type PerpetratorForm = z.infer<typeof perpetratorSchema>;
export type CompanyVehicleForm = z.infer<typeof companyVehicleSchema>;
export type DigitalFootprintsForm = z.infer<typeof digitalFootprintsSchema>;
export type FinancialDetailsForm = z.infer<typeof financialDetailsSchema>;
export type EvidenceForm = z.infer<typeof evidenceSchema>;
export type ContactInfoForm = z.infer<typeof contactInfoSchema>;
export type CompleteReportForm = z.infer<typeof completeReportSchema>;
