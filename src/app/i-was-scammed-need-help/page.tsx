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

// JSON-LD Schemas
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'What to Do After a Scam - 7-Step Recovery Guide',
  description: 'Step-by-step guide for scam victims to maximize recovery chances, report fraud, and protect themselves.',
  totalTime: 'PT2H',
  estimatedCost: {
    '@type': 'PriceSpecification',
    priceCurrency: 'USD',
    price: '0',
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Immediately Block the Scammer\'s Access to Your Money',
      text: 'Block your card through banking app or call hotline. Contact crypto exchange to freeze account if hacked.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Create a Focused Environment to Solve the Problem',
      text: 'Ask relatives to look after children. Talk to employer about taking leave. Minimize distractions.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Officially Report the Incident',
      text: 'Contact your bank or exchange by phone or email. Describe the situation in detail. Request written confirmation.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Start Collecting Evidence and Fill Out Our Form',
      text: 'Fill out ScamNemesis form to capture all essential information and generate a PDF report for authorities.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Report the Fraud to the Police and Obtain Official Documents',
      text: 'Visit police with all collected documents. Request confirmation of report and official record copy.',
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Continue Targeted Actions and Evidence Collection',
      text: 'Keep collecting evidence and monitor scammer activity. Connect with other victims through ScamNemesis platform.',
    },
    {
      '@type': 'HowToStep',
      position: 7,
      name: 'The Truth About Money Recovery Services',
      text: 'Be cautious of recovery scams charging $3,000-$10,000 with false promises. Consider ethical, affordable alternatives.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What should I do immediately after being scammed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Block the scammer\'s access to your money immediately. If your card was stolen, block it through your banking app. If your crypto account was hacked, contact the exchange to freeze your account.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get my money back after being scammed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recovery depends on the scam type and how quickly you act. No service can guarantee 100% recovery, but thorough analysis, collected evidence, and proper legal steps can significantly increase the probability.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I pay for money recovery services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Be extremely cautious. Many so-called recovery services charge $3,000-$10,000 upfront and are scams themselves. Legitimate services never guarantee recovery or use pressure tactics.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where should I report a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Report to your bank, the police, and relevant authorities. In the US, report to IC3 (FBI), FTC, and local law enforcement. Use ScamNemesis form to generate a comprehensive PDF report for authorities.',
      },
    },
  ],
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'I Was Scammed: Get Your Money Back - Complete Recovery Guide',
  description: 'Comprehensive guide for scam victims with step-by-step recovery process, evidence collection tips, and warnings about recovery scams.',
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
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/images/logo.png',
  description: 'Platform helping scam victims report fraud, recover money, and protect others.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer service',
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
      name: 'I Was Scammed - Need Help',
      item: 'https://scamnemesis.com/i-was-scammed-need-help',
    },
  ],
};

