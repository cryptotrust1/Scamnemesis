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
  Search,
  CreditCard,
  Lock,
  Award,
  Clock,
  DollarSign,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const useCases = [
  {
    title: 'Strategic Partnerships & Joint Ventures',
    description: 'Validate potential partners before committing to long-term business relationships',
    icon: Users,
  },
  {
    title: 'Supplier & Vendor Onboarding',
    description: 'Ensure supply chain integrity by verifying vendor credentials and reputation',
    icon: Building,
  },
  {
    title: 'Pre-Investment & M&A Screening',
    description: 'Uncover hidden risks before making significant financial commitments',
    icon: DollarSign,
  },
  {
    title: 'High-Value Contract Negotiations',
    description: 'Gain leverage and confidence in major business negotiations',
    icon: FileText,
  },
];

const investigationPillars = [
  {
    number: '1',
    title: 'Corporate Identity & Legal Architecture',
    description: 'Verifies legal existence and ownership structure across international registries. We confirm official registration, active status, and corporate hierarchy.',
    icon: Building,
  },
  {
    number: '2',
    title: 'Financial Integrity & Reputational Risks',
    description: 'Examines financial health through public records, court filings, and regulatory databases. Identifies past litigation and compliance issues.',
    icon: Scale,
  },
  {
    number: '3',
    title: 'Digital Footprint & Asset Mapping',
    description: 'Uses OSINT tools to trace online presence, domain ownership, and digital infrastructure. Maps connections between entities and individuals.',
    icon: Globe,
  },
  {
    number: '4',
    title: 'Human Factor & Leadership Screening',
    description: 'Investigates backgrounds of key individuals and ultimate beneficial owners. Verifies credentials and identifies potential conflicts of interest.',
    icon: Users,
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
  'Corporate identity verification and registration status',
  'Ownership structure analysis including Ultimate Beneficial Owners (UBOs)',
  'Financial health assessment and litigation history',
  'Reputation and media evaluation across multiple sources',
  'Digital asset and infrastructure audit',
  'Risk assessment matrix and actionable recommendations',
];

const whyChoose = [
  {
    title: 'Intelligence-Grade Research',
    description: 'Military and Big 4 consulting backgrounds bring government-level investigative techniques to business due diligence',
    icon: Award,
  },
  {
    title: 'Fixed-Price Transparency',
    description: 'No hidden fees or hourly billing uncertainty. One price for comprehensive investigation coverage',
    icon: DollarSign,
  },
  {
    title: 'Certified Expertise',
    description: 'Team holds CFE, CAMS, CISA, CISM, and OSCP certifications from recognized global institutions',
    icon: Lock,
  },
  {
    title: 'Rapid Turnaround',
    description: 'Comprehensive reports delivered within 30 days, allowing you to make timely business decisions',
    icon: Clock,
  },
];

export default function VerifyServiceProductPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-[#0E74FF]" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Investigative Due Diligence & Business Partner Vetting
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              Mitigate risk before it becomes reality. Our intelligence-driven investigations verify business partners, suppliers, and investments before you commit—protecting your capital, reputation, and strategic interests.
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Order Service Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1: When is Professional Due Diligence Essential? */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">When is Professional Due Diligence Essential?</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Standard background checks miss critical risks. Our investigations uncover what others overlook in these high-stakes situations.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase) => {
                const Icon = useCase.icon;
                return (
                  <Card key={useCase.title}>
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-2">
                        <Icon className="h-8 w-8 text-[#0E74FF]" />
                      </div>
                      <CardTitle className="text-lg">{useCase.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{useCase.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Four-Pillar Investigation Process */}
      <section className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Four-Pillar Investigation Process</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our systematic methodology examines every dimension of business risk through four complementary investigation pillars.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {investigationPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.number}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold">
                        {pillar.number}
                      </div>
                      <Icon className="h-8 w-8 text-[#0E74FF]" />
                    </div>
                    <CardTitle className="text-lg mt-4">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{pillar.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Professional Credentials */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-3xl font-bold mb-4">Professional Credentials</h2>
            <p className="text-muted-foreground mb-8">
              Our investigators hold elite certifications from leading global institutions, combining expertise in fraud examination, anti-money laundering, information security, and offensive cybersecurity.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="px-6 py-3 bg-[#0E74FF]/10 text-[#0E74FF] rounded-lg font-medium border border-[#0E74FF]/20"
                  title={cert.full}
                >
                  {cert.name}®
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Deliverable - Due Diligence Report */}
      <section className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
              <h2 className="text-3xl font-bold mb-4">Deliverable: Comprehensive Due Diligence Report</h2>
              <p className="text-muted-foreground">
                Receive a detailed PDF report within 30 days covering all investigation findings and risk assessments.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {deliverables.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 bg-white dark:bg-card rounded-lg border">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Service Ordering Process */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Service Ordering Process</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps from order to delivery—no complexity, no delays.
          </p>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <FileText className="h-10 w-10 mx-auto mb-4 text-[#0E74FF]" />
              <h3 className="font-semibold mb-2 text-lg">Submit Order Form</h3>
              <p className="text-sm text-muted-foreground">Complete our online intake form with target entity details and investigation scope</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <CreditCard className="h-10 w-10 mx-auto mb-4 text-[#0E74FF]" />
              <h3 className="font-semibold mb-2 text-lg">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">Pay via credit card, bank transfer, or cryptocurrency with complete transaction privacy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <Search className="h-10 w-10 mx-auto mb-4 text-[#0E74FF]" />
              <h3 className="font-semibold mb-2 text-lg">Receive Report</h3>
              <p className="text-sm text-muted-foreground">Get comprehensive PDF report via encrypted email within 30 days of payment confirmation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Value Proposition with Testimonial */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-muted/30 to-white dark:from-muted/30 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
              <h2 className="text-3xl font-bold mb-4">Value Proposition</h2>
              <p className="text-muted-foreground">
                A $5,000 investigation can prevent a $500,000 mistake. Our due diligence has saved clients millions by identifying fraudulent entities, hidden litigation, and financial instability before contracts were signed.
              </p>
            </div>
            <Card className="border-[#0E74FF]/20 bg-white dark:bg-card">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="text-5xl text-[#0E74FF] leading-none">"</div>
                  <div>
                    <p className="text-lg italic mb-4">
                      ScamNemesis uncovered critical financial irregularities in a potential acquisition target that our traditional due diligence missed entirely. Their investigation revealed pending litigation and undisclosed UBO connections that would have exposed us to significant legal risk. Worth every penny.
                    </p>
                    <p className="font-semibold">— Managing Director, Private Equity Firm</p>
                    <p className="text-sm text-muted-foreground">$50M+ Transaction Protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 7: Why Choose ScamNemesis */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Why Choose ScamNemesis?</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Four differentiators that set our investigations apart from conventional due diligence providers.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {whyChoose.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} className="border-[#0E74FF]/20">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#0E74FF]/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-[#0E74FF]" />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Protect Your Business Today
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Fixed-price model with no hidden fees. Verify before you engage. Order your comprehensive due diligence investigation now.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact-us">
                Order Service Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
