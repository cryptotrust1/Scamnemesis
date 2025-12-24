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
import { useTranslation } from '@/lib/i18n/context';

const valueIcons = [Scale, Search, Globe, Heart];

export default function AboutPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { t, tv } = useTranslation();

  // Get typed arrays from translations
  const valuesItems = tv<Array<{ title: string; description: string }>>('pages.about.values.items');
  const credentials = tv<string[]>('pages.about.team.credentials');
  const servicesItems = tv<Array<{ name: string; description: string }>>('pages.about.services.items');

  return (
    <div className="flex flex-col">
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-5 text-[#0E74FF]" />
            <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-4">
              {t('pages.about.hero.title')}
            </h1>
            <p className="text-base text-[#64748b] md:text-lg mb-6 leading-relaxed">
              {t('pages.about.hero.description')}
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
                <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl mb-4">{t('pages.about.mission.title')}</h2>
                <p className="text-[#64748b] mb-4 text-sm leading-relaxed">
                  {t('pages.about.mission.text1')}
                </p>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  {t('pages.about.mission.text2')}
                </p>
              </div>
              <div className="relative h-56 md:h-72 rounded-lg overflow-hidden border border-[#e8e8e8]">
                <Image
                  src="/images/section-team.png"
                  alt={t('pages.about.mission.imageAlt')}
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
          <h2 className="text-xl font-semibold text-[#1e293b] text-center mb-10 sm:text-2xl">{t('pages.about.values.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {valuesItems.map((value, index) => {
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
              <h2 className="text-xl font-semibold text-[#1e293b] mb-3 sm:text-2xl">{t('pages.about.team.title')}</h2>
              <p className="text-[#64748b] text-sm">
                {t('pages.about.team.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {credentials.map((credential) => (
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
          <h2 className="text-xl font-semibold text-[#1e293b] text-center mb-10 sm:text-2xl">{t('pages.about.services.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {servicesItems.map((service) => (
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
          <h2 className="text-lg font-semibold text-[#1e293b] text-center mb-8">{t('pages.about.certifications.title')}</h2>
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
              {t('pages.about.cta.title')}
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              {t('pages.about.cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href={`/${locale}/search`}>
                  {t('pages.about.cta.scamChecker')}
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-white" asChild>
                <Link href={`/${locale}/contact-us`}>
                  {t('pages.about.cta.contact')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
