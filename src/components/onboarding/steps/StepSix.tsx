import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../OnboardingFunnel";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Building } from "lucide-react";
import { commonIndustries } from "@/types/profileData";

interface StepSixProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export const StepSix = ({ form, onNext, onPrev }: StepSixProps) => {
  const [newIndustry, setNewIndustry] = useState("");
  const industryPreferences = form.watch("industryPreferences") || [];
  
  const handleNext = async () => {
    // Industry preferences are optional, so we can always proceed
    onNext();
  };

  const addIndustry = (industry: string) => {
    if (industry.trim() && !industryPreferences.includes(industry.trim())) {
      const updatedIndustries = [...industryPreferences, industry.trim()];
      form.setValue("industryPreferences", updatedIndustries);
    }
    setNewIndustry("");
  };

  const removeIndustry = (industryToRemove: string) => {
    const updatedIndustries = industryPreferences.filter(industry => industry !== industryToRemove);
    form.setValue("industryPreferences", updatedIndustries);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIndustry(newIndustry);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          This is optional, but helps us find more relevant opportunities. You can skip this step.
        </p>
      </div>

      <FormField
        control={form.control}
        name="industryPreferences"
        render={({ field }) => (
          <FormItem className="space-y-4">
            {/* Industry Input */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Technology, Healthcare, Finance..."
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={() => addIndustry(newIndustry)}
                disabled={!newIndustry.trim() || industryPreferences.includes(newIndustry.trim())}
                size="default"
                className="px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Industries */}
            {industryPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {industryPreferences.map((industry) => (
                  <Badge 
                    key={industry} 
                    variant="secondary" 
                    className="px-3 py-1 flex items-center gap-2"
                  >
                    <Building className="h-3 w-3" />
                    {industry}
                    <button
                      type="button"
                      onClick={() => removeIndustry(industry)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Popular Industry Suggestions */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Popular industries:</p>
              <div className="flex flex-wrap gap-2">
                {commonIndustries.slice(0, 12).map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => addIndustry(industry)}
                    disabled={industryPreferences.includes(industry)}
                    className="px-3 py-1 text-sm rounded-full border border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="default" className="px-6">
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleNext} size="default" className="px-6">
            Skip
          </Button>
          <Button 
            onClick={handleNext}
            variant="hero"
            size="default"
            className="px-8"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};