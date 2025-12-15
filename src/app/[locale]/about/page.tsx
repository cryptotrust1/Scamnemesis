'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Shield,
  Users,
  Target,
  Heart,
  CheckCircle,
  Scale,
  Search,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Locale = 'en' | 'sk';

const getTranslations = (locale: Locale) => {
  const translations = {
    en: {
      hero: {
        title: 'About ScamNemesis',
        description: 'We are a team of lawyers, forensic analysts, and ethical hackers dedicated to helping victims of crypto scams and investment frauds. Our mission is to protect people from fraud and help those who have been victimized.',
      },
      mission: {
        title: 'Our Mission',
        text1: 'To create a safer digital environment by providing accessible fraud prevention tools, professional investigation services, and support for victims of online scams.',
        text2: "We believe everyone deserves protection from fraud, regardless of their financial situation. That's why we offer free tools alongside our professional services.",
        imageAlt: 'Our Team',
      },
      values: {
        title: 'Our Values',
        items: [
          {
            title: 'Transparency',
            description: 'We are honest about what we can and cannot do. No false promises, just professional investigation.',
          },
          {
            title: 'Expertise',
            description: 'Our team includes certified fraud examiners, OSINT specialists, and legal professionals.',
          },
          {
            title: 'Accessibility',
            description: 'Justice and safety should not be reserved only for those who can afford them financially.',
          },
          {
            title: 'Compassion',
            description: 'We understand the emotional impact of being scammed and treat every victim with respect.',
          },
        ],
      },
      team: {
        title: 'Expert Team',
        description: 'Our team holds certifications from leading institutions with backgrounds in financial crime investigation, military intelligence, and Big 4 consulting.',
        credentials: [
          'Certified Fraud Examiners (CFE®)',
          'Certified Anti-Money Laundering Specialists (CAMS®)',
          'Certified Information Systems Auditors (CISA®)',
          'Certified Information Security Managers (CISM®)',
          'Offensive Security Certified Professionals (OSCP®)',
          'Military Intelligence Background',
          'Big 4 Consulting Experience',
        ],
      },
      services: {
        title: 'What We Offer',
        items: [
          { name: 'Scam Checker', description: 'Free tool to verify identities and check for fraud indicators' },
          { name: 'Scam Reporting', description: 'Comprehensive form to document and report fraud incidents' },
          { name: 'Money Recovery', description: 'Professional investigation and fund recovery services' },
          { name: 'Due Diligence', description: 'Business partner vetting and corporate verification' },
          { name: 'Training', description: 'Cybersecurity and fraud prevention courses (coming soon)' },
          { name: 'Second Chance Program', description: 'Rehabilitation support for former offenders' },
        ],
      },
      certifications: {
        title: 'Our Certifications',
      },
      cta: {
        title: 'Need Help?',
        description: "Whether you want to check someone's legitimacy, report a scam, or need help recovering your money — we're here for you.",
        scamChecker: 'Use Scam Checker',
        contact: 'Contact Us',
      },
    },
    sk: {
      hero: {
        title: 'O ScamNemesis',
        description: 'Sme tím právnikov, forenzných analytikov a etických hackerov, ktorí sa venujú pomoci obetiam krypto podvodov a investičných podvodov. Našou misiou je chrániť ľudí pred podvodmi a pomáhať tým, ktorí sa stali obeťami.',
      },
      mission: {
        title: 'Naša misia',
        text1: 'Vytvoriť bezpečnejšie digitálne prostredie poskytovaním dostupných nástrojov na prevenciu podvodov, profesionálnych vyšetrovacích služieb a podpory pre obete online podvodov.',
        text2: 'Veríme, že každý si zaslúži ochranu pred podvodmi, bez ohľadu na svoju finančnú situáciu. Preto ponúkame bezplatné nástroje popri našich profesionálnych službách.',
        imageAlt: 'Náš tím',
      },
      values: {
        title: 'Naše hodnoty',
        items: [
          {
            title: 'Transparentnosť',
            description: 'Sme úprimní v tom, čo môžeme a nemôžeme urobiť. Žiadne falošné sľuby, len profesionálne vyšetrovanie.',
          },
          {
            title: 'Odbornosť',
            description: 'Náš tím zahŕňa certifikovaných vyšetrovateľov podvodov, OSINT špecialistov a právnych profesionálov.',
          },
          {
            title: 'Dostupnosť',
            description: 'Spravodlivosť a bezpečnosť by nemali byť vyhradené len pre tých, ktorí si ich môžu finančne dovoliť.',
          },
          {
            title: 'Súcit',
            description: 'Chápeme emocionálny dopad podvodu a ku každej obeti pristupujeme s rešpektom.',
          },
        ],
      },
      team: {
        title: 'Expertný tím',
        description: 'Náš tím má certifikácie od popredných inštitúcií so skúsenosťami vo vyšetrovaní finančnej kriminality, vojenskom spravodajstve a Big 4 konzultingu.',
        credentials: [
          'Certifikovaní vyšetrovatelia podvodov (CFE®)',
          'Certifikovaní špecialisti na boj proti praniu špinavých peňazí (CAMS®)',
          'Certifikovaní audítori informačných systémov (CISA®)',
          'Certifikovaní manažéri informačnej bezpečnosti (CISM®)',
          'Offensive Security Certified Professionals (OSCP®)',
          'Skúsenosti z vojenského spravodajstva',
          'Skúsenosti z Big 4 konzultingu',
        ],
      },
      services: {
        title: 'Čo ponúkame',
        items: [
          { name: 'Kontrola podvodov', description: 'Bezplatný nástroj na overenie identity a kontrolu indikátorov podvodu' },
          { name: 'Nahlásenie podvodu', description: 'Komplexný formulár na dokumentáciu a nahlásenie incidentov podvodu' },
          { name: 'Vymáhanie peňazí', description: 'Profesionálne vyšetrovanie a služby na vymáhanie prostriedkov' },
          { name: 'Due Diligence', description: 'Preverovanie obchodných partnerov a firemná verifikácia' },
          { name: 'Školenia', description: 'Kurzy kybernetickej bezpečnosti a prevencie podvodov (čoskoro)' },
          { name: 'Program druhej šance', description: 'Podpora rehabilitácie pre bývalých páchateľov' },
        ],
      },
      certifications: {
        title: 'Naše certifikácie',
      },
      cta: {
        title: 'Potrebujete pomoc?',
        description: 'Či chcete overiť niekoho legitimitu, nahlásiť podvod alebo potrebujete pomoc s vrátením peňazí — sme tu pre vás.',
        scamChecker: 'Použiť kontrolu podvodov',
        contact: 'Kontaktujte nás',
      },
    },
  };
  return translations[locale] || translations.en;
};

