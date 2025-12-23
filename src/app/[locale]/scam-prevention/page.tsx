'use client';

import Link from 'next/link';
import Script from 'next/script';
import {
  Shield,
  AlertTriangle,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  FileText,
  Users,
  TrendingUp,
  Heart,
  ShoppingCart,
  MonitorSmartphone,
  Briefcase,
  Home,
  Gift,
  HeartHandshake,
  Building2,
  Pill,
  Hammer,
  Camera,
  FolderOpen,
  FileCheck,
  DollarSign,
  LifeBuoy,
  AlertCircle,
  CheckCircle2,
  Ban,
  Zap,
  Eye,
  MessageSquare,
  Sparkles,
  Target,
  Brain,
  Bitcoin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/context';

// Icon mappings
const warningSignIcons = [Clock, CreditCard, AlertTriangle, FileText, Mail, Phone, Lock, Ban];
const scamTypeIcons = [TrendingUp, Heart, Mail, MonitorSmartphone, Briefcase, ShoppingCart, Home, Gift, Bitcoin, CreditCard, HeartHandshake, Users];
const psychologyIcons = [Building2, Zap, Users, Heart, MessageSquare, Brain];
const evidenceIcons = [Mail, Camera, FileCheck, FolderOpen];

// JSON-LD Schemas for SEO (keeping these as-is since they are for search engines)
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Comprehensive Anti-Scam Guide: Prevention, Detection & Recovery',
  description: 'Your practical security guide to identifying threats, preventing financial losses, and responding effectively to fraud.',
  datePublished: '2025-01-01',
  dateModified: '2025-12-15',
  author: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    logo: {
      '@type': 'ImageObject',
      url: 'https://scamnemesis.com/images/logo.png',
      width: 600,
      height: 60,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://scamnemesis.com/scam-prevention',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'What to Do If You Have Been Scammed - 5-Step Immediate Action Protocol',
  description: 'Critical steps to take within 24 hours of discovering a scam to maximize recovery chances.',
  totalTime: 'PT2H',
  estimatedCost: {
    '@type': 'PriceSpecification',
    priceCurrency: 'USD',
    price: '0',
  },
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Stop all communication and transfers immediately', text: 'Cease contact with the suspected scammer and halt any ongoing transactions.' },
    { '@type': 'HowToStep', position: 2, name: 'Contact your financial institution within 24 hours', text: 'Report fraudulent transactions and request holds, reversals, or account freezes as needed.' },
    { '@type': 'HowToStep', position: 3, name: 'Secure all accounts with new passwords', text: 'Change passwords for all potentially compromised accounts using strong, unique credentials.' },
    { '@type': 'HowToStep', position: 4, name: 'Document everything comprehensively', text: 'Save all communications, receipts, screenshots, and transaction records before they disappear.' },
    { '@type': 'HowToStep', position: 5, name: 'File official reports with authorities', text: 'Report to local police, FBI IC3, FTC, and relevant regulatory bodies to create official record.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is a scam?', acceptedAnswer: { '@type': 'Answer', text: 'A scam is a fraudulent scheme designed to deceive individuals into parting with money, personal information, or assets through false promises, misrepresentation, or manipulation.' } },
    { '@type': 'Question', name: 'What are the warning signs of a scam?', acceptedAnswer: { '@type': 'Answer', text: 'Key warning signs include: pressure to act quickly, requests for unconventional payment methods, unrealistic promises, missing regulatory verification, and resistance to independent verification.' } },
    { '@type': 'Question', name: 'What should I do if I have been scammed?', acceptedAnswer: { '@type': 'Answer', text: 'Take immediate action: Stop all communication, contact your financial institution within 24 hours, secure all accounts with new passwords, document everything, and file official reports with authorities.' } },
    { '@type': 'Question', name: 'How can I recover money lost to a scam?', acceptedAnswer: { '@type': 'Answer', text: 'Recovery depends on the payment method used. Credit/debit cards have 60-day chargeback windows. Bank transfers require action within 24 hours. Time is critical - act immediately.' } },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/images/logo.png',
  description: 'Leading platform for scam prevention, fraud reporting, and victim support.',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://scamnemesis.com' },
    { '@type': 'ListItem', position: 2, name: 'Scam Prevention Guide', item: 'https://scamnemesis.com/scam-prevention' },
  ],
};

