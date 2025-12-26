'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useTranslation } from '@/lib/i18n/context';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Shield,
  FileText,
  Users,
  Database,
  Search,
  Globe,
  Lock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Network,
  Share2,
  Heart,
  Mail,
  Building2,
  Scale,
  Banknote,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Eye,
  Link2,
  Clock,
  UserCheck,
  FileCheck,
  PieChart,
  LineChart,
  MapPin,
  Fingerprint,
  ShieldCheck,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepWizard } from '@/components/report/step-wizard';
import { FraudTypeStep } from '@/components/report/steps/fraud-type-step';
import { BasicInfoStep } from '@/components/report/steps/basic-info-step';
import { PerpetratorStep } from '@/components/report/steps/perpetrator-step';
import { DigitalFootprintsStep } from '@/components/report/steps/digital-footprints-step';
import { FinancialDetailsStep } from '@/components/report/steps/financial-details-step';
import { CompanyVehicleStep } from '@/components/report/steps/company-vehicle-step';
import { EvidenceStep } from '@/components/report/steps/evidence-step';
import { ContactStep } from '@/components/report/steps/contact-step';
import { ReviewStep } from '@/components/report/steps/review-step';
import { toast } from 'sonner';
import { secureStorageSet, secureStorageGet, secureStorageRemove } from '@/lib/utils';
import {
  fraudTypeSchema,
  basicInfoSchema,
  perpetratorSchema,
  digitalFootprintsSchema,
  contactInfoSchema,
  type CompleteReportForm,
  type DigitalFootprintsForm,
  type FinancialDetailsForm,
  type CompanyVehicleForm,
} from '@/lib/validations/report';

interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  description?: string;
  file?: File;
  category: 'PAYMENT' | 'FRAUDSTER_PHOTOS' | 'SCREENSHOTS' | 'DAMAGE_DOCUMENTATION' | 'CRIME_SCENE' | 'OTHER';
  externalUrl?: string;
}

// Step keys for translation lookup
const stepKeys = [
  'fraudType',
  'basicInfo',
  'perpetrator',
  'digitalFootprints',
  'financialDetails',
  'companyVehicle',
  'evidence',
  'contact',
  'review',
] as const;

// JSON-LD Schema Data
const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Report a Scam - ScamNemesis',
  description: 'Report scammers and help protect others. ScamNemesis helps victims report fraud, recover lost money, and prevent future scams.',
  url: 'https://scamnemesis.com/report/new',
  mainEntity: {
    '@type': 'WebApplication',
    name: 'ScamNemesis Report Form',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
  potentialAction: {
    '@type': 'ReportAction',
    name: 'Report a Scam',
    target: 'https://scamnemesis.com/report/new',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Report a Scam on ScamNemesis',
  description: 'Step-by-step guide to reporting scammers and fraud on ScamNemesis platform.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Select Fraud Type',
      text: 'Choose the category that best describes the type of scam you encountered.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Provide Basic Information',
      text: 'Enter details about the incident including date, location, and financial impact.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Identify the Perpetrator',
      text: 'Provide any known information about the scammer such as name, contact details, or physical description.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Digital Footprints',
      text: 'Add social media profiles, websites, and IP information related to the scam.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Financial Details',
      text: 'Provide bank accounts, cryptocurrency wallets, or PayPal accounts used in the fraud.',
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Company and Vehicle',
      text: 'Add any company or vehicle information if applicable to the scam.',
    },
    {
      '@type': 'HowToStep',
      position: 7,
      name: 'Upload Evidence',
      text: 'Attach screenshots, documents, or other evidence that supports your report.',
    },
    {
      '@type': 'HowToStep',
      position: 8,
      name: 'Contact Information',
      text: 'Provide your contact details to receive updates about your report.',
    },
    {
      '@type': 'HowToStep',
      position: 9,
      name: 'Review and Submit',
      text: 'Review all information and submit your report to help protect others.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where can I report a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can report scams on ScamNemesis.com. Our platform helps victims report fraud, recover lost money, and protect others from scammers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my report confidential?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, your personal information is protected. We anonymize sensitive data before sharing reports with partners and investigators.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens after I submit a report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After submission, your report is processed, analyzed, and shared with relevant authorities and partners. You receive a PDF summary and can track your report status.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can ScamNemesis help recover my lost money?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While we cannot guarantee recovery, we connect you with resources, authorities, and recovery services that may help. Early reporting increases recovery chances.',
      },
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/images/logo.png',
  description: 'The most advanced platform for scam detection and prevention. Protecting individuals and businesses from fraud worldwide.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer service',
  },
  sameAs: [
    'https://twitter.com/ScamNemesis',
    'https://www.linkedin.com/company/scamnemesis',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://scamnemesis.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Report',
      item: 'https://scamnemesis.com/report',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'New Report',
      item: 'https://scamnemesis.com/report/new',
    },
  ],
};

type Locale = 'en' | 'sk' | 'cs' | 'de';

