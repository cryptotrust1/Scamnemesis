'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepWizard } from '@/components/report/step-wizard';
import { FraudTypeStep } from '@/components/report/steps/fraud-type-step';
import { BasicInfoStep } from '@/components/report/steps/basic-info-step';
import { toast } from 'sonner';
import {
  fraudTypeSchema,
  basicInfoSchema,
  type FraudTypeForm,
  type BasicInfoForm,
  type CompleteReportForm,
} from '@/lib/validations/report';

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('report-draft');
        toast.success('Report bol úspešne odoslaný!');
        router.push(`/reports/${data.id}`);
      } else {
        toast.error('Chyba pri odosielaní reportu');
      }
    } catch (error) {
      toast.error('Chyba pri odosielaní reportu');
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
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Údaje o páchateľovi</h2>
              <p className="text-muted-foreground">
                Zadajte známe informácie o páchateľovi (všetky polia sú voliteľné)
              </p>
            </div>
            <div className="p-8 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">
                Tento krok bude implementovaný v ďalšej verzii
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Nahratie dôkazov</h2>
              <p className="text-muted-foreground">
                Nahrajte obrázky, dokumenty alebo iné súbory ako dôkaz
              </p>
            </div>
            <div className="p-8 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">
                Tento krok bude implementovaný v ďalšej verzii
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Vaše kontaktné údaje</h2>
              <p className="text-muted-foreground">
                Voliteľné - pre zasielanie upozornení o stave hlásenia
              </p>
            </div>
            <div className="p-8 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">
                Tento krok bude implementovaný v ďalšej verzii
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Kontrola a odoslanie</h2>
              <p className="text-muted-foreground">
                Skontrolujte všetky údaje pred odoslaním
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Typ podvodu</h3>
                  <p className="text-sm text-muted-foreground">{formData.fraudType || 'Nevybrané'}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Nadpis</h3>
                  <p className="text-sm text-muted-foreground">{formData.title || '-'}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Popis</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {formData.description || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dátum</h3>
                    <p className="text-sm text-muted-foreground">{formData.incidentDate || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Lokalita</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.city}, {formData.country}
                    </p>
                  </div>
                </div>

                {formData.amount && (
                  <div>
                    <h3 className="font-semibold mb-2">Výška škody</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.amount} {formData.currency}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Odoslaním tohto hlásenia súhlasíte s{' '}
                <a href="/terms" className="text-primary hover:underline">
                  podmienkami používania
                </a>{' '}
                a{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  ochranou osobných údajov
                </a>
                .
              </p>
            </div>
          </div>
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
            <Button onClick={handleSubmit}>
              Odoslať hlásenie
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
