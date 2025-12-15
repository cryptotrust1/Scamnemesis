'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Shield,
  FileText,
  Users,
  Database,
  Search,
  Globe,
  Lock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Network,
  Share2,
  Heart,
  Mail,
  Building2,
  Scale,
  Banknote,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Eye,
  Link2,
  Clock,
  UserCheck,
  FileCheck,
  PieChart,
  LineChart,
  MapPin,
  Fingerprint,
  ShieldCheck,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepWizard } from '@/components/report/step-wizard';
import { FraudTypeStep } from '@/components/report/steps/fraud-type-step';
import { BasicInfoStep } from '@/components/report/steps/basic-info-step';
import { PerpetratorStep } from '@/components/report/steps/perpetrator-step';
import { EvidenceStep } from '@/components/report/steps/evidence-step';
import { ContactStep } from '@/components/report/steps/contact-step';
import { ReviewStep } from '@/components/report/steps/review-step';
import { toast } from 'sonner';
import {
  fraudTypeSchema,
  basicInfoSchema,
  perpetratorSchema,
  contactInfoSchema,
  type CompleteReportForm,
} from '@/lib/validations/report';

interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  description?: string;
  file?: File;
}

const steps = [
  { id: 1, title: 'Typ podvodu', description: 'Výber kategórie' },
  { id: 2, title: 'Základné info', description: 'Popis incidentu' },
  { id: 3, title: 'Páchateľ', description: 'Údaje o páchateľovi' },
  { id: 4, title: 'Dôkazy', description: 'Nahratie súborov' },
  { id: 5, title: 'Kontakt', description: 'Vaše údaje' },
  { id: 6, title: 'Kontrola', description: 'Kontrola a odoslanie' },
];

// JSON-LD Schema Data
const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Report a Scam - ScamNemesis',
  description: 'Report scammers and help protect others. ScamNemesis helps victims report fraud, recover lost money, and prevent future scams.',
  url: 'https://scamnemesis.com/report/new',
  mainEntity: {
    '@type': 'WebApplication',
    name: 'ScamNemesis Report Form',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
  potentialAction: {
    '@type': 'ReportAction',
    name: 'Report a Scam',
    target: 'https://scamnemesis.com/report/new',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Report a Scam on ScamNemesis',
  description: 'Step-by-step guide to reporting scammers and fraud on ScamNemesis platform.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Select Fraud Type',
      text: 'Choose the category that best describes the type of scam you encountered.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Provide Basic Information',
      text: 'Enter details about the incident including date, location, and financial impact.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Identify the Perpetrator',
      text: 'Provide any known information about the scammer such as name, contact details, or payment information.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Upload Evidence',
      text: 'Attach screenshots, documents, or other evidence that supports your report.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Contact Information',
      text: 'Provide your contact details to receive updates about your report.',
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Review and Submit',
      text: 'Review all information and submit your report to help protect others.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where can I report a scam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can report scams on ScamNemesis.com. Our platform helps victims report fraud, recover lost money, and protect others from scammers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my report confidential?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, your personal information is protected. We anonymize sensitive data before sharing reports with partners and investigators.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens after I submit a report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After submission, your report is processed, analyzed, and shared with relevant authorities and partners. You receive a PDF summary and can track your report status.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can ScamNemesis help recover my lost money?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While we cannot guarantee recovery, we connect you with resources, authorities, and recovery services that may help. Early reporting increases recovery chances.',
      },
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/images/logo.png',
  description: 'The most advanced platform for scam detection and prevention. Protecting individuals and businesses from fraud worldwide.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer service',
  },
  sameAs: [
    'https://twitter.com/ScamNemesis',
    'https://www.linkedin.com/company/scamnemesis',
  ],
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
      name: 'Report',
      item: 'https://scamnemesis.com/report',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'New Report',
      item: 'https://scamnemesis.com/report/new',
    },
  ],
};