// Page translations
const getPageTranslations = (locale: Locale) => {
  const t = {
    en: {
      trustedPlatform: 'Trusted Platform',
      secureConfidential: 'Secure & Confidential',
      records: '612M+ Records',
      heroTitle: 'Where to Report',
      heroTitleHighlight: 'Scammers?',
      heroDesc: 'ScamNemesis helps victims report scammers, recover lost money, and protect others from fraud. Our platform connects you with authorities, investigators, and a global community dedicated to fighting scams.',
      startReport: 'Start Your Report',
      searchDatabase: 'Search Database',
      statsRecords: 'Records',
      statsDataSources: 'Data Sources',
      statsPartners: 'Partners',
      statsMonitoring: 'Monitoring',
      whatHappensTitle: 'What Happens After You Submit?',
      whatHappensDesc: 'By completing the form, you provide detailed information that we report to the relevant authorities and compile into a clearly structured PDF report. Your report helps build a comprehensive database that protects others from the same scammers.',
      pdfGenerated: 'PDF Report Generated',
      pdfGeneratedDesc: 'Receive a professional, structured PDF summary of your report that you can share with authorities and legal professionals.',
      sharedAuthorities: 'Shared with Authorities',
      sharedAuthoritiesDesc: 'Your report is automatically forwarded to relevant law enforcement agencies, regulators, and fraud prevention organizations.',
      addedToDatabase: 'Added to Database',
      addedToDatabaseDesc: 'Scammer details are added to our global database, helping protect millions of people from future fraud attempts.',
      instructionsTitle: 'Instructions for Completing the Form',
      instruction1: 'Most fields are not mandatory.',
      instruction1Desc: 'Fill in as much information as you have available. The more details you provide, the more effective your report will be in helping authorities investigate.',
      instruction2: 'Fields that do not apply to your case',
      instruction2Desc: 'can be left blank. Not every scam involves all types of contact information or financial details.',
      instruction3: 'After submitting,',
      instruction3Desc: 'you will receive a confirmation with your report ID. Use this to track your report status and provide additional information if needed.',
      advancedTechnology: 'Advanced Technology',
      dataProcessingTitle: 'Data Processing and Visualization',
      dataProcessingDesc: 'Our advanced analytics platform processes millions of data points to identify patterns, connections, and emerging threats in real-time.',
      advancedAnalytics: 'Advanced Analytics',
      advancedAnalyticsDesc: 'Real-time data processing and pattern recognition across millions of reports.',
      visualReports: 'Visual Reports',
      visualReportsDesc: 'Clear visualizations that help identify trends and connections.',
      trendAnalysis: 'Trend Analysis',
      trendAnalysisDesc: 'Track scam evolution and emerging fraud patterns over time.',
      geographicMapping: 'Geographic Mapping',
      geographicMappingDesc: 'Location-based analysis to identify regional fraud hotspots.',
      intelligenceCapabilities: 'Intelligence Capabilities',
      osintTitle: 'Advanced OSINT and Intelligence Practice',
      osintDesc: 'ScamNemesis employs sophisticated Open Source Intelligence (OSINT) techniques to track, identify, and expose scammers across the digital landscape. Our intelligence team uses advanced tools and methodologies to uncover hidden connections.',
      osintFeature1: 'Cross-reference data from 130+ global sources',
      osintFeature2: 'Identify fake identities and shell companies',
      osintFeature3: 'Track cryptocurrency transactions and wallets',
      osintFeature4: 'Monitor dark web marketplaces and forums',
      osintFeature5: 'Analyze social media footprints and patterns',
      deepWebAnalysis: 'Deep Web Analysis',
      deepWebAnalysisDesc: 'Advanced search capabilities across surface and deep web sources.',
      networkMapping: 'Network Mapping',
      networkMappingDesc: 'Identify connections between scammers and criminal networks.',
      digitalFootprint: 'Digital Footprint',
      digitalFootprintDesc: 'Track digital traces and identify hidden identities.',
      dataSources130: '130+ Data Sources',
      dataSources130Desc: 'Access to comprehensive global databases and intelligence feeds.',
      communityPower: 'Community Power',
      communityTitle: 'Community Engagement and Interactive Report',
      communityDesc: 'Join a global community of fraud fighters. Your reports contribute to a collective defense system that protects millions of people worldwide.',
      interactiveReports: 'Interactive Reports',
      interactiveReportsDesc: 'Comment, update, and collaborate on fraud investigations.',
      communityVerification: 'Community Verification',
      communityVerificationDesc: 'Crowd-sourced validation improves report accuracy.',
      reputationSystem: 'Reputation System',
      reputationSystemDesc: 'Trusted reporters earn badges and enhanced visibility.',
      watchlists: 'Watchlists',
      watchlistsDesc: 'Monitor specific entities and receive alerts on new activity.',
      globalNetwork: 'Global Network',
      partnersTitle: 'Data Sharing with Partners and Investigators',
      partnersDesc: 'Your report reaches a network of trusted partners dedicated to fighting fraud. We work with law enforcement, financial institutions, and security experts worldwide.',
      lawEnforcement: 'Law Enforcement',
      lawEnforcementDesc: 'Police departments, cybercrime units, and international agencies.',
      regulatoryBodies: 'Regulatory Bodies',
      regulatoryBodiesDesc: 'Financial regulators, consumer protection agencies, and government bodies.',
      financialInstitutions: 'Financial Institutions',
      financialInstitutionsDesc: 'Banks, payment processors, and cryptocurrency exchanges.',
      securityCompanies: 'Security Companies',
      securityCompaniesDesc: 'Cybersecurity firms, fraud prevention services, and investigators.',
      privacyProtected: 'Your Privacy is Protected',
      privacyProtectedDesc: 'We anonymize personal information before sharing reports with partners. Only relevant fraud details are shared to protect your privacy while maximizing the effectiveness of investigations.',
      victimSupport: 'Victim Support',
      scamRecovery: 'Scam Recovery',
      scamRecoveryDesc: 'Being scammed is stressful, but there are steps you can take to minimize damage and potentially recover your losses. Follow these guidelines for the best chance of recovery.',
      reportImmediately: 'Report Immediately',
      reportImmediatelyDesc: 'Time is critical. Submit your report as soon as possible to increase recovery chances.',
      documentEverything: 'Document Everything',
      documentEverythingDesc: 'Save all communications, transactions, and evidence related to the scam.',
      contactBank: 'Contact Your Bank',
      contactBankDesc: 'Notify your financial institution immediately to freeze accounts and reverse transactions.',
      fileOfficialReports: 'File Official Reports',
      fileOfficialReportsDesc: 'Report to local police, IC3, FTC, and relevant authorities in your jurisdiction.',
      monitorAccounts: 'Monitor Your Accounts',
      monitorAccountsDesc: 'Watch for unauthorized activity and consider credit monitoring services.',
      seekProfessionalHelp: 'Seek Professional Help',
      seekProfessionalHelpDesc: 'Consider consulting fraud recovery specialists and legal professionals.',
      bewareRecoveryScams: 'Beware of Recovery Scams',
      bewareRecoveryScamsDesc: 'Unfortunately, scammers often target fraud victims again with fake "recovery services" that promise to retrieve lost funds for an upfront fee. Legitimate recovery services and law enforcement agencies will never ask for payment upfront. Be extremely cautious of unsolicited offers to help recover your money.',
      getInTouch: 'Get in Touch',
      contactTitle: 'Contact ScamNemesis',
      contactDesc: 'Have questions, need assistance, or want to report additional information? Our team is here to help you.',
      emailUs: 'Email Us',
      helpCenter: 'Help Center',
      faqsGuides: 'FAQs & Guides',
      secureCommunication: 'Secure Communication',
      responseTime: 'Response within 24 hours',
      worldwideSupport: 'Worldwide Support',
      readyToReport: 'Ready to Report a Scam?',
      readyToReportDesc: 'Your report makes a difference. Help protect others by sharing your experience and contributing to our global fraud database.',
      startReportNow: 'Start Your Report Now',
      searchOurDatabase: 'Search Our Database',
      step: 'Step',
    },
    de: {
      trustedPlatform: 'Vertrauenswürdige Plattform',
      secureConfidential: 'Sicher & Vertraulich',
      records: '612M+ Datensätze',
      heroTitle: 'Wo kann man',
      heroTitleHighlight: 'Betrüger melden?',
      heroDesc: 'ScamNemesis hilft Opfern, Betrüger zu melden, verlorenes Geld zurückzugewinnen und andere vor Betrug zu schützen. Unsere Plattform verbindet Sie mit Behörden, Ermittlern und einer globalen Gemeinschaft, die sich der Bekämpfung von Betrug widmet.',
      startReport: 'Meldung starten',
      searchDatabase: 'Datenbank durchsuchen',
      statsRecords: 'Datensätze',
      statsDataSources: 'Datenquellen',
      statsPartners: 'Partner',
      statsMonitoring: 'Überwachung',
      whatHappensTitle: 'Was passiert nach dem Absenden?',
      whatHappensDesc: 'Durch das Ausfüllen des Formulars stellen Sie detaillierte Informationen bereit, die wir an die zuständigen Behörden weiterleiten und in einem klar strukturierten PDF-Bericht zusammenstellen. Ihr Bericht hilft beim Aufbau einer umfassenden Datenbank, die andere vor denselben Betrügern schützt.',
      pdfGenerated: 'PDF-Bericht erstellt',
      pdfGeneratedDesc: 'Erhalten Sie eine professionelle, strukturierte PDF-Zusammenfassung Ihres Berichts, die Sie mit Behörden und Rechtsexperten teilen können.',
      sharedAuthorities: 'Mit Behörden geteilt',
      sharedAuthoritiesDesc: 'Ihr Bericht wird automatisch an relevante Strafverfolgungsbehörden, Regulierungsbehörden und Betrugspräventionsorganisationen weitergeleitet.',
      addedToDatabase: 'Zur Datenbank hinzugefügt',
      addedToDatabaseDesc: 'Betrügerdetails werden zu unserer globalen Datenbank hinzugefügt und helfen, Millionen von Menschen vor zukünftigen Betrugsversuchen zu schützen.',
      instructionsTitle: 'Anleitung zum Ausfüllen des Formulars',
      instruction1: 'Die meisten Felder sind nicht obligatorisch.',
      instruction1Desc: 'Füllen Sie so viele Informationen aus, wie Sie haben. Je mehr Details Sie angeben, desto effektiver wird Ihr Bericht bei der Unterstützung der Ermittlungen sein.',
      instruction2: 'Felder, die auf Ihren Fall nicht zutreffen,',
      instruction2Desc: 'können leer gelassen werden. Nicht jeder Betrug beinhaltet alle Arten von Kontaktinformationen oder Finanzdaten.',
      instruction3: 'Nach dem Absenden',
      instruction3Desc: 'erhalten Sie eine Bestätigung mit Ihrer Berichts-ID. Verwenden Sie diese, um den Status Ihres Berichts zu verfolgen und bei Bedarf zusätzliche Informationen bereitzustellen.',
      advancedTechnology: 'Fortschrittliche Technologie',
      dataProcessingTitle: 'Datenverarbeitung und Visualisierung',
      dataProcessingDesc: 'Unsere fortschrittliche Analyseplattform verarbeitet Millionen von Datenpunkten, um Muster, Verbindungen und aufkommende Bedrohungen in Echtzeit zu identifizieren.',
      advancedAnalytics: 'Erweiterte Analysen',
      advancedAnalyticsDesc: 'Echtzeit-Datenverarbeitung und Mustererkennung über Millionen von Berichten.',
      visualReports: 'Visuelle Berichte',
      visualReportsDesc: 'Klare Visualisierungen, die helfen, Trends und Verbindungen zu identifizieren.',
      trendAnalysis: 'Trendanalyse',
      trendAnalysisDesc: 'Verfolgen Sie die Entwicklung von Betrug und aufkommende Betrugsmuster im Laufe der Zeit.',
      geographicMapping: 'Geografische Kartierung',
      geographicMappingDesc: 'Standortbasierte Analyse zur Identifizierung regionaler Betrugsschwerpunkte.',
      intelligenceCapabilities: 'Aufklärungsfähigkeiten',
      osintTitle: 'Fortgeschrittene OSINT- und Aufklärungspraxis',
      osintDesc: 'ScamNemesis setzt ausgefeilte Open Source Intelligence (OSINT) Techniken ein, um Betrüger in der digitalen Landschaft zu verfolgen, zu identifizieren und zu entlarven. Unser Aufklärungsteam verwendet fortschrittliche Tools und Methoden, um versteckte Verbindungen aufzudecken.',
      osintFeature1: 'Querverweise von Daten aus über 130 globalen Quellen',
      osintFeature2: 'Identifizierung gefälschter Identitäten und Briefkastenfirmen',
      osintFeature3: 'Verfolgung von Kryptowährungstransaktionen und Wallets',
      osintFeature4: 'Überwachung von Darknet-Marktplätzen und Foren',
      osintFeature5: 'Analyse von Social-Media-Fußabdrücken und Mustern',
      deepWebAnalysis: 'Deep-Web-Analyse',
      deepWebAnalysisDesc: 'Erweiterte Suchfunktionen über Surface- und Deep-Web-Quellen.',
      networkMapping: 'Netzwerkmapping',
      networkMappingDesc: 'Identifizierung von Verbindungen zwischen Betrügern und kriminellen Netzwerken.',
      digitalFootprint: 'Digitaler Fußabdruck',
      digitalFootprintDesc: 'Verfolgung digitaler Spuren und Identifizierung versteckter Identitäten.',
      dataSources130: '130+ Datenquellen',
      dataSources130Desc: 'Zugang zu umfassenden globalen Datenbanken und Aufklärungsfeeds.',
      communityPower: 'Community-Power',
      communityTitle: 'Community-Engagement und interaktive Berichte',
      communityDesc: 'Treten Sie einer globalen Gemeinschaft von Betrugsbekämpfern bei. Ihre Berichte tragen zu einem kollektiven Verteidigungssystem bei, das Millionen von Menschen weltweit schützt.',
      interactiveReports: 'Interaktive Berichte',
      interactiveReportsDesc: 'Kommentieren, aktualisieren und zusammenarbeiten bei Betrugsermittlungen.',
      communityVerification: 'Community-Verifizierung',
      communityVerificationDesc: 'Crowdsourced-Validierung verbessert die Berichtsgenauigkeit.',
      reputationSystem: 'Reputationssystem',
      reputationSystemDesc: 'Vertrauenswürdige Melder erhalten Abzeichen und erhöhte Sichtbarkeit.',
      watchlists: 'Beobachtungslisten',
      watchlistsDesc: 'Überwachen Sie bestimmte Entitäten und erhalten Sie Warnungen bei neuen Aktivitäten.',
      globalNetwork: 'Globales Netzwerk',
      partnersTitle: 'Datenaustausch mit Partnern und Ermittlern',
      partnersDesc: 'Ihr Bericht erreicht ein Netzwerk vertrauenswürdiger Partner, die sich der Betrugsbekämpfung widmen. Wir arbeiten mit Strafverfolgungsbehörden, Finanzinstituten und Sicherheitsexperten weltweit zusammen.',
      lawEnforcement: 'Strafverfolgung',
      lawEnforcementDesc: 'Polizeibehörden, Cybercrime-Einheiten und internationale Agenturen.',
      regulatoryBodies: 'Regulierungsbehörden',
      regulatoryBodiesDesc: 'Finanzaufsichtsbehörden, Verbraucherschutzagenturen und Regierungsstellen.',
      financialInstitutions: 'Finanzinstitute',
      financialInstitutionsDesc: 'Banken, Zahlungsabwickler und Kryptowährungsbörsen.',
      securityCompanies: 'Sicherheitsunternehmen',
      securityCompaniesDesc: 'Cybersicherheitsfirmen, Betrugspräventionsdienste und Ermittler.',
      privacyProtected: 'Ihre Privatsphäre ist geschützt',
      privacyProtectedDesc: 'Wir anonymisieren persönliche Informationen, bevor wir Berichte mit Partnern teilen. Nur relevante Betrugsdetails werden geteilt, um Ihre Privatsphäre zu schützen und gleichzeitig die Effektivität der Ermittlungen zu maximieren.',
      victimSupport: 'Opferunterstützung',
      scamRecovery: 'Betrugswiederherstellung',
      scamRecoveryDesc: 'Betrogen zu werden ist stressig, aber es gibt Schritte, die Sie unternehmen können, um den Schaden zu minimieren und möglicherweise Ihre Verluste wiederzuerlangen. Befolgen Sie diese Richtlinien für die beste Chance auf Wiederherstellung.',
      reportImmediately: 'Sofort melden',
      reportImmediatelyDesc: 'Zeit ist entscheidend. Reichen Sie Ihren Bericht so schnell wie möglich ein, um die Wiederherstellungschancen zu erhöhen.',
      documentEverything: 'Alles dokumentieren',
      documentEverythingDesc: 'Speichern Sie alle Kommunikationen, Transaktionen und Beweise im Zusammenhang mit dem Betrug.',
      contactBank: 'Kontaktieren Sie Ihre Bank',
      contactBankDesc: 'Benachrichtigen Sie Ihr Finanzinstitut sofort, um Konten einzufrieren und Transaktionen rückgängig zu machen.',
      fileOfficialReports: 'Offizielle Berichte einreichen',
      fileOfficialReportsDesc: 'Melden Sie bei der örtlichen Polizei, IC3, FTC und zuständigen Behörden in Ihrer Gerichtsbarkeit.',
      monitorAccounts: 'Überwachen Sie Ihre Konten',
      monitorAccountsDesc: 'Achten Sie auf nicht autorisierte Aktivitäten und erwägen Sie Kreditüberwachungsdienste.',
      seekProfessionalHelp: 'Professionelle Hilfe suchen',
      seekProfessionalHelpDesc: 'Erwägen Sie, Betrugswiederherstellungsspezialisten und Rechtsexperten zu konsultieren.',
      bewareRecoveryScams: 'Vorsicht vor Wiederherstellungsbetrug',
      bewareRecoveryScamsDesc: 'Leider zielen Betrüger oft erneut auf Betrugsopfer mit gefälschten "Wiederherstellungsdiensten" ab, die versprechen, verlorene Gelder gegen eine Vorabgebühr zurückzuholen. Seriöse Wiederherstellungsdienste und Strafverfolgungsbehörden verlangen niemals eine Vorauszahlung. Seien Sie äußerst vorsichtig bei unaufgeforderten Angeboten zur Wiederherstellung Ihres Geldes.',
      getInTouch: 'Kontaktieren Sie uns',
      contactTitle: 'Kontakt zu ScamNemesis',
      contactDesc: 'Haben Sie Fragen, benötigen Hilfe oder möchten zusätzliche Informationen melden? Unser Team ist hier, um Ihnen zu helfen.',
      emailUs: 'E-Mail senden',
      helpCenter: 'Hilfezentrum',
      faqsGuides: 'FAQs & Anleitungen',
      secureCommunication: 'Sichere Kommunikation',
      responseTime: 'Antwort innerhalb von 24 Stunden',
      worldwideSupport: 'Weltweiter Support',
      readyToReport: 'Bereit, einen Betrug zu melden?',
      readyToReportDesc: 'Ihr Bericht macht einen Unterschied. Helfen Sie anderen, indem Sie Ihre Erfahrung teilen und zu unserer globalen Betrugsdatenbank beitragen.',
      startReportNow: 'Jetzt Meldung starten',
      searchOurDatabase: 'Unsere Datenbank durchsuchen',
      step: 'Schritt',
    },
    sk: {
      trustedPlatform: 'Dôveryhodná platforma',
      secureConfidential: 'Bezpečné a dôverné',
      records: '612M+ záznamov',
      heroTitle: 'Kde nahlásiť',
      heroTitleHighlight: 'podvodníkov?',
      heroDesc: 'ScamNemesis pomáha obetiam nahlásiť podvodníkov, získať späť stratené peniaze a chrániť ostatných pred podvodmi. Naša platforma vás spája s úradmi, vyšetrovateľmi a globálnou komunitou oddanou boju proti podvodom.',
      startReport: 'Začať hlásenie',
      searchDatabase: 'Prehľadať databázu',
      statsRecords: 'Záznamov',
      statsDataSources: 'Zdrojov dát',
      statsPartners: 'Partnerov',
      statsMonitoring: 'Monitorovanie',
      whatHappensTitle: 'Čo sa stane po odoslaní?',
      whatHappensDesc: 'Vyplnením formulára poskytnete podrobné informácie, ktoré nahlásime príslušným úradom a zostavíme do prehľadne štruktúrovaného PDF reportu. Váš report pomáha budovať komplexnú databázu, ktorá chráni ostatných pred rovnakými podvodníkmi.',
      pdfGenerated: 'PDF report vygenerovaný',
      pdfGeneratedDesc: 'Dostanete profesionálne štruktúrované PDF zhrnutie vášho hlásenia, ktoré môžete zdieľať s úradmi a právnymi profesionálmi.',
      sharedAuthorities: 'Zdieľané s úradmi',
      sharedAuthoritiesDesc: 'Váš report je automaticky preposlaný relevantným orgánom činným v trestnom konaní, regulátorom a organizáciám na prevenciu podvodov.',
      addedToDatabase: 'Pridané do databázy',
      addedToDatabaseDesc: 'Detaily podvodníka sú pridané do našej globálnej databázy, čím pomáhajú chrániť milióny ľudí pred budúcimi podvodnými pokusmi.',
      instructionsTitle: 'Pokyny na vyplnenie formulára',
      instruction1: 'Väčšina polí nie je povinná.',
      instruction1Desc: 'Vyplňte toľko informácií, koľko máte k dispozícii. Čím viac detailov poskytnete, tým efektívnejšie bude vaše hlásenie pri pomáhaní úradom vyšetrovať.',
      instruction2: 'Polia, ktoré sa nevzťahujú na váš prípad,',
      instruction2Desc: 'môžu zostať prázdne. Nie každý podvod zahŕňa všetky typy kontaktných informácií alebo finančných údajov.',
      instruction3: 'Po odoslaní',
      instruction3Desc: 'dostanete potvrdenie s ID vášho hlásenia. Použite ho na sledovanie stavu vášho hlásenia a poskytnutie dodatočných informácií v prípade potreby.',
      advancedTechnology: 'Pokročilá technológia',
      dataProcessingTitle: 'Spracovanie a vizualizácia dát',
      dataProcessingDesc: 'Naša pokročilá analytická platforma spracováva milióny dátových bodov na identifikáciu vzorov, spojení a vznikajúcich hrozieb v reálnom čase.',
      advancedAnalytics: 'Pokročilé analýzy',
      advancedAnalyticsDesc: 'Spracovanie dát v reálnom čase a rozpoznávanie vzorov naprieč miliónmi hlásení.',
      visualReports: 'Vizuálne reporty',
      visualReportsDesc: 'Jasné vizualizácie, ktoré pomáhajú identifikovať trendy a spojenia.',
      trendAnalysis: 'Analýza trendov',
      trendAnalysisDesc: 'Sledujte vývoj podvodov a vznikajúce podvodné vzory v čase.',
      geographicMapping: 'Geografické mapovanie',
      geographicMappingDesc: 'Analýza založená na polohe na identifikáciu regionálnych ohnísk podvodov.',
      intelligenceCapabilities: 'Spravodajské schopnosti',
      osintTitle: 'Pokročilá OSINT a spravodajská prax',
      osintDesc: 'ScamNemesis využíva sofistikované techniky Open Source Intelligence (OSINT) na sledovanie, identifikáciu a odhaľovanie podvodníkov v digitálnom prostredí. Náš spravodajský tím používa pokročilé nástroje a metodológie na odhaľovanie skrytých spojení.',
      osintFeature1: 'Krížové referencie dát z viac ako 130 globálnych zdrojov',
      osintFeature2: 'Identifikácia falošných identít a schránkových spoločností',
      osintFeature3: 'Sledovanie kryptomenových transakcií a peňaženiek',
      osintFeature4: 'Monitorovanie trhov a fór na dark webe',
      osintFeature5: 'Analýza digitálnych stôp a vzorov na sociálnych sieťach',
      deepWebAnalysis: 'Analýza deep webu',
      deepWebAnalysisDesc: 'Pokročilé možnosti vyhľadávania naprieč povrchovým a hlbokým webom.',
      networkMapping: 'Mapovanie sietí',
      networkMappingDesc: 'Identifikácia spojení medzi podvodníkmi a kriminálnymi sieťami.',
      digitalFootprint: 'Digitálna stopa',
      digitalFootprintDesc: 'Sledovanie digitálnych stôp a identifikácia skrytých identít.',
      dataSources130: '130+ zdrojov dát',
      dataSources130Desc: 'Prístup ku komplexným globálnym databázam a spravodajským kanálom.',
      communityPower: 'Sila komunity',
      communityTitle: 'Zapojenie komunity a interaktívne hlásenie',
      communityDesc: 'Pripojte sa ku globálnej komunite bojovníkov proti podvodom. Vaše hlásenia prispievajú ku kolektívnemu obrannému systému, ktorý chráni milióny ľudí po celom svete.',
      interactiveReports: 'Interaktívne reporty',
      interactiveReportsDesc: 'Komentujte, aktualizujte a spolupracujte na vyšetrovaní podvodov.',
      communityVerification: 'Overenie komunitou',
      communityVerificationDesc: 'Crowdsourcingové overovanie zlepšuje presnosť hlásení.',
      reputationSystem: 'Reputačný systém',
      reputationSystemDesc: 'Dôveryhodní nahlasujúci získavajú odznaky a zvýšenú viditeľnosť.',
      watchlists: 'Zoznamy sledovaných',
      watchlistsDesc: 'Sledujte konkrétne entity a dostávajte upozornenia na novú aktivitu.',
      globalNetwork: 'Globálna sieť',
      partnersTitle: 'Zdieľanie dát s partnermi a vyšetrovateľmi',
      partnersDesc: 'Váš report sa dostane k sieti dôveryhodných partnerov oddaných boju proti podvodom. Spolupracujeme s orgánmi činnými v trestnom konaní, finančnými inštitúciami a bezpečnostnými expertmi po celom svete.',
      lawEnforcement: 'Orgány činné v trestnom konaní',
      lawEnforcementDesc: 'Policajné oddelenia, jednotky kybernetickej kriminality a medzinárodné agentúry.',
      regulatoryBodies: 'Regulačné orgány',
      regulatoryBodiesDesc: 'Finanční regulátori, agentúry na ochranu spotrebiteľa a vládne orgány.',
      financialInstitutions: 'Finančné inštitúcie',
      financialInstitutionsDesc: 'Banky, spracovatelia platieb a kryptomenové burzy.',
      securityCompanies: 'Bezpečnostné spoločnosti',
      securityCompaniesDesc: 'Firmy v oblasti kybernetickej bezpečnosti, služby prevencie podvodov a vyšetrovatelia.',
      privacyProtected: 'Vaše súkromie je chránené',
      privacyProtectedDesc: 'Anonymizujeme osobné informácie pred zdieľaním hlásení s partnermi. Zdieľané sú len relevantné detaily podvodu na ochranu vášho súkromia pri maximalizácii efektívnosti vyšetrovania.',
      victimSupport: 'Podpora obetí',
      scamRecovery: 'Obnova po podvode',
      scamRecoveryDesc: 'Byť podvedený je stresujúce, ale existujú kroky, ktoré môžete podniknúť na minimalizáciu škody a prípadné získanie strát späť. Postupujte podľa týchto pokynov pre najlepšiu šancu na obnovu.',
      reportImmediately: 'Okamžite nahláste',
      reportImmediatelyDesc: 'Čas je rozhodujúci. Odošlite svoje hlásenie čo najskôr, aby ste zvýšili šance na obnovu.',
      documentEverything: 'Zdokumentujte všetko',
      documentEverythingDesc: 'Uložte všetku komunikáciu, transakcie a dôkazy súvisiace s podvodom.',
      contactBank: 'Kontaktujte svoju banku',
      contactBankDesc: 'Okamžite upozornite svoju finančnú inštitúciu na zmrazenie účtov a zrušenie transakcií.',
      fileOfficialReports: 'Podajte oficiálne hlásenia',
      fileOfficialReportsDesc: 'Nahláste miestnej polícii, IC3, FTC a príslušným úradom vo vašej jurisdikcii.',
      monitorAccounts: 'Sledujte svoje účty',
      monitorAccountsDesc: 'Sledujte neautorizovanú aktivitu a zvážte služby monitorovania kreditu.',
      seekProfessionalHelp: 'Vyhľadajte odbornú pomoc',
      seekProfessionalHelpDesc: 'Zvážte konzultáciu so špecialistami na obnovu po podvodoch a právnymi profesionálmi.',
      bewareRecoveryScams: 'Pozor na podvody s obnovou',
      bewareRecoveryScamsDesc: 'Bohužiaľ, podvodníci často opäť cieľujú na obete podvodov s falošnými "službami obnovy", ktoré sľubujú získanie stratených prostriedkov za poplatok vopred. Legitímne služby obnovy a orgány činné v trestnom konaní nikdy nevyžadujú platbu vopred. Buďte mimoriadne opatrní pri nevyžiadaných ponukách na pomoc s vrátením vašich peňazí.',
      getInTouch: 'Kontaktujte nás',
      contactTitle: 'Kontaktujte ScamNemesis',
      contactDesc: 'Máte otázky, potrebujete pomoc alebo chcete nahlásiť ďalšie informácie? Náš tím je tu, aby vám pomohol.',
      emailUs: 'Napíšte nám',
      helpCenter: 'Centrum pomoci',
      faqsGuides: 'Časté otázky a príručky',
      secureCommunication: 'Bezpečná komunikácia',
      responseTime: 'Odpoveď do 24 hodín',
      worldwideSupport: 'Celosvetová podpora',
      readyToReport: 'Pripravení nahlásiť podvod?',
      readyToReportDesc: 'Vaše hlásenie robí rozdiel. Pomôžte chrániť ostatných zdieľaním vašej skúsenosti a prispením do našej globálnej databázy podvodov.',
      startReportNow: 'Začať hlásenie teraz',
      searchOurDatabase: 'Prehľadať našu databázu',
      step: 'Krok',
    },
    cs: {
      trustedPlatform: 'Důvěryhodná platforma',
      secureConfidential: 'Bezpečné a důvěrné',
      records: '612M+ záznamů',
      heroTitle: 'Kde nahlásit',
      heroTitleHighlight: 'podvodníky?',
      heroDesc: 'ScamNemesis pomáhá obětem nahlásit podvodníky, získat zpět ztracené peníze a chránit ostatní před podvody. Naše platforma vás spojuje s úřady, vyšetřovateli a globální komunitou oddanou boji proti podvodům.',
      startReport: 'Zahájit hlášení',
      searchDatabase: 'Prohledat databázi',
      statsRecords: 'Záznamů',
      statsDataSources: 'Zdrojů dat',
      statsPartners: 'Partnerů',
      statsMonitoring: 'Monitoring',
      whatHappensTitle: 'Co se stane po odeslání?',
      whatHappensDesc: 'Vyplněním formuláře poskytnete podrobné informace, které nahlásíme příslušným úřadům a sestavíme do přehledně strukturovaného PDF reportu. Váš report pomáhá budovat komplexní databázi, která chrání ostatní před stejnými podvodníky.',
      pdfGenerated: 'PDF report vygenerován',
      pdfGeneratedDesc: 'Obdržíte profesionálně strukturované PDF shrnutí vašeho hlášení, které můžete sdílet s úřady a právními profesionály.',
      sharedAuthorities: 'Sdíleno s úřady',
      sharedAuthoritiesDesc: 'Váš report je automaticky přeposlán relevantním orgánům činným v trestním řízení, regulátorům a organizacím pro prevenci podvodů.',
      addedToDatabase: 'Přidáno do databáze',
      addedToDatabaseDesc: 'Detaily podvodníka jsou přidány do naší globální databáze, čímž pomáhají chránit miliony lidí před budoucími podvodnými pokusy.',
      instructionsTitle: 'Pokyny k vyplnění formuláře',
      instruction1: 'Většina polí není povinná.',
      instruction1Desc: 'Vyplňte tolik informací, kolik máte k dispozici. Čím více detailů poskytnete, tím efektivnější bude vaše hlášení při pomoci úřadům vyšetřovat.',
      instruction2: 'Pole, která se nevztahují na váš případ,',
      instruction2Desc: 'mohou zůstat prázdná. Ne každý podvod zahrnuje všechny typy kontaktních informací nebo finančních údajů.',
      instruction3: 'Po odeslání',
      instruction3Desc: 'obdržíte potvrzení s ID vašeho hlášení. Použijte ho ke sledování stavu vašeho hlášení a poskytnutí dodatečných informací v případě potřeby.',
      advancedTechnology: 'Pokročilá technologie',
      dataProcessingTitle: 'Zpracování a vizualizace dat',
      dataProcessingDesc: 'Naše pokročilá analytická platforma zpracovává miliony datových bodů k identifikaci vzorů, spojení a vznikajících hrozeb v reálném čase.',
      advancedAnalytics: 'Pokročilé analýzy',
      advancedAnalyticsDesc: 'Zpracování dat v reálném čase a rozpoznávání vzorů napříč miliony hlášení.',
      visualReports: 'Vizuální reporty',
      visualReportsDesc: 'Jasné vizualizace, které pomáhají identifikovat trendy a spojení.',
      trendAnalysis: 'Analýza trendů',
      trendAnalysisDesc: 'Sledujte vývoj podvodů a vznikající podvodné vzory v čase.',
      geographicMapping: 'Geografické mapování',
      geographicMappingDesc: 'Analýza založená na poloze k identifikaci regionálních ohnisek podvodů.',
      intelligenceCapabilities: 'Zpravodajské schopnosti',
      osintTitle: 'Pokročilá OSINT a zpravodajská praxe',
      osintDesc: 'ScamNemesis využívá sofistikované techniky Open Source Intelligence (OSINT) ke sledování, identifikaci a odhalování podvodníků v digitálním prostředí. Náš zpravodajský tým používá pokročilé nástroje a metodologie k odhalování skrytých spojení.',
      osintFeature1: 'Křížové reference dat z více než 130 globálních zdrojů',
      osintFeature2: 'Identifikace falešných identit a schránkových společností',
      osintFeature3: 'Sledování kryptoměnových transakcí a peněženek',
      osintFeature4: 'Monitoring trhů a fór na dark webu',
      osintFeature5: 'Analýza digitálních stop a vzorů na sociálních sítích',
      deepWebAnalysis: 'Analýza deep webu',
      deepWebAnalysisDesc: 'Pokročilé možnosti vyhledávání napříč povrchovým a hlubokým webem.',
      networkMapping: 'Mapování sítí',
      networkMappingDesc: 'Identifikace spojení mezi podvodníky a kriminálními sítěmi.',
      digitalFootprint: 'Digitální stopa',
      digitalFootprintDesc: 'Sledování digitálních stop a identifikace skrytých identit.',
      dataSources130: '130+ zdrojů dat',
      dataSources130Desc: 'Přístup ke komplexním globálním databázím a zpravodajským kanálům.',
      communityPower: 'Síla komunity',
      communityTitle: 'Zapojení komunity a interaktivní hlášení',
      communityDesc: 'Připojte se ke globální komunitě bojovníků proti podvodům. Vaše hlášení přispívají ke kolektivnímu obrannému systému, který chrání miliony lidí po celém světě.',
      interactiveReports: 'Interaktivní reporty',
      interactiveReportsDesc: 'Komentujte, aktualizujte a spolupracujte na vyšetřování podvodů.',
      communityVerification: 'Ověření komunitou',
      communityVerificationDesc: 'Crowdsourcingové ověřování zlepšuje přesnost hlášení.',
      reputationSystem: 'Reputační systém',
      reputationSystemDesc: 'Důvěryhodní nahlašující získávají odznaky a zvýšenou viditelnost.',
      watchlists: 'Seznamy sledovaných',
      watchlistsDesc: 'Sledujte konkrétní entity a dostávejte upozornění na novou aktivitu.',
      globalNetwork: 'Globální síť',
      partnersTitle: 'Sdílení dat s partnery a vyšetřovateli',
      partnersDesc: 'Váš report se dostane k síti důvěryhodných partnerů oddaných boji proti podvodům. Spolupracujeme s orgány činnými v trestním řízení, finančními institucemi a bezpečnostními experty po celém světě.',
      lawEnforcement: 'Orgány činné v trestním řízení',
      lawEnforcementDesc: 'Policejní oddělení, jednotky kybernetické kriminality a mezinárodní agentury.',
      regulatoryBodies: 'Regulační orgány',
      regulatoryBodiesDesc: 'Finanční regulátoři, agentury na ochranu spotřebitele a vládní orgány.',
      financialInstitutions: 'Finanční instituce',
      financialInstitutionsDesc: 'Banky, zpracovatelé plateb a kryptoměnové burzy.',
      securityCompanies: 'Bezpečnostní společnosti',
      securityCompaniesDesc: 'Firmy v oblasti kybernetické bezpečnosti, služby prevence podvodů a vyšetřovatelé.',
      privacyProtected: 'Vaše soukromí je chráněno',
      privacyProtectedDesc: 'Anonymizujeme osobní informace před sdílením hlášení s partnery. Sdíleny jsou pouze relevantní detaily podvodu k ochraně vašeho soukromí při maximalizaci efektivity vyšetřování.',
      victimSupport: 'Podpora obětí',
      scamRecovery: 'Obnova po podvodu',
      scamRecoveryDesc: 'Být podveden je stresující, ale existují kroky, které můžete podniknout k minimalizaci škody a případnému získání ztrát zpět. Postupujte podle těchto pokynů pro nejlepší šanci na obnovu.',
      reportImmediately: 'Okamžitě nahlaste',
      reportImmediatelyDesc: 'Čas je rozhodující. Odešlete své hlášení co nejdříve, abyste zvýšili šance na obnovu.',
      documentEverything: 'Zdokumentujte vše',
      documentEverythingDesc: 'Uložte veškerou komunikaci, transakce a důkazy související s podvodem.',
      contactBank: 'Kontaktujte svou banku',
      contactBankDesc: 'Okamžitě upozorněte svou finanční instituci na zmrazení účtů a zrušení transakcí.',
      fileOfficialReports: 'Podejte oficiální hlášení',
      fileOfficialReportsDesc: 'Nahlaste místní policii, IC3, FTC a příslušným úřadům ve vaší jurisdikci.',
      monitorAccounts: 'Sledujte své účty',
      monitorAccountsDesc: 'Sledujte neautorizovanou aktivitu a zvažte služby monitorování kreditu.',
      seekProfessionalHelp: 'Vyhledejte odbornou pomoc',
      seekProfessionalHelpDesc: 'Zvažte konzultaci se specialisty na obnovu po podvodech a právními profesionály.',
      bewareRecoveryScams: 'Pozor na podvody s obnovou',
      bewareRecoveryScamsDesc: 'Bohužel podvodníci často znovu cílují na oběti podvodů s falešnými "službami obnovy", které slibují získání ztracených prostředků za poplatek předem. Legitimní služby obnovy a orgány činné v trestním řízení nikdy nevyžadují platbu předem. Buďte mimořádně opatrní při nevyžádaných nabídkách na pomoc s vrácením vašich peněz.',
      getInTouch: 'Kontaktujte nás',
      contactTitle: 'Kontaktujte ScamNemesis',
      contactDesc: 'Máte otázky, potřebujete pomoc nebo chcete nahlásit další informace? Náš tým je tu, aby vám pomohl.',
      emailUs: 'Napište nám',
      helpCenter: 'Centrum pomoci',
      faqsGuides: 'Časté otázky a příručky',
      secureCommunication: 'Bezpečná komunikace',
      responseTime: 'Odpověď do 24 hodin',
      worldwideSupport: 'Celosvětová podpora',
      readyToReport: 'Připraveni nahlásit podvod?',
      readyToReportDesc: 'Vaše hlášení dělá rozdíl. Pomozte chránit ostatní sdílením vaší zkušenosti a přispěním do naší globální databáze podvodů.',
      startReportNow: 'Zahájit hlášení nyní',
      searchOurDatabase: 'Prohledat naši databázi',
      step: 'Krok',
    },
  };
  return t[locale] || t.en;
};

