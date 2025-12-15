'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Users,
  Target,
  Heart,
  CheckCircle,
  Scale,
  Search,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-5 text-[#0E74FF]" />
            <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-4">
              About ScamNemesis
            </h1>
            <p className="text-base text-[#64748b] md:text-lg mb-6 leading-relaxed">
              We are a team of lawyers, forensic analysts, and ethical hackers dedicated to helping victims of crypto scams and investment frauds. Our mission is to protect people from fraud and help those who have been victimized.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section - Clean bordered style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Target className="h-8 w-8 mb-4 text-[#0E74FF]" />
                <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl mb-4">Our Mission</h2>
                <p className="text-[#64748b] mb-4 text-sm leading-relaxed">
                  To create a safer digital environment by providing accessible fraud prevention tools, professional investigation services, and support for victims of online scams.
                </p>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  We believe everyone deserves protection from fraud, regardless of their financial situation. That&apos;s why we offer free tools alongside our professional services.
                </p>
              </div>
              <div className="relative h-56 md:h-72 rounded-lg overflow-hidden border border-[#e8e8e8]">
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

      {/* Values Section - Clean bordered cards */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-xl font-semibold text-[#1e293b] text-center mb-10 sm:text-2xl">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border border-[#e8e8e8] shadow-none">
                  <CardHeader className="text-center pb-2">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-[#0E74FF]" />
                    <CardTitle className="text-base font-medium text-[#1e293b]">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[#64748b] text-center leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Credentials Section - Clean bordered */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc]">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Users className="h-8 w-8 mx-auto mb-4 text-[#0E74FF]" />
              <h2 className="text-xl font-semibold text-[#1e293b] mb-3 sm:text-2xl">Expert Team</h2>
              <p className="text-[#64748b] text-sm">
                Our team holds certifications from leading institutions with backgrounds in financial crime investigation, military intelligence, and Big 4 consulting.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {teamCredentials.map((credential) => (
                <div key={credential} className="flex items-center gap-2 p-3 bg-white border border-[#e8e8e8] rounded-lg">
                  <CheckCircle className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm text-[#1e293b]">{credential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section - Clean bordered cards */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-xl font-semibold text-[#1e293b] text-center mb-10 sm:text-2xl">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {services.map((service) => (
              <Card key={service.name} className="border border-[#e8e8e8] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#1e293b]">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#64748b] leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section - Clean minimal */}
      <section className="w-full py-12 border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <h2 className="text-lg font-semibold text-[#1e293b] text-center mb-8">Our Certifications</h2>
          <div className="flex flex-wrap justify-center gap-10 max-w-3xl mx-auto">
            <Image src="/images/cert-1.png" alt="Certification 1" width={80} height={80} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-2.png" alt="Certification 2" width={80} height={80} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-3.png" alt="Certification 3" width={80} height={80} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </div>
      </section>

      {/* CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-5 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl">
              Need Help?
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              Whether you want to check someone&apos;s legitimacy, report a scam, or need help recovering your money — we&apos;re here for you.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/search">
                  Use Scam Checker
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-white" asChild>
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
