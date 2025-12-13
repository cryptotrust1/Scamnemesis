'use client';

import Link from 'next/link';
import {
  Mail,
  FileText,
  Shield,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactUsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-6 text-[#0E74FF]" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              You can contact us by email. But if you want to report a scam, please use our reporting form — without it, we won&apos;t be able to help you effectively.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Email Contact */}
            <Card className="border-2 border-[#0E74FF]">
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
                <CardTitle className="text-xl">Email Us</CardTitle>
                <CardDescription>
                  For general inquiries, partnerships, and business questions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a
                  href="mailto:info@scamnemesis.com"
                  className="text-2xl font-medium text-[#0E74FF] hover:underline"
                >
                  info@scamnemesis.com
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  We typically respond within 24-48 hours
                </p>
              </CardContent>
            </Card>

            {/* Report Scam */}
            <Card className="border-2 border-red-500">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <CardTitle className="text-xl">Report a Scam</CardTitle>
                <CardDescription>
                  Fill out our comprehensive form for the best assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" className="bg-red-500 hover:bg-red-600" asChild>
                  <Link href="/report/new">
                    Report Scam
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Our form helps gather all necessary information
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">What We Help With</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <Shield className="h-8 w-8 text-[#0E74FF]" />
                  <div>
                    <p className="font-medium">Crypto Scams</p>
                    <p className="text-sm text-muted-foreground">Investment fraud and fake exchanges</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <Shield className="h-8 w-8 text-[#0E74FF]" />
                  <div>
                    <p className="font-medium">Investment Fraud</p>
                    <p className="text-sm text-muted-foreground">Ponzi schemes and fake opportunities</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <Shield className="h-8 w-8 text-[#0E74FF]" />
                  <div>
                    <p className="font-medium">Scammer Investigations</p>
                    <p className="text-sm text-muted-foreground">OSINT and blockchain analysis</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <Shield className="h-8 w-8 text-[#0E74FF]" />
                  <div>
                    <p className="font-medium">Money Recovery</p>
                    <p className="text-sm text-muted-foreground">Professional investigation services</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="text-muted-foreground mb-8">
              We are a team of lawyers, forensic analysts, and ethical hackers dedicated to helping victims of crypto scams and investment frauds. Our expertise spans blockchain analysis, OSINT, and legal coordination.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Been Scammed?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Don&apos;t wait. The sooner you act, the better your chances of recovery. Use our scam checker or file a report now.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/search">
                  Use Scam Checker
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#0E74FF]" asChild>
                <Link href="/report/new">
                  File a Report
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