export default function IWasScammedPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
                  Urgent Help
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Expert Guidance
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Time-Critical Steps
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                Was Scammed: Get Your Money Back.{' '}
                <span className="text-primary">Report Fraud Now.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
                If you&apos;ve become a victim of an online scam, investment fraud, or any form of deception,
                you&apos;re not alone. The first moments after realizing you&apos;ve been scammed are critical.
                Our system was created specifically for such cases to provide you with effective help.
              </p>

              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Please follow the step-by-step guide below first, and only then contact us.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                  <Link href="/contact">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Us
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                  <Link href="/report/new">
                    <FileText className="h-5 w-5 mr-2" />
                    Fill out the form
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">7</div>
                  <div className="text-sm text-muted-foreground">Critical Steps</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Time-Critical</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">PDF Report</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">612M+</div>
                  <div className="text-sm text-muted-foreground">Database</div>
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
                  What to Do After a Scam? A Practical Guide
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  If you&apos;ve become a victim of a scam, it&apos;s important to act quickly and systematically.
                  Below, you&apos;ll find the exact step-by-step procedure you should follow — it was specifically
                  developed by experts, and every step has a purpose and is crucial.
                </p>
              </div>

              <p className="text-center text-muted-foreground mb-6">
                — find it below.
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
                    <span className="text-sm font-medium text-green-600">Step 1</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Immediately Block the Scammer&apos;s Access to Your Money
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    The first and most crucial step is to stop further losses as quickly as possible.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    If your card details were stolen, block the card immediately — through your bank&apos;s mobile app or by calling their hotline.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    If your crypto account was hacked, contact the exchange right away via email and ask them to freeze your account.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    Take every possible action to ensure the scammer can no longer access your funds.
                  </p>
                </div>
              </div>

              {/* Important Tip - Warning Box */}
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      ⚠️ Important tip:
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                      If you are still in contact with the scammer, do not reveal that you know you&apos;ve been scammed.
                      Pretend you don&apos;t understand why something isn&apos;t working (e.g., a payment attempt).
                      This keeps the scammer engaged and gives you more time to act.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="mt-8 grid md:grid-cols-2 gap-6 items-center">
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/pages/i-was-scammed-step1.jpg"
                    alt="I Was Scammed – Immediate Action and Blocking the Scammer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 rounded-2xl bg-card border">
                  <h3 className="text-xl font-semibold mb-3">I Was Scammed – Immediate Action and Blocking the Scammer</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Speed is everything when it comes to fraud recovery. The faster you act, the higher your chances of stopping further damage and potentially recovering your funds.
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
                    <span className="text-sm font-medium text-green-600">Step 2</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Create a Focused Environment to Solve the Problem
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Dealing with a scam requires your full attention and a clear mind.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    If you have children, ask relatives or friends to look after them for a few hours
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    If you are at work, talk to your employer and request to leave early or take a short leave.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  The fewer distractions you have, the faster and more effectively you can act. In cases like this,
                  every minute counts — the sooner you respond, the higher the chance of blocking transfers and stopping the scammer.
                </p>
              </div>

              {/* Image Caption */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  How to Focus and Act Effectively After a Scam
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
                    <span className="text-sm font-medium text-green-600">Step 3</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Officially Report the Incident
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Even if you have already blocked your card or account via the app, you must also report the incident officially:
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    Contact your bank or exchange directly by phone or email
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    Describe the entire situation in detail
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <FileCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    Request written confirmation of your report
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong>Important:</strong> Complete this step even if the scammer already has your money, but you haven&apos;t reported it yet.
                  </p>
                </div>
              </div>

              {/* Image Caption */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  Officially Reporting a Scam to the Police and Bank
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4 - Most Important/Longest */}
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
                    <span className="text-sm font-medium text-green-600">STEP 4</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Start Collecting Evidence and Fill Out Our Form
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Once you have stopped further payments, start systematically gathering all available evidence —
                    this will significantly increase your chances of identifying the scammer and recovering your money. Follow these steps:
                  </p>
                </div>
              </div>

              {/* Evidence Collection Items */}
              <div className="space-y-4 mb-8">
                {/* Fill out form */}
                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground leading-relaxed">
                        <strong>Fill out our form as thoroughly as possible.</strong> It serves as a practical guide to help you
                        capture all essential information and automatically generates a complete PDF report, which can be
                        provided to the police or other relevant authorities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preserve conversations */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Preserve all conversations:</strong> take screenshots of chats, emails (remember to include the full email header),
                    and other text messages, including dates and times of communication.
                  </p>
                </div>

                {/* Bank records */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Secure bank records:</strong> archive all relevant bank statements, payment confirmations, and transaction details.
                  </p>
                </div>

                {/* Phone calls */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Document phone calls or app calls:</strong> record the date, time, and a brief summary of the conversation.
                    (Note: always check local laws before recording calls.)
                  </p>
                </div>

                {/* Video evidence */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Video className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Collect video evidence in original quality.</strong> If you met the scammer in person and it is safe,
                    create a video record of the meeting. If you met in a public place with cameras, request the operator to
                    archive the footage. Even if they do not provide it directly, the police can officially request it after you report the case.
                  </p>
                </div>

                {/* Scammer identifiers */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Fingerprint className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Record the scammer&apos;s identifiers:</strong> save all available data such as domains, email addresses,
                    phone numbers, social media profiles, IP addresses (if known), and any other relevant information.
                  </p>
                </div>

                {/* Don't reveal */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Ban className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Do not reveal to the scammer that you are aware of the fraud.</strong> Maintain contact only if strategically
                    necessary and safe. Never give them information that could help them escape with your money, and do not disclose
                    any personal details — such as your home address or location.
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <HardDrive className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Preserve metadata:</strong> when saving screenshots and files, keep the originals to retain timestamps
                    and other forensic details. If you need to highlight or edit something (e.g., mark important details), make a
                    copy and edit the copy — otherwise, you may overwrite critical metadata that is essential for forensic analysis.
                  </p>
                </div>

                {/* Handle evidence */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <FileCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Handle all evidence with maximum care:</strong> each case may involve different types of evidence —
                    digital (screenshots, emails, logs, IP data, videos) and physical (documents, paper confirmations, SIM cards,
                    hardware wallets). Document everything thoroughly while preserving the integrity of the original materials.
                    If any handling occurs, record who handled it and when (chain of custody principle).
                  </p>
                </div>

                {/* Legal note */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Legal and security note:</strong> if you encounter sensitive or potentially dangerous information,
                    consult an experienced lawyer or investigators to minimize the risk of further issues.
                  </p>
                </div>
              </div>

              {/* Why use ScamNemesis form */}
              <Card className="bg-primary text-white mb-8">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Why use the ScamNemesis form?</h3>
                  <p className="text-white/90 leading-relaxed mb-6">
                    Our form collects your data into a clear, downloadable PDF report and simultaneously scans our database for
                    similar cases. If connections are found, your case is linked with other records and an analytical report is
                    generated — completely free of charge. The complete report helps police, banks, and investigators act faster,
                    more purposefully, and more effectively.
                  </p>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/report/new">
                      Fill Out the Form Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Image Caption */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground italic">
                  Collecting Evidence and Filling Out the ScamNemesis Form
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
                    <span className="text-sm font-medium text-green-600">Step 5</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Report the Fraud to the Police and Obtain Official Documents
                  </h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Visit the police immediately and bring all the documents and evidence you have collected so far.
                  When reporting the incident, request a confirmation of the report and a copy of the official record –
                  you will need these documents in the next steps.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  If communication in English is required (for example, if the fraud involved a foreign bank), have the
                  police report officially translated into English. Most banks, crypto exchanges, and institutions accept
                  only certified translations, so it is best to arrange this as early as possible. Once you have the translation,
                  send it to all involved parties – the bank, crypto exchange, and any other relevant institutions.
                </p>

                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                    Keep in mind that the police, especially in EU countries and the United States, are often overwhelmed with
                    fraud cases. Therefore, it may be necessary to be persistent and actively request that your case be handled more thoroughly.
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
                    <span className="text-sm font-medium text-green-600">Step 6</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Continue Targeted Actions and Evidence Collection
                  </h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The next steps are more specific to your individual case and depend on your options, situation, and available resources.
                  One thing always applies: keep collecting evidence and closely monitor the scammer&apos;s activities.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  If the scammer knows that you will not send any more money and that you are aware of the fraud, you may consider
                  sharing your story on online forums and trying to find publicly available information about them.
                  <strong> However, do this only if you are no longer in contact with the scammer.</strong>
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  If the scammer is still communicating with you, try to maintain the conversation and use it as an opportunity to
                  gather more information — for example, about their identity, location, or methods. In more complex cases, consider
                  working with professionals who can help uncover the scammer&apos;s identity, obtain a confession, or secure additional evidence.
                </p>

                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-4">
                    <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                      On the ScamNemesis platform, your case is automatically linked with other victims of the same scammer, and the
                      evidence is continuously updated — you can even communicate with other victims. The more victims are connected
                      and the larger and more detailed the case becomes, the higher priority the police are likely to assign to it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Caption */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground italic">
                  Professional Assistance for Recovering Money After a Scam
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 7 - Warning Step */}
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
                    <span className="text-sm font-medium text-green-600">Step 7</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    The Truth About &quot;Money Recovery&quot; Services – Do You Need Professional Help?
                  </h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The reality of so-called &quot;money recovery&quot; services – companies that promise to help you get your stolen money back –
                  is often very different from their marketing claims. Based on our experience with the largest providers and analysis
                  of client feedback, we can say clearly: <strong>in most cases, these are scams or highly unethical practices.</strong>
                </p>

                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 leading-relaxed">
                    These companies typically charge <strong>$3,000 to $10,000</strong>, yet their &quot;work&quot; often consists only of basic
                    assistance with reporting the fraud – something you can handle yourself. Most do not analyze evidence, use
                    intelligence or OSINT techniques critical for investigations, and do not link related cases or victims. Often,
                    they even know or suspect that your case is unrecoverable, yet they still take your money and make false promises
                    of refunds – which no one can truly guarantee.
                  </p>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  The truth is that <strong>no service can give you a 100% guarantee</strong> that your money will be returned – whether
                  it&apos;s a traditional scam or cryptocurrency fraud. What you can influence is the likelihood of success. Thorough
                  analysis, collected evidence, and proper legal and technical steps can significantly increase this probability.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  In response to the exploitation of victims by these companies, we created our own <strong>Money Recovery service</strong>,
                  which is ethical, based on real legal and investigative procedures, and most importantly, affordable – not built on empty promises.
                </p>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-foreground leading-relaxed">
                    👉 <Link href="/money-recovery" className="text-primary font-semibold hover:underline">
                      Read more about our approach
                    </Link> to understand the fundamental difference.
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
                What else can I do?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Option A */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <h3 className="text-xl font-semibold">Use the Scam Checker service</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Try to identify the scammer using our Scam Checker. This can help you gather intelligence
                      and connect with other victims.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/search">
                        <Search className="h-4 w-4 mr-2" />
                        Open Scam Checker
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
                      <h3 className="text-xl font-semibold">Consult a qualified lawyer</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Contact an experienced attorney in your home country and request an initial consultation.
                      This will help you determine whether legal action is possible and what level of assistance to expect.
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
                    <h3 className="text-xl font-semibold mb-2">Important tips about lawyers:</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Be cautious and choose a truly experienced professional. A competent lawyer will review all legal
                      options to recover your funds, including tailored approaches depending on your specific situation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-blue-500">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1:</p>
                    <p className="text-muted-foreground">
                      If your credit card was stolen but the SMS verification code was not used, the bank will most likely refund your money.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-amber-500">
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 2:</p>
                    <p className="text-muted-foreground">
                      If the scammer obtained your card and tricked you into giving the verification code (phishing), alternative
                      recovery methods will be required, because the bank or card issuer may refuse a refund.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-red-500">
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Example 3:</p>
                    <p className="text-muted-foreground">
                      If you made a standard bank transfer to an online shop but did not receive the goods or services, the bank
                      may treat this as a commercial dispute and refuse to refund you. In such cases, other recovery methods are necessary.
                    </p>
                  </div>
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
                  By following these steps, you can maximize your chances of recovering stolen funds.
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Start by filling out our comprehensive reporting form. It&apos;s free, it will help you organize your
                  evidence, and it generates a professional PDF report you can use with police and banks.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                    <Link href="/report/new">
                      <FileText className="h-5 w-5 mr-2" />
                      Fill Out Report Form
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                    <Link href="/contact">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Us for Help
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
