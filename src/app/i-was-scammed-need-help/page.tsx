'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  CreditCard,
  Ban,
  Clock,
  CheckCircle2,
  FileWarning,
  Search,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function IWasScammedPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              Was Scammed: Get Your Money Back. Report Fraud Now.
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-6 max-w-3xl mx-auto">
              You&apos;ve just realized you&apos;ve been scammed. Your heart is racing, you feel sick to your stomach,
              and you&apos;re trying to figure out what just happened. This is normal. You are not alone, and you are not stupid.
            </p>
            <p className="text-base text-muted-foreground md:text-lg mb-8 max-w-3xl mx-auto">
              The first hours after realizing you&apos;ve been scammed are absolutely critical. Every minute counts.
              This guide will walk you through exactly what to do, step by step, to maximize your chances of recovery
              and help prevent others from becoming victims.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/report/new">
                  <FileText className="mr-2 h-5 w-5" />
                  Fill Out Report Form
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact-us">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us for Help
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              7 Critical Steps to Take Right Now
            </h2>

            {/* Step 1 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0E74FF] flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Immediately Block the Scammer&apos;s Access to Your Money
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Time is everything. Act now to stop further damage.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="h-6 w-6 text-[#0E74FF]" />
                        <h4 className="font-semibold text-lg">If You Sent Money via Card/Bank</h4>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Call your bank immediately and request to block the transaction</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>If the card is compromised, block it through your bank app or hotline</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Ask for immediate chargeback if payment was made with credit card</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Get written confirmation and reference numbers for everything</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="h-6 w-6 text-[#0E74FF]" />
                        <h4 className="font-semibold text-lg">If You Sent Cryptocurrency</h4>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Immediately contact the exchange you used (Coinbase, Binance, etc.)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Request to freeze the recipient&apos;s account if it&apos;s on the same exchange</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Save all transaction hashes and wallet addresses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Change passwords and enable 2FA on all crypto accounts</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src="/images/pages/i-was-scammed-step1.jpg"
                  alt="Block scammer access immediately"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Time-Critical Action
                    </p>
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      With bank transfers, you typically have 24-48 hours before the money is fully processed.
                      With crypto, once it&apos;s sent, it&apos;s much harder to recover, but exchanges can sometimes
                      freeze accounts if you act immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0E74FF] flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Create a Focused Environment to Solve the Problem
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    You need to be able to think clearly and act decisively.
                  </p>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Being scammed triggers a massive stress response. Your body is flooded with cortisol and adrenaline.
                    You might feel dizzy, nauseous, or have trouble thinking clearly. This is normal, but you need to
                    create conditions that help you function effectively.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[#0E74FF]" />
                        What to Do
                      </h4>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Tell your partner/family what happened and ask for their support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>If you have children, arrange childcare for a few hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>If at work, take emergency leave or work from home</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Turn off social media and non-essential notifications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Have water and snacks nearby - you might be doing this for hours</span>
                        </li>
                      </ul>
                    </div>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/images/pages/i-was-scammed-step2.jpg"
                        alt="Create focused environment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0E74FF] flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Officially Report the Incident
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Create an official paper trail with all relevant institutions.
                  </p>
                </div>
              </div>

              <Card className="mb-4">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#0E74FF]" />
                    Who to Contact
                  </h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-[#0E74FF] pl-4">
                      <h5 className="font-semibold mb-1">Your Bank/Financial Institution</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Call their fraud department directly. Don&apos;t just use in-app reporting - speak to a real person.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Request a written confirmation of your fraud report</li>
                        <li>• Get a reference number for your case</li>
                        <li>• Ask about their investigation timeline</li>
                        <li>• Request copies of all documentation they create</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-[#0E74FF] pl-4">
                      <h5 className="font-semibold mb-1">The Platform Where the Scam Occurred</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        If you were scammed on Facebook, Instagram, a dating app, or any other platform:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Report the scammer&apos;s account</li>
                        <li>• Screenshot everything before they delete it</li>
                        <li>• Request the platform&apos;s fraud team investigate</li>
                        <li>• Some platforms have victim compensation programs</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-[#0E74FF] pl-4">
                      <h5 className="font-semibold mb-1">Payment Processor</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        If you used PayPal, Stripe, or another payment service:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• File a dispute immediately through their platform</li>
                        <li>• Provide all evidence you have</li>
                        <li>• Follow up daily on the dispute status</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <FileWarning className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Documentation is Critical
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      For every phone call: write down the date, time, person you spoke to, what was said, and any
                      reference numbers. For every email: save it to a dedicated folder. You&apos;ll need this documentation
                      for police reports and potential legal action.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0E74FF] flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Start Collecting Evidence and Fill Out Our Form
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    The more evidence you gather, the better your chances of recovery.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-[#0E74FF]" />
                        What Evidence to Collect
                      </h4>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Screenshots:</strong> Every conversation, profile, website, advertisement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Transaction records:</strong> Bank statements, crypto transaction hashes, receipts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Contact information:</strong> Phone numbers, emails, usernames, wallet addresses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Websites:</strong> URLs, domain registration info (use WHOIS lookup)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Timeline:</strong> When you first made contact, when you sent money, when you realized it was a scam</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src="/images/pages/i-was-scammed-step4.jpg"
                    alt="Collect evidence and documentation"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <Card className="bg-[#0E74FF] text-white">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-xl font-bold mb-3">Our Comprehensive Reporting Form</h4>
                      <p className="mb-4 text-white/90">
                        We&apos;ve created a detailed form that guides you through documenting every aspect of your case.
                        It asks all the right questions that police and fraud investigators will need answers to.
                      </p>
                      <p className="mb-6 text-white/90">
                        Once completed, it automatically generates a professional PDF report that you can:
                      </p>
                      <ul className="space-y-2 mb-6 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>Submit to police as your official statement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>Send to your bank as evidence for chargebacks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>Use for insurance claims if applicable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>Share with us if you want our help investigating</span>
                        </li>
                      </ul>
                      <Button size="lg" variant="secondary" asChild>
                        <Link href="/report/new">
                          Fill Out the Form Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 5 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0E74FF] flex items-center justify-center text-white font-bold text-xl">
                  5
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Report the Fraud to the Police and Obtain Official Documents
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    A police report is essential for many recovery processes.
                  </p>
                </div>
              </div>

              <Card className="mb-4">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#0E74FF]" />
                    Filing a Police Report
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Many people skip this step because they think &quot;the police won&apos;t do anything.&quot;
                    While it&apos;s true that most online scams don&apos;t result in arrests, having an official
                    police report is crucial for:
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Insurance claims (if your insurance covers fraud)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Bank chargebacks and disputes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Legal action if the scammer is identified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tax deductions (in some jurisdictions, fraud losses may be deductible)</span>
                    </li>
                  </ul>

                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-3">What to Bring to the Police</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                        <span>The PDF report generated from our form (or your own documentation)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                        <span>All screenshots and evidence organized chronologically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                        <span>Bank statements showing the fraudulent transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                        <span>Written statement of what happened (timeline)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Get Official Copies
                    </p>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      Make sure you get an official copy of the police report with a case number. Some police
                      departments provide this immediately; others mail it within a few days. You&apos;ll need this
                      document for banks, payment processors, and potentially for legal proceedings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0E74FF] flex items-center justify-center text-white font-bold text-xl">
                  6
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Continue Targeted Actions and Evidence Collection
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    The work doesn&apos;t stop after the initial reporting.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#0E74FF]" />
                      Monitor Scammer Activity
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Scammers often continue operating. Track their activity to help build a case:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Check if their website/profile is still active</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Look for other victims (search their number/email online)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Screenshot any new information you find</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Report to scam databases and warning sites</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Search className="h-5 w-5 text-[#0E74FF]" />
                      Consider Professional Help
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      For complex cases or large amounts, professional investigation may be worthwhile:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Blockchain analysis (for crypto scams)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Digital forensics investigation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Legal consultation for civil action</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Our €600 investigation service (transparent, no false promises)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 7 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl">
                  7
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    The Truth About &quot;Money Recovery&quot; Services
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Be extremely careful - many are scams targeting fraud victims.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 h-full">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-900 dark:text-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Red Flags to Watch For
                      </h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-900 dark:text-red-100">
                            <strong>Upfront fees of $3,000-$10,000+</strong> - Legitimate services don&apos;t charge thousands upfront
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-900 dark:text-red-100">
                            <strong>Guaranteed recovery</strong> - No one can guarantee getting your money back
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-900 dark:text-red-100">
                            <strong>Pressure tactics</strong> - &quot;Act now or lose your chance&quot; is a scam technique
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-900 dark:text-red-100">
                            <strong>Fake testimonials</strong> - Stock photos and fabricated success stories
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-900 dark:text-red-100">
                            <strong>Vague methodology</strong> - They can&apos;t explain exactly how they&apos;ll help
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src="/images/pages/money-recovery.jpg"
                    alt="Beware of money recovery scams"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <Card className="border-2 border-[#0E74FF]">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-[#0E74FF]">
                    <DollarSign className="h-5 w-5" />
                    What We Offer Instead
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    We don&apos;t promise miracles. We offer transparent, professional investigation services for €600 that include:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Blockchain analysis for crypto scams</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Digital forensics and evidence preservation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Identifying scammer infrastructure</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Professional report for legal proceedings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Assistance with reporting to authorities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>No false promises - just real investigation work</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              You&apos;re Not Alone in This
            </h2>
            <p className="text-white/90 md:text-xl">
              Thousands of people are scammed every day. It doesn&apos;t mean you&apos;re stupid - it means you encountered
              a skilled criminal. The best thing you can do now is take action, document everything, and help prevent
              others from becoming victims.
            </p>
            <p className="text-white/90 md:text-lg">
              Start by filling out our comprehensive reporting form. It&apos;s free, it will help you organize your thoughts
              and evidence, and it generates a professional report you can use with police and banks.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/report/new">
                  <FileText className="mr-2 h-5 w-5" />
                  Fill Out Report Form
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                <Link href="/contact-us">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us for Help
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
