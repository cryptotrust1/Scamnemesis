'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Building,
  Scale,
  Globe,
  Users,
  ArrowRight,
  CheckCircle,
  FileText,
  CreditCard,
  Lock,
  Award,
  DollarSign,
  Target,
  Briefcase,
  TrendingUp,
  Eye,
  UserCheck,
  Fingerprint,
  Database,
  ShieldCheck,
  BadgeCheck,
  FileCheck,
  Wallet,
  Bitcoin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ORDER_FORM_URL = 'https://opnform.com/forms/contact-form-2qck1j';

// JSON-LD Schema Markup for SEO
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'Professional investigative due diligence and business partner vetting services with certified fraud examiners and intelligence specialists.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    availableLanguage: ['en'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Investigative Due Diligence and Business Partner Vetting',
  provider: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Worldwide',
  },
  description: 'Comprehensive investigative due diligence services for business partners, suppliers, and investments. Expert-led investigations with CFE, CAMS, CISA, CISM, OSCP certified specialists delivering 360-degree intelligence profiles within 30 days.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Due Diligence Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Corporate Identity & Legal Architecture Verification',
          description: 'Verification of legal structure, ownership, and regulatory status across international business registries.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Financial Integrity & Reputational Risk Assessment',
          description: 'Analysis of financial health and reputational profile through public records, court filings, and media sources.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Digital Footprint & Asset Mapping',
          description: 'OSINT and cyber intelligence analysis of online presence, domain history, and digital infrastructure.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Leadership & UBO Background Screening',
          description: 'Thorough background investigations into key individuals and ultimate beneficial owners (UBOs).',
        },
      },
    ],
  },
  offers: {
    '@type': 'Offer',
    price: 'Contact for Quote',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    deliveryLeadTime: {
      '@type': 'QuantitativeValue',
      value: 30,
      unitCode: 'DAY',
    },
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'When is due diligence essential for evaluating strategic partnerships?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Before committing capital and resources, it is imperative to verify the operational, financial, and reputational integrity of a potential partner. Our analysis confirms the legitimacy of the entity and its key principals, ensuring you are building your venture on a solid foundation.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does ScamNemesis vet suppliers and vendors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We vet your key suppliers for financial stability, regulatory compliance, adverse media history, and other red flags that could indicate a risk of disruption or reputational harm.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications do your investigators hold?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each investigation is conducted by certified specialists holding credentials such as CFE (Certified Fraud Examiner), CAMS (Certified Anti-Money Laundering Specialist), CISA (Certified Information Systems Auditor), CISM (Certified Information Security Manager), and OSCP (Offensive Security Certified Professional).',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the due diligence report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The comprehensive PDF report includes: verification of corporate identity and legal status, analysis of ownership and management structure including Ultimate Beneficial Owners (UBOs), assessment of financial integrity and solvency, reputation and risk evaluation, and audit of digital footprint and online assets.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a due diligence investigation take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You will receive a comprehensive PDF report via email within 30 days from the initiation of the investigation.',
      },
    },
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
      name: 'Due Diligence Services',
      item: 'https://scamnemesis.com/verify-serviceproduct',
    },
  ],
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Business Due Diligence & Partner Vetting | ScamNemesis',
  description: 'Expert investigative due diligence for business partners, suppliers & investments. CFE, CAMS, CISA certified specialists. Get your report in 30 days.',
  url: 'https://scamnemesis.com/verify-serviceproduct',
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
  },
  about: {
    '@type': 'Thing',
    name: 'Business Due Diligence Services',
    description: 'Professional investigative services for corporate integrity verification, partner vetting, and risk assessment.',
  },
  mainEntity: {
    '@type': 'Service',
    name: 'Investigative Due Diligence and Business Partner Vetting',
    provider: {
      '@type': 'Organization',
      name: 'ScamNemesis',
    },
  },
  breadcrumb: {
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
        name: 'Due Diligence Services',
        item: 'https://scamnemesis.com/verify-serviceproduct',
      },
    ],
  },
};

const aggregateRatingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ScamNemesis Business Due Diligence Service',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '127',
  },
  provider: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
  },
};

type Locale = 'en' | 'sk' | 'cs' | 'de';

