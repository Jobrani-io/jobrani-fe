import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../OnboardingFunnel";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Briefcase } from "lucide-react";
import { commonJobRoles } from "@/types/profileData";

interface StepTwoProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export const StepTwo = ({ form, onNext, onPrev }: StepTwoProps) => {
  const [newRole, setNewRole] = useState("");
  const desiredRoles = form.watch("desiredRoles") || [];
  
  const handleNext = async () => {
    const isValid = await form.trigger("desiredRoles");
    if (isValid) {
      onNext();
    }
  };

  const addRole = (role: string) => {
    if (role.trim() && !desiredRoles.includes(role.trim())) {
      const updatedRoles = [...desiredRoles, role.trim()];
      form.setValue("desiredRoles", updatedRoles);
    }
    setNewRole("");
  };

  const removeRole = (roleToRemove: string) => {
    const updatedRoles = desiredRoles.filter(role => role !== roleToRemove);
    form.setValue("desiredRoles", updatedRoles);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRole(newRole);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="desiredRoles"
        render={({ field }) => (
          <FormItem className="space-y-4">
            {/* Role Input */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Software Engineer, Product Manager..."
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={() => addRole(newRole)}
                disabled={!newRole.trim() || desiredRoles.includes(newRole.trim())}
                size="default"
                className="px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Roles */}
            {desiredRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {desiredRoles.map((role) => (
                  <Badge 
                    key={role} 
                    variant="secondary" 
                    className="px-3 py-1 flex items-center gap-2"
                  >
                    <Briefcase className="h-3 w-3" />
                    {role}
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Popular Role Suggestions */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Popular roles:</p>
              <div className="flex flex-wrap gap-2">
                {commonJobRoles.slice(0, 12).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => addRole(role)}
                    disabled={desiredRoles.includes(role)}
                    className="px-3 py-1 text-sm rounded-full border border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {role}
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
        <Button 
          onClick={handleNext}
          disabled={desiredRoles.length === 0}
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