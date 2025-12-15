'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Shield,
  Search,
  FileText,
  Scale,
  Users,
  ArrowRight,
  CheckCircle,
  Download,
  AlertTriangle,
  Brain,
  Fingerprint,
  Building2,
  Clock,
  Mail,
  CreditCard,
  Sparkles,
  Eye,
  Lock,
  Zap,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Script from 'next/script';

type Locale = 'en' | 'sk';

// Translations
const getTranslations = (locale: Locale) => {
  const translations = {
    en: {
      hero: {
        title: 'What to do if you have been scammed?',
        titleHighlight: 'Get quick and effective help',
        description: 'ScamNemesis enables you to respond to fraud quickly and effectively. We are a service that truly helps clients – we conduct intelligence work, gather evidence, and deliver it, which is crucial for success in legal proceedings. At the same time, we provide a basic legal analysis of your case, including an assessment of your options and the likelihood of recovering funds.',
        cta: 'Order Refund Recovery Service',
      },
      value: {
        ourApproach: 'Our Approach',
        approach1: 'Our initial service is transparent and affordable. We thoroughly examine your case, present the investigative techniques we use, and clearly explain your legal options. After the consultation and delivery of the report, you will know exactly whether it is worth pursuing further action.',
        approach2: "With us, you won't find empty promises – services that guarantee a 100% refund, though it may be difficult to hear, are in fact scams. Their approach to clients is highly unethical and non-transparent.",
        whyDifferent: "Why We're Different",
        different1: 'Typical "money recovery" services often only assist with filing fraud reports and send emails on your behalf – they do not perform deep analysis, intelligence work, or legal assessment, and their fees range from $3,000 to $10,000.',
        oneTimeFee: 'one-time fee',
        priceDesc: 'Our analysis costs only €600, and the evidence and report you receive will be a valuable legal asset in any dispute.',
      },
      process: {
        badge: 'Our Process',
        title: 'How does the money recovery process work?',
        steps: [
          {
            title: 'Intelligence Analysis and Fraud Mapping',
            description: 'Our analysts collect all available data – transactions, crypto addresses, IP traces, emails, phone numbers, and identifiers of individuals or companies. This information is processed into a forensic report that clearly shows the structure of the fraud, the entities involved, and the flow of funds.',
          },
          {
            title: 'Forensic Tracking and Evidence Collection',
            description: 'We use advanced blockchain analysis tools and OSINT (open-source intelligence) to trace the movement of your funds. If we identify links to exchanges, service providers, or banks, we prepare legal documentation to approach them with the goal of freezing assets or obtaining data on the perpetrators.',
          },
          {
            title: 'Legal Assessment and Recommendations',
            description: 'Our lawyers prepare a fundamental legal analysis of the case – including the classification of the offense, determination of jurisdiction, and recommendations for further action. The report also includes an evaluation of the likelihood of successfully recovering funds and a proposal of specific steps to be taken (e.g., filing a criminal complaint, a civil lawsuit, or direct communication with financial institutions).',
          },
          {
            title: 'Cooperation with Authorities and Support in Subsequent Stages',
            description: 'Based on the prepared evidence, we provide materials that can be used in criminal proceedings and, if agreed, we can also coordinate communication with the police, prosecutors, or international partners. This ensures that law enforcement authorities have complete and relevant information from the very beginning, which significantly accelerates the investigation.',
          },
        ],
      },
      important: {
        title: 'Important Information – Please Read',
        text1: 'Take a look at an example of how we investigate cases, and you can also view a sample of our report.',
        text2: 'Note: this is only a sample — the scope may vary depending on the type of fraud. However, we place great emphasis on detail and thoroughness in every investigation.',
      },
      sample: {
        title: 'Sample Investigation Report',
        description: 'Here you can download a sample report similar to the one you will receive. However, each report is different and depends on the type of fraud. Our intelligence work is always extensive and detailed.',
        download: 'Download Here',
      },
      access: {
        badge: 'Getting Started',
        title: 'How can I access the money recovery service?',
        step: 'Step',
        steps: [
          {
            title: 'Fill Out the Form',
            description: 'Fill out our form as thoroughly as possible — it helps us gain a clearer understanding of your case.',
            cta: 'Click here',
          },
          {
            title: 'Contact Us & Pay',
            description: 'Contact us using the button on the right. Enter your email and case number, then complete the payment (the fee is €600). Our specialist will start reviewing your case immediately. Step 1 is to report the case to the relevant institutions. We then begin preparing the evidence package and conducting the investigation, followed by Step 3.',
            cta: 'Click here',
          },
          {
            title: 'Investigation Begins',
            description: 'We will contact you with additional questions, inform you about how long the process will take, and ask for any specific supplementary information if needed.',
            cta: null,
          },
        ],
      },
      trust: {
        ssl: '256-bit SSL',
        sslDesc: 'Military-grade encryption',
        privacy: 'Data Privacy',
        privacyDesc: 'GDPR compliant',
        team: 'Expert Team',
        teamDesc: 'Legal & blockchain certified',
        response: '24h Response',
        responseDesc: 'Fast investigation start',
      },
      cta: {
        title: 'Ready to Start Your Investigation?',
        description: "Don't let scammers get away with your money. Our professional team is ready to help you gather evidence and pursue recovery.",
        orderBtn: 'Order Recovery Service',
        contactBtn: 'Contact Us',
        secure: 'Secure & Confidential',
        pricing: '€600 Transparent Pricing',
        responseTime: '24h Response Time',
      },
    },
    sk: {
      hero: {
        title: 'Čo robiť, ak ste boli podvedení?',
        titleHighlight: 'Získajte rýchlu a efektívnu pomoc',
        description: 'ScamNemesis vám umožňuje reagovať na podvod rýchlo a efektívne. Sme služba, ktorá klientom skutočne pomáha – vykonávame spravodajskú prácu, zhromažďujeme dôkazy a dodávame ich, čo je kľúčové pre úspech v súdnom konaní. Zároveň poskytujeme základnú právnu analýzu vášho prípadu vrátane posúdenia vašich možností a pravdepodobnosti vrátenia peňazí.',
        cta: 'Objednať službu vrátenia peňazí',
      },
      value: {
        ourApproach: 'Náš prístup',
        approach1: 'Naša úvodná služba je transparentná a dostupná. Dôkladne preskúmame váš prípad, predstavíme vyšetrovacie techniky, ktoré používame, a jasne vysvetlíme vaše právne možnosti. Po konzultácii a dodaní správy budete presne vedieť, či sa oplatí pokračovať v ďalších krokoch.',
        approach2: 'U nás nenájdete prázdne sľuby – služby, ktoré garantujú 100% vrátenie peňazí, aj keď to môže byť ťažké počuť, sú v skutočnosti podvody. Ich prístup ku klientom je vysoko neetický a netransparentný.',
        whyDifferent: 'Prečo sme iní',
        different1: 'Typické služby na "vymáhanie peňazí" často len pomáhajú s podaním hlásení o podvode a posielajú e-maily vo vašom mene – nevykonávajú hĺbkovú analýzu, spravodajskú prácu ani právne posúdenie, a ich poplatky sa pohybujú od 3 000 do 10 000 dolárov.',
        oneTimeFee: 'jednorazový poplatok',
        priceDesc: 'Naša analýza stojí len 600 €, a dôkazy a správa, ktoré dostanete, budú cenným právnym aktívom v akomkoľvek spore.',
      },
      process: {
        badge: 'Náš proces',
        title: 'Ako funguje proces vymáhania peňazí?',
        steps: [
          {
            title: 'Spravodajská analýza a mapovanie podvodu',
            description: 'Naši analytici zhromažďujú všetky dostupné údaje – transakcie, krypto adresy, IP stopy, e-maily, telefónne čísla a identifikátory jednotlivcov či spoločností. Tieto informácie sú spracované do forenznej správy, ktorá jasne ukazuje štruktúru podvodu, zapojené entity a tok finančných prostriedkov.',
          },
          {
            title: 'Forenzné sledovanie a zhromažďovanie dôkazov',
            description: 'Používame pokročilé nástroje na analýzu blockchainu a OSINT (open-source intelligence) na sledovanie pohybu vašich prostriedkov. Ak identifikujeme prepojenia na burzy, poskytovateľov služieb alebo banky, pripravíme právnu dokumentáciu na ich oslovenie s cieľom zmrazenia aktív alebo získania údajov o páchateľoch.',
          },
          {
            title: 'Právne posúdenie a odporúčania',
            description: 'Naši právnici pripravia základnú právnu analýzu prípadu – vrátane klasifikácie trestného činu, určenia jurisdikcie a odporúčaní pre ďalší postup. Správa obsahuje aj hodnotenie pravdepodobnosti úspešného vymoženia prostriedkov a návrh konkrétnych krokov (napr. podanie trestného oznámenia, občianskoprávna žaloba alebo priama komunikácia s finančnými inštitúciami).',
          },
          {
            title: 'Spolupráca s orgánmi a podpora v ďalších fázach',
            description: 'Na základe pripravených dôkazov poskytujeme materiály, ktoré môžu byť použité v trestnom konaní, a ak sa dohodneme, môžeme tiež koordinovať komunikáciu s políciou, prokurátormi alebo medzinárodnými partnermi. Tým sa zabezpečí, že orgány činné v trestnom konaní majú od samého začiatku úplné a relevantné informácie, čo výrazne urýchľuje vyšetrovanie.',
          },
        ],
      },
      important: {
        title: 'Dôležité informácie – prosím prečítajte',
        text1: 'Pozrite si príklad toho, ako vyšetrujeme prípady, a môžete si tiež pozrieť ukážku našej správy.',
        text2: 'Poznámka: toto je len ukážka — rozsah sa môže líšiť v závislosti od typu podvodu. Avšak pri každom vyšetrovaní kladieme veľký dôraz na detaily a dôkladnosť.',
      },
      sample: {
        title: 'Ukážková vyšetrovacia správa',
        description: 'Tu si môžete stiahnuť ukážkovú správu podobnú tej, ktorú dostanete. Každá správa je však iná a závisí od typu podvodu. Naša spravodajská práca je vždy rozsiahla a detailná.',
        download: 'Stiahnuť tu',
      },
      access: {
        badge: 'Začíname',
        title: 'Ako môžem získať prístup k službe vymáhania peňazí?',
        step: 'Krok',
        steps: [
          {
            title: 'Vyplňte formulár',
            description: 'Vyplňte náš formulár čo najpodrobnejšie — pomôže nám to lepšie pochopiť váš prípad.',
            cta: 'Kliknite sem',
          },
          {
            title: 'Kontaktujte nás a zaplaťte',
            description: 'Kontaktujte nás pomocou tlačidla vpravo. Zadajte svoj e-mail a číslo prípadu a potom dokončite platbu (poplatok je 600 €). Náš špecialista okamžite začne skúmať váš prípad. Krok 1 je nahlásenie prípadu príslušným inštitúciám. Potom začneme pripravovať balík dôkazov a viesť vyšetrovanie, nasledované krokom 3.',
            cta: 'Kliknite sem',
          },
          {
            title: 'Vyšetrovanie začína',
            description: 'Budeme vás kontaktovať s ďalšími otázkami, informujeme vás o tom, ako dlho bude proces trvať, a požiadame o akékoľvek konkrétne doplňujúce informácie, ak budú potrebné.',
            cta: null,
          },
        ],
      },
      trust: {
        ssl: '256-bit SSL',
        sslDesc: 'Šifrovanie vojenskej úrovne',
        privacy: 'Ochrana dát',
        privacyDesc: 'V súlade s GDPR',
        team: 'Expertný tím',
        teamDesc: 'Právne a blockchain certifikovaní',
        response: 'Odpoveď do 24h',
        responseDesc: 'Rýchly začiatok vyšetrovania',
      },
      cta: {
        title: 'Pripravení začať vaše vyšetrovanie?',
        description: 'Nenechajte podvodníkov uniknúť s vašimi peniazmi. Náš profesionálny tím je pripravený pomôcť vám zhromaždiť dôkazy a usilovať sa o vrátenie peňazí.',
        orderBtn: 'Objednať službu vymáhania',
        contactBtn: 'Kontaktujte nás',
        secure: 'Bezpečné a dôverné',
        pricing: 'Transparentná cena 600 €',
        responseTime: 'Odpoveď do 24 hodín',
      },
    },
  };
  return translations[locale] || translations.en;
};

