'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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

type Locale = 'en' | 'sk' | 'cs' | 'de';

const getTranslations = (locale: Locale) => {
  const translations = {
    en: {
      badge: 'Professional Due Diligence Services',
      heroTitle: 'Investigative Due Diligence & Business Partner Vetting',
      heroSubtitle: 'Mitigate Risk Before You Engage',
      heroDescription: 'Verify the Integrity of Your Next Business Partner, Supplier, or Investment',
      orderNow: 'Order Service Now',
      learnMore: 'Learn More',
      useCasesTitle: 'When Is This Service Essential?',
      useCases: [
        {
          title: 'Evaluating Strategic Partnerships & Joint Ventures',
          description: 'Before committing capital and resources, it is imperative to verify the operational, financial, and reputational integrity of a potential partner. Our analysis confirms the legitimacy of the entity and its key principals, ensuring you are building your venture on a solid foundation.',
        },
        {
          title: 'Onboarding Key Suppliers & Vendors',
          description: 'A resilient and ethical supply chain is a critical business asset. We vet your key suppliers for financial stability, regulatory compliance, adverse media history, and other red flags that could indicate a risk of disruption or reputational harm.',
        },
        {
          title: 'Pre-Investment & M&A Screening',
          description: 'For private equity firms, venture capitalists, and corporate development teams, our service provides an essential layer of preliminary integrity and reputational due diligence. We identify critical red flags that may be missed in traditional financial audits.',
        },
        {
          title: 'Vetting High-Value Clients (KYB Compliance)',
          description: 'Protect your firm from financial crime and meet stringent regulatory requirements. Our Know Your Business (KYB) verification process confirms the identity and legitimacy of new corporate clients.',
        },
      ],
      pillarsTitle: 'Our Four Pillars of Investigation',
      pillars: [
        {
          number: '1',
          title: 'Corporate Identity & Legal Architecture',
          description: 'We dissect the legal structure of the entity down to the finest detail. Our team verifies its legal existence, ownership structure, and regulatory status across international business registries.',
        },
        {
          number: '2',
          title: 'Financial Integrity & Reputational Risks',
          description: 'We map the financial health and reputational profile of the target. Our analysts examine public records, court filings, data leaks, and deep-sourced media to uncover potential risks.',
        },
        {
          number: '3',
          title: 'Digital Footprint & Asset Mapping',
          description: 'Using advanced OSINT and cyber intelligence tools, we trace the entity\'s online presence, domain history, digital assets, and technical infrastructure.',
        },
        {
          number: '4',
          title: 'Human Factor & Leadership Screening',
          description: 'Behind every company stand people. We conduct thorough background investigations into the careers, reputations, and potential conflicts of interest of key individuals.',
        },
      ],
      whatYouGet: 'What You Get',
      reportTitle: 'Due Diligence Report',
      reportDescription: 'Comprehensive and Practical Report',
      reportDetails: 'You will receive a comprehensive PDF report via email within 30 days. The report is a 360° intelligence profile tailored for decision-makers.',
      reportIncludes: 'Report Includes:',
      deliverables: [
        'Verification of corporate identity and legal status',
        'Analysis of ownership and management structure, including UBOs',
        'Assessment of financial integrity and solvency',
        'Reputation and risk evaluation',
        'Audit of digital footprint and online assets',
      ],
      transparentPricing: 'Transparent Pricing',
      noSurprises: 'No hidden fees. Fixed price for complete investigation.',
      processTitle: 'Simple 3-Step Process',
      steps: [
        { title: 'Complete the Online Form', description: 'Provide basic information about the entity you want to investigate.' },
        { title: 'Make a Secure Payment', description: 'Pay securely online. We accept all major payment methods.' },
        { title: 'Receive Your Report', description: 'Get your comprehensive due diligence report within 30 days.' },
      ],
      whyChooseTitle: 'Why Choose ScamNemesis?',
      whyChoose: [
        { title: 'Intelligence-Grade Expertise', description: 'Our team combines military intelligence, OSINT operations, and Big 4 corporate investigations experience.' },
        { title: 'Certified Specialists', description: 'CFE®, CAMS®, CISA®, CISM®, OSCP® certified professionals conduct every investigation.' },
        { title: 'Advanced OSINT Techniques', description: 'We employ cutting-edge Open-Source Intelligence integrating hundreds of global databases.' },
        { title: 'Transparent Fixed Pricing', description: 'No hidden fees. All data handled according to strict confidentiality standards.' },
      ],
      ctaTitle: 'Protect Your Business Today',
      ctaDescription: 'Take your next strategic step with confidence. Order your due diligence report now.',
      ctaButton: 'Order Due Diligence Report',
    },
    sk: {
      badge: 'Profesionálne Due Diligence Služby',
      heroTitle: 'Investigatívna Due Diligence & Preverovanie Obchodných Partnerov',
      heroSubtitle: 'Minimalizujte Riziko Pred Vstupom do Obchodu',
      heroDescription: 'Overte Integritu Vášho Budúceho Obchodného Partnera, Dodávateľa alebo Investície',
      orderNow: 'Objednať Službu',
      learnMore: 'Dozvedieť Sa Viac',
      useCasesTitle: 'Kedy Je Táto Služba Nevyhnutná?',
      useCases: [
        {
          title: 'Hodnotenie Strategických Partnerstiev & Joint Ventures',
          description: 'Pred investovaním kapitálu a zdrojov je nevyhnutné overiť prevádzkovú, finančnú a reputačnú integritu potenciálneho partnera. Naša analýza potvrdzuje legitimitu subjektu.',
        },
        {
          title: 'Onboarding Kľúčových Dodávateľov',
          description: 'Odolný a etický dodávateľský reťazec je kritickým obchodným aktívom. Preverujeme vašich dodávateľov na finančnú stabilitu, regulačnú zhodu a ďalšie varovné signály.',
        },
        {
          title: 'Pre-investičný & M&A Screening',
          description: 'Pre private equity firmy a venture kapitál poskytujeme vrstvu predbežnej integrity a reputačnej due diligence. Identifikujeme kritické varovné signály.',
        },
        {
          title: 'Preverovanie Klientov (KYB Compliance)',
          description: 'Chráňte svoju firmu pred finančnou kriminalitou. Náš KYB proces potvrdzuje identitu a legitimitu nových firemných klientov.',
        },
      ],
      pillarsTitle: 'Štyri Piliere Nášho Vyšetrovania',
      pillars: [
        {
          number: '1',
          title: 'Firemná Identita & Právna Štruktúra',
          description: 'Rozkladáme právnu štruktúru subjektu do najmenších detailov. Overujeme právnu existenciu, vlastnícku štruktúru a regulačný status.',
        },
        {
          number: '2',
          title: 'Finančná Integrita & Reputačné Riziká',
          description: 'Mapujeme finančné zdravie a reputačný profil cieľa. Analyzujeme verejné záznamy, súdne spisy a mediálne zdroje.',
        },
        {
          number: '3',
          title: 'Digitálna Stopa & Mapovanie Aktív',
          description: 'Pomocou pokročilých OSINT nástrojov sledujeme online prítomnosť, históriu domén a digitálne aktíva.',
        },
        {
          number: '4',
          title: 'Ľudský Faktor & Screening Vedenia',
          description: 'Za každou spoločnosťou stoja ľudia. Vykonávame dôkladné preverovanie kariér, reputácie a konfliktov záujmov.',
        },
      ],
      whatYouGet: 'Čo Získate',
      reportTitle: 'Due Diligence Správa',
      reportDescription: 'Komplexná a Praktická Správa',
      reportDetails: 'Dostanete komplexnú PDF správu e-mailom do 30 dní. Správa je 360° spravodajský profil prispôsobený pre rozhodovateľov.',
      reportIncludes: 'Správa Obsahuje:',
      deliverables: [
        'Overenie firemnej identity a právneho statusu',
        'Analýza vlastníckej a riadiacej štruktúry vrátane UBO',
        'Hodnotenie finančnej integrity a solventnosti',
        'Reputačná a riziková analýza',
        'Audit digitálnej stopy a online aktív',
      ],
      transparentPricing: 'Transparentná Cenová Politika',
      noSurprises: 'Žiadne skryté poplatky. Pevná cena za kompletné vyšetrovanie.',
      processTitle: 'Jednoduchý 3-Krokový Proces',
      steps: [
        { title: 'Vyplňte Online Formulár', description: 'Poskytnite základné informácie o subjekte, ktorý chcete prešetriť.' },
        { title: 'Bezpečne Zaplaťte', description: 'Zaplaťte bezpečne online. Akceptujeme všetky bežné platobné metódy.' },
        { title: 'Dostanete Správu', description: 'Získajte komplexnú due diligence správu do 30 dní.' },
      ],
      whyChooseTitle: 'Prečo Si Vybrať ScamNemesis?',
      whyChoose: [
        { title: 'Spravodajská Expertíza', description: 'Náš tím kombinuje skúsenosti z vojenskej spravodajskej služby, OSINT operácií a korporátnych vyšetrovaní.' },
        { title: 'Certifikovaní Špecialisti', description: 'CFE®, CAMS®, CISA®, CISM®, OSCP® certifikovaní profesionáli vedú každé vyšetrovanie.' },
        { title: 'Pokročilé OSINT Techniky', description: 'Používame najmodernejšie Open-Source Intelligence integrujúce stovky globálnych databáz.' },
        { title: 'Transparentné Ceny', description: 'Žiadne skryté poplatky. Všetky údaje sú spracované podľa prísnych štandardov dôvernosti.' },
      ],
      ctaTitle: 'Chráňte Svoj Biznis Ešte Dnes',
      ctaDescription: 'Urobte ďalší strategický krok s istotou. Objednajte si due diligence správu teraz.',
      ctaButton: 'Objednať Due Diligence Správu',
    },
    cs: {
      badge: 'Profesionální Due Diligence Služby',
      heroTitle: 'Investigativní Due Diligence & Prověřování Obchodních Partnerů',
      heroSubtitle: 'Minimalizujte Riziko Před Vstupem do Obchodu',
      heroDescription: 'Ověřte Integritu Vašeho Budoucího Obchodního Partnera, Dodavatele nebo Investice',
      orderNow: 'Objednat Službu',
      learnMore: 'Zjistit Více',
      useCasesTitle: 'Kdy Je Tato Služba Nezbytná?',
      useCases: [
        {
          title: 'Hodnocení Strategických Partnerství & Joint Ventures',
          description: 'Před investováním kapitálu je nezbytné ověřit provozní, finanční a reputační integritu potenciálního partnera.',
        },
        {
          title: 'Onboarding Klíčových Dodavatelů',
          description: 'Odolný a etický dodavatelský řetězec je kritickým obchodním aktivem. Prověřujeme vaše dodavatele.',
        },
        {
          title: 'Pre-investiční & M&A Screening',
          description: 'Pro private equity firmy poskytujeme vrstvu předběžné integrity a reputační due diligence.',
        },
        {
          title: 'Prověřování Klientů (KYB Compliance)',
          description: 'Chraňte svou firmu před finanční kriminalitou. Náš KYB proces potvrzuje identitu klientů.',
        },
      ],
      pillarsTitle: 'Čtyři Pilíře Našeho Vyšetřování',
      pillars: [
        { number: '1', title: 'Firemní Identita & Právní Struktura', description: 'Rozkládáme právní strukturu subjektu do nejmenších detailů.' },
        { number: '2', title: 'Finanční Integrita & Reputační Rizika', description: 'Mapujeme finanční zdraví a reputační profil cíle.' },
        { number: '3', title: 'Digitální Stopa & Mapování Aktiv', description: 'Pomocí pokročilých OSINT nástrojů sledujeme online přítomnost.' },
        { number: '4', title: 'Lidský Faktor & Screening Vedení', description: 'Za každou společností stojí lidé. Provádíme důkladné prověřování.' },
      ],
      whatYouGet: 'Co Získáte',
      reportTitle: 'Due Diligence Zpráva',
      reportDescription: 'Komplexní a Praktická Zpráva',
      reportDetails: 'Dostanete komplexní PDF zprávu e-mailem do 30 dnů.',
      reportIncludes: 'Zpráva Obsahuje:',
      deliverables: [
        'Ověření firemní identity a právního statusu',
        'Analýza vlastnické struktury včetně UBO',
        'Hodnocení finanční integrity',
        'Reputační a riziková analýza',
        'Audit digitální stopy',
      ],
      transparentPricing: 'Transparentní Ceny',
      noSurprises: 'Žádné skryté poplatky. Pevná cena za kompletní vyšetřování.',
      processTitle: 'Jednoduchý 3-Krokový Proces',
      steps: [
        { title: 'Vyplňte Online Formulář', description: 'Poskytněte základní informace o subjektu.' },
        { title: 'Bezpečně Zaplaťte', description: 'Zaplaťte bezpečně online.' },
        { title: 'Dostanete Zprávu', description: 'Získejte zprávu do 30 dnů.' },
      ],
      whyChooseTitle: 'Proč Si Vybrat ScamNemesis?',
      whyChoose: [
        { title: 'Zpravodajská Expertíza', description: 'Náš tým kombinuje zkušenosti z vojenské zpravodajské služby.' },
        { title: 'Certifikovaní Specialisté', description: 'CFE®, CAMS®, CISA®, CISM®, OSCP® certifikovaní profesionálové.' },
        { title: 'Pokročilé OSINT Techniky', description: 'Používáme nejmodernější Open-Source Intelligence.' },
        { title: 'Transparentní Ceny', description: 'Žádné skryté poplatky.' },
      ],
      ctaTitle: 'Chraňte Svůj Byznys Ještě Dnes',
      ctaDescription: 'Udělejte další strategický krok s jistotou.',
      ctaButton: 'Objednat Due Diligence Zprávu',
    },
    de: {
      badge: 'Professionelle Due Diligence Dienste',
      heroTitle: 'Investigative Due Diligence & Geschäftspartnerprüfung',
      heroSubtitle: 'Minimieren Sie das Risiko Vor dem Engagement',
      heroDescription: 'Überprüfen Sie die Integrität Ihres Nächsten Geschäftspartners, Lieferanten oder Investments',
      orderNow: 'Service Bestellen',
      learnMore: 'Mehr Erfahren',
      useCasesTitle: 'Wann Ist Dieser Service Unerlässlich?',
      useCases: [
        {
          title: 'Bewertung Strategischer Partnerschaften & Joint Ventures',
          description: 'Vor der Investition von Kapital ist es unerlässlich, die operative, finanzielle und reputationsbezogene Integrität zu überprüfen.',
        },
        {
          title: 'Onboarding von Schlüssellieferanten',
          description: 'Eine widerstandsfähige und ethische Lieferkette ist ein kritisches Geschäftsvermögen.',
        },
        {
          title: 'Pre-Investment & M&A Screening',
          description: 'Für Private-Equity-Firmen bieten wir eine Schicht der vorläufigen Integritäts- und Reputationsprüfung.',
        },
        {
          title: 'Kundenprüfung (KYB Compliance)',
          description: 'Schützen Sie Ihr Unternehmen vor Finanzkriminalität.',
        },
      ],
      pillarsTitle: 'Unsere Vier Säulen der Untersuchung',
      pillars: [
        { number: '1', title: 'Unternehmensidentität & Rechtsstruktur', description: 'Wir analysieren die Rechtsstruktur bis ins kleinste Detail.' },
        { number: '2', title: 'Finanzielle Integrität & Reputationsrisiken', description: 'Wir kartieren die finanzielle Gesundheit und das Reputationsprofil.' },
        { number: '3', title: 'Digitaler Fußabdruck & Asset-Mapping', description: 'Mit fortschrittlichen OSINT-Tools verfolgen wir die Online-Präsenz.' },
        { number: '4', title: 'Menschlicher Faktor & Führungsscreening', description: 'Hinter jedem Unternehmen stehen Menschen.' },
      ],
      whatYouGet: 'Was Sie Bekommen',
      reportTitle: 'Due Diligence Bericht',
      reportDescription: 'Umfassender und Praktischer Bericht',
      reportDetails: 'Sie erhalten einen umfassenden PDF-Bericht per E-Mail innerhalb von 30 Tagen.',
      reportIncludes: 'Bericht Enthält:',
      deliverables: [
        'Überprüfung der Unternehmensidentität',
        'Analyse der Eigentümerstruktur inkl. UBO',
        'Bewertung der finanziellen Integrität',
        'Reputations- und Risikoanalyse',
        'Audit des digitalen Fußabdrucks',
      ],
      transparentPricing: 'Transparente Preisgestaltung',
      noSurprises: 'Keine versteckten Gebühren. Festpreis für komplette Untersuchung.',
      processTitle: 'Einfacher 3-Schritte-Prozess',
      steps: [
        { title: 'Online-Formular Ausfüllen', description: 'Geben Sie grundlegende Informationen über das Unternehmen an.' },
        { title: 'Sicher Bezahlen', description: 'Bezahlen Sie sicher online.' },
        { title: 'Bericht Erhalten', description: 'Erhalten Sie Ihren Bericht innerhalb von 30 Tagen.' },
      ],
      whyChooseTitle: 'Warum ScamNemesis Wählen?',
      whyChoose: [
        { title: 'Nachrichtendienstliche Expertise', description: 'Unser Team kombiniert Erfahrungen aus dem militärischen Nachrichtendienst.' },
        { title: 'Zertifizierte Spezialisten', description: 'CFE®, CAMS®, CISA®, CISM®, OSCP® zertifizierte Fachleute.' },
        { title: 'Fortgeschrittene OSINT-Techniken', description: 'Wir verwenden modernste Open-Source Intelligence.' },
        { title: 'Transparente Preise', description: 'Keine versteckten Gebühren.' },
      ],
      ctaTitle: 'Schützen Sie Ihr Unternehmen Heute',
      ctaDescription: 'Machen Sie Ihren nächsten strategischen Schritt mit Zuversicht.',
      ctaButton: 'Due Diligence Bericht Bestellen',
    },
  };
  return translations[locale] || translations.en;
};

