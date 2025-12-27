'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Locale = 'en' | 'sk' | 'cs' | 'de';

const getTranslations = (locale: Locale) => {
  const translations = {
    en: {
      title: 'Terms of Service | ScamNemesis',
      backButton: 'Back to homepage',
      heading: 'Terms of Service',
      lastUpdated: 'Last updated: December 17, 2025',
      sections: {
        intro: {
          title: '1. Introduction',
          content: 'Welcome to ScamNemesis. These Terms of Service ("Terms") govern your use of our website and services. By using our services, you agree to these Terms.',
        },
        description: {
          title: '2. Service Description',
          content: 'ScamNemesis is a platform for reporting and searching information about fraud. We serve as a database of user reports aimed at warning others about potential scammers.',
        },
        usage: {
          title: '3. Using the Service',
          eligible: {
            title: '3.1 Eligible Users',
            content: 'The service may be used by persons over 18 years of age. By using the service, you confirm that you meet this requirement.',
          },
          account: {
            title: '3.2 Registration and Account',
            content: 'Some features require registration. You are responsible for:',
            items: [
              'Maintaining the confidentiality of your login credentials',
              'All activity under your account',
              'Immediately reporting any unauthorized access',
            ],
          },
          prohibited: {
            title: '3.3 Prohibited Activities',
            content: 'When using the service, it is prohibited to:',
            items: [
              'Publish false or misleading information',
              'Misuse the service for personal attacks or revenge',
              'Publish information about innocent people',
              'Violate copyright or other third-party rights',
              'Attempt unauthorized access to the system',
              'Use automated tools without permission',
            ],
          },
        },
        userContent: {
          title: '4. User Content',
          reports: {
            title: '4.1 Your Reports',
            content: 'By publishing a report:',
            items: [
              'You confirm that the information is true to the best of your knowledge',
              'You grant us the right to use, modify, and publish this content',
              'You accept responsibility for the accuracy of the information',
            ],
          },
          moderation: {
            title: '4.2 Content Moderation',
            content: 'We reserve the right to:',
            items: [
              'Review all reports before publication',
              'Edit or remove content that violates these Terms',
              'Terminate accounts that repeatedly violate the rules',
            ],
          },
        },
        masking: {
          title: '5. Data Masking',
          content: 'To protect privacy, sensitive data (phone numbers, emails, IBAN) are partially masked. Full data is only available to users with higher access levels.',
        },
        liability: {
          title: '6. Limitation of Liability',
          content: 'ScamNemesis:',
          items: [
            'Does not guarantee the accuracy of information in reports',
            'Is not responsible for decisions based on this information',
            'Does not assume liability for damages arising from the use of the service',
          ],
        },
        changes: {
          title: '7. Changes to Terms',
          content: 'We reserve the right to change these Terms at any time. We will notify you of significant changes by email or by notice on the website.',
        },
        contact: {
          title: '8. Contact',
          content: 'If you have questions about these Terms, contact us:',
          items: ['Email: legal@scamnemesis.com'],
          formText: 'Form:',
          formLink: 'Contact form',
        },
        law: {
          title: '9. Governing Law',
          content: 'These Terms are governed by the laws of the Slovak Republic. Any disputes will be resolved by the competent courts of the Slovak Republic.',
        },
      },
    },
    sk: {
      title: 'Podmienky používania | ScamNemesis',
      backButton: 'Späť na hlavnú stránku',
      heading: 'Podmienky používania',
      lastUpdated: 'Posledná aktualizácia: 17. december 2025',
      sections: {
        intro: {
          title: '1. Úvod',
          content: 'Vitajte na ScamNemesis. Tieto podmienky používania ("Podmienky") upravujú vaše používanie našej webovej stránky a služieb. Použitím našich služieb súhlasíte s týmito Podmienkami.',
        },
        description: {
          title: '2. Popis služby',
          content: 'ScamNemesis je platforma na nahlasovanie a vyhľadávanie informácií o podvodoch. Slúžime ako databáza hlásení od používateľov s cieľom varovať ostatných pred potenciálnymi podvodníkmi.',
        },
        usage: {
          title: '3. Používanie služby',
          eligible: {
            title: '3.1 Oprávnení používatelia',
            content: 'Službu môžu používať osoby staršie ako 18 rokov. Použitím služby potvrdzujete, že spĺňate túto podmienku.',
          },
          account: {
            title: '3.2 Registrácia a účet',
            content: 'Pre niektoré funkcie je potrebná registrácia. Ste zodpovední za:',
            items: [
              'Udržanie dôvernosti vašich prihlasovacích údajov',
              'Všetky aktivity pod vaším účtom',
              'Okamžité oznámenie akéhokoľvek neoprávneného prístupu',
            ],
          },
          prohibited: {
            title: '3.3 Zakázané aktivity',
            content: 'Pri používaní služby je zakázané:',
            items: [
              'Zverejňovať nepravdivé alebo zavádzajúce informácie',
              'Zneužívať službu na osobné útoky alebo pomstu',
              'Zverejňovať informácie o nevinných osobách',
              'Porušovať autorské práva alebo iné práva tretích strán',
              'Pokúsiť sa o neoprávnený prístup k systému',
              'Používať automatizované nástroje bez povolenia',
            ],
          },
        },
        userContent: {
          title: '4. Obsah používateľov',
          reports: {
            title: '4.1 Vaše hlásenia',
            content: 'Zverejnením hlásenia:',
            items: [
              'Potvrdzujete, že informácie sú podľa vášho najlepšieho vedomia pravdivé',
              'Udeľujete nám právo použiť, upraviť a zverejniť tento obsah',
              'Preberáte zodpovednosť za presnosť informácií',
            ],
          },
          moderation: {
            title: '4.2 Moderácia obsahu',
            content: 'Vyhradzujeme si právo:',
            items: [
              'Skontrolovať všetky hlásenia pred zverejnením',
              'Upraviť alebo odstrániť obsah porušujúci tieto Podmienky',
              'Zrušiť účty, ktoré opakovane porušujú pravidlá',
            ],
          },
        },
        masking: {
          title: '5. Maskovanie údajov',
          content: 'Pre ochranu súkromia sú citlivé údaje (telefónne čísla, emaily, IBAN) čiastočne maskované. Plné údaje sú dostupné len používateľom s vyššou úrovňou prístupu.',
        },
        liability: {
          title: '6. Obmedzenie zodpovednosti',
          content: 'ScamNemesis:',
          items: [
            'Negarantuje presnosť informácií v hláseniach',
            'Nie je zodpovedný za rozhodnutia založené na týchto informáciách',
            'Nepreberá zodpovednosť za škody vzniknuté použitím služby',
          ],
        },
        changes: {
          title: '7. Zmeny podmienok',
          content: 'Vyhradzujeme si právo kedykoľvek zmeniť tieto Podmienky. O významných zmenách vás budeme informovať emailom alebo oznámením na stránke.',
        },
        contact: {
          title: '8. Kontakt',
          content: 'Ak máte otázky k týmto Podmienkam, kontaktujte nás:',
          items: ['Email: legal@scamnemesis.com'],
          formText: 'Formulár:',
          formLink: 'Kontaktný formulár',
        },
        law: {
          title: '9. Rozhodné právo',
          content: 'Tieto Podmienky sa riadia právnym poriadkom Slovenskej republiky. Akékoľvek spory budú riešené príslušnými súdmi Slovenskej republiky.',
        },
      },
    },
    cs: {
      title: 'Podmínky použití | ScamNemesis',
      backButton: 'Zpět na hlavní stránku',
      heading: 'Podmínky použití',
      lastUpdated: 'Poslední aktualizace: 17. prosince 2025',
      sections: {
        intro: {
          title: '1. Úvod',
          content: 'Vítejte na ScamNemesis. Tyto podmínky použití ("Podmínky") upravují vaše používání naší webové stránky a služeb. Použitím našich služeb souhlasíte s těmito Podmínkami.',
        },
        description: {
          title: '2. Popis služby',
          content: 'ScamNemesis je platforma pro nahlašování a vyhledávání informací o podvodech. Sloužíme jako databáze hlášení od uživatelů s cílem varovat ostatní před potenciálními podvodníky.',
        },
        usage: {
          title: '3. Používání služby',
          eligible: {
            title: '3.1 Oprávnění uživatelé',
            content: 'Službu mohou používat osoby starší 18 let. Použitím služby potvrzujete, že splňujete tuto podmínku.',
          },
          account: {
            title: '3.2 Registrace a účet',
            content: 'Pro některé funkce je nutná registrace. Jste zodpovědní za:',
            items: [
              'Udržení důvěrnosti vašich přihlašovacích údajů',
              'Všechny aktivity pod vaším účtem',
              'Okamžité oznámení jakéhokoli neoprávněného přístupu',
            ],
          },
          prohibited: {
            title: '3.3 Zakázané aktivity',
            content: 'Při používání služby je zakázáno:',
            items: [
              'Zveřejňovat nepravdivé nebo zavádějící informace',
              'Zneužívat službu k osobním útokům nebo pomstě',
              'Zveřejňovat informace o nevinných osobách',
              'Porušovat autorská práva nebo jiná práva třetích stran',
              'Pokoušet se o neoprávněný přístup k systému',
              'Používat automatizované nástroje bez povolení',
            ],
          },
        },
        userContent: {
          title: '4. Obsah uživatelů',
          reports: {
            title: '4.1 Vaše hlášení',
            content: 'Zveřejněním hlášení:',
            items: [
              'Potvrzujete, že informace jsou podle vašeho nejlepšího vědomí pravdivé',
              'Udělujete nám právo použít, upravit a zveřejnit tento obsah',
              'Přebíráte zodpovědnost za přesnost informací',
            ],
          },
          moderation: {
            title: '4.2 Moderace obsahu',
            content: 'Vyhrazujeme si právo:',
            items: [
              'Zkontrolovat všechna hlášení před zveřejněním',
              'Upravit nebo odstranit obsah porušující tyto Podmínky',
              'Zrušit účty, které opakovaně porušují pravidla',
            ],
          },
        },
        masking: {
          title: '5. Maskování údajů',
          content: 'Pro ochranu soukromí jsou citlivé údaje (telefonní čísla, e-maily, IBAN) částečně maskovány. Plné údaje jsou dostupné pouze uživatelům s vyšší úrovní přístupu.',
        },
        liability: {
          title: '6. Omezení odpovědnosti',
          content: 'ScamNemesis:',
          items: [
            'Negarantuje přesnost informací v hlášeních',
            'Není odpovědný za rozhodnutí založená na těchto informacích',
            'Nepřebírá odpovědnost za škody vzniklé použitím služby',
          ],
        },
        changes: {
          title: '7. Změny podmínek',
          content: 'Vyhrazujeme si právo kdykoli změnit tyto Podmínky. O významných změnách vás budeme informovat e-mailem nebo oznámením na stránce.',
        },
        contact: {
          title: '8. Kontakt',
          content: 'Pokud máte dotazy k těmto Podmínkám, kontaktujte nás:',
          items: ['E-mail: legal@scamnemesis.com'],
          formText: 'Formulář:',
          formLink: 'Kontaktní formulář',
        },
        law: {
          title: '9. Rozhodné právo',
          content: 'Tyto Podmínky se řídí právním řádem České republiky. Jakékoli spory budou řešeny příslušnými soudy České republiky.',
        },
      },
    },
    de: {
      title: 'Nutzungsbedingungen | ScamNemesis',
      backButton: 'Zurück zur Startseite',
      heading: 'Nutzungsbedingungen',
      lastUpdated: 'Letzte Aktualisierung: 17. Dezember 2025',
      sections: {
        intro: {
          title: '1. Einleitung',
          content: 'Willkommen bei ScamNemesis. Diese Nutzungsbedingungen ("Bedingungen") regeln Ihre Nutzung unserer Website und Dienste. Durch die Nutzung unserer Dienste stimmen Sie diesen Bedingungen zu.',
        },
        description: {
          title: '2. Beschreibung des Dienstes',
          content: 'ScamNemesis ist eine Plattform zur Meldung und Suche von Informationen über Betrug. Wir dienen als Datenbank von Benutzermeldungen, um andere vor potenziellen Betrügern zu warnen.',
        },
        usage: {
          title: '3. Nutzung des Dienstes',
          eligible: {
            title: '3.1 Berechtigte Benutzer',
            content: 'Der Dienst darf von Personen über 18 Jahren genutzt werden. Durch die Nutzung des Dienstes bestätigen Sie, dass Sie diese Voraussetzung erfüllen.',
          },
          account: {
            title: '3.2 Registrierung und Konto',
            content: 'Für einige Funktionen ist eine Registrierung erforderlich. Sie sind verantwortlich für:',
            items: [
              'Die Wahrung der Vertraulichkeit Ihrer Anmeldedaten',
              'Alle Aktivitäten unter Ihrem Konto',
              'Die sofortige Meldung jedes unbefugten Zugriffs',
            ],
          },
          prohibited: {
            title: '3.3 Verbotene Aktivitäten',
            content: 'Bei der Nutzung des Dienstes ist es verboten:',
            items: [
              'Falsche oder irreführende Informationen zu veröffentlichen',
              'Den Dienst für persönliche Angriffe oder Rache zu missbrauchen',
              'Informationen über unschuldige Personen zu veröffentlichen',
              'Urheberrechte oder andere Rechte Dritter zu verletzen',
              'Einen unbefugten Zugriff auf das System zu versuchen',
              'Automatisierte Tools ohne Genehmigung zu verwenden',
            ],
          },
        },
        userContent: {
          title: '4. Benutzerinhalte',
          reports: {
            title: '4.1 Ihre Meldungen',
            content: 'Mit der Veröffentlichung einer Meldung:',
            items: [
              'Bestätigen Sie, dass die Informationen nach bestem Wissen wahr sind',
              'Gewähren Sie uns das Recht, diesen Inhalt zu nutzen, zu bearbeiten und zu veröffentlichen',
              'Übernehmen Sie die Verantwortung für die Richtigkeit der Informationen',
            ],
          },
          moderation: {
            title: '4.2 Inhaltsmoderation',
            content: 'Wir behalten uns das Recht vor:',
            items: [
              'Alle Meldungen vor der Veröffentlichung zu überprüfen',
              'Inhalte zu bearbeiten oder zu entfernen, die gegen diese Bedingungen verstoßen',
              'Konten zu kündigen, die wiederholt gegen die Regeln verstoßen',
            ],
          },
        },
        masking: {
          title: '5. Datenmaskierung',
          content: 'Zum Schutz der Privatsphäre werden sensible Daten (Telefonnummern, E-Mails, IBAN) teilweise maskiert. Vollständige Daten sind nur Benutzern mit höherer Zugangsstufe zugänglich.',
        },
        liability: {
          title: '6. Haftungsbeschränkung',
          content: 'ScamNemesis:',
          items: [
            'Garantiert nicht die Richtigkeit der Informationen in Meldungen',
            'Ist nicht verantwortlich für Entscheidungen, die auf diesen Informationen basieren',
            'Übernimmt keine Haftung für Schäden, die durch die Nutzung des Dienstes entstehen',
          ],
        },
        changes: {
          title: '7. Änderungen der Bedingungen',
          content: 'Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Über wesentliche Änderungen werden wir Sie per E-Mail oder durch einen Hinweis auf der Website informieren.',
        },
        contact: {
          title: '8. Kontakt',
          content: 'Bei Fragen zu diesen Bedingungen kontaktieren Sie uns:',
          items: ['E-Mail: legal@scamnemesis.com'],
          formText: 'Formular:',
          formLink: 'Kontaktformular',
        },
        law: {
          title: '9. Anwendbares Recht',
          content: 'Diese Bedingungen unterliegen dem Recht der Slowakischen Republik. Alle Streitigkeiten werden von den zuständigen Gerichten der Slowakischen Republik entschieden.',
        },
      },
    },
  };
  return translations[locale] || translations.en;
};

