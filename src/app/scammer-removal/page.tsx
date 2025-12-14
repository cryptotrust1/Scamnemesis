'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  UserX,
  FileText,
  AlertTriangle,
  Heart,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Download,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const requirements = [
  'A valid case number from our database',
  'Detailed description of circumstances',
  'Official identity documents (ID/passport)',
  'Justification for the deletion request',
];

const termsAndConditions = [
  'Each person receives only one deletion opportunity',
  'Future criminal activity permanently disqualifies further deletions',
  'Assessment period takes 14-30 days',
  'All requests undergo individual evaluation based on case severity',
  'Deletion does not guarantee removal from other databases or legal records',
  'Applicants must demonstrate genuine commitment to rehabilitation',
];

const visionInitiatives = [
  {
    title: 'Financial Support',
    description: 'Assistance for released individuals during the transition period to help cover basic needs and prevent return to criminal activity',
    icon: Heart,
  },
  {
    title: 'Family Assistance',
    description: 'Support services for families of those seeking a fresh start, including counseling and resources for rebuilding relationships',
    icon: Users,
  },
  {
    title: 'Education & Retraining',
    description: 'Opportunities for skill development and career change through partnerships with educational institutions and employers',
    icon: BookOpen,
  },
];

export default function ScammerRemovalPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <UserX className="h-16 w-16 mx-auto mb-6 text-[#0E74FF]" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 leading-tight">
              Request for Database Deletion - A Second Chance: Help for a New Beginning in Life
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8 max-w-3xl mx-auto">
              We believe in privacy and second chances. Our platform offers individuals with criminal pasts an opportunity to request deletion from our scammer database and receive support for life reintegration. Everyone has the right to rebuild their life and start fresh.
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

      {/* Featured Quote Section */}
      <section className="w-full py-16 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-semibold italic mb-4">
              &ldquo;Everyone deserves a second chance to prove they can change and become a better person.&rdquo;
            </blockquote>
            <p className="text-white/80 text-lg">
              We stand by the belief that past mistakes should not define your future.
            </p>
          </div>
        </div>
      </section>

      {/* Image Section 1 */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/pages/scammer-removal-1.jpg"
                alt="A new beginning - person looking towards the future"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Terms and Conditions</h2>
            <p className="text-center text-muted-foreground mb-12">
              Please review these requirements carefully before submitting your request:
            </p>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-[#0E74FF]" />
                  Required Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  Important Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {termsAndConditions.map((condition) => (
                    <li key={condition} className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{condition}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Assistance Section with PDF Guide */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">We&apos;re Here to Help</h2>
            <p className="text-center text-muted-foreground mb-12">
              Download our comprehensive guide to help you navigate the path to rehabilitation
            </p>

            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <CardTitle className="text-2xl">Free PDF Guide: The Path Out of Criminality</CardTitle>
                <CardDescription className="text-base">
                  Practical guidance for those seeking to leave criminal environments and build a new life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Step-by-step guide for leaving criminal environments safely</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Contact information for support organizations worldwide</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Employment strategies for individuals with criminal records</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Legal rights and reintegration guidance by country</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Resources for mental health and addiction recovery</span>
                  </li>
                </ul>
                <div className="text-center">
                  <Button className="bg-green-600 hover:bg-green-700" size="lg" asChild>
                    <Link href="/contact-us">
                      <Download className="mr-2 h-5 w-5" />
                      Download Free Guide (PDF)
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Image Section 2 */}
      <section className="w-full py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/pages/scammer-removal-2.jpg"
                alt="Breaking free from the past"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Break the Cycle of Crime Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">Break the Cycle of Crime</h2>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-muted-foreground text-center mb-8">
                Breaking free from criminal activity is one of the most challenging journeys a person can undertake. It requires courage, determination, and support. We understand that many individuals trapped in criminal environments want to change but don&apos;t know where to start.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-[#0E74FF]" />
                      Why People Stay Trapped
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Financial dependency on criminal income</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Fear of retaliation from criminal networks</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Lack of legitimate employment opportunities</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Social stigma and discrimination</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Absence of support systems</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-6 w-6 text-[#0E74FF]" />
                      How We Can Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Confidential guidance and counseling</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Connections to rehabilitation programs</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Job training and placement assistance</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Legal support and advocacy</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#0E74FF]">•</span>
                        <span>Ongoing mentorship and community</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-center text-base font-medium mb-2">
                  It&apos;s never too late to change your path. The first step is reaching out.
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Contact us today to begin your journey toward a crime-free life. All inquiries are treated with complete confidentiality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 3 */}
      <section className="w-full py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/pages/scammer-removal-3.jpg"
                alt="Building a better future together"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision of Help Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Our Vision of Help</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We&apos;re developing comprehensive programs to help individuals successfully reintegrate into society and build meaningful, crime-free lives. Here are our three planned initiatives:
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {visionInitiatives.map((initiative) => {
              const Icon = initiative.icon;
              return (
                <Card key={initiative.title} className="border-[#0E74FF]/20">
                  <CardHeader className="text-center">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
                    <CardTitle className="text-xl">{initiative.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {initiative.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="w-full py-16 bg-gradient-to-b from-[#0E74FF]/5 to-white dark:from-[#0E74FF]/10 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-3xl font-bold mb-4">Support Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your donations help us provide resources, guidance, and support to individuals seeking to leave criminal lifestyles behind. Every contribution makes a real difference in someone&apos;s journey to redemption.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 w-full sm:w-auto" asChild>
                <Link href="/support-us">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Donate with Crypto
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-[#0E74FF] text-[#0E74FF] hover:bg-[#0E74FF]/10 w-full sm:w-auto" asChild>
                <Link href="/support-us">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Donate with Card
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              All donations are used to fund our rehabilitation programs and provide direct assistance to those in need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your New Journey?</h2>
            <p className="text-muted-foreground mb-6">
              Submit your removal request through our official form or contact us directly at{' '}
              <a href="mailto:info@scamnemesis.com" className="text-[#0E74FF] hover:underline">
                info@scamnemesis.com
              </a>
              . We&apos;re here to help you every step of the way.
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Contact Us Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl max-w-3xl">
              Everyone Deserves a Second Chance
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              We believe in redemption and rehabilitation. Your past doesn&apos;t have to define your future. Take the first step today toward a better tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact-us">
                  Submit Removal Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/support-us">
                  Support Our Mission
                  <Heart className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