// Icons for process steps
const processIcons = [Brain, Fingerprint, Scale, Building2];
const processColors = ['blue', 'purple', 'cyan', 'emerald'] as const;

// JSON-LD Schemas
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Professional Fraud Investigation & Money Recovery Service',
  description: 'Comprehensive fraud investigation combining blockchain analysis, forensic tracking, and legal assessment for crypto scams and investment fraud recovery.',
  serviceType: 'Fraud Investigation and Money Recovery',
  provider: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
  },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Fraud Recovery Services',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Investigation Package',
        description: 'Comprehensive fraud analysis including blockchain analysis, OSINT research, and legal assessment',
        price: '600',
        priceCurrency: 'EUR',
      },
    ],
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Order Professional Money Recovery Investigation',
  description: 'Step-by-step guide to accessing professional fraud investigation and money recovery services',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Fill Out the Form',
      text: 'Fill out our comprehensive intake form with all details about the fraud incident',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Contact Us & Complete Payment',
      text: 'Enter your email and case number, then complete the €600 payment. Our specialist will start reviewing your case immediately.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Investigation Begins',
      text: 'We contact you with additional questions and begin the comprehensive investigation process.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does your money recovery service include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our €600 investigation package includes intelligence analysis, fraud mapping, blockchain forensics, OSINT research, legal assessment with jurisdiction determination, and a comprehensive court-ready evidence package.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is your service different from typical money recovery services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Typical recovery services charge $3,000-$10,000 and often only assist with filing reports. We perform deep analysis, intelligence work, and legal assessment for only €600. We never promise guaranteed refunds – services that do are often scams themselves.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you guarantee money recovery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No legitimate service can guarantee 100% recovery. Services that promise guaranteed refunds are often scams. We provide honest assessment, thorough investigation, and court-ready evidence that significantly improves your chances of recovery.',
      },
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'Professional fraud investigation and money recovery platform for victims of crypto scams and investment fraud.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer support',
  },
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
      name: 'Money Recovery',
      item: 'https://scamnemesis.com/money-recovery',
    },
  ],
};

