'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Shield,
  Lock,
  Users,
  Database,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  Car,
  Coins,
  CreditCard,
  FileText,
  Scale,
  GraduationCap,
  Briefcase,
  Target,
  FileSearch,
  Network,
  Calendar,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Translation helper type
type Locale = 'en' | 'sk' | 'de' | 'cs';

// Get translations based on locale
const getTranslations = (locale: Locale) => {
  const translations = {
    en: {
      hero: {
        badge: 'Fraud Prevention Platform',
        title1: 'Is It a Scam? Check Any',
        titleHighlight: 'Website, Person, Company, Phone or Email',
        title2: 'Instantly',
        description: 'Check scams instantly 🔎 — verify <strong>people</strong>, <strong>websites</strong>, <strong>companies</strong>, <strong>job offers</strong>, <strong>emails</strong>, <strong>phone numbers</strong>, <strong>dating profiles</strong>, and much more. Enjoy <strong>free real-time protection</strong> 🛡️. Found a scam or got scammed? ⚠️ <strong>Report it now</strong> — your warning could <strong>protect others</strong>. Explore our <strong>security services</strong> 🔐.',
        searchPlaceholder: 'Search by name, email, phone, website, IBAN, crypto wallet...',
        search: 'Search',
        records: '640M+ Records',
        sources: '130+ Sources',
        realtime: 'Real-time Updates',
        free: 'Always Free',
      },
      database: {
        badge: 'Real-time Data',
        title: 'Our Database in Numbers',
        description: 'Real-time access to over 640 million verified fraud records from 130+ trusted global sources including FBI, OFAC, Interpol, and international law enforcement agencies',
        note: '(Some data sources are still being integrated) Updates every 5 minutes',
        categoriesTitle: 'Comprehensive Fraud Database Categories',
        totalCoverage: 'Total Database Coverage',
        totalRecords: 'Total Records',
        dataSources: 'Data Sources',
        categories: 'Categories',
        realtimeAccess: 'Real-time Access',
        updateFreq: 'Update Frequency',
        sourcesFooter: 'Verified data sources include FBI Most Wanted API, OFAC SDN List, Chainabuse, CryptoScamDB, URLhaus, PhishTank, AbuseIPDB, CFPB Consumer Complaints, Companies House UK, Interpol Stolen Motor Vehicles, FTC Do Not Call, Canadian Anti-Fraud Centre, and 120+ additional verified global databases from law enforcement and consumer protection agencies worldwide.',
        maliciousIPs: 'Malicious IP Addresses',
        stolenVehicles: 'Stolen Vehicles Database',
        phishingURLs: 'Verified Phishing URLs',
        dissolvedCompanies: 'Dissolved Companies',
      },
      roadmap: {
        title: "List of Features and Services We're Building",
        description: "For each item we list its status, completion percentage, and a brief note on what it's for.",
        feature: 'Feature',
        status: 'Status',
        complete: 'Complete',
        whatFor: "What it's for",
        functional: 'Functional',
        inDevelopment: 'In development',
        planned: 'Planned',
      },
      services: {
        title: 'Other Services',
        included: 'What the service includes',
        when: 'When this service is suitable',
        recovery: {
          title: 'Fraud Recovery Services',
          description: 'Recovery of funds lost to fraud. We combine digital forensics, OSINT, and legal coordination to trace, freeze, and recover your money—fast, ethically, and defensibly.',
          priceNote: '5 hours of investigator work',
          priceDesc: 'We offer this service in response to companies that charge €3,500–€10,000 and often only report the case to a financial institution. We consider such practices fraudulent and unethical.',
          cta: 'Start Money Recovery',
        },
        dueDiligence: {
          title: 'DUE DILIGENCE SERVICES',
          description: "Independent screening of partners, clients, and investments. We combine OSINT, AML/KYB procedures, and a legal perspective so you can make decisions based on verifiable facts—fast, discreet, and defensible.",
          cta: 'Start Due Diligence',
        },
        investigation: {
          title: 'CORPORATE INVESTIGATIONS',
          description: 'Internal and external investigations for companies. We combine OSINT, digital forensics, and financial analytics with the ScamNemesis platform (evidence management, chain of custody)—discreet, lawful, and defensible.',
          cta: 'Start Investigation',
        },
        training: {
          title: 'SECURITY TRAINING & CONSULTING',
          description: 'Security training and consulting for teams and management. We use real scenarios from ScamNemesis (OSINT, fraud, incident response) to make procedures practical, measurable, and defensible.',
          cta: 'Explore Training & Courses',
        },
      },
      consultation: {
        badge: 'Free Consultation',
        title: 'BOOK A FREE CONSULTATION NOW',
        description: "We would love to learn more about your company's individual needs. That's why we offer a 15-minute consultation call.",
        cta: 'Book a free consultation',
      },
      freeTraining: {
        badge: 'Learn & Protect',
        title: 'Free Security Training & Courses — Learn to Spot Scams',
        description: 'Free, practical lessons and checklists to identify phishing, crypto/investment fraud, fake online shops, and social-media scams. Learn to verify websites, people, and IBANs; protect your identity and credit score; and report cybercrime safely—step by step.',
        topicsTitle: 'Most Popular Topics:',
        cta: 'Start Free Training',
      },
      certifications: {
        description: 'Years of experience and certifications from leading institutions — professionals on your side.',
      },
    },
    sk: {
      hero: {
        badge: 'Platforma na prevenciu podvodov',
        title1: 'Je to podvod? Overte akúkoľvek',
        titleHighlight: 'webstránku, osobu, firmu, telefón alebo e-mail',
        title2: 'okamžite',
        description: 'Overte podvody okamžite 🔎 — skontrolujte <strong>osoby</strong>, <strong>webstránky</strong>, <strong>firmy</strong>, <strong>pracovné ponuky</strong>, <strong>e-maily</strong>, <strong>telefónne čísla</strong>, <strong>zoznamovacie profily</strong> a oveľa viac. Využite <strong>bezplatnú ochranu v reálnom čase</strong> 🛡️. Našli ste podvod alebo vás podviedli? ⚠️ <strong>Nahláste to teraz</strong> — vaše varovanie môže <strong>ochrániť ostatných</strong>. Preskúmajte naše <strong>bezpečnostné služby</strong> 🔐.',
        searchPlaceholder: 'Hľadajte podľa mena, e-mailu, telefónu, webu, IBAN, crypto peňaženky...',
        search: 'Vyhľadať',
        records: '640M+ záznamov',
        sources: '130+ zdrojov',
        realtime: 'Aktualizácie v reálnom čase',
        free: 'Vždy zadarmo',
      },
      database: {
        badge: 'Dáta v reálnom čase',
        title: 'Naša databáza v číslach',
        description: 'Prístup v reálnom čase k viac ako 640 miliónom overených záznamov o podvodoch zo 130+ dôveryhodných globálnych zdrojov vrátane FBI, OFAC, Interpolu a medzinárodných orgánov činných v trestnom konaní',
        note: '(Niektoré zdroje dát sa stále integrujú) Aktualizácie každých 5 minút',
        categoriesTitle: 'Komplexné kategórie databázy podvodov',
        totalCoverage: 'Celkové pokrytie databázy',
        totalRecords: 'Celkový počet záznamov',
        dataSources: 'Zdroje dát',
        categories: 'Kategórie',
        realtimeAccess: 'Prístup v reálnom čase',
        updateFreq: 'Frekvencia aktualizácií',
        sourcesFooter: 'Overené zdroje dát zahŕňajú FBI Most Wanted API, OFAC SDN List, Chainabuse, CryptoScamDB, URLhaus, PhishTank, AbuseIPDB, CFPB Consumer Complaints, Companies House UK, Interpol Stolen Motor Vehicles, FTC Do Not Call, Canadian Anti-Fraud Centre a 120+ ďalších overených globálnych databáz.',
        maliciousIPs: 'Škodlivé IP adresy',
        stolenVehicles: 'Databáza odcudzených vozidiel',
        phishingURLs: 'Overené phishingové URL',
        dissolvedCompanies: 'Zrušené spoločnosti',
      },
      roadmap: {
        title: 'Zoznam funkcií a služieb, ktoré budujeme',
        description: 'Pri každej položke uvádzame jej stav, percento dokončenia a stručnú poznámku, na čo slúži.',
        feature: 'Funkcia',
        status: 'Stav',
        complete: 'Dokončené',
        whatFor: 'Na čo to slúži',
        functional: 'Funkčné',
        inDevelopment: 'Vo vývoji',
        planned: 'Plánované',
      },
      services: {
        title: 'Ďalšie služby',
        included: 'Čo služba zahŕňa',
        when: 'Kedy je táto služba vhodná',
        recovery: {
          title: 'Služby na vymáhanie prostriedkov',
          description: 'Vymáhanie prostriedkov stratených podvodom. Kombinujeme digitálnu forenznú analýzu, OSINT a právnu koordináciu na sledovanie, zmrazenie a vymáhanie vašich peňazí — rýchlo, eticky a obhájiteľne.',
          priceNote: '5 hodín práce vyšetrovateľa',
          priceDesc: 'Túto službu ponúkame ako reakciu na spoločnosti, ktoré účtujú 3 500 – 10 000 € a často len nahlásia prípad finančnej inštitúcii. Takéto praktiky považujeme za podvodné a neetické.',
          cta: 'Začať vymáhanie peňazí',
        },
        dueDiligence: {
          title: 'SLUŽBY DUE DILIGENCE',
          description: 'Nezávislý skríning partnerov, klientov a investícií. Kombinujeme OSINT, AML/KYB postupy a právnu perspektívu, aby ste mohli robiť rozhodnutia na základe overiteľných faktov — rýchlo, diskrétne a obhájiteľne.',
          cta: 'Začať Due Diligence',
        },
        investigation: {
          title: 'FIREMNÉ VYŠETROVANIA',
          description: 'Interné a externé vyšetrovania pre firmy. Kombinujeme OSINT, digitálnu forenznú analýzu a finančnú analytiku s platformou ScamNemesis (správa dôkazov, reťazec úschovy) — diskrétne, zákonné a obhájiteľné.',
          cta: 'Začať vyšetrovanie',
        },
        training: {
          title: 'BEZPEČNOSTNÉ ŠKOLENIA A KONZULTÁCIE',
          description: 'Bezpečnostné školenia a konzultácie pre tímy a manažment. Používame reálne scenáre zo ScamNemesis (OSINT, podvody, reakcia na incidenty), aby boli postupy praktické, merateľné a obhájiteľné.',
          cta: 'Preskúmať školenia a kurzy',
        },
      },
      consultation: {
        badge: 'Bezplatná konzultácia',
        title: 'REZERVUJTE SI BEZPLATNÚ KONZULTÁCIU TERAZ',
        description: 'Radi by sme sa dozvedeli viac o individuálnych potrebách vašej spoločnosti. Preto ponúkame 15-minútový konzultačný hovor.',
        cta: 'Rezervovať bezplatnú konzultáciu',
      },
      freeTraining: {
        badge: 'Učte sa a chráňte sa',
        title: 'Bezplatné bezpečnostné školenia a kurzy — Naučte sa rozpoznať podvody',
        description: 'Bezplatné, praktické lekcie a kontrolné zoznamy na identifikáciu phishingu, crypto/investičných podvodov, falošných internetových obchodov a podvodov na sociálnych sieťach. Naučte sa overovať webové stránky, osoby a IBAN; chrániť svoju identitu a kreditné skóre; a bezpečne nahlasovať kybernetickú kriminalitu — krok za krokom.',
        topicsTitle: 'Najpopulárnejšie témy:',
        cta: 'Začať bezplatné školenie',
      },
      certifications: {
        description: 'Roky skúseností a certifikácie od popredných inštitúcií — profesionáli na vašej strane.',
      },
    },
    de: {
      hero: {
        badge: 'Plattform zur Betrugsprävention',
        title1: 'Ist es Betrug? Überprüfen Sie jede',
        titleHighlight: 'Website, Person, Firma, Telefon oder E-Mail',
        title2: 'sofort',
        description: 'Überprüfen Sie Betrug sofort 🔎 — verifizieren Sie <strong>Personen</strong>, <strong>Websites</strong>, <strong>Unternehmen</strong>, <strong>Stellenangebote</strong>, <strong>E-Mails</strong>, <strong>Telefonnummern</strong>, <strong>Dating-Profile</strong> und vieles mehr. Genießen Sie <strong>kostenlosen Echtzeitschutz</strong> 🛡️. Betrug gefunden oder betrogen worden? ⚠️ <strong>Melden Sie es jetzt</strong> — Ihre Warnung könnte <strong>andere schützen</strong>. Erkunden Sie unsere <strong>Sicherheitsdienste</strong> 🔐.',
        searchPlaceholder: 'Suche nach Name, E-Mail, Telefon, Website, IBAN, Krypto-Wallet...',
        search: 'Suchen',
        records: '640M+ Datensätze',
        sources: '130+ Quellen',
        realtime: 'Echtzeit-Updates',
        free: 'Immer kostenlos',
      },
      database: {
        badge: 'Echtzeitdaten',
        title: 'Unsere Datenbank in Zahlen',
        description: 'Echtzeitzugriff auf über 640 Millionen verifizierte Betrugsdatensätze aus 130+ vertrauenswürdigen globalen Quellen einschließlich FBI, OFAC, Interpol und internationalen Strafverfolgungsbehörden',
        note: '(Einige Datenquellen werden noch integriert) Aktualisierung alle 5 Minuten',
        categoriesTitle: 'Umfassende Betrugs-Datenbankkategorien',
        totalCoverage: 'Gesamte Datenbankabdeckung',
        totalRecords: 'Gesamte Datensätze',
        dataSources: 'Datenquellen',
        categories: 'Kategorien',
        realtimeAccess: 'Echtzeitzugriff',
        updateFreq: 'Aktualisierungsfrequenz',
        sourcesFooter: 'Verifizierte Datenquellen umfassen FBI Most Wanted API, OFAC SDN-Liste, Chainabuse, CryptoScamDB, URLhaus, PhishTank, AbuseIPDB, CFPB Consumer Complaints, Companies House UK, Interpol Stolen Motor Vehicles, FTC Do Not Call, Canadian Anti-Fraud Centre und 120+ weitere verifizierte globale Datenbanken von Strafverfolgungsbehörden und Verbraucherschutzagenturen weltweit.',
        maliciousIPs: 'Bösartige IP-Adressen',
        stolenVehicles: 'Datenbank gestohlener Fahrzeuge',
        phishingURLs: 'Verifizierte Phishing-URLs',
        dissolvedCompanies: 'Aufgelöste Unternehmen',
      },
      roadmap: {
        title: 'Liste der Funktionen und Dienste, die wir entwickeln',
        description: 'Für jeden Punkt listen wir seinen Status, den Fertigstellungsgrad und eine kurze Anmerkung, wofür er dient.',
        feature: 'Funktion',
        status: 'Status',
        complete: 'Abgeschlossen',
        whatFor: 'Wofür es ist',
        functional: 'Funktional',
        inDevelopment: 'In Entwicklung',
        planned: 'Geplant',
      },
      services: {
        title: 'Weitere Dienste',
        included: 'Was der Service beinhaltet',
        when: 'Wann dieser Service geeignet ist',
        recovery: {
          title: 'Betrugs-Wiederherstellungsdienste',
          description: 'Wiederherstellung von durch Betrug verlorenen Geldern. Wir kombinieren digitale Forensik, OSINT und rechtliche Koordination, um Ihr Geld aufzuspüren, einzufrieren und wiederzuerlangen — schnell, ethisch und vertretbar.',
          priceNote: '5 Stunden Ermittlerarbeit',
          priceDesc: 'Wir bieten diesen Service als Reaktion auf Unternehmen an, die 3.500–10.000 € verlangen und oft nur den Fall bei einem Finanzinstitut melden. Wir betrachten solche Praktiken als betrügerisch und unethisch.',
          cta: 'Geldwiederherstellung starten',
        },
        dueDiligence: {
          title: 'DUE-DILIGENCE-DIENSTE',
          description: 'Unabhängige Überprüfung von Partnern, Kunden und Investitionen. Wir kombinieren OSINT, AML/KYB-Verfahren und eine rechtliche Perspektive, damit Sie Entscheidungen auf der Grundlage überprüfbarer Fakten treffen können — schnell, diskret und vertretbar.',
          cta: 'Due Diligence starten',
        },
        investigation: {
          title: 'UNTERNEHMENSERMITTLUNGEN',
          description: 'Interne und externe Ermittlungen für Unternehmen. Wir kombinieren OSINT, digitale Forensik und Finanzanalytik mit der ScamNemesis-Plattform (Beweismanagement, Beweiskette) — diskret, rechtmäßig und vertretbar.',
          cta: 'Ermittlung starten',
        },
        training: {
          title: 'SICHERHEITSSCHULUNGEN & BERATUNG',
          description: 'Sicherheitsschulungen und Beratung für Teams und Management. Wir verwenden reale Szenarien von ScamNemesis (OSINT, Betrug, Incident Response), um Verfahren praktisch, messbar und vertretbar zu gestalten.',
          cta: 'Schulungen & Kurse erkunden',
        },
      },
      consultation: {
        badge: 'Kostenlose Beratung',
        title: 'BUCHEN SIE JETZT EINE KOSTENLOSE BERATUNG',
        description: 'Wir würden gerne mehr über die individuellen Bedürfnisse Ihres Unternehmens erfahren. Deshalb bieten wir ein 15-minütiges Beratungsgespräch an.',
        cta: 'Kostenlose Beratung buchen',
      },
      freeTraining: {
        badge: 'Lernen & Schützen',
        title: 'Kostenloses Sicherheitstraining & Kurse — Lernen Sie, Betrug zu erkennen',
        description: 'Kostenlose, praktische Lektionen und Checklisten zur Identifizierung von Phishing, Krypto-/Investitionsbetrug, gefälschten Online-Shops und Social-Media-Betrug. Lernen Sie, Websites, Personen und IBANs zu verifizieren; Ihre Identität und Kreditwürdigkeit zu schützen; und Cyberkriminalität sicher zu melden — Schritt für Schritt.',
        topicsTitle: 'Beliebteste Themen:',
        cta: 'Kostenloses Training starten',
      },
      certifications: {
        description: 'Jahre der Erfahrung und Zertifizierungen von führenden Institutionen — Fachleute an Ihrer Seite.',
      },
    },
  };
  return translations[locale as keyof typeof translations] || translations.en;
};

