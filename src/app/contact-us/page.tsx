'use client';

import Link from 'next/link';
import { Mail, AlertTriangle, Shield, Clock, Headphones } from 'lucide-react';

export default function ContactUsPage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
    logo: 'https://scamnemesis.com/logo.png',
    description: 'Fraud investigation and scam recovery services',
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

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us - ScamNemesis',
    description: 'Contact ScamNemesis for fraud reporting, inquiries, and support.',
    url: 'https://scamnemesis.com/contact-us',
    mainEntity: {
      '@type': 'Organization',
      name: 'ScamNemesis',
      email: 'info@scamnemesis.com',
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
        name: 'Contact Us',
        item: 'https://scamnemesis.com/contact-us',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 dark:from-black dark:via-slate-950 dark:to-black">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]" />
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-32 sm:py-40 lg:py-52">
            <div className="text-center space-y-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Headphones className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">Get in Touch</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-white">Contact </span>
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    us
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                  You can contact us by email. But if you want to report a scam, please click the button below and fill out the form — without it, we won&apos;t be able to help you effectively.
                </p>
              </div>

              {/* Email Display */}
              <div className="pt-8">
                <a
                  href="mailto:info@scamnemesis.com"
                  className="group inline-flex items-center gap-5 px-10 py-7 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-blue-500/25">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-slate-400 mb-1">Email us at</p>
                    <span className="text-2xl sm:text-3xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                      info@scamnemesis.com
                    </span>
                  </div>
                </a>
              </div>

              {/* Report Scam CTA */}
              <div className="pt-12 space-y-6">
                <div className="flex items-center justify-center gap-3 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">Need to report fraud?</span>
                </div>

                <Link
                  href="/report/new"
                  className="group relative inline-flex items-center gap-3 px-12 py-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white text-xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  <span className="relative">Report scam</span>
                  <svg
                    className="relative w-6 h-6 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="relative py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Fast Response */}
              <div className="group text-center p-10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 mb-6">
                  <Clock className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Quick Response</h3>
                <p className="text-slate-400 leading-relaxed">
                  We respond to all inquiries within 24-48 hours
                </p>
              </div>

              {/* Confidential */}
              <div className="group text-center p-10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 mb-6">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Confidential</h3>
                <p className="text-slate-400 leading-relaxed">
                  Your information is protected and kept strictly confidential
                </p>
              </div>

              {/* Expert Support */}
              <div className="group text-center p-10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 mb-6">
                  <Headphones className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Expert Support</h3>
                <p className="text-slate-400 leading-relaxed">
                  Our team of specialists is here to assist you
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="relative py-24 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 to-transparent" />

          <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <div className="p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to take action?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                If you&apos;ve been affected by fraud, don&apos;t wait. Submit a detailed report so our team can begin investigating your case.
              </p>
              <Link
                href="/report/new"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-white text-slate-900 text-lg font-semibold hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Report scam
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-16 sm:h-24" />
      </div>
    </>
  );
}
