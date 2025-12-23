'use client';

import Link from 'next/link';
import {
  Shield,
  GraduationCap,
  Building,
  Play,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Baby,
  Smartphone,
  Target,
  Users,
  Sparkles,
  Clock,
  Mail,
  Award,
  Zap,
  RefreshCw,
  Scale,
  FileSearch,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Script from 'next/script';
import { useTranslation } from '@/lib/i18n/context';

// Free course icons
const freeCourseIcons = [AlertTriangle, Shield, Smartphone, Monitor, Baby];
const freeCourseColors = ['red', 'blue', 'purple', 'cyan', 'pink'];

// Professional audience icons and colors
const professionalConfig = [
  { icon: Scale, color: 'blue' },
  { icon: ShieldCheck, color: 'emerald' },
  { icon: Calculator, color: 'purple' },
  { icon: Lock, color: 'cyan' },
  { icon: FileSearch, color: 'amber' },
];

// JSON-LD Schemas for SEO
const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Cybersecurity Training Courses',
  description: 'World-class, expert-led cybersecurity training from the world\'s top security professionals. Prevent fraud and attacks—secure your environment and strengthen cyber resilience.',
  provider: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    sameAs: 'https://scamnemesis.com',
  },
  coursePrerequisites: 'None - courses available for all skill levels',
  educationalLevel: 'Beginner to Advanced',
  hasCourseInstance: [
    {
      '@type': 'CourseInstance',
      name: 'Free Public Courses',
      description: 'Short, practical lessons to protect yourself and your loved ones online.',
      courseMode: 'online',
    },
    {
      '@type': 'CourseInstance',
      name: 'Professional Videos',
      description: 'OPSEC and cybersecurity training for professionals.',
      courseMode: 'online',
    },
    {
      '@type': 'CourseInstance',
      name: 'Company Training',
      description: 'Custom training programs tailored to your organization.',
      courseMode: 'blended',
    },
  ],
};

const educationalOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'ScamNemesis Training Academy',
  description: 'Expert-led cybersecurity training from top security professionals worldwide.',
  url: 'https://scamnemesis.com/training-courses',
  sameAs: 'https://scamnemesis.com',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer support',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'World-class cybersecurity training and fraud prevention services.',
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
      name: 'Training Courses',
      item: 'https://scamnemesis.com/training-courses',
    },
  ],
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cybersecurity Training Course Categories',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Free Public Courses',
      description: 'Short, practical lessons to protect yourself and your loved ones online.',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Professional Videos',
      description: 'OPSEC and cybersecurity training for professionals.',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Company Training',
      description: 'Custom training programs for organizations.',
    },
  ],
};