// FAQ translations
const getFaqSections = (locale: Locale) => {
  if (locale === 'de') {
    return [
      { id: '1', title: '1. Für wen ist diese Plattform?', content: 'ScamNemesis ist für Menschen, die eine Person, ein Unternehmen, eine Telefonnummer, eine E-Mail oder eine Website überprüfen möchten. Die Liste finden Sie hier. Es ist auch für Menschen, die bereits betrogen wurden und ihren Fall melden und sich mit anderen Opfern desselben Täters verbinden möchten. Die Plattform hilft sowohl alltäglichen Nutzern als auch Fachleuten — Polizei, Journalisten, Anwälten, Analysten, Banken und Börsen.\n\nHeute ist es schwer, einen Betrug von einem legitimen Service zu unterscheiden — jeder kann getäuscht werden. Wenn es Ihnen passiert ist, sind Sie nicht allein; wir sind hier, um zu helfen.', icon: Users, color: 'blue' },
      { id: '2', title: '2. Welches Problem lösen wir?', content: 'Es gibt keine einzelne \"globale\" Zahl, aber Daten zeigen, dass Online-Betrug zwischen 2019 und 2024 um etwa 2.300% gewachsen ist; 2024 erreichten die geschätzten Verluste 1,03 Billionen USD.\n\nScamNemesis bringt Ordnung in dieses Chaos: Es konsolidiert Meldungen und Beweise in einem einzigen koordinierten Fall, verknüpft automatisch Opfer mit ähnlichen Mustern, spart Ermittlern Zeit und beschleunigt Untersuchungen.', icon: AlertTriangle, color: 'amber' },
      { id: '3', title: '3. Wie benutzt man ScamNemesis?', content: 'Suche:\n\nOben finden Sie die Suchleiste, in die Sie einen Namen, eine E-Mail, eine Telefonnummer und andere Identifikatoren eingeben können. Die Ergebnisse werden nach Übereinstimmungswert angezeigt.\n\nMelden:\n\nWenn Sie betrogen wurden, klicken Sie auf Betrug melden. Ein Formular wird geöffnet — die meisten Felder sind optional, aber wir empfehlen, so viele Details wie möglich hinzuzufügen.\n\nÜbereinstimmungen interpretieren:\n\nDenken Sie daran, dass derselbe Name ≠ dieselbe Person ist. Bewerten Sie den Kontext (Land, Betrugsart, Zeit, andere Identifikatoren).', icon: Search, color: 'cyan' },
      { id: '4', title: '4. Warum ist das wichtig?', content: 'Jeder nicht gemeldete Betrug hilft Betrügern, mehr Opfer zu erreichen, verursacht mehr zerstörte Leben und schafft mehr Leid für Opfer und ihre Familien. Wir wollen das stoppen.\n\nWenn Gemeinschaften Daten über Länder hinweg teilen, entstehen Muster. Geteilte Intelligenz durchbricht ihren größten Vorteil — die Isolation. Die Warnung einer Person wird zum Schutz für alle.', icon: Shield, color: 'emerald' },
      { id: '5', title: '5. Warum haben wir dieses Projekt erstellt?', content: 'Das Projekt entstand aus Wut und Frustration über ineffektive Polizeimethoden. Wir selbst wurden Opfer von Betrug, und die Polizei konnte nicht helfen, weil sie überlastet war und die Werkzeuge und das Fachwissen zur Bekämpfung moderner Betrugsarten fehlten.\n\nEs ist Zeit zu handeln, deshalb haben wir beschlossen, unser Wissen über OSINT, Hacking und Nachrichtendienst zu nutzen, um Menschen und Ermittlungsteams bei der Prävention und Aufdeckung von Betrug zu helfen.', icon: Target, color: 'rose' },
      { id: '6', title: '6. Was ist ScamNemesis?', content: 'Eine gemeinschaftsgetriebene Verifizierungs- und Nachrichtenplattform, die eine Datenbank gemeldeter Betrugsfälle, Blockchain-Verfolgung, Überwachung über 130+ Datenquellen, Telefon- und E-Mail-Verifizierung, Gesichtserkennung, Dokumentenforensik (OCR + Metadatenanalyse) und Beziehungsmapping kombiniert.', icon: Database, color: 'indigo' },
      { id: '7', title: '7. Was werden Sie hier finden?', content: 'Ein Suchsystem für mehr als 38 Identifikatoren (z.B. Name, E-Mail, Telefon usw.), das Ihnen hilft festzustellen, ob Sie es mit einem Betrüger zu tun haben, und Ihre Vermögenswerte zu schützen.\n\nBei einer Übereinstimmung erscheint eine Meldung mit allen verfügbaren Details über den Verdächtigen.', icon: FileSearch, color: 'purple' },
      { id: '8', title: '8. Wer steht hinter diesem Projekt?', content: 'Ein internationales Team von Ermittlern und ethischen Hackern aus drei Kontinenten und mehr als fünf Ländern — Experten für Cybersicherheit, Datenanalyse und Fachleute mit Ausbildung und Erfahrung im Nachrichtendiensthandwerk.\n\nUnser Ziel ist es, für immer kostenlos zu bleiben. Wir bauen auf Transparenz, weil Vertrauen verdient werden muss.', icon: Users, color: 'teal' },
      { id: '9', title: '9. Was planen wir für die Zukunft?', content: 'Unten können Sie eine Tabelle sehen, die genau zeigt, was wir als Nächstes bauen und was wir bereits geliefert haben. ScamNemesis zielt darauf ab, das effektivste und am weitesten verbreitete Werkzeug für aktive Betrugsstörung, Prävention und Erkennung zu werden.', icon: Sparkles, color: 'orange' },
    ];
  }
  if (locale === 'sk') {
    return [
      { id: '1', title: '1. Pre koho je táto platforma určená?', content: 'ScamNemesis je pre ľudí, ktorí chcú overiť osobu, firmu, telefónne číslo, e-mail alebo webovú stránku. Zoznam nájdete tu. Je tiež pre ľudí, ktorí už boli podvedení a chcú nahlásiť svoj prípad a spojiť sa s ďalšími obeťami toho istého páchateľa. Platforma pomáha bežným používateľom aj profesionálom — polícii, novinárom, právnikom, analytikom, bankám a burzám.\n\nRozlíšiť podvod od legitímnej služby je dnes ťažké — každý môže byť oklamaný. Ak sa vám to stalo, nie ste sami; sme tu, aby sme vám pomohli.', icon: Users, color: 'blue' },
      { id: '2', title: '2. Aký problém riešime?', content: 'Neexistuje jediné \"globálne\" číslo, ale údaje ukazujú, že online podvody vzrástli približne o 2 300 % medzi rokmi 2019 a 2024; v roku 2024 odhadované straty dosiahli 1,03 bilióna USD.\n\nScamNemesis prináša poriadok do tohto chaosu: konsoliduje hlásenia a dôkazy do jedného koordinovaného prípadu, automaticky spája obete s podobnými vzorcami, šetrí čas vyšetrovateľom a urýchľuje vyšetrovanie.', icon: AlertTriangle, color: 'amber' },
      { id: '3', title: '3. Ako používať ScamNemesis?', content: 'Vyhľadávanie:\n\nV hornej časti nájdete vyhľadávací panel, kde môžete zadať meno, e-mail, telefónne číslo a ďalšie identifikátory. Výsledky sú zobrazené podľa skóre zhody.\n\nNahlasovanie:\n\nAk ste boli podvedení, kliknite na Nahlásiť podvod. Otvorí sa formulár — väčšina polí je voliteľná, ale odporúčame pridať čo najviac detailov.\n\nInterpretácia zhôd:\n\nPamätajte, že rovnaké meno ≠ rovnaká osoba. Vyhodnoťte kontext (krajina, typ podvodu, čas, ďalšie identifikátory).', icon: Search, color: 'cyan' },
      { id: '4', title: '4. Prečo je to dôležité?', content: 'Každý nenahlásený podvod pomáha podvodníkom osloviť viac obetí, spôsobuje viac zničených životov a vytvára viac utrpenia pre obete a ich rodiny. Chceme to zastaviť.\n\nKeď komunity zdieľajú údaje naprieč krajinami, objavujú sa vzorce. Zdieľaná inteligencia láme ich najväčšiu výhodu — izoláciu. Varovanie jednej osoby sa stáva ochranou pre všetkých.', icon: Shield, color: 'emerald' },
      { id: '5', title: '5. Prečo sme vytvorili tento projekt?', content: 'Projekt sa zrodil z hnevu a frustrácie z neefektívnych policajných metód. Sami sme sa stali obeťami podvodu a polícia nemohla pomôcť, pretože bola preťažená a nemala nástroje ani odbornosť na riešenie moderných typov podvodov.\n\nJe čas konať, preto sme sa rozhodli využiť naše znalosti OSINT, hackingu a spravodajstva na pomoc ľuďom a vyšetrovacím tímom s prevenciou a detekciou podvodov.', icon: Target, color: 'rose' },
      { id: '6', title: '6. Čo je ScamNemesis?', content: 'Komunitou riadená verifikačná a spravodajská platforma, ktorá kombinuje databázu nahlásených podvodov, sledovanie blockchainu, monitorovanie naprieč 130+ zdrojmi dát, overovanie telefónov a e-mailov, rozpoznávanie tvárí, forenznú analýzu dokumentov a mapovanie vzťahov.', icon: Database, color: 'indigo' },
      { id: '7', title: '7. Čo tu nájdete?', content: 'Vyhľadávací systém pre viac ako 38 identifikátorov (napr. meno, e-mail, telefón atď.), ktorý vám pomôže zistiť, či máte do činenia s podvodníkom a ochrániť vaše aktíva.\n\nKeď existuje zhoda, zobrazí sa hlásenie so všetkými dostupnými detailmi o podozrivom.', icon: FileSearch, color: 'purple' },
      { id: '8', title: '8. Kto stojí za týmto projektom?', content: 'Medzinárodný tím vyšetrovateľov a etických hackerov z troch kontinentov a viac ako piatich krajín — experti na kybernetickú bezpečnosť, analýzu dát a profesionáli so školením a skúsenosťami v spravodajskom remesle.\n\nNaším cieľom je zostať navždy bezplatní. Staviame na transparentnosti, pretože dôvera sa musí zaslúžiť.', icon: Users, color: 'teal' },
      { id: '9', title: '9. Čo plánujeme do budúcnosti?', content: 'Nižšie si môžete prezrieť tabuľku, ktorá presne ukazuje, čo budujeme ďalej a čo sme už spustili. ScamNemesis si kladie za cieľ stať sa najefektívnejším a najrozšírenejším nástrojom na aktívne narušenie, prevenciu a detekciu podvodov.', icon: Sparkles, color: 'orange' },
    ];
  }
  // Return English FAQ (original)
  return [
    { id: '1', title: '1. Who is this platform for?', content: `ScamNemesis is for people who want to verify a person, company, phone number, email, or website The list can be found here. It's also for people who have already been scammed and want to report their case and connect with other victims of the same perpetrator. The platform helps both everyday users and professionals — police, journalists, lawyers, analysts, banks, and exchanges.\n\nDistinguishing a scam from a legitimate service is hard today — anyone can be fooled. If it happened to you, you're not alone; we're here to help.`, icon: Users, color: 'blue' },
    { id: '2', title: '2. What problem are we solving?', content: `There is no single "global" number, but data shows that online fraud grew by roughly 2,300% between 2019 and 2024; in 2024, estimated losses reached USD 1.03 trillion.\n\nScamNemesis brings order to this chaos: it consolidates reports and evidence into a single coordinated case, automatically links victims with similar patterns, saves investigators time, and accelerates investigations.`, icon: AlertTriangle, color: 'amber' },
    { id: '3', title: '3. How to use ScamNemesis?', content: `Search:\n\nAt the top, you'll find the search bar where you can enter a name, email, phone number, and other identifiers. Results are shown by match score.\n\nReporting:\n\nIf you've been scammed, click Report scam. A form will open — most fields are optional, but we recommend adding as many details as possible.\n\nInterpreting matches:\n\nRemember that the same name ≠ the same person. Evaluate the context (country, scam type, time, other identifiers).`, icon: Search, color: 'cyan' },
    { id: '4', title: '4. Why is this important?', content: `Every unreported scam helps scammers reach more victims, causes more ruined lives, and creates more suffering for victims and their families. We want to stop that.\n\nWhen communities share data across countries, patterns emerge. Shared intelligence breaks their biggest advantage — isolation. One person's warning becomes protection for everyone.`, icon: Shield, color: 'emerald' },
    { id: '5', title: '5. Why did we create this project?', content: `The project was born out of anger and frustration with ineffective police methods. We ourselves became victims of fraud, and the police could not help because they were overwhelmed and lacked the tools and expertise to tackle modern types of scams.\n\nIt is time to act, so we decided to use our knowledge of OSINT, hacking, and intelligence to help people and investigative teams with prevention and detection of fraud.`, icon: Target, color: 'rose' },
    { id: '6', title: '6. What is ScamNemesis?', content: `A community-driven verification and intelligence platform that combines a reported-scam database, blockchain tracing, monitoring across 130+ data sources, phone and email verification, face recognition, document forensics (OCR + metadata analysis), and relationship mapping.`, icon: Database, color: 'indigo' },
    { id: '7', title: '7. What will you find here?', content: `A search system for more than 38 identifiers (e.g., name, email, phone, etc.) that helps you determine whether you're dealing with a scammer and protect your assets.\n\nWhen there's a match, a report appears with all available details about the suspect.`, icon: FileSearch, color: 'purple' },
    { id: '8', title: '8. Who is behind this project?', content: `An international team of investigators and ethical hackers from three continents and more than five countries — experts in cybersecurity, data analytics, and professionals with training and experience in intelligence tradecraft.\n\nOur goal is to remain free forever. We build on transparency because trust must be earned.`, icon: Users, color: 'teal' },
    { id: '9', title: '9. What are we planning for the future?', content: `Below, you can view a table that shows exactly what we are building next and what we have already shipped. ScamNemesis aims to become the most effective and widely adopted tool for active fraud disruption, prevention, and detection.`, icon: Sparkles, color: 'orange' },
  ];
};

