'use client';

import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const warningSignsRisk = [
  { icon: Clock, title: 'Pressure to act quickly or maintain secrecy' },
  { icon: CreditCard, title: 'Requests for unconventional payment methods' },
  { icon: AlertTriangle, title: 'Unrealistic promises or guarantees' },
  { icon: FileText, title: 'Missing regulatory verification or credentials' },
  { icon: Mail, title: 'Communication red flags (grammar errors, suspicious domains)' },
  { icon: Phone, title: 'Insistence on specific communication channels' },
  { icon: Lock, title: 'Requests for sensitive information' },
];

const scamTypes = [
  { name: 'Investment fraud', description: 'Fake investment opportunities promising high returns' },
  { name: 'Romance scams', description: 'Building fake relationships to extract money' },
  { name: 'Phishing attacks', description: 'Fake emails/websites to steal credentials' },
  { name: 'E-commerce fraud', description: 'Fake online stores or non-delivery scams' },
  { name: 'Technical support fraud', description: 'Fake tech support calls claiming problems' },
  { name: 'Employment scams', description: 'Fake job offers requiring upfront payments' },
  { name: 'Rental fraud', description: 'Fake property listings requiring deposits' },
  { name: 'Lottery/prize scams', description: 'Fake winnings requiring fees to claim' },
  { name: 'Charity fraud', description: 'Fake charities exploiting disasters/emotions' },
  { name: 'Government impersonation', description: 'Criminals posing as government officials' },
  { name: 'Healthcare fraud', description: 'Fake treatments or insurance schemes' },
  { name: 'Home service scams', description: 'Fake contractors demanding advance payment' },
];

const psychologyTactics = [
  { title: 'Authority impersonation', description: 'Pretending to be officials, banks, or experts' },
  { title: 'Artificial time pressure', description: 'Creating urgency to prevent careful thought' },
  { title: 'False social proof', description: 'Fake testimonials and reviews' },
  { title: 'Emotional manipulation', description: 'Exploiting fear, greed, or loneliness' },
  { title: 'Trust-building deception', description: 'Months of relationship building before the ask' },
  { title: 'Information asymmetry', description: 'Using technical jargon to confuse victims' },
];

const immediateActions = [
  { number: '1', title: 'Stop all communication and transfers immediately' },
  { number: '2', title: 'Contact your financial institution within 24 hours' },
  { number: '3', title: 'Secure all accounts with new passwords' },
  { number: '4', title: 'Document everything comprehensively' },
  { number: '5', title: 'File an official report with authorities' },
];

export default function ScamPreventionPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-green-600" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Scam Prevention Guide
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              Learn how to identify threats, prevent financial losses, and respond effectively to fraud attempts. Knowledge is your best defense.
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/search">
                Check Someone Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Warning Signs Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">60-Second Risk Assessment</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            If you encounter any of these warning signs, proceed with extreme caution or walk away completely.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {warningSignsRisk.map((sign) => {
              const Icon = sign.icon;
              return (
                <Card key={sign.title} className="border-red-100">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-2 rounded-full bg-red-100">
                      <Icon className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">{sign.title}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12 Scam Types Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">12 Common Scam Types</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Knowing the most common fraud schemes helps you recognize them before it&apos;s too late.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {scamTypes.map((type) => (
              <Card key={type.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Psychology Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Psychology of Victimization</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Understanding how scammers manipulate helps you resist their tactics.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {psychologyTactics.map((tactic) => (
              <Card key={tactic.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{tactic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tactic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate Action Section */}
      <section className="w-full py-16 bg-red-50 dark:bg-red-950/20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Immediate Action Protocol</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            If you&apos;ve been scammed, take these steps within 24 hours to maximize recovery chances.
          </p>
          <div className="max-w-2xl mx-auto space-y-4">
            {immediateActions.map((action) => (
              <div key={action.number} className="flex items-center gap-4 p-4 bg-white dark:bg-card rounded-lg border">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                  {action.number}
                </div>
                <span className="font-medium">{action.title}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/report/new">
                File a Report Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Stay Protected
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Use our free Scam Checker before engaging with anyone online. A few seconds of verification can save you thousands.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/search">
                  Use Scam Checker
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0E74FF]" asChild>
                <Link href="/training-courses">
                  Free Training
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
