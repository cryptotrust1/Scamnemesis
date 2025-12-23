'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Locale = 'en' | 'sk' | 'cs' | 'de';

const getTranslations = (locale: Locale) => {
  const translations = {
    en: {
      title: 'Privacy Policy | ScamNemesis',
      backButton: 'Back to homepage',
      heading: 'Privacy Policy',
      lastUpdated: 'Last updated: December 17, 2025',
      sections: {
        intro: {
          title: '1. Introduction',
          content: 'ScamNemesis ("we", "us" or "our company") is committed to protecting your privacy. This privacy policy explains how we collect, use and protect your personal data.',
        },
        controller: {
          title: '2. Data Controller',
          content: 'The data controller is:',
          items: ['ScamNemesis s.r.o.', 'Email: privacy@scamnemesis.com'],
        },
        dataCollected: {
          title: '3. What data we collect',
          provided: {
            title: '3.1 Data you provide',
            items: [
              'Registration data (email, password)',
              'Profile information (name, phone - optional)',
              'Fraud reports and attached documents',
              'Communication with us',
            ],
          },
          automatic: {
            title: '3.2 Automatically collected data',
            items: [
              'IP address and approximate location',
              'Browser and device type',
              'Time and date of visit',
              'Pages you visited',
              'Referring page',
            ],
          },
          cookies: {
            title: '3.3 Cookies',
            content: 'We use cookies and similar technologies to:',
            items: [
              'Keep you logged in',
              'Remember your preferences',
              'Analyze traffic',
              'Improve our services',
            ],
          },
        },
        usage: {
          title: '4. How we use your data',
          content: 'We use your personal data to:',
          items: [
            'Provide and manage our services',
            'Process and publish fraud reports',
            'Communicate with you about your reports',
            'Improve our services',
            'Protect against misuse and fraud',
            'Fulfill our legal obligations',
          ],
        },
        legalBasis: {
          title: '5. Legal basis for processing',
          content: 'We process your data based on:',
          items: [
            { strong: 'Consent', text: ' - for marketing communication' },
            { strong: 'Contract', text: ' - for providing services' },
            { strong: 'Legitimate interest', text: ' - for security and service improvement' },
            { strong: 'Legal obligation', text: ' - for compliance with laws' },
          ],
        },
        sharing: {
          title: '6. Data sharing',
          content: 'We may share your data with:',
          items: [
            'Service providers (hosting, email, analytics tools)',
            'Law enforcement (based on law)',
            'Other parties with your consent',
          ],
          note: 'We never sell your personal data to third parties for marketing purposes.',
        },
        masking: {
          title: '7. Sensitive data masking',
          content: 'To protect privacy, we apply a sensitive data masking system:',
          items: [
            'Phone numbers are partially hidden (e.g., +421 9** *** **9)',
            'Email addresses are partially hidden (e.g., j***@example.com)',
            'IBAN numbers are partially hidden',
            'Full data is only available to verified users',
          ],
        },
        security: {
          title: '8. Data security',
          content: 'We have implemented technical and organizational measures to protect your data:',
          items: [
            'Data encryption in transit (HTTPS/TLS)',
            'Encryption of sensitive data in database',
            'Access controls and authentication',
            'Regular security audits',
            'Access logging (audit log)',
          ],
        },
        retention: {
          title: '9. Data retention',
          content: 'We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected:',
          items: [
            'Accounting data - 10 years (by law)',
            'Fraud reports - 5 years from last update',
            'Inactive accounts - 2 years from last login',
          ],
        },
        rights: {
          title: '10. Your rights',
          content: 'Under GDPR you have the right to:',
          items: [
            { strong: 'Access', text: ' - obtain a copy of your data' },
            { strong: 'Rectification', text: ' - correct inaccurate data' },
            { strong: 'Erasure', text: ' - request deletion of your data' },
            { strong: 'Restriction', text: ' - restrict processing of your data' },
            { strong: 'Portability', text: ' - obtain data in machine-readable format' },
            { strong: 'Objection', text: ' - object to processing' },
            { strong: 'Withdraw consent', text: ' - withdraw consent at any time' },
          ],
          contact: 'To exercise your rights, contact us at privacy@scamnemesis.com.',
        },
        transfers: {
          title: '11. International transfers',
          content: 'Your data may be transferred and processed in countries outside the EEA. In such cases, we ensure adequate protection through:',
          items: [
            'EU Standard Contractual Clauses',
            'Certifications (e.g., EU-US Data Privacy Framework)',
          ],
        },
        children: {
          title: '12. Children',
          content: 'Our services are not intended for persons under 18 years of age. We do not knowingly collect data from children. If we discover that we have collected data from a child, we will delete it immediately.',
        },
        changes: {
          title: '13. Changes to this policy',
          content: 'We may update this policy from time to time. We will notify you of significant changes by email or by notice on our website.',
        },
        contact: {
          title: '14. Contact and complaints',
          content: 'If you have questions or complaints regarding the protection of your personal data:',
          items: ['Email: privacy@scamnemesis.com'],
          formText: 'Form:',
          formLink: 'Contact form',
          complaint: 'You also have the right to file a complaint with the supervisory authority - the Office for Personal Data Protection of the Slovak Republic (www.dataprotection.gov.sk).',
        },
        ccpa: {
          title: '15. Additional information for California residents (CCPA)',
          content: 'If you are a California resident, you have additional rights under CCPA, including the right to know what personal information is being collected and the right to request its deletion.',
        },
      },
    },
    sk: {
      title: 'Ochrana osobných údajov | ScamNemesis',
      backButton: 'Späť na hlavnú stránku',
      heading: 'Ochrana osobných údajov',
      lastUpdated: 'Posledná aktualizácia: 17. december 2025',
      sections: {
        intro: {
          title: '1. Úvod',
          content: 'Spoločnosť ScamNemesis ("my", "nás" alebo "naša spoločnosť") sa zaväzuje chrániť vaše súkromie. Tieto zásady ochrany osobných údajov vysvetľujú, ako zhromažďujeme, používame a chránime vaše osobné údaje.',
        },
        controller: {
          title: '2. Prevádzkovateľ',
          content: 'Prevádzkovateľom osobných údajov je:',
          items: ['ScamNemesis s.r.o.', 'Email: privacy@scamnemesis.com'],
        },
        dataCollected: {
          title: '3. Aké údaje zhromažďujeme',
          provided: {
            title: '3.1 Údaje, ktoré nám poskytnete',
            items: [
              'Registračné údaje (email, heslo)',
              'Profilové informácie (meno, telefón - voliteľné)',
              'Hlásenia o podvodoch a priložené dokumenty',
              'Komunikáciu s nami',
            ],
          },
          automatic: {
            title: '3.2 Automaticky zhromažďované údaje',
            items: [
              'IP adresa a približná poloha',
              'Typ prehliadača a zariadenia',
              'Čas a dátum návštevy',
              'Stránky, ktoré ste navštívili',
              'Odkazujúca stránka',
            ],
          },
          cookies: {
            title: '3.3 Cookies',
            content: 'Používame cookies a podobné technológie na:',
            items: [
              'Udržanie vášho prihlásenia',
              'Zapamätanie vašich preferencií',
              'Analýzu návštevnosti',
              'Zlepšovanie našich služieb',
            ],
          },
        },
        usage: {
          title: '4. Ako používame vaše údaje',
          content: 'Vaše osobné údaje používame na:',
          items: [
            'Poskytovanie a správu našich služieb',
            'Spracovanie a zverejňovanie hlásení o podvodoch',
            'Komunikáciu s vami o vašich hláseniach',
            'Zlepšovanie našich služieb',
            'Ochranu pred zneužitím a podvodmi',
            'Plnenie našich právnych povinností',
          ],
        },
        legalBasis: {
          title: '5. Právny základ spracovania',
          content: 'Vaše údaje spracúvame na základe:',
          items: [
            { strong: 'Súhlas', text: ' - pre marketingovú komunikáciu' },
            { strong: 'Zmluva', text: ' - pre poskytovanie služieb' },
            { strong: 'Oprávnený záujem', text: ' - pre bezpečnosť a zlepšovanie služieb' },
            { strong: 'Právna povinnosť', text: ' - pre dodržanie zákonov' },
          ],
        },
        sharing: {
          title: '6. Zdieľanie údajov',
          content: 'Vaše údaje môžeme zdieľať s:',
          items: [
            'Poskytovatelia služieb (hosting, email, analytické nástroje)',
            'Orgány činné v trestnom konaní (na základe zákona)',
            'Iné strany s vaším súhlasom',
          ],
          note: 'Nikdy nepredávame vaše osobné údaje tretím stranám na marketingové účely.',
        },
        masking: {
          title: '7. Maskovanie citlivých údajov',
          content: 'Pre ochranu súkromia aplikujeme systém maskovania citlivých údajov:',
          items: [
            'Telefónne čísla sú čiastočne skryté (napr. +421 9** *** **9)',
            'Emailové adresy sú čiastočne skryté (napr. j***@example.com)',
            'IBAN čísla sú čiastočne skryté',
            'Plné údaje sú dostupné len overeným používateľom',
          ],
        },
        security: {
          title: '8. Bezpečnosť údajov',
          content: 'Implementovali sme technické a organizačné opatrenia na ochranu vašich údajov:',
          items: [
            'Šifrovanie dát pri prenose (HTTPS/TLS)',
            'Šifrovanie citlivých údajov v databáze',
            'Prístupové kontroly a autentifikácia',
            'Pravidelné bezpečnostné audity',
            'Zaznamenávanie prístupov (audit log)',
          ],
        },
        retention: {
          title: '9. Uchovávanie údajov',
          content: 'Vaše osobné údaje uchovávame len po dobu nevyhnutnú na splnenie účelov, na ktoré boli zhromaždené:',
          items: [
            'Účtovné údaje - 10 rokov (podľa zákona)',
            'Hlásenia o podvodoch - 5 rokov od poslednej aktualizácie',
            'Neaktívne účty - 2 roky od posledného prihlásenia',
          ],
        },
        rights: {
          title: '10. Vaše práva',
          content: 'Podľa GDPR máte právo na:',
          items: [
            { strong: 'Prístup', text: ' - získať kópiu vašich údajov' },
            { strong: 'Opravu', text: ' - opraviť nepresné údaje' },
            { strong: 'Vymazanie', text: ' - požiadať o vymazanie vašich údajov' },
            { strong: 'Obmedzenie', text: ' - obmedziť spracovanie vašich údajov' },
            { strong: 'Prenositeľnosť', text: ' - získať údaje v strojovo čitateľnom formáte' },
            { strong: 'Námietku', text: ' - namietať proti spracovaniu' },
            { strong: 'Odvolanie súhlasu', text: ' - kedykoľvek odvolať súhlas' },
          ],
          contact: 'Pre uplatnenie vašich práv nás kontaktujte na privacy@scamnemesis.com.',
        },
        transfers: {
          title: '11. Medzinárodné prenosy',
          content: 'Vaše údaje môžu byť prenesené a spracované v krajinách mimo EHP. V takom prípade zabezpečujeme primeranú úroveň ochrany pomocou:',
          items: [
            'Štandardných zmluvných doložiek EÚ',
            'Certifikácií (napr. EU-US Data Privacy Framework)',
          ],
        },
        children: {
          title: '12. Deti',
          content: 'Naše služby nie sú určené pre osoby mladšie ako 18 rokov. Vedome nezhromažďujeme údaje od detí. Ak zistíme, že sme zhromaždili údaje od dieťaťa, okamžite ich vymažeme.',
        },
        changes: {
          title: '13. Zmeny týchto zásad',
          content: 'Tieto zásady môžeme priebežne aktualizovať. O významných zmenách vás budeme informovať emailom alebo oznámením na našej stránke.',
        },
        contact: {
          title: '14. Kontakt a sťažnosti',
          content: 'Ak máte otázky alebo sťažnosti týkajúce sa ochrany vašich osobných údajov:',
          items: ['Email: privacy@scamnemesis.com'],
          formText: 'Formulár:',
          formLink: 'Kontaktný formulár',
          complaint: 'Máte tiež právo podať sťažnosť na dozorný orgán - Úrad na ochranu osobných údajov Slovenskej republiky (www.dataprotection.gov.sk).',
        },
        ccpa: {
          title: '15. Dodatočné informácie pre kalifornských obyvateľov (CCPA)',
          content: 'Ak ste obyvateľom Kalifornie, máte dodatočné práva podľa CCPA, vrátane práva vedieť, aké osobné informácie sa zhromažďujú, a práva požiadať o ich vymazanie.',
        },
      },
    },
    cs: {
      title: 'Ochrana osobních údajů | ScamNemesis',
      backButton: 'Zpět na hlavní stránku',
      heading: 'Ochrana osobních údajů',
      lastUpdated: 'Poslední aktualizace: 17. prosince 2025',
      sections: {
        intro: {
          title: '1. Úvod',
          content: 'Společnost ScamNemesis ("my", "nás" nebo "naše společnost") se zavazuje chránit vaše soukromí. Tyto zásady ochrany osobních údajů vysvětlují, jak shromažďujeme, používáme a chráníme vaše osobní údaje.',
        },
        controller: {
          title: '2. Správce údajů',
          content: 'Správcem osobních údajů je:',
          items: ['ScamNemesis s.r.o.', 'Email: privacy@scamnemesis.com'],
        },
        dataCollected: {
          title: '3. Jaké údaje shromažďujeme',
          provided: {
            title: '3.1 Údaje, které nám poskytnete',
            items: [
              'Registrační údaje (email, heslo)',
              'Profilové informace (jméno, telefon - volitelné)',
              'Hlášení o podvodech a přiložené dokumenty',
              'Komunikaci s námi',
            ],
          },
          automatic: {
            title: '3.2 Automaticky shromažďované údaje',
            items: [
              'IP adresa a přibližná poloha',
              'Typ prohlížeče a zařízení',
              'Čas a datum návštěvy',
              'Stránky, které jste navštívili',
              'Odkazující stránka',
            ],
          },
          cookies: {
            title: '3.3 Cookies',
            content: 'Používáme cookies a podobné technologie k:',
            items: [
              'Udržení vašeho přihlášení',
              'Zapamatování vašich preferencí',
              'Analýze návštěvnosti',
              'Zlepšování našich služeb',
            ],
          },
        },
        usage: {
          title: '4. Jak používáme vaše údaje',
          content: 'Vaše osobní údaje používáme k:',
          items: [
            'Poskytování a správě našich služeb',
            'Zpracování a zveřejňování hlášení o podvodech',
            'Komunikaci s vámi o vašich hlášeních',
            'Zlepšování našich služeb',
            'Ochraně před zneužitím a podvody',
            'Plnění našich právních povinností',
          ],
        },
        legalBasis: {
          title: '5. Právní základ zpracování',
          content: 'Vaše údaje zpracováváme na základě:',
          items: [
            { strong: 'Souhlas', text: ' - pro marketingovou komunikaci' },
            { strong: 'Smlouva', text: ' - pro poskytování služeb' },
            { strong: 'Oprávněný zájem', text: ' - pro bezpečnost a zlepšování služeb' },
            { strong: 'Právní povinnost', text: ' - pro dodržení zákonů' },
          ],
        },
        sharing: {
          title: '6. Sdílení údajů',
          content: 'Vaše údaje můžeme sdílet s:',
          items: [
            'Poskytovatelé služeb (hosting, email, analytické nástroje)',
            'Orgány činné v trestním řízení (na základě zákona)',
            'Jiné strany s vaším souhlasem',
          ],
          note: 'Nikdy neprodáváme vaše osobní údaje třetím stranám pro marketingové účely.',
        },
        masking: {
          title: '7. Maskování citlivých údajů',
          content: 'Pro ochranu soukromí aplikujeme systém maskování citlivých údajů:',
          items: [
            'Telefonní čísla jsou částečně skryta (např. +421 9** *** **9)',
            'Emailové adresy jsou částečně skryty (např. j***@example.com)',
            'IBAN čísla jsou částečně skryta',
            'Plné údaje jsou dostupné pouze ověřeným uživatelům',
          ],
        },
        security: {
          title: '8. Bezpečnost údajů',
          content: 'Implementovali jsme technická a organizační opatření na ochranu vašich údajů:',
          items: [
            'Šifrování dat při přenosu (HTTPS/TLS)',
            'Šifrování citlivých údajů v databázi',
            'Přístupové kontroly a autentifikace',
            'Pravidelné bezpečnostní audity',
            'Zaznamenávání přístupů (audit log)',
          ],
        },
        retention: {
          title: '9. Uchovávání údajů',
          content: 'Vaše osobní údaje uchováváme pouze po dobu nezbytnou k naplnění účelů, pro které byly shromážděny:',
          items: [
            'Účetní údaje - 10 let (podle zákona)',
            'Hlášení o podvodech - 5 let od poslední aktualizace',
            'Neaktivní účty - 2 roky od posledního přihlášení',
          ],
        },
        rights: {
          title: '10. Vaše práva',
          content: 'Podle GDPR máte právo na:',
          items: [
            { strong: 'Přístup', text: ' - získat kopii vašich údajů' },
            { strong: 'Opravu', text: ' - opravit nepřesné údaje' },
            { strong: 'Výmaz', text: ' - požádat o výmaz vašich údajů' },
            { strong: 'Omezení', text: ' - omezit zpracování vašich údajů' },
            { strong: 'Přenositelnost', text: ' - získat údaje ve strojově čitelném formátu' },
            { strong: 'Námitku', text: ' - namítat proti zpracování' },
            { strong: 'Odvolání souhlasu', text: ' - kdykoli odvolat souhlas' },
          ],
          contact: 'Pro uplatnění vašich práv nás kontaktujte na privacy@scamnemesis.com.',
        },
        transfers: {
          title: '11. Mezinárodní přenosy',
          content: 'Vaše údaje mohou být přeneseny a zpracovány v zemích mimo EHP. V takovém případě zajišťujeme přiměřenou úroveň ochrany pomocí:',
          items: [
            'Standardních smluvních doložek EU',
            'Certifikací (např. EU-US Data Privacy Framework)',
          ],
        },
        children: {
          title: '12. Děti',
          content: 'Naše služby nejsou určeny pro osoby mladší 18 let. Vědomě neshromažďujeme údaje od dětí. Pokud zjistíme, že jsme shromáždili údaje od dítěte, okamžitě je vymažeme.',
        },
        changes: {
          title: '13. Změny těchto zásad',
          content: 'Tyto zásady můžeme průběžně aktualizovat. O významných změnách vás budeme informovat emailem nebo oznámením na naší stránce.',
        },
        contact: {
          title: '14. Kontakt a stížnosti',
          content: 'Pokud máte otázky nebo stížnosti týkající se ochrany vašich osobních údajů:',
          items: ['Email: privacy@scamnemesis.com'],
          formText: 'Formulář:',
          formLink: 'Kontaktní formulář',
          complaint: 'Máte také právo podat stížnost u dozorového úřadu - Úřadu pro ochranu osobních údajů (www.uoou.cz).',
        },
        ccpa: {
          title: '15. Dodatečné informace pro kalifornské obyvatele (CCPA)',
          content: 'Pokud jste obyvatelem Kalifornie, máte dodatečná práva podle CCPA, včetně práva vědět, jaké osobní informace se shromažďují, a práva požádat o jejich výmaz.',
        },
      },
    },
    de: {
      title: 'Datenschutzrichtlinie | ScamNemesis',
      backButton: 'Zurück zur Startseite',
      heading: 'Datenschutzrichtlinie',
      lastUpdated: 'Letzte Aktualisierung: 17. Dezember 2025',
      sections: {
        intro: {
          title: '1. Einleitung',
          content: 'ScamNemesis ("wir", "uns" oder "unser Unternehmen") verpflichtet sich zum Schutz Ihrer Privatsphäre. Diese Datenschutzrichtlinie erklärt, wie wir Ihre personenbezogenen Daten erheben, verwenden und schützen.',
        },
        controller: {
          title: '2. Verantwortlicher',
          content: 'Der Verantwortliche für die Datenverarbeitung ist:',
          items: ['ScamNemesis s.r.o.', 'E-Mail: privacy@scamnemesis.com'],
        },
        dataCollected: {
          title: '3. Welche Daten wir erheben',
          provided: {
            title: '3.1 Von Ihnen bereitgestellte Daten',
            items: [
              'Registrierungsdaten (E-Mail, Passwort)',
              'Profilinformationen (Name, Telefon - optional)',
              'Betrugsmeldungen und angehängte Dokumente',
              'Kommunikation mit uns',
            ],
          },
          automatic: {
            title: '3.2 Automatisch erhobene Daten',
            items: [
              'IP-Adresse und ungefährer Standort',
              'Browser- und Gerätetyp',
              'Uhrzeit und Datum des Besuchs',
              'Besuchte Seiten',
              'Verweisende Seite',
            ],
          },
          cookies: {
            title: '3.3 Cookies',
            content: 'Wir verwenden Cookies und ähnliche Technologien um:',
            items: [
              'Sie angemeldet zu halten',
              'Ihre Präferenzen zu speichern',
              'Verkehr zu analysieren',
              'Unsere Dienste zu verbessern',
            ],
          },
        },
        usage: {
          title: '4. Wie wir Ihre Daten verwenden',
          content: 'Wir verwenden Ihre personenbezogenen Daten um:',
          items: [
            'Unsere Dienste bereitzustellen und zu verwalten',
            'Betrugsmeldungen zu bearbeiten und zu veröffentlichen',
            'Mit Ihnen über Ihre Meldungen zu kommunizieren',
            'Unsere Dienste zu verbessern',
            'Vor Missbrauch und Betrug zu schützen',
            'Unsere gesetzlichen Pflichten zu erfüllen',
          ],
        },
        legalBasis: {
          title: '5. Rechtsgrundlage der Verarbeitung',
          content: 'Wir verarbeiten Ihre Daten auf Grundlage von:',
          items: [
            { strong: 'Einwilligung', text: ' - für Marketingkommunikation' },
            { strong: 'Vertrag', text: ' - für die Erbringung von Dienstleistungen' },
            { strong: 'Berechtigtes Interesse', text: ' - für Sicherheit und Serviceverbesserung' },
            { strong: 'Rechtliche Verpflichtung', text: ' - für die Einhaltung von Gesetzen' },
          ],
        },
        sharing: {
          title: '6. Datenweitergabe',
          content: 'Wir können Ihre Daten teilen mit:',
          items: [
            'Dienstleister (Hosting, E-Mail, Analysetools)',
            'Strafverfolgungsbehörden (auf gesetzlicher Grundlage)',
            'Andere Parteien mit Ihrer Zustimmung',
          ],
          note: 'Wir verkaufen Ihre personenbezogenen Daten niemals an Dritte zu Marketingzwecken.',
        },
        masking: {
          title: '7. Maskierung sensibler Daten',
          content: 'Zum Schutz der Privatsphäre wenden wir ein System zur Maskierung sensibler Daten an:',
          items: [
            'Telefonnummern werden teilweise ausgeblendet (z.B. +421 9** *** **9)',
            'E-Mail-Adressen werden teilweise ausgeblendet (z.B. j***@example.com)',
            'IBAN-Nummern werden teilweise ausgeblendet',
            'Vollständige Daten sind nur verifizierten Benutzern zugänglich',
          ],
        },
        security: {
          title: '8. Datensicherheit',
          content: 'Wir haben technische und organisatorische Maßnahmen zum Schutz Ihrer Daten implementiert:',
          items: [
            'Datenverschlüsselung bei der Übertragung (HTTPS/TLS)',
            'Verschlüsselung sensibler Daten in der Datenbank',
            'Zugriffskontrollen und Authentifizierung',
            'Regelmäßige Sicherheitsaudits',
            'Zugriffsprotokollierung (Audit-Log)',
          ],
        },
        retention: {
          title: '9. Datenspeicherung',
          content: 'Wir speichern Ihre personenbezogenen Daten nur so lange, wie es zur Erfüllung der Zwecke erforderlich ist:',
          items: [
            'Buchhaltungsdaten - 10 Jahre (gesetzlich)',
            'Betrugsmeldungen - 5 Jahre nach letzter Aktualisierung',
            'Inaktive Konten - 2 Jahre seit letzter Anmeldung',
          ],
        },
        rights: {
          title: '10. Ihre Rechte',
          content: 'Nach der DSGVO haben Sie das Recht auf:',
          items: [
            { strong: 'Auskunft', text: ' - eine Kopie Ihrer Daten zu erhalten' },
            { strong: 'Berichtigung', text: ' - ungenaue Daten zu korrigieren' },
            { strong: 'Löschung', text: ' - die Löschung Ihrer Daten zu verlangen' },
            { strong: 'Einschränkung', text: ' - die Verarbeitung Ihrer Daten einzuschränken' },
            { strong: 'Datenübertragbarkeit', text: ' - Daten in maschinenlesbarem Format zu erhalten' },
            { strong: 'Widerspruch', text: ' - der Verarbeitung zu widersprechen' },
            { strong: 'Widerruf der Einwilligung', text: ' - die Einwilligung jederzeit zu widerrufen' },
          ],
          contact: 'Um Ihre Rechte auszuüben, kontaktieren Sie uns unter privacy@scamnemesis.com.',
        },
        transfers: {
          title: '11. Internationale Übermittlungen',
          content: 'Ihre Daten können in Länder außerhalb des EWR übermittelt und dort verarbeitet werden. In diesem Fall gewährleisten wir ein angemessenes Schutzniveau durch:',
          items: [
            'EU-Standardvertragsklauseln',
            'Zertifizierungen (z.B. EU-US Data Privacy Framework)',
          ],
        },
        children: {
          title: '12. Kinder',
          content: 'Unsere Dienste sind nicht für Personen unter 18 Jahren bestimmt. Wir erheben wissentlich keine Daten von Kindern. Wenn wir feststellen, dass wir Daten von einem Kind erhoben haben, werden wir diese umgehend löschen.',
        },
        changes: {
          title: '13. Änderungen dieser Richtlinie',
          content: 'Wir können diese Richtlinie von Zeit zu Zeit aktualisieren. Über wesentliche Änderungen werden wir Sie per E-Mail oder durch einen Hinweis auf unserer Website informieren.',
        },
        contact: {
          title: '14. Kontakt und Beschwerden',
          content: 'Bei Fragen oder Beschwerden zum Schutz Ihrer personenbezogenen Daten:',
          items: ['E-Mail: privacy@scamnemesis.com'],
          formText: 'Formular:',
          formLink: 'Kontaktformular',
          complaint: 'Sie haben auch das Recht, eine Beschwerde bei der Aufsichtsbehörde einzureichen.',
        },
        ccpa: {
          title: '15. Zusätzliche Informationen für Einwohner Kaliforniens (CCPA)',
          content: 'Wenn Sie in Kalifornien ansässig sind, haben Sie zusätzliche Rechte nach dem CCPA, einschließlich des Rechts zu erfahren, welche persönlichen Informationen gesammelt werden, und des Rechts, deren Löschung zu verlangen.',
        },
      },
    },
  };
  return translations[locale] || translations.en;
};