// Training topics by locale
const getTrainingTopics = (locale: Locale) => {
  if (locale === 'de') {
    return [
      'Wie man Betrug im Geschäft verhindert',
      'Identitätsschutzversicherung',
      'Experian Identitätsdiebstahlschutz',
      'Sicherheit im Internet',
      '10 Wege zur Prävention von Cyberkriminalität',
      'Wie man einen Betrug erkennt',
      'Betrugshilfe-Hotline',
      'Cyberkriminalität bei der Polizei melden',
    ];
  }
  if (locale === 'sk') {
    return [
      'Ako predchádzať podvodom v podnikaní',
      'Poistenie ochrany identity',
      'Experian ochrana proti krádeži identity',
      'Bezpečnosť na internete',
      '10 spôsobov, ako predchádzať kybernetickej kriminalite',
      'Ako rozpoznať podvod',
      'Linka pomoci pre obete podvodov',
      'Nahlásenie kybernetickej kriminality polícii',
    ];
  }
  return [
    'How to prevent fraud in business',
    'Identity protection insurance',
    'Experian Identity Theft Protection',
    'Safety on the internet',
    '10 ways to prevent cybercrime',
    'How to recognize a scam',
    'Scammer helpline',
    'Report cybercrime to the police',
  ];
};

// JSON-LD Schemas
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'Fraud prevention platform with 640M+ records from 130+ trusted sources',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://twitter.com/scamnemesis',
    'https://linkedin.com/company/scamnemesis',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://scamnemesis.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is this platform for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ScamNemesis is for people who want to verify a person, company, phone number, email, or website. It also helps those who have been scammed to report their case and connect with other victims.',
      },
    },
    {
      '@type': 'Question',
      name: 'What problem are we solving?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Online fraud grew 2,300% between 2019-2024 with losses reaching USD 1.03 trillion. ScamNemesis consolidates reports into coordinated cases, links victims with similar patterns, and provides preventive verification.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I use ScamNemesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the search bar to enter names, emails, phone numbers, and other identifiers. Click Report Scam to file a case. The more identifiers you include, the higher the chance of matching with other victims.',
      },
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Fraud Recovery Services',
  provider: {
    '@type': 'Organization',
    name: 'ScamNemesis',
  },
  description: 'Recovery of funds lost to fraud through digital forensics, OSINT, and legal coordination.',
  offers: {
    '@type': 'Offer',
    price: '600',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
};