// Data Processing Features
const dataProcessingFeatures = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time data processing and pattern recognition across millions of reports.',
  },
  {
    icon: PieChart,
    title: 'Visual Reports',
    description: 'Clear visualizations that help identify trends and connections.',
  },
  {
    icon: LineChart,
    title: 'Trend Analysis',
    description: 'Track scam evolution and emerging fraud patterns over time.',
  },
  {
    icon: MapPin,
    title: 'Geographic Mapping',
    description: 'Location-based analysis to identify regional fraud hotspots.',
  },
];

// OSINT Features
const osintFeatures = [
  {
    icon: Search,
    title: 'Deep Web Analysis',
    description: 'Advanced search capabilities across surface and deep web sources.',
  },
  {
    icon: Network,
    title: 'Network Mapping',
    description: 'Identify connections between scammers and criminal networks.',
  },
  {
    icon: Fingerprint,
    title: 'Digital Footprint',
    description: 'Track digital traces and identify hidden identities.',
  },
  {
    icon: Database,
    title: '130+ Data Sources',
    description: 'Access to comprehensive global databases and intelligence feeds.',
  },
];

// Community Features
const communityFeatures = [
  {
    icon: MessageSquare,
    title: 'Interactive Reports',
    description: 'Comment, update, and collaborate on fraud investigations.',
  },
  {
    icon: Users,
    title: 'Community Verification',
    description: 'Crowd-sourced validation improves report accuracy.',
  },
  {
    icon: TrendingUp,
    title: 'Reputation System',
    description: 'Trusted reporters earn badges and enhanced visibility.',
  },
  {
    icon: Eye,
    title: 'Watchlists',
    description: 'Monitor specific entities and receive alerts on new activity.',
  },
];

