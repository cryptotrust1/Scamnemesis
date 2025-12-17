import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Podmienky pouzivania | Scamnemesis',
  description: 'Podmienky pouzivania sluzby Scamnemesis',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Spat na hlavnu stranku
        </Button>
      </Link>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Podmienky pouzivania</h1>
        <p className="lead">
          Posledna aktualizacia: 1.1.2025
        </p>

        <h2>1. Uvod</h2>
        <p>
          Vitajte na Scamnemesis. Tieto podmienky pouzivania (&quot;Podmienky&quot;) upravuju
          vase pouzivanie nasej webovej stranky a sluzieb. Pouzitim nasich sluzieb
          suhlasite s tymito Podmienkami.
        </p>

        <h2>2. Popis sluzby</h2>
        <p>
          Scamnemesis je platforma na nahlasovanie a vyhladavanie informacii o podvodoch.
          Sluzimy ako databaza hlaseni od pouzivatelov s cielom varovat ostatnych pred
          potencialnymi podvodnikmi.
        </p>

        <h2>3. Pouzivanie sluzby</h2>
        <h3>3.1 Opravneni pouzivatelia</h3>
        <p>
          Sluzibu mozu pouzivat osoby starsie ako 18 rokov. Pouzitim sluzby potvrdzujete,
          ze splnate tuto podmienku.
        </p>

        <h3>3.2 Registracia a ucet</h3>
        <p>
          Pre niektore funkcie je potrebna registracia. Ste zodpovedni za:
        </p>
        <ul>
          <li>Udrzanie dovoernosti vasich prihlasovacich udajov</li>
          <li>Vsetky aktivity pod vasim uctom</li>
          <li>Okamzite oznamenie akehokolvek neopravneneho pristupu</li>
        </ul>

        <h3>3.3 Zakazane aktivity</h3>
        <p>Pri pouzivani sluzby je zakazane:</p>
        <ul>
          <li>Zverejnovat nepravdive alebo zaavadzajuce informacie</li>
          <li>Zneuzivat sluzbu na osobne utoky alebo pomstu</li>
          <li>Zverejnovat informacie o nevinnych osobach</li>
          <li>Porusovat autorske prava alebo ine prava tretich stran</li>
          <li>Pokusit sa o neopravneny pristup k systemu</li>
          <li>Pouzivat automatizovane nastroje bez povolenia</li>
        </ul>

        <h2>4. Obsah pouzivatelov</h2>
        <h3>4.1 Vase hlasenia</h3>
        <p>
          Zverejnenim hlasenia:
        </p>
        <ul>
          <li>Potvrdzujete, ze informacie su podla vaseho najlepsieho vedomia pravdive</li>
          <li>Udelujete nam pravo pouzit, upravit a zverejnit tento obsah</li>
          <li>Preberatate zodpovednost za presnost informacii</li>
        </ul>

        <h3>4.2 Moderacia obsahu</h3>
        <p>
          Vyhradzujeme si pravo:
        </p>
        <ul>
          <li>Skontrolovat vsetky hlasenia pred zverejnenim</li>
          <li>Upravit alebo odstranit obsah porusujuci tieto Podmienky</li>
          <li>Zrusit ucty, ktore opakovane porusuju pravidla</li>
        </ul>

        <h2>5. Maskovanie udajov</h2>
        <p>
          Pre ochranu sukromia su citlive udaje (telefonne cisla, emaily, IBAN)
          ciastocne maskovane. Plne udaje su dostupne len pouzivatelom s vyssou
          urovnou pristupu.
        </p>

        <h2>6. Obmedzenie zodpovednosti</h2>
        <p>
          Scamnemesis:
        </p>
        <ul>
          <li>Negarantuje presnost informacii v hlaseniach</li>
          <li>Nie je zodpovedny za rozhodnutia zalozene na tychto informaciach</li>
          <li>Nepreberá zodpovednost za skody vzniknute pouzitim sluzby</li>
        </ul>

        <h2>7. Zmeny podmienok</h2>
        <p>
          Vyhradzujeme si pravo kedykolvek zmenit tieto Podmienky. O vyznamnych
          zmenach vas budeme informovat emailom alebo oznamenim na stranke.
        </p>

        <h2>8. Kontakt</h2>
        <p>
          Ak mate otazky k tymto Podmienkam, kontaktujte nas:
        </p>
        <ul>
          <li>Email: legal@scamnemesis.com</li>
          <li>Formular: <Link href="/contact">Kontaktny formular</Link></li>
        </ul>

        <h2>9. Rozhodne pravo</h2>
        <p>
          Tieto Podmienky sa riadia pravnym poriadkom Slovenskej republiky.
          Akekolvek spory budu riesene prislusnymi sudmi Slovenskej republiky.
        </p>
      </article>
    </div>
  );
}
