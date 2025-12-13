'use client';

import Link from 'next/link';
import {
  Shield,
  Phone,
  FileText,
  AlertTriangle,
  Lock,
  Eye,
  Users,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    number: '1',
    title: 'Block Access Immediately',
    icon: Lock,
    description: 'If your card details were stolen, block the card immediately — through your bank\'s mobile app or by calling their hotline. Change passwords for any compromised accounts.',
  },
  {
    number: '2',
    title: 'Create a Focused Environment',
    icon: Eye,
    description: 'Minimize distractions and arrange childcare or leave work if needed to address the situation effectively. You need to focus completely on this.',
  },
  {
    number: '3',
    title: 'Official Reporting',
    icon: Phone,
    description: 'Contact banks or exchanges directly by phone/email and request written confirmation of reports. Document all communication with reference numbers.',
  },
  {
    number: '4',
    title: 'Collect Evidence',
    icon: FileText,
    description: 'Fill out our form as thoroughly as possible. It serves as a practical guide to help you capture all essential information and automatically generates a complete PDF report.',
  },
  {
    number: '5',
    title: 'Police Report',
    icon: Shield,
    description: 'Visit police with your documentation and request official confirmation and case records. Keep copies of everything you submit.',
  },
  {
    number: '6',
    title: 'Targeted Actions',
    icon: Users,
    description: 'Monitor scammer activity and consider professional assistance for complex cases. Join our community to connect with other victims.',
  },
  {
    number: '7',
    title: 'Money Recovery Services Reality Check',
    icon: AlertTriangle,
    description: 'Many recovery services are scams or highly unethical practices, charging $3,000-$10,000 with limited results. Be very careful about who you trust.',
    warning: true,
  },
];

export default function IWasScammedPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              I Was Scammed — What Now?
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              The first moments after realizing you&apos;ve been scammed are critical. Follow this step-by-step procedure to maximize your chances of recovery and help prevent others from becoming victims.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/report/new">
                  <FileText className="mr-2 h-5 w-5" />
                  Fill out the form
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact-us">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Step-by-Step Recovery Procedure</h2>
            <div className="space-y-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.number} className={step.warning ? 'border-red-200 bg-red-50/50' : ''}>
                    <CardContent className="flex gap-6 p-6">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${step.warning ? 'bg-red-500' : 'bg-[#0E74FF]'}`}>
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-5 w-5 ${step.warning ? 'text-red-500' : 'text-[#0E74FF]'}`} />
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="w-full py-16 bg-amber-50 dark:bg-amber-950/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-6 w-6" />
                  Important Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Be extremely cautious of &quot;recovery services&quot; that promise to get your money back. Many of these are:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Second-stage scams targeting fraud victims</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Charging $3,000-$10,000 upfront with no results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Using aggressive sales tactics and fake testimonials</span>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  Our service is transparent about what we can and cannot do. We charge €600 for a thorough investigation — not thousands of dollars for empty promises.
                </p>
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
              Ready to take action?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Fill out our comprehensive form to document your case. It will help you organize all the information and generate a professional report.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/report/new">
                Start Your Report
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
