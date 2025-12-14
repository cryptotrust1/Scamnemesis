'use client';

import Link from 'next/link';
import Image from 'next/image';
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

const services = [
  {
    number: '1',
    title: 'Intelligence Analysis and Fraud Mapping',
    description: 'Collecting transaction data, crypto addresses, IP traces, and all available digital footprints to map the fraud network.',
    icon: Search,
    image: '/images/pages/money-recovery.jpg',
  },
  {
    number: '2',
    title: 'Forensic Tracking and Evidence Collection',
    description: 'Using blockchain analysis and OSINT tools to trace funds and gather court-admissible evidence.',
    icon: Target,
    image: '/images/pages/forensic-tracking.jpg',
  },
  {
    number: '3',
    title: 'Legal Assessment and Recommendations',
    description: 'Lawyer-prepared case analysis with jurisdiction determination and recovery strategy recommendations.',
    icon: Scale,
    image: '/images/pages/legal-assessment.jpg',
  },
  {
    number: '4',
    title: 'Cooperation with Authorities and Support',
    description: 'Providing comprehensive evidence materials for criminal proceedings and coordinating with law enforcement.',
    icon: Users,
    image: '/images/pages/investigation-team.jpg',
  },
];

const processSteps = [
  {
    step: '1',
    title: 'Report the Scam',
    description: 'Fill out our detailed intake form with all information about the fraud incident, including transaction details and communication records.',
  },
  {
    step: '2',
    title: 'Order the Service',
    description: 'Complete the €600 payment to start the investigation. Our team reviews your case and assigns a dedicated investigator.',
  },
  {
    step: '3',
    title: 'Investigation Begins',
    description: 'Your specialist contacts you for additional details and begins comprehensive forensic tracking, evidence collection, and legal assessment.',
  },
];

export default function MoneyRecoveryPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-5 text-[#0E74FF]" />
            <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-5">
              What to do if you have been scammed? Get quick and effective help
            </h1>
            <p className="text-base text-[#64748b] md:text-lg mb-6 max-w-3xl mx-auto leading-relaxed">
              Professional fraud investigation and fund recovery for crypto scams and investment fraud. Our team combines digital forensics, OSINT, and legal coordination to help you recover your money.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/report/new">
                  Report a Scam
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-[#f8fafc]" asChild>
                <Link href="/contact-us">
                  Order Service
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

      {/* Services Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Our Services</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Comprehensive fraud investigation combining digital forensics, blockchain analysis, and legal expertise
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.number} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold shadow-lg">
                      {service.number}
                    </div>
                  </div>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-[#0E74FF] mb-2" />
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.description}</p>
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
          <h2 className="text-3xl font-bold text-center mb-4">3-Step Process to Access the Service</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get started with our professional fraud investigation service in three simple steps
          </p>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {processSteps.map((item) => (
              <Card key={item.step} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-12">
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/report/new">
                Report a Scam
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact-us">
                Order Service
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">What Makes Us Different</CardTitle>
                <CardDescription className="text-base">
                  No empty promises - just honest, professional investigation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-[#0E74FF]">
                  <h3 className="font-semibold text-lg mb-3 text-center">Transparent Pricing</h3>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Our Price</div>
                      <div className="text-4xl font-bold text-[#0E74FF]">€600</div>
                    </div>
                    <div className="text-2xl text-muted-foreground">vs</div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Typical Services</div>
                      <div className="text-3xl font-bold text-red-500 line-through">$3,000-$10,000</div>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Unlike typical &quot;money recovery&quot; services that only file reports and send emails without deep analysis:
                </p>
                <ul className="grid md:grid-cols-2 gap-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Real forensic investigation, not just paperwork</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Honest about recovery likelihood</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Court-ready evidence packages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Blockchain analysis and OSINT tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-5 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl">
              Ready to start your recovery?
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              With us, you won&apos;t find empty promises — services that guarantee 100% refunds are actually scams. We offer honest, professional investigation.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/report/new">
                  Report a Scam
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-white" asChild>
                <Link href="/contact-us">
                  Order Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