// Types for translations
interface WarningSign {
  title: string;
  description: string;
}

interface Tactic {
  title: string;
  description: string;
}

interface ScamCategory {
  title: string;
  description: string;
  tips: string[];
}

interface ActionStep {
  title: string;
  description: string;
  actions: string[];
}

interface EvidenceType {
  title: string;
  items: string[];
}

interface RecoveryMethod {
  title: string;
  description: string;
  steps: string[];
  timeline: string;
}

interface SupportResource {
  title: string;
  description: string;
  contact: string;
  type: string;
}

export default function ScamPreventionPage() {
  const { t, locale } = useTranslation();

  // Get translations
  const tocItems = (t('scamPrevention.toc.items') as unknown as string[]) || [];
  const emergencyActions = (t('scamPrevention.emergency.actions') as unknown as string[]) || [];
  const warningSigns = (t('scamPrevention.riskAssessment.warningSigns') as unknown as WarningSign[]) || [];
  const tactics = (t('scamPrevention.psychology.tactics') as unknown as Tactic[]) || [];
  const scamCategories = (t('scamPrevention.scamCategories.categories') as unknown as ScamCategory[]) || [];
  const actionSteps = (t('scamPrevention.immediateAction.steps') as unknown as ActionStep[]) || [];
  const evidenceTypes = (t('scamPrevention.evidence.types') as unknown as EvidenceType[]) || [];
  const bestPracticesItems = (t('scamPrevention.evidence.bestPractices.items') as unknown as string[]) || [];
  const recoveryMethods = (t('scamPrevention.fundRecovery.methods') as unknown as RecoveryMethod[]) || [];
  const supportResources = (t('scamPrevention.supportResources.resources') as unknown as SupportResource[]) || [];

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="howto-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0E74FF]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E74FF]/20 backdrop-blur-sm border border-[#0E74FF]/30 mb-8">
                <Shield className="h-4 w-4 text-[#0E74FF]" />
                <span className="text-sm font-semibold text-[#0E74FF]">{t('scamPrevention.hero.subtitle')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                {t('scamPrevention.hero.title')} <span className="text-[#0E74FF]">{t('scamPrevention.hero.titleHighlight')}</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                {t('scamPrevention.hero.description')}
              </p>

              <Button
                size="lg"
                className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href={`/${locale}/report/new`}>
                  {t('scamPrevention.emergency.button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="w-full py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('scamPrevention.toc.title')}</h2>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
                <nav className="p-4 md:p-6 space-y-2">
                  {tocItems.map((item, index) => (
                    <a
                      key={index}
                      href={`#section-${index + 1}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#0E74FF]/5 dark:hover:bg-[#0E74FF]/10 transition-all duration-200 group border border-transparent hover:border-[#0E74FF]/20"
                    >
                      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white text-sm flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                        {index + 1}
                      </span>
                      <span className="text-sm md:text-base font-medium text-foreground group-hover:text-[#0E74FF] transition-colors">
                        {item}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#0E74FF] opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Emergency Response */}
        <section id="section-1" className="w-full py-16 md:py-20 bg-gradient-to-br from-red-50 via-red-50/50 to-orange-50/30 dark:from-red-950/30 dark:via-red-950/20 dark:to-orange-950/10">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-red-600">{t('scamPrevention.emergency.badge')}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-100">{t('scamPrevention.emergency.title')}</h2>
                </div>
              </div>
              <p className="text-red-800 dark:text-red-200 mb-8 text-lg">
                {t('scamPrevention.emergency.description')}
              </p>

              <div className="space-y-4">
                {emergencyActions.map((action, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-foreground font-medium pt-3">{action}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30" asChild>
                  <Link href={`/${locale}/report/new`}>
                    {t('scamPrevention.emergency.button')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Risk Assessment */}
        <section id="section-2" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                  <Eye className="h-4 w-4" />
                  {t('scamPrevention.riskAssessment.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.riskAssessment.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.riskAssessment.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {warningSigns.map((sign, index) => {
                  const Icon = warningSignIcons[index % warningSignIcons.length];
                  return (
                    <div
                      key={index}
                      className="group p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground mb-1">{sign.title}</h3>
                          <p className="text-sm text-muted-foreground">{sign.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Understanding Scams */}
        <section id="section-3" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                  <Target className="h-4 w-4" />
                  {t('scamPrevention.understanding.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.understanding.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.understanding.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Psychology */}
        <section id="section-4" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                  <Brain className="h-4 w-4" />
                  {t('scamPrevention.psychology.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.psychology.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.psychology.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tactics.map((tactic, index) => {
                  const Icon = psychologyIcons[index % psychologyIcons.length];
                  return (
                    <div
                      key={index}
                      className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/10 border border-purple-200 dark:border-purple-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-2 text-foreground">{tactic.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{tactic.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Scam Categories */}
        <section id="section-5" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  {t('scamPrevention.scamCategories.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.scamCategories.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.scamCategories.description')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {scamCategories.map((category, index) => {
                  const Icon = scamTypeIcons[index % scamTypeIcons.length];
                  return (
                    <Card
                      key={index}
                      className="group h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-[#0E74FF]/30 overflow-hidden"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3 text-base">
                          <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0E74FF]/20 transition-all duration-300">
                            <Icon className="h-5 w-5 text-[#0E74FF]" />
                          </div>
                          <span className="group-hover:text-[#0E74FF] transition-colors">{category.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                        <div className="pt-3 border-t border-dashed">
                          <p className="text-xs font-semibold text-[#0E74FF] mb-1 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Tips:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {Array.isArray(category.tips) && category.tips.map((tip, tipIdx) => (
                              <li key={tipIdx}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Immediate Action Protocol */}
        <section id="section-6" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
                  <Zap className="h-4 w-4" />
                  {t('scamPrevention.immediateAction.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.immediateAction.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.immediateAction.description')}
                </p>
              </div>

              <div className="relative">
                <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0E74FF] via-[#0E74FF] to-[#0E74FF]/30 rounded-full" />

                <div className="space-y-6">
                  {actionSteps.map((step, index) => (
                    <div key={index} className="relative flex items-start gap-6">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10">
                        {index + 1}
                      </div>
                      <Card className="flex-1 border-l-4 border-l-[#0E74FF] hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          {Array.isArray(step.actions) && (
                            <ul className="space-y-1">
                              {step.actions.map((action, actionIdx) => (
                                <li key={actionIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Evidence Collection */}
        <section id="section-7" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
                  <FolderOpen className="h-4 w-4" />
                  {t('scamPrevention.evidence.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.evidence.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.evidence.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {evidenceTypes.map((type, index) => {
                  const Icon = evidenceIcons[index % evidenceIcons.length];
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-cyan-200 dark:hover:border-cyan-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          {type.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {Array.isArray(type.items) && type.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-center gap-3 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">{t('scamPrevention.evidence.bestPractices.title')}</h3>
                    <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                      {bestPracticesItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Fund Recovery */}
        <section id="section-8" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                  <DollarSign className="h-4 w-4" />
                  {t('scamPrevention.fundRecovery.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.fundRecovery.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.fundRecovery.description')}
                </p>
              </div>

              <div className="space-y-5">
                {recoveryMethods.map((method, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0E74FF]/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#0E74FF]" />
                          </div>
                          {method.title}
                        </CardTitle>
                        <span className="text-xs font-bold px-4 py-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          {method.timeline}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-4">{method.description}</p>
                      <ol className="space-y-3">
                        {Array.isArray(method.steps) && method.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0E74FF]/10 text-[#0E74FF] text-sm flex items-center justify-center font-bold">
                              {stepIdx + 1}
                            </span>
                            <span className="text-muted-foreground pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Support Resources */}
        <section id="section-9" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
                  <LifeBuoy className="h-4 w-4" />
                  {t('scamPrevention.supportResources.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('scamPrevention.supportResources.title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('scamPrevention.supportResources.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-8">
                {supportResources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <LifeBuoy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1">{resource.title}</h3>
                          <p className="text-sm text-[#0E74FF] font-medium mb-2">{resource.contact}</p>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-[#0E74FF] via-[#0a5ed4] to-[#0E74FF] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                {t('scamPrevention.cta.title')}
              </h2>
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                {t('scamPrevention.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-white text-[#0E74FF] hover:bg-white/90 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
                  <Link href={`/${locale}/report/new`}>
                    {t('scamPrevention.cta.buttons.report')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
                  <Link href={`/${locale}/training-courses`}>
                    {t('scamPrevention.cta.buttons.share')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
