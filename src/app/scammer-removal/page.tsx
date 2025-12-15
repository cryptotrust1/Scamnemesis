'use client';

import Link from 'next/link';
import {
  Heart,
  UserX,
  FileText,
  AlertTriangle,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle,
  Download,
  Bitcoin,
  CreditCard,
  Mail,
  Shield,
  Sparkles,
  RefreshCw,
  HeartHandshake,
  GraduationCap,
  Clock,
  Send,
  Eye,
  FileCheck,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Script from 'next/script';

// Basic Requirements data
const basicRequirements = [
  'Your case/scammer ID from our database',
  'Valid identification documents',
  'Detailed explanation of your situation',
  'Commitment statement for future lawful behavior',
];

// Important Notices data
const importantNotices = [
  'One opportunity per person — use it wisely',
  'Any future criminal activity permanently closes this door',
  'Review period: 14-30 days',
  'All requests are evaluated individually based on case severity',
];

// How to Request steps
const requestSteps = [
  {
    step: 1,
    icon: Mail,
    title: 'Contact Us',
    description: 'Send your request to info@scamnemesis.com',
  },
  {
    step: 2,
    icon: FileText,
    title: 'Submit Documents',
    description: 'Provide required documentation and explanation',
  },
  {
    step: 3,
    icon: Clock,
    title: 'Wait for Review',
    description: 'Our team will evaluate your case (14-30 days)',
  },
  {
    step: 4,
    icon: FileCheck,
    title: 'Receive Decision',
    description: 'Get notified about the outcome of your request',
  },
];

// PDF Guide features
const pdfFeatures = [
  {
    icon: BookOpen,
    text: 'Step-by-step guide for leaving criminal environments safely',
  },
  {
    icon: Users,
    text: 'Resources for mental health and addiction recovery',
  },
  {
    icon: GraduationCap,
    text: 'Employment strategies for individuals with criminal records',
  },
  {
    icon: Shield,
    text: 'Legal rights and reintegration information by country',
  },
];

// Vision initiatives
const visionInitiatives = [
  {
    title: 'Financial Support',
    description: 'Assistance for released individuals during the transition period',
    icon: HeartHandshake,
    color: 'emerald',
  },
  {
    title: 'Family Assistance',
    description: 'Support services for families of those seeking a fresh start',
    icon: Users,
    color: 'teal',
  },
  {
    title: 'Education & Retraining',
    description: 'Opportunities for skill development and career change',
    icon: GraduationCap,
    color: 'cyan',
  },
];

// JSON-LD Schemas
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Request Database Deletion from ScamNemesis',
  description: 'Step-by-step guide to request removal from the ScamNemesis scammer database and start a new beginning.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Contact Us',
      text: 'Send your request to info@scamnemesis.com',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Submit Documents',
      text: 'Provide required documentation including your case ID, valid identification, detailed explanation, and commitment statement',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Wait for Review',
      text: 'Our team will evaluate your case within 14-30 days',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Receive Decision',
      text: 'Get notified about the outcome of your request',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who can request database deletion from ScamNemesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Individuals listed in our scammer database who demonstrate genuine commitment to rehabilitation and lawful behavior can request deletion. Each person receives one opportunity.',
      },
    },
    {
      '@type': 'Question',
      name: 'What documents are required for deletion request?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need your case/scammer ID from our database, valid identification documents, a detailed explanation of your situation, and a commitment statement for future lawful behavior.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does the review process take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The review period is 14-30 days. All requests are evaluated individually based on case severity.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I request deletion more than once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, each person receives only one deletion opportunity. Any future criminal activity permanently closes this door.',
      },
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'ScamNemesis provides scam prevention, detection, and rehabilitation support services.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer support',
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
      name: 'Scammer Removal',
      item: 'https://scamnemesis.com/scammer-removal',
    },
  ],
};