// Partner Types
const partnerTypes = [
  {
    icon: Building2,
    title: 'Law Enforcement',
    description: 'Police departments, cybercrime units, and international agencies.',
  },
  {
    icon: Scale,
    title: 'Regulatory Bodies',
    description: 'Financial regulators, consumer protection agencies, and government bodies.',
  },
  {
    icon: Banknote,
    title: 'Financial Institutions',
    description: 'Banks, payment processors, and cryptocurrency exchanges.',
  },
  {
    icon: Shield,
    title: 'Security Companies',
    description: 'Cybersecurity firms, fraud prevention services, and investigators.',
  },
];

// Recovery Steps
const recoverySteps = [
  {
    step: 1,
    title: 'Report Immediately',
    description: 'Time is critical. Submit your report as soon as possible to increase recovery chances.',
    icon: Clock,
  },
  {
    step: 2,
    title: 'Document Everything',
    description: 'Save all communications, transactions, and evidence related to the scam.',
    icon: FileCheck,
  },
  {
    step: 3,
    title: 'Contact Your Bank',
    description: 'Notify your financial institution immediately to freeze accounts and reverse transactions.',
    icon: Banknote,
  },
  {
    step: 4,
    title: 'File Official Reports',
    description: 'Report to local police, IC3, FTC, and relevant authorities in your jurisdiction.',
    icon: FileText,
  },
  {
    step: 5,
    title: 'Monitor Your Accounts',
    description: 'Watch for unauthorized activity and consider credit monitoring services.',
    icon: Eye,
  },
  {
    step: 6,
    title: 'Seek Professional Help',
    description: 'Consider consulting fraud recovery specialists and legal professionals.',
    icon: UserCheck,
  },
];

