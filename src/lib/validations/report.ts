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

  // Vehicle info (optional - for cases involving vehicles)
  vehicleMake: z.string()
    .max(100, 'Značka môže mať maximálne 100 znakov')
    .optional(),

  vehicleModel: z.string()
    .max(100, 'Model môže mať maximálne 100 znakov')
    .optional(),

  vehicleColor: z.string()
    .max(50, 'Farba môže mať maximálne 50 znakov')
    .optional(),

  vehicleLicensePlate: z.string()
    .max(20, 'EČV môže mať maximálne 20 znakov')
    .optional(),

  vehicleVin: z.string()
    .max(17, 'VIN môže mať maximálne 17 znakov')
    .optional(),
});

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

// Complete Report Schema
export const completeReportSchema = z.object({
  ...fraudTypeSchema.shape,
  ...basicInfoSchema.shape,
  ...perpetratorSchema.shape,
  ...evidenceSchema.shape,
  ...contactInfoSchema.shape,
});

export type FraudTypeForm = z.infer<typeof fraudTypeSchema>;
export type BasicInfoForm = z.infer<typeof basicInfoSchema>;
export type PerpetratorForm = z.infer<typeof perpetratorSchema>;
export type EvidenceForm = z.infer<typeof evidenceSchema>;
export type ContactInfoForm = z.infer<typeof contactInfoSchema>;
export type CompleteReportForm = z.infer<typeof completeReportSchema>;
