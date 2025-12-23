'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import {
  Shield,
  Phone,
  FileText,
  AlertTriangle,
  Lock,
  Users,
  ArrowRight,
  CreditCard,
  Clock,
  CheckCircle2,
  Search,
  Camera,
  Database,
  Scale,
  Lightbulb,
  Ban,
  FileCheck,
  Video,
  Fingerprint,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/context';

// Icon mappings
const step1Icons: Record<string, React.ComponentType<{ className?: string }>> = {
  card: CreditCard,
  lock: Lock,
  shield: Shield,
};

const step2Icons: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  clock: Clock,
};

const step3Icons: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  file: FileText,
  check: FileCheck,
};

const step4Icons: Record<string, React.ComponentType<{ className?: string }>> = {
  file: FileText,
  camera: Camera,
  card: CreditCard,
  phone: Phone,
  video: Video,
  fingerprint: Fingerprint,
  ban: Ban,
  harddrive: HardDrive,
  filecheck: FileCheck,
  scale: Scale,
};

// JSON-LD Schemas (kept in English for SEO)
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'What to Do After a Scam - 7-Step Recovery Guide',
  description: 'Step-by-step guide for scam victims to maximize recovery chances, report fraud, and protect themselves.',
  totalTime: 'PT2H',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Block scammer access to your money' },
    { '@type': 'HowToStep', position: 2, name: 'Create focused environment' },
    { '@type': 'HowToStep', position: 3, name: 'Officially report the incident' },
    { '@type': 'HowToStep', position: 4, name: 'Collect evidence and fill form' },
    { '@type': 'HowToStep', position: 5, name: 'Report to police' },
    { '@type': 'HowToStep', position: 6, name: 'Continue targeted actions' },
    { '@type': 'HowToStep', position: 7, name: 'Evaluate recovery services' },
  ],
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'I Was Scammed: Get Your Money Back - Complete Recovery Guide',
  description: 'Comprehensive guide for scam victims with step-by-step recovery process.',
  datePublished: '2025-01-01',
  dateModified: '2025-12-15',
  author: { '@type': 'Organization', name: 'ScamNemesis' },
};

// Types
interface StepAction {
  icon: string;
  text: string;
}

interface EvidenceItem {
  icon: string;
  title: string;
  text: string;
}

interface LawyerExample {
  type: string;
  title: string;
  text: string;
}

