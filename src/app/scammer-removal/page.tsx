'use client';

import Link from 'next/link';
import {
  Shield,
  UserX,
  FileText,
  Clock,
  AlertTriangle,
  Heart,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const requirements = [
  'A valid case number from our database',
  'Detailed description of circumstances',
  'Official identity documents (ID/passport)',
  'Justification for the deletion request',
];

const limitations = [
  'Each person receives only one deletion opportunity',
  'Future criminal activity permanently disqualifies further deletions',
  'Assessment period takes 14-30 days',
  'All requests undergo individual evaluation based on case severity',
];

const reintegrationPrograms = [
  {
    title: 'Financial Support',
    description: 'Assistance for released individuals during the transition period',
    icon: Heart,
  },
  {
    title: 'Family Assistance',
    description: 'Support services for families of those seeking a fresh start',
    icon: Users,
  },
  {
    title: 'Education & Retraining',
    description: 'Opportunities for skill development and career change',
    icon: BookOpen,
  },
];

export default function ScammerRemovalPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <UserX className="h-16 w-16 mx-auto mb-6 text-amber-600" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Database Removal Request
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              A second chance. Help for a new beginning in life. We offer individuals with criminal pasts an opportunity to request deletion from our scammer database and receive support for life reintegration.
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Submit Removal Request
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Requirements for Deletion</h2>
            <p className="text-center text-muted-foreground mb-12">
              To submit a formal request, you must provide the following:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {requirements.map((req) => (
                <div key={req} className="flex items-center gap-3 p-4 bg-white dark:bg-card rounded-lg border">
                  <FileText className="h-5 w-5 text-[#0E74FF] flex-shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="w-full py-16 bg-amber-50/50 dark:bg-amber-950/10">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  Important Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Guide Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <CardTitle className="text-2xl">Free Guide: The Path Out of Criminality</CardTitle>
                <CardDescription>
                  Practical guidance for those seeking to leave criminal environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Practical steps for leaving criminal environments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Organizational contacts for assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Employment advice for those with records</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Legal reintegration guidance</span>
                  </li>
                </ul>
                <div className="text-center">
                  <Button className="bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/contact-us">
                      Request Free Guide
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reintegration Programs Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Reintegration Support Programs</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We&apos;re developing programs to help individuals successfully reintegrate into society.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {reintegrationPrograms.map((program) => {
              const Icon = program.icon;
              return (
                <Card key={program.title}>
                  <CardHeader className="text-center">
                    <Icon className="h-10 w-10 mx-auto mb-2 text-[#0E74FF]" />
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">{program.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Submit your request through our official form or contact us directly at{' '}
              <a href="mailto:info@scamnemesis.com" className="text-[#0E74FF] hover:underline">
                info@scamnemesis.com
              </a>
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Contact Us
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
              Everyone Deserves a Second Chance
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              We believe in redemption and rehabilitation. Support our mission by donating to help those seeking a fresh start.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/support-us">
                Support Our Mission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
