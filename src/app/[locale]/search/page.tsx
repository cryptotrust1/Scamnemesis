'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { SearchFiltersComponent, type SearchFilters } from '@/components/search/search-filters';
import { ReportList, type Report } from '@/components/search/report-list';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Search,
  FileText,
  Users,
  Globe,
  Database,
  Lock,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Target,
  Link2,
  Mail,
  Phone,
  CreditCard,
  Building,
  User,
  Car,
  Bitcoin,
  ArrowRight,
  Fingerprint,
  Bug,
  Landmark,
  ShoppingBag,
  Briefcase,
  UserCog,
  TrendingDown,
} from 'lucide-react';

type Locale = 'en' | 'sk' | 'cs' | 'de';

// Translations
const getTranslations = (locale: Locale) => {
  const t = {
    en: {
      badge: 'Most Advanced Scam Detection Platform',
      heroTitle: 'Free Scam Checker — Verify People, Websites, Phone Numbers, Emails, Bank Accounts & Crypto + more',
      heroSubtitle: "Welcome to the most advanced platform for scam detection and prevention. Paste a URL, phone number, email, bank account, wallet address, or a person's name to run a real-time check. Get results in seconds.",
      dataSources: 'Data Sources',
      records: 'Records',
      searchTypes: 'Search Types',
      realtimeUpdates: 'Real-time Updates',
      startFreeSearch: 'Start Free Search',
      communityAccessRequired: 'Community Access Required',
      communityAccessDesc: 'To comply with GDPR regulations, you need to join our community before searching our database. This helps us maintain legal access to shared fraud information while protecting privacy rights.',
      joinCommunity: 'Join Community',
      aboutPlatform: 'About Our Platform',
      firstPlatform: 'The First Platform of Its Kind',
      platformDesc1: "We're a platform that systematically collects and analyzes data on scams and scammers. As the first of its kind, we combine investigative work with modern technology to detect and prevent fraud.",
      platformDesc2: "We tap into 130+ data sources, look for patterns, and link recurring schemes across cases. Anyone who's been scammed can report their case safely — even anonymously. That helps us connect victims to one another and to existing case files faster, moving investigations forward.",
      platformDesc3: "We give you an easy way to vet partners, companies, websites, social profiles, phone numbers, bank accounts, and crypto wallets — before you commit to an investment, a deal, or a relationship. Join us and help make the internet a safer place.",
      websites: 'Websites',
      urlDomainCheck: 'URL & Domain check',
      people: 'People',
      nameVerification: 'Name verification',
      phone: 'Phone',
      numberLookup: 'Number lookup',
      email: 'Email',
      addressSearch: 'Address search',
      bank: 'Bank',
      ibanAccount: 'IBAN & Account',
      crypto: 'Crypto',
      walletAddress: 'Wallet address',
      company: 'Company',
      businessCheck: 'Business check',
      vehicle: 'Vehicle',
      licensePlate: 'License plate',
      howToVerify: 'How to Verify a Company, Person, or Domain Before You Trust',
      step1Title: 'Search',
      step1Desc: 'Enter an identifier for the person or entity you want to check—such as a name, email, phone number, domain/URL, IBAN, social media handle, license plate number, etc. The more identifiers you try, the better your chances of finding a match.',
      filterBy: 'You can also filter by:',
      date: 'Date',
      country: 'Country',
      caseType: 'Case Type',
      step2Title: 'Results',
      step2Desc: "If the system finds a match, it will show results sorted by how closely they match your query. The best matches appear at the top; similarity decreases as you scroll. We recommend reviewing several results, especially when you're dealing with common names or incomplete data.",
      matchScore: 'Match Score',
      step3Title: 'Case Details & Safe Communication',
      step3Desc: 'Clicking a result opens a report with all available information. Some sensitive fields may be blurred for legal and safety reasons. You can comment on a case and discuss it with other victims.',
      stayAnonymous: 'Stay Anonymous',
      stayAnonymousDesc: "Don't share your real name or phone number. Communicate only on the platform.",
      autoLinkedCases: 'Auto-Linked Cases',
      autoLinkedDesc: 'Our system automatically links cases that share the same identifiers (e.g., email, name, phone number, domain). You can navigate those connections and explore related cases. Security is in your hands. — ScamNemesis',
      searchDatabase: 'Search Our Database',
      searchDatabaseDesc: 'Browse reported scams and protect yourself from fraudsters',
      found: 'Found',
      of: 'of',
      results: 'results',
      sort: 'Sort:',
      newest: 'Newest',
      oldest: 'Oldest',
      amountDesc: 'Amount (desc)',
      amountAsc: 'Amount (asc)',
      relevance: 'Relevance',
      moreInfo: 'More Information',
      fieldMapTitle: 'ScamNemesis – Field Map & Rules',
      fieldMapDesc: "Overview of all fields in the system, their properties, and processing rules. Below you'll find an overview of the data we process, how it's organized, and which identifiers you can search for.",
      showFieldMap: 'Show Field Map Table',
      hideFieldMap: 'Hide Field Map Table',
      scamCategories: 'Scam Categories',
      commonScams: 'Most Common Types of Scams',
      commonScamsDesc: "Here you'll find a list of the most common scams with brief explanations of how they work—so you can categorize cases and search more easily.",
      scamTypes: 'scam types',
      readyToVerify: 'Ready to Verify?',
      readyDesc: 'Start your free search now and protect yourself from scams. Join thousands of users who trust ScamNemesis for fraud detection.',
      reportScam: 'Report a Scam',
    },
    de: {
      badge: 'Fortschrittlichste Plattform zur Betrugserkennung',
      heroTitle: 'Kostenloser Betrugscheck — Überprüfen Sie Personen, Websites, Telefonnummern, E-Mails, Bankkonten & Krypto + mehr',
      heroSubtitle: 'Willkommen auf der fortschrittlichsten Plattform zur Betrugserkennung und -prävention. Fügen Sie eine URL, Telefonnummer, E-Mail, Bankkonto, Wallet-Adresse oder einen Namen ein, um eine Echtzeit-Überprüfung durchzuführen. Erhalten Sie Ergebnisse in Sekunden.',
      dataSources: 'Datenquellen',
      records: 'Datensätze',
      searchTypes: 'Suchtypen',
      realtimeUpdates: 'Echtzeit-Updates',
      startFreeSearch: 'Kostenlose Suche starten',
      communityAccessRequired: 'Community-Zugang erforderlich',
      communityAccessDesc: 'Um die DSGVO-Vorschriften einzuhalten, müssen Sie unserer Community beitreten, bevor Sie unsere Datenbank durchsuchen können. Dies hilft uns, den legalen Zugang zu geteilten Betrugsinformationen zu gewährleisten und gleichzeitig die Datenschutzrechte zu schützen.',
      joinCommunity: 'Community beitreten',
      aboutPlatform: 'Über unsere Plattform',
      firstPlatform: 'Die erste Plattform ihrer Art',
      platformDesc1: 'Wir sind eine Plattform, die systematisch Daten über Betrug und Betrüger sammelt und analysiert. Als erste ihrer Art kombinieren wir investigative Arbeit mit moderner Technologie, um Betrug zu erkennen und zu verhindern.',
      platformDesc2: 'Wir nutzen über 130 Datenquellen, suchen nach Mustern und verknüpfen wiederkehrende Schemata über verschiedene Fälle hinweg. Jeder, der betrogen wurde, kann seinen Fall sicher melden — auch anonym. Das hilft uns, Opfer miteinander und mit bestehenden Fallakten schneller zu verbinden und Ermittlungen voranzutreiben.',
      platformDesc3: 'Wir bieten Ihnen eine einfache Möglichkeit, Partner, Unternehmen, Websites, Social-Media-Profile, Telefonnummern, Bankkonten und Krypto-Wallets zu überprüfen — bevor Sie sich auf eine Investition, ein Geschäft oder eine Beziehung einlassen. Schließen Sie sich uns an und helfen Sie, das Internet sicherer zu machen.',
      websites: 'Websites',
      urlDomainCheck: 'URL- & Domain-Prüfung',
      people: 'Personen',
      nameVerification: 'Namensverifizierung',
      phone: 'Telefon',
      numberLookup: 'Nummernsuche',
      email: 'E-Mail',
      addressSearch: 'Adresssuche',
      bank: 'Bank',
      ibanAccount: 'IBAN & Konto',
      crypto: 'Krypto',
      walletAddress: 'Wallet-Adresse',
      company: 'Unternehmen',
      businessCheck: 'Unternehmenscheck',
      vehicle: 'Fahrzeug',
      licensePlate: 'Kennzeichen',
      howToVerify: 'So überprüfen Sie ein Unternehmen, eine Person oder eine Domain, bevor Sie vertrauen',
      step1Title: 'Suchen',
      step1Desc: 'Geben Sie einen Identifikator für die Person oder Einheit ein, die Sie überprüfen möchten — wie Name, E-Mail, Telefonnummer, Domain/URL, IBAN, Social-Media-Handle, Kennzeichen usw. Je mehr Identifikatoren Sie ausprobieren, desto besser sind Ihre Chancen, eine Übereinstimmung zu finden.',
      filterBy: 'Sie können auch filtern nach:',
      date: 'Datum',
      country: 'Land',
      caseType: 'Falltyp',
      step2Title: 'Ergebnisse',
      step2Desc: 'Wenn das System eine Übereinstimmung findet, werden die Ergebnisse nach ihrer Ähnlichkeit mit Ihrer Anfrage sortiert angezeigt. Die besten Übereinstimmungen erscheinen oben; die Ähnlichkeit nimmt beim Scrollen ab. Wir empfehlen, mehrere Ergebnisse zu überprüfen, besonders bei häufigen Namen oder unvollständigen Daten.',
      matchScore: 'Übereinstimmung',
      step3Title: 'Falldetails & sichere Kommunikation',
      step3Desc: 'Durch Klicken auf ein Ergebnis öffnet sich ein Bericht mit allen verfügbaren Informationen. Einige sensible Felder können aus rechtlichen und Sicherheitsgründen unscharf dargestellt werden. Sie können einen Fall kommentieren und mit anderen Opfern diskutieren.',
      stayAnonymous: 'Bleiben Sie anonym',
      stayAnonymousDesc: 'Teilen Sie nicht Ihren echten Namen oder Ihre Telefonnummer. Kommunizieren Sie nur auf der Plattform.',
      autoLinkedCases: 'Automatisch verknüpfte Fälle',
      autoLinkedDesc: 'Unser System verknüpft automatisch Fälle, die dieselben Identifikatoren teilen (z.B. E-Mail, Name, Telefonnummer, Domain). Sie können diesen Verbindungen folgen und verwandte Fälle erkunden. Sicherheit liegt in Ihren Händen. — ScamNemesis',
      searchDatabase: 'Unsere Datenbank durchsuchen',
      searchDatabaseDesc: 'Durchsuchen Sie gemeldete Betrugsfälle und schützen Sie sich vor Betrügern',
      found: 'Gefunden',
      of: 'von',
      results: 'Ergebnissen',
      sort: 'Sortieren:',
      newest: 'Neueste',
      oldest: 'Älteste',
      amountDesc: 'Betrag (abst.)',
      amountAsc: 'Betrag (aufst.)',
      relevance: 'Relevanz',
      moreInfo: 'Weitere Informationen',
      fieldMapTitle: 'ScamNemesis – Feldübersicht & Regeln',
      fieldMapDesc: 'Übersicht aller Felder im System, ihrer Eigenschaften und Verarbeitungsregeln. Unten finden Sie eine Übersicht der Daten, die wir verarbeiten, wie sie organisiert sind und nach welchen Identifikatoren Sie suchen können.',
      showFieldMap: 'Feldtabelle anzeigen',
      hideFieldMap: 'Feldtabelle ausblenden',
      scamCategories: 'Betrugskategorien',
      commonScams: 'Häufigste Betrugsarten',
      commonScamsDesc: 'Hier finden Sie eine Liste der häufigsten Betrugsfälle mit kurzen Erklärungen, wie sie funktionieren — damit Sie Fälle kategorisieren und einfacher suchen können.',
      scamTypes: 'Betrugsarten',
      readyToVerify: 'Bereit zur Überprüfung?',
      readyDesc: 'Starten Sie jetzt Ihre kostenlose Suche und schützen Sie sich vor Betrug. Schließen Sie sich Tausenden von Nutzern an, die ScamNemesis für die Betrugserkennung vertrauen.',
      reportScam: 'Betrug melden',
    },
    sk: {
      badge: 'Najpokročilejšia platforma na detekciu podvodov',
      heroTitle: 'Bezplatná kontrola podvodov — Overte osoby, webstránky, telefónne čísla, e-maily, bankové účty a krypto + viac',
      heroSubtitle: 'Vitajte na najpokročilejšej platforme na detekciu a prevenciu podvodov. Vložte URL, telefónne číslo, e-mail, bankový účet, adresu peňaženky alebo meno osoby pre kontrolu v reálnom čase. Získajte výsledky za sekundy.',
      dataSources: 'Zdroje dát',
      records: 'Záznamov',
      searchTypes: 'Typov vyhľadávania',
      realtimeUpdates: 'Aktualizácie v reálnom čase',
      startFreeSearch: 'Spustiť bezplatné vyhľadávanie',
      communityAccessRequired: 'Vyžaduje sa prístup do komunity',
      communityAccessDesc: 'Pre súlad s GDPR sa musíte pripojiť k našej komunite pred vyhľadávaním v databáze. To nám pomáha udržiavať legálny prístup k zdieľaným informáciám o podvodoch a zároveň chrániť práva na súkromie.',
      joinCommunity: 'Pripojiť sa ku komunite',
      aboutPlatform: 'O našej platforme',
      firstPlatform: 'Prvá platforma svojho druhu',
      platformDesc1: 'Sme platforma, ktorá systematicky zbiera a analyzuje údaje o podvodoch a podvodníkoch. Ako prvá svojho druhu kombinujeme vyšetrovaciu prácu s modernou technológiou na detekciu a prevenciu podvodov.',
      platformDesc2: 'Využívame viac ako 130 zdrojov dát, hľadáme vzory a prepájame opakujúce sa schémy naprieč prípadmi. Každý, kto bol podvedený, môže bezpečne nahlásiť svoj prípad — aj anonymne. To nám pomáha rýchlejšie spájať obete medzi sebou a s existujúcimi spismi.',
      platformDesc3: 'Poskytujeme vám jednoduchý spôsob, ako preveriť partnerov, spoločnosti, webstránky, profily na sociálnych sieťach, telefónne čísla, bankové účty a krypto peňaženky — predtým, ako sa zaviažete k investícii, obchodu alebo vzťahu. Pridajte sa k nám a pomôžte urobiť internet bezpečnejším.',
      websites: 'Webstránky',
      urlDomainCheck: 'Kontrola URL a domény',
      people: 'Ľudia',
      nameVerification: 'Overenie mena',
      phone: 'Telefón',
      numberLookup: 'Vyhľadávanie čísla',
      email: 'E-mail',
      addressSearch: 'Vyhľadávanie adresy',
      bank: 'Banka',
      ibanAccount: 'IBAN a účet',
      crypto: 'Krypto',
      walletAddress: 'Adresa peňaženky',
      company: 'Spoločnosť',
      businessCheck: 'Kontrola firmy',
      vehicle: 'Vozidlo',
      licensePlate: 'ŠPZ',
      howToVerify: 'Ako overiť spoločnosť, osobu alebo doménu predtým, ako jej dôverujete',
      step1Title: 'Vyhľadávanie',
      step1Desc: 'Zadajte identifikátor osoby alebo subjektu, ktorý chcete skontrolovať — ako meno, e-mail, telefónne číslo, doménu/URL, IBAN, handle na sociálnych sieťach, ŠPZ atď. Čím viac identifikátorov vyskúšate, tým väčšia šanca nájsť zhodu.',
      filterBy: 'Môžete tiež filtrovať podľa:',
      date: 'Dátum',
      country: 'Krajina',
      caseType: 'Typ prípadu',
      step2Title: 'Výsledky',
      step2Desc: 'Ak systém nájde zhodu, zobrazí výsledky zoradené podľa podobnosti s vaším dotazom. Najlepšie zhody sa zobrazujú hore; podobnosť klesá pri posúvaní. Odporúčame skontrolovať viacero výsledkov, najmä pri bežných menách alebo neúplných údajoch.',
      matchScore: 'Skóre zhody',
      step3Title: 'Detaily prípadu a bezpečná komunikácia',
      step3Desc: 'Kliknutím na výsledok sa otvorí hlásenie so všetkými dostupnými informáciami. Niektoré citlivé polia môžu byť rozmazané z právnych a bezpečnostných dôvodov. Môžete komentovať prípad a diskutovať s inými obeťami.',
      stayAnonymous: 'Zostaňte v anonymite',
      stayAnonymousDesc: 'Nezdieľajte svoje skutočné meno ani telefónne číslo. Komunikujte iba na platforme.',
      autoLinkedCases: 'Automaticky prepojené prípady',
      autoLinkedDesc: 'Náš systém automaticky prepája prípady, ktoré zdieľajú rovnaké identifikátory (napr. e-mail, meno, telefónne číslo, doménu). Môžete prechádzať tieto prepojenia a skúmať súvisiace prípady. Bezpečnosť je vo vašich rukách. — ScamNemesis',
      searchDatabase: 'Prehľadať našu databázu',
      searchDatabaseDesc: 'Prehliadajte nahlásené podvody a chráňte sa pred podvodníkmi',
      found: 'Nájdených',
      of: 'z',
      results: 'výsledkov',
      sort: 'Zoradiť:',
      newest: 'Najnovšie',
      oldest: 'Najstaršie',
      amountDesc: 'Suma (zostup.)',
      amountAsc: 'Suma (vzostup.)',
      relevance: 'Relevancia',
      moreInfo: 'Ďalšie informácie',
      fieldMapTitle: 'ScamNemesis – Mapa polí a pravidlá',
      fieldMapDesc: 'Prehľad všetkých polí v systéme, ich vlastností a pravidiel spracovania. Nižšie nájdete prehľad údajov, ktoré spracúvame, ako sú organizované a podľa akých identifikátorov môžete vyhľadávať.',
      showFieldMap: 'Zobraziť tabuľku polí',
      hideFieldMap: 'Skryť tabuľku polí',
      scamCategories: 'Kategórie podvodov',
      commonScams: 'Najčastejšie typy podvodov',
      commonScamsDesc: 'Tu nájdete zoznam najčastejších podvodov s krátkymi vysvetleniami, ako fungujú — aby ste mohli kategorizovať prípady a jednoduchšie vyhľadávať.',
      scamTypes: 'typov podvodov',
      readyToVerify: 'Pripravení na overenie?',
      readyDesc: 'Spustite teraz bezplatné vyhľadávanie a chráňte sa pred podvodmi. Pridajte sa k tisícom používateľov, ktorí dôverujú ScamNemesis pri detekcii podvodov.',
      reportScam: 'Nahlásiť podvod',
    },
    cs: {
      badge: 'Nejpokročilejší platforma pro detekci podvodů',
      heroTitle: 'Bezplatná kontrola podvodů — Ověřte osoby, webové stránky, telefonní čísla, e-maily, bankovní účty a krypto + více',
      heroSubtitle: 'Vítejte na nejpokročilejší platformě pro detekci a prevenci podvodů. Vložte URL, telefonní číslo, e-mail, bankovní účet, adresu peněženky nebo jméno osoby pro kontrolu v reálném čase. Získejte výsledky za sekundy.',
      dataSources: 'Zdroje dat',
      records: 'Záznamů',
      searchTypes: 'Typů vyhledávání',
      realtimeUpdates: 'Aktualizace v reálném čase',
      startFreeSearch: 'Spustit bezplatné vyhledávání',
      communityAccessRequired: 'Vyžaduje se přístup do komunity',
      communityAccessDesc: 'Pro soulad s GDPR se musíte připojit k naší komunitě před vyhledáváním v databázi. To nám pomáhá udržovat legální přístup ke sdíleným informacím o podvodech a zároveň chránit práva na soukromí.',
      joinCommunity: 'Připojit se ke komunitě',
      aboutPlatform: 'O naší platformě',
      firstPlatform: 'První platforma svého druhu',
      platformDesc1: 'Jsme platforma, která systematicky sbírá a analyzuje údaje o podvodech a podvodnících. Jako první svého druhu kombinujeme vyšetřovací práci s moderní technologií k detekci a prevenci podvodů.',
      platformDesc2: 'Využíváme více než 130 zdrojů dat, hledáme vzory a propojujeme opakující se schémata napříč případy. Každý, kdo byl podveden, může bezpečně nahlásit svůj případ — i anonymně. To nám pomáhá rychleji spojovat oběti mezi sebou a s existujícími spisy.',
      platformDesc3: 'Poskytujeme vám jednoduchý způsob, jak prověřit partnery, společnosti, webové stránky, profily na sociálních sítích, telefonní čísla, bankovní účty a krypto peněženky — předtím, než se zavážete k investici, obchodu nebo vztahu. Přidejte se k nám a pomozte učinit internet bezpečnějším.',
      websites: 'Webové stránky',
      urlDomainCheck: 'Kontrola URL a domény',
      people: 'Lidé',
      nameVerification: 'Ověření jména',
      phone: 'Telefon',
      numberLookup: 'Vyhledávání čísla',
      email: 'E-mail',
      addressSearch: 'Vyhledávání adresy',
      bank: 'Banka',
      ibanAccount: 'IBAN a účet',
      crypto: 'Krypto',
      walletAddress: 'Adresa peněženky',
      company: 'Společnost',
      businessCheck: 'Kontrola firmy',
      vehicle: 'Vozidlo',
      licensePlate: 'SPZ',
      howToVerify: 'Jak ověřit společnost, osobu nebo doménu předtím, než jí důvěřujete',
      step1Title: 'Vyhledávání',
      step1Desc: 'Zadejte identifikátor osoby nebo subjektu, který chcete zkontrolovat — jako jméno, e-mail, telefonní číslo, doménu/URL, IBAN, handle na sociálních sítích, SPZ atd. Čím více identifikátorů vyzkoušíte, tím větší šance najít shodu.',
      filterBy: 'Můžete také filtrovat podle:',
      date: 'Datum',
      country: 'Země',
      caseType: 'Typ případu',
      step2Title: 'Výsledky',
      step2Desc: 'Pokud systém najde shodu, zobrazí výsledky seřazené podle podobnosti s vaším dotazem. Nejlepší shody se zobrazují nahoře; podobnost klesá při posouvání. Doporučujeme zkontrolovat více výsledků, zejména u běžných jmen nebo neúplných údajů.',
      matchScore: 'Skóre shody',
      step3Title: 'Detaily případu a bezpečná komunikace',
      step3Desc: 'Kliknutím na výsledek se otevře hlášení se všemi dostupnými informacemi. Některá citlivá pole mohou být rozmazaná z právních a bezpečnostních důvodů. Můžete komentovat případ a diskutovat s dalšími oběťmi.',
      stayAnonymous: 'Zůstaňte v anonymitě',
      stayAnonymousDesc: 'Nesdílejte své skutečné jméno ani telefonní číslo. Komunikujte pouze na platformě.',
      autoLinkedCases: 'Automaticky propojené případy',
      autoLinkedDesc: 'Náš systém automaticky propojuje případy, které sdílejí stejné identifikátory (např. e-mail, jméno, telefonní číslo, doménu). Můžete procházet tato propojení a zkoumat související případy. Bezpečnost je ve vašich rukou. — ScamNemesis',
      searchDatabase: 'Prohledat naši databázi',
      searchDatabaseDesc: 'Procházejte nahlášené podvody a chraňte se před podvodníky',
      found: 'Nalezeno',
      of: 'z',
      results: 'výsledků',
      sort: 'Řadit:',
      newest: 'Nejnovější',
      oldest: 'Nejstarší',
      amountDesc: 'Částka (sest.)',
      amountAsc: 'Částka (vzest.)',
      relevance: 'Relevance',
      moreInfo: 'Další informace',
      fieldMapTitle: 'ScamNemesis – Mapa polí a pravidla',
      fieldMapDesc: 'Přehled všech polí v systému, jejich vlastností a pravidel zpracování. Níže najdete přehled údajů, které zpracováváme, jak jsou organizovány a podle jakých identifikátorů můžete vyhledávat.',
      showFieldMap: 'Zobrazit tabulku polí',
      hideFieldMap: 'Skrýt tabulku polí',
      scamCategories: 'Kategorie podvodů',
      commonScams: 'Nejčastější typy podvodů',
      commonScamsDesc: 'Zde najdete seznam nejčastějších podvodů s krátkými vysvětleními, jak fungují — abyste mohli kategorizovat případy a jednodušeji vyhledávat.',
      scamTypes: 'typů podvodů',
      readyToVerify: 'Připraveni k ověření?',
      readyDesc: 'Spusťte nyní bezplatné vyhledávání a chraňte se před podvody. Přidejte se k tisícům uživatelů, kteří důvěřují ScamNemesis při detekci podvodů.',
      reportScam: 'Nahlásit podvod',
    },
  };
  return t[locale] || t.en;
};