export default function ScammerRemovalPage() {
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
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Premium Design with Gradient */}
        <section className="relative w-full py-20 md:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon with glow effect */}
              <div className="relative inline-flex mb-8">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-5 rounded-2xl shadow-2xl shadow-emerald-500/20">
                  <UserX className="h-12 w-12 md:h-14 md:w-14 text-white" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Request for Database Deletion{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  A Second Chance
                </span>
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-emerald-100/90 font-medium mb-4">
                Help for a New Beginning in Life
              </p>

              <p className="text-base md:text-lg text-slate-300/80 max-w-3xl mx-auto mb-10 leading-relaxed">
                We believe in privacy and second chances. Our platform offers individuals with criminal pasts
                an opportunity to request deletion from our scammer database and receive support for life reintegration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-base px-8 py-6"
                  asChild
                >
                  <Link href="mailto:info@scamnemesis.com">
                    <Send className="mr-2 h-5 w-5" />
                    Submit Removal Request
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-400/50 text-emerald-100 hover:bg-emerald-500/10 hover:border-emerald-400 backdrop-blur-sm transition-all duration-300 text-base px-8 py-6"
                  asChild
                >
                  <Link href="#how-to-request">
                    <Eye className="mr-2 h-5 w-5" />
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section - Premium glassmorphism */}
        <section className="relative w-full py-16 md:py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Large quote marks */}
                <div className="absolute -top-8 -left-4 md:-left-8 text-8xl md:text-9xl text-white/10 font-serif leading-none">
                  &ldquo;
                </div>

                <blockquote className="relative z-10 text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-relaxed mb-6 italic">
                    Everyone deserves a second chance. It&apos;s not where you started that matters, but where you&apos;re going.
                  </p>
                  <footer className="flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-white/40" />
                    <cite className="text-emerald-100 text-lg md:text-xl not-italic font-medium">
                      ScamNemesis
                    </cite>
                    <div className="h-px w-12 bg-white/40" />
                  </footer>
                </blockquote>

                {/* Large quote marks end */}
                <div className="absolute -bottom-16 -right-4 md:-right-8 text-8xl md:text-9xl text-white/10 font-serif leading-none rotate-180">
                  &ldquo;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terms and Conditions Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                  <FileText className="h-4 w-4" />
                  Requirements & Conditions
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  Terms and Conditions
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Please review these requirements carefully before submitting your request
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Basic Requirements Card */}
                <Card className="group relative overflow-hidden border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl text-slate-900 dark:text-white">
                        Basic Requirements
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {basicRequirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3 group/item">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-hover/item:bg-emerald-500 transition-colors duration-300">
                              <CircleDot className="h-3 w-3 text-emerald-600 dark:text-emerald-400 group-hover/item:text-white transition-colors duration-300" />
                            </div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Important Notices Card */}
                <Card className="group relative overflow-hidden border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800 dark:to-amber-950/20 shadow-xl shadow-amber-500/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl text-slate-900 dark:text-white">
                        Important Notices
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {importantNotices.map((notice, index) => (
                        <li key={index} className="flex items-start gap-3 group/item">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center group-hover/item:bg-amber-500 transition-colors duration-300">
                              <CircleDot className="h-3 w-3 text-amber-600 dark:text-amber-400 group-hover/item:text-white transition-colors duration-300" />
                            </div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {notice}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How to Request Section */}
        <section id="how-to-request" className="w-full py-16 md:py-24 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                  <RefreshCw className="h-4 w-4" />
                  Step-by-Step Process
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  How to Request Deletion
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Follow these simple steps to submit your database removal request
                </p>
              </div>

              {/* Steps Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {requestSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.step}
                      className="group relative"
                    >
                      {/* Connection line for desktop */}
                      {step.step < 4 && (
                        <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-teal-300 to-transparent dark:from-teal-700" />
                      )}

                      <Card className="relative h-full border-teal-200/50 dark:border-teal-800/30 bg-gradient-to-b from-white to-teal-50/30 dark:from-slate-900 dark:to-teal-950/10 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-500">
                        <CardContent className="pt-8 pb-6 px-6 text-center">
                          {/* Step number badge */}
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30">
                              {step.step}
                            </div>
                          </div>

                          {/* Icon */}
                          <div className="mx-auto mb-4 p-4 rounded-2xl bg-teal-100 dark:bg-teal-900/30 inline-flex group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300">
                            <Icon className="h-8 w-8 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors duration-300" />
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* PDF Guide Section - Premium Card Design */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
                  <Download className="h-4 w-4" />
                  Free Resource
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  PDF Guide: The Path Out of Criminality
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Practical guidance for those seeking to leave criminal environments
                </p>
              </div>

              {/* Premium PDF Card */}
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 shadow-2xl shadow-cyan-500/25">
                {/* Decorative patterns */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <CardContent className="relative z-10 p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* PDF Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-110" />
                        <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                          <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                        What&apos;s Inside the Guide
                      </h3>

                      <ul className="space-y-4 mb-8">
                        {pdfFeatures.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <li key={index} className="flex items-start gap-4">
                              <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-white/90 text-base md:text-lg leading-relaxed">
                                {feature.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      <Button
                        size="lg"
                        className="bg-white text-teal-600 hover:bg-white/90 shadow-xl shadow-black/10 text-base px-8 py-6 font-semibold"
                        asChild
                      >
                        <Link href="/pdf/path-out-of-criminality.pdf" target="_blank">
                          <Download className="mr-2 h-5 w-5" />
                          Download Free PDF Guide
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Break the Cycle Section */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                  <RefreshCw className="h-4 w-4" />
                  Breaking Free
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  Break the Cycle
                </h2>
              </div>

              {/* Warning Box */}
              <Card className="relative overflow-hidden border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                <CardContent className="relative z-10 p-8 md:p-10">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Important Message
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base md:text-lg">
                        If you are currently part of a criminal organization and want to leave,
                        know that there is always a way out. Your first step is to seek help — whether
                        from law enforcement, support organizations, or trusted individuals.
                        The path to a new life begins with a single decision.
                      </p>
                      <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800/50">
                        <p className="text-purple-700 dark:text-purple-300 font-medium">
                          Remember: It&apos;s never too late to change your path.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Future Plans
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  Our Vision of Help
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                  We are developing comprehensive programs to assist individuals seeking to leave their criminal past behind.
                  Here are three initiatives we plan to implement:
                </p>
              </div>

              {/* Vision Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {visionInitiatives.map((initiative, index) => {
                  const Icon = initiative.icon;
                  const colorClasses = {
                    emerald: {
                      bg: 'from-emerald-500 to-green-500',
                      shadow: 'shadow-emerald-500/25',
                      light: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
                      border: 'border-emerald-200 dark:border-emerald-800/50',
                      badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                    },
                    teal: {
                      bg: 'from-teal-500 to-cyan-500',
                      shadow: 'shadow-teal-500/25',
                      light: 'from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20',
                      border: 'border-teal-200 dark:border-teal-800/50',
                      badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
                    },
                    cyan: {
                      bg: 'from-cyan-500 to-blue-500',
                      shadow: 'shadow-cyan-500/25',
                      light: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
                      border: 'border-cyan-200 dark:border-cyan-800/50',
                      badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
                    },
                  };
                  const colors = colorClasses[initiative.color as keyof typeof colorClasses];

                  return (
                    <Card
                      key={index}
                      className={`group relative overflow-hidden ${colors.border} bg-gradient-to-br ${colors.light} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-current/5 to-transparent rounded-bl-full" />
                      <CardContent className="pt-8 pb-8 px-6 text-center">
                        {/* Badge */}
                        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${colors.badge} text-xs font-medium mb-4`}>
                          Planned Initiative
                        </div>

                        {/* Icon */}
                        <div className={`mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.shadow} shadow-lg inline-flex`}>
                          <Icon className="h-10 w-10 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                          {initiative.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {initiative.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Donation Section - Premium Design */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon */}
              <div className="relative inline-flex mb-8">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-5 rounded-2xl shadow-2xl">
                  <Heart className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Support the Second Chance Program
              </h2>
              <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                Your contribution helps us provide resources, guidance, and support to individuals
                seeking to leave criminal lifestyles behind and build a better future.
              </p>

              {/* Donation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto text-base px-8 py-6"
                  asChild
                >
                  <a
                    href="https://trocador.app/en/anonpay/?ticker_to=usdt&network_to=TRC20&address=TCgCfp1Ve5vKpmuaK8M7btt9BSCUKqzXQR&fiat_equiv=USD&name=Scamnemesis+second+chance+&email=info@scamnemesis.com&bgcolor=00000000"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Bitcoin className="mr-2 h-5 w-5" />
                    Donate with Cryptocurrency
                  </a>
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto text-base px-8 py-6"
                  asChild
                >
                  <a
                    href="https://donate.stripe.com/aFabJ10pUfau2bB9923F601"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Donate by Card
                  </a>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-emerald-200/60 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>100% Goes to Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Make a Difference</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Final CTA */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium mb-6">
                <Mail className="h-4 w-4" />
                Get in Touch
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Ready to Start Your New Journey?
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Contact us at{' '}
                <a
                  href="mailto:info@scamnemesis.com"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  info@scamnemesis.com
                </a>
                {' '}to begin your removal request process. We&apos;re here to help you every step of the way.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 text-base px-8 py-6"
                  asChild
                >
                  <a href="mailto:info@scamnemesis.com">
                    <Send className="mr-2 h-5 w-5" />
                    Submit Removal Request
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-base px-8 py-6"
                  asChild
                >
                  <Link href="/contact-us">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Contact Page
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final Message Section */}
        <section className="w-full py-12 md:py-16 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 border-t border-emerald-100 dark:border-emerald-900/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;The past is your lesson. The present is your gift. The future is your motivation.&rdquo;
              </p>
              <p className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium">
                Everyone deserves a second chance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