const useCases = [
  {
    title: 'Evaluating Strategic Partnerships & Joint Ventures',
    description: 'Before committing capital and resources, it is imperative to verify the operational, financial, and reputational integrity of a potential partner. Our analysis confirms the legitimacy of the entity and its key principals, ensuring you are building your venture on a solid foundation.',
    icon: Users,
  },
  {
    title: 'Onboarding Key Suppliers & Vendors',
    description: 'A resilient and ethical supply chain is a critical business asset. We vet your key suppliers for financial stability, regulatory compliance, adverse media history, and other red flags that could indicate a risk of disruption or reputational harm. Ensure your supply chain is a source of strength, not a vulnerability.',
    icon: Building,
  },
  {
    title: 'Pre-Investment & M&A Screening',
    description: 'For private equity firms, venture capitalists, and corporate development teams, our service provides an essential layer of preliminary integrity and reputational due diligence. We identify critical red flags—such as undisclosed litigation, connections to sanctioned individuals, or a history of fraud—that may be missed in traditional financial audits, allowing you to proceed with your transaction with greater certainty.',
    icon: TrendingUp,
  },
  {
    title: 'Vetting High-Value Clients (KYB Compliance)',
    description: 'Protect your firm from financial crime and meet stringent regulatory requirements (e.g., AML/CFT). Our Know Your Business (KYB) verification process confirms the identity and legitimacy of new corporate clients, analyzes their ownership structure to identify Ultimate Beneficial Owners (UBOs), and screens for sanctions or criminal history.',
    icon: UserCheck,
  },
];

