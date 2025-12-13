'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Users,
  Target,
  Heart,
  ArrowRight,
  CheckCircle,
  Scale,
  Search,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const values = [
  {
    title: 'Transparency',
    description: 'We are honest about what we can and cannot do. No false promises, just professional investigation.',
    icon: Scale,
  },
  {
    title: 'Expertise',
    description: 'Our team includes certified fraud examiners, OSINT specialists, and legal professionals.',
    icon: Search,
  },
  {
    title: 'Accessibility',
    description: 'Justice and safety should not be reserved only for those who can afford them financially.',
    icon: Globe,
  },
  {
    title: 'Compassion',
    description: 'We understand the emotional impact of being scammed and treat every victim with respect.',
    icon: Heart,
  },
];

const teamCredentials = [
  'Certified Fraud Examiners (CFE®)',
  'Certified Anti-Money Laundering Specialists (CAMS®)',
  'Certified Information Systems Auditors (CISA®)',
  'Certified Information Security Managers (CISM®)',
  'Offensive Security Certified Professionals (OSCP®)',
  'Military Intelligence Background',
  'Big 4 Consulting Experience',
];

const services = [
  { name: 'Scam Checker', description: 'Free tool to verify identities and check for fraud indicators' },
  { name: 'Scam Reporting', description: 'Comprehensive form to document and report fraud incidents' },
  { name: 'Money Recovery', description: 'Professional investigation and fund recovery services' },
  { name: 'Due Diligence', description: 'Business partner vetting and corporate verification' },
  { name: 'Training', description: 'Cybersecurity and fraud prevention courses (coming soon)' },
  { name: 'Second Chance Program', description: 'Rehabilitation support for former offenders' },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-[#0E74FF]" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              About ScamNemesis
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              We are a team of lawyers, forensic analysts, and ethical hackers dedicated to helping victims of crypto scams and investment frauds. Our mission is to protect people from fraud and help those who have been victimized.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Target className="h-12 w-12 mb-4 text-[#0E74FF]" />
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  To create a safer digital environment by providing accessible fraud prevention tools, professional investigation services, and support for victims of online scams.
                </p>
                <p className="text-muted-foreground">
                  We believe everyone deserves protection from fraud, regardless of their financial situation. That&apos;s why we offer free tools alongside our professional services.
                </p>
              </div>
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src="/images/section-team.png"
                  alt="Our Team"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardHeader className="text-center">
                    <Icon className="h-10 w-10 mx-auto mb-2 text-[#0E74FF]" />
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Credentials Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
              <h2 className="text-3xl font-bold mb-4">Expert Team</h2>
              <p className="text-muted-foreground">
                Our team holds certifications from leading institutions with backgrounds in financial crime investigation, military intelligence, and Big 4 consulting.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {teamCredentials.map((credential) => (
                <div key={credential} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-[#0E74FF]" />
                  <span className="text-sm">{credential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Our Certifications</h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-3xl mx-auto">
            <div className="relative w-24 h-24">
              <Image
                src="/images/cert-1.png"
                alt="Certification 1"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-24 h-24">
              <Image
                src="/images/cert-2.png"
                alt="Certification 2"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-24 h-24">
              <Image
                src="/images/cert-3.png"
                alt="Certification 3"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Need Help?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Whether you want to check someone&apos;s legitimacy, report a scam, or need help recovering your money — we&apos;re here for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/search">
                  Use Scam Checker
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0E74FF]" asChild>
                <Link href="/contact-us">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
