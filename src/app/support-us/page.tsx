'use client';

import Link from 'next/link';
import {
  Heart,
  Shield,
  Users,
  CreditCard,
  Bitcoin,
  CheckCircle,
  Sparkles,
  ExternalLink,
  HeartHandshake,
  Target,
  BookOpen,
  Briefcase,
  Home,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Script from 'next/script';

// Program 1 Features - Public Protection
const program1Features = [
  {
    text: 'Development and improvement of our free fraud detection system',
    icon: Target,
  },
  {
    text: 'Marketing and awareness campaigns to reach as many people as possible',
    icon: Users,
  },
  {
    text: 'Legal services that help us create a safe and effective environment',
    icon: Shield,
  },
];

// Program 2 Features - Second Chance
const program2Features = [
  {
    text: 'Retraining courses and educational programs for people released from prison',
    icon: BookOpen,
  },
  {
    text: 'Financial support to help them find jobs and reintegrate into society',
    icon: Briefcase,
  },
  {
    text: 'Assistance with basic needs when starting a new life',
    icon: Home,
  },
];

// JSON-LD Schemas
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'Nonprofit organization dedicated to fraud prevention, victim support, and rehabilitation programs for those seeking redemption.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer support',
  },
};

const donateActionSchema = {
  '@context': 'https://schema.org',
  '@type': 'DonateAction',
  name: 'Support ScamNemesis Mission',
  description: 'Donate to help protect fraud victims and support second chance rehabilitation programs.',
  url: 'https://scamnemesis.com/support-us',
  agent: {
    '@type': 'Organization',
    name: 'ScamNemesis',
  },
  recipient: [
    {
      '@type': 'Organization',
      name: 'Public Protection Program',
      description: 'Fraud detection, awareness campaigns, and legal advocacy',
    },
    {
      '@type': 'Organization',
      name: 'Second Chance Program',
      description: 'Rehabilitation, retraining, and reintegration support',
    },
  ],
  acceptedPaymentMethod: ['CreditCard', 'CryptoCurrency'],
};

const ngoSchema = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  description: 'Non-profit organization dedicated to fraud prevention, victim support, and redemption programs.',
  areaServed: {
    '@type': 'Place',
    name: 'Worldwide',
  },
  knowsAbout: [
    'Fraud Prevention',
    'Cryptocurrency Scams',
    'Investment Fraud',
    'Criminal Rehabilitation',
    'Victim Support',
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
      name: 'Support Us',
      item: 'https://scamnemesis.com/support-us',
    },
  ],
};