const valueIcons = [Scale, Search, Globe, Heart];

export default function AboutPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = getTranslations(locale);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-5 text-[#0E74FF]" />
            <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-4">
              {t.hero.title}
            </h1>
            <p className="text-base text-[#64748b] md:text-lg mb-6 leading-relaxed">
              {t.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section - Clean bordered style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Target className="h-8 w-8 mb-4 text-[#0E74FF]" />
                <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl mb-4">{t.mission.title}</h2>
                <p className="text-[#64748b] mb-4 text-sm leading-relaxed">
                  {t.mission.text1}
                </p>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  {t.mission.text2}
                </p>
              </div>
              <div className="relative h-56 md:h-72 rounded-lg overflow-hidden border border-[#e8e8e8]">
                <Image
                  src="/images/section-team.png"
                  alt={t.mission.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Clean bordered cards */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-xl font-semibold text-[#1e293b] text-center mb-10 sm:text-2xl">{t.values.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {t.values.items.map((value, index) => {
              const Icon = valueIcons[index];
              return (
                <Card key={value.title} className="border border-[#e8e8e8] shadow-none">
                  <CardHeader className="text-center pb-2">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-[#0E74FF]" />
                    <CardTitle className="text-base font-medium text-[#1e293b]">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[#64748b] text-center leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Credentials Section - Clean bordered */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Users className="h-8 w-8 mx-auto mb-4 text-[#0E74FF]" />
              <h2 className="text-xl font-semibold text-[#1e293b] mb-3 sm:text-2xl">{t.team.title}</h2>
              <p className="text-[#64748b] text-sm">
                {t.team.description}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {t.team.credentials.map((credential) => (
                <div key={credential} className="flex items-center gap-2 p-3 bg-white border border-[#e8e8e8] rounded-lg">
                  <CheckCircle className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm text-[#1e293b]">{credential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section - Clean bordered cards */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-xl font-semibold text-[#1e293b] text-center mb-10 sm:text-2xl">{t.services.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {t.services.items.map((service) => (
              <Card key={service.name} className="border border-[#e8e8e8] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#1e293b]">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#64748b] leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section - Clean minimal */}
      <section className="w-full py-12 border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <h2 className="text-lg font-semibold text-[#1e293b] text-center mb-8">{t.certifications.title}</h2>
          <div className="flex flex-wrap justify-center gap-10 max-w-3xl mx-auto">
            <Image src="/images/cert-1.png" alt="Certification 1" width={80} height={80} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-2.png" alt="Certification 2" width={80} height={80} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-3.png" alt="Certification 3" width={80} height={80} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </div>
      </section>

      {/* CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-5 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl">
              {t.cta.title}
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              {t.cta.description}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href={`/${locale}/search`}>
                  {t.cta.scamChecker}
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-white" asChild>
                <Link href={`/${locale}/contact-us`}>
                  {t.cta.contact}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
