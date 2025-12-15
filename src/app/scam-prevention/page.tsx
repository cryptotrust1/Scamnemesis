'use client';

import Link from 'next/link';
import Script from 'next/script';
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
  Users,
  TrendingUp,
  Heart,
  ShoppingCart,
  MonitorSmartphone,
  Briefcase,
  Home,
  Gift,
  HeartHandshake,
  Building2,
  Pill,
  Hammer,
  Camera,
  FolderOpen,
  FileCheck,
  DollarSign,
  LifeBuoy,
  AlertCircle,
  CheckCircle2,
  Ban,
  Zap,
  Eye,
  MessageSquare,
  Sparkles,
  Target,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tableOfContents = [
  { id: 'emergency-response', title: 'Emergency Response: File a ScamNemesis Report' },
  { id: 'risk-assessment', title: '60-Second Risk Assessment' },
  { id: 'understanding-scams', title: 'Understanding Scams: Definition and Mechanics' },
  { id: 'psychology', title: 'Psychology of Scam Victimization' },
  { id: 'scam-categories', title: '12 Most Prevalent Scam Categories' },
  { id: 'immediate-action', title: 'Immediate Action Protocol: First 24 Hours' },
  { id: 'evidence-collection', title: 'Evidence Collection and Documentation Standards' },
  { id: 'fund-recovery', title: 'Fund Recovery Procedures by Payment Method' },
  { id: 'support-resources', title: 'Support Resources and Reporting Channels' },
];

const warningSignsRisk = [
  { icon: Clock, title: 'Pressure to act quickly or maintain secrecy' },
  { icon: CreditCard, title: 'Requests for unconventional payment methods' },
  { icon: AlertTriangle, title: 'Unrealistic promises or guarantees' },
  { icon: FileText, title: 'Missing regulatory verification or credentials' },
  { icon: Mail, title: 'Communication red flags (grammar errors, suspicious domains)' },
  { icon: Phone, title: 'Insistence on specific communication channels' },
  { icon: Lock, title: 'Requests for sensitive information' },
  { icon: Ban, title: 'Resistance to independent verification or third-party involvement' },
];

const scamTypes = [
  {
    icon: TrendingUp,
    name: 'Investment Fraud',
    description: 'Fake investment opportunities promising guaranteed high returns with little to no risk.',
    tip: 'Verify all investments through official regulatory databases before committing funds.'
  },
  {
    icon: Heart,
    name: 'Romance Scams',
    description: 'Criminals build fake romantic relationships over time to extract money from victims.',
    tip: 'Never send money to someone you have not met in person, regardless of the story.'
  },
  {
    icon: Mail,
    name: 'Phishing Attacks',
    description: 'Fake emails, texts, or websites designed to steal login credentials and personal data.',
    tip: 'Always verify sender addresses and navigate directly to official websites, never via links.'
  },
  {
    icon: ShoppingCart,
    name: 'E-commerce Fraud',
    description: 'Fake online stores, non-delivery of goods, or counterfeit product sales.',
    tip: 'Research sellers, check reviews from multiple sources, and use secure payment methods.'
  },
  {
    icon: MonitorSmartphone,
    name: 'Technical Support Fraud',
    description: 'Scammers pose as tech support claiming your computer has problems requiring immediate fixes.',
    tip: 'Legitimate companies do not call unsolicited. Hang up and contact official support directly.'
  },
  {
    icon: Briefcase,
    name: 'Employment Scams',
    description: 'Fake job offers requiring upfront payment for training, equipment, or background checks.',
    tip: 'Real employers never ask you to pay for the opportunity to work for them.'
  },
  {
    icon: Home,
    name: 'Rental Fraud',
    description: 'Fake property listings with below-market rates requiring deposits before viewing.',
    tip: 'Always view properties in person and verify ownership before transferring any money.'
  },
  {
    icon: Gift,
    name: 'Lottery/Prize Scams',
    description: 'Notifications of fake winnings requiring fees or taxes to be paid before receiving the prize.',
    tip: 'Legitimate lotteries deduct fees from winnings. You cannot win contests you did not enter.'
  },
  {
    icon: HeartHandshake,
    name: 'Charity Fraud',
    description: 'Fake charitable organizations exploiting disasters, holidays, or emotional causes.',
    tip: 'Research charities through official databases and donate directly through verified websites.'
  },
  {
    icon: Building2,
    name: 'Government Impersonation',
    description: 'Criminals posing as IRS, Social Security, immigration, or law enforcement officials.',
    tip: 'Government agencies communicate via official mail, not threatening phone calls demanding immediate payment.'
  },
  {
    icon: Pill,
    name: 'Healthcare Fraud',
    description: 'Fake medical treatments, miracle cures, or fraudulent health insurance schemes.',
    tip: 'Consult licensed healthcare providers and verify insurance through official company channels.'
  },
  {
    icon: Hammer,
    name: 'Home Service Scams',
    description: 'Fake contractors demanding large advance payments then disappearing without completing work.',
    tip: 'Verify licenses, check references, and never pay the full amount upfront.'
  },
];