// Data Processing Features
const dataProcessingFeatures = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time data processing and pattern recognition across millions of reports.',
  },
  {
    icon: PieChart,
    title: 'Visual Reports',
    description: 'Clear visualizations that help identify trends and connections.',
  },
  {
    icon: LineChart,
    title: 'Trend Analysis',
    description: 'Track scam evolution and emerging fraud patterns over time.',
  },
  {
    icon: MapPin,
    title: 'Geographic Mapping',
    description: 'Location-based analysis to identify regional fraud hotspots.',
  },
];

// OSINT Features
const osintFeatures = [
  {
    icon: Search,
    title: 'Deep Web Analysis',
    description: 'Advanced search capabilities across surface and deep web sources.',
  },
  {
    icon: Network,
    title: 'Network Mapping',
    description: 'Identify connections between scammers and criminal networks.',
  },
  {
    icon: Fingerprint,
    title: 'Digital Footprint',
    description: 'Track digital traces and identify hidden identities.',
  },
  {
    icon: Database,
    title: '130+ Data Sources',
    description: 'Access to comprehensive global databases and intelligence feeds.',
  },
];

// Community Features
const communityFeatures = [
  {
    icon: MessageSquare,
    title: 'Interactive Reports',
    description: 'Comment, update, and collaborate on fraud investigations.',
  },
  {
    icon: Users,
    title: 'Community Verification',
    description: 'Crowd-sourced validation improves report accuracy.',
  },
  {
    icon: TrendingUp,
    title: 'Reputation System',
    description: 'Trusted reporters earn badges and enhanced visibility.',
  },
  {
    icon: Eye,
    title: 'Watchlists',
    description: 'Monitor specific entities and receive alerts on new activity.',
  },
];

// Partner Types
const partnerTypes = [
  {
    icon: Building2,
    title: 'Law Enforcement',
    description: 'Police departments, cybercrime units, and international agencies.',
  },
  {
    icon: Scale,
    title: 'Regulatory Bodies',
    description: 'Financial regulators, consumer protection agencies, and government bodies.',
  },
  {
    icon: Banknote,
    title: 'Financial Institutions',
    description: 'Banks, payment processors, and cryptocurrency exchanges.',
  },
  {
    icon: Shield,
    title: 'Security Companies',
    description: 'Cybersecurity firms, fraud prevention services, and investigators.',
  },
];

// Recovery Steps
const recoverySteps = [
  {
    step: 1,
    title: 'Report Immediately',
    description: 'Time is critical. Submit your report as soon as possible to increase recovery chances.',
    icon: Clock,
  },
  {
    step: 2,
    title: 'Document Everything',
    description: 'Save all communications, transactions, and evidence related to the scam.',
    icon: FileCheck,
  },
  {
    step: 3,
    title: 'Contact Your Bank',
    description: 'Notify your financial institution immediately to freeze accounts and reverse transactions.',
    icon: Banknote,
  },
  {
    step: 4,
    title: 'File Official Reports',
    description: 'Report to local police, IC3, FTC, and relevant authorities in your jurisdiction.',
    icon: FileText,
  },
  {
    step: 5,
    title: 'Monitor Your Accounts',
    description: 'Watch for unauthorized activity and consider credit monitoring services.',
    icon: Eye,
  },
  {
    step: 6,
    title: 'Seek Professional Help',
    description: 'Consider consulting fraud recovery specialists and legal professionals.',
    icon: UserCheck,
  },
];

