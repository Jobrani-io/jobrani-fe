import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { StepOne } from "./steps/StepOne";
import { StepTwo } from "./steps/StepTwo";
import { StepFour } from "./steps/StepFour";
import { StepFive } from "./steps/StepFive";
import { StepSix } from "./steps/StepSix";
import { StepSeven } from "./steps/StepSeven";

const formSchema = z.object({
  campaignStrategy: z
    .array(z.string())
    .min(1, "Please select at least one option"),
  mentionJobDirectly: z.boolean().default(false),
  desiredRoles: z.array(z.string()).min(1, "Please select at least one role"),
  locationPreferences: z.object({
    remote: z.boolean(),
    hybrid: z.boolean(),
    onsite: z.boolean(),
    cities: z.array(z.string()),
  }),
  salaryRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string(),
  }),
  industryPreferences: z.array(z.string()),
  resumeFile: z.any().optional(),
  resumeHighlights: z.array(z.string()).optional(),
  resumeId: z.union([z.number(), z.string()]).optional(),
});

export type FormData = z.infer<typeof formSchema>;

interface OnboardingFunnelProps {
  onComplete: (data: FormData) => void;
}

export const OnboardingFunnel = ({ onComplete }: OnboardingFunnelProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignStrategy: [],
      mentionJobDirectly: true,
      desiredRoles: [],
      locationPreferences: {
        remote: false,
        hybrid: false,
        onsite: false,
        cities: [],
      },
      salaryRange: {
        min: 0,
        max: 0,
        currency: "USD",
      },
      industryPreferences: [],
      resumeFile: null,
      resumeHighlights: [],
      resumeId: null,
    },
  });

  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepSixComplete = () => {
    const data = form.getValues();
    onComplete(data);
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <StepOne form={form} onNext={nextStep} />;
      case 2:
        return <StepTwo form={form} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <StepFour form={form} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <StepFive form={form} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <StepSix form={form} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return (
          <StepSeven
            form={form}
            onNext={handleStepSixComplete}
            onPrev={prevStep}
          />
        );
      default:
        return <StepOne form={form} onNext={nextStep} />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "How would you like us to support your job search?";
      case 2:
        return "What roles are you targeting?";
      case 3:
        return "What are your location preferences?";
      case 4:
        return "What is your target salary range?";
      case 5:
        return "Which industries interest you?";
      case 6:
        return "";
      default:
        return "Let's get started";
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Form Card with Integrated Header */}
      <Card className="border-0 bg-background/80 backdrop-blur-lg shadow-elegant">
        {/* Minimal Header with Progress */}
        <div className="p-4 pb-0">
          <div className="space-y-3">
            <div className="flex justify-start">
              <span className="text-xs font-medium text-foreground/60">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="relative">
              <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 pt-8">
          <Form {...form}>
            <div className="animate-fade-in">
              {getStepTitle() && (
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {getStepTitle()}
                  </h2>
                </div>
              )}
              {getCurrentStepComponent()}
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