export default function NewReportPage() {
  const router = useRouter();
  const params = useParams();
  const pageLocale = (params?.locale as Locale) || 'en';
  const pt = getPageTranslations(pageLocale);
  const { translations, locale } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CompleteReportForm>>({
    currency: 'EUR',
    perpetratorType: 'INDIVIDUAL',
    wantUpdates: false,
    agreeToTerms: false,
    agreeToGDPR: false,
  });
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build translated steps array
  const steps = useMemo(() => {
    const reportSteps = translations.report?.steps || {};
    return stepKeys.map((key, index) => {
      const step = reportSteps[key as keyof typeof reportSteps];
      const stepData = typeof step === 'object' && step !== null ? step : { title: key, description: '' };
      return {
        id: index + 1,
        title: (stepData as { title?: string; description?: string }).title || key,
        description: (stepData as { title?: string; description?: string }).description || '',
      };
    });
  }, [translations]);

  // Load draft from encrypted localStorage on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await secureStorageGet<Partial<CompleteReportForm>>('report-draft');
        if (draft) {
          setFormData((prev) => ({ ...prev, ...draft }));
          toast.info('Načítaný uložený koncept');
        }
      } catch {
        // Ignore invalid draft
      }
    };
    loadDraft();
  }, []);

  // Check if form has unsaved changes (beyond initial default values)
  const hasUnsavedChanges = useMemo(() => {
    const defaultKeys = ['currency', 'perpetratorType', 'wantUpdates', 'agreeToTerms', 'agreeToGDPR'];
    return Object.entries(formData).some(([key, value]) => {
      if (defaultKeys.includes(key)) return false;
      return value !== undefined && value !== null && value !== '';
    }) || files.length > 0;
  }, [formData, files]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but this is required
        e.returnValue = 'Máte neuložené zmeny. Naozaj chcete opustiť stránku?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (): boolean => {
    let schema;
    let data;

    switch (currentStep) {
      case 1:
        schema = fraudTypeSchema;
        data = { fraudType: formData.fraudType };
        break;
      case 2:
        schema = basicInfoSchema;
        data = {
          title: formData.title,
          description: formData.description,
          incidentDate: formData.incidentDate,
          country: formData.country,
          city: formData.city,
          postalCode: formData.postalCode,
          amount: formData.amount,
          currency: formData.currency,
        };
        break;
      case 3:
        // Perpetrator step - optional fields, just validate format if provided
        schema = perpetratorSchema;
        data = {
          perpetratorType: formData.perpetratorType,
          name: formData.name,
          nickname: formData.nickname,
          username: formData.username,
          approxAge: formData.approxAge,
          nationality: formData.nationality,
          physicalDescription: formData.physicalDescription,
          phone: formData.phone,
          email: formData.email,
          socialMedia: formData.socialMedia,
          companyName: formData.companyName,
          companyId: formData.companyId,
          address: formData.address,
        };
        break;
      case 4:
        // Digital Footprints step - optional fields, validate format if provided
        schema = digitalFootprintsSchema;
        data = {
          telegram: formData.telegram,
          whatsapp: formData.whatsapp,
          signalNumber: formData.signalNumber,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktokHandle: formData.tiktokHandle,
          twitterHandle: formData.twitterHandle,
          websiteUrl: formData.websiteUrl,
          domainName: formData.domainName,
          domainCreationDate: formData.domainCreationDate,
          ipAddress: formData.ipAddress,
          ipCountry: formData.ipCountry,
          ispProvider: formData.ispProvider,
          ipAbuseScore: formData.ipAbuseScore,
        };
        break;
      case 5:
        // Financial Details step - optional, no required validation
        // The validation schema requires at least one section filled
        // but we'll make it optional for the form flow
        return true;
      case 6:
        // Company & Vehicle step - optional, no required validation
        return true;
      case 7:
        // Evidence step - no required validation
        return true;
      case 8:
        schema = contactInfoSchema;
        data = {
          reporterName: formData.reporterName,
          reporterEmail: formData.reporterEmail,
          reporterPhone: formData.reporterPhone,
          wantUpdates: formData.wantUpdates,
          agreeToTerms: formData.agreeToTerms,
          agreeToGDPR: formData.agreeToGDPR,
        };
        break;
      case 9:
        // Review step - validate consents
        if (!formData.agreeToTerms || !formData.agreeToGDPR) {
          toast.error('Musíte súhlasiť s podmienkami a GDPR');
          return false;
        }
        return true;
      default:
        return true;
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error('Prosím opravte chyby vo formulári');
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      // Scroll to form section instead of page top for better UX
      setTimeout(() => {
        document.getElementById('report-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to form section instead of page top for better UX
      setTimeout(() => {
        document.getElementById('report-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await secureStorageSet('report-draft', formData);
      toast.success('Koncept bol uložený (šifrovaný)');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Nepodarilo sa uložiť koncept');
    }
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
    // Scroll to form section instead of page top for better UX
    setTimeout(() => {
      document.getElementById('report-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions from rapid clicks
    if (isSubmitting) return;
    if (!validateStep()) return;

    setIsSubmitting(true);

    // Debug: Log submission start
    console.log('[ScamNemesis Debug] ========== REPORT SUBMISSION START ==========');
    console.log('[ScamNemesis Debug] Timestamp:', new Date().toISOString());
    console.log('[ScamNemesis Debug] Form data:', JSON.stringify(formData, null, 2));
    console.log('[ScamNemesis Debug] Files count:', files.length);

    try {
      // Step 1: Upload evidence files to S3 and collect external URLs
      let uploadedEvidence: Array<{
        type: string;
        file_key?: string;
        external_url?: string;
        description?: string;
        category?: string;
      }> = [];

      if (files.length > 0) {
        const filesToUpload = files.filter((f) => f.file);
        const externalLinks = files.filter((f) => f.externalUrl && !f.file);

        // Upload actual files to S3
        if (filesToUpload.length > 0) {
          console.log('[ScamNemesis Debug] Step 1: Uploading files to S3');
          console.log('[ScamNemesis Debug] Files to upload:', filesToUpload.map(f => ({ name: f.name, size: f.size, type: f.type })));
          toast.info('Nahrávanie súborov...');

          const uploadFormData = new FormData();
          filesToUpload.forEach((f) => {
            if (f.file) {
              uploadFormData.append('files', f.file);
            }
          });

          // Add AbortController with 240s timeout for file uploads (4 minutes for large files)
          const uploadController = new AbortController();
          const uploadTimeoutId = setTimeout(() => uploadController.abort(), 240000);

          let uploadResponse: Response;
          try {
            uploadResponse = await fetch('/api/v1/evidence/upload', {
              method: 'POST',
              body: uploadFormData,
              credentials: 'include',
              signal: uploadController.signal,
            });
          } catch (uploadFetchError) {
            clearTimeout(uploadTimeoutId);
            if (uploadFetchError instanceof Error && uploadFetchError.name === 'AbortError') {
              throw new Error('Nahrávanie súborov trvalo príliš dlho. Skúste nahrať menšie súbory.');
            }
            throw uploadFetchError;
          }
          clearTimeout(uploadTimeoutId);

          console.log('[ScamNemesis Debug] File upload response status:', uploadResponse.status);

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            console.error('[ScamNemesis Debug] File upload error:', uploadResponse.status, uploadError);
            // S3 503 is critical - user selected files to upload, we cannot silently drop them
            if (uploadResponse.status === 503) {
              throw new Error('Služba nahrávania súborov je dočasne nedostupná. Skúste to prosím neskôr.');
            } else {
              throw new Error(uploadError.message || 'Chyba pri nahrávaní súborov');
            }
          } else {
            const uploadResult = await uploadResponse.json();
            console.log('[ScamNemesis Debug] File upload success:', uploadResult);

            // Map uploaded files to evidence format
            uploadedEvidence = uploadResult.uploaded.map(
              (uploaded: { fileKey: string; mimeType: string }, index: number) => {
                const originalFile = filesToUpload[index];
                // Map MIME type and category to EvidenceType enum values (must match Prisma enum)
                // Prisma enum: IMAGE, DOCUMENT, VIDEO, AUDIO, PAYMENT_EVIDENCE, FRAUDSTER_PHOTO,
                //              SCREENSHOT, DAMAGE_DOCS, CRIME_SCENE, OTHER
                let evidenceType = 'OTHER';
                const category = originalFile?.category;

                // First check category for specific types
                if (category === 'CRIME_SCENE') {
                  evidenceType = 'CRIME_SCENE';
                } else if (category === 'FRAUDSTER_PHOTOS') {
                  evidenceType = 'FRAUDSTER_PHOTO';
                } else if (category === 'PAYMENT') {
                  evidenceType = 'PAYMENT_EVIDENCE';
                } else if (category === 'DAMAGE_DOCUMENTATION') {
                  evidenceType = 'DAMAGE_DOCS';
                } else if (uploaded.mimeType.startsWith('image/')) {
                  evidenceType = 'SCREENSHOT';
                } else if (uploaded.mimeType.startsWith('video/')) {
                  evidenceType = 'VIDEO';
                } else if (uploaded.mimeType.includes('pdf') || uploaded.mimeType.includes('document')) {
                  evidenceType = 'DOCUMENT';
                } else if (uploaded.mimeType.startsWith('audio/')) {
                  evidenceType = 'AUDIO';
                }
                return {
                  type: evidenceType,
                  file_key: uploaded.fileKey,
                  description: originalFile?.description,
                };
              }
            );
          }
        }

        // Add external URLs as evidence (no file upload needed)
        externalLinks.forEach((link) => {
          uploadedEvidence.push({
            type: 'OTHER', // External links use OTHER type since EXTERNAL_LINK isn't in the enum
            external_url: link.externalUrl,
            description: link.description || `External link: ${link.externalUrl}`,
          });
        });
      }

      // Step 2: Prepare report data as JSON
      // Helper: Convert date string to ISO 8601 format (API expects datetime with time component)
      const toISODateTime = (dateStr: string | undefined): string | undefined => {
        if (!dateStr) return undefined;
        // If already in ISO format with time, return as-is
        if (dateStr.includes('T')) return dateStr;
        // Convert "YYYY-MM-DD" to "YYYY-MM-DDT00:00:00.000Z"
        return `${dateStr}T00:00:00.000Z`;
      };

      // Helper: Check if value is empty (undefined, null, empty string, or whitespace-only string)
      const isEmpty = (v: unknown): boolean =>
        v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

      // Helper: Remove empty values from object (deep clean)
      const cleanObject = <T extends Record<string, unknown>>(obj: T): Partial<T> | undefined => {
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          if (!isEmpty(value)) {
            // Recursively clean nested objects
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              const nestedCleaned = cleanObject(value as Record<string, unknown>);
              if (nestedCleaned && Object.keys(nestedCleaned).length > 0) {
                cleaned[key] = nestedCleaned;
              }
            } else {
              cleaned[key] = value;
            }
          }
        }
        return Object.keys(cleaned).length > 0 ? (cleaned as Partial<T>) : undefined;
      };

      // Helper: Check if object has any defined values (after cleaning)
      const hasDefinedValues = (obj: Record<string, unknown>): boolean => {
        return Object.values(obj).some(v => !isEmpty(v));
      };

      // Build perpetrator object only if it has data
      const perpetratorData = {
        perpetrator_type: formData.perpetratorType?.toUpperCase() || 'INDIVIDUAL',
        full_name: formData.name,
        nickname: formData.nickname,
        username: formData.username,
        approx_age: formData.approxAge !== undefined && formData.approxAge !== null && formData.approxAge !== ''
          ? parseInt(String(formData.approxAge), 10)
          : undefined,
        nationality: formData.nationality,
        physical_description: formData.physicalDescription,
        phone: formData.phone,
        email: formData.email,
        address: formData.address ? { street: formData.address } : undefined,
      };

      // Build digital footprints object only if it has data
      const digitalFootprintsData = {
        telegram: formData.telegram,
        whatsapp: formData.whatsapp,
        signal: formData.signalNumber,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktokHandle,
        twitter: formData.twitterHandle,
        website_url: formData.websiteUrl,
        domain_name: formData.domainName,
        domain_creation_date: toISODateTime(formData.domainCreationDate),
        ip_address: formData.ipAddress,
        ip_country: formData.ipCountry?.trim().substring(0, 2).toUpperCase(),
        isp: formData.ispProvider,
        ip_abuse_score: formData.ipAbuseScore !== undefined && formData.ipAbuseScore !== null && formData.ipAbuseScore !== ''
          ? parseInt(String(formData.ipAbuseScore), 10)
          : undefined,
      };

      // Build financial object only if it has data
      const financialData = {
        iban: formData.iban,
        account_holder: formData.accountHolderName,
        account_number: formData.accountNumber,
        bank_name: formData.bankName,
        bank_country: formData.bankCountry?.trim().substring(0, 2).toUpperCase(),
        swift_bic: formData.swiftBic,
        routing_number: formData.routingNumber,
        bsb: formData.bsbCode,
        sort_code: formData.sortCode,
        ifsc: formData.ifscCode,
        cnaps: formData.cnapsCode,
        other_banking_details: formData.otherBankingDetails,
      };

      // Build crypto object only if it has relevant data
      const cryptoData = {
        wallet_address: formData.walletAddress,
        blockchain: formData.blockchain?.toUpperCase() as typeof formData.blockchain,
        exchange_wallet_name: formData.exchangeName,
        transaction_hash: formData.transactionHash,
        paypal_account: formData.paypalAccount,
      };

      // Build company object only if it has relevant data
      const companyData = {
        name: formData.companyName,
        vat_tax_id: formData.vatTaxId || formData.companyId,
        address: formData.companyStreet
          ? cleanObject({
              street: formData.companyStreet,
              city: formData.companyCity,
              postal_code: formData.companyPostalCode,
              country: formData.companyCountry,
            })
          : undefined,
      };

      // Build vehicle object only if it has relevant data
      const vehicleData = {
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        color: formData.vehicleColor,
        license_plate: formData.vehicleLicensePlate,
        vin: formData.vehicleVin,
        registered_owner: formData.registeredOwner,
      };

      // Build location object only if it has value
      const locationData = cleanObject({
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country?.trim().substring(0, 2).toUpperCase(),
      });

      // Build incident object with cleaned optional fields
      const incidentData = {
        fraud_type: formData.fraudType?.toUpperCase() || 'OTHER',
        date: toISODateTime(formData.incidentDate),
        summary: formData.title || 'Report',
        description: formData.description,
        // Only send financial_loss if amount is positive (API requires > 0)
        financial_loss: formData.amount && parseFloat(String(formData.amount)) > 0
          ? {
              amount: parseFloat(String(formData.amount)),
              currency: formData.currency || 'EUR',
            }
          : undefined,
        // Only send location if at least one field has value
        location: locationData,
      };

      // Build reporter object - email is required, others are optional
      const reporterData = {
        name: formData.reporterName,
        email: formData.reporterEmail || 'anonymous@scamnemesis.com',
        phone: formData.reporterPhone,
        preferred_language: locale || 'sk',
        consent: formData.agreeToGDPR || false,
        want_updates: formData.wantUpdates || false,
        agree_to_terms: formData.agreeToTerms || false,
      };

      const reportData = {
        // Clean incident to remove undefined/empty values
        incident: cleanObject(incidentData) as typeof incidentData,
        // Only include if has any data (prevents Zod validation issues with empty objects)
        // Use cleanObject to remove empty strings and undefined values
        perpetrator: hasDefinedValues(perpetratorData) ? cleanObject(perpetratorData) : undefined,
        digital_footprints: hasDefinedValues(digitalFootprintsData) ? cleanObject(digitalFootprintsData) : undefined,
        financial: hasDefinedValues(financialData) ? cleanObject(financialData) : undefined,
        crypto: hasDefinedValues(cryptoData) ? cleanObject(cryptoData) : undefined,
        company: hasDefinedValues(companyData) ? cleanObject(companyData) : undefined,
        vehicle: hasDefinedValues(vehicleData) ? cleanObject(vehicleData) : undefined,
        evidence: uploadedEvidence.length > 0 ? uploadedEvidence : undefined,
        // Clean reporter to remove empty optional fields (name, phone)
        reporter: cleanObject(reporterData) as typeof reporterData,
      };

      // Step 3: Submit report with timeout and AbortController
      console.log('[ScamNemesis Debug] Step 3: Submitting report to API');
      console.log('[ScamNemesis Debug] Report data being sent:', JSON.stringify(reportData, null, 2));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 240000); // 240 second (4 min) timeout

      try {
        const response = await fetch('/api/v1/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('[ScamNemesis Debug] API response status:', response.status);

        if (response.ok) {
          const data = await response.json().catch(() => ({ id: 'unknown' }));
          console.log('[ScamNemesis Debug] SUCCESS! Response data:', data);
          // Clear saved draft using secure storage
          secureStorageRemove('report-draft');
          // Reset all form state to prevent stale data if user navigates back
          setFormData({});
          setFiles([]);
          setErrors({});
          toast.success('Hlásenie bolo úspešne odoslané!');
          router.push(`/${locale}/report/success?id=${data.publicId || data.id}`);
        } else {
          const errorData = await response.json().catch(() => null);
          console.error('[ScamNemesis Debug] API ERROR!');
          console.error('[ScamNemesis Debug] Status:', response.status);
          console.error('[ScamNemesis Debug] Error data:', JSON.stringify(errorData, null, 2));
          console.error('[ScamNemesis Debug] Request ID:', errorData?.request_id);
          console.error('[ScamNemesis Debug] Error type:', errorData?.error_type);
          toast.error(errorData?.message || 'Chyba pri odosielaní hlásenia');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          toast.error('Požiadavka vypršala. Skúste to prosím znova.');
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('[ScamNemesis Debug] ========== SUBMIT EXCEPTION ==========');
      console.error('[ScamNemesis Debug] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[ScamNemesis Debug] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[ScamNemesis Debug] Full error:', error);
      if (error instanceof Error && error.stack) {
        console.error('[ScamNemesis Debug] Stack trace:', error.stack);
      }
      toast.error(error instanceof Error ? error.message : 'Chyba pri odosielaní hlásenia');
    } finally {
      console.log('[ScamNemesis Debug] ========== REPORT SUBMISSION END ==========');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FraudTypeStep
            selectedType={formData.fraudType}
            onSelect={(type) => updateField('fraudType', type)}
          />
        );

      case 2:
        return (
          <BasicInfoStep
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        );

      case 3:
        return (
          <PerpetratorStep
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        );

      case 4:
        return (
          <DigitalFootprintsStep
            data={formData as Partial<DigitalFootprintsForm>}
            errors={errors}
            onChange={updateField}
          />
        );

      case 5:
        return (
          <FinancialDetailsStep
            data={formData as Partial<FinancialDetailsForm>}
            errors={errors}
            onChange={updateField}
          />
        );

      case 6:
        return (
          <CompanyVehicleStep
            data={formData as Partial<CompanyVehicleForm>}
            errors={errors}
            onChange={updateField}
          />
        );

      case 7:
        return (
          <EvidenceStep
            files={files}
            onFilesChange={setFiles}
          />
        );

      case 8:
        return (
          <ContactStep
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        );

      case 9:
        return (
          <ReviewStep
            data={{ ...formData, files }}
            onEdit={handleGoToStep}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container relative py-12 md:py-16 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  {pt.trustedPlatform}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  {pt.secureConfidential}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  {pt.records}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                {pt.heroTitle}{' '}
                <span className="text-primary">{pt.heroTitleHighlight}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
                {pt.heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {pt.startReport}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => router.push(`/${pageLocale}/search`)}
                >
                  <Search className="h-5 w-5 mr-2" />
                  {pt.searchDatabase}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">612M+</div>
                  <div className="text-sm text-muted-foreground">{pt.statsRecords}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">130+</div>
                  <div className="text-sm text-muted-foreground">{pt.statsDataSources}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">{pt.statsPartners}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">{pt.statsMonitoring}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens After Submission */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  {pt.whatHappensTitle}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {pt.whatHappensDesc}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{pt.pdfGenerated}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pt.pdfGeneratedDesc}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <Share2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{pt.sharedAuthorities}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pt.sharedAuthoritiesDesc}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Database className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{pt.addedToDatabase}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pt.addedToDatabaseDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions Section */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 p-6 md:p-8 rounded-2xl bg-card border border-primary/20">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">
                    {pt.instructionsTitle}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">{pt.instruction1}</span>{' '}
                          {pt.instruction1Desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">{pt.instruction2}</span>{' '}
                          {pt.instruction2Desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">{pt.instruction3}</span>{' '}
                          {pt.instruction3Desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Report Form Section */}
        <section id="report-form" className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              {/* Form Header */}
              <div className="mb-8">
                <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {translations.report?.backToHome || 'Back to home page'}
                </Button>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{translations.report?.title || 'Report Fraud'}</h2>
                <p className="text-muted-foreground mt-2">
                  {translations.report?.subtitle || 'Help protect others from scammers'}
                </p>
              </div>

              {/* Step Wizard */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <StepWizard steps={steps} currentStep={currentStep} />
                </CardContent>
              </Card>

              {/* Step Content */}
              <Card id="report-form-card" className="mb-8">
                <CardContent className="pt-10 pb-10 px-6 md:px-10">
                  {renderStep()}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="!border-gray-400 !text-gray-700 dark:!text-gray-200 dark:!border-gray-500 hover:!bg-gray-100 dark:hover:!bg-gray-700 px-4 py-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {translations.report?.buttons?.back || translations.common?.back || 'Back'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSaveDraft}
                  className="!text-gray-700 dark:!text-gray-200 hover:!bg-gray-100 dark:hover:!bg-gray-700 px-4 py-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {translations.report?.buttons?.saveDraft || translations.report?.saveDraft || 'Save Draft'}
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    className="!bg-blue-600 hover:!bg-blue-700 !text-white font-semibold px-6 py-3 text-base"
                  >
                    {translations.report?.buttons?.next || translations.common?.next || 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="!bg-blue-600 hover:!bg-blue-700 !text-white font-semibold px-6 py-3 text-base disabled:!bg-blue-400"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {translations.report?.buttons?.submitting || 'Submitting...'}
                      </>
                    ) : (
                      <>
                        {translations.report?.buttons?.submit || translations.report?.submitReport || 'Submit Report'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing and Visualization */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <BarChart3 className="h-4 w-4" />
                  {pt.advancedTechnology}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  {pt.dataProcessingTitle}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {pt.dataProcessingDesc}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: BarChart3, title: pt.advancedAnalytics, description: pt.advancedAnalyticsDesc },
                  { icon: PieChart, title: pt.visualReports, description: pt.visualReportsDesc },
                  { icon: LineChart, title: pt.trendAnalysis, description: pt.trendAnalysisDesc },
                  { icon: MapPin, title: pt.geographicMapping, description: pt.geographicMappingDesc },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Advanced OSINT Section */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                    <Search className="h-4 w-4" />
                    {pt.intelligenceCapabilities}
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                    {pt.osintTitle}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {pt.osintDesc}
                  </p>
                  <div className="space-y-3">
                    {[
                      pt.osintFeature1,
                      pt.osintFeature2,
                      pt.osintFeature3,
                      pt.osintFeature4,
                      pt.osintFeature5,
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Search, title: pt.deepWebAnalysis, description: pt.deepWebAnalysisDesc },
                    { icon: Network, title: pt.networkMapping, description: pt.networkMappingDesc },
                    { icon: Fingerprint, title: pt.digitalFootprint, description: pt.digitalFootprintDesc },
                    { icon: Database, title: pt.dataSources130, description: pt.dataSources130Desc },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                        <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Engagement Section */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                  <Users className="h-4 w-4" />
                  {pt.communityPower}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  {pt.communityTitle}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {pt.communityDesc}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: MessageSquare, title: pt.interactiveReports, description: pt.interactiveReportsDesc },
                  { icon: Users, title: pt.communityVerification, description: pt.communityVerificationDesc },
                  { icon: TrendingUp, title: pt.reputationSystem, description: pt.reputationSystemDesc },
                  { icon: Eye, title: pt.watchlists, description: pt.watchlistsDesc },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-card border hover:border-green-500/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Sharing with Partners */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                  <Link2 className="h-4 w-4" />
                  {pt.globalNetwork}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  {pt.partnersTitle}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {pt.partnersDesc}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Building2, title: pt.lawEnforcement, description: pt.lawEnforcementDesc },
                  { icon: Scale, title: pt.regulatoryBodies, description: pt.regulatoryBodiesDesc },
                  { icon: Banknote, title: pt.financialInstitutions, description: pt.financialInstitutionsDesc },
                  { icon: Shield, title: pt.securityCompanies, description: pt.securityCompaniesDesc },
                ].map((partner, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-card border hover:border-purple-500/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                      <partner.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{partner.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 md:p-8 rounded-2xl bg-card border border-purple-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1">{pt.privacyProtected}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {pt.privacyProtectedDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scam Recovery Section */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
                  <Heart className="h-4 w-4" />
                  {pt.victimSupport}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  {pt.scamRecovery}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {pt.scamRecoveryDesc}
                </p>
              </div>

              {/* Recovery Steps Timeline */}
              <div className="relative">
                {/* Timeline Line - Hidden on mobile */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/50 via-orange-500/30 to-orange-500/10 transform -translate-x-1/2" />

                <div className="space-y-6 md:space-y-0">
                  {[
                    { step: 1, title: pt.reportImmediately, description: pt.reportImmediatelyDesc, icon: Clock },
                    { step: 2, title: pt.documentEverything, description: pt.documentEverythingDesc, icon: FileCheck },
                    { step: 3, title: pt.contactBank, description: pt.contactBankDesc, icon: Banknote },
                    { step: 4, title: pt.fileOfficialReports, description: pt.fileOfficialReportsDesc, icon: FileText },
                    { step: 5, title: pt.monitorAccounts, description: pt.monitorAccountsDesc, icon: Eye },
                    { step: 6, title: pt.seekProfessionalHelp, description: pt.seekProfessionalHelpDesc, icon: UserCheck },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`relative flex flex-col md:flex-row items-start gap-4 md:gap-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Content Card */}
                      <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="p-5 md:p-6 rounded-xl bg-card border hover:border-orange-500/50 hover:shadow-lg transition-all duration-300">
                          <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                              <item.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold">{item.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Step Number - Center */}
                      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                          {item.step}
                        </div>
                      </div>

                      {/* Mobile Step Number */}
                      <div className="md:hidden flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {pt.step} {item.step}
                        </span>
                      </div>

                      {/* Spacer for alternating layout */}
                      <div className="hidden md:block flex-1" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">{pt.bewareRecoveryScams}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {pt.bewareRecoveryScamsDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Mail className="h-4 w-4" />
                {pt.getInTouch}
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                {pt.contactTitle}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                {pt.contactDesc}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <a
                  href="mailto:info@scamnemesis.com"
                  className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{pt.emailUs}</div>
                    <div className="text-sm text-muted-foreground">info@scamnemesis.com</div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                </a>

                <Link
                  href={`/${pageLocale}/help`}
                  className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{pt.helpCenter}</div>
                    <div className="text-sm text-muted-foreground">{pt.faqsGuides}</div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  {pt.secureCommunication}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {pt.responseTime}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 text-purple-500" />
                  {pt.worldwideSupport}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 border-t">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                {pt.readyToReport}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {pt.readyToReportDesc}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {pt.startReportNow}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => router.push(`/${pageLocale}/search`)}
                >
                  <Search className="h-5 w-5 mr-2" />
                  {pt.searchOurDatabase}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
