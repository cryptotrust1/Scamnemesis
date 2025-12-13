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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

const useCases = [
  'Strategic partnerships and joint ventures',
  'Supplier and vendor onboarding',
  'Pre-investment and M&A screening',
  'Know Your Business (KYB) compliance',
  'Franchise and licensing agreements',
  'High-value contract negotiations',
];

const deliverables = [
  'Corporate identity verification',
  'Ownership structure analysis including UBOs',
  'Financial health assessment',
  'Reputation and media evaluation',
  'Digital asset and infrastructure audit',
  'Risk assessment and recommendations',
];

const certifications = ['CFE®', 'CAMS®', 'CISA®', 'CISM®', 'OSCP®'];

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
              Standard background checks are no longer sufficient. Our comprehensive intelligence-driven risk analysis verifies business partners, suppliers, and investments before you engage.
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Request Verification
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Four-Pillar Investigation Process</h2>
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

      {/* Deliverables Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Comprehensive PDF Report</h2>
            <p className="text-center text-muted-foreground mb-12">
              Delivered within 30 days, our detailed report covers all aspects of the investigation.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {deliverables.map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 bg-white dark:bg-card rounded-lg border">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">When You Need Due Diligence</h2>
            <p className="text-center text-muted-foreground mb-12">
              Protect your business with proper vetting in these critical situations.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map((useCase) => (
                <Card key={useCase}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-[#0E74FF]" />
                      <span className="text-sm font-medium">{useCase}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Process</h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <FileText className="h-8 w-8 mx-auto mb-3 text-[#0E74FF]" />
              <h3 className="font-semibold mb-2">Submit Form</h3>
              <p className="text-sm text-muted-foreground">Complete our online intake form with target entity details</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <CreditCard className="h-8 w-8 mx-auto mb-3 text-[#0E74FF]" />
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">Pay via cards, bank transfer, or cryptocurrency</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <FileText className="h-8 w-8 mx-auto mb-3 text-[#0E74FF]" />
              <h3 className="font-semibold mb-2">Receive Report</h3>
              <p className="text-sm text-muted-foreground">Get comprehensive PDF report via email within 30 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Credentials Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-3xl font-bold mb-4">Expert Team</h2>
            <p className="text-muted-foreground mb-8">
              Our investigators hold certifications from leading institutions with backgrounds in military intelligence and Big 4 consulting.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {certifications.map((cert) => (
                <span key={cert} className="px-4 py-2 bg-[#0E74FF]/10 text-[#0E74FF] rounded-full font-medium">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Protect Your Business Today
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Fixed-price model with no hidden fees. Verify before you engage.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact-us">
                Request Due Diligence
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
