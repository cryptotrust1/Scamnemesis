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

// Database statistics - primary
const stats = [
  { label: 'Malicious IP Addresses', value: '612M+', icon: Globe },
  { label: 'Stolen Vehicles Database', value: '12M+', icon: Database },
  { label: 'Verified Phishing URLs', value: '9M+', icon: AlertTriangle },
  { label: 'Dissolved Companies', value: '6.7M+', icon: FileText },
];

// Additional stats from demo
const additionalStats = [
  { label: 'Crypto Scam Projects', value: '9,221+' },
  { label: 'Ransomware Wallets', value: '11,186+' },
  { label: 'Scam Calls (US)', value: '2M+' },
  { label: 'CFPB Complaints', value: '3M+' },
  { label: 'IC3 Reports (2024)', value: '859,000' },
];

const totalStats = [
  { label: 'Records', value: '640M+' },
  { label: 'Data Sources', value: '130+' },
  { label: 'Categories', value: '8' },
  { label: 'Access', value: '24/7' },
  { label: 'Update Frequency', value: '5 min' },
];

// Feature roadmap data - complete list from demo
const roadmapFeatures = [
  // Functional (100%)
  { name: 'Scam search 38+ identifiers', progress: 100, status: 'functional' },
  { name: 'Case linking similarities', progress: 100, status: 'functional' },
  // In Development
  { name: 'API: dispatch data to third parties', progress: 80, status: 'development' },
  { name: 'Media processing + OCR', progress: 80, status: 'development' },
  { name: 'AI image/video deepfake detection', progress: 69, status: 'development' },
  { name: 'People & company search', progress: 68, status: 'development' },
  { name: 'Graph database nodes & relationships', progress: 61, status: 'development' },
  { name: 'Domain score & reputation', progress: 59, status: 'development' },
  { name: 'Reverse face search', progress: 58, status: 'development' },
  { name: 'Media forensics - geolocation & edits', progress: 57, status: 'development' },
  { name: 'Blockchain analysis', progress: 56, status: 'development' },
  { name: 'Media forensics - advanced modules', progress: 53, status: 'development' },
  { name: 'CTI Cyber Threat Intelligence', progress: 52, status: 'development' },
  { name: 'Similar face matching', progress: 52, status: 'development' },
  // Planned
  { name: 'Email verification', progress: 50, status: 'planned' },
  { name: 'AI/NLP tool for OSINT', progress: 50, status: 'planned' },
  { name: 'Website widget - reporting + search', progress: 24, status: 'planned' },
  { name: 'AI bot "Is this a scam?"', progress: 0, status: 'planned' },
  { name: 'Data enrichment from 130+ sources', progress: 0, status: 'planned' },
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
      {/* Hero Section - Clean minimal style like demo */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col space-y-6">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl text-[#1e293b]">
                Is It a Scam? Check Any Website, Person, Company, Phone or Email Instantly
              </h1>
              <p className="text-lg text-[#64748b] md:text-xl leading-relaxed">
                Check scams instantly — verify people, websites, companies, job offers, emails, phone numbers, dating profiles, and more. Free real-time protection.
              </p>

              {/* Search Bar - Clean bordered style */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Search name, phone, email, website, IBAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-12 text-base px-4 border-[#e8e8e8] focus:border-[#0E74FF] focus:ring-[#0E74FF]"
                />
                <Button type="submit" size="lg" className="h-12 px-6 bg-[#0E74FF] hover:bg-[#0E74FF]/90">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>

              {/* CTA Buttons - Clean style */}
              <div className="flex flex-wrap gap-3">
                <Button size="default" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                  <Link href="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Scam Checker
                  </Link>
                </Button>
                <Button size="default" variant="outline" className="border-[#e8e8e8] hover:bg-[#f8fafc]" asChild>
                  <Link href="/report/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Report Scam
                  </Link>
                </Button>
                <Button size="default" variant="outline" className="border-[#e8e8e8] hover:bg-[#f8fafc]" asChild>
                  <Link href="/i-was-scammed-need-help">
                    <AlertTriangle className="mr-2 h-4 w-4" />
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
                className="rounded-lg border border-[#e8e8e8]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Database Stats Section - Demo style: white bg, bordered cards, thin numbers */}
      <section className="w-full py-16 bg-white">
        <div className="container px-4 md:px-6">
          {/* Primary stats - bordered cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="stat-card">
                  <Icon className="h-6 w-6 mx-auto mb-3 text-[#64748b]" />
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>
          {/* Additional stats - bordered cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            {additionalStats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-number text-2xl">{stat.value}</div>
                <div className="stat-label text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Total stats row */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 border-t border-[#e8e8e8]">
            {totalStats.map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div className="text-2xl font-extralight text-[#1e293b]">{stat.value}</div>
                <div className="text-sm text-[#64748b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Sections - Clean bordered style like demo */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-3">
            {faqSections.map((section) => (
              <div
                key={section.id}
                className="border border-[#e8e8e8] rounded-lg overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#f8fafc] transition-colors"
                >
                  <h3 className="text-lg font-medium text-[#1e293b]">{section.title}</h3>
                  {expandedSection === section.id ? (
                    <ChevronUp className="h-5 w-5 text-[#64748b]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#64748b]" />
                  )}
                </button>
                {expandedSection === section.id && (
                  <div className="px-5 pb-5 border-t border-[#e8e8e8]">
                    <div className="grid md:grid-cols-2 gap-5 pt-5">
                      <div className="relative h-48 md:h-56 rounded-lg overflow-hidden border border-[#e8e8e8]">
                        <Image
                          src={section.image}
                          alt={section.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-[#64748b] whitespace-pre-line text-sm leading-relaxed">
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

      {/* Roadmap Section - Clean bordered style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl">Feature Roadmap</h2>
            <p className="text-[#64748b] mt-2">What we&apos;re building and what&apos;s already live</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-3">
              {roadmapFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#e8e8e8]"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#1e293b]">{feature.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          feature.status === 'functional'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : feature.status === 'development'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }
                      >
                        {feature.status === 'functional'
                          ? 'Live'
                          : feature.status === 'development'
                          ? 'In Development'
                          : 'Planned'}
                      </Badge>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          feature.status === 'functional'
                            ? 'bg-green-500'
                            : 'bg-[#0E74FF]'
                        }`}
                        style={{ width: `${feature.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#64748b] w-10 text-right">
                    {feature.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Clean bordered cards */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl">Our Services</h2>
            <p className="text-[#64748b] mt-2">Professional fraud investigation and recovery services</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="border border-[#e8e8e8] shadow-none hover:border-[#0E74FF]/30 transition-colors bg-white">
                  <CardHeader className="pb-3">
                    <Icon className="h-8 w-8 text-[#0E74FF] mb-3" />
                    <CardTitle className="text-base font-medium text-[#1e293b]">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#64748b] mb-4 leading-relaxed">{service.description}</p>
                    {service.price && (
                      <div className="mb-4">
                        <span className="text-xl font-semibold text-[#0E74FF]">{service.price}</span>
                        <span className="text-xs text-[#64748b] ml-2">{service.priceNote}</span>
                      </div>
                    )}
                    <Button className="w-full bg-[#0E74FF] hover:bg-[#0E74FF]/90 h-9 text-sm" asChild>
                      <Link href={service.link}>
                        Learn More
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Training Section - Clean bordered style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl">Free Training</h2>
            <p className="text-[#64748b] mt-2">Learn how to protect yourself and your business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {trainingTopics.map((topic) => (
              <Card key={topic} className="border border-[#e8e8e8] shadow-none hover:border-[#0E74FF]/30 transition-colors cursor-pointer bg-white">
                <CardContent className="flex items-center gap-3 p-4">
                  <BookOpen className="h-5 w-5 text-[#0E74FF] flex-shrink-0" />
                  <span className="text-sm font-medium text-[#1e293b]">{topic}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/training-courses">
                Start Free Training
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Certifications - Clean minimal */}
      <section className="w-full py-10 border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-10">
            <Image src="/images/cert-1.png" alt="Certification 1" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-2.png" alt="Certification 2" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-3.png" alt="Certification 3" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-4.png" alt="Certification 4" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-5.png" alt="Certification 5" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-6.png" alt="Certification 6" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </div>
      </section>

      {/* CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-5 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl">
              Ready to protect yourself?
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              Join thousands of users who have already checked suspicious contacts and reported scams. Your report could save someone from becoming a victim.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Check Now
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-white" asChild>
                <Link href="/report/new">
                  <FileText className="mr-2 h-4 w-4" />
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