export default function NewReportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CompleteReportForm>>({
    currency: 'EUR',
    perpetratorType: 'INDIVIDUAL',
    wantUpdates: false,
    agreeToTerms: false,
    agreeToGDPR: false,
  });
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('report-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData((prev) => ({ ...prev, ...parsed }));
        toast.info('Načítaný uložený koncept');
      } catch {
        // Ignore invalid draft
      }
    }
  }, []);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (): boolean => {
    let schema;
    let data;

    switch (currentStep) {
      case 1:
        schema = fraudTypeSchema;
        data = { fraudType: formData.fraudType };
        break;
      case 2:
        schema = basicInfoSchema;
        data = {
          title: formData.title,
          description: formData.description,
          incidentDate: formData.incidentDate,
          country: formData.country,
          city: formData.city,
          postalCode: formData.postalCode,
          amount: formData.amount,
          currency: formData.currency,
        };
        break;
      case 3:
        // Perpetrator step - optional fields, just validate format if provided
        schema = perpetratorSchema;
        data = {
          perpetratorType: formData.perpetratorType,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          socialMedia: formData.socialMedia,
          iban: formData.iban,
          bankAccount: formData.bankAccount,
          cryptoWallet: formData.cryptoWallet,
          companyName: formData.companyName,
          companyId: formData.companyId,
          address: formData.address,
        };
        break;
      case 4:
        // Evidence step - no required validation
        return true;
      case 5:
        schema = contactInfoSchema;
        data = {
          reporterName: formData.reporterName,
          reporterEmail: formData.reporterEmail,
          reporterPhone: formData.reporterPhone,
          wantUpdates: formData.wantUpdates,
          agreeToTerms: formData.agreeToTerms,
          agreeToGDPR: formData.agreeToGDPR,
        };
        break;
      case 6:
        // Review step - validate consents
        if (!formData.agreeToTerms || !formData.agreeToGDPR) {
          toast.error('Musíte súhlasiť s podmienkami a GDPR');
          return false;
        }
        return true;
      default:
        return true;
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error('Prosím opravte chyby vo formulári');
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('report-draft', JSON.stringify(formData));
    toast.success('Koncept bol uložený');
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      // Step 1: Upload evidence files to S3
      let uploadedEvidence: Array<{ type: string; file_key: string; description?: string }> = [];

      if (files.length > 0) {
        const filesToUpload = files.filter((f) => f.file);

        if (filesToUpload.length > 0) {
          toast.info('Nahrávanie súborov...');

          const uploadFormData = new FormData();
          filesToUpload.forEach((f) => {
            if (f.file) {
              uploadFormData.append('files', f.file);
            }
          });

          const uploadResponse = await fetch('/api/v1/evidence/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            throw new Error(uploadError.message || 'Chyba pri nahrávaní súborov');
          }

          const uploadResult = await uploadResponse.json();

          // Map uploaded files to evidence format
          uploadedEvidence = uploadResult.uploaded.map(
            (uploaded: { fileKey: string; mimeType: string }, index: number) => {
              const originalFile = filesToUpload[index];
              return {
                type: uploaded.mimeType.startsWith('image/')
                  ? 'SCREENSHOT'
                  : uploaded.mimeType.startsWith('video/')
                  ? 'VIDEO'
                  : uploaded.mimeType.includes('pdf')
                  ? 'DOCUMENT'
                  : 'OTHER',
                file_key: uploaded.fileKey,
                description: originalFile?.description,
              };
            }
          );
        }
      }

      // Step 2: Prepare report data as JSON
      const reportData = {
        incident: {
          fraud_type: formData.fraudType?.toUpperCase() || 'OTHER',
          date: formData.incidentDate,
          summary: formData.title || 'Report',
          description: formData.description,
          financial_loss: formData.amount
            ? {
                amount: parseFloat(String(formData.amount)),
                currency: formData.currency || 'EUR',
              }
            : undefined,
          location: {
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          },
        },
        perpetrator: {
          full_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
            ? { street: formData.address }
            : undefined,
        },
        digital_footprints: {
          website_url: formData.website,
          telegram: formData.socialMedia?.includes('telegram') ? formData.socialMedia : undefined,
          whatsapp: formData.socialMedia?.includes('whatsapp') ? formData.socialMedia : undefined,
          instagram: formData.socialMedia?.includes('instagram') ? formData.socialMedia : undefined,
          facebook: formData.socialMedia?.includes('facebook') ? formData.socialMedia : undefined,
        },
        financial: formData.iban
          ? {
              iban: formData.iban,
              account_number: formData.bankAccount,
            }
          : undefined,
        crypto: formData.cryptoWallet
          ? {
              wallet_address: formData.cryptoWallet,
            }
          : undefined,
        company:
          formData.perpetratorType === 'COMPANY' && formData.companyName
            ? {
                name: formData.companyName,
                vat_tax_id: formData.companyId,
              }
            : undefined,
        evidence: uploadedEvidence.length > 0 ? uploadedEvidence : undefined,
        reporter: {
          name: formData.reporterName,
          email: formData.reporterEmail || 'anonymous@scamnemesis.com',
          phone: formData.reporterPhone,
          preferred_language: 'sk',
          consent: formData.agreeToGDPR || false,
        },
      };

      // Step 3: Submit report
      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('report-draft');
        toast.success('Hlásenie bolo úspešne odoslané!');
        router.push(`/report/success?id=${data.id || data.publicId}`);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Chyba pri odosielaní hlásenia');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Chyba pri odosielaní hlásenia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FraudTypeStep
            selectedType={formData.fraudType}
            onSelect={(type) => updateField('fraudType', type)}
          />
        );

      case 2:
        return (
          <BasicInfoStep
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        );

      case 3:
        return (
          <PerpetratorStep
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        );

      case 4:
        return (
          <EvidenceStep
            files={files}
            onFilesChange={setFiles}
          />
        );

      case 5:
        return (
          <ContactStep
            data={formData}
            errors={errors}
            onChange={updateField}
          />
        );

      case 6:
        return (
          <ReviewStep
            data={{ ...formData, files }}
            onEdit={handleGoToStep}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
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
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container relative py-12 md:py-16 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Trusted Platform
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Secure & Confidential
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  612M+ Records
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                Where to Report{' '}
                <span className="text-primary">Scammers?</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
                ScamNemesis helps victims report scammers, recover lost money, and protect others from fraud.
                Our platform connects you with authorities, investigators, and a global community dedicated to
                fighting scams.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Start Your Report
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => router.push('/search')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Database
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">612M+</div>
                  <div className="text-sm text-muted-foreground">Records</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">130+</div>
                  <div className="text-sm text-muted-foreground">Data Sources</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Partners</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border">
                  <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens After Submission */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  What Happens After You Submit?
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  By completing the form, you provide detailed information that we report to the relevant
                  authorities and compile into a clearly structured PDF report. Your report helps build
                  a comprehensive database that protects others from the same scammers.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">PDF Report Generated</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Receive a professional, structured PDF summary of your report that you can share
                    with authorities and legal professionals.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <Share2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Shared with Authorities</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your report is automatically forwarded to relevant law enforcement agencies,
                    regulators, and fraud prevention organizations.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Database className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Added to Database</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Scammer details are added to our global database, helping protect millions of
                    people from future fraud attempts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions Section */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 p-6 md:p-8 rounded-2xl bg-card border border-primary/20">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">
                    Instructions for Completing the Form
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">Most fields are not mandatory.</span>{' '}
                          Fill in as much information as you have available. The more details you provide,
                          the more effective your report will be in helping authorities investigate.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">Fields that do not apply to your case</span>{' '}
                          can be left blank. Not every scam involves all types of contact information or
                          financial details.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">After submitting,</span>{' '}
                          you will receive a confirmation with your report ID. Use this to track your
                          report status and provide additional information if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Report Form Section */}
        <section id="report-form" className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              {/* Form Header */}
              <div className="mb-8">
                <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Späť na domovskú stránku
                </Button>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nahlásiť podvod</h2>
                <p className="text-muted-foreground mt-2">
                  Vyplňte formulár a pomôžte ochraňovať ostatných pred podvodníkmi
                </p>
              </div>

              {/* Step Wizard */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <StepWizard steps={steps} currentStep={currentStep} />
                </CardContent>
              </Card>

              {/* Step Content */}
              <Card className="mb-8">
                <CardContent className="pt-8 pb-8">
                  {renderStep()}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Späť
                </Button>

                <Button variant="ghost" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Uložiť koncept
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext}>
                    Ďalej
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Odosielam...
                      </>
                    ) : (
                      <>
                        Odoslať hlásenie
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing and Visualization */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <BarChart3 className="h-4 w-4" />
                  Advanced Technology
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Data Processing and Visualization
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Our advanced analytics platform processes millions of data points to identify patterns,
                  connections, and emerging threats in real-time.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dataProcessingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Advanced OSINT Section */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                    <Search className="h-4 w-4" />
                    Intelligence Capabilities
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                    Advanced OSINT and Intelligence Practice
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    ScamNemesis employs sophisticated Open Source Intelligence (OSINT) techniques to
                    track, identify, and expose scammers across the digital landscape. Our intelligence
                    team uses advanced tools and methodologies to uncover hidden connections.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Cross-reference data from 130+ global sources',
                      'Identify fake identities and shell companies',
                      'Track cryptocurrency transactions and wallets',
                      'Monitor dark web marketplaces and forums',
                      'Analyze social media footprints and patterns',
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {osintFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                        <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Engagement Section */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                  <Users className="h-4 w-4" />
                  Community Power
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Community Engagement and Interactive Report
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Join a global community of fraud fighters. Your reports contribute to a collective
                  defense system that protects millions of people worldwide.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {communityFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-card border hover:border-green-500/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Sharing with Partners */}
        <section className="py-12 md:py-16 bg-muted/30 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                  <Link2 className="h-4 w-4" />
                  Global Network
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Data Sharing with Partners and Investigators
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Your report reaches a network of trusted partners dedicated to fighting fraud.
                  We work with law enforcement, financial institutions, and security experts worldwide.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {partnerTypes.map((partner, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-card border hover:border-purple-500/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                      <partner.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{partner.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 md:p-8 rounded-2xl bg-card border border-purple-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1">Your Privacy is Protected</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We anonymize personal information before sharing reports with partners. Only
                      relevant fraud details are shared to protect your privacy while maximizing
                      the effectiveness of investigations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scam Recovery Section */}
        <section className="py-12 md:py-16 border-b">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
                  <Heart className="h-4 w-4" />
                  Victim Support
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Scam Recovery
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Being scammed is stressful, but there are steps you can take to minimize damage
                  and potentially recover your losses. Follow these guidelines for the best chance
                  of recovery.
                </p>
              </div>

              {/* Recovery Steps Timeline */}
              <div className="relative">
                {/* Timeline Line - Hidden on mobile */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/50 via-orange-500/30 to-orange-500/10 transform -translate-x-1/2" />

                <div className="space-y-6 md:space-y-0">
                  {recoverySteps.map((item, index) => (
                    <div
                      key={index}
                      className={`relative flex flex-col md:flex-row items-start gap-4 md:gap-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Content Card */}
                      <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="p-5 md:p-6 rounded-xl bg-card border hover:border-orange-500/50 hover:shadow-lg transition-all duration-300">
                          <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                              <item.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold">{item.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Step Number - Center */}
                      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                          {item.step}
                        </div>
                      </div>

                      {/* Mobile Step Number */}
                      <div className="md:hidden flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          Step {item.step}
                        </span>
                      </div>

                      {/* Spacer for alternating layout */}
                      <div className="hidden md:block flex-1" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">Beware of Recovery Scams</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Unfortunately, scammers often target fraud victims again with fake &quot;recovery services&quot;
                      that promise to retrieve lost funds for an upfront fee. Legitimate recovery services
                      and law enforcement agencies will never ask for payment upfront. Be extremely cautious
                      of unsolicited offers to help recover your money.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Mail className="h-4 w-4" />
                Get in Touch
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Contact ScamNemesis
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Have questions, need assistance, or want to report additional information?
                Our team is here to help you.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <a
                  href="mailto:info@scamnemesis.com"
                  className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Email Us</div>
                    <div className="text-sm text-muted-foreground">info@scamnemesis.com</div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                </a>

                <Link
                  href="/help"
                  className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Help Center</div>
                    <div className="text-sm text-muted-foreground">FAQs & Guides</div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Secure Communication
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Response within 24 hours
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 text-purple-500" />
                  Worldwide Support
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 border-t">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Ready to Report a Scam?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your report makes a difference. Help protect others by sharing your experience
                and contributing to our global fraud database.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Start Your Report Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                  onClick={() => router.push('/search')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Our Database
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
