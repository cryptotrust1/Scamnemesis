'use client';

import Link from 'next/link';
import {
  Shield,
  Building,
  Scale,
  Globe,
  Users,
  ArrowRight,
  CheckCircle,
  FileText,
  CreditCard,
  Lock,
  Award,
  DollarSign,
  Target,
  Briefcase,
  TrendingUp,
  Eye,
  UserCheck,
  Fingerprint,
  Database,
  ShieldCheck,
  BadgeCheck,
  FileCheck,
  Wallet,
  Bitcoin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const useCases = [
  {
    title: 'Evaluating Strategic Partnerships & Joint Ventures',
    description: 'Before committing capital and resources, it is imperative to verify the operational, financial, and reputational integrity of a potential partner. Our analysis confirms the legitimacy of the entity and its key principals, ensuring you are building your venture on a solid foundation.',
    icon: Users,
  },
  {
    title: 'Onboarding Key Suppliers & Vendors',
    description: 'A resilient and ethical supply chain is a critical business asset. We vet your key suppliers for financial stability, regulatory compliance, adverse media history, and other red flags that could indicate a risk of disruption or reputational harm. Ensure your supply chain is a source of strength, not a vulnerability.',
    icon: Building,
  },
  {
    title: 'Pre-Investment & M&A Screening',
    description: 'For private equity firms, venture capitalists, and corporate development teams, our service provides an essential layer of preliminary integrity and reputational due diligence. We identify critical red flags—such as undisclosed litigation, connections to sanctioned individuals, or a history of fraud—that may be missed in traditional financial audits, allowing you to proceed with your transaction with greater certainty.',
    icon: TrendingUp,
  },
  {
    title: 'Vetting High-Value Clients (KYB Compliance)',
    description: 'Protect your firm from financial crime and meet stringent regulatory requirements (e.g., AML/CFT). Our Know Your Business (KYB) verification process confirms the identity and legitimacy of new corporate clients, analyzes their ownership structure to identify Ultimate Beneficial Owners (UBOs), and screens for sanctions or criminal history.',
    icon: UserCheck,
  },
];

const investigationPillars = [
  {
    number: '1',
    title: 'Corporate Identity & Legal Architecture',
    description: 'We dissect the legal structure of the entity down to the finest detail. Our team verifies its legal existence, ownership structure, and regulatory status across international business registries — including those not commonly accessible.',
    icon: Building,
    image: '/images/corporate-identity.jpg',
  },
  {
    number: '2',
    title: 'Financial Integrity & Reputational Risks',
    description: 'We map the financial health and reputational profile of the target. Our analysts examine public records, court filings, data leaks, and deep-sourced media to uncover potential financial risks, discrepancies, or red flags.',
    icon: Scale,
    image: '/images/financial-integrity.jpg',
  },
  {
    number: '3',
    title: 'Digital Footprint & Asset Mapping',
    description: 'Using advanced OSINT and cyber intelligence tools, we trace the entity\'s online presence, domain history, digital assets, and technical infrastructure. This enables us to reveal hidden connections, undisclosed assets, or signs of fraudulent activity.',
    icon: Globe,
    image: '/images/digital-footprint.jpg',
  },
  {
    number: '4',
    title: 'Human Factor & Leadership Screening',
    description: 'Behind every company stand people — and this is where most risks originate. We conduct thorough background investigations into the careers, reputations, and potential conflicts of interest of key individuals, including ultimate beneficial owners (UBOs), to identify threats others often miss.',
    icon: Fingerprint,
    image: '/images/leadership-screening.jpg',
  },
];

const certifications = [
  { name: 'CFE', full: 'Certified Fraud Examiner' },
  { name: 'CAMS', full: 'Certified Anti-Money Laundering Specialist' },
  { name: 'CISA', full: 'Certified Information Systems Auditor' },
  { name: 'CISM', full: 'Certified Information Security Manager' },
  { name: 'OSCP', full: 'Offensive Security Certified Professional' },
];

const deliverables = [
  'Verification of corporate identity and legal status',
  'Analysis of ownership and management structure, including Ultimate Beneficial Owners (UBOs)',
  'Assessment of financial integrity and solvency',
  'Reputation and risk evaluation of your business partner or investment',
  'Audit of digital footprint and online assets',
];

const whyChoose = [
  {
    title: 'Intelligence-Grade Expertise',
    description: 'Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations.',
    icon: Award,
  },
  {
    title: 'Certified Specialists',
    description: 'Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®, along with military certifications in intelligence and cybersecurity.',
    icon: BadgeCheck,
  },
  {
    title: 'Advanced OSINT Techniques',
    description: 'We employ advanced Open-Source Intelligence (OSINT) and digital analysis techniques integrating hundreds of global databases, corporate registries, and proprietary sources.',
    icon: Database,
  },
  {
    title: 'Transparent Fixed Pricing',
    description: 'All data is handled according to strict confidentiality and security standards. Our service is transparent and free of hidden fees.',
    icon: DollarSign,
  },
];

const ORDER_FORM_URL = 'https://opnform.com/forms/contact-form-2qck1j';

export default function VerifyServiceProductPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Premium Design */}
      <section className="relative w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0E74FF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/20 border border-[#0E74FF]/30 mb-6">
              <Shield className="h-4 w-4 text-[#0E74FF]" />
              <span className="text-sm font-medium text-[#0E74FF]">Professional Due Diligence Services</span>
            </div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Investigative Due Diligence & Business Partner Vetting
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white">Mitigate Risk Before You Engage:</strong> Verify the Integrity of Your Next Business Partner, Supplier, or Investment
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg" asChild>
                <Link href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Order Service Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-500 text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
                <Link href="#process">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-lg md:text-xl text-[#64748b] leading-relaxed">
                In today&apos;s interconnected global economy, every new business relationship presents both opportunity and risk. Unidentified liabilities, reputational issues, or non-compliant practices within a partner&apos;s operations can lead to significant financial loss, legal exposure, and brand damage. Standard background checks are no longer sufficient.
              </p>
              <p className="text-lg md:text-xl text-[#1e293b] leading-relaxed font-medium mt-6">
                ScamNemesis provides comprehensive, expert-led investigative due diligence that delivers the critical intelligence you need to make strategic decisions with confidence. Our rapid, in-depth analysis uncovers the facts behind the figures, ensuring the entities you engage with are legitimate, reliable, and aligned with your standards of integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Confidentiality Banner */}
      <section className="w-full py-8 bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white text-center md:text-left">
            <Lock className="h-8 w-8 flex-shrink-0" />
            <div>
              <p className="font-semibold text-lg">Guaranteed Confidentiality and Discretion</p>
              <p className="text-white/90">We protect your privacy. All information is confidential and anonymous. We never share it without your consent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* When is Due Diligence Essential - Use Cases */}
      <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0E74FF]/10 mb-6">
                <Briefcase className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                Investigative Due Diligence for Business Partners
              </h2>
              <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
                When is Professional Due Diligence Essential?
              </p>
              <p className="text-lg text-[#64748b] max-w-3xl mx-auto mt-4">
                Our confidential investigative services are designed for high-stakes business scenarios where thorough vetting is non-negotiable. We provide critical intelligence for:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <Card key={useCase.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-[#1e293b] leading-tight">
                            {useCase.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#64748b] leading-relaxed">{useCase.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Investigation Process - Four Pillars */}
      <section id="process" className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0E74FF]/10 mb-6">
                <Eye className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                Our Investigative Process: Elite Due Diligence Across 4 Operational Layers
              </h2>
              <p className="text-lg text-[#64748b] max-w-4xl mx-auto leading-relaxed">
                Every investigation we conduct is executed as a precision operation — combining the methodology of intelligence agencies with the analytical discipline of top-tier investigators. Our approach is built on four powerful pillars and leverages hundreds of global data sources, advanced OSINT techniques, and proprietary databases. The result goes far beyond standard &quot;verification&quot; — it&apos;s a comprehensive intelligence-driven risk analysis.
              </p>
            </div>

            <div className="space-y-8">
              {investigationPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const isEven = index % 2 === 0;
                return (
                  <Card key={pillar.number} className="overflow-hidden border-0 shadow-xl">
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                      {/* Content Side */}
                      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                            {pillar.number}
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-[#0E74FF]" />
                          </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-4">
                          {pillar.title}
                        </h3>
                        <p className="text-lg text-[#64748b] leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>

                      {/* Visual Side */}
                      <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 p-8 md:p-12 flex items-center justify-center min-h-[300px]">
                        <div className="relative">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center shadow-2xl">
                            <Icon className="h-16 w-16 md:h-20 md:w-20 text-white" />
                          </div>
                          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Due Diligence Report */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/20 border border-[#0E74FF]/30 mb-6">
                  <FileCheck className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm font-medium text-[#0E74FF]">What You Get</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Due Diligence Report
                </h2>

                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Our investigative unit brings together experts with experience in Big 4 consulting firms, military intelligence, and international security agencies. Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, and OSCP®, ensuring the highest level of accuracy, quality, and professional expertise.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                    <FileText className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Comprehensive and Practical Report</h4>
                      <p className="text-slate-400 text-sm">The result of our work is a detailed, clearly structured PDF report, delivered within 30 days. The document is designed as a practical guide for strategic decision-making.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                    <Target className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">360° Intelligence Profile</h4>
                      <p className="text-slate-400 text-sm">Complete view of corporate risks, financial integrity, reputation, and trustworthiness. Our due diligence is a proactive tool for protecting capital, reputation, and business interests.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                    <DollarSign className="h-6 w-6 text-[#0E74FF] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Transparent Pricing and No Surprises</h4>
                      <p className="text-slate-400 text-sm">Our services are offered at a fixed price, with no additional or hidden fees. You know exactly what you are getting – no unpleasant surprises.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Report Includes:
                </h3>
                <ul className="space-y-4">
                  {deliverables.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 text-center text-slate-400 text-sm">
                  This 360° intelligence profile provides critical insights for strategic decision-making, capital protection, and minimizing legal or financial risks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-8xl text-[#0E74FF]/20 font-serif">&quot;</div>
              <blockquote className="text-2xl md:text-3xl font-light text-[#1e293b] italic leading-relaxed relative z-10">
                Luck is a matter of preparation meeting opportunity.
              </blockquote>
              <cite className="block mt-6 text-lg font-semibold text-[#0E74FF] not-italic">
                — Seneca
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0E74FF]/10 mb-6">
                <Target className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                Launch Your Confidential Corporate Investigation & Due Diligence in 3 Simple Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <Card className="relative border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4]" />
                <CardHeader className="pt-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <CardTitle className="text-xl">Complete the Online Form for Corporate Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#64748b] mb-4">
                    Start safely and efficiently: fill out our online form with information about the target company or business partner. The form is quick, minimalistic, and all data is handled with strict confidentiality.
                  </p>
                  <div className="space-y-2 mt-4 text-sm">
                    <p className="font-semibold text-[#1e293b]">After submitting the form:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#0E74FF] font-semibold">A.</span>
                        <span className="text-[#64748b]">We create a secure and private communication channel.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0E74FF] font-semibold">B.</span>
                        <span className="text-[#64748b]">We explain the entire due diligence and risk analysis process in detail.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0E74FF] font-semibold">C.</span>
                        <span className="text-[#64748b]">We provide an exact quote based on the scope of the report and the complexity of the verification.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="relative border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4]" />
                <CardHeader className="pt-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <CardTitle className="text-xl">Make a Secure Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#64748b] mb-4">
                    Finalize your order through our secure payment gateway. We accept:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-[#0E74FF]" />
                      <span className="text-[#1e293b]">Major credit cards</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Wallet className="h-5 w-5 text-[#0E74FF]" />
                      <span className="text-[#1e293b]">Bank transfers</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Bitcoin className="h-5 w-5 text-[#0E74FF]" />
                      <span className="text-[#1e293b]">Cryptocurrencies</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748b] mt-4">
                    A transparent, fixed price ensures there are no hidden fees or additional costs.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="relative border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4]" />
                <CardHeader className="pt-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <CardTitle className="text-xl">Receive Your Detailed Due Diligence Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#64748b] mb-4">
                    Our team of experienced analysts immediately initiates the investigation. You will receive a comprehensive PDF report via email within 30 days.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-[#1e293b]">The report includes:</p>
                    <ul className="space-y-1">
                      {deliverables.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[#64748b]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ScamNemesis */}
      <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0E74FF]/10 mb-6">
                <ShieldCheck className="h-8 w-8 text-[#0E74FF]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                Why Choose ScamNemesis for Advanced Business Intelligence?
              </h2>
              <p className="text-lg text-[#64748b] max-w-4xl mx-auto leading-relaxed">
                Our investigative unit combines experts with experience in military intelligence, OSINT/SOCMINT operations, and Big 4 corporate investigations. Each investigation is conducted by certified specialists holding credentials such as CFE®, CAMS®, CISA®, CISM®, OSCP®, along with military certifications in intelligence and cybersecurity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {whyChoose.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="pt-8 pb-6">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#1e293b] mb-2">{item.title}</h3>
                      <p className="text-sm text-[#64748b]">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Certifications */}
            <div className="text-center">
              <p className="text-sm text-[#64748b] mb-4">Our team holds elite certifications:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="px-6 py-3 bg-white text-[#0E74FF] rounded-xl font-semibold border-2 border-[#0E74FF]/20 hover:border-[#0E74FF] transition-colors duration-300 cursor-default"
                    title={cert.full}
                  >
                    {cert.name}®
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Value Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] p-8 md:p-12 text-white">
                <FileText className="h-12 w-12 mb-6 opacity-80" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Comprehensive Due Diligence Report
                </h2>
                <h3 className="text-xl mb-6 opacity-90">
                  Protect your business interests.
                </h3>
                <p className="text-lg leading-relaxed opacity-90 mb-6">
                  Order your Due Diligence report today. Take your next strategic step with confidence. Our expert analysis provides the clarity you need to avoid working with unsuitable partners and helps you save significant time and money.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <p className="text-lg italic">
                    &quot;I paid $5,000 for the analysis and saved $1.5 million on a bad investment.&quot;
                  </p>
                  <p className="text-sm mt-2 opacity-80">— One of our satisfied clients</p>
                </div>
                <p className="opacity-90">
                  This perfectly illustrates the value of our service. Business risk always exists, but with us, you can significantly reduce it.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#0E74FF]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0E74FF] mb-8 shadow-lg shadow-[#0E74FF]/30">
              <Shield className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Protect Your Business Today
            </h2>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Take your next strategic step with confidence. Our expert analysis provides the clarity you need to make informed decisions and protect your capital, reputation, and business interests.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 transition-all duration-300" asChild>
                <Link href={ORDER_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Order Service Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="mt-8 text-slate-400 text-sm">
              Fixed-price model with no hidden fees. Confidential and secure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