// Locale-aware roadmap features
const getRoadmapFeatures = (locale: Locale) => {
  if (locale === 'de') {
    return [
      { name: 'API: Datenversand an Dritte', status: 'development', progress: 80, description: 'Mit einem einzigen Aufruf senden wir relevante Informationen an Bank/Zahlungsgateway und Behörden — das beschleunigt das Blockieren von Transaktionen und die Eskalation.' },
      { name: 'Betrugssuche (38+ Identifikatoren)', status: 'functional', progress: 100, description: 'Suche nach E-Mail, Telefon, Name, IBAN, Domain, IP, Krypto-Wallet usw. in unserer Datenbank und externen Quellen.' },
      { name: 'Fallverknüpfung (Ähnlichkeiten)', status: 'functional', progress: 100, description: 'Verknüpft automatisch verwandte Fälle durch Abgleich von Indikatoren und Mustern (E-Mail, Telefon, Domain, Wallet…).' },
      { name: 'Medienverarbeitung + OCR', status: 'functional', progress: 80, description: 'Hochladen von Screenshots, Chats und Dokumenten → OCR extrahiert den Text und speichert ihn in der Datenbank für weitere Suchen.' },
      { name: 'Website-Widget (Melden + Suchen)', status: 'development', progress: 24, description: 'Einfaches Einbetten für Partnerseiten — Menschen können direkt auf ihrer eigenen Website melden und suchen.' },
      { name: 'Blockchain-Analyse', status: 'development', progress: 56, description: 'Kartierung des Flusses von Kryptowährungen, die on-chain als gestohlen oder mit kriminellen Aktivitäten verbunden markiert sind.' },
      { name: 'CTI (Cyber Threat Intelligence)', status: 'development', progress: 52, description: 'Cyber-Bedrohungsintelligenz; das Ziel ist breite Sichtbarkeit und aktuelle Trends für Prävention, Erkennung und Reaktion — ohne Vendor-Lock-in.' },
      { name: 'AI/NLP-Tool für OSINT-Sammlung', status: 'development', progress: 50, description: 'Überwacht kontinuierlich Dutzende von Online-Quellen und erstellt automatisch einen sauberen Nachrichtenfeed; NLP entfernt Duplikate, klassifiziert Inhalte nach Betrugsart und bereitet Kurzberichte vor.' },
      { name: 'AI Bild- und Videoerkennung (Deepfake)', status: 'development', progress: 69, description: 'Erkennt KI-generierte Inhalte und Manipulationen; erklärt Signale und weist einen Risikoscore zu.' },
      { name: 'Graph-Datenbank (Knoten & Beziehungen)', status: 'development', progress: 61, description: 'Netzwerkansichten von Verbindungen zwischen Personen, Unternehmen, Konten und Fällen; schnelles "wer mit wem" und "Geld wohin".' },
      { name: 'Datenanreicherung aus 130+ externen Quellen', status: 'development', progress: 0, description: 'Integrationen für OSINT-, Reputations- und Sicherheits-Feeds für E-Mails, Telefone, IPs, Domains und Blockchain.' },
      { name: 'E-Mail-Verifizierung (Existenz/Registrierungen/Alter*)', status: 'planned', progress: 50, description: 'Prüft Zustellbarkeit, wo die E-Mail verwendet/registriert ist, und wo möglich, Signale zum Kontoalter*.' },
      { name: 'Personen- & Firmensuche', status: 'development', progress: 68, description: 'Mit einer einzigen Abfrage durchsucht offene Register, Amtsblätter und verfügbare Gerichtsentscheidungen; gibt eine Zusammenfassung mit Quellen zurück.' },
      { name: 'Reverse-Gesichtssuche', status: 'planned', progress: 58, description: 'Laden Sie ein Foto hoch und das System findet Übereinstimmungen in der internen Datenbank und sozialen Netzwerken (mit Spoof-Schutz).' },
      { name: 'Ähnliche Gesichtsabgleichung (Upload)', status: 'planned', progress: 52, description: 'Vergleicht und rankt die ähnlichsten Gesichter; unterstützt Batch-Abfragen.' },
      { name: 'Medienforensik: Geolokation & Bearbeitungen', status: 'planned', progress: 57, description: 'EXIF/Metadaten, ELA, Manipulationserkennung, Geo-Hinweise, Audio-Video-Inkonsistenzen.' },
      { name: 'AI-Bot "Ist das Betrug?"', status: 'planned', progress: 0, description: 'Ein Chat-Assistent, der schnell basierend auf Signalen berät: worauf zu achten ist, was zu überprüfen ist und welche Schritte zu unternehmen sind.' },
      { name: 'Domain-Score & Reputation', status: 'development', progress: 59, description: 'WHOIS, DNS, SSL/TLS, Blacklists, Hosting, Technologie — ergibt einen Domain-Risikoscore.' },
      { name: 'Medienforensik — erweiterte Module', status: 'planned', progress: 53, description: 'Erweiterte Tools für Bild, Video und Audio (Manipulationslokalisierung, Liveness, Chain of Custody).' },
    ];
  }
  if (locale === 'sk') {
    return [
      { name: 'API: odoslanie dát tretím stranám', status: 'development', progress: 80, description: 'Jedným volaním odosielame relevantné informácie banke/platobnej bráne a úradom — urýchľuje to blokovanie transakcií a eskaláciu.' },
      { name: 'Vyhľadávanie podvodov (38+ identifikátorov)', status: 'functional', progress: 100, description: 'Vyhľadávanie podľa e-mailu, telefónu, mena, IBAN, domény, IP, crypto peňaženky atď. v našej databáze a externých zdrojoch.' },
      { name: 'Prepájanie prípadov (podobnosti)', status: 'functional', progress: 100, description: 'Automaticky prepája súvisiace prípady porovnávaním indikátorov a vzorcov (e-mail, telefón, doména, peňaženka…).' },
      { name: 'Spracovanie médií + OCR', status: 'functional', progress: 80, description: 'Nahranie screenshotov, chatov a dokumentov → OCR extrahuje text a ukladá ho do databázy na ďalšie vyhľadávanie.' },
      { name: 'Widget pre webové stránky (nahlasovanie + vyhľadávanie)', status: 'development', progress: 24, description: 'Jednoduchý embed pre partnerské stránky — ľudia môžu nahlasovať a vyhľadávať priamo na svojej webstránke.' },
      { name: 'Blockchain analýza', status: 'development', progress: 56, description: 'Mapovanie tokov kryptomien označených na blockchainu ako ukradnuté alebo prepojené s kriminálnou činnosťou.' },
      { name: 'CTI (Cyber Threat Intelligence)', status: 'development', progress: 52, description: 'Kybernetická spravodajská analýza; cieľom je široký prehľad a aktuálne trendy pre prevenciu, detekciu a reakciu — bez vendor lock-in.' },
      { name: 'AI/NLP nástroj na OSINT zber', status: 'development', progress: 50, description: 'Nepretržite monitoruje desiatky online zdrojov a automaticky vytvára čistý spravodajský kanál; NLP odstraňuje duplikáty, klasifikuje obsah podľa typu podvodu a pripravuje krátke správy.' },
      { name: 'AI detekcia obrázkov a videa (deepfake)', status: 'development', progress: 69, description: 'Detekuje AI-generovaný obsah a manipulácie; vysvetľuje signály a priraďuje rizikové skóre.' },
      { name: 'Grafová databáza (uzly a vzťahy)', status: 'development', progress: 61, description: 'Sieťové zobrazenia prepojení medzi ľuďmi, firmami, účtami a prípadmi; rýchle "kto s kým" a "kam smerovali peniaze".' },
      { name: 'Obohatenie dát zo 130+ externých zdrojov', status: 'development', progress: 0, description: 'Integrácie pre OSINT, reputačné a bezpečnostné feedy pre e-maily, telefóny, IP, domény a blockchain.' },
      { name: 'Overenie e-mailu (existencia/registrácie/vek*)', status: 'planned', progress: 50, description: 'Kontroluje doručiteľnosť, kde je e-mail použitý/registrovaný a kde je to možné, signály o veku účtu*.' },
      { name: 'Vyhľadávanie osôb a firiem', status: 'development', progress: 68, description: 'Jedným dopytom prehľadá otvorené registre, vestníky a dostupné súdne rozhodnutia; vracia súhrn so zdrojmi.' },
      { name: 'Reverzné vyhľadávanie tvárí', status: 'planned', progress: 58, description: 'Nahrajte fotografiu a systém nájde zhody v internej databáze a sociálnych sieťach (s ochranou proti podvrhu).' },
      { name: 'Porovnávanie podobných tvárí (nahratie)', status: 'planned', progress: 52, description: 'Porovnáva a zoraďuje najpodobnejšie tváre; podporuje dávkové dopyty.' },
      { name: 'Forenzná analýza médií: geolokácia a úpravy', status: 'planned', progress: 57, description: 'EXIF/metadáta, ELA, detekcia manipulácií, geo-stopy, audio-video nezrovnalosti.' },
      { name: 'AI bot "Je to podvod?"', status: 'planned', progress: 0, description: 'Chatový asistent, ktorý rýchlo poradí na základe signálov: na čo si dať pozor, čo overiť a aké kroky podniknúť.' },
      { name: 'Skóre domény a reputácia', status: 'development', progress: 59, description: 'WHOIS, DNS, SSL/TLS, blacklisty, hosting, technológie — výsledkom je rizikové skóre domény.' },
      { name: 'Forenzná analýza médií — pokročilé moduly', status: 'planned', progress: 53, description: 'Pokročilé nástroje pre obraz, video a audio (lokalizácia manipulácií, liveness, chain of custody).' },
    ];
  }
  return [
    { name: 'API: dispatch data to three parties', status: 'development', progress: 80, description: 'With a single call we send relevant information to the bank/payment gateway and to authorities — this speeds up blocking transactions and escalation.' },
    { name: 'Scam search (38+ identifiers)', status: 'functional', progress: 100, description: 'Search by email, phone, name, IBAN, domain, IP, crypto wallet, etc., across our database and external sources.' },
    { name: 'Case linking (similarities)', status: 'functional', progress: 100, description: 'Automatically links related cases by matching indicators and patterns (email, phone, domain, wallet…).' },
    { name: 'Media processing + OCR', status: 'functional', progress: 80, description: 'Upload screenshots, chats, and documents → OCR extracts the text and saves it to the database for further searching.' },
    { name: 'Website widget (reporting + search)', status: 'development', progress: 24, description: 'Simple embed for partner sites — people can report and search directly on their own website.' },
    { name: 'Blockchain analysis', status: 'development', progress: 56, description: 'Mapping the flow of cryptocurrencies flagged on-chain as stolen or linked to criminal activity.' },
    { name: 'CTI (Cyber Threat Intelligence)', status: 'development', progress: 52, description: 'Cyber threat intelligence; the goal is broad visibility and current trends for prevention, detection, and response — without vendor lock-in.' },
    { name: 'AI/NLP tool for OSINT collection', status: 'development', progress: 50, description: 'Continuously monitors dozens of online sources and automatically builds a clean news feed; NLP removes duplicates, classifies content by scam type, and prepares short reports. Watchlists with keywords and entities instantly alert on new matches and trigger alerts on spikes in mentions.' },
    { name: 'AI image and video detection (deepfake)', status: 'development', progress: 69, description: 'Detects AI-generated content and manipulations; explains signals and assigns a risk score.' },
    { name: 'Graph database (nodes & relationships)', status: 'development', progress: 61, description: 'Network views of links between people, companies, accounts, and cases; quick "who with whom" and "money to where".' },
    { name: 'Data enrichment from 130+ external sources', status: 'development', progress: 0, description: 'Integrations for OSINT, reputation, and security feeds for emails, phones, IPs, domains, and blockchain.' },
    { name: 'Email verification (existence/registrations/age*)', status: 'planned', progress: 50, description: 'Checks deliverability, where the email is used/registered, and where possible, signals of account age*.' },
    { name: 'People & company search', status: 'development', progress: 68, description: 'With a single query searches open registers, gazettes, and available court decisions; returns a summary with sources.' },
    { name: 'Reverse face search', status: 'planned', progress: 58, description: 'Upload a photo and the system finds matches in the internal database and social networks (with spoof protection).' },
    { name: 'Similar face matching (upload)', status: 'planned', progress: 52, description: 'Compares and ranks the most similar faces; supports batch queries.' },
    { name: 'Media forensics: geolocation & edits', status: 'planned', progress: 57, description: 'EXIF/metadata, ELA, manipulation detection, geo-cues, audio-video inconsistencies.' },
    { name: 'AI bot "Is this a scam?"', status: 'planned', progress: 0, description: 'A chat assistant that quickly advises based on signals: what to watch for, what to verify, and which steps to take.' },
    { name: 'Domain score & reputation', status: 'development', progress: 59, description: 'WHOIS, DNS, SSL/TLS, blacklists, hosting, technology — resulting in a domain risk score.' },
    { name: 'Media forensics — advanced modules', status: 'planned', progress: 53, description: 'Advanced tools for image, video, and audio (manipulation localization, liveness, chain of custody).' },
  ];
};

