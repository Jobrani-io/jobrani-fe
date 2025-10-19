import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, DollarSign, Plus, X } from 'lucide-react';
import { ProfileData, commonIndustries } from '@/types/profileData';

interface IndustryFocusProps {
  profileData: ProfileData;
  onProfileUpdate: (data: Partial<ProfileData>) => void;
}

const IndustryFocus: React.FC<IndustryFocusProps> = ({
  profileData,
  onProfileUpdate,
}) => {
  const [newIndustry, setNewIndustry] = useState('');

  const handleIndustryAdd = (industry: string) => {
    if (industry && !profileData.industryPreferences.includes(industry)) {
      onProfileUpdate({
        industryPreferences: [...profileData.industryPreferences, industry],
      });
      setNewIndustry('');
    }
  };

  const handleIndustryRemove = (industry: string) => {
    onProfileUpdate({
      industryPreferences: profileData.industryPreferences.filter(i => i !== industry),
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building className="h-4 w-4" />
          Industry & Salary
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Industries you're interested in and salary expectations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Industry Preferences */}
        <div className="space-y-2">
          <Label className="text-sm">Industries (Optional):</Label>
          
          {/* Selected Industries */}
          {profileData.industryPreferences.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {profileData.industryPreferences.map((industry) => (
                <Badge key={industry} variant="secondary" className="flex items-center gap-1 text-xs">
                  {industry}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleIndustryRemove(industry)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Add Industry */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter industry..."
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleIndustryAdd(newIndustry);
                }
              }}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIndustryAdd(newIndustry)}
              disabled={!newIndustry.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Common Industries Quick Add */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Popular industries:</Label>
            <div className="flex flex-wrap gap-1">
              {commonIndustries.slice(0, 4).map((industry) => (
                <Button
                  key={industry}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleIndustryAdd(industry)}
                  disabled={profileData.industryPreferences.includes(industry)}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-sm flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Target Salary (Optional):
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="min-salary" className="text-xs text-muted-foreground">Min</Label>
              <Input
                id="min-salary"
                type="number"
                placeholder="60k"
                value={profileData.salaryRange?.min || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value) || undefined;
                  onProfileUpdate({
                    salaryRange: {
                      ...profileData.salaryRange,
                      min,
                      currency: profileData.salaryRange?.currency || 'USD',
                    },
                  });
                }}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="max-salary" className="text-xs text-muted-foreground">Max</Label>
              <Input
                id="max-salary"
                type="number"
                placeholder="120k"
                value={profileData.salaryRange?.max || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || undefined;
                  onProfileUpdate({
                    salaryRange: {
                      ...profileData.salaryRange,
                      max,
                      currency: profileData.salaryRange?.currency || 'USD',
                    },
                  });
                }}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-xs text-muted-foreground">Currency</Label>
              <Select
                value={profileData.salaryRange?.currency || 'USD'}
                onValueChange={(currency) => {
                  onProfileUpdate({
                    salaryRange: {
                      ...profileData.salaryRange,
                      currency,
                    },
                  });
                }}
              >
                <SelectTrigger id="currency" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndustryFocus;