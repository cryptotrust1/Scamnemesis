import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Ochrana osobnych udajov | Scamnemesis',
  description: 'Zasady ochrany osobnych udajov Scamnemesis',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Spat na hlavnu stranku
        </Button>
      </Link>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Ochrana osobnych udajov</h1>
        <p className="lead">
          Posledna aktualizacia: 1.1.2025
        </p>

        <h2>1. Uvod</h2>
        <p>
          Spolocnost Scamnemesis (&quot;my&quot;, &quot;nas&quot; alebo &quot;nasa spolocnost&quot;) sa zavazuje
          chranit vase sukromie. Tieto zasady ochrany osobnych udajov vysvetluju, ako
          zhromazdujeme, pouzivame a chranime vase osobne udaje.
        </p>

        <h2>2. Prevadzkovatel</h2>
        <p>
          Prevádzkovateľom osobných údajov je:
        </p>
        <ul>
          <li>Scamnemesis s.r.o.</li>
          <li>Email: privacy@scamnemesis.com</li>
        </ul>

        <h2>3. Ake udaje zhromazdujeme</h2>
        <h3>3.1 Udaje, ktore nam poskytnete</h3>
        <ul>
          <li>Registracne udaje (email, heslo)</li>
          <li>Profilove informacie (meno, telefon - volitelne)</li>
          <li>Hlasenia o podvodoch a prilozene dokumenty</li>
          <li>Komunikaciu s nami</li>
        </ul>

        <h3>3.2 Automaticky zhromazdovane udaje</h3>
        <ul>
          <li>IP adresa a priblizna poloha</li>
          <li>Typ prehliadaca a zariadenia</li>
          <li>Cas a datum navstevy</li>
          <li>Stranky, ktore ste navstivili</li>
          <li>Odkazujuca stranka</li>
        </ul>

        <h3>3.3 Cookies</h3>
        <p>
          Pouzivame cookies a podobne technologie na:
        </p>
        <ul>
          <li>Udrzanie vaseho prihlasenia</li>
          <li>Zapamätanie vasich preferencii</li>
          <li>Analyzu navstevnosti</li>
          <li>Zlepsovanie nasich sluzieb</li>
        </ul>

        <h2>4. Ako pouzivame vase udaje</h2>
        <p>Vase osobne udaje pouzivame na:</p>
        <ul>
          <li>Poskytovanie a spravu nasich sluzieb</li>
          <li>Spracovanie a zverejnovanie hlaseni o podvodoch</li>
          <li>Komunikaciu s vami o vasich hlaseniach</li>
          <li>Zlepsovanie nasich sluzieb</li>
          <li>Ochranu pred zneuzitim a podvodmi</li>
          <li>Plnenie nasich pravnych povinnosti</li>
        </ul>

        <h2>5. Pravny zaklad spracovania</h2>
        <p>Vase udaje spracuvavame na zaklade:</p>
        <ul>
          <li><strong>Suhlas</strong> - pre marketingovu komunikaciu</li>
          <li><strong>Zmluva</strong> - pre poskytovanie sluzieb</li>
          <li><strong>Opravneny zaujem</strong> - pre bezpecnost a zlepsovanie sluzieb</li>
          <li><strong>Pravna povinnost</strong> - pre dodrzanie zakonov</li>
        </ul>

        <h2>6. Zdielanie udajov</h2>
        <p>Vase udaje mozeme zdielat s:</p>
        <ul>
          <li>Poskytovatelia sluzieb (hosting, email, analyticke nastroje)</li>
          <li>Organy cinne v trestnom konani (na zaklade zakona)</li>
          <li>Ine strany s vasim suhlasom</li>
        </ul>
        <p>
          <strong>Nikdy nepredavame</strong> vase osobne udaje tretim stranam na marketingove ucely.
        </p>

        <h2>7. Maskovanie citlivych udajov</h2>
        <p>
          Pre ochranu sukromia aplikujeme systém maskovania citlivych udajov:
        </p>
        <ul>
          <li>Telefonne cisla su ciastocne skryte (napr. +421 9** *** **9)</li>
          <li>Emailove adresy su ciastocne skryte (napr. j***@example.com)</li>
          <li>IBAN cisla su ciastocne skryte</li>
          <li>Plne udaje su dostupne len overenym pouzivatelom</li>
        </ul>

        <h2>8. Bezpecnost udajov</h2>
        <p>Implementovali sme technicke a organizacne opatrenia na ochranu vasich udajov:</p>
        <ul>
          <li>Sifrovanie dat pri prenose (HTTPS/TLS)</li>
          <li>Sifrovanie citlivych udajov v databaze</li>
          <li>Pristupove kontroly a autentifikacia</li>
          <li>Pravidelne bezpecnostne audity</li>
          <li>Zaznamenávanie pristupov (audit log)</li>
        </ul>

        <h2>9. Uchovavanie udajov</h2>
        <p>
          Vase osobne udaje uchvavame len po dobu nevyhnutnu na splnenie ucelov,
          na ktore boli zhromazdene:
        </p>
        <ul>
          <li>Uctovne udaje - 10 rokov (podla zakona)</li>
          <li>Hlasenia o podvodoch - 5 rokov od poslednej aktualizacie</li>
          <li>Neaktivne ucty - 2 roky od posledneho prihlasenia</li>
        </ul>

        <h2>10. Vase prava</h2>
        <p>Podla GDPR mate pravo na:</p>
        <ul>
          <li><strong>Pristup</strong> - ziskat kopiu vasich udajov</li>
          <li><strong>Opravu</strong> - opravit nepresne udaje</li>
          <li><strong>Vymazanie</strong> - poziadat o vymazanie vasich udajov</li>
          <li><strong>Obmedzenie</strong> - obmedzit spracovanie vasich udajov</li>
          <li><strong>Prenositelnost</strong> - ziskat udaje v strojovo citatelnom formate</li>
          <li><strong>Namietku</strong> - namietat proti spracovaniu</li>
          <li><strong>Odvolanie suhlasu</strong> - kedykolvek odvolat suhlas</li>
        </ul>
        <p>
          Pre uplatnenie vasich prav nas kontaktujte na privacy@scamnemesis.com.
        </p>

        <h2>11. Medzinarodne prenosy</h2>
        <p>
          Vase udaje mozu byt prenesene a spracovane v krajinách mimo EHP.
          V takom pripade zabezpecujeme primeranu uroven ochrany pomocou:
        </p>
        <ul>
          <li>Standardnych zmluvnych doloziek EU</li>
          <li>Certifikacii (napr. EU-US Data Privacy Framework)</li>
        </ul>

        <h2>12. Deti</h2>
        <p>
          Nase sluzby nie su urcene pre osoby mladsie ako 18 rokov. Vedome
          nezhromazdujeme udaje od deti. Ak zistime, ze sme zhromazdili udaje
          od dietata, okamzite ich vymazeme.
        </p>

        <h2>13. Zmeny tychto zasad</h2>
        <p>
          Tieto zasady mozeme priebezne aktualizovat. O vyznamnych zmenach vas
          budeme informovat emailom alebo oznamenim na nasej stranke.
        </p>

        <h2>14. Kontakt a staznosti</h2>
        <p>
          Ak mate otazky alebo staznosti tykajuce sa ochrany vasich osobnych udajov:
        </p>
        <ul>
          <li>Email: privacy@scamnemesis.com</li>
          <li>Formular: <Link href="/contact">Kontaktny formular</Link></li>
        </ul>
        <p>
          Mate tiez pravo podat staznost na dozorny organ - Urad na ochranu
          osobnych udajov Slovenskej republiky (www.dataprotection.gov.sk).
        </p>

        <h2>15. Dodatocne informacie pre kalifornskych obyvatelov (CCPA)</h2>
        <p>
          Ak ste obyvatelom Kalifornie, mate dodatocne prava podla CCPA, vratane
          prava vediet, ake osobne informacie sa zhromazduju, a prava poziadovat
          o ich vymazanie.
        </p>
      </article>
    </div>
  );
}