// Locale-aware database categories
const getDatabaseCategories = (locale: Locale) => {
  if (locale === 'de') {
    return [
      {
        title: 'Kryptowährungsbetrug',
        icon: Coins,
        color: 'orange',
        stats: [
          { label: 'Krypto-Adressen', value: '50,000+' },
          { label: 'Betrugsprojekte', value: '9,221+' },
          { label: 'Ransomware-Wallets', value: '11,186+' },
          { label: 'Blockchain-Ketten', value: '16+' },
        ],
        sources: 'Chainabuse, CryptoScamDB, ScamSniffer, OpenSanctions Ransomwhere',
      },
      {
        title: 'E-Mails & Domains',
        icon: Mail,
        color: 'blue',
        stats: [
          { label: 'Phishing-URLs', value: '9M+' },
          { label: 'Bösartige Domains', value: '2.29M+' },
          { label: 'Discord-Scam-Links', value: '30,000+' },
          { label: 'Spam-Domains', value: 'Milliarden' },
        ],
        sources: 'PhishTank, URLhaus, OpenPhish, Google Safe Browsing, Spamhaus',
      },
      {
        title: 'Telefonnummern',
        icon: Phone,
        color: 'purple',
        stats: [
          { label: 'Betrugsanrufe (US)', value: '2M+' },
          { label: 'Robocall-Meldungen', value: '1.2M+' },
          { label: 'Bekannte Betrüger', value: '4M+' },
          { label: 'Tägliche Updates', value: '✓' },
        ],
        sources: 'FTC DNC API, ScamSearch.io, Community-Datenbanken',
      },
      {
        title: 'IP-Adressen',
        icon: Network,
        color: 'green',
        stats: [
          { label: 'Bösartige IPs', value: '612M+' },
          { label: 'Tor-Exit-Nodes', value: '2,000+' },
          { label: 'Bedrohungsindikatoren', value: 'Millionen' },
          { label: 'Netzwerkblöcke', value: 'Hunderte' },
        ],
        sources: 'AbuseIPDB, ThreatFox, FireHOL, AlienVault OTX, Spamhaus',
      },
      {
        title: 'Sanktionen & Listen',
        icon: AlertTriangle,
        color: 'red',
        stats: [
          { label: 'OFAC SDN-Entitäten', value: '12,000+' },
          { label: 'FBI Most Wanted', value: '1,000+' },
          { label: 'UN-Einzelpersonen', value: '669' },
          { label: 'Globale Quellen', value: '130+' },
        ],
        sources: 'OFAC, FBI, UN, EU, UK OFSI, OpenSanctions',
      },
      {
        title: 'Soziale Medien',
        icon: Users,
        color: 'indigo',
        stats: [
          { label: 'Telegram-Kanäle', value: '120,979' },
          { label: 'Twitter-Bot-Konten', value: '50,538+' },
          { label: 'Instagram-Fakes', value: '3,600+' },
          { label: 'LinkedIn-Profile', value: '3,600+' },
        ],
        sources: 'TGDataset, TwiBot-20, Discord AntiScam, InstaFake',
      },
      {
        title: 'Finanzbetrug',
        icon: CreditCard,
        color: 'cyan',
        stats: [
          { label: 'CFPB-Beschwerden', value: '3M+' },
          { label: 'IC3-Meldungen (2024)', value: '859,000' },
          { label: 'Australien-Meldungen', value: '494,000' },
          { label: 'Aufgelöste Unternehmen', value: '6.7M+' },
        ],
        sources: 'CFPB, FBI IC3, Scamwatch AU, Companies House UK',
      },
      {
        title: 'Gestohlene Fahrzeuge',
        icon: Car,
        color: 'slate',
        stats: [
          { label: 'Interpol-Datenbank', value: '12M+' },
          { label: 'US-Abdeckung', value: '87%' },
          { label: 'NICB VINCheck', value: '5 Jahre' },
          { label: 'Echtzeit-Updates', value: '✓' },
        ],
        sources: 'Interpol SMV, NICB VINCheck, NMVTIS',
      },
    ];
  }
  if (locale === 'sk') {
    return [
      {
        title: 'Crypto podvody',
        icon: Coins,
        color: 'orange',
        stats: [
          { label: 'Crypto adresy', value: '50,000+' },
          { label: 'Podvodné projekty', value: '9,221+' },
          { label: 'Ransomware peňaženky', value: '11,186+' },
          { label: 'Blockchain reťazce', value: '16+' },
        ],
        sources: 'Chainabuse, CryptoScamDB, ScamSniffer, OpenSanctions Ransomwhere',
      },
      {
        title: 'E-maily a domény',
        icon: Mail,
        color: 'blue',
        stats: [
          { label: 'Phishing URL', value: '9M+' },
          { label: 'Škodlivé domény', value: '2.29M+' },
          { label: 'Discord scam odkazy', value: '30,000+' },
          { label: 'Spam domény', value: 'Miliardy' },
        ],
        sources: 'PhishTank, URLhaus, OpenPhish, Google Safe Browsing, Spamhaus',
      },
      {
        title: 'Telefónne čísla',
        icon: Phone,
        color: 'purple',
        stats: [
          { label: 'Podvodné hovory (US)', value: '2M+' },
          { label: 'Robocall hlásenia', value: '1.2M+' },
          { label: 'Známi podvodníci', value: '4M+' },
          { label: 'Denné aktualizácie', value: '✓' },
        ],
        sources: 'FTC DNC API, ScamSearch.io, Komunitné databázy',
      },
      {
        title: 'IP adresy',
        icon: Network,
        color: 'green',
        stats: [
          { label: 'Škodlivé IP', value: '612M+' },
          { label: 'Tor Exit Nodes', value: '2,000+' },
          { label: 'Indikátory hrozieb', value: 'Milióny' },
          { label: 'Sieťové bloky', value: 'Stovky' },
        ],
        sources: 'AbuseIPDB, ThreatFox, FireHOL, AlienVault OTX, Spamhaus',
      },
      {
        title: 'Sankcie a zoznamy',
        icon: AlertTriangle,
        color: 'red',
        stats: [
          { label: 'OFAC SDN entity', value: '12,000+' },
          { label: 'FBI Most Wanted', value: '1,000+' },
          { label: 'OSN jednotlivci', value: '669' },
          { label: 'Globálne zdroje', value: '130+' },
        ],
        sources: 'OFAC, FBI, UN, EU, UK OFSI, OpenSanctions',
      },
      {
        title: 'Sociálne siete',
        icon: Users,
        color: 'indigo',
        stats: [
          { label: 'Telegram kanály', value: '120,979' },
          { label: 'Twitter bot účty', value: '50,538+' },
          { label: 'Instagram falošné profily', value: '3,600+' },
          { label: 'LinkedIn profily', value: '3,600+' },
        ],
        sources: 'TGDataset, TwiBot-20, Discord AntiScam, InstaFake',
      },
      {
        title: 'Finančné podvody',
        icon: CreditCard,
        color: 'cyan',
        stats: [
          { label: 'CFPB sťažnosti', value: '3M+' },
          { label: 'IC3 hlásenia (2024)', value: '859,000' },
          { label: 'Austrália hlásenia', value: '494,000' },
          { label: 'Zrušené firmy', value: '6.7M+' },
        ],
        sources: 'CFPB, FBI IC3, Scamwatch AU, Companies House UK',
      },
      {
        title: 'Odcudzené vozidlá',
        icon: Car,
        color: 'slate',
        stats: [
          { label: 'Interpol databáza', value: '12M+' },
          { label: 'US pokrytie', value: '87%' },
          { label: 'NICB VINCheck', value: '5 rokov' },
          { label: 'Aktualizácie v reálnom čase', value: '✓' },
        ],
        sources: 'Interpol SMV, NICB VINCheck, NMVTIS',
      },
    ];
  }
  return [
    {
      title: 'Cryptocurrency Fraud',
      icon: Coins,
      color: 'orange',
      stats: [
        { label: 'Crypto Addresses', value: '50,000+' },
        { label: 'Scam Projects', value: '9,221+' },
        { label: 'Ransomware Wallets', value: '11,186+' },
        { label: 'Blockchain Chains', value: '16+' },
      ],
      sources: 'Chainabuse, CryptoScamDB, ScamSniffer, OpenSanctions Ransomwhere',
    },
    {
      title: 'Emails & Domains',
      icon: Mail,
      color: 'blue',
      stats: [
        { label: 'Phishing URLs', value: '9M+' },
        { label: 'Malicious Domains', value: '2.29M+' },
        { label: 'Discord Scam Links', value: '30,000+' },
        { label: 'Spam Domains', value: 'Billions' },
      ],
      sources: 'PhishTank, URLhaus, OpenPhish, Google Safe Browsing, Spamhaus',
    },
    {
      title: 'Phone Numbers',
      icon: Phone,
      color: 'purple',
      stats: [
        { label: 'Scam Calls (US)', value: '2M+' },
        { label: 'Robocall Reports', value: '1.2M+' },
        { label: 'Known Scammers', value: '4M+' },
        { label: 'Daily Updates', value: '✓' },
      ],
      sources: 'FTC DNC API, ScamSearch.io, Community databases',
    },
    {
      title: 'IP Addresses',
      icon: Network,
      color: 'green',
      stats: [
        { label: 'Malicious IPs', value: '612M+' },
        { label: 'Tor Exit Nodes', value: '2,000+' },
        { label: 'Threat Indicators', value: 'Millions' },
        { label: 'Network Blocks', value: 'Hundreds' },
      ],
      sources: 'AbuseIPDB, ThreatFox, FireHOL, AlienVault OTX, Spamhaus',
    },
    {
      title: 'Sanctions & Lists',
      icon: AlertTriangle,
      color: 'red',
      stats: [
        { label: 'OFAC SDN Entities', value: '12,000+' },
        { label: 'FBI Most Wanted', value: '1,000+' },
        { label: 'UN Individuals', value: '669' },
        { label: 'Global Sources', value: '130+' },
      ],
      sources: 'OFAC, FBI, UN, EU, UK OFSI, OpenSanctions',
    },
    {
      title: 'Social Media',
      icon: Users,
      color: 'indigo',
      stats: [
        { label: 'Telegram Channels', value: '120,979' },
        { label: 'Twitter Bot Accounts', value: '50,538+' },
        { label: 'Instagram Fakes', value: '3,600+' },
        { label: 'LinkedIn Profiles', value: '3,600+' },
      ],
      sources: 'TGDataset, TwiBot-20, Discord AntiScam, InstaFake',
    },
    {
      title: 'Financial Fraud',
      icon: CreditCard,
      color: 'cyan',
      stats: [
        { label: 'CFPB Complaints', value: '3M+' },
        { label: 'IC3 Reports (2024)', value: '859,000' },
        { label: 'Australia Reports', value: '494,000' },
        { label: 'Dissolved Companies', value: '6.7M+' },
      ],
      sources: 'CFPB, FBI IC3, Scamwatch AU, Companies House UK',
    },
    {
      title: 'Stolen Vehicles',
      icon: Car,
      color: 'slate',
      stats: [
        { label: 'Interpol Database', value: '12M+' },
        { label: 'US Coverage', value: '87%' },
        { label: 'NICB VINCheck', value: '5 Years' },
        { label: 'Real-time Updates', value: '✓' },
      ],
      sources: 'Interpol SMV, NICB VINCheck, NMVTIS',
    },
  ];
};