const psychologyTactics = [
  { icon: Building2, title: 'Authority Impersonation', description: 'Pretending to be officials, banks, or experts to exploit trust in legitimate institutions.' },
  { icon: Zap, title: 'Artificial Time Pressure', description: 'Creating false urgency to prevent careful thought and rational decision-making.' },
  { icon: Users, title: 'False Social Proof', description: 'Fabricating testimonials, reviews, and success stories to create illusion of legitimacy.' },
  { icon: Heart, title: 'Emotional Manipulation', description: 'Exploiting fear, greed, loneliness, or compassion to override logical thinking.' },
  { icon: MessageSquare, title: 'Trust-Building Deception', description: 'Investing weeks or months building relationships before making fraudulent requests.' },
  { icon: Brain, title: 'Information Asymmetry', description: 'Using technical jargon and complexity to confuse victims and discourage questions.' },
];

const immediateActions = [
  { number: '1', title: 'Stop all communication and transfers immediately', description: 'Cease contact with the suspected scammer and halt any ongoing transactions.' },
  { number: '2', title: 'Contact your financial institution within 24 hours', description: 'Report fraudulent transactions and request holds, reversals, or account freezes as needed.' },
  { number: '3', title: 'Secure all accounts with new passwords', description: 'Change passwords for all potentially compromised accounts using strong, unique credentials.' },
  { number: '4', title: 'Document everything comprehensively', description: 'Save all communications, receipts, screenshots, and transaction records before they disappear.' },
  { number: '5', title: 'File official reports with authorities', description: 'Report to local police, FBI IC3, FTC, and relevant regulatory bodies to create official record.' },
];

const evidenceTypes = [
  { icon: Mail, title: 'All Communications', items: ['Emails, texts, chat logs', 'Phone call records', 'Social media messages', 'Voicemails (record/save)'] },
  { icon: Camera, title: 'Visual Documentation', items: ['Screenshots of websites', 'Photos of documents received', 'Account statements', 'Profile screenshots'] },
  { icon: FileCheck, title: 'Transaction Records', items: ['Bank statements', 'Wire transfer receipts', 'Cryptocurrency transaction IDs', 'Gift card receipts and codes'] },
  { icon: FolderOpen, title: 'Identity Information', items: ['Names used by scammer', 'Phone numbers and email addresses', 'Website URLs', 'Social media profiles'] },
];