export default function MoneyRecoveryPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = getTranslations(locale);

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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

      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Premium Dark Gradient */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-5xl mx-auto text-center">
              {/* Icon with glow effect */}
              <div className="relative inline-flex mb-10">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-2xl shadow-blue-500/20">
                  <Shield className="h-14 w-14 md:h-16 md:w-16 text-white" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                {t.hero.title}{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {t.hero.titleHighlight}
                </span>
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-slate-300/90 max-w-4xl mx-auto mb-12 leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-lg px-10 py-7"
                  asChild
                >
                  <Link href={`/${locale}/report/new`}>
                    <Zap className="mr-3 h-6 w-6" />
                    {t.hero.cta}
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="w-full py-20 md:py-28 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Left Column - Our Service */}
                <div className="space-y-8">
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    {t.value.ourApproach}
                  </div>

                  <div className="space-y-6">
                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t.value.approach1}
                    </p>

                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t.value.approach2}
                    </p>
                  </div>
                </div>

                {/* Right Column - Comparison */}
                <div className="space-y-8">
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    {t.value.whyDifferent}
                  </div>

                  <div className="space-y-6">
                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t.value.different1}
                    </p>

                    <Card className="border-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-baseline gap-4 mb-4">
                          <span className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400">€600</span>
                          <span className="text-lg text-slate-600 dark:text-slate-400">{t.value.oneTimeFee}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {t.value.priceDesc}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Does It Work - Section Header */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16 md:mb-24">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  {t.process.badge}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  {t.process.title}
                </h2>
              </div>

              {/* 4-Step Process Cards */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
                {t.process.steps.map((step, index) => {
                  const Icon = processIcons[index];
                  const color = processColors[index];
                  const colorClasses = {
                    blue: {
                      gradient: 'from-blue-500 to-blue-600',
                      shadow: 'shadow-blue-500/25',
                      light: 'from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-900/10',
                      border: 'border-blue-200 dark:border-blue-800/50',
                      number: 'bg-blue-500',
                    },
                    purple: {
                      gradient: 'from-purple-500 to-purple-600',
                      shadow: 'shadow-purple-500/25',
                      light: 'from-purple-50 to-purple-50/50 dark:from-purple-950/20 dark:to-purple-900/10',
                      border: 'border-purple-200 dark:border-purple-800/50',
                      number: 'bg-purple-500',
                    },
                    cyan: {
                      gradient: 'from-cyan-500 to-cyan-600',
                      shadow: 'shadow-cyan-500/25',
                      light: 'from-cyan-50 to-cyan-50/50 dark:from-cyan-950/20 dark:to-cyan-900/10',
                      border: 'border-cyan-200 dark:border-cyan-800/50',
                      number: 'bg-cyan-500',
                    },
                    emerald: {
                      gradient: 'from-emerald-500 to-emerald-600',
                      shadow: 'shadow-emerald-500/25',
                      light: 'from-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:to-emerald-900/10',
                      border: 'border-emerald-200 dark:border-emerald-800/50',
                      number: 'bg-emerald-500',
                    },
                  };
                  const colors = colorClasses[color];

                  return (
                    <Card
                      key={index}
                      className={`group relative overflow-hidden ${colors.border} bg-gradient-to-br ${colors.light} shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                    >
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current/5 to-transparent rounded-bl-full" />

                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-6">
                          {/* Step Number */}
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${colors.number} flex items-center justify-center text-white font-bold text-2xl shadow-lg ${colors.shadow}`}>
                            {index + 1}
                          </div>

                          {/* Icon */}
                          <div className={`p-4 rounded-xl bg-gradient-to-br ${colors.gradient} ${colors.shadow} shadow-lg`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <CardTitle className="text-xl md:text-2xl text-slate-900 dark:text-white leading-tight">
                          {step.title}
                        </CardTitle>

                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Important Information Section */}
        <section className="w-full py-20 md:py-28 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Warning Box */}
              <Card className="relative overflow-hidden border-2 border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />

                <CardContent className="relative z-10 p-8 md:p-12 lg:p-16">
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="flex-shrink-0 p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                      <AlertTriangle className="h-10 w-10 text-white" />
                    </div>

                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-amber-900 dark:text-amber-100">
                        {t.important.title}
                      </h2>

                      <p className="text-lg text-amber-800 dark:text-amber-200 leading-relaxed">
                        {t.important.text1}
                      </p>

                      <p className="text-base text-amber-700 dark:text-amber-300 leading-relaxed">
                        {t.important.text2}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sample Report Download Section */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Premium Download Card */}
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 shadow-2xl shadow-blue-500/25">
                {/* Decorative patterns */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <CardContent className="relative z-10 p-8 md:p-12 lg:p-16">
                  <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
                    {/* PDF Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-110" />
                        <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                          <FileText className="h-20 w-20 md:h-24 md:w-24 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                        {t.sample.title}
                      </h3>

                      <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                        {t.sample.description}
                      </p>

                      <Button
                        size="lg"
                        className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 text-lg px-10 py-7 font-semibold"
                        asChild
                      >
                        <Link href="/pdf/sample-report.pdf" target="_blank">
                          <Download className="mr-3 h-6 w-6" />
                          {t.sample.download}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Access Service Section */}
        <section className="w-full py-20 md:py-28 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16 md:mb-24">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
                  <Eye className="h-4 w-4" />
                  {t.access.badge}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                  {t.access.title}
                </h2>
              </div>

              {/* 3-Step Access Process */}
              <div className="space-y-8 md:space-y-10">
                {t.access.steps.map((step, index) => {
                  const accessIcons = [FileText, CreditCard, Search];
                  const Icon = accessIcons[index];
                  const isLast = index === t.access.steps.length - 1;
                  const stepLinks = [`/${locale}/report/new`, `/${locale}/contact-us`, null];

                  return (
                    <div key={index} className="relative">
                      {/* Connector Line */}
                      {!isLast && (
                        <div className="hidden md:block absolute left-10 top-32 w-1 h-20 bg-gradient-to-b from-blue-300 to-emerald-300 dark:from-blue-700 dark:to-emerald-700" />
                      )}

                      <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardContent className="p-8 md:p-10 lg:p-12">
                          <div className="flex flex-col md:flex-row items-start gap-8">
                            {/* Step Number */}
                            <div className="flex-shrink-0">
                              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg ${
                                index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25' :
                                index === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25' :
                                'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
                              }`}>
                                {index + 1}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${
                                  index === 0 ? 'bg-blue-100 dark:bg-blue-900/30' :
                                  index === 1 ? 'bg-purple-100 dark:bg-purple-900/30' :
                                  'bg-emerald-100 dark:bg-emerald-900/30'
                                }`}>
                                  <Icon className={`h-6 w-6 ${
                                    index === 0 ? 'text-blue-600 dark:text-blue-400' :
                                    index === 1 ? 'text-purple-600 dark:text-purple-400' :
                                    'text-emerald-600 dark:text-emerald-400'
                                  }`} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                                  {t.access.step} {index + 1}
                                </h3>
                              </div>

                              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {step.description}
                              </p>

                              {step.cta && stepLinks[index] && (
                                <Button
                                  size="lg"
                                  className={`${
                                    index === 0 ? 'bg-blue-600 hover:bg-blue-700' :
                                    'bg-purple-600 hover:bg-purple-700'
                                  } text-white shadow-lg transition-all duration-300 hover:scale-105`}
                                  asChild
                                >
                                  <Link href={stepLinks[index]!}>
                                    {step.cta}
                                    <ExternalLink className="ml-2 h-5 w-5" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="w-full py-16 md:py-20 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                {/* Trust Badge 1 */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                    <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{t.trust.ssl}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.trust.sslDesc}</p>
                  </div>
                </div>

                {/* Trust Badge 2 */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{t.trust.privacy}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.trust.privacyDesc}</p>
                  </div>
                </div>

                {/* Trust Badge 3 */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{t.trust.team}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.trust.teamDesc}</p>
                  </div>
                </div>

                {/* Trust Badge 4 */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                    <Clock className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{t.trust.response}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.trust.responseDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative w-full py-20 md:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-5 rounded-2xl shadow-2xl">
                  <FileCheck className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {t.cta.title}
              </h2>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {t.cta.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-lg px-10 py-7"
                  asChild
                >
                  <Link href={`/${locale}/report/new`}>
                    <Zap className="mr-3 h-6 w-6" />
                    {t.cta.orderBtn}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-400 text-white hover:bg-white/10 hover:border-white text-lg px-10 py-7"
                  asChild
                >
                  <Link href={`/${locale}/contact-us`}>
                    <Mail className="mr-3 h-5 w-5" />
                    {t.cta.contactBtn}
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 pt-8 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>{t.cta.secure}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t.cta.pricing}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{t.cta.responseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