// Service features data - locale-aware
const getRecoveryFeatures = (locale: Locale) => {
  if (locale === 'de') {
    return [
      { icon: FileSearch, text: 'Fallanalyse', desc: 'Bewertung der realen Wiederherstellungschance, Beweissammlung und -bewertung.' },
      { icon: Database, text: 'Digitale Forensik', desc: 'Blockchain-Verfolgung, OSINT, Kommunikations- und Metadatenanalyse.' },
      { icon: Lock, text: 'Vermögenseinfrierung', desc: 'Kontaktaufnahme mit Banken und Börsen, Vorbereitung und Versand von Einfrierungsschreiben.' },
      { icon: Scale, text: 'Rechtliche Koordination', desc: 'Erstellung von Anordnungen und Anträgen, Koordination mit Anwälten und Behörden.' },
      { icon: FileText, text: 'Vorbereitung der Wiederherstellungsdokumentation', desc: 'Schiedsverfahren, Rechtsstreitigkeiten, außergerichtliche Einigung.' },
      { icon: Users, text: 'Opferunterstützung', desc: 'Meldung, laufende Kommunikation, Empfehlungen und Prävention.' },
    ];
  }
  if (locale === 'sk') {
    return [
      { icon: FileSearch, text: 'Analýza prípadu', desc: 'Posúdenie reálnej šance na vymáhanie, zber a vyhodnotenie dôkazov.' },
      { icon: Database, text: 'Digitálna forenzná analýza', desc: 'Sledovanie blockchainu, OSINT, analýza komunikácie a metadát.' },
      { icon: Lock, text: 'Zmrazenie majetku', desc: 'Kontaktovanie bánk a búrz, príprava a odoslanie zmrazovacích listov.' },
      { icon: Scale, text: 'Právna koordinácia', desc: 'Vypracovanie príkazov a podaní, koordinácia s právnikmi a úradmi.' },
      { icon: FileText, text: 'Príprava dokumentácie na vymáhanie', desc: 'Arbitráž, súdne spory, mimosúdne vyrovnanie.' },
      { icon: Users, text: 'Podpora obetí', desc: 'Nahlasovanie, priebežná komunikácia, odporúčania a prevencia.' },
    ];
  }
  return [
    { icon: FileSearch, text: 'Case analysis', desc: 'Assessment of the real chance of recovery, evidence collection and evaluation.' },
    { icon: Database, text: 'Digital forensics', desc: 'Blockchain tracing, OSINT, communication and metadata analysis.' },
    { icon: Lock, text: 'Asset freezing', desc: 'Contacting banks and exchanges, preparing and sending Freezing Letters.' },
    { icon: Scale, text: 'Legal coordination', desc: 'Drafting orders and filings, coordination with attorneys and authorities.' },
    { icon: FileText, text: 'Preparation of recovery documentation', desc: 'Arbitration, litigation, out-of-court settlement.' },
    { icon: Users, text: 'Victim support', desc: 'Reporting, ongoing communication, recommendations and prevention.' },
  ];
};