const getPageTranslations = (locale: Locale) => {
  const t = {
    en: {
      badge: 'Professional Due Diligence Services',
      heroTitle: 'Investigative Due Diligence & Business Partner Vetting',
      heroSubtitleStrong: 'Mitigate Risk Before You Engage:',
      heroSubtitle: 'Verify the Integrity of Your Next Business Partner, Supplier, or Investment',
      orderService: 'Order Service Now',
      learnMore: 'Learn More',
      intro1: "In today's interconnected global economy, every new business relationship presents both opportunity and risk. Unidentified liabilities, reputational issues, or non-compliant practices within a partner's operations can lead to significant financial loss, legal exposure, and brand damage. Standard background checks are no longer sufficient.",
      intro2: 'ScamNemesis provides comprehensive, expert-led investigative due diligence that delivers the critical intelligence you need to make strategic decisions with confidence. Our rapid, in-depth analysis uncovers the facts behind the figures, ensuring the entities you engage with are legitimate, reliable, and aligned with your standards of integrity.',
      confidentialityTitle: 'Guaranteed Confidentiality and Discretion',
      confidentialityDesc: 'We protect your privacy. All information is confidential and anonymous. We never share it without your consent.',
      useCasesTitle: 'Investigative Due Diligence for Business Partners',
      useCasesSubtitle: 'When is Professional Due Diligence Essential?',
      useCasesDesc: 'Our confidential investigative services are designed for high-stakes business scenarios where thorough vetting is non-negotiable. We provide critical intelligence for:',
      useCase1Title: 'Evaluating Strategic Partnerships & Joint Ventures',
      useCase1Desc: 'Before committing capital and resources, it is imperative to verify the operational, financial, and reputational integrity of a potential partner. Our analysis confirms the legitimacy of the entity and its key principals, ensuring you are building your venture on a solid foundation.',
      useCase2Title: 'Onboarding Key Suppliers & Vendors',
      useCase2Desc: 'A resilient and ethical supply chain is a critical business asset. We vet your key suppliers for financial stability, regulatory compliance, adverse media history, and other red flags that could indicate a risk of disruption or reputational harm. Ensure your supply chain is a source of strength, not a vulnerability.',
      useCase3Title: 'Pre-Investment & M&A Screening',
      useCase3Desc: 'For private equity firms, venture capitalists, and corporate development teams, our service provides an essential layer of preliminary integrity and reputational due diligence. We identify critical red flags—such as undisclosed litigation, connections to sanctioned individuals, or a history of fraud—that may be missed in traditional financial audits, allowing you to proceed with your transaction with greater certainty.',
      useCase4Title: 'Vetting High-Value Clients (KYB Compliance)',
      useCase4Desc: 'Protect your firm from financial crime and meet stringent regulatory requirements (e.g., AML/CFT). Our Know Your Business (KYB) verification process confirms the identity and legitimacy of new corporate clients, analyzes their ownership structure to identify Ultimate Beneficial Owners (UBOs), and screens for sanctions or criminal history.',
      processTitle: 'Our Investigative Process: Elite Due Diligence Across 4 Operational Layers',
      processDesc: 'Every investigation we conduct is executed as a precision operation — combining the methodology of intelligence agencies with the analytical discipline of top-tier investigators. Our approach is built on four powerful pillars and leverages hundreds of global data sources, advanced OSINT techniques, and proprietary databases. The result goes far beyond standard "verification" — it\'s a comprehensive intelligence-driven risk analysis.',
      pillar1Title: 'Corporate Identity & Legal Architecture',
      pillar1Desc: 'We dissect the legal structure of the entity down to the finest detail. Our team verifies its legal existence, ownership structure, and regulatory status across international business registries — including those not commonly accessible.',
      pillar2Title: 'Financial Integrity & Reputational Risks',
      pillar2Desc: 'We map the financial health and reputational profile of the target. Our analysts examine public records, court filings, data leaks, and deep-sourced media to uncover potential financial risks, discrepancies, or red flags.',
      pillar3Title: 'Digital Footprint & Asset Mapping',
      pillar3Desc: "Using advanced OSINT and cyber intelligence tools, we trace the entity's online presence, domain history, digital assets, and technical infrastructure. This enables us to reveal hidden connections, undisclosed assets, or signs of fraudulent activity.",
      pillar4Title: 'Human Factor & Leadership Screening',
      pillar4Desc: 'Behind every company stand people — and this is where most risks originate. We conduct thorough background investigations into the careers, reputations, and potential conflicts of interest of key individuals, including ultimate beneficial owners (UBOs), to identify threats others often miss.',
      whatYouGetBadge: 'What You Get',
      reportTitle: 'Due Diligence Report',
      reportDesc: 'Our investigative unit brings together experts with experience in Big 4 consulting firms, military intelligence, and international security agencies. Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, and OSCP®, ensuring the highest level of accuracy, quality, and professional expertise.',
      reportFeature1Title: 'Comprehensive and Practical Report',
      reportFeature1Desc: 'The result of our work is a detailed, clearly structured PDF report, delivered within 30 days. The document is designed as a practical guide for strategic decision-making.',
      reportFeature2Title: '360° Intelligence Profile',
      reportFeature2Desc: 'Complete view of corporate risks, financial integrity, reputation, and trustworthiness. Our due diligence is a proactive tool for protecting capital, reputation, and business interests.',
      reportFeature3Title: 'Transparent Pricing and No Surprises',
      reportFeature3Desc: 'Our services are offered at a fixed price, with no additional or hidden fees. You know exactly what you are getting – no unpleasant surprises.',
      reportIncludesTitle: 'Report Includes:',
      reportIncludesFooter: 'This 360° intelligence profile provides critical insights for strategic decision-making, capital protection, and minimizing legal or financial risks.',
      quoteText: 'Luck is a matter of preparation meeting opportunity.',
      quoteAuthor: 'Seneca',
      stepsTitle: 'Launch Your Confidential Corporate Investigation & Due Diligence in 3 Simple Steps',
      step1Title: 'Complete the Online Form',
      step1Desc: 'Fill out our online form with information about the target company or business partner. The form is quick, minimalistic, and all data is handled with strict confidentiality.',
      step1AfterSubmitting: 'After submitting:',
      step1A: 'We create a secure and private communication channel.',
      step1B: 'We explain the entire due diligence process in detail.',
      step1C: 'We provide an exact quote based on scope and complexity.',
      step2Title: 'Make a Secure Payment',
      step2Desc: 'Finalize your order through our secure payment gateway. We accept multiple payment methods:',
      step2CreditCards: 'Major credit cards',
      step2BankTransfers: 'Bank transfers',
      step2Crypto: 'Cryptocurrencies',
      step2TransparentPricing: 'Transparent, fixed pricing with no hidden fees.',
      step3Title: 'Receive Your Report',
      step3Desc: 'Our analysts initiate the investigation immediately. Receive your comprehensive PDF report via email within 30 days.',
      step3ReportIncludes: 'Report includes:',
      whyChooseTitle: 'Why Choose ScamNemesis for Advanced Business Intelligence?',
      whyChooseDesc: 'Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations. Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®, along with military certifications in intelligence and cybersecurity.',
      expertiseTitle: 'Intelligence-Grade Expertise',
      expertiseDesc: 'Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations.',
      certifiedTitle: 'Certified Specialists',
      certifiedDesc: 'Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®, along with military certifications in intelligence and cybersecurity.',
      osintTitle: 'Advanced OSINT Techniques',
      osintDesc: 'We employ advanced Open-Source Intelligence (OSINT) and digital analysis techniques integrating hundreds of global databases, corporate registries, and proprietary sources.',
      pricingTitle: 'Transparent Fixed Pricing',
      pricingDesc: 'All data is handled according to strict confidentiality and security standards. Our service is transparent and free of hidden fees.',
      certificationsLabel: 'Our team holds elite certifications:',
      testimonialTitle: 'Comprehensive Due Diligence Report',
      testimonialSubtitle: 'Protect your business interests.',
      testimonialDesc: 'Order your Due Diligence report today. Take your next strategic step with confidence. Our expert analysis provides the clarity you need to avoid working with unsuitable partners and helps you save significant time and money.',
      testimonialQuote: 'I paid $5,000 for the analysis and saved $1.5 million on a bad investment.',
      testimonialAuthor: 'One of our satisfied clients',
      testimonialFooter: 'This perfectly illustrates the value of our service. Business risk always exists, but with us, you can significantly reduce it.',
      ctaTitle: 'Protect Your Business Today',
      ctaDesc: 'Take your next strategic step with confidence. Our expert analysis provides the clarity you need to make informed decisions and protect your capital, reputation, and business interests.',
      ctaConfidential: 'Confidential & Secure',
      ctaNoHiddenFees: 'No Hidden Fees',
      ctaExpertAnalysis: 'Expert Analysis',
      // Arrays
      useCases: [
        { title: 'Evaluating Strategic Partnerships & Joint Ventures', description: 'Before committing capital and resources, it is imperative to verify the operational, financial, and reputational integrity of a potential partner. Our analysis confirms the legitimacy of the entity and its key principals, ensuring you are building your venture on a solid foundation.', icon: Users },
        { title: 'Onboarding Key Suppliers & Vendors', description: 'A resilient and ethical supply chain is a critical business asset. We vet your key suppliers for financial stability, regulatory compliance, adverse media history, and other red flags that could indicate a risk of disruption or reputational harm.', icon: Building },
        { title: 'Pre-Investment & M&A Screening', description: 'For private equity firms, venture capitalists, and corporate development teams, our service provides an essential layer of preliminary integrity and reputational due diligence. We identify critical red flags—such as undisclosed litigation, connections to sanctioned individuals, or a history of fraud.', icon: TrendingUp },
        { title: 'Vetting High-Value Clients (KYB Compliance)', description: 'Protect your firm from financial crime and meet stringent regulatory requirements (e.g., AML/CFT). Our Know Your Business (KYB) verification process confirms the identity and legitimacy of new corporate clients.', icon: UserCheck },
      ],
      pillars: [
        { number: '1', title: 'Corporate Identity & Legal Architecture', description: 'We dissect the legal structure of the entity down to the finest detail. Our team verifies its legal existence, ownership structure, and regulatory status across international business registries.', icon: Building },
        { number: '2', title: 'Financial Integrity & Reputational Risks', description: 'We map the financial health and reputational profile of the target. Our analysts examine public records, court filings, data leaks, and deep-sourced media.', icon: Scale },
        { number: '3', title: 'Digital Footprint & Asset Mapping', description: "Using advanced OSINT and cyber intelligence tools, we trace the entity's online presence, domain history, digital assets, and technical infrastructure.", icon: Globe },
        { number: '4', title: 'Human Factor & Leadership Screening', description: 'Behind every company stand people — and this is where most risks originate. We conduct thorough background investigations into key individuals.', icon: Fingerprint },
      ],
      deliverables: [
        'Verification of corporate identity and legal status',
        'Analysis of ownership and management structure, including Ultimate Beneficial Owners (UBOs)',
        'Assessment of financial integrity and solvency',
        'Reputation and risk evaluation of your business partner or investment',
        'Audit of digital footprint and online assets',
      ],
      whyChoose: [
        { title: 'Intelligence-Grade Expertise', description: 'Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations.', icon: Award },
        { title: 'Certified Specialists', description: 'Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®.', icon: BadgeCheck },
        { title: 'Advanced OSINT Techniques', description: 'We employ advanced Open-Source Intelligence (OSINT) and digital analysis techniques integrating hundreds of global databases.', icon: Database },
        { title: 'Transparent Fixed Pricing', description: 'All data is handled according to strict confidentiality and security standards. Our service is transparent and free of hidden fees.', icon: DollarSign },
      ],
      certifications: [
        { name: 'CFE', full: 'Certified Fraud Examiner' },
        { name: 'CAMS', full: 'Certified Anti-Money Laundering Specialist' },
        { name: 'CISA', full: 'Certified Information Systems Auditor' },
        { name: 'CISM', full: 'Certified Information Security Manager' },
        { name: 'OSCP', full: 'Offensive Security Certified Professional' },
      ],
    },
    de: {
      badge: 'Professionelle Due Diligence Dienste',
      heroTitle: 'Investigative Due Diligence & Geschäftspartnerprüfung',
      heroSubtitleStrong: 'Minimieren Sie das Risiko vor dem Engagement:',
      heroSubtitle: 'Überprüfen Sie die Integrität Ihres nächsten Geschäftspartners, Lieferanten oder Investments',
      orderService: 'Service Bestellen',
      learnMore: 'Mehr Erfahren',
      intro1: 'In der heutigen vernetzten Weltwirtschaft birgt jede neue Geschäftsbeziehung sowohl Chancen als auch Risiken. Nicht erkannte Verbindlichkeiten, Reputationsprobleme oder nicht konforme Praktiken im Betrieb eines Partners können zu erheblichen finanziellen Verlusten, rechtlichen Risiken und Markenschäden führen. Standardmäßige Hintergrundprüfungen reichen nicht mehr aus.',
      intro2: 'ScamNemesis bietet umfassende, von Experten geleitete investigative Due Diligence, die Ihnen die kritischen Informationen liefert, die Sie benötigen, um strategische Entscheidungen mit Zuversicht zu treffen. Unsere schnelle, eingehende Analyse deckt die Fakten hinter den Zahlen auf und stellt sicher, dass die Unternehmen, mit denen Sie zusammenarbeiten, legitim, zuverlässig und mit Ihren Integritätsstandards vereinbar sind.',
      confidentialityTitle: 'Garantierte Vertraulichkeit und Diskretion',
      confidentialityDesc: 'Wir schützen Ihre Privatsphäre. Alle Informationen sind vertraulich und anonym. Wir geben sie niemals ohne Ihre Zustimmung weiter.',
      useCasesTitle: 'Investigative Due Diligence für Geschäftspartner',
      useCasesSubtitle: 'Wann ist professionelle Due Diligence unerlässlich?',
      useCasesDesc: 'Unsere vertraulichen Ermittlungsdienste sind für Geschäftsszenarien mit hohem Einsatz konzipiert, bei denen eine gründliche Prüfung unverzichtbar ist. Wir liefern kritische Informationen für:',
      processTitle: 'Unser Ermittlungsprozess: Elite Due Diligence auf 4 operativen Ebenen',
      processDesc: 'Jede Untersuchung, die wir durchführen, wird als Präzisionsoperation ausgeführt — die Methodik von Geheimdiensten kombiniert mit der analytischen Disziplin erstklassiger Ermittler. Unser Ansatz basiert auf vier leistungsstarken Säulen und nutzt Hunderte globaler Datenquellen, fortschrittliche OSINT-Techniken und proprietäre Datenbanken.',
      whatYouGetBadge: 'Was Sie erhalten',
      reportTitle: 'Due Diligence Bericht',
      reportDesc: 'Unsere Ermittlungseinheit vereint Experten mit Erfahrung in Big-4-Beratungsfirmen, militärischer Aufklärung und internationalen Sicherheitsagenturen. Jede Untersuchung wird von zertifizierten Spezialisten mit Qualifikationen wie CFE®, CAMS®, CISA®, CISM® und OSCP® durchgeführt.',
      reportFeature1Title: 'Umfassender und praktischer Bericht',
      reportFeature1Desc: 'Das Ergebnis unserer Arbeit ist ein detaillierter, klar strukturierter PDF-Bericht, der innerhalb von 30 Tagen geliefert wird. Das Dokument ist als praktischer Leitfaden für strategische Entscheidungsfindung konzipiert.',
      reportFeature2Title: '360°-Intelligence-Profil',
      reportFeature2Desc: 'Vollständiger Überblick über Unternehmensrisiken, finanzielle Integrität, Reputation und Vertrauenswürdigkeit. Unsere Due Diligence ist ein proaktives Instrument zum Schutz von Kapital, Reputation und Geschäftsinteressen.',
      reportFeature3Title: 'Transparente Preisgestaltung ohne Überraschungen',
      reportFeature3Desc: 'Unsere Dienstleistungen werden zu einem Festpreis angeboten, ohne zusätzliche oder versteckte Gebühren. Sie wissen genau, was Sie bekommen – keine unangenehmen Überraschungen.',
      reportIncludesTitle: 'Der Bericht umfasst:',
      reportIncludesFooter: 'Dieses 360°-Intelligence-Profil liefert kritische Einblicke für strategische Entscheidungsfindung, Kapitalschutz und Minimierung rechtlicher oder finanzieller Risiken.',
      quoteText: 'Glück ist, wenn Vorbereitung auf Gelegenheit trifft.',
      quoteAuthor: 'Seneca',
      stepsTitle: 'Starten Sie Ihre vertrauliche Unternehmensermittlung & Due Diligence in 3 einfachen Schritten',
      step1Title: 'Online-Formular ausfüllen',
      step1Desc: 'Füllen Sie unser Online-Formular mit Informationen über das Zielunternehmen oder den Geschäftspartner aus. Das Formular ist schnell, minimalistisch und alle Daten werden streng vertraulich behandelt.',
      step1AfterSubmitting: 'Nach dem Absenden:',
      step1A: 'Wir erstellen einen sicheren und privaten Kommunikationskanal.',
      step1B: 'Wir erklären den gesamten Due-Diligence-Prozess im Detail.',
      step1C: 'Wir liefern ein genaues Angebot basierend auf Umfang und Komplexität.',
      step2Title: 'Sichere Zahlung durchführen',
      step2Desc: 'Schließen Sie Ihre Bestellung über unser sicheres Zahlungsgateway ab. Wir akzeptieren mehrere Zahlungsmethoden:',
      step2CreditCards: 'Gängige Kreditkarten',
      step2BankTransfers: 'Banküberweisungen',
      step2Crypto: 'Kryptowährungen',
      step2TransparentPricing: 'Transparente Festpreise ohne versteckte Gebühren.',
      step3Title: 'Ihren Bericht erhalten',
      step3Desc: 'Unsere Analysten beginnen sofort mit der Untersuchung. Erhalten Sie Ihren umfassenden PDF-Bericht per E-Mail innerhalb von 30 Tagen.',
      step3ReportIncludes: 'Der Bericht enthält:',
      whyChooseTitle: 'Warum ScamNemesis für fortgeschrittene Business Intelligence wählen?',
      whyChooseDesc: 'Unsere Ermittlungseinheit kombiniert Experten mit Erfahrung in militärischer Aufklärung, OSINT/SOCMINT-Operationen und Big-4-Unternehmensermittlungen. Jede Untersuchung wird von zertifizierten Spezialisten durchgeführt.',
      certificationsLabel: 'Unser Team verfügt über Elite-Zertifizierungen:',
      testimonialTitle: 'Umfassender Due Diligence Bericht',
      testimonialSubtitle: 'Schützen Sie Ihre Geschäftsinteressen.',
      testimonialDesc: 'Bestellen Sie noch heute Ihren Due-Diligence-Bericht. Gehen Sie Ihren nächsten strategischen Schritt mit Zuversicht. Unsere Expertenanalyse liefert Ihnen die Klarheit, die Sie benötigen.',
      testimonialQuote: 'Ich habe 5.000 € für die Analyse bezahlt und 1,5 Millionen € bei einer schlechten Investition gespart.',
      testimonialAuthor: 'Einer unserer zufriedenen Kunden',
      testimonialFooter: 'Dies veranschaulicht perfekt den Wert unseres Services. Geschäftsrisiken bestehen immer, aber mit uns können Sie sie erheblich reduzieren.',
      ctaTitle: 'Schützen Sie Ihr Unternehmen heute',
      ctaDesc: 'Gehen Sie Ihren nächsten strategischen Schritt mit Zuversicht. Unsere Expertenanalyse liefert Ihnen die Klarheit, die Sie benötigen, um fundierte Entscheidungen zu treffen.',
      ctaConfidential: 'Vertraulich & Sicher',
      ctaNoHiddenFees: 'Keine versteckten Gebühren',
      ctaExpertAnalysis: 'Expertenanalyse',
      useCases: [
        { title: 'Bewertung strategischer Partnerschaften & Joint Ventures', description: 'Bevor Sie Kapital und Ressourcen einsetzen, ist es unerlässlich, die operative, finanzielle und reputationsbezogene Integrität eines potenziellen Partners zu überprüfen.', icon: Users },
        { title: 'Onboarding wichtiger Lieferanten & Anbieter', description: 'Eine widerstandsfähige und ethische Lieferkette ist ein kritischer Geschäftswert. Wir prüfen Ihre wichtigsten Lieferanten auf finanzielle Stabilität und regulatorische Compliance.', icon: Building },
        { title: 'Vor-Investment & M&A-Screening', description: 'Für Private-Equity-Firmen, Risikokapitalgeber und Corporate-Development-Teams bietet unser Service eine wesentliche Schicht vorläufiger Integritäts- und Reputations-Due-Diligence.', icon: TrendingUp },
        { title: 'Prüfung hochwertiger Kunden (KYB-Compliance)', description: 'Schützen Sie Ihr Unternehmen vor Finanzkriminalität und erfüllen Sie strenge regulatorische Anforderungen (z.B. AML/CFT).', icon: UserCheck },
      ],
      pillars: [
        { number: '1', title: 'Unternehmensidentität & Rechtsarchitektur', description: 'Wir analysieren die rechtliche Struktur des Unternehmens bis ins kleinste Detail. Unser Team überprüft die rechtliche Existenz und Eigentümerstruktur.', icon: Building },
        { number: '2', title: 'Finanzielle Integrität & Reputationsrisiken', description: 'Wir kartieren die finanzielle Gesundheit und das Reputationsprofil des Ziels. Unsere Analysten untersuchen öffentliche Aufzeichnungen und Gerichtsakten.', icon: Scale },
        { number: '3', title: 'Digitaler Fußabdruck & Asset-Mapping', description: 'Mit fortschrittlichen OSINT- und Cyber-Intelligence-Tools verfolgen wir die Online-Präsenz, Domain-Historie und digitalen Assets des Unternehmens.', icon: Globe },
        { number: '4', title: 'Menschlicher Faktor & Führungskräfte-Screening', description: 'Hinter jedem Unternehmen stehen Menschen — und hier entstehen die meisten Risiken. Wir führen gründliche Hintergrunduntersuchungen durch.', icon: Fingerprint },
      ],
      deliverables: [
        'Überprüfung der Unternehmensidentität und des rechtlichen Status',
        'Analyse der Eigentümer- und Managementstruktur, einschließlich wirtschaftlich Berechtigter (UBOs)',
        'Bewertung der finanziellen Integrität und Solvenz',
        'Reputations- und Risikobewertung Ihres Geschäftspartners oder Investments',
        'Prüfung des digitalen Fußabdrucks und der Online-Assets',
      ],
      whyChoose: [
        { title: 'Nachrichtendienstliche Expertise', description: 'Unsere Ermittlungseinheit kombiniert Experten mit Erfahrung in militärischer Aufklärung, OSINT/SOCMINT-Operationen und Big-4-Unternehmensermittlungen.', icon: Award },
        { title: 'Zertifizierte Spezialisten', description: 'Jede Untersuchung wird von zertifizierten Spezialisten mit Qualifikationen wie CFE®, CAMS®, CISA®, CISM®, OSCP® durchgeführt.', icon: BadgeCheck },
        { title: 'Fortgeschrittene OSINT-Techniken', description: 'Wir setzen fortschrittliche Open-Source-Intelligence (OSINT) und digitale Analysetechniken ein, die Hunderte globaler Datenbanken integrieren.', icon: Database },
        { title: 'Transparente Festpreise', description: 'Alle Daten werden nach strengen Vertraulichkeits- und Sicherheitsstandards behandelt. Unser Service ist transparent und frei von versteckten Gebühren.', icon: DollarSign },
      ],
      certifications: [
        { name: 'CFE', full: 'Zertifizierter Betrugsprüfer' },
        { name: 'CAMS', full: 'Zertifizierter Spezialist für Geldwäschebekämpfung' },
        { name: 'CISA', full: 'Zertifizierter Informationssystem-Auditor' },
        { name: 'CISM', full: 'Zertifizierter Informationssicherheitsmanager' },
        { name: 'OSCP', full: 'Offensive Security Certified Professional' },
      ],
    },
    sk: {
      badge: 'Profesionálne Due Diligence služby',
      heroTitle: 'Investigatívna Due Diligence & Preverovanie obchodných partnerov',
      heroSubtitleStrong: 'Minimalizujte riziko pred spoluprácou:',
      heroSubtitle: 'Overte integritu vášho ďalšieho obchodného partnera, dodávateľa alebo investície',
      orderService: 'Objednať službu',
      learnMore: 'Viac informácií',
      intro1: 'V dnešnej prepojenej globálnej ekonomike predstavuje každý nový obchodný vzťah príležitosť aj riziko. Neidentifikované záväzky, reputačné problémy alebo nekonformné praktiky v operáciách partnera môžu viesť k významným finančným stratám, právnym rizikám a poškodeniu značky.',
      intro2: 'ScamNemesis poskytuje komplexnú, odborne vedenú investigatívnu due diligence, ktorá vám poskytuje kritické informácie potrebné na sebavedomé strategické rozhodnutia.',
      confidentialityTitle: 'Garantovaná dôvernosť a diskrétnosť',
      confidentialityDesc: 'Chránime vaše súkromie. Všetky informácie sú dôverné a anonymné. Nikdy ich nezdieľame bez vášho súhlasu.',
      useCasesTitle: 'Investigatívna Due Diligence pre obchodných partnerov',
      useCasesSubtitle: 'Kedy je profesionálna Due Diligence nevyhnutná?',
      useCasesDesc: 'Naše dôverné vyšetrovacie služby sú navrhnuté pre obchodné scenáre s vysokými stávkami, kde je dôkladné preverenie nevyhnutné.',
      processTitle: 'Náš vyšetrovací proces: Elitná Due Diligence na 4 operačných úrovniach',
      processDesc: 'Každé vyšetrovanie, ktoré vykonávame, je realizované ako presná operácia — kombinujúca metodológiu spravodajských agentúr s analytickou disciplínou špičkových vyšetrovateľov.',
      whatYouGetBadge: 'Čo získate',
      reportTitle: 'Due Diligence Report',
      reportDesc: 'Naša vyšetrovacia jednotka spája expertov so skúsenosťami z Big 4 poradenských firiem, vojenskej spravodajskej služby a medzinárodných bezpečnostných agentúr.',
      reportFeature1Title: 'Komplexný a praktický report',
      reportFeature1Desc: 'Výsledkom našej práce je podrobný, jasne štruktúrovaný PDF report, doručený do 30 dní.',
      reportFeature2Title: '360° spravodajský profil',
      reportFeature2Desc: 'Kompletný pohľad na firemné riziká, finančnú integritu, reputáciu a dôveryhodnosť.',
      reportFeature3Title: 'Transparentné ceny bez prekvapení',
      reportFeature3Desc: 'Naše služby sú ponúkané za fixnú cenu, bez dodatočných alebo skrytých poplatkov.',
      reportIncludesTitle: 'Report obsahuje:',
      reportIncludesFooter: 'Tento 360° spravodajský profil poskytuje kritické poznatky pre strategické rozhodovanie.',
      quoteText: 'Šťastie je, keď sa príprava stretne s príležitosťou.',
      quoteAuthor: 'Seneca',
      stepsTitle: 'Spustite svoje dôverné firemné vyšetrovanie v 3 jednoduchých krokoch',
      step1Title: 'Vyplňte online formulár',
      step1Desc: 'Vyplňte náš online formulár s informáciami o cieľovej spoločnosti alebo obchodnom partnerovi.',
      step1AfterSubmitting: 'Po odoslaní:',
      step1A: 'Vytvoríme bezpečný a súkromný komunikačný kanál.',
      step1B: 'Podrobne vysvetlíme celý proces due diligence.',
      step1C: 'Poskytneme presnú cenovú ponuku na základe rozsahu a zložitosti.',
      step2Title: 'Vykonajte bezpečnú platbu',
      step2Desc: 'Dokončite objednávku prostredníctvom našej bezpečnej platobnej brány.',
      step2CreditCards: 'Hlavné kreditné karty',
      step2BankTransfers: 'Bankové prevody',
      step2Crypto: 'Kryptomeny',
      step2TransparentPricing: 'Transparentné fixné ceny bez skrytých poplatkov.',
      step3Title: 'Dostanete svoj report',
      step3Desc: 'Naši analytici okamžite začnú vyšetrovanie. Dostanete komplexný PDF report e-mailom do 30 dní.',
      step3ReportIncludes: 'Report obsahuje:',
      whyChooseTitle: 'Prečo si vybrať ScamNemesis pre pokročilú business intelligence?',
      whyChooseDesc: 'Naša vyšetrovacia jednotka kombinuje expertov so skúsenosťami vo vojenskej spravodajskej službe a Big 4 firemných vyšetrovaniach.',
      certificationsLabel: 'Náš tím má elitné certifikácie:',
      testimonialTitle: 'Komplexný Due Diligence Report',
      testimonialSubtitle: 'Chráňte svoje obchodné záujmy.',
      testimonialDesc: 'Objednajte si ešte dnes svoj Due Diligence report.',
      testimonialQuote: 'Zaplatil som 5 000 € za analýzu a ušetril 1,5 milióna € na zlej investícii.',
      testimonialAuthor: 'Jeden z našich spokojných klientov',
      testimonialFooter: 'Toto dokonale ilustruje hodnotu našej služby.',
      ctaTitle: 'Chráňte svoje podnikanie ešte dnes',
      ctaDesc: 'Urobte ďalší strategický krok s istotou.',
      ctaConfidential: 'Dôverné a bezpečné',
      ctaNoHiddenFees: 'Žiadne skryté poplatky',
      ctaExpertAnalysis: 'Expertná analýza',
      useCases: [
        { title: 'Hodnotenie strategických partnerstiev a spoločných podnikov', description: 'Pred vynaložením kapitálu a zdrojov je nevyhnutné overiť prevádzkovú, finančnú a reputačnú integritu potenciálneho partnera.', icon: Users },
        { title: 'Onboarding kľúčových dodávateľov a predajcov', description: 'Odolný a etický dodávateľský reťazec je kritickým obchodným aktívom.', icon: Building },
        { title: 'Pred-investičný a M&A screening', description: 'Pre private equity firmy poskytuje naša služba základnú vrstvu predbežnej integritnej a reputačnej due diligence.', icon: TrendingUp },
        { title: 'Preverovanie vysoko hodnotných klientov (KYB Compliance)', description: 'Chráňte svoju firmu pred finančnou kriminalitou a splňte prísne regulačné požiadavky.', icon: UserCheck },
      ],
      pillars: [
        { number: '1', title: 'Firemná identita a právna architektúra', description: 'Analyzujeme právnu štruktúru subjektu do najmenších detailov.', icon: Building },
        { number: '2', title: 'Finančná integrita a reputačné riziká', description: 'Mapujeme finančné zdravie a reputačný profil cieľa.', icon: Scale },
        { number: '3', title: 'Digitálna stopa a mapovanie aktív', description: 'Pomocou pokročilých OSINT nástrojov sledujeme online prítomnosť subjektu.', icon: Globe },
        { number: '4', title: 'Ľudský faktor a screening vedenia', description: 'Za každou spoločnosťou stoja ľudia — a práve tu vzniká väčšina rizík.', icon: Fingerprint },
      ],
      deliverables: [
        'Overenie firemnej identity a právneho statusu',
        'Analýza vlastníckej a riadiacej štruktúry vrátane konečných užívateľov výhod (UBOs)',
        'Hodnotenie finančnej integrity a solventnosti',
        'Reputačné a rizikové hodnotenie vášho obchodného partnera alebo investície',
        'Audit digitálnej stopy a online aktív',
      ],
      whyChoose: [
        { title: 'Spravodajská expertíza', description: 'Naša vyšetrovacia jednotka kombinuje expertov so skúsenosťami vo vojenskej spravodajskej službe.', icon: Award },
        { title: 'Certifikovaní špecialisti', description: 'Každé vyšetrovanie vykonávajú certifikovaní špecialisti s kvalifikáciami ako CFE®, CAMS®, CISA®, CISM®, OSCP®.', icon: BadgeCheck },
        { title: 'Pokročilé OSINT techniky', description: 'Využívame pokročilé Open-Source Intelligence (OSINT) a digitálne analytické techniky.', icon: Database },
        { title: 'Transparentné fixné ceny', description: 'Naša služba je transparentná a bez skrytých poplatkov.', icon: DollarSign },
      ],
      certifications: [
        { name: 'CFE', full: 'Certifikovaný vyšetrovateľ podvodov' },
        { name: 'CAMS', full: 'Certifikovaný špecialista na boj proti praniu špinavých peňazí' },
        { name: 'CISA', full: 'Certifikovaný audítor informačných systémov' },
        { name: 'CISM', full: 'Certifikovaný manažér informačnej bezpečnosti' },
        { name: 'OSCP', full: 'Offensive Security Certified Professional' },
      ],
    },
    cs: {
      badge: 'Profesionální Due Diligence služby',
      heroTitle: 'Investigativní Due Diligence & Prověřování obchodních partnerů',
      heroSubtitleStrong: 'Minimalizujte riziko před spoluprací:',
      heroSubtitle: 'Ověřte integritu vašeho dalšího obchodního partnera, dodavatele nebo investice',
      orderService: 'Objednat službu',
      learnMore: 'Více informací',
      intro1: 'V dnešní propojené globální ekonomice představuje každý nový obchodní vztah příležitost i riziko. Neidentifikované závazky, reputační problémy nebo nekompatibilní praktiky mohou vést k finančním ztrátám a právním rizikům.',
      intro2: 'ScamNemesis poskytuje komplexní, odborně vedenou investigativní due diligence, která vám přináší kritické informace potřebné k sebevědomému strategickému rozhodování.',
      confidentialityTitle: 'Garantovaná důvěrnost a diskrétnost',
      confidentialityDesc: 'Chráníme vaše soukromí. Všechny informace jsou důvěrné a anonymní. Nikdy je nesdílíme bez vašeho souhlasu.',
      useCasesTitle: 'Investigativní Due Diligence pro obchodní partnery',
      useCasesSubtitle: 'Kdy je profesionální Due Diligence nezbytná?',
      useCasesDesc: 'Naše důvěrné vyšetřovací služby jsou navrženy pro obchodní scénáře s vysokými sázkami.',
      processTitle: 'Náš vyšetřovací proces: Elitní Due Diligence na 4 operačních úrovních',
      processDesc: 'Každé vyšetřování je realizováno jako přesná operace — kombinující metodologii zpravodajských služeb s analytickou disciplínou špičkových vyšetřovatelů.',
      whatYouGetBadge: 'Co získáte',
      reportTitle: 'Due Diligence Report',
      reportDesc: 'Naše vyšetřovací jednotka spojuje experty se zkušenostmi z Big 4 firem, vojenského zpravodajství a mezinárodních bezpečnostních agentur.',
      reportFeature1Title: 'Komplexní a praktický report',
      reportFeature1Desc: 'Výsledkem je podrobný PDF report, doručený do 30 dnů.',
      reportFeature2Title: '360° zpravodajský profil',
      reportFeature2Desc: 'Kompletní pohled na firemní rizika a důvěryhodnost.',
      reportFeature3Title: 'Transparentní ceny bez překvapení',
      reportFeature3Desc: 'Naše služby jsou nabízeny za fixní cenu, bez dodatečných poplatků.',
      reportIncludesTitle: 'Report obsahuje:',
      reportIncludesFooter: 'Tento profil poskytuje kritické poznatky pro strategické rozhodování.',
      quoteText: 'Štěstí je, když se příprava setká s příležitostí.',
      quoteAuthor: 'Seneca',
      stepsTitle: 'Spusťte své vyšetřování ve 3 jednoduchých krocích',
      step1Title: 'Vyplňte online formulář',
      step1Desc: 'Vyplňte formulář s informacemi o cílové společnosti.',
      step1AfterSubmitting: 'Po odeslání:',
      step1A: 'Vytvoříme bezpečný komunikační kanál.',
      step1B: 'Vysvětlíme celý proces due diligence.',
      step1C: 'Poskytneme přesnou cenovou nabídku.',
      step2Title: 'Proveďte bezpečnou platbu',
      step2Desc: 'Dokončete objednávku přes naši platební bránu.',
      step2CreditCards: 'Hlavní kreditní karty',
      step2BankTransfers: 'Bankovní převody',
      step2Crypto: 'Kryptoměny',
      step2TransparentPricing: 'Transparentní ceny bez skrytých poplatků.',
      step3Title: 'Obdržíte svůj report',
      step3Desc: 'Obdržíte komplexní PDF report e-mailem do 30 dnů.',
      step3ReportIncludes: 'Report obsahuje:',
      whyChooseTitle: 'Proč si vybrat ScamNemesis?',
      whyChooseDesc: 'Naše jednotka kombinuje experty se zkušenostmi ve zpravodajství a Big 4 firemních vyšetřováních.',
      certificationsLabel: 'Náš tým má elitní certifikace:',
      testimonialTitle: 'Komplexní Due Diligence Report',
      testimonialSubtitle: 'Chraňte své obchodní zájmy.',
      testimonialDesc: 'Objednejte si ještě dnes svůj report.',
      testimonialQuote: 'Zaplatil jsem 5 000 € a ušetřil 1,5 milionu €.',
      testimonialAuthor: 'Jeden z našich spokojených klientů',
      testimonialFooter: 'Toto ilustruje hodnotu naší služby.',
      ctaTitle: 'Chraňte své podnikání ještě dnes',
      ctaDesc: 'Udělejte další strategický krok s jistotou.',
      ctaConfidential: 'Důvěrné a bezpečné',
      ctaNoHiddenFees: 'Žádné skryté poplatky',
      ctaExpertAnalysis: 'Expertní analýza',
      useCases: [
        { title: 'Hodnocení strategických partnerství a společných podniků', description: 'Před vynaložením kapitálu a zdrojů je nezbytné ověřit integritu potenciálního partnera.', icon: Users },
        { title: 'Onboarding klíčových dodavatelů a prodejců', description: 'Odolný a etický dodavatelský řetězec je kritickým obchodním aktivem.', icon: Building },
        { title: 'Před-investiční a M&A screening', description: 'Pro private equity firmy poskytuje naše služba základní vrstvu due diligence.', icon: TrendingUp },
        { title: 'Prověřování vysoce hodnotných klientů (KYB Compliance)', description: 'Chraňte svou firmu před finanční kriminalitou.', icon: UserCheck },
      ],
      pillars: [
        { number: '1', title: 'Firemní identita a právní architektura', description: 'Analyzujeme právní strukturu subjektu do nejmenších detailů.', icon: Building },
        { number: '2', title: 'Finanční integrita a reputační rizika', description: 'Mapujeme finanční zdraví a reputační profil cíle.', icon: Scale },
        { number: '3', title: 'Digitální stopa a mapování aktiv', description: 'Pomocí pokročilých OSINT nástrojů sledujeme online přítomnost subjektu.', icon: Globe },
        { number: '4', title: 'Lidský faktor a screening vedení', description: 'Za každou společností stojí lidé — a právě zde vzniká většina rizik.', icon: Fingerprint },
      ],
      deliverables: [
        'Ověření firemní identity a právního statusu',
        'Analýza vlastnické struktury včetně UBOs',
        'Hodnocení finanční integrity a solventnosti',
        'Reputační a rizikové hodnocení',
        'Audit digitální stopy a online aktiv',
      ],
      whyChoose: [
        { title: 'Zpravodajská expertíza', description: 'Experty se zkušenostmi ve vojenské zpravodajské službě.', icon: Award },
        { title: 'Certifikovaní specialisté', description: 'Specialisté s kvalifikacemi CFE®, CAMS®, CISA®, CISM®, OSCP®.', icon: BadgeCheck },
        { title: 'Pokročilé OSINT techniky', description: 'Využíváme pokročilé OSINT a digitální analytické techniky.', icon: Database },
        { title: 'Transparentní fixní ceny', description: 'Služba je transparentní a bez skrytých poplatků.', icon: DollarSign },
      ],
      certifications: [
        { name: 'CFE', full: 'Certifikovaný vyšetřovatel podvodů' },
        { name: 'CAMS', full: 'Certifikovaný specialista na boj proti praní špinavých peněz' },
        { name: 'CISA', full: 'Certifikovaný auditor informačních systémů' },
        { name: 'CISM', full: 'Certifikovaný manažer informační bezpečnosti' },
        { name: 'OSCP', full: 'Offensive Security Certified Professional' },
      ],
    },
  };
  return t[locale] || t.en;
};