export default function TrainingCoursesPage() {
  const { t, locale } = useTranslation();

  // Get translations as arrays
  const freeCourseItems = (t('trainingCourses.freeCourses.items') as unknown as string[]) || [];
  const professionalAudiences = (t('trainingCourses.professionalVideos.audiences') as unknown as { title: string; description: string }[]) || [];
  const differentiators = (t('trainingCourses.differentiators.items') as unknown as { emoji: string; title: string; description: string }[]) || [];

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Script
        id="educational-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrganizationSchema) }}
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
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Premium Dark Gradient */}
        <section className="relative w-full py-28 md:py-36 lg:py-44 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-5xl mx-auto text-center">
              {/* Icon with glow effect */}
              <div className="relative inline-flex mb-12">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-7 rounded-2xl shadow-2xl shadow-blue-500/20">
                  <GraduationCap className="h-16 w-16 md:h-20 md:w-20 text-white" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-10 leading-tight tracking-tight">
                {t('trainingCourses.hero.title')}{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {t('trainingCourses.hero.titleHighlight')}
                </span>
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-slate-300/90 max-w-4xl mx-auto mb-14 leading-relaxed">
                {t('trainingCourses.hero.description')}
              </p>

              {/* Coming Soon Badge */}
              <div className="max-w-2xl mx-auto">
                <Card className="border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-sm shadow-2xl shadow-amber-500/10">
                  <CardContent className="p-8 md:p-10">
                    <div className="flex items-center justify-center gap-4 mb-5">
                      <div className="p-3 rounded-xl bg-amber-500/20">
                        <Clock className="h-7 w-7 text-amber-400" />
                      </div>
                      <span className="text-2xl md:text-3xl font-bold text-amber-400">
                        {t('trainingCourses.hero.comingSoon')}
                      </span>
                    </div>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                      {t('trainingCourses.hero.comingSoonText')}{' '}
                      <a
                        href="mailto:info@scamnemesis.com"
                        className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-semibold transition-colors"
                      >
                        info@scamnemesis.com
                      </a>{' '}
                      {t('trainingCourses.hero.comingSoonTextEnd')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Cybersecurity Courses Description Section */}
        <section className="w-full py-24 md:py-32 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-base font-medium mb-10">
                <Sparkles className="h-5 w-5" />
                {t('trainingCourses.programs.badge')}
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-10 leading-tight">
                {t('trainingCourses.programs.title')}
              </h2>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
                {t('trainingCourses.programs.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Course Categories Section - 3 Premium Cards */}
        <section className="w-full py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
                {/* Free Public Courses Card */}
                <Card className="group relative overflow-hidden border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />

                  <CardHeader className="pb-6 pt-10 px-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                        <Play className="h-10 w-10 text-white" />
                      </div>
                      <div className="inline-flex px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                        {t('trainingCourses.freeCourses.badge')}
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
                      {t('trainingCourses.freeCourses.title')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-10 pb-10 space-y-8">
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('trainingCourses.freeCourses.description')}
                    </p>

                    <ul className="space-y-5">
                      {freeCourseItems.map((item, index) => {
                        const Icon = freeCourseIcons[index] || AlertTriangle;
                        const color = freeCourseColors[index] || 'red';
                        const colorClasses: Record<string, string> = {
                          red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                          blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                          purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                          cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
                          pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
                        };
                        return (
                          <li key={index} className="flex items-start gap-4">
                            <div className={`flex-shrink-0 p-2.5 rounded-xl ${colorClasses[color]}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-base text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>

                {/* Professional Videos Card */}
                <Card className="group relative overflow-hidden border-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />

                  <CardHeader className="pb-6 pt-10 px-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                        <Lock className="h-10 w-10 text-white" />
                      </div>
                      <div className="inline-flex px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                        {t('trainingCourses.professionalVideos.badge')}
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
                      {t('trainingCourses.professionalVideos.title')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-10 pb-10 space-y-8">
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('trainingCourses.professionalVideos.description')}
                    </p>

                    <ul className="space-y-5">
                      {professionalAudiences.map((audience, index) => {
                        const config = professionalConfig[index] || professionalConfig[0];
                        const Icon = config.icon;
                        const colorClasses: Record<string, string> = {
                          blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                          emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                          purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                          cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
                          amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                        };
                        return (
                          <li key={index} className="flex items-start gap-4">
                            <div className={`flex-shrink-0 p-2.5 rounded-xl ${colorClasses[config.color]}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="pt-0.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {audience.title}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>

                {/* Company Training Card */}
                <Card className="group relative overflow-hidden border-2 border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />

                  <CardHeader className="pb-6 pt-10 px-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                        <Building className="h-10 w-10 text-white" />
                      </div>
                      <div className="inline-flex px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-semibold">
                        {t('trainingCourses.companyTraining.badge')}
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
                      {t('trainingCourses.companyTraining.title')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-10 pb-10 space-y-8">
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('trainingCourses.companyTraining.description1')}
                    </p>

                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('trainingCourses.companyTraining.description2')}
                    </p>

                    <div className="pt-4">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 text-lg py-7 font-semibold"
                        asChild
                      >
                        <Link href={`/${locale}/contact-us`}>
                          <Mail className="mr-3 h-5 w-5" />
                          {t('trainingCourses.companyTraining.button')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiators Section */}
        <section className="w-full py-24 md:py-32 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-20 md:mb-24">
                <div className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-base font-medium mb-10">
                  <Target className="h-5 w-5" />
                  {t('trainingCourses.differentiators.badge')}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-10 leading-tight">
                  {t('trainingCourses.differentiators.title')}
                </h2>
              </div>

              {/* 4-Feature Grid */}
              <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
                {differentiators.map((item, index) => {
                  const colorSchemes = [
                    { border: 'border-blue-200 dark:border-blue-800/50', bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20' },
                    { border: 'border-emerald-200 dark:border-emerald-800/50', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20' },
                    { border: 'border-purple-200 dark:border-purple-800/50', bg: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20' },
                    { border: 'border-amber-200 dark:border-amber-800/50', bg: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20' },
                  ];
                  const colors = colorSchemes[index] || colorSchemes[0];

                  return (
                    <Card
                      key={index}
                      className={`group relative overflow-hidden ${colors.border} bg-gradient-to-br ${colors.bg} shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current/5 to-transparent rounded-bl-full" />

                      <CardContent className="p-10 md:p-12 lg:p-14">
                        <div className="flex items-start gap-7">
                          {/* Emoji */}
                          <div className="flex-shrink-0">
                            <span className="text-5xl md:text-6xl" role="img" aria-label={item.title}>
                              {item.emoji}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="space-y-5">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="w-full py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-tr-full" />

                <CardContent className="relative z-10 p-10 md:p-14 lg:p-16">
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl scale-125" />
                        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/25">
                          <Award className="h-16 w-16 md:h-20 md:w-20 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                        {t('trainingCourses.certifications.title')}
                      </h2>
                      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t('trainingCourses.certifications.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section - Book a Free Consultation */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="relative inline-flex mb-8">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl scale-150" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-2xl">
                  <Users className="h-14 w-14 text-white" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                {t('trainingCourses.cta.title')}
              </h2>

              <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                {t('trainingCourses.cta.description')}
              </p>

              <div className="pt-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-xl px-14 py-8 font-semibold"
                  asChild
                >
                  <Link href={`/${locale}/contact-us`}>
                    <Zap className="mr-4 h-7 w-7" />
                    {t('trainingCourses.cta.button')}
                    <ArrowRight className="ml-4 h-6 w-6" />
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-10 pt-10 text-slate-400">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-base">{t('trainingCourses.cta.freeConsultation')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <span className="text-base">{t('trainingCourses.cta.expertInstructors')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5" />
                  <span className="text-base">{t('trainingCourses.cta.updatedContent')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