const investigationPillars = [
  {
    number: '1',
    title: 'Corporate Identity & Legal Architecture',
    description: 'We dissect the legal structure of the entity down to the finest detail. Our team verifies its legal existence, ownership structure, and regulatory status across international business registries — including those not commonly accessible.',
    icon: Building,
    image: '/images/corporate-identity.jpg',
  },
  {
    number: '2',
    title: 'Financial Integrity & Reputational Risks',
    description: 'We map the financial health and reputational profile of the target. Our analysts examine public records, court filings, data leaks, and deep-sourced media to uncover potential financial risks, discrepancies, or red flags.',
    icon: Scale,
    image: '/images/financial-integrity.jpg',
  },
  {
    number: '3',
    title: 'Digital Footprint & Asset Mapping',
    description: 'Using advanced OSINT and cyber intelligence tools, we trace the entity\'s online presence, domain history, digital assets, and technical infrastructure. This enables us to reveal hidden connections, undisclosed assets, or signs of fraudulent activity.',
    icon: Globe,
    image: '/images/digital-footprint.jpg',
  },
  {
    number: '4',
    title: 'Human Factor & Leadership Screening',
    description: 'Behind every company stand people — and this is where most risks originate. We conduct thorough background investigations into the careers, reputations, and potential conflicts of interest of key individuals, including ultimate beneficial owners (UBOs), to identify threats others often miss.',
    icon: Fingerprint,
    image: '/images/leadership-screening.jpg',
  },
];

