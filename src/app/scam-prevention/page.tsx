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
  { title: 'Authority Impersonation', description: 'Pretending to be officials, banks, or experts to exploit trust in legitimate institutions.' },
  { title: 'Artificial Time Pressure', description: 'Creating false urgency to prevent careful thought and rational decision-making.' },
  { title: 'False Social Proof', description: 'Fabricating testimonials, reviews, and success stories to create illusion of legitimacy.' },
  { title: 'Emotional Manipulation', description: 'Exploiting fear, greed, loneliness, or compassion to override logical thinking.' },
  { title: 'Trust-Building Deception', description: 'Investing weeks or months building relationships before making fraudulent requests.' },
  { title: 'Information Asymmetry', description: 'Using technical jargon and complexity to confuse victims and discourage questions.' },
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

      <div className="flex flex-col">
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-5 text-[#0E74FF]" />
            <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-4">
              Comprehensive Anti-Scam Guide
            </h1>
            <p className="text-base text-[#64748b] md:text-lg mb-6 leading-relaxed">
              Your practical security guide to identifying threats, preventing financial losses, and responding effectively to fraud. Knowledge and preparation are your strongest defenses.
            </p>
            <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/search">
                Check Someone Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="w-full py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Table of Contents</h2>
            <Card>
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0E74FF] text-white text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium group-hover:text-[#0E74FF] transition-colors">
                        {item.title}
                      </span>
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 1. Emergency Response Section */}
      <section id="emergency-response" className="w-full py-16 bg-red-50 dark:bg-red-950/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h2 className="text-3xl font-bold">Emergency Response: File a ScamNemesis Report</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              If you suspect you are currently being scammed or have been victimized, take immediate action.
            </p>
            <Card className="border-red-200 bg-white dark:bg-card">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Stop All Communication Immediately</h3>
                      <p className="text-sm text-muted-foreground">
                        Cease contact with the suspected scammer. Do not respond to calls, emails, or messages.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Halt All Financial Transactions</h3>
                      <p className="text-sm text-muted-foreground">
                        Stop any pending transfers, payments, or shipments immediately. Contact your bank or payment provider.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">File a ScamNemesis Report</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Document the incident in our system to warn others and create an official record.
                      </p>
                      <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                        <Link href="/report/new">
                          File Report Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 2. 60-Second Risk Assessment */}
      <section id="risk-assessment" className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">60-Second Risk Assessment</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              If you encounter any of these 8 warning signs, proceed with extreme caution or walk away completely. Trust your instincts.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {warningSignsRisk.map((sign, index) => {
                const Icon = sign.icon;
                return (
                  <Card key={sign.title} className="border-orange-100">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="p-2 rounded-full bg-orange-50">
                        <Icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium">{sign.title}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Understanding Scams: Definition and Mechanics */}
      <section id="understanding-scams" className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Understanding Scams: Definition and Mechanics</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Understanding how scams work is the first step in protecting yourself and others.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#0E74FF]" />
                    What is a Scam?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    A scam is a fraudulent scheme designed to deceive individuals into parting with money, personal information, or assets through false promises, misrepresentation, or manipulation.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scams exploit human psychology, trust, and emotional vulnerabilities to bypass rational decision-making.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#0E74FF]" />
                    How Scams Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E74FF] mt-2" />
                      <p className="text-sm text-muted-foreground"><strong>Contact:</strong> Initial outreach via phone, email, social media, or in person</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E74FF] mt-2" />
                      <p className="text-sm text-muted-foreground"><strong>Hook:</strong> Offer something desirable or create fear/urgency</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E74FF] mt-2" />
                      <p className="text-sm text-muted-foreground"><strong>Build Trust:</strong> Establish credibility through fake credentials or emotional connection</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E74FF] mt-2" />
                      <p className="text-sm text-muted-foreground"><strong>The Ask:</strong> Request money, information, or access</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E74FF] mt-2" />
                      <p className="text-sm text-muted-foreground"><strong>Disappear:</strong> Cut contact after obtaining what they want</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Psychology of Scam Victimization */}
      <section id="psychology" className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Psychology of Scam Victimization</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Scammers use 6 primary psychological manipulation methods to exploit human behavior and bypass critical thinking.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychologyTactics.map((tactic, index) => (
                <Card key={tactic.title}>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3 text-lg">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0E74FF] text-white text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      {tactic.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tactic.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. 12 Most Prevalent Scam Categories */}
      <section id="scam-categories" className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">12 Most Prevalent Scam Categories</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Familiarize yourself with these common fraud schemes to recognize and avoid them.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scamTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card key={type.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="h-5 w-5 text-[#0E74FF]" />
                        {type.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-[#0E74FF] mb-1">Protection Tip:</p>
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
      <section id="immediate-action" className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Immediate Action Protocol: First 24 Hours</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              If you&apos;ve been scammed, take these 5 critical steps within 24 hours to maximize recovery chances and prevent further damage.
            </p>
            <div className="space-y-4">
              {immediateActions.map((action) => (
                <Card key={action.number} className="border-l-4 border-l-[#0E74FF]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0E74FF] text-white flex items-center justify-center font-bold text-lg">
                        {action.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
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
      <section id="evidence-collection" className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Evidence Collection and Documentation Standards</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Proper documentation is critical for law enforcement investigations and potential fund recovery. Preserve everything.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {evidenceTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card key={type.title}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#0E74FF]" />
                        {type.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {type.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card className="mt-6 border-[#0E74FF]/20 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Documentation Best Practices</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Create timestamped backups of all evidence</li>
                      <li>• Organize files by date and category</li>
                      <li>• Keep both digital and physical copies</li>
                      <li>• Do not edit original files (make copies for notes)</li>
                      <li>• Store evidence securely with restricted access</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. Fund Recovery Procedures by Payment Method */}
      <section id="fund-recovery" className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Fund Recovery Procedures by Payment Method</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Recovery success depends heavily on how you paid and how quickly you act. Time is critical.
            </p>
            <div className="space-y-4">
              {paymentMethods.map((payment) => (
                <Card key={payment.method}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#0E74FF]" />
                        {payment.method}
                      </CardTitle>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        payment.timeline.includes('immediately') || payment.timeline.includes('24 hours')
                          ? 'bg-red-100 text-red-700'
                          : payment.timeline.includes('60 days')
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {payment.timeline}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {payment.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0E74FF]/10 text-[#0E74FF] text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
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
      <section id="support-resources" className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Support Resources and Reporting Channels</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Report scams to multiple authorities to create an official record and contribute to investigations.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {reportingChannels.map((channel) => (
                <Card key={channel.name}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <LifeBuoy className="h-5 w-5 text-[#0E74FF] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{channel.name}</h3>
                        <p className="text-sm text-[#0E74FF] mb-2">{channel.url}</p>
                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mt-8 border-[#0E74FF]/20 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-[#0E74FF] flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Additional Support</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>National Suicide Prevention Lifeline:</strong> 988 (if experiencing crisis)</li>
                      <li>• <strong>Credit Bureaus:</strong> Place fraud alerts with Equifax, Experian, TransUnion</li>
                      <li>• <strong>Identity Theft Resource Center:</strong> 888-400-5530</li>
                      <li>• <strong>Elder Abuse Hotline:</strong> 1-800-677-1116</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-5 text-center max-w-2xl mx-auto">
            <Shield className="h-10 w-10 text-[#0E74FF]" />
            <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl">
              Stay Vigilant, Stay Protected
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              Use our free Scam Checker before engaging with anyone online. A few seconds of verification can save you thousands of dollars and immense emotional distress.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                <Link href="/search">
                  Use Scam Checker
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e8e8e8] hover:bg-white" asChild>
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
