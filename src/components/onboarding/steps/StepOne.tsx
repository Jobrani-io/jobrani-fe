import { UseFormReturn } from "react-hook-form";
import { FormData } from "../OnboardingFunnel";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Network, FileText, Mail } from "lucide-react";

interface StepOneProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
}

export const StepOne = ({ form, onNext }: StepOneProps) => {
  const selectedStrategy = form.watch("campaignStrategy") || [];
  const mentionJobDirectly = form.watch("mentionJobDirectly") || true;
  const showJobMentionToggle =
    selectedStrategy.includes("connect") || selectedStrategy.includes("email");

  const handleNext = async () => {
    const isValid = await form.trigger([
      "campaignStrategy",
      "mentionJobDirectly",
    ]);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="campaignStrategy"
        render={({ field }) => (
          <FormItem className="space-y-6">
            <FormControl>
              <div className="space-y-4">
                {[
                  {
                    value: "connect",
                    title: "Connect with Hiring Managers on LinkedIn",
                    description: "Build Relationships and Network",
                    icon: Network,
                  },
                  {
                    value: "apply",
                    title: "Apply",
                    description: "Submit applications directly to job postings",
                    icon: FileText,
                  },
                  {
                    value: "email",
                    title: "Email",
                    description:
                      "Reach out directly to hiring managers via email",
                    icon: Mail,
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const isChecked =
                    field.value?.includes(option.value) || false;
                  return (
                    <div key={option.value} className="relative">
                      <label
                        className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 bg-background/50 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 data-[checked=true]:border-primary data-[checked=true]:bg-primary/10"
                        data-checked={isChecked}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, option.value]);
                            } else {
                              field.onChange(
                                currentValues.filter(
                                  (value: string) => value !== option.value
                                )
                              );
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <Icon className="w-6 h-6 text-primary/70" />
                        <div className="flex-1">
                          <div className="font-semibold text-base">
                            {option.title}
                          </div>
                          <div className="text-sm text-foreground/70 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Job Title Mention Toggle - Only show when LinkedIn Connect is selected */}
      {showJobMentionToggle && (
        <div className="space-y-4 pt-4 border-t border-border/30">
          <FormField
            control={form.control}
            name="mentionJobDirectly"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">
                        Mention specific job role in message
                      </Label>
                      <p className="text-sm text-foreground/70">
                        {mentionJobDirectly
                          ? "Messages will reference specific job roles when reaching out"
                          : "Messages will be general relationship-building focused"}
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={selectedStrategy.length === 0}
          variant="hero"
          size="default"
          className="px-8"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};
