import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
}

export function StepWizard({ steps, currentStep }: StepWizardProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary bg-background',
                    isUpcoming && 'border-muted text-muted-foreground bg-background'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step Text (Hidden on mobile) */}
                <div className="hidden md:flex flex-col items-center mt-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-foreground',
                      !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 text-center max-w-[120px]">
                    {step.description}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info (Mobile only) */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-sm font-medium">
          {steps[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