// JSON-LD Schemas
const jsonLdSchemas = {
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Scam Checker - Verify People, Websites & Businesses',
    applicationCategory: 'SecurityApplication',
    applicationSubCategory: 'Fraud Detection',
    url: 'https://scamnemesis.com/search',
    description: 'Free scam detection and verification tool. Search our database to verify people, websites, phone numbers, emails, bank accounts, and cryptocurrency wallets for scams and fraud.',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Phone number scam verification',
      'Email address fraud detection',
      'Website legitimacy checker',
      'Person/business verification',
      'Bank account scam lookup',
      'Cryptocurrency wallet verification',
      'Real-time scam database search',
      'Community-reported fraud alerts',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2547',
      bestRating: '5',
      worstRating: '1',
    },
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
    logo: 'https://scamnemesis.com/images/logo.png',
    description: 'ScamNemesis is a free scam detection platform helping users verify and report fraudulent activities across multiple channels.',
    sameAs: [
      'https://www.facebook.com/scamnemesis',
      'https://twitter.com/scamnemesis',
      'https://www.linkedin.com/company/scamnemesis',
    ],
  },
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the scam checker work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our scam checker searches our comprehensive database of reported scams, fraudulent activities, and verified entities. Simply enter a phone number, email, website, name, bank account, or crypto wallet to check if it has been reported as a scam.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of scams can I check?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can verify phone numbers, email addresses, websites, people and businesses, bank accounts, and cryptocurrency wallets. Our database includes romance scams, phishing attempts, investment fraud, crypto scams, and more.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the scam checker really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, our basic scam verification service is completely free. You can search our database unlimited times at no cost to protect yourself from fraud.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I report a scam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Click the Report Scam button, select the scam type, provide details including contact information, description, and any evidence. Your report helps protect others in our community.',
        },
      },
    ],
  },
  howTo: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Verify if Someone is a Scammer',
    description: 'Step-by-step guide to check if a person, phone number, or business is involved in scams',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enter Information',
        text: 'Enter the phone number, email, website, or name you want to verify in the search box',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Review Results',
        text: 'Check the database results for any reported scams, sorted by relevance',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Analyze Case Details',
        text: 'Open detailed reports and connect with other victims through secure comments',
        position: 3,
      },
    ],
    totalTime: 'PT2M',
  },
  breadcrumbList: {
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
        name: 'Scam Checker',
        item: 'https://scamnemesis.com/search',
      },
    ],
  },
};