const getDueDiligenceFeatures = (locale: Locale) => {
  if (locale === 'de') {
    return [
      { icon: Building, text: 'Entitäts- und UBO-Identifizierung', desc: 'KYB/KYC, Verifizierung von Registrierungen, Eigentumsstruktur, PEP- und Sanktionsprüfungen.' },
      { icon: Scale, text: 'Reputations- und Rechtsscreening', desc: 'Negative Medien, Rechtsstreitigkeiten, Insolvenzregister, regulatorische Maßnahmen.' },
      { icon: CreditCard, text: 'Finanz- und Betriebsindikatoren', desc: 'Grundlegende finanzielle Gesundheit, Zugehörigkeiten, Warnsignale (Schulden, Steuerrückstände).' },
      { icon: Lock, text: 'Technischer und Sicherheits-Fußabdruck', desc: 'Domains, Infrastruktur, E-Mails, Datenlecks, digitale Fußabdrücke von Schlüsselpersonen.' },
      { icon: Network, text: 'Geschäftsbeziehungen und Interessenkonflikte', desc: 'Netzwerkkartierung von Partnern, riskante Verbindungen, politische Exposition.' },
      { icon: FileText, text: 'Lieferumfang', desc: 'Risikozusammenfassung (RAG), detaillierter Bericht mit Beweisen, Warnsignalen und empfohlenen Maßnahmen.' },
    ];
  }
  if (locale === 'sk') {
    return [
      { icon: Building, text: 'Identifikácia entity a UBO', desc: 'KYB/KYC, overenie registrácií, vlastnícka štruktúra, PEP a sankčné kontroly.' },
      { icon: Scale, text: 'Reputačný a právny skríning', desc: 'Negatívne médiá, súdne spory, insolvenčné registre, regulačné opatrenia.' },
      { icon: CreditCard, text: 'Finančné a prevádzkové ukazovatele', desc: 'Základné finančné zdravie, prepojenia, varovné signály (dlhy, daňové nedoplatky).' },
      { icon: Lock, text: 'Technická a bezpečnostná stopa', desc: 'Domény, infraštruktúra, e-maily, úniky dát, digitálne stopy kľúčových osôb.' },
      { icon: Network, text: 'Obchodné väzby a konflikty záujmov', desc: 'Mapovanie siete partnerov, rizikové prepojenia, politická expozícia.' },
      { icon: FileText, text: 'Výstupy', desc: 'Súhrn rizík (RAG), podrobná správa s dôkazmi, varovnými signálmi a odporúčanými opatreniami.' },
    ];
  }
  return [
    { icon: Building, text: 'Entity and UBO identification', desc: 'KYB/KYC, verification of registrations, ownership structure, PEP and sanctions checks.' },
    { icon: Scale, text: 'Reputational and legal screening', desc: 'adverse media, litigation, insolvency registers, regulatory actions.' },
    { icon: CreditCard, text: 'Financial and operational indicators', desc: 'baseline financial health, affiliations, red flags (debt, tax arrears).' },
    { icon: Lock, text: 'Technical and security footprint', desc: 'domains, infrastructure, emails, data leaks, digital footprints of key people.' },
    { icon: Network, text: 'Business ties and conflicts of interest', desc: 'network mapping of partners, risky connections, political exposure.' },
    { icon: FileText, text: 'Deliverables', desc: 'risk summary (RAG), detailed report with evidence, red flags, and recommended actions (monitoring, contractual clauses).' },
  ];
};

const getInvestigationFeatures = (locale: Locale) => {
  if (locale === 'de') {
    return [
      { icon: Target, text: 'Umfang & Sicherung', desc: 'Schnelle Hypothesen, Beweissicherung.' },
      { icon: Database, text: 'Digitale Forensik', desc: 'Geräte, E-Mail, Logs, Cloud.' },
      { icon: Search, text: 'OSINT & Reputationsanalyse', desc: 'Kartierung von Personen/Unternehmen, Verbindungen, negative Medien.' },
      { icon: CreditCard, text: 'Finanzermittlung', desc: 'Geldflüsse (Bank/Krypto), gefälschte Rechnungen, Schmiergelder.' },
      { icon: AlertTriangle, text: 'Incident Response', desc: 'BEC/Ransomware/Insider, Schadensbegrenzung.' },
      { icon: Scale, text: 'Rechtliche Koordination', desc: 'Anträge, Kommunikation mit Behörden.' },
    ];
  }
  if (locale === 'sk') {
    return [
      { icon: Target, text: 'Rozsah a zachovanie', desc: 'Rýchle hypotézy, zachovanie dôkazov.' },
      { icon: Database, text: 'Digitálna forenzná analýza', desc: 'Zariadenia, e-mail, logy, cloud.' },
      { icon: Search, text: 'OSINT a reputačná analýza', desc: 'Mapovanie osôb/firiem, prepojenia, negatívne médiá.' },
      { icon: CreditCard, text: 'Finančné vyšetrovanie', desc: 'Toky peňazí (banka/krypto), falošné faktúry, úplatky.' },
      { icon: AlertTriangle, text: 'Reakcia na incidenty', desc: 'BEC/ransomware/insider, zmiernenie škôd.' },
      { icon: Scale, text: 'Právna koordinácia', desc: 'Podania, komunikácia s úradmi.' },
    ];
  }
  return [
    { icon: Target, text: 'Scoping & preservation', desc: 'rapid hypotheses, evidence preservation.' },
    { icon: Database, text: 'Digital forensics', desc: 'devices, email, logs, cloud.' },
    { icon: Search, text: 'OSINT & reputational analysis', desc: 'mapping people/companies, links, adverse media.' },
    { icon: CreditCard, text: 'Financial investigation', desc: 'flows (bank/crypto), fake invoices, kickbacks.' },
    { icon: AlertTriangle, text: 'Incident response', desc: 'BEC/ransomware/insider, damage mitigation.' },
    { icon: Scale, text: 'Legal coordination', desc: 'filings, communication with authorities.' },
  ];
};

const getTrainingFeatures = (locale: Locale) => {
  if (locale === 'de') {
    return [
      { icon: GraduationCap, text: 'Security Awareness & Anti-Betrugs-Programm', desc: 'Rollenbasiert, für Finanzen/Kundenservice/Support.' },
      { icon: Mail, text: 'Phishing/Smishing-Simulationen', desc: '+ schnelle "Fix-it"-Mikrolektionen.' },
      { icon: Target, text: 'Incident-Response-Tabletop-Übungen', desc: 'BEC, Ransomware, Datenleck.' },
      { icon: Lock, text: 'OSINT & Datenschutz-Hygiene', desc: 'Sicheres Suchen, Identitäts- und Metadatenschutz.' },
      { icon: BookOpen, text: 'Richtlinien- und Playbook-Entwicklung', desc: 'IR-Runbooks, Meldewege, Beweiskette.' },
      { icon: Briefcase, text: 'Prozessberatung', desc: 'TPRM/AML/KYB und Vorbereitung von Prüfungsnachweisen.' },
    ];
  }
  if (locale === 'sk') {
    return [
      { icon: GraduationCap, text: 'Bezpečnostné povedomie a anti-fraud program', desc: 'Podľa rolí, pre financie/zákaznícky servis/podporu.' },
      { icon: Mail, text: 'Phishing/smishing simulácie', desc: '+ rýchle "oprav to" mikrolekcie.' },
      { icon: Target, text: 'Tabletop cvičenia reakcie na incidenty', desc: 'BEC, ransomware, únik dát.' },
      { icon: Lock, text: 'OSINT a hygiena súkromia', desc: 'Bezpečné vyhľadávanie, ochrana identity a metadát.' },
      { icon: BookOpen, text: 'Vývoj politík a príručiek', desc: 'IR runbooky, toky nahlasovania, reťazec úschovy.' },
      { icon: Briefcase, text: 'Procesné poradenstvo', desc: 'TPRM/AML/KYB a príprava auditných dôkazov.' },
    ];
  }
  return [
    { icon: GraduationCap, text: 'Security awareness & anti-fraud program', desc: 'role-based, for finance/CS/support.' },
    { icon: Mail, text: 'Phishing/smishing simulations', desc: '+ quick "fix-it" micro-lessons.' },
    { icon: Target, text: 'Incident response tabletop exercises', desc: 'BEC, ransomware, data breach.' },
    { icon: Lock, text: 'OSINT & privacy hygiene', desc: 'safe searching, identity and metadata protection.' },
    { icon: BookOpen, text: 'Policy and playbook development', desc: 'IR runbooks, reporting flows, chain of custody.' },
    { icon: Briefcase, text: 'Process consulting', desc: 'TPRM/AML/KYB and preparation of audit evidence.' },
  ];
};

// When suitable texts - locale-aware
const getRecoveryWhenSuitable = (locale: Locale) => {
  if (locale === 'de') {
    return [
      'Wenn Sie Opfer von betrügerischen Überweisungen (Krypto/Fiat), Phishing, „Romance"- und Investitionsbetrug wurden.',
      'Wenn Sie eine Kontoübernahme und verdächtige Abhebungen über eine Börse oder Bank erlebt haben.',
      'Wenn Sie Vermögenswerte schnell blockieren und vertretbare Beweise vorlegen müssen.',
    ];
  }
  if (locale === 'sk') {
    return [
      'Ak ste sa stali obeťou podvodných prevodov (krypto/fiat), phishingu, „romance" a investičných schém.',
      'Ak ste zažili prevzatie účtu a podozrivé výbery cez burzu alebo banku.',
      'Ak potrebujete rýchlo zablokovať aktíva a poskytnúť obhájiteľné dôkazy.',
    ];
  }
  return [
    'If you became a victim of fraudulent transfers (crypto/fiat), phishing, "romance," and investment schemes.',
    'If you experienced account takeover and suspicious withdrawals via an exchange or bank.',
    'If you need to quickly block assets and provide defensible evidence.',
  ];
};

const getDueDiligenceWhenSuitable = (locale: Locale) => {
  if (locale === 'de') {
    return [
      'Onboarding eines neuen Kunden/Lieferanten oder Drittpartei-Risikomanagement (TPRM).',
      'M&A, Joint Venture, Investoreneintritt, Franchise/Lizenzierung.',
      'Verdacht auf Verbindungen zu Betrug, sanktionierten Entitäten oder Geldwäsche.',
      'Erfüllung von AML/CTF-Verpflichtungen oder Anforderungen einer Bank, eines Investors oder eines internen Compliance-Audits.',
    ];
  }
  if (locale === 'sk') {
    return [
      'Onboarding nového klienta/dodávateľa alebo riadenie rizík tretích strán (TPRM).',
      'M&A, joint venture, vstup investora, franšíza/licencovanie.',
      'Podozrenie na prepojenie s podvodom, sankcionovanými entitami alebo praním špinavých peňazí.',
      'Plnenie AML/CTF povinností alebo požiadaviek banky, investora alebo interného compliance auditu.',
    ];
  }
  return [
    'Onboarding a new client/vendor or third-party risk management (TPRM).',
    'M&A, joint venture, investor entry, franchise/licensing.',
    'Suspected links to fraud, sanctioned entities, or money laundering.',
    'Meeting AML/CTF obligations or requirements from a bank, investor, or internal compliance audit.',
  ];
};

const getInvestigationWhenSuitable = (locale: Locale) => {
  if (locale === 'de') {
    return [
      'Verdacht auf internen Betrug oder Interessenkonflikt.',
      'Datenschutzverletzung, kompromittierte Konten, Ransomware/BEC.',
      'Rechnungsbetrug, „Geister"-Lieferanten, Absprachen.',
      'Marken-/IP-Missbrauch: geklonte Websites, gefälschte Profile.',
      'Vorprozess- oder Compliance-Phase, wenn Sie vertretbare Beweise für den Vorstand, die Bank oder den Prüfer benötigen.',
    ];
  }
  if (locale === 'sk') {
    return [
      'Podozrenie na interný podvod alebo konflikt záujmov.',
      'Únik dát, kompromitované účty, ransomware/BEC.',
      'Faktúrový podvod, „ghost" dodávatelia, tajné dohody.',
      'Zneužitie značky/IP: klonované webstránky, falošné profily.',
      'Pred-súdna alebo compliance fáza, keď potrebujete obhájiteľné dôkazy pre predstavenstvo, banku alebo audítora.',
    ];
  }
  return [
    'Suspected internal fraud or conflict of interest.',
    'Data breach, compromised accounts, ransomware/BEC.',
    'Invoice fraud, "ghost" vendors, collusion.',
    'Brand/IP abuse: cloned websites, fake profiles.',
    'Pre-litigation or compliance phase when you need defensible evidence for the board, bank, or auditor.',
  ];
};

