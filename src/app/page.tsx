'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Shield,
  Database,
  Globe,
  ArrowRight,
  FileText,
  AlertTriangle,
  Eye,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Database statistics
const stats = [
  { label: 'Malicious IP Addresses', value: '612M+', icon: Globe },
  { label: 'Stolen Vehicles Database', value: '12M+', icon: Database },
  { label: 'Verified Phishing URLs', value: '9M+', icon: AlertTriangle },
  { label: 'Dissolved Companies', value: '6.7M+', icon: FileText },
];

const totalStats = [
  { label: 'Records', value: '640M+' },
  { label: 'Data Sources', value: '130+' },
  { label: 'Categories', value: '8' },
  { label: 'Access', value: '24/7' },
];

// Feature roadmap data
const roadmapFeatures = [
  { name: 'API: dispatch data to third parties', progress: 80, status: 'development' },
  { name: 'Scam search 38+ identifiers', progress: 100, status: 'functional' },
  { name: 'Case linking similarities', progress: 100, status: 'functional' },
  { name: 'Media processing + OCR', progress: 80, status: 'development' },
  { name: 'Website widget', progress: 24, status: 'development' },
  { name: 'Blockchain analysis', progress: 56, status: 'development' },
  { name: 'CTI Cyber Threat Intelligence', progress: 52, status: 'development' },
  { name: 'AI/NLP tool for OSINT', progress: 50, status: 'planned' },
  { name: 'AI image/video deepfake detection', progress: 69, status: 'development' },
  { name: 'Graph database nodes & relationships', progress: 61, status: 'development' },
  { name: 'Email verification', progress: 50, status: 'planned' },
  { name: 'People & company search', progress: 68, status: 'development' },
];

// Services
const services = [
  {
    title: 'Fraud Recovery Services',
    description: 'Recovery of funds lost to fraud. Our team combines digital forensics, OSINT, and legal coordination to help you recover your money.',
    price: '€600',
    priceNote: '5 hours investigator work',
    link: '/money-recovery',
    icon: Shield,
  },
  {
    title: 'Due Diligence Services',
    description: 'Independent screening of partners, clients, and investments. KYB/KYC verification of registrations and backgrounds.',
    link: '/verify-serviceproduct',
    icon: Search,
  },
  {
    title: 'Corporate Investigations',
    description: 'Internal and external investigations using digital forensics, OSINT, and financial analytics.',
    link: '/scammer-removal',
    icon: Eye,
  },
  {
    title: 'Security Training & Consulting',
    description: 'Security training for teams with role-based training, phishing simulations, and incident response exercises.',
    link: '/training-courses',
    icon: BookOpen,
  },
];

// FAQ sections content
const faqSections = [
  {
    id: 'who',
    title: 'Who is this platform for?',
    image: '/images/section-who.png',
    content: `ScamNemesis is for people who want to verify a person, company, phone number, email, or website before engaging with them. It's also for people who have already been scammed and want to report their case to help warn others and potentially connect with fellow victims.`,
  },
  {
    id: 'problem',
    title: 'What problem are we solving?',
    image: '/images/section-problem.jpg',
    content: `Online fraud grew by roughly 2,300% between 2019 and 2024. In 2024, estimated losses reached USD 1.03 trillion globally. Most victims feel isolated and don't know where to turn. Traditional authorities are often overwhelmed and underequipped to handle the volume and complexity of modern fraud.`,
  },
  {
    id: 'how',
    title: 'How to use ScamNemesis?',
    image: '/images/section-how.jpg',
    content: `1. Search identifiers using the search bar - enter phone numbers, emails, names, websites, or descriptions.
2. Results are shown by match score with the strongest matches appearing first.
3. Click cases to open full reports with all available details.
4. Report scams anonymously to help others.
5. Find similar cases to connect with other victims.
6. Interpret matches responsibly and verify information independently.`,
  },
  {
    id: 'important',
    title: 'Why is this important?',
    image: '/images/section-important.jpg',
    content: `Every unreported scam helps scammers reach more victims. When fraud goes unreported, criminals operate with impunity. Shared intelligence breaks their biggest advantage — isolation. By reporting and sharing information, we create a community shield that protects everyone.`,
  },
  {
    id: 'why',
    title: 'Why did we create this project?',
    image: '/images/section-why.jpg',
    content: `This project was born out of anger and frustration with ineffective police methods and the lack of accessible tools for fraud victims. We became victims of fraud ourselves and realized the system was broken. We decided to build the tool we wished existed when we needed help.`,
  },
  {
    id: 'what',
    title: 'What is ScamNemesis?',
    image: '/images/section-what.jpg',
    content: `ScamNemesis is a community-driven verification and intelligence platform. It combines a reported-scam database, blockchain tracing, monitoring across 130+ data sources, phone and email verification, and AI-powered analysis to provide comprehensive fraud protection.`,
  },
  {
    id: 'find',
    title: 'What will you find here?',
    image: '/images/section-find.png',
    content: `A search system for more than 38 identifiers including names, phone numbers, emails, IBANs, crypto wallets, websites, and more. When there's a match, a report appears with all available details. You can also see related cases and connect with other victims.`,
  },
  {
    id: 'team',
    title: 'Who is behind this project?',
    image: '/images/section-team.png',
    content: `An international team of investigators and ethical hackers from three continents and more than five countries. Our aim is to stay free forever and provide accessible fraud protection to everyone, regardless of their financial situation.`,
  },
  {
    id: 'future',
    title: 'What are we planning for the future?',
    image: '/images/section-future.png',
    content: `We're continuously developing new features including advanced AI analysis, blockchain tracking, corporate investigations tools, and expanded database coverage. Check our roadmap below to see what's in development.`,
  },
];

