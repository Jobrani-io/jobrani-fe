import { UseFormReturn } from "react-hook-form";
import { FormData } from "../OnboardingFunnel";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

interface StepFiveProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export const StepFive = ({ form, onNext, onPrev }: StepFiveProps) => {
  const salaryRange = form.watch("salaryRange") || { min: 0, max: 0, currency: "USD" };

  const handleNext = async () => {
    const isValid = await form.trigger("salaryRange");
    if (isValid && salaryRange.min > 0 && salaryRange.max > 0 && salaryRange.max >= salaryRange.min) {
      onNext();
    }
  };

  const updateSalaryRange = (field: keyof typeof salaryRange, value: any) => {
    const updated = { ...salaryRange, [field]: value };
    form.setValue("salaryRange", updated);
  };

  const isValid = salaryRange.min > 0 && salaryRange.max > 0 && salaryRange.max >= salaryRange.min;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          This helps us show you relevant opportunities and salary benchmarks.
        </p>
      </div>

      <FormField
        control={form.control}
        name="salaryRange"
        render={({ field }) => (
          <FormItem className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Currency Selection */}
              <div className="space-y-2">
                <FormLabel>Currency</FormLabel>
                <Select 
                  value={salaryRange.currency} 
                  onValueChange={(value) => updateSalaryRange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Salary */}
              <div className="space-y-2">
                <FormLabel>Minimum</FormLabel>
                <Input
                  type="number"
                  placeholder="75000"
                  value={salaryRange.min || ""}
                  onChange={(e) => updateSalaryRange("min", parseInt(e.target.value) || 0)}
                  className="text-base"
                />
              </div>

              {/* Maximum Salary */}
              <div className="space-y-2">
                <FormLabel>Maximum</FormLabel>
                <Input
                  type="number"
                  placeholder="125000"
                  value={salaryRange.max || ""}
                  onChange={(e) => updateSalaryRange("max", parseInt(e.target.value) || 0)}
                  className="text-base"
                />
              </div>
            </div>

            {/* Quick Range Suggestions */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Quick suggestions:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Entry Level", min: 50000, max: 80000 },
                  { label: "Mid Level", min: 80000, max: 120000 },
                  { label: "Senior Level", min: 120000, max: 180000 },
                  { label: "Executive", min: 180000, max: 300000 }
                ].map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => {
                      const currentRange = form.getValues("salaryRange") || { min: 0, max: 0, currency: "USD" };
                      form.setValue("salaryRange", {
                        ...currentRange,
                        min: suggestion.min,
                        max: suggestion.max
                      });
                    }}
                    className="p-3 text-sm rounded-lg border border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left"
                  >
                    <div className="font-medium">{suggestion.label}</div>
                    <div className="text-xs text-muted-foreground">
                      ${suggestion.min.toLocaleString()} - ${suggestion.max.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {salaryRange.max > 0 && salaryRange.min > salaryRange.max && (
              <p className="text-sm text-destructive">
                Maximum salary must be greater than or equal to minimum salary.
              </p>
            )}

            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="default" className="px-6">
          ← Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid}
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