const getTrainingWhenSuitable = (locale: Locale) => {
  if (locale === 'de') {
    return [
      'Beim Onboarding neuer Mitarbeiter oder der Skalierung von Teams mit Zugang zu Geld/Daten.',
      'Nach einem Vorfall, um das Wiederholungsrisiko zu reduzieren und die Reaktionszeit zu verkürzen.',
      'Vor einem Audit oder einer Investition, oder beim Onboarding eines wichtigen Kunden (TPRM/AML-Anforderungen).',
      'Wenn Sie mit Phishing, Markenmissbrauch oder betrügerischen Bestellungen konfrontiert sind.',
      'Wenn Sie praktische Playbooks für den Vorstand, die Finanzabteilung und die Frontline-Teams benötigen.',
    ];
  }
  if (locale === 'sk') {
    return [
      'Pri onboardingu nových zamestnancov alebo škálovaní tímov s prístupom k peniazom/dátam.',
      'Po incidente na zníženie rizika opakovania a skrátenie reakčného času.',
      'Pred auditom alebo investíciou, alebo pri onboardingu významného klienta (TPRM/AML požiadavky).',
      'Ak čelíte phishingu, zneužitiu značky alebo podvodným objednávkam.',
      'Keď potrebujete praktické príručky pre predstavenstvo, financie a frontline tímy.',
    ];
  }
  return [
    'When onboarding new hires or scaling teams with access to money/data.',
    'After an incident to reduce repeat risk and shorten response time.',
    'Before an audit or investment, or when onboarding a major client (TPRM/AML requirements).',
    'If you face phishing, brand abuse, or fraudulent orders.',
    'When you need practical playbooks for the board, finance, and frontline teams.',
  ];
};

export default function HomePage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = getTranslations(locale);
  const faqSections = getFaqSections(locale);
  const trainingTopics = getTrainingTopics(locale);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-cyan-500' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', gradient: 'from-cyan-500 to-blue-500' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-500' },
      rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', gradient: 'from-rose-500 to-pink-500' },
      indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', gradient: 'from-indigo-500 to-purple-500' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-indigo-500' },
      teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-cyan-500' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', gradient: 'from-orange-500 to-amber-500' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', gradient: 'from-green-500 to-emerald-500' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', gradient: 'from-red-500 to-rose-500' },
      slate: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', gradient: 'from-slate-500 to-gray-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]" />
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
            <div className="text-center space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">{t.hero.badge}</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                  <span className="text-white">{t.hero.title1} </span>
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {t.hero.titleHighlight}
                  </span>
                  <span className="text-white"> {t.hero.title2}</span>
                </h1>

                <p
                  className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t.hero.description.replace(/<strong>/g, '<strong class="text-white">') }}
                />
              </div>

              {/* Search Bar */}
              <div className="max-w-3xl mx-auto pt-6">
                <form onSubmit={handleSearch} className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300" />

                  {/* Search Container */}
                  <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-2 flex items-center gap-2 border border-white/10">
                    <Search className="w-6 h-6 text-blue-300 ml-4 flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder={t.hero.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-0 text-white placeholder-blue-300/50 outline-none text-base sm:text-lg py-4 focus:ring-0 focus-visible:ring-0"
                    />
                    <Button
                      type="submit"
                      className="px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">{t.hero.search}</span>
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </form>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t.hero.records}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t.hero.sources}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t.hero.realtime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t.hero.free}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DATABASE STATS SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
                <Database className="w-4 h-4" />
                {t.database.badge}
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-8">
                {t.database.title}
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                {t.database.description}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
                {t.database.note}
              </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {[
                { value: '612M+', label: t.database.maliciousIPs },
                { value: '12M+', label: t.database.stolenVehicles },
                { value: '9M+', label: t.database.phishingURLs },
                { value: '6.7M+', label: t.database.dissolvedCompanies },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                >
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-3 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Category Header */}
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              {t.database.categoriesTitle}
            </h3>

            {/* Category Tables Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
              {getDatabaseCategories(locale).map((category) => {
                const Icon = category.icon;
                const colors = getColorClasses(category.color);
                return (
                  <div
                    key={category.title}
                    className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">
                        {category.title}
                      </h4>
                    </div>

                    <div className="space-y-4 mb-6">
                      {category.stats.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</span>
                          <span className="text-lg font-light text-slate-900 dark:text-white">{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                      Sources: {category.sources}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Total Database Coverage */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-10 sm:p-14 shadow-2xl">
              {/* Background Orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-10 uppercase tracking-wider">
                  {t.database.totalCoverage}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
                  {[
                    { value: '640M+', label: t.database.totalRecords },
                    { value: '130+', label: t.database.dataSources },
                    { value: '8', label: t.database.categories },
                    { value: '24/7', label: t.database.realtimeAccess },
                    { value: '5 min', label: t.database.updateFreq },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sources Footer */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-5xl mx-auto leading-relaxed">
                {t.database.sourcesFooter}
              </p>
            </div>
          </div>
        </section>

        {/* ==================== FAQ SECTIONS ==================== */}
        <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="space-y-8">
              {faqSections.map((section) => {
                const Icon = section.icon;
                const colors = getColorClasses(section.color);
                const isExpanded = expandedFaq === section.id;

                return (
                  <div
                    key={section.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? 'border-blue-300 dark:border-blue-700 shadow-xl'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg'
                    } bg-white dark:bg-slate-900`}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : section.id)}
                      className="w-full p-8 sm:p-10 text-left flex items-start gap-6"
                    >
                      <div className={`flex-shrink-0 p-4 rounded-xl ${colors.bg}`}>
                        <Icon className={`h-7 w-7 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`flex-shrink-0 w-6 h-6 text-slate-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-8 sm:px-10 pb-10 pt-0">
                        <div className="pl-[76px] sm:pl-[88px]">
                          <div className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== ROADMAP SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t.roadmap.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
                {t.roadmap.description}
              </p>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">{t.roadmap.feature}</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">{t.roadmap.status}</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-white uppercase tracking-wider">{t.roadmap.complete}</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">{t.roadmap.whatFor}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {getRoadmapFeatures(locale).map((feature, index) => (
                    <tr
                      key={feature.name}
                      className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900/50'
                      } hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors`}
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-900 dark:text-white">
                        {feature.name}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                            feature.status === 'functional'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : feature.status === 'development'
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {feature.status === 'functional'
                            ? t.roadmap.functional
                            : feature.status === 'development'
                            ? t.roadmap.inDevelopment
                            : t.roadmap.planned}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                            feature.progress === 100
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : feature.progress === 0
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {feature.progress}%
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status Legend */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t.roadmap.functional}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t.roadmap.inDevelopment}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t.roadmap.planned}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SERVICES SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t.services.title}
              </h2>
            </div>

            {/* Service Cards */}
            <div className="space-y-16">
              {/* Fraud Recovery Services */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-rose-600 to-red-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    {t.services.recovery.title}
                  </h3>
                  <p className="text-lg text-rose-100 leading-relaxed max-w-3xl">
                    {t.services.recovery.description}
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.services.included}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {getRecoveryFeatures(locale).map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                            <Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-slate-900 dark:bg-slate-800">
                    <h4 className="text-lg font-bold text-white mb-4">{t.services.when}</h4>
                    <ul className="space-y-3">
                      {getRecoveryWhenSuitable(locale).map((text, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-center">
                    <div className="mb-6">
                      <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">€600</span>
                      <p className="text-slate-400 mt-2">{t.services.recovery.priceNote}</p>
                    </div>
                    <p className="text-sm text-slate-400 mb-8 max-w-2xl mx-auto">
                      {t.services.recovery.priceDesc}
                    </p>
                    <Link
                      href={`/${locale}/money-recovery`}
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-lg font-semibold shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-105"
                    >
                      {t.services.recovery.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Due Diligence Services */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    {t.services.dueDiligence.title}
                  </h3>
                  <p className="text-lg text-blue-100 leading-relaxed max-w-3xl">
                    {t.services.dueDiligence.description}
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.services.included}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {getDueDiligenceFeatures(locale).map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.services.when}</h4>
                    <ul className="space-y-3">
                      {getDueDiligenceWhenSuitable(locale).map((text, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href={`/${locale}/verify-serviceproduct`}
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg font-semibold shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                    >
                      {t.services.dueDiligence.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Corporate Investigations */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    {t.services.investigation.title}
                  </h3>
                  <p className="text-lg text-purple-100 leading-relaxed max-w-3xl">
                    {t.services.investigation.description}
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.services.included}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {getInvestigationFeatures(locale).map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-purple-50 dark:bg-purple-950/30">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.services.when}</h4>
                    <ul className="space-y-3">
                      {getInvestigationWhenSuitable(locale).map((text, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href={`/${locale}/scammer-removal`}
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg font-semibold shadow-xl shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                    >
                      {t.services.investigation.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Security Training & Consulting */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    {t.services.training.title}
                  </h3>
                  <p className="text-lg text-emerald-100 leading-relaxed max-w-3xl">
                    {t.services.training.description}
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.services.included}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {getTrainingFeatures(locale).map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.services.when}</h4>
                    <ul className="space-y-3">
                      {getTrainingWhenSuitable(locale).map((text, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href={`/${locale}/training-courses`}
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-semibold shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                    >
                      {t.services.training.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== BOOK CONSULTATION SECTION ==================== */}
        <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {/* Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-10">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">{t.consultation.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t.consultation.title}
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t.consultation.description}
            </p>

            <Link
              href={`/${locale}/contact-us`}
              className="group inline-flex items-center gap-3 px-12 py-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white text-xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-300 hover:scale-105"
            >
              {t.consultation.cta}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* ==================== FREE TRAINING SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8">
                <GraduationCap className="w-4 h-4" />
                {t.freeTraining.badge}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t.freeTraining.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                {t.freeTraining.description}
              </p>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                {t.freeTraining.topicsTitle}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trainingTopics.map((topic) => (
                  <div
                    key={topic}
                    className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-300"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/training-courses`}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-semibold shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
              >
                {t.freeTraining.cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== CERTIFICATIONS SECTION ==================== */}
        <section className="py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <p className="text-center text-slate-600 dark:text-slate-400 mb-10">
              {t.certifications.description}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Image
                  key={num}
                  src={`/images/cert-${num}.png`}
                  alt={`Certification ${num}`}
                  width={100}
                  height={50}
                  className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