// Training topics
const trainingTopics = [
  'How to prevent fraud in business',
  'Identity protection insurance',
  'Safety on the internet',
  '10 ways to prevent cybercrime',
  'How to recognize a scam',
  'Report cybercrime to police',
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col space-y-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-[#0E74FF]">
                Is It a Scam? Check Any Website, Person, Company, Phone or Email Instantly
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Check scams instantly 🔎 — verify people, websites, companies, job offers, emails, phone numbers, dating profiles, and more. Enjoy free real-time protection 🛡️.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Search name, phone, email, website, IBAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-14 text-lg px-6"
                />
                <Button type="submit" size="lg" className="h-14 px-8 bg-[#0E74FF] hover:bg-[#0E74FF]/90">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                  <Link href="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Scam Checker
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/report/new">
                    <FileText className="mr-2 h-5 w-5" />
                    Report Scam
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/i-was-scammed-need-help">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    I was scammed
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <Image
                src="/images/hero-illustration.jpg"
                alt="Fraud prevention illustration"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Database Stats Section */}
      <section className="w-full py-12 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-8 pt-6 border-t border-white/20">
            {totalStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Sections */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {faqSections.map((section) => (
              <div
                key={section.id}
                className="border rounded-xl overflow-hidden bg-card shadow-sm"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                >
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  {expandedSection === section.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSection === section.id && (
                  <div className="px-6 pb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                        <Image
                          src={section.image}
                          alt={section.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-muted-foreground whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Feature Roadmap</h2>
            <p className="text-muted-foreground mt-2">What we&apos;re building and what&apos;s already live</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {roadmapFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{feature.name}</span>
                      <Badge
                        variant={
                          feature.status === 'functional'
                            ? 'default'
                            : feature.status === 'development'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          feature.status === 'functional'
                            ? 'bg-green-500'
                            : ''
                        }
                      >
                        {feature.status === 'functional'
                          ? 'Live'
                          : feature.status === 'development'
                          ? 'In Development'
                          : 'Planned'}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          feature.status === 'functional'
                            ? 'bg-green-500'
                            : 'bg-[#0E74FF]'
                        }`}
                        style={{ width: `${feature.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                    {feature.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Services</h2>
            <p className="text-muted-foreground mt-2">Professional fraud investigation and recovery services</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-[#0E74FF] mb-4" />
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    {service.price && (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-[#0E74FF]">{service.price}</span>
                        <span className="text-sm text-muted-foreground ml-2">{service.priceNote}</span>
                      </div>
                    )}
                    <Button className="w-full bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                      <Link href={service.link}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Training Section */}
      <section className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Free Training</h2>
            <p className="text-muted-foreground mt-2">Learn how to protect yourself and your business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {trainingTopics.map((topic) => (
              <Card key={topic} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <BookOpen className="h-8 w-8 text-[#0E74FF] flex-shrink-0" />
                  <span className="font-medium">{topic}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/training-courses">
                Start Free Training
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <Image src="/images/cert-1.png" alt="Certification 1" width={120} height={60} className="opacity-70 hover:opacity-100 transition-opacity" />
            <Image src="/images/cert-2.png" alt="Certification 2" width={120} height={60} className="opacity-70 hover:opacity-100 transition-opacity" />
            <Image src="/images/cert-3.png" alt="Certification 3" width={120} height={60} className="opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to protect yourself?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Join thousands of users who have already checked suspicious contacts and reported scams. Your report could save someone from becoming a victim.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Check Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0E74FF]" asChild>
                <Link href="/report/new">
                  <FileText className="mr-2 h-5 w-5" />
                  Report Scam
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