export default function VerifyServiceProductPage() {
  const params = useParams();
  const pageLocale = (params?.locale as Locale) || 'en';
  const t = getPageTranslations(pageLocale);

  return (
    <>
      {/* JSON-LD Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />

      <div className="flex flex-col">
      {/* Hero Section - Premium Design */}
      <section className="relative w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0E74FF]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E74FF]/20 backdrop-blur-sm border border-[#0E74FF]/30 mb-8 hover:bg-[#0E74FF]/30 transition-colors duration-300">
              <Shield className="h-4 w-4 text-[#0E74FF]" />
              <span className="text-sm font-semibold text-[#0E74FF]">{t.badge}</span>
            </div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white">{t.heroSubtitleStrong}</strong> {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 hover:scale-105 transition-all duration-300" asChild>
                <Link href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
                  {t.orderService}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-slate-500 text-white hover:bg-white/10 hover:border-white px-8 py-6 text-lg backdrop-blur-sm hover:scale-105 transition-all duration-300" asChild>
                <Link href="#process">
                  {t.learnMore}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 text-center">
              <p className="text-lg md:text-xl text-[#64748b] leading-relaxed">
                {t.intro1}
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <p className="text-lg md:text-xl text-[#1e293b] leading-relaxed font-semibold">
                {t.intro2}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Confidentiality Banner */}
      <section className="w-full py-12 md:py-16 bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-white text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                <Lock className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl md:text-2xl">{t.confidentialityTitle}</p>
                <p className="text-white/95 text-base md:text-lg leading-relaxed">{t.confidentialityDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When is Due Diligence Essential - Use Cases */}
      <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 mb-8 shadow-lg border border-[#0E74FF]/20">
                <Briefcase className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6 leading-tight">
                {t.useCasesTitle}
              </h2>
              <p className="text-xl md:text-2xl text-[#64748b] max-w-3xl mx-auto mb-4 font-medium">
                {t.useCasesSubtitle}
              </p>
              <p className="text-base md:text-lg text-[#64748b] max-w-3xl mx-auto leading-relaxed">
                {t.useCasesDesc}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
              {t.useCases.map((useCase) => {
                const Icon = useCase.icon;
                return (
                  <div key={useCase.title} className="group">
                    <div className="flex items-start gap-5 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1e293b] leading-tight pt-3 group-hover:text-[#0E74FF] transition-colors duration-300">
                        {useCase.title}
                      </h3>
                    </div>
                    <p className="text-[#64748b] leading-relaxed text-base pl-[76px]">
                      {useCase.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Investigation Process - Four Pillars */}
      <section id="process" className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 mb-8 shadow-lg border border-[#0E74FF]/20">
                <Eye className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6 leading-tight">
                {t.processTitle}
              </h2>
              <p className="text-base md:text-lg text-[#64748b] max-w-4xl mx-auto leading-relaxed">
                {t.processDesc}
              </p>
            </div>

            <div className="space-y-8">
              {t.pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const isEven = index % 2 === 0;
                return (
                  <Card key={pillar.number} className="overflow-hidden border border-slate-200 hover:border-[#0E74FF]/30 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                      {/* Content Side */}
                      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {pillar.number}
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center group-hover:bg-[#0E74FF]/20 transition-colors duration-300">
                            <Icon className="h-7 w-7 text-[#0E74FF]" />
                          </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 leading-tight">
                          {pillar.title}
                        </h3>
                        <p className="text-lg text-[#64748b] leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>

                      {/* Visual Side */}
                      <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 md:p-12 flex items-center justify-center min-h-[320px]">
                        <div className="relative group-hover:scale-105 transition-transform duration-500">
                          <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center shadow-2xl group-hover:shadow-[#0E74FF]/40 group-hover:rotate-3 transition-all duration-500">
                            <Icon className="h-20 w-20 md:h-24 md:w-24 text-white" />
                          </div>
                          <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-pulse">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Due Diligence Report */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E74FF]/20 backdrop-blur-sm border border-[#0E74FF]/30 mb-8 hover:bg-[#0E74FF]/30 transition-colors duration-300">
                  <FileCheck className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm font-semibold text-[#0E74FF]">{t.whatYouGetBadge}</span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {t.reportTitle}
                </h2>

                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  {t.reportDesc}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <FileText className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2">{t.reportFeature1Title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{t.reportFeature1Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <Target className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2">{t.reportFeature2Title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{t.reportFeature2Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <DollarSign className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2">{t.reportFeature3Title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{t.reportFeature3Desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/10 hover:border-white/20 transition-colors duration-300">
                <h3 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  {t.reportIncludesTitle}
                </h3>
                <ul className="space-y-4">
                  {t.deliverables.map((item, index) => (
                    <li key={index} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-green-500/30 transition-colors duration-300">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <span className="text-slate-300 text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-center text-slate-400 text-sm leading-relaxed">
                    {t.reportIncludesFooter}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-[#f8fafc] to-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl border border-slate-200">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#0E74FF] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl text-white font-serif">&quot;</span>
              </div>
              <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-[#1e293b] italic leading-relaxed text-center">
                {t.quoteText}
              </blockquote>
              <cite className="block mt-8 text-lg md:text-xl font-semibold text-[#0E74FF] not-italic text-center">
                — {t.quoteAuthor}
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 mb-8 shadow-lg border border-[#0E74FF]/20">
                <Target className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-4 leading-tight">
                {t.stepsTitle}
              </h2>
            </div>

            {/* Timeline Container */}
            <div className="relative">
              {/* Horizontal Line - visible on md+ */}
              <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#0E74FF] via-[#0E74FF] to-[#0E74FF]" />

              <div className="grid md:grid-cols-3 gap-12">
                {/* Step 1 */}
                <div className="relative">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative">
                      1
                    </div>
                    <div className="mt-8 text-center">
                      <h3 className="text-xl font-bold text-[#1e293b] mb-4">
                        {t.step1Title}
                      </h3>
                      <p className="text-[#64748b] leading-relaxed mb-6">
                        {t.step1Desc}
                      </p>
                      <div className="bg-[#f8fafc] rounded-2xl p-6 text-left">
                        <p className="font-semibold text-[#1e293b] mb-4 text-sm">{t.step1AfterSubmitting}</p>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0E74FF]/10 flex items-center justify-center flex-shrink-0 text-[#0E74FF] font-bold text-xs">A</span>
                            <span className="text-[#64748b] text-sm leading-relaxed">{t.step1A}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0E74FF]/10 flex items-center justify-center flex-shrink-0 text-[#0E74FF] font-bold text-xs">B</span>
                            <span className="text-[#64748b] text-sm leading-relaxed">{t.step1B}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0E74FF]/10 flex items-center justify-center flex-shrink-0 text-[#0E74FF] font-bold text-xs">C</span>
                            <span className="text-[#64748b] text-sm leading-relaxed">{t.step1C}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative">
                      2
                    </div>
                    <div className="mt-8 text-center">
                      <h3 className="text-xl font-bold text-[#1e293b] mb-4">
                        {t.step2Title}
                      </h3>
                      <p className="text-[#64748b] leading-relaxed mb-6">
                        {t.step2Desc}
                      </p>
                      <div className="bg-[#f8fafc] rounded-2xl p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-[#0E74FF]" />
                            </div>
                            <span className="text-[#1e293b] font-medium">{t.step2CreditCards}</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-[#0E74FF]" />
                            </div>
                            <span className="text-[#1e293b] font-medium">{t.step2BankTransfers}</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                              <Bitcoin className="h-5 w-5 text-[#0E74FF]" />
                            </div>
                            <span className="text-[#1e293b] font-medium">{t.step2Crypto}</span>
                          </div>
                        </div>
                        <p className="text-[#64748b] text-sm mt-4 leading-relaxed">
                          {t.step2TransparentPricing}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative">
                      3
                    </div>
                    <div className="mt-8 text-center">
                      <h3 className="text-xl font-bold text-[#1e293b] mb-4">
                        {t.step3Title}
                      </h3>
                      <p className="text-[#64748b] leading-relaxed mb-6">
                        {t.step3Desc}
                      </p>
                      <div className="bg-[#f8fafc] rounded-2xl p-6 text-left">
                        <p className="font-semibold text-[#1e293b] mb-4 text-sm text-center">{t.step3ReportIncludes}</p>
                        <ul className="space-y-2">
                          {t.deliverables.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-[#64748b] text-sm leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScamNemesis */}
      <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 mb-8 shadow-lg border border-[#0E74FF]/20">
                <ShieldCheck className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6 leading-tight">
                {t.whyChooseTitle}
              </h2>
              <p className="text-base md:text-lg text-[#64748b] max-w-4xl mx-auto leading-relaxed">
                {t.whyChooseDesc}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {t.whyChoose.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="text-center group">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1e293b] mb-4 text-lg leading-tight">{item.title}</h3>
                    <p className="text-[#64748b] leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Certifications */}
            <div className="text-center">
              <p className="text-sm text-[#64748b] mb-6 font-medium">{t.certificationsLabel}</p>
              <div className="flex flex-wrap justify-center gap-4">
                {t.certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="px-6 py-3 bg-white text-[#0E74FF] rounded-xl font-semibold border-2 border-[#0E74FF]/20 hover:border-[#0E74FF] hover:bg-[#0E74FF]/5 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default"
                    title={cert.full}
                  >
                    {cert.name}®
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Value Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-slate-200 shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-500">
              <div className="bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] p-8 md:p-12 lg:p-16 text-white relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>

                <div className="relative z-10">
                  <FileText className="h-12 w-12 mb-8 opacity-90" />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {t.testimonialTitle}
                  </h2>
                  <h3 className="text-xl md:text-2xl mb-8 opacity-95">
                    {t.testimonialSubtitle}
                  </h3>
                  <p className="text-lg leading-relaxed opacity-95 mb-8">
                    {t.testimonialDesc}
                  </p>
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20 shadow-lg">
                    <p className="text-xl md:text-2xl italic leading-relaxed">
                      &quot;{t.testimonialQuote}&quot;
                    </p>
                    <p className="text-sm md:text-base mt-4 opacity-90 font-medium">— {t.testimonialAuthor}</p>
                  </div>
                  <p className="text-base md:text-lg opacity-95 leading-relaxed">
                    {t.testimonialFooter}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#0E74FF]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0E74FF] mb-8 shadow-lg shadow-[#0E74FF]/40 hover:scale-110 transition-transform duration-300">
              <Shield className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {t.ctaTitle}
            </h2>

            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t.ctaDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-8">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-[#0E74FF]/40 hover:shadow-2xl hover:shadow-[#0E74FF]/50 hover:scale-105 transition-all duration-300" asChild>
                <Link href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
                  {t.orderService}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>{t.ctaConfidential}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{t.ctaNoHiddenFees}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>{t.ctaExpertAnalysis}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