// Field Map data
const fieldMapData = [
  { field: 'Type of Fraud', required: true, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Incident Date', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Transaction Date', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Brief Summary', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Detailed Description', required: true, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Financial Loss (amount, currency)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Incident Location (street, city, postal code, country)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Full name (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Nickname / alias / username (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Approximate age (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Nationality (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Physical description (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Phone (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Email (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Address (street, city, postal code, country) (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Telegram', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'WhatsApp', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Signal', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Instagram', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Facebook (name/URL)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'TikTok', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'X (Twitter)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Website URL', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Domain name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Domain creation date', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'IP address', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'IP country', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'ISP (provider)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'IP Abuse Score (0–100)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'IBAN', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Account holder name', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Account Number', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Bank Name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Bank Country', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'SWIFT/BIC Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Routing Number', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'BSB Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Sort Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'IFSC Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'CNAPS Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Other Banking Details', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Wallet Address', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Blockchain', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Exchange/Wallet Name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Transaction Hash', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'PayPal Account', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Company Name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'VAT/Tax ID', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Company Address (street, city, postal code, country)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Vehicle Make (Brand)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Car Model', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Car Color', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'License Plate', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'VIN Number', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Registered Owner', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Payment Evidence', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Fraudster Photos', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Screenshots', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Damage Documentation', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Crime Scene Photos', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Other Evidence', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Victim Name', required: true, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Victim Email Address', required: true, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Victim Phone Number', required: false, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Victim Additional Information', required: false, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
];

// Scam categories
const scamCategories = [
  {
    id: 'phishing',
    title: 'Phishing & Social Engineering',
    icon: Fingerprint,
    color: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    types: [
      { title: 'Phishing', slug: 'phishing', description: 'Deceptive emails or messages impersonating trusted brands to steal passwords and sensitive data. The most common online fraud globally.' },
      { title: 'Vishing', slug: 'vishing', description: 'Phone-based social engineering. Callers pose as bank staff, police, or IT support to pressure you into revealing credentials or approving payments.' },
      { title: 'Smishing', slug: 'smishing', description: 'Fraudulent SMS with links to fake login pages. Often spoof courier services, banks, or government offices to harvest one-time codes.' },
      { title: 'Romance Scam', slug: 'romance_scam', description: 'Criminals build trust through fake online relationships and then request money for fabricated emergencies. Typical losses reach tens of thousands.' },
      { title: 'Identity Spoofing', slug: 'identity_spoofing', description: 'Attackers impersonate celebrities, executives, or your contacts on social media to solicit money or push malicious links.' },
    ],
  },
  {
    id: 'investment',
    title: 'Investment & Online Financial Fraud',
    icon: TrendingDown,
    color: 'from-red-500 to-pink-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    types: [
      { title: 'Crypto Investment Scam', slug: 'crypto_investment', description: 'Fake platforms promise guaranteed returns. Once funds are deposited, access is blocked and "profits" are fabricated.' },
      { title: 'Forex/Stocks Fraud', slug: 'forex_stock', description: 'Unlicensed brokers and "advisors" lure victims into high-risk trading. Gains are fictitious; withdrawals are blocked.' },
      { title: 'Ponzi Scheme', slug: 'ponzi_scheme', description: 'Older investors are paid with funds from new ones. The scheme collapses when inflows slow down.' },
      { title: 'Pyramid Scheme', slug: 'pyramid_scheme', description: 'Illegal models where revenue depends on recruiting members, not selling real products. Most participants lose money.' },
    ],
  },
  {
    id: 'malware',
    title: 'Malware & Technical Scams',
    icon: Bug,
    color: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    types: [
      { title: 'Malware Fraud', slug: 'malware', description: 'Malicious apps and attachments steal data, track activity, or enable remote access without your consent.' },
      { title: 'Scareware / Ransomware', slug: 'ransomware', description: 'Ransomware encrypts files and demands payment. Scareware pushes fake virus alerts to sell useless software.' },
      { title: 'Tech Support Scam', slug: 'tech_support', description: 'Fake "technicians" pressure you to grant remote access or pay for fixing non-existent problems.' },
      { title: 'Deepfake Fraud', slug: 'deepfake', description: 'AI-generated audio/video convincingly imitates real people to endorse scams or manipulate decisions.' },
    ],
  },
  {
    id: 'banking',
    title: 'Banking & Financial Crime',
    icon: Landmark,
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    types: [
      { title: 'Credit Card Fraud', slug: 'credit_card_fraud', description: 'Unauthorized online purchases or cash withdrawals using stolen card details or compromised merchants.' },
      { title: 'Identity Theft', slug: 'identity_theft', description: 'Criminals use your personal data to open accounts, take loans, or commit crimes in your name.' },
      { title: 'Loan Scam', slug: 'loan_scam', description: '"Guaranteed" loans that demand upfront fees. After payment, the lender disappears and no loan is issued.' },
      { title: 'Grant/Subsidy Scam', slug: 'grant_scam', description: 'Fraudsters promise "government grants" if you pay administrative fees. Real grants never require advance payments.' },
    ],
  },
  {
    id: 'shopping',
    title: 'Online Sales & Purchase Fraud',
    icon: ShoppingBag,
    color: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    types: [
      { title: 'Online Purchase Scam', slug: 'online_purchase', description: 'You pay for goods that never arrive, or receive items far below the advertised quality—typically on unverified shops.' },
      { title: 'Fake E-shop', slug: 'fake_eshop', description: 'Professional-looking websites mimic well-known brands and offer extreme discounts, then disappear after taking payment.' },
      { title: 'Counterfeit / Low-Quality Goods', slug: 'fake_goods', description: 'Knock-offs or goods drastically worse than advertised, often sold via marketplaces or unregulated shops.' },
      { title: 'Marketplace Fraud', slug: 'online_marketplace', description: 'Scammers post non-existent items, ask for deposits, or send fake payment links. Prefer in-person verified exchanges.' },
    ],
  },
  {
    id: 'employment',
    title: 'Employment & Service-Related Fraud',
    icon: Briefcase,
    color: 'from-amber-500 to-yellow-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    types: [
      { title: 'Job Offer Scam', slug: 'job_offer', description: '"Dream job" offers require upfront training fees or harvest personal data via fake applications.' },
      { title: 'Fake Invoices', slug: 'fake_invoice', description: 'Invoices for services never ordered, often targeting SMEs and freelancers to slip into routine payments.' },
      { title: 'Wage Non-Payment', slug: 'wage_nonpayment', description: 'Employers exploit trial work or projects, then avoid paying. Keep contracts and evidence of work delivered.' },
    ],
  },
  {
    id: 'identity',
    title: 'Online Accounts & Identity',
    icon: UserCog,
    color: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    types: [
      { title: 'Account Verification Scam', slug: 'account_verification', description: 'Fake "Facebook/Instagram" messages urge you to log in to "verify" your account and steal credentials.' },
      { title: 'SIM Swap', slug: 'sim_swap', description: 'Attackers transfer your number to their SIM to intercept 2FA codes and hijack accounts.' },
    ],
  },
];

// Mock data removed - now using real API

// API Response types
interface SearchApiResponse {
  results: Array<{
    id: string;
    public_id: string;
    fraud_type: string;
    summary: string;
    description: string;
    incident_date: string;
    location: {
      country?: string;
      city?: string;
    };
    financial_loss?: {
      amount: number;
      currency: string;
    };
    status: string;
    created_at: string;
    perpetrator?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    match_score: number;
    similar_count?: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  facets?: {
    fraud_types: Array<{ value: string; count: number }>;
    countries: Array<{ value: string; count: number }>;
    statuses: Array<{ value: string; count: number }>;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = getTranslations(locale);
  const initialQuery = searchParams?.get('q') || '';

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    fraudType: 'all',
    country: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    searchMode: 'auto',
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date-desc');
  const [totalResults, setTotalResults] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showFieldMap, setShowFieldMap] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy]);

  const handleSearch = async () => {
    // Require at least 2 characters for search (query is optional when using filters)
    if (filters.query && filters.query.length > 0 && filters.query.length < 2) {
      setSearchError('Zadajte aspoň 2 znaky pre vyhľadávanie');
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.query) {
        params.set('q', filters.query);
      }

      // Set search mode
      params.set('mode', filters.searchMode || 'auto');

      // Pagination - API expects offset, not page
      const pageSize = 10;
      const offset = (currentPage - 1) * pageSize;
      params.set('offset', offset.toString());
      params.set('limit', pageSize.toString());

      // Filters
      if (filters.fraudType && filters.fraudType !== 'all') {
        params.set('fraud_type', filters.fraudType);
      }
      if (filters.country && filters.country !== 'all') {
        params.set('country', filters.country);
      }
      if (filters.dateFrom) {
        params.set('date_from', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set('date_to', filters.dateTo);
      }

      // Sorting
      if (sortBy === 'date-desc') {
        params.set('sort', 'created_at');
        params.set('order', 'desc');
      } else if (sortBy === 'date-asc') {
        params.set('sort', 'created_at');
        params.set('order', 'asc');
      } else if (sortBy === 'amount-desc') {
        params.set('sort', 'financial_loss');
        params.set('order', 'desc');
      } else if (sortBy === 'amount-asc') {
        params.set('sort', 'financial_loss');
        params.set('order', 'asc');
      } else if (sortBy === 'relevance') {
        params.set('sort', 'relevance');
        params.set('order', 'desc');
      }

      // Call the real API
      const response = await fetch(`/api/v1/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Chyba pri vyhľadávaní (${response.status})`);
      }

      const data: SearchApiResponse = await response.json();

      // Transform API response to Report format
      const transformedReports: Report[] = data.results.map((result) => ({
        id: result.public_id || result.id,
        title: result.summary || 'Bez názvu',
        description: result.description || '',
        fraudType: result.fraud_type as Report['fraudType'],
        country: result.location?.country || '',
        city: result.location?.city || '',
        amount: result.financial_loss?.amount,
        currency: result.financial_loss?.currency || 'EUR',
        status: result.status as Report['status'],
        createdAt: result.created_at,
        perpetratorName: result.perpetrator?.name,
        perpetratorPhone: result.perpetrator?.phone,
        perpetratorEmail: result.perpetrator?.email,
        similarReportsCount: result.similar_count,
      }));

      setReports(transformedReports);
      setTotalResults(data.pagination.total);
      setTotalPages(data.pagination.total_pages);

    } catch (error) {
      console.error('[Search] Error:', error);
      setSearchError(error instanceof Error ? error.message : 'Nastala chyba pri vyhľadávaní');
      // Fallback to empty results
      setReports([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      query: '',
      fraudType: 'all',
      country: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      searchMode: 'auto',
    });
    setCurrentPage(1);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.webApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.breadcrumbList) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0E74FF]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E74FF]/20 backdrop-blur-sm border border-[#0E74FF]/30 mb-8">
                <Shield className="h-4 w-4 text-[#0E74FF]" />
                <span className="text-sm font-semibold text-[#0E74FF]">{t.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                {t.heroTitle}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                {t.heroSubtitle}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">130+</div>
                  <div className="text-xs md:text-sm text-slate-400">{t.dataSources}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">612M+</div>
                  <div className="text-xs md:text-sm text-slate-400">{t.records}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">38+</div>
                  <div className="text-xs md:text-sm text-slate-400">{t.searchTypes}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-xs md:text-sm text-slate-400">{t.realtimeUpdates}</div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 transition-all duration-300 hover:scale-105"
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t.startFreeSearch}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Community Access Section */}
        <section className="w-full py-12 md:py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-3">
                    {t.communityAccessRequired}
                  </h2>
                  <p className="text-[#64748b] leading-relaxed mb-4">
                    {t.communityAccessDesc}
                  </p>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Users className="mr-2 h-4 w-4" />
                    {t.joinCommunity}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Description */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/10 border border-[#0E74FF]/20 mb-6">
                    <Database className="h-4 w-4 text-[#0E74FF]" />
                    <span className="text-sm font-semibold text-[#0E74FF]">{t.aboutPlatform}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-6 leading-tight">
                    {t.firstPlatform}
                  </h2>
                  <p className="text-[#64748b] leading-relaxed mb-6">
                    {t.platformDesc1}
                  </p>
                  <p className="text-[#64748b] leading-relaxed mb-6">
                    {t.platformDesc2}
                  </p>
                  <p className="text-[#64748b] leading-relaxed">
                    {t.platformDesc3}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe, label: t.websites, desc: t.urlDomainCheck },
                    { icon: User, label: t.people, desc: t.nameVerification },
                    { icon: Phone, label: t.phone, desc: t.numberLookup },
                    { icon: Mail, label: t.email, desc: t.addressSearch },
                    { icon: CreditCard, label: t.bank, desc: t.ibanAccount },
                    { icon: Bitcoin, label: t.crypto, desc: t.walletAddress },
                    { icon: Building, label: t.company, desc: t.businessCheck },
                    { icon: Car, label: t.vehicle, desc: t.licensePlate },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="group p-5 bg-[#f8fafc] rounded-2xl border border-slate-200 hover:border-[#0E74FF]/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-6 w-6 text-[#0E74FF]" />
                      </div>
                      <h3 className="font-bold text-[#1e293b] mb-1">{item.label}</h3>
                      <p className="text-sm text-[#64748b]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 mb-8 shadow-lg border border-[#0E74FF]/20">
                  <Target className="h-8 w-8 text-[#0E74FF]" />
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6 leading-tight">
                  {t.howToVerify}
                </h2>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden lg:block absolute top-8 left-[16.67%] right-[16.67%] h-1 bg-gradient-to-r from-[#0E74FF] via-[#0E74FF] to-[#0E74FF] rounded-full" />

                <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative mb-6 hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 flex items-center justify-center mb-6 border border-[#0E74FF]/20 shadow-md">
                        <Search className="h-10 w-10 text-[#0E74FF]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">{t.step1Title}</h3>
                      <p className="text-[#64748b] leading-relaxed text-center mb-6">
                        {t.step1Desc}
                      </p>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 w-full">
                        <p className="font-semibold text-[#1e293b] text-sm mb-3 flex items-center gap-2">
                          <Filter className="h-4 w-4 text-[#0E74FF]" />
                          {t.filterBy}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[t.date, t.country, t.caseType].map((f) => (
                            <span key={f} className="px-3 py-1.5 bg-[#0E74FF]/5 text-[#0E74FF] rounded-lg text-xs font-medium border border-[#0E74FF]/20">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative mb-6 hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 flex items-center justify-center mb-6 border border-[#0E74FF]/20 shadow-md">
                        <FileText className="h-10 w-10 text-[#0E74FF]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">{t.step2Title}</h3>
                      <p className="text-[#64748b] leading-relaxed text-center mb-6">
                        {t.step2Desc}
                      </p>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 w-full">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-[#0E74FF] uppercase tracking-wide">{t.matchScore}</span>
                          <span className="text-lg font-bold text-[#0E74FF]">95%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4] rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative mb-6 hover:scale-110 transition-transform duration-300">
                        3
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 flex items-center justify-center mb-6 border border-[#0E74FF]/20 shadow-md">
                        <Shield className="h-10 w-10 text-[#0E74FF]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">{t.step3Title}</h3>
                      <p className="text-[#64748b] leading-relaxed text-center mb-6">
                        {t.step3Desc}
                      </p>
                      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 w-full">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-amber-900 text-sm mb-1">{t.stayAnonymous}</p>
                            <p className="text-amber-800 text-xs leading-relaxed">
                              {t.stayAnonymousDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Link2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e293b] mb-2">{t.autoLinkedCases}</h4>
                    <p className="text-[#64748b] leading-relaxed">
                      {t.autoLinkedDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="search-section" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">{t.searchDatabase}</h2>
              <p className="text-[#64748b] max-w-2xl mx-auto">
                {t.searchDatabaseDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <SearchFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSearch={handleSearch}
                  onReset={handleReset}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3 space-y-6">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t.found} <span className="font-semibold text-foreground">{reports.length}</span> {t.of}{' '}
                      <span className="font-semibold text-foreground">{totalResults}</span> {t.results}
                    </p>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.sort}</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">{t.newest}</SelectItem>
                        <SelectItem value="date-asc">{t.oldest}</SelectItem>
                        <SelectItem value="amount-desc">{t.amountDesc}</SelectItem>
                        <SelectItem value="amount-asc">{t.amountAsc}</SelectItem>
                        <SelectItem value="relevance">{t.relevance}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Error Display */}
                {searchError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <p className="text-red-700">{searchError}</p>
                    </div>
                  </div>
                )}

                {/* Report List */}
                <ReportList reports={reports} isLoading={isLoading} />

                {/* Pagination */}
                {reports.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                        />
                      </PaginationItem>
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Field Map & Rules Section */}
        <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/10 border border-[#0E74FF]/20 mb-6">
                  <Database className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm font-semibold text-[#0E74FF]">{t.moreInfo}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                  {t.fieldMapTitle}
                </h2>
                <p className="text-[#64748b] max-w-3xl mx-auto mb-6">
                  {t.fieldMapDesc}
                </p>

                <button
                  onClick={() => setShowFieldMap(!showFieldMap)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#0E74FF]/30 transition-all duration-300"
                >
                  <span className="font-semibold text-[#1e293b]">
                    {showFieldMap ? t.hideFieldMap : t.showFieldMap}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-[#64748b] transition-transform duration-300 ${showFieldMap ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Legend */}
              {showFieldMap && (
                <>
                  <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-slate-200">
                    <h3 className="font-bold text-[#1e293b] mb-4">Column Definitions & Legend</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">Required</p>
                        <p className="text-xs text-[#64748b]">Indicates whether the field is mandatory when reporting a new case.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">In Report</p>
                        <p className="text-xs text-[#64748b]">Specifies whether this data appears in the generated case report.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">Anonymization</p>
                        <p className="text-xs text-[#64748b]">Some sensitive data is automatically anonymized, but you can still search it.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">Search</p>
                        <p className="text-xs text-[#64748b]">Indicates which data can be searched directly vs. via filters.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" /> Yes
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" /> No
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                        <Filter className="h-3.5 w-3.5" /> Filter only
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        <Eye className="h-3.5 w-3.5" /> PUBLIC
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        <EyeOff className="h-3.5 w-3.5" /> ANONYMOUS
                      </span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Desktop Header */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-[#1e293b]">
                      <div className="col-span-4">Field</div>
                      <div className="col-span-1 text-center">Required</div>
                      <div className="col-span-1 text-center">In Report</div>
                      <div className="col-span-2 text-center">Anonymization</div>
                      <div className="col-span-2 text-center">Search</div>
                      <div className="col-span-2">Note</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                      {fieldMapData.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:px-6 hover:bg-slate-50 transition-colors"
                        >
                          {/* Field Name */}
                          <div className="lg:col-span-4">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Field</div>
                            <p className="font-medium text-[#1e293b] text-sm">{row.field}</p>
                          </div>

                          {/* Required */}
                          <div className="lg:col-span-1">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Required</div>
                            <div className="flex lg:justify-center">
                              {row.required ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> No
                                </span>
                              )}
                            </div>
                          </div>

                          {/* In Report */}
                          <div className="lg:col-span-1">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">In Report</div>
                            <div className="flex lg:justify-center">
                              {row.inReport ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> No
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Anonymization */}
                          <div className="lg:col-span-2">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Anonymization</div>
                            <div className="flex lg:justify-center">
                              {row.anonymization === 'PUBLIC' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                  <Eye className="h-3 w-3" /> PUBLIC
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                  <EyeOff className="h-3 w-3" /> ANONYMOUS
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Search */}
                          <div className="lg:col-span-2">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Search</div>
                            <div className="flex lg:justify-center">
                              {row.search === 'YES' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Yes
                                </span>
                              )}
                              {row.search === 'NO' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> No
                                </span>
                              )}
                              {row.search === 'FILTER' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  <Filter className="h-3 w-3" /> Filter
                                </span>
                              )}
                              {row.search === 'MEDIA' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  Media
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Note */}
                          <div className="lg:col-span-2">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Note</div>
                            <p className="text-xs text-[#64748b]">{row.note || '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Scam Types Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/10 border border-[#0E74FF]/20 mb-6">
                  <AlertTriangle className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm font-semibold text-[#0E74FF]">{t.scamCategories}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                  {t.commonScams}
                </h2>
                <p className="text-[#64748b] max-w-3xl mx-auto">
                  {t.commonScamsDesc}
                </p>
              </div>

              {/* Categories Accordion */}
              <div className="space-y-4">
                {scamCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-2xl border-2 border-slate-200 hover:border-[#0E74FF]/30 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${category.iconBg}`}>
                            <Icon className={`h-7 w-7 md:h-8 md:w-8 ${category.iconColor}`} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-[#1e293b] mb-1">
                              {category.title}
                            </h3>
                            <p className="text-sm md:text-base text-[#64748b]">
                              {category.types.length} {t.scamTypes}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-6 w-6 text-[#64748b] transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-[#f8fafc]">
                          <div className="p-6 md:p-8">
                            <div className="grid md:grid-cols-2 gap-4">
                              {category.types.map((type) => (
                                <div
                                  key={type.slug}
                                  className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-[#0E74FF]/50 hover:shadow-md transition-all duration-300"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${category.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                      <Icon className={`h-5 w-5 ${category.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-[#1e293b] mb-2 text-base group-hover:text-[#0E74FF] transition-colors duration-300">
                                        {type.title}
                                      </h4>
                                      <p className="text-sm text-[#64748b] leading-relaxed">
                                        {type.description}
                                      </p>
                                      <p className="mt-2 text-xs text-[#94a3b8] font-mono">
                                        slug: {type.slug}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4]">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {t.readyToVerify}
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
                {t.readyDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#0E74FF] hover:bg-white/90 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t.startFreeSearch}
                </Button>
                <Link href={`/${locale}/report/new`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    {t.reportScam}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