const certifications = [
  { name: 'CFE', full: 'Certified Fraud Examiner' },
  { name: 'CAMS', full: 'Certified Anti-Money Laundering Specialist' },
  { name: 'CISA', full: 'Certified Information Systems Auditor' },
  { name: 'CISM', full: 'Certified Information Security Manager' },
  { name: 'OSCP', full: 'Offensive Security Certified Professional' },
];

const deliverables = [
  'Verification of corporate identity and legal status',
  'Analysis of ownership and management structure, including Ultimate Beneficial Owners (UBOs)',
  'Assessment of financial integrity and solvency',
  'Reputation and risk evaluation of your business partner or investment',
  'Audit of digital footprint and online assets',
];

const whyChoose = [
  {
    title: 'Intelligence-Grade Expertise',
    description: 'Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations.',
    icon: Award,
  },
  {
    title: 'Certified Specialists',
    description: 'Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®, along with military certifications in intelligence and cybersecurity.',
    icon: BadgeCheck,
  },
  {
    title: 'Advanced OSINT Techniques',
    description: 'We employ advanced Open-Source Intelligence (OSINT) and digital analysis techniques integrating hundreds of global databases, corporate registries, and proprietary sources.',
    icon: Database,
  },
  {
    title: 'Transparent Fixed Pricing',
    description: 'All data is handled according to strict confidentiality and security standards. Our service is transparent and free of hidden fees.',
    icon: DollarSign,
  },
];

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