export default function TermsPage() {
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

        <h2>{t.sections.description.title}</h2>
        <p>{t.sections.description.content}</p>

        <h2>{t.sections.usage.title}</h2>
        <h3>{t.sections.usage.eligible.title}</h3>
        <p>{t.sections.usage.eligible.content}</p>

        <h3>{t.sections.usage.account.title}</h3>
        <p>{t.sections.usage.account.content}</p>
        <ul>
          {t.sections.usage.account.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.sections.usage.prohibited.title}</h3>
        <p>{t.sections.usage.prohibited.content}</p>
        <ul>
          {t.sections.usage.prohibited.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.userContent.title}</h2>
        <h3>{t.sections.userContent.reports.title}</h3>
        <p>{t.sections.userContent.reports.content}</p>
        <ul>
          {t.sections.userContent.reports.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t.sections.userContent.moderation.title}</h3>
        <p>{t.sections.userContent.moderation.content}</p>
        <ul>
          {t.sections.userContent.moderation.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t.sections.masking.title}</h2>
        <p>{t.sections.masking.content}</p>

        <h2>{t.sections.liability.title}</h2>
        <p>{t.sections.liability.content}</p>
        <ul>
          {t.sections.liability.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

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

        <h2>{t.sections.law.title}</h2>
        <p>{t.sections.law.content}</p>
      </article>
    </div>
  );
}