export default function SupportUsPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="donate-action-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donateActionSchema) }}
      />
      <Script
        id="ngo-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ngoSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Premium Dark Gradient */}
        <section className="relative w-full py-28 md:py-36 lg:py-44 overflow-hidden bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-500/10 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-5xl mx-auto text-center">
              {/* Heart Icon with glow effect */}
              <div className="relative inline-flex mb-12">
                <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-rose-500 to-pink-500 p-7 rounded-2xl shadow-2xl shadow-rose-500/20">
                  <Heart className="h-16 w-16 md:h-20 md:w-20 text-white" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-10 leading-tight tracking-tight">
                Support Our Mission –{' '}
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Help Us Bring Justice and Safety to Everyone
                </span>
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-slate-300/90 max-w-4xl mx-auto mb-10 leading-relaxed">
                Our vision is that justice and safety should not be reserved only for those who can afford them financially. We want our services to be available free of charge to everyone – because every person deserves protection, a chance for a new beginning, and fair treatment.
              </p>

              <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                To remain independent and sustainable, some of our services must be paid. However, we do everything possible to ensure that the majority of our activities remain completely free for victims of fraud and for those seeking a second chance.
              </p>
            </div>
          </div>
        </section>

        {/* How You Can Help Section */}
        <section className="w-full py-24 md:py-32 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-20 md:mb-24">
                <div className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-base font-medium mb-10">
                  <Sparkles className="h-5 w-5" />
                  How You Can Help
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-10 leading-tight">
                  Your contribution allows us to continue work that makes a{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400">
                    real impact
                  </span>
                </h2>

                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
                  You can support us with a one-time or recurring donation – by credit card or cryptocurrency – and choose which of our two programs you would like to support:
                </p>
              </div>

              {/* Donation Programs */}
              <div className="space-y-14 lg:space-y-16">
                {/* Program 1: Public Protection */}
                <Card className="group relative overflow-hidden border-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />

                  <CardContent className="relative z-10 p-10 md:p-14 lg:p-16">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                        <Shield className="h-12 w-12 text-white" />
                      </div>
                      <div>
                        <div className="inline-flex px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-3">
                          PROGRAM 1
                        </div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                          Public Protection and Fighting Fraudsters
                        </h3>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-10 p-8 md:p-10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/30 rounded-2xl">
                      <ul className="space-y-6">
                        {program1Features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <li key={index} className="flex items-start gap-5">
                              <div className="flex-shrink-0 p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                                {feature.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Impact Statement */}
                    <div className="mb-12 p-6 border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-xl">
                      <p className="text-lg text-blue-800 dark:text-blue-200 font-medium flex items-start gap-3">
                        <span className="text-2xl">👉</span>
                        <span>Your support in this fund means fewer victims of fraud and stronger public protection.</span>
                      </p>
                    </div>

                    {/* Payment Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5">
                      <Link
                        href="https://donate.stripe.com/8x28wPegKgey17xad63F600"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 px-10 py-5 md:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 group"
                      >
                        <CreditCard className="h-6 w-6" />
                        <span>Pay by Card</span>
                        <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <Link
                        href="https://trocador.app/en/anonpay/?ticker_to=usdt&network_to=ERC20&address=0x0d17e5E07e1115D7C001245922f8e30C98781a8C&fiat_equiv=USD&name=scamnemesis.com&email=info@scamnemesis.com&bgcolor=00000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 px-10 py-5 md:py-6 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      >
                        <Bitcoin className="h-6 w-6" />
                        <span>Pay with Crypto</span>
                        <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Program 2: Second Chance */}
                <Card className="group relative overflow-hidden border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />

                  <CardContent className="relative z-10 p-10 md:p-14 lg:p-16">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                        <HeartHandshake className="h-12 w-12 text-white" />
                      </div>
                      <div>
                        <div className="inline-flex px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-3">
                          PROGRAM 2
                        </div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                          A Second Chance for People Who Want to Leave Crime Behind
                        </h3>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-10 p-8 md:p-10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl">
                      <ul className="space-y-6">
                        {program2Features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <li key={index} className="flex items-start gap-5">
                              <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                                {feature.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Impact Statement */}
                    <div className="mb-12 p-6 border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-r-xl">
                      <p className="text-lg text-emerald-800 dark:text-emerald-200 font-medium flex items-start gap-3">
                        <span className="text-2xl">👉</span>
                        <span>Your support here changes lives – giving a chance to those who want to leave criminal environments and live honestly.</span>
                      </p>
                    </div>

                    {/* Payment Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5">
                      <Link
                        href="https://donate.stripe.com/aFabJ10pUfau2bB9923F601"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 px-10 py-5 md:py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 group"
                      >
                        <CreditCard className="h-6 w-6" />
                        <span>Pay by Card</span>
                        <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <Link
                        href="https://trocador.app/en/anonpay/?ticker_to=usdt&network_to=TRC20&address=TCgCfp1Ve5vKpmuaK8M7btt9BSCUKqzXQR&fiat_equiv=USD&name=Scamnemesis+second+chance+&email=info@scamnemesis.com&bgcolor=00000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 px-10 py-5 md:py-6 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      >
                        <Bitcoin className="h-6 w-6" />
                        <span>Pay with Crypto</span>
                        <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="relative inline-flex mb-8">
                <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-rose-500 to-pink-500 p-6 rounded-2xl shadow-2xl">
                  <Heart className="h-14 w-14 text-white" />
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight flex items-center justify-center gap-4">
                  <span className="text-4xl md:text-5xl">💙</span>
                  <span>Support us today and become part of the change.</span>
                </p>

                <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Your contribution – no matter how big or small – means more than you can imagine. Together we can build a world where justice is accessible to everyone.
                </p>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-10 pt-10 text-slate-400">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-base">100% Transparent</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <span className="text-base">Secure Payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5" />
                  <span className="text-base">Every Donation Counts</span>
                </div>
              </div>

              {/* Contact Link */}
              <div className="pt-8">
                <p className="text-slate-400">
                  Have questions?{' '}
                  <Link href="/contact-us" className="text-rose-400 hover:text-rose-300 underline underline-offset-4 font-semibold transition-colors">
                    Contact us
                  </Link>{' '}
                  to learn more about our work.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
