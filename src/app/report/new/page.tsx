'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
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

  const updateField = (field: string, value: any) => {
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
      // Prepare form data with files
      const submitData = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, typeof value === 'boolean' ? String(value) : value);
        }
      });

      // Add files
      files.forEach((file, index) => {
        if (file.file) {
          submitData.append(`files`, file.file);
          if (file.description) {
            submitData.append(`fileDescriptions[${index}]`, file.description);
          }
        }
      });

      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('report-draft');
        toast.success('Hlásenie bolo úspešne odoslané!');
        router.push(`/reports/${data.id || data.publicId}?submitted=true`);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Chyba pri odosielaní hlásenia');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Chyba pri odosielaní hlásenia');
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
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na domovskú stránku
          </Button>
          <h1 className="text-3xl font-bold tracking-tighter mt-4">Nahlásiť podvod</h1>
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
  );
}