const paymentMethods = [
  {
    method: 'Credit/Debit Cards',
    timeline: 'Act within 60 days',
    steps: ['Contact card issuer immediately', 'Dispute charges as unauthorized', 'Request chargeback under Regulation Z', 'File police report if required']
  },
  {
    method: 'Bank Transfers/Wire',
    timeline: 'Act within 24 hours',
    steps: ['Contact sending and receiving banks', 'Request wire recall', 'File fraud claim with bank', 'Contact SWIFT if international transfer']
  },
  {
    method: 'Cryptocurrency',
    timeline: 'Act immediately',
    steps: ['Contact exchange/wallet provider', 'Report transaction IDs', 'File with FBI IC3 and FTC', 'Monitor blockchain for fund movement']
  },
  {
    method: 'Gift Cards',
    timeline: 'Very limited recovery',
    steps: ['Contact card issuer immediately', 'Provide card numbers and receipts', 'File police report', 'Report to FTC (recovery unlikely)']
  },
  {
    method: 'Cash/Money Orders',
    timeline: 'Extremely difficult',
    steps: ['Contact money transfer service', 'File police report immediately', 'Request investigation', 'Recovery highly unlikely']
  },
];

const reportingChannels = [
  { name: 'Federal Trade Commission (FTC)', url: 'ReportFraud.ftc.gov', description: 'Primary federal agency for fraud reporting' },
  { name: 'FBI Internet Crime Complaint Center (IC3)', url: 'ic3.gov', description: 'For cybercrimes and online fraud' },
  { name: 'Local Police Department', url: 'N/A', description: 'File official report for legal proceedings' },
  { name: 'State Attorney General', url: 'Varies by state', description: 'State-level consumer protection' },
  { name: 'AARP Fraud Watch Network', url: '877-908-3360', description: 'Support for older adults' },
  { name: 'Better Business Bureau Scam Tracker', url: 'bbb.org/scamtracker', description: 'Report and research scams' },
];

// JSON-LD Schemas for SEO
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Comprehensive Anti-Scam Guide: Prevention, Detection & Recovery',
  description: 'Your practical security guide to identifying threats, preventing financial losses, and responding effectively to fraud.',
  datePublished: '2025-01-01',
  dateModified: '2025-12-15',
  author: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'ScamNemesis',
    logo: {
      '@type': 'ImageObject',
      url: 'https://scamnemesis.com/images/logo.png',
      width: 600,
      height: 60,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://scamnemesis.com/scam-prevention',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'What to Do If You Have Been Scammed - 5-Step Immediate Action Protocol',
  description: 'Critical steps to take within 24 hours of discovering a scam to maximize recovery chances.',
  totalTime: 'PT2H',
  estimatedCost: {
    '@type': 'PriceSpecification',
    priceCurrency: 'USD',
    price: '0',
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Stop all communication and transfers immediately',
      text: 'Cease contact with the suspected scammer and halt any ongoing transactions.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Contact your financial institution within 24 hours',
      text: 'Report fraudulent transactions and request holds, reversals, or account freezes as needed.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Secure all accounts with new passwords',
      text: 'Change passwords for all potentially compromised accounts using strong, unique credentials.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Document everything comprehensively',
      text: 'Save all communications, receipts, screenshots, and transaction records before they disappear.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'File official reports with authorities',
      text: 'Report to local police, FBI IC3, FTC, and relevant regulatory bodies to create official record.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A scam is a fraudulent scheme designed to deceive individuals into parting with money, personal information, or assets through false promises, misrepresentation, or manipulation. Scams exploit human psychology, trust, and emotional vulnerabilities to bypass rational decision-making.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the warning signs of a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Key warning signs include: pressure to act quickly or maintain secrecy, requests for unconventional payment methods, unrealistic promises or guarantees, missing regulatory verification, communication red flags like grammar errors, insistence on specific communication channels, requests for sensitive information, and resistance to independent verification.',
      },
    },
    {
      '@type': 'Question',
      name: 'What should I do if I have been scammed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Take immediate action: 1) Stop all communication and transfers immediately, 2) Contact your financial institution within 24 hours, 3) Secure all accounts with new passwords, 4) Document everything comprehensively, 5) File official reports with authorities including local police, FBI IC3, and FTC.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I recover money lost to a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Recovery depends on the payment method used. Credit/debit cards have 60-day chargeback windows. Bank transfers require action within 24 hours. Cryptocurrency recovery is very limited. Gift cards and cash have extremely low recovery rates. Time is critical - act immediately and contact your financial institution.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I report a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Report scams to multiple authorities: Federal Trade Commission (ReportFraud.ftc.gov), FBI Internet Crime Complaint Center (ic3.gov), local police department, State Attorney General, AARP Fraud Watch Network (877-908-3360), and Better Business Bureau Scam Tracker (bbb.org/scamtracker).',
      },
    },
  ],
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '12 Most Prevalent Scam Categories',
  description: 'Common fraud schemes to recognize and avoid',
  numberOfItems: 12,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Investment Fraud' },
    { '@type': 'ListItem', position: 2, name: 'Romance Scams' },
    { '@type': 'ListItem', position: 3, name: 'Phishing Attacks' },
    { '@type': 'ListItem', position: 4, name: 'E-commerce Fraud' },
    { '@type': 'ListItem', position: 5, name: 'Technical Support Fraud' },
    { '@type': 'ListItem', position: 6, name: 'Employment Scams' },
    { '@type': 'ListItem', position: 7, name: 'Rental Fraud' },
    { '@type': 'ListItem', position: 8, name: 'Lottery/Prize Scams' },
    { '@type': 'ListItem', position: 9, name: 'Charity Fraud' },
    { '@type': 'ListItem', position: 10, name: 'Government Impersonation' },
    { '@type': 'ListItem', position: 11, name: 'Healthcare Fraud' },
    { '@type': 'ListItem', position: 12, name: 'Home Service Scams' },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/images/logo.png',
  description: 'Leading platform for scam prevention, fraud reporting, and victim support.',
  sameAs: [
    'https://twitter.com/scamnemesis',
    'https://facebook.com/scamnemesis',
    'https://linkedin.com/company/scamnemesis',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@scamnemesis.com',
    availableLanguage: ['English'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://scamnemesis.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Scam Prevention Guide',
      item: 'https://scamnemesis.com/scam-prevention',
    },
  ],
};

