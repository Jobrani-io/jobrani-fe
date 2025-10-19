import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../OnboardingFunnel";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, MapPin } from "lucide-react";
import { commonCities } from "@/types/profileData";

interface StepFourProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export const StepFour = ({ form, onNext, onPrev }: StepFourProps) => {
  const [newCity, setNewCity] = useState("");
  const locationPreferences = form.watch("locationPreferences") || {
    remote: false,
    hybrid: false,
    onsite: false,
    cities: [],
  };
  
  const handleNext = async () => {
    const isValid = await form.trigger("locationPreferences");
    if (isValid) {
      onNext();
    }
  };

  const updateLocationPreference = (field: keyof typeof locationPreferences, value: any) => {
    const updated = { ...locationPreferences, [field]: value };
    form.setValue("locationPreferences", updated);
  };

  const addCity = (city: string) => {
    if (city.trim() && !locationPreferences.cities.includes(city.trim())) {
      const updatedCities = [...locationPreferences.cities, city.trim()];
      updateLocationPreference("cities", updatedCities);
    }
    setNewCity("");
  };

  const removeCity = (cityToRemove: string) => {
    const updatedCities = locationPreferences.cities.filter(city => city !== cityToRemove);
    updateLocationPreference("cities", updatedCities);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCity(newCity);
    }
  };

  const hasAnyPreference = locationPreferences.remote || locationPreferences.hybrid || 
                          locationPreferences.onsite || locationPreferences.cities.length > 0;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="locationPreferences"
        render={({ field }) => (
          <FormItem className="space-y-6">
            {/* Work Arrangement Preferences */}
            <div className="space-y-4">
              <p className="font-medium text-base">Work arrangement preferences:</p>
              <div className="space-y-3">
                {[
                  { key: 'remote', label: 'Remote only' },
                  { key: 'hybrid', label: 'Hybrid (mix of remote and office)' },
                  { key: 'onsite', label: 'On-site/In-office only' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-3">
                    <Checkbox
                      id={key}
                      checked={locationPreferences[key as keyof typeof locationPreferences] as boolean}
                      onCheckedChange={(checked) => 
                        updateLocationPreference(key as keyof typeof locationPreferences, checked)
                      }
                    />
                    <label 
                      htmlFor={key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Specific Cities */}
            <div className="space-y-4">
              <p className="font-medium text-base">Specific cities/regions (optional):</p>
              
              {/* City Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., San Francisco, New York..."
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={() => addCity(newCity)}
                  disabled={!newCity.trim() || locationPreferences.cities.includes(newCity.trim())}
                  size="default"
                  className="px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Cities */}
              {locationPreferences.cities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {locationPreferences.cities.map((city) => (
                    <Badge 
                      key={city} 
                      variant="secondary" 
                      className="px-3 py-1 flex items-center gap-2"
                    >
                      <MapPin className="h-3 w-3" />
                      {city}
                      <button
                        type="button"
                        onClick={() => removeCity(city)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Popular Cities */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Popular locations:</p>
                <div className="flex flex-wrap gap-2">
                  {commonCities.slice(0, 10).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => addCity(city)}
                      disabled={locationPreferences.cities.includes(city)}
                      className="px-3 py-1 text-sm rounded-full border border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {city}
                    </button>
                  ))}
                </div>
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
          disabled={!hasAnyPreference}
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