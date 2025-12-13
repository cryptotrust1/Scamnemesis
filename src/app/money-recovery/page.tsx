'use client';

import Link from 'next/link';
import {
  Shield,
  Search,
  Scale,
  Users,
  ArrowRight,
  CheckCircle,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const processSteps = [
  {
    number: '1',
    title: 'Intelligence Analysis & Fraud Mapping',
    description: 'Collecting transaction data, crypto addresses, IP traces, and all available digital footprints to map the fraud network.',
    icon: Search,
  },
  {
    number: '2',
    title: 'Forensic Tracking & Evidence Collection',
    description: 'Using blockchain analysis and OSINT tools to trace funds and gather court-admissible evidence.',
    icon: Target,
  },
  {
    number: '3',
    title: 'Legal Assessment & Recommendations',
    description: 'Lawyer-prepared case analysis with jurisdiction determination and recovery strategy recommendations.',
    icon: Scale,
  },
  {
    number: '4',
    title: 'Cooperation with Authorities',
    description: 'Providing comprehensive evidence materials for criminal proceedings and coordinating with law enforcement.',
    icon: Users,
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Fill out detailed intake form',
    description: 'Provide all information about the fraud incident, including transaction details and communication records.',
  },
  {
    step: '2',
    title: 'Contact via form, provide case details, complete €600 payment',
    description: 'Our team reviews your case and begins the investigation once payment is confirmed.',
  },
  {
    step: '3',
    title: 'Receive questions from specialist; investigation begins',
    description: 'A dedicated investigator contacts you for additional details and starts tracing the funds.',
  },
];

export default function MoneyRecoveryPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-[#0E74FF]" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Money Recovery Services
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              Professional fraud investigation and fund recovery for crypto scams and investment fraud. Our team combines digital forensics, OSINT, and legal coordination to help you recover your money.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/contact-us">
                  Order Refund Recovery Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-[#0E74FF]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Investigation Package</CardTitle>
                <CardDescription>Comprehensive fraud analysis and recovery assistance</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#0E74FF]">€600</span>
                  <span className="text-muted-foreground ml-2">one-time fee</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  Includes 5 hours of investigator work, blockchain analysis, OSINT research, and a comprehensive case report.
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Full transaction tracing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Blockchain analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>OSINT investigation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Legal assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Court-ready evidence package</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                  <Link href="/report/new">Start Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold mb-4">
                      {step.number}
                    </div>
                    <Icon className="h-8 w-8 text-[#0E74FF] mb-2" />
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How to Get Started</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle>What Makes Us Different</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Unlike typical &quot;money recovery&quot; services that only file reports and send emails without deep analysis:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>We provide real forensic investigation, not just paperwork</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Transparent pricing at €600 — not $3,000-$10,000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Honest about recovery likelihood — no false promises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Court-ready evidence packages</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to start your recovery?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              With us, you won&apos;t find empty promises — services that guarantee 100% refunds are actually scams. We offer honest, professional investigation.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/report/new">
                Start Money Recovery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