export default function ScamPreventionPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Premium Gradient Design */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0E74FF]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E74FF]/20 backdrop-blur-sm border border-[#0E74FF]/30 mb-8">
                <Shield className="h-4 w-4 text-[#0E74FF]" />
                <span className="text-sm font-semibold text-[#0E74FF]">Complete Security Resource</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                Comprehensive Anti-Scam Guide
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Your practical security guide to identifying threats, preventing financial losses, and responding effectively to fraud. Knowledge and preparation are your strongest defenses.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl md:text-3xl font-bold text-[#0E74FF]">9</div>
                  <div className="text-sm text-slate-400">Sections</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl md:text-3xl font-bold text-[#0E74FF]">12</div>
                  <div className="text-sm text-slate-400">Scam Types</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl md:text-3xl font-bold text-[#0E74FF]">8</div>
                  <div className="text-sm text-slate-400">Warning Signs</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl md:text-3xl font-bold text-[#0E74FF]">5</div>
                  <div className="text-sm text-slate-400">Action Steps</div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/search">
                  Check Someone Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Table of Contents - Premium Card Design */}
        <section className="w-full py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Table of Contents</h2>
                <p className="text-muted-foreground">Jump to any section of this guide</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
                <nav className="p-4 md:p-6 space-y-2">
                  {tableOfContents.map((item, index) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#0E74FF]/5 dark:hover:bg-[#0E74FF]/10 transition-all duration-200 group border border-transparent hover:border-[#0E74FF]/20"
                    >
                      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white text-sm flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                        {index + 1}
                      </span>
                      <span className="text-sm md:text-base font-medium text-foreground group-hover:text-[#0E74FF] transition-colors">
                        {item.title}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#0E74FF] opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Emergency Response Section - Striking Red Theme */}
        <section id="emergency-response" className="w-full py-16 md:py-20 bg-gradient-to-br from-red-50 via-red-50/50 to-orange-50/30 dark:from-red-950/30 dark:via-red-950/20 dark:to-orange-950/10">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-100">Emergency Response: File a ScamNemesis Report</h2>
                </div>
              </div>
              <p className="text-red-800 dark:text-red-200 mb-8 text-lg">
                If you suspect you are currently being scammed or have been victimized, take immediate action.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Stop All Communication Immediately', desc: 'Cease contact with the suspected scammer. Do not respond to calls, emails, or messages.', icon: Ban },
                  { title: 'Halt All Financial Transactions', desc: 'Stop any pending transfers, payments, or shipments immediately. Contact your bank or payment provider.', icon: CreditCard },
                  { title: 'File a ScamNemesis Report', desc: 'Document the incident in our system to warn others and create an official record.', icon: FileText, cta: true },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground mb-4">{item.desc}</p>
                        {item.cta && (
                          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30" asChild>
                            <Link href="/report/new">
                              File Report Now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. 60-Second Risk Assessment - Warning Cards */}
        <section id="risk-assessment" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                  <Eye className="h-4 w-4" />
                  Quick Assessment
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">60-Second Risk Assessment</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  If you encounter any of these 8 warning signs, proceed with extreme caution or walk away completely. Trust your instincts.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {warningSignsRisk.map((sign, index) => {
                  const Icon = sign.icon;
                  return (
                    <div
                      key={sign.title}
                      className="group p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200 dark:border-amber-800 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm md:text-base font-medium text-foreground">{sign.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Understanding Scams: Definition and Mechanics */}
        <section id="understanding-scams" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                  <Target className="h-4 w-4" />
                  Knowledge is Power
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Understanding Scams: Definition and Mechanics</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Understanding how scams work is the first step in protecting yourself and others.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-[#0E74FF]/20 hover:border-[#0E74FF]/40 transition-colors shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0E74FF]/10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-[#0E74FF]" />
                      </div>
                      What is a Scam?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      A scam is a fraudulent scheme designed to deceive individuals into parting with money, personal information, or assets through false promises, misrepresentation, or manipulation.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Scams exploit human psychology, trust, and emotional vulnerabilities to bypass rational decision-making.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#0E74FF]/20 hover:border-[#0E74FF]/40 transition-colors shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0E74FF]/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#0E74FF]" />
                      </div>
                      How Scams Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { step: 'Contact', desc: 'Initial outreach via phone, email, social media, or in person' },
                        { step: 'Hook', desc: 'Offer something desirable or create fear/urgency' },
                        { step: 'Build Trust', desc: 'Establish credibility through fake credentials or emotional connection' },
                        { step: 'The Ask', desc: 'Request money, information, or access' },
                        { step: 'Disappear', desc: 'Cut contact after obtaining what they want' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#0E74FF] text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">{item.step}:</strong> {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Psychology of Scam Victimization */}
        <section id="psychology" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                  <Brain className="h-4 w-4" />
                  Psychology
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Psychology of Scam Victimization</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Scammers use 6 primary psychological manipulation methods to exploit human behavior and bypass critical thinking.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {psychologyTactics.map((tactic, index) => (
                  <div
                    key={tactic.title}
                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/10 border border-purple-200 dark:border-purple-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-2 text-foreground">{tactic.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tactic.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. 12 Most Prevalent Scam Categories */}
        <section id="scam-categories" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Know Your Enemy
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">12 Most Prevalent Scam Categories</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Familiarize yourself with these common fraud schemes to recognize and avoid them.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {scamTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.name}
                      className="group h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-[#0E74FF]/30 overflow-hidden"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3 text-base">
                          <div className="w-10 h-10 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0E74FF]/20 transition-all duration-300">
                            <Icon className="h-5 w-5 text-[#0E74FF]" />
                          </div>
                          <span className="group-hover:text-[#0E74FF] transition-colors">{type.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                        <div className="pt-3 border-t border-dashed">
                          <p className="text-xs font-semibold text-[#0E74FF] mb-1 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Protection Tip:
                          </p>
                          <p className="text-xs text-muted-foreground">{type.tip}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Immediate Action Protocol: First 24 Hours */}
        <section id="immediate-action" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
                  <Zap className="h-4 w-4" />
                  Act Fast
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Immediate Action Protocol: First 24 Hours</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  If you&apos;ve been scammed, take these 5 critical steps within 24 hours to maximize recovery chances and prevent further damage.
                </p>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0E74FF] via-[#0E74FF] to-[#0E74FF]/30 rounded-full" />

                <div className="space-y-6">
                  {immediateActions.map((action) => (
                    <div key={action.number} className="relative flex items-start gap-6">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 hover:scale-110 transition-transform duration-300">
                        {action.number}
                      </div>
                      <Card className="flex-1 border-l-4 border-l-[#0E74FF] hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                          <p className="text-muted-foreground">{action.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-10">
                <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl transition-all duration-300" asChild>
                  <Link href="/report/new">
                    File a ScamNemesis Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Evidence Collection and Documentation Standards */}
        <section id="evidence-collection" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
                  <FolderOpen className="h-4 w-4" />
                  Documentation
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Evidence Collection and Documentation Standards</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Proper documentation is critical for law enforcement investigations and potential fund recovery. Preserve everything.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {evidenceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card key={type.title} className="hover:shadow-lg transition-shadow border-2 hover:border-cyan-200 dark:hover:border-cyan-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          {type.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {type.items.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">Documentation Best Practices</h3>
                    <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Create timestamped backups of all evidence</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Organize files by date and category</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Keep both digital and physical copies</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Do not edit original files (make copies for notes)</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Store evidence securely with restricted access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Fund Recovery Procedures by Payment Method */}
        <section id="fund-recovery" className="w-full py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                  <DollarSign className="h-4 w-4" />
                  Recovery Guide
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Fund Recovery Procedures by Payment Method</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Recovery success depends heavily on how you paid and how quickly you act. Time is critical.
                </p>
              </div>

              <div className="space-y-5">
                {paymentMethods.map((payment) => (
                  <Card key={payment.method} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0E74FF]/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#0E74FF]" />
                          </div>
                          {payment.method}
                        </CardTitle>
                        <span className={`text-xs font-bold px-4 py-2 rounded-full ${
                          payment.timeline.includes('immediately') || payment.timeline.includes('24 hours')
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : payment.timeline.includes('60 days')
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                        }`}>
                          {payment.timeline}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ol className="space-y-3">
                        {payment.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0E74FF]/10 text-[#0E74FF] text-sm flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Support Resources and Reporting Channels */}
        <section id="support-resources" className="w-full py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
                  <LifeBuoy className="h-4 w-4" />
                  Get Help
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Support Resources and Reporting Channels</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Report scams to multiple authorities to create an official record and contribute to investigations.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-8">
                {reportingChannels.map((channel) => (
                  <Card key={channel.name} className="hover:shadow-lg transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <LifeBuoy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1">{channel.name}</h3>
                          <p className="text-sm text-[#0E74FF] font-medium mb-2">{channel.url}</p>
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-3 text-indigo-900 dark:text-indigo-100">Additional Support</h3>
                    <ul className="text-indigo-800 dark:text-indigo-200 space-y-2 text-sm">
                      <li><strong>National Suicide Prevention Lifeline:</strong> 988 (if experiencing crisis)</li>
                      <li><strong>Credit Bureaus:</strong> Place fraud alerts with Equifax, Experian, TransUnion</li>
                      <li><strong>Identity Theft Resource Center:</strong> 888-400-5530</li>
                      <li><strong>Elder Abuse Hotline:</strong> 1-800-677-1116</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Premium Design */}
        <section className="w-full py-20 md:py-28 bg-gradient-to-br from-[#0E74FF] via-[#0a5ed4] to-[#0E74FF] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                Stay Vigilant, Stay Protected
              </h2>
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                Use our free Scam Checker before engaging with anyone online. A few seconds of verification can save you thousands of dollars and immense emotional distress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-white text-[#0E74FF] hover:bg-white/90 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
                  <Link href="/search">
                    Use Scam Checker
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
                  <Link href="/training-courses">
                    Free Training
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