export default function IWasScammedPage() {
  const { t, tv, locale } = useTranslation();

  // Get translations - use tv() for arrays
  const step1Actions = tv<StepAction[]>('iWasScammed.steps.step1.actions') || [];
  const step2Actions = tv<StepAction[]>('iWasScammed.steps.step2.actions') || [];
  const step3Actions = tv<StepAction[]>('iWasScammed.steps.step3.actions') || [];
  const step4EvidenceItems = tv<EvidenceItem[]>('iWasScammed.steps.step4.evidenceItems') || [];
  const step5Paragraphs = tv<string[]>('iWasScammed.steps.step5.paragraphs') || [];
  const step6Paragraphs = tv<string[]>('iWasScammed.steps.step6.paragraphs') || [];
  const step7Paragraphs = tv<string[]>('iWasScammed.steps.step7.paragraphs') || [];
  const lawyerExamples = tv<LawyerExample[]>('iWasScammed.whatElse.lawyerTips.examples') || [];

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script id="howto-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-red-500/5 via-background to-orange-500/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container relative py-12 md:py-16 lg:py-20 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {t('iWasScammed.hero.badges.urgent')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  {t('iWasScammed.hero.badges.expert')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {t('iWasScammed.hero.badges.timeCritical')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                {t('iWasScammed.hero.title')}{' '}
                <span className="text-primary">{t('iWasScammed.hero.titleHighlight')}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
                {t('iWasScammed.hero.description')}
              </p>

              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                {t('iWasScammed.hero.followGuide')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                  <Link href={`/${locale}/contact`}>
                    <Phone className="h-5 w-5 mr-2" />
                    {t('iWasScammed.hero.contactButton')}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                  <Link href={`/${locale}/report/new`}>
                    <FileText className="h-5 w-5 mr-2" />
                    {t('iWasScammed.hero.fillFormButton')}
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{t('iWasScammed.hero.stats.steps.value')}</div>
                  <div className="text-sm text-muted-foreground">{t('iWasScammed.hero.stats.steps.label')}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{t('iWasScammed.hero.stats.time.value')}</div>
                  <div className="text-sm text-muted-foreground">{t('iWasScammed.hero.stats.time.label')}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{t('iWasScammed.hero.stats.report.value')}</div>
                  <div className="text-sm text-muted-foreground">{t('iWasScammed.hero.stats.report.label')}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{t('iWasScammed.hero.stats.database.value')}</div>
                  <div className="text-sm text-muted-foreground">{t('iWasScammed.hero.stats.database.label')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Introduction */}
        <section className="py-12 md:py-16 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  {t('iWasScammed.intro.title')}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('iWasScammed.intro.description')}
                </p>
              </div>
              <p className="text-center text-muted-foreground mb-6">
                {t('iWasScammed.intro.findBelow')}
              </p>
            </div>
          </div>
        </section>

        {/* Step 1 */}
        <section className="py-12 md:py-16 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step1.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step1.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('iWasScammed.steps.step1.description')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {step1Actions.map((action, idx) => {
                  const Icon = step1Icons[action.icon] || Shield;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground leading-relaxed">{action.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Important Tip */}
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      {t('iWasScammed.steps.step1.tip.title')}
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                      {t('iWasScammed.steps.step1.tip.text')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="mt-8 grid md:grid-cols-2 gap-6 items-center">
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/pages/i-was-scammed-step1.jpg"
                    alt={t('iWasScammed.steps.step1.imageAlt')}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 rounded-2xl bg-card border">
                  <h3 className="text-xl font-semibold mb-3">{t('iWasScammed.steps.step1.imageAlt')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('iWasScammed.steps.step1.imageCaption')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step2.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step2.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('iWasScammed.steps.step2.description')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {step2Actions.map((action, idx) => {
                  const Icon = step2Icons[action.icon] || Users;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground leading-relaxed">{action.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  {t('iWasScammed.steps.step2.note')}
                </p>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  {t('iWasScammed.steps.step2.imageCaption')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="py-12 md:py-16 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step3.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step3.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('iWasScammed.steps.step3.description')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {step3Actions.map((action, idx) => {
                  const Icon = step3Icons[action.icon] || FileText;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground leading-relaxed">{action.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong>Important:</strong> {t('iWasScammed.steps.step3.important')}
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  {t('iWasScammed.steps.step3.imageCaption')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step4.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step4.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('iWasScammed.steps.step4.description')}
                  </p>
                </div>
              </div>

              {/* Evidence Collection Items */}
              <div className="space-y-4 mb-8">
                {step4EvidenceItems.map((item, idx) => {
                  const Icon = step4Icons[item.icon] || FileText;
                  const isHighlighted = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        isHighlighted ? 'bg-primary/5 border-primary/20' : 'bg-card'
                      }`}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${item.icon === 'ban' ? 'text-red-500' : 'text-primary'}`} />
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>{item.title}</strong> {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Why use ScamNemesis form */}
              <Card className="bg-primary text-white mb-8">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{t('iWasScammed.steps.step4.whyUseForm.title')}</h3>
                  <p className="text-white/90 leading-relaxed mb-6">
                    {t('iWasScammed.steps.step4.whyUseForm.text')}
                  </p>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href={`/${locale}/report/new`}>
                      {t('iWasScammed.steps.step4.whyUseForm.button')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground italic">
                  {t('iWasScammed.steps.step4.imageCaption')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="py-12 md:py-16 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step5.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step5.title')}
                  </h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {step5Paragraphs.map((para, idx) => (
                  <p key={idx} className="text-lg text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}

                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                    {t('iWasScammed.steps.step5.note')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 6 */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  6
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step6.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step6.title')}
                  </h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {step6Paragraphs.map((para, idx) => (
                  <p key={idx} className="text-lg text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}

                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-4">
                    <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                      {t('iWasScammed.steps.step6.platformNote')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground italic">
                  {t('iWasScammed.steps.step6.imageCaption')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 7 */}
        <section className="py-12 md:py-16 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 md:gap-6 mb-8">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                  7
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{t('iWasScammed.steps.step7.label')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {t('iWasScammed.steps.step7.title')}
                  </h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step7Paragraphs[0]}
                </p>

                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 leading-relaxed">
                    {t('iWasScammed.steps.step7.warning')}
                  </p>
                </div>

                {step7Paragraphs.slice(1).map((para, idx) => (
                  <p key={idx} className="text-lg text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-foreground leading-relaxed">
                    👉 <Link href={`/${locale}/money-recovery`} className="text-primary font-semibold hover:underline">
                      {t('iWasScammed.steps.step7.readMore')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What else can I do? */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                {t('iWasScammed.whatElse.title')}
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Option A */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <h3 className="text-xl font-semibold">{t('iWasScammed.whatElse.optionA.title')}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {t('iWasScammed.whatElse.optionA.description')}
                    </p>
                    <Button variant="outline" asChild>
                      <Link href={`/${locale}/search`}>
                        <Search className="h-4 w-4 mr-2" />
                        {t('iWasScammed.whatElse.optionA.button')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Option B */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        B
                      </div>
                      <h3 className="text-xl font-semibold">{t('iWasScammed.whatElse.optionB.title')}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('iWasScammed.whatElse.optionB.description')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Important tips about lawyers */}
              <div className="p-6 md:p-8 rounded-2xl bg-card border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{t('iWasScammed.whatElse.lawyerTips.title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('iWasScammed.whatElse.lawyerTips.intro')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {lawyerExamples.map((example, idx) => {
                    const borderColor = example.type === 'info' ? 'blue' : example.type === 'warning' ? 'amber' : 'red';
                    return (
                      <div key={idx} className={`p-4 rounded-lg bg-muted/50 border-l-4 border-${borderColor}-500`}>
                        <p className={`font-semibold text-${borderColor}-900 dark:text-${borderColor}-100 mb-1`}>{example.title}</p>
                        <p className="text-muted-foreground">{example.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {t('iWasScammed.cta.title')}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  {t('iWasScammed.cta.description')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                    <Link href={`/${locale}/report/new`}>
                      <FileText className="h-5 w-5 mr-2" />
                      {t('iWasScammed.cta.fillFormButton')}
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                    <Link href={`/${locale}/contact`}>
                      <Phone className="h-5 w-5 mr-2" />
                      {t('iWasScammed.cta.contactButton')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