export default function VerifyServiceProductPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = getTranslations(locale);

  // Create icons array for use cases (for future use when updating remaining sections)
  const _useCaseIcons = [Users, Building, TrendingUp, UserCheck];
  const _pillarIcons = [Building, Scale, Globe, Fingerprint];
  const _whyChooseIcons = [Award, BadgeCheck, Database, DollarSign];

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
              <strong className="text-white">{t.heroSubtitle}:</strong> {t.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 hover:scale-105 transition-all duration-300" asChild>
                <Link href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
                  {t.orderNow}
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
                In today&apos;s interconnected global economy, every new business relationship presents both opportunity and risk. Unidentified liabilities, reputational issues, or non-compliant practices within a partner&apos;s operations can lead to significant financial loss, legal exposure, and brand damage. Standard background checks are no longer sufficient.
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <p className="text-lg md:text-xl text-[#1e293b] leading-relaxed font-semibold">
                ScamNemesis provides comprehensive, expert-led investigative due diligence that delivers the critical intelligence you need to make strategic decisions with confidence. Our rapid, in-depth analysis uncovers the facts behind the figures, ensuring the entities you engage with are legitimate, reliable, and aligned with your standards of integrity.
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
                <p className="font-bold text-xl md:text-2xl">Guaranteed Confidentiality and Discretion</p>
                <p className="text-white/95 text-base md:text-lg leading-relaxed">We protect your privacy. All information is confidential and anonymous. We never share it without your consent.</p>
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
                Investigative Due Diligence for Business Partners
              </h2>
              <p className="text-xl md:text-2xl text-[#64748b] max-w-3xl mx-auto mb-4 font-medium">
                When is Professional Due Diligence Essential?
              </p>
              <p className="text-base md:text-lg text-[#64748b] max-w-3xl mx-auto leading-relaxed">
                Our confidential investigative services are designed for high-stakes business scenarios where thorough vetting is non-negotiable. We provide critical intelligence for:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
              {useCases.map((useCase) => {
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
                Our Investigative Process: Elite Due Diligence Across 4 Operational Layers
              </h2>
              <p className="text-base md:text-lg text-[#64748b] max-w-4xl mx-auto leading-relaxed">
                Every investigation we conduct is executed as a precision operation — combining the methodology of intelligence agencies with the analytical discipline of top-tier investigators. Our approach is built on four powerful pillars and leverages hundreds of global data sources, advanced OSINT techniques, and proprietary databases. The result goes far beyond standard &quot;verification&quot; — it&apos;s a comprehensive intelligence-driven risk analysis.
              </p>
            </div>

            <div className="space-y-8">
              {investigationPillars.map((pillar, index) => {
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
                  <span className="text-sm font-semibold text-[#0E74FF]">What You Get</span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Due Diligence Report
                </h2>

                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Our investigative unit brings together experts with experience in Big 4 consulting firms, military intelligence, and international security agencies. Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, and OSCP®, ensuring the highest level of accuracy, quality, and professional expertise.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <FileText className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2">Comprehensive and Practical Report</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">The result of our work is a detailed, clearly structured PDF report, delivered within 30 days. The document is designed as a practical guide for strategic decision-making.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <Target className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2">360° Intelligence Profile</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Complete view of corporate risks, financial integrity, reputation, and trustworthiness. Our due diligence is a proactive tool for protecting capital, reputation, and business interests.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <DollarSign className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2">Transparent Pricing and No Surprises</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Our services are offered at a fixed price, with no additional or hidden fees. You know exactly what you are getting – no unpleasant surprises.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/10 hover:border-white/20 transition-colors duration-300">
                <h3 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  Report Includes:
                </h3>
                <ul className="space-y-4">
                  {deliverables.map((item, index) => (
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
                    This 360° intelligence profile provides critical insights for strategic decision-making, capital protection, and minimizing legal or financial risks.
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
                Luck is a matter of preparation meeting opportunity.
              </blockquote>
              <cite className="block mt-8 text-lg md:text-xl font-semibold text-[#0E74FF] not-italic text-center">
                — Seneca
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
                Launch Your Confidential Corporate Investigation & Due Diligence in 3 Simple Steps
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
                        Complete the Online Form
                      </h3>
                      <p className="text-[#64748b] leading-relaxed mb-6">
                        Fill out our online form with information about the target company or business partner. The form is quick, minimalistic, and all data is handled with strict confidentiality.
                      </p>
                      <div className="bg-[#f8fafc] rounded-2xl p-6 text-left">
                        <p className="font-semibold text-[#1e293b] mb-4 text-sm">After submitting:</p>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0E74FF]/10 flex items-center justify-center flex-shrink-0 text-[#0E74FF] font-bold text-xs">A</span>
                            <span className="text-[#64748b] text-sm leading-relaxed">We create a secure and private communication channel.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0E74FF]/10 flex items-center justify-center flex-shrink-0 text-[#0E74FF] font-bold text-xs">B</span>
                            <span className="text-[#64748b] text-sm leading-relaxed">We explain the entire due diligence process in detail.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0E74FF]/10 flex items-center justify-center flex-shrink-0 text-[#0E74FF] font-bold text-xs">C</span>
                            <span className="text-[#64748b] text-sm leading-relaxed">We provide an exact quote based on scope and complexity.</span>
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
                        Make a Secure Payment
                      </h3>
                      <p className="text-[#64748b] leading-relaxed mb-6">
                        Finalize your order through our secure payment gateway. We accept multiple payment methods:
                      </p>
                      <div className="bg-[#f8fafc] rounded-2xl p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-[#0E74FF]" />
                            </div>
                            <span className="text-[#1e293b] font-medium">Major credit cards</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-[#0E74FF]" />
                            </div>
                            <span className="text-[#1e293b] font-medium">Bank transfers</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                              <Bitcoin className="h-5 w-5 text-[#0E74FF]" />
                            </div>
                            <span className="text-[#1e293b] font-medium">Cryptocurrencies</span>
                          </div>
                        </div>
                        <p className="text-[#64748b] text-sm mt-4 leading-relaxed">
                          Transparent, fixed pricing with no hidden fees.
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
                        Receive Your Report
                      </h3>
                      <p className="text-[#64748b] leading-relaxed mb-6">
                        Our analysts initiate the investigation immediately. Receive your comprehensive PDF report via email within 30 days.
                      </p>
                      <div className="bg-[#f8fafc] rounded-2xl p-6 text-left">
                        <p className="font-semibold text-[#1e293b] mb-4 text-sm text-center">Report includes:</p>
                        <ul className="space-y-2">
                          {deliverables.map((item, index) => (
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
                Why Choose ScamNemesis for Advanced Business Intelligence?
              </h2>
              <p className="text-base md:text-lg text-[#64748b] max-w-4xl mx-auto leading-relaxed">
                Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations. Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®, along with military certifications in intelligence and cybersecurity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {whyChoose.map((item) => {
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
              <p className="text-sm text-[#64748b] mb-6 font-medium">Our team holds elite certifications:</p>
              <div className="flex flex-wrap justify-center gap-4">
                {certifications.map((cert) => (
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
                    Comprehensive Due Diligence Report
                  </h2>
                  <h3 className="text-xl md:text-2xl mb-8 opacity-95">
                    Protect your business interests.
                  </h3>
                  <p className="text-lg leading-relaxed opacity-95 mb-8">
                    Order your Due Diligence report today. Take your next strategic step with confidence. Our expert analysis provides the clarity you need to avoid working with unsuitable partners and helps you save significant time and money.
                  </p>
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20 shadow-lg">
                    <p className="text-xl md:text-2xl italic leading-relaxed">
                      &quot;I paid $5,000 for the analysis and saved $1.5 million on a bad investment.&quot;
                    </p>
                    <p className="text-sm md:text-base mt-4 opacity-90 font-medium">— One of our satisfied clients</p>
                  </div>
                  <p className="text-base md:text-lg opacity-95 leading-relaxed">
                    This perfectly illustrates the value of our service. Business risk always exists, but with us, you can significantly reduce it.
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
              Protect Your Business Today
            </h2>

            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Take your next strategic step with confidence. Our expert analysis provides the clarity you need to make informed decisions and protect your capital, reputation, and business interests.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-8">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-[#0E74FF]/40 hover:shadow-2xl hover:shadow-[#0E74FF]/50 hover:scale-105 transition-all duration-300" asChild>
                <Link href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Order Service Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Confidential & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Expert Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