export default function PrivacyPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = getTranslations(locale);

  return (
    <div className="container max-w-4xl py-12 px-4">
      <Link href={`/${locale}`}>
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backButton}
        </Button>
      </Link>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>{t.heading}</h1>
        <p className="lead">{t.lastUpdated}</p>

        <h2>{t.sections.intro.title}</h2>
        <p>{t.sections.intro.content}</p>

        <h2>{t.sections.controller.title}</h2>
        <p>{t.sections.controller.content}</p>
        <ul>
          {t.sections.controller.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.dataCollected.title}</h2>
        <h3>{t.sections.dataCollected.provided.title}</h3>
        <ul>
          {t.sections.dataCollected.provided.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.sections.dataCollected.automatic.title}</h3>
        <ul>
          {t.sections.dataCollected.automatic.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.sections.dataCollected.cookies.title}</h3>
        <p>{t.sections.dataCollected.cookies.content}</p>
        <ul>
          {t.sections.dataCollected.cookies.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.usage.title}</h2>
        <p>{t.sections.usage.content}</p>
        <ul>
          {t.sections.usage.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.legalBasis.title}</h2>
        <p>{t.sections.legalBasis.content}</p>
        <ul>
          {t.sections.legalBasis.items.map((item, i) => (
            <li key={i}>
              <strong>{item.strong}</strong>{item.text}
            </li>
          ))}
        </ul>

        <h2>{t.sections.sharing.title}</h2>
        <p>{t.sections.sharing.content}</p>
        <ul>
          {t.sections.sharing.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p><strong>{t.sections.sharing.note}</strong></p>

        <h2>{t.sections.masking.title}</h2>
        <p>{t.sections.masking.content}</p>
        <ul>
          {t.sections.masking.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.security.title}</h2>
        <p>{t.sections.security.content}</p>
        <ul>
          {t.sections.security.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.retention.title}</h2>
        <p>{t.sections.retention.content}</p>
        <ul>
          {t.sections.retention.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.rights.title}</h2>
        <p>{t.sections.rights.content}</p>
        <ul>
          {t.sections.rights.items.map((item, i) => (
            <li key={i}>
              <strong>{item.strong}</strong>{item.text}
            </li>
          ))}
        </ul>
        <p>{t.sections.rights.contact}</p>

        <h2>{t.sections.transfers.title}</h2>
        <p>{t.sections.transfers.content}</p>
        <ul>
          {t.sections.transfers.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.children.title}</h2>
        <p>{t.sections.children.content}</p>

        <h2>{t.sections.changes.title}</h2>
        <p>{t.sections.changes.content}</p>

        <h2>{t.sections.contact.title}</h2>
        <p>{t.sections.contact.content}</p>
        <ul>
          {t.sections.contact.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
          <li>{t.sections.contact.formText} <Link href={`/${locale}/contact-us`}>{t.sections.contact.formLink}</Link></li>
        </ul>
        <p>{t.sections.contact.complaint}</p>

        <h2>{t.sections.ccpa.title}</h2>
        <p>{t.sections.ccpa.content}</p>
      </article>
    </div>
  );
}